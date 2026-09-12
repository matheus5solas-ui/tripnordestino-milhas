import { NextRequest, NextResponse } from "next/server";
import type { FlightOffer } from "@/types/travel";

// SerpApi keeps identical searches cached for 1h and cached searches do not
// count against the monthly quota. We also cache our response for 1h so many
// site visits can reuse a single provider search.
export const revalidate = 3600;

type ExploreFlight = {
  departure_airport?: { name?: string; id?: string };
  arrival_airport?: { name?: string; id?: string };
  duration?: number;
  price?: number;
  cheapest_flight?: boolean;
  number_of_stops?: number;
  airline?: string;
  airline_code?: string;
};

type ExploreResult = {
  destination?: { name?: string; description?: string; link?: string };
  start_date?: string;
  end_date?: string;
  flight_price?: number;
  flights?: ExploreFlight[];
  google_flights_link?: string;
};

type SerpApiExploreResponse = {
  search_metadata?: { created_at?: string; status?: string };
  results?: ExploreResult[];
  destinations?: ExploreResult[];
  error?: string;
};

function formatDate(value?: string) {
  if (!value) return "Data flexível";
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function slug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ offers: [], configured: false, source: "serpapi" }, { status: 503 });
  }

  const origin = (request.nextUrl.searchParams.get("origin") || "FOR").toUpperCase();
  const maxPrice = Number(request.nextUrl.searchParams.get("max_price") || 0);
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_travel_explore");
  url.searchParams.set("departure_id", origin);
  url.searchParams.set("currency", "BRL");
  url.searchParams.set("hl", "pt-BR");
  url.searchParams.set("gl", "br");
  url.searchParams.set("api_key", apiKey);

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) {
      const body = await response.text();
      console.error("SerpApi explore error", response.status, body.slice(0, 500));
      return NextResponse.json({ offers: [], source: "serpapi", error: "Falha ao consultar radar de preços." }, { status: 502 });
    }

    const data = await response.json() as SerpApiExploreResponse;
    if (data.error) {
      console.error("SerpApi explore response error", data.error);
      return NextResponse.json({ offers: [], source: "serpapi", error: data.error }, { status: 502 });
    }

    const rows = data.results ?? data.destinations ?? [];
    const foundAt = data.search_metadata?.created_at;
    const offers: FlightOffer[] = rows.flatMap<FlightOffer>((result, index) => {
      const cheapest = [...(result.flights ?? [])].sort((a, b) => Number(a.price ?? Infinity) - Number(b.price ?? Infinity))[0];
      const destination = result.destination?.name ?? cheapest?.arrival_airport?.name;
      const airport = cheapest?.arrival_airport?.id;
      const price = Number(cheapest?.price ?? result.flight_price);
      if (!destination || !airport || !Number.isFinite(price) || price <= 0 || (maxPrice > 0 && price > maxPrice)) return [];

      const offer: FlightOffer = {
        id: `serpapi-${origin}-${airport}-${result.start_date ?? index}`,
        destination,
        airport,
        route: `${origin} → ${airport}`,
        dates: `${formatDate(result.start_date)} → ${formatDate(result.end_date)}`,
        cashPrice: price,
        tag: cheapest?.cheapest_flight ? "Ótimo preço" : "Oferta",
        region: "Brasil",
        theme: slug(destination),
        originAirport: cheapest?.departure_airport?.id ?? origin,
        airlineCode: cheapest?.airline_code,
        airlineName: cheapest?.airline,
        transfers: cheapest?.number_of_stops,
        departureAt: result.start_date,
        returnAt: result.end_date,
        foundAt,
        bookingUrl: result.google_flights_link ?? result.destination?.link,
      };

      return [offer];
    }).sort((a, b) => a.cashPrice - b.cashPrice);

    return NextResponse.json(
      { offers, configured: true, source: "SerpApi / Google Travel Explore", updatedAt: foundAt ?? new Date().toISOString(), matchType: "exact" },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" } },
    );
  } catch (error) {
    console.error("SerpApi explore request failed", error);
    return NextResponse.json({ offers: [], source: "serpapi", error: "Radar temporariamente indisponível." }, { status: 502 });
  }
}
