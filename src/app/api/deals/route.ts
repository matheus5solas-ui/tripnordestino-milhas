import { NextRequest, NextResponse } from "next/server";
import type { FlightOffer } from "@/types/travel";

// Atualização mais frequente sem encostar no teto de 250/mês.
// 3h30 = ~6,9 janelas/dia, cerca de 213 em 31 dias no pior caso de tráfego contínuo.
export const revalidate = 12600;

const BRAZIL_IATA = new Set([
  "AJU","BEL","BPS","BSB","CGB","CGH","CNF","CPV","CWB","FEN","FLN","FOR","GIG","GRU","IGU","JDO","JOI","LDB","MAO","MCZ","NAT","NVT","POA","PVH","REC","SDU","SLZ","SSA","THE","UDI","VCP","VIX",
]);

const BRAZIL_DESTINATION_IATA: Record<string, string> = {
  "fernando de noronha": "FEN",
};

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
  search_metadata?: { created_at?: string; status?: string; id?: string };
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

function normalize(value?: string) {
  return (value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function isBrazil(country: string | undefined, airport: string) {
  const normalizedCountry = normalize(country);
  if (normalizedCountry === "brazil" || normalizedCountry === "brasil") return true;
  if (normalizedCountry && normalizedCountry !== "brazil" && normalizedCountry !== "brasil") return false;
  return BRAZIL_IATA.has(airport);
}

function recoverBrazilAirport(result: ExploreDestination) {
  const existing = result.destination_airport?.code?.toUpperCase();
  if (existing) return existing;
  const country = normalize(result.country);
  if (country !== "brasil" && country !== "brazil") return undefined;
  return BRAZIL_DESTINATION_IATA[normalize(result.name)];
}

function keepCheapestPerAirport(offers: FlightOffer[]) {
  const byAirport = new Map<string, FlightOffer>();
  for (const offer of offers) {
    const existing = byAirport.get(offer.airport);
    if (!existing || offer.cashPrice < existing.cashPrice) byAirport.set(offer.airport, offer);
  }
  return [...byAirport.values()].sort((a, b) => a.cashPrice - b.cashPrice);
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
    const response = await fetch(url, { next: { revalidate: 12600 } });
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

    const destinations = data.destinations ?? [];
    const foundAt = data.search_metadata?.created_at;
    let invalidRemoved = 0;
    let priceFilterRemoved = 0;
    let recoveredAirportCodes = 0;
    const discardedSamples: Array<{
      name?: string;
      country?: string;
      airport?: string;
      location?: string;
      price?: number;
      reason: string;
    }> = [];

    const rawOffers: FlightOffer[] = destinations.flatMap<FlightOffer>((result, index) => {
      const originalAirport = result.destination_airport?.code?.toUpperCase();
      const airport = recoverBrazilAirport(result);
      if (!originalAirport && airport) recoveredAirportCodes += 1;
      const price = Number(result.flight_price);
      const destination = result.destination_airport?.location || result.name;

      if (!destination || !airport || !Number.isFinite(price) || price <= 0) {
        invalidRemoved += 1;
        if (discardedSamples.length < 40) {
          discardedSamples.push({
            name: result.name,
            country: result.country,
            airport,
            location: result.destination_airport?.location,
            price: Number.isFinite(price) ? price : undefined,
            reason: !destination ? "missing-destination" : !airport ? "missing-airport-code" : !Number.isFinite(price) || price <= 0 ? "missing-or-invalid-price" : "invalid",
          });
        }
        return [];
      }
      if (maxPrice > 0 && price > maxPrice) {
        priceFilterRemoved += 1;
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
        region: isBrazil(result.country, airport) ? "Brasil" : "Internacional",
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
    });

    const unique = keepCheapestPerAirport(rawOffers);
    const duplicatesRemoved = Math.max(0, rawOffers.length - unique.length);
    const allBrazil = unique.filter((offer) => offer.region === "Brasil");
    const allInternational = unique.filter((offer) => offer.region === "Internacional");
    const brazil = allBrazil.slice(0, 3);
    const international = allInternational.slice(0, 3);
    const offers = [...brazil, ...international];

    const countryCounts = destinations.reduce<Record<string, number>>((acc, item) => {
      const key = item.country || "(sem país)";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json(
      {
        offers,
        configured: true,
        source: "SerpApi / Google Travel Explore",
        provider: "serpapi",
        providerSearchId: data.search_metadata?.id,
        updatedAt: foundAt ?? new Date().toISOString(),
        matchType: "exact",
        radarPolicy: "3-brasil-3-internacional-cache-3h30",
        diagnostic: {
          providerDestinations: destinations.length,
          validBeforeDedup: rawOffers.length,
          uniqueAfterDedup: unique.length,
          brazilAvailable: allBrazil.length,
          internationalAvailable: allInternational.length,
          brazilDisplayed: brazil.length,
          internationalDisplayed: international.length,
          invalidRemoved,
          duplicatesRemoved,
          priceFilterRemoved,
          recoveredAirportCodes,
          countryCounts,
          discardedSamples,
        },
      },
      { headers: { "Cache-Control": "public, s-maxage=12600, stale-while-revalidate=25200" } },
    );
  } catch (error) {
    console.error("SerpApi explore request failed", error);
    return NextResponse.json({ offers: [], source: "serpapi", error: "Radar temporariamente indisponível." }, { status: 502 });
  }
}
