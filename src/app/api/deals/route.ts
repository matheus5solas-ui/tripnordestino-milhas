import { NextRequest, NextResponse } from "next/server";
import type { FlightOffer } from "@/types/travel";

export const revalidate = 900;

type SearchApiDeal = {
  destination?: { name?: string; country?: string; airport_code?: string };
  origin?: { airport_code?: string };
  outbound_date?: string;
  return_date?: string;
  price?: number;
  typical_price?: number;
  savings_percentage?: number;
  stops?: number;
  airline?: string;
  airline_code?: string;
  booking_link?: string;
};

type SearchApiResponse = {
  search_metadata?: { created_at?: string; status?: string };
  deals?: SearchApiDeal[];
};

function formatDate(value?: string) {
  if (!value) return "Data flexível";
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.SEARCHAPI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ offers: [], configured: false, source: "searchapi" }, { status: 503 });
  }

  const origin = (request.nextUrl.searchParams.get("origin") || "FOR").toUpperCase();
  const url = new URL("https://www.searchapi.io/api/v1/search");
  url.searchParams.set("engine", "google_flights_deals");
  url.searchParams.set("departure_id", origin);
  url.searchParams.set("currency", "BRL");
  url.searchParams.set("hl", "pt-BR");
  url.searchParams.set("gl", "BR");

  const maxPrice = request.nextUrl.searchParams.get("max_price");
  if (maxPrice) url.searchParams.set("max_price", maxPrice);

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
      next: { revalidate: 900 },
    });
    if (!response.ok) {
      const body = await response.text();
      console.error("SearchAPI deals error", response.status, body.slice(0, 500));
      return NextResponse.json({ offers: [], source: "searchapi", error: "Falha ao consultar radar de preços." }, { status: 502 });
    }

    const data = await response.json() as SearchApiResponse;
    const foundAt = data.search_metadata?.created_at;
    const offers: FlightOffer[] = (data.deals ?? []).flatMap((deal, index) => {
      const destination = deal.destination?.name;
      const airport = deal.destination?.airport_code;
      const price = Number(deal.price);
      if (!destination || !airport || !Number.isFinite(price) || price <= 0) return [];
      const region = deal.destination?.country === "Brazil" || deal.destination?.country === "Brasil" ? "Brasil" : "Internacional";
      return [{
        id: `searchapi-${origin}-${airport}-${deal.outbound_date ?? index}`,
        destination,
        airport,
        route: `${origin} → ${airport}`,
        dates: `${formatDate(deal.outbound_date)} → ${formatDate(deal.return_date)}`,
        cashPrice: price,
        tag: (deal.savings_percentage ?? 0) >= 30 ? "Ótimo preço" : "Oferta",
        region,
        theme: destination.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        originAirport: deal.origin?.airport_code ?? origin,
        airlineCode: deal.airline_code,
        airlineName: deal.airline,
        transfers: deal.stops,
        departureAt: deal.outbound_date,
        returnAt: deal.return_date,
        foundAt,
        bookingUrl: deal.booking_link,
      }];
    });

    return NextResponse.json({ offers, configured: true, source: "SearchAPI / Google Flights Deals", updatedAt: foundAt ?? new Date().toISOString(), matchType: "exact" }, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" } });
  } catch (error) {
    console.error("SearchAPI deals request failed", error);
    return NextResponse.json({ offers: [], source: "searchapi", error: "Radar temporariamente indisponível." }, { status: 502 });
  }
}
