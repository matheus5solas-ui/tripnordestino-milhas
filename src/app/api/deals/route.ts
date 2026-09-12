import { NextRequest, NextResponse } from "next/server";
import type { FlightOffer } from "@/types/travel";

export const revalidate = 3600;

type ExploreDestination = {
  destination_id?: string;
  name?: string;
  country?: string;
  destination_airport?: {
    code?: string;
    location?: string;
    location_id?: string;
  };
  start_date?: string;
  end_date?: string;
  flight_price?: number;
  flight_duration?: number;
  number_of_stops?: number;
  airline?: string;
  airline_code?: string;
  link?: string;
  serpapi_link?: string;
};

type SerpApiExploreResponse = {
  search_metadata?: { created_at?: string; status?: string };
  destinations?: ExploreDestination[];
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

function isBrazil(country?: string) {
  if (!country) return false;
  const normalized = country.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return normalized === "brazil" || normalized === "brasil";
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

    const foundAt = data.search_metadata?.created_at;
    const offers: FlightOffer[] = (data.destinations ?? []).flatMap<FlightOffer>((result, index) => {
      const destination = result.name;
      const airport = result.destination_airport?.code;
      const price = Number(result.flight_price);

      if (!destination || !airport || !Number.isFinite(price) || price <= 0 || (maxPrice > 0 && price > maxPrice)) {
        return [];
      }

      const offer: FlightOffer = {
        id: `serpapi-${origin}-${airport}-${result.start_date ?? index}`,
        destination,
        airport,
        route: `${origin} → ${airport}`,
        dates: `${formatDate(result.start_date)} → ${formatDate(result.end_date)}`,
        cashPrice: price,
        tag: "Oferta",
        region: isBrazil(result.country) ? "Brasil" : "Internacional",
        theme: slug(destination),
        originAirport: origin,
        airlineCode: result.airline_code,
        airlineName: result.airline,
        transfers: result.number_of_stops,
        departureAt: result.start_date,
        returnAt: result.end_date,
        foundAt,
        bookingUrl: result.link,
      };

      return [offer];
    }).sort((a, b) => a.cashPrice - b.cashPrice);

    return NextResponse.json(
      {
        offers,
        configured: true,
        source: "SerpApi / Google Travel Explore",
        updatedAt: foundAt ?? new Date().toISOString(),
        matchType: "exact",
      },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" } },
    );
  } catch (error) {
    console.error("SerpApi explore request failed", error);
    return NextResponse.json({ offers: [], source: "serpapi", error: "Radar temporariamente indisponível." }, { status: 502 });
  }
}
