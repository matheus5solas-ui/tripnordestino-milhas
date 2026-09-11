import { NextResponse } from "next/server";
import type { FlightOffer, OfferRegion } from "@/types/travel";

const DESTINATIONS: Array<{
  code: string;
  name: string;
  region: OfferRegion;
  theme: string;
}> = [
  { code: "GRU", name: "São Paulo", region: "Brasil", theme: "sao-paulo" },
  { code: "GIG", name: "Rio de Janeiro", region: "Brasil", theme: "rio" },
  { code: "BSB", name: "Brasília", region: "Brasil", theme: "brasilia" },
  { code: "SSA", name: "Salvador", region: "Brasil", theme: "salvador" },
  { code: "REC", name: "Recife", region: "Brasil", theme: "recife" },
  { code: "EZE", name: "Buenos Aires", region: "Internacional", theme: "buenos-aires" },
  { code: "SCL", name: "Santiago", region: "Internacional", theme: "santiago" },
  { code: "LIS", name: "Lisboa", region: "Internacional", theme: "lisboa" },
  { code: "MCO", name: "Orlando", region: "Internacional", theme: "orlando" },
  { code: "MIA", name: "Miami", region: "Internacional", theme: "miami" },
];

type AviasalesOffer = {
  price?: number;
  departure_at?: string;
  return_at?: string;
  destination?: string;
  destination_airport?: string;
};

type AviasalesResponse = {
  success?: boolean;
  data?: AviasalesOffer[];
};

function formatDateRange(departure?: string, returning?: string) {
  if (!departure) return "Datas recentes";

  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });

  const outbound = formatter.format(new Date(departure)).replace(".", "");
  if (!returning) return outbound;

  const inbound = formatter.format(new Date(returning)).replace(".", "");
  return `${outbound} – ${inbound}`;
}

async function fetchOffer(
  destination: (typeof DESTINATIONS)[number],
  token: string,
): Promise<FlightOffer | null> {
  const params = new URLSearchParams({
    origin: "FOR",
    destination: destination.code,
    currency: "brl",
    market: "br",
    locale: "pt",
    sorting: "price",
    direct: "false",
    one_way: "false",
    unique: "true",
    limit: "1",
    page: "1",
    token,
  });

  const response = await fetch(
    `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${params.toString()}`,
    { next: { revalidate: 3600 } },
  );

  if (!response.ok) return null;

  const payload = (await response.json()) as AviasalesResponse;
  const item = Array.isArray(payload.data) ? payload.data[0] : undefined;

  if (!payload.success || !item || typeof item.price !== "number") return null;

  return {
    id: destination.code.toLowerCase(),
    destination: destination.name,
    airport: item.destination_airport ?? item.destination ?? destination.code,
    route: `FOR → ${destination.code}`,
    dates: formatDateRange(item.departure_at, item.return_at),
    cashPrice: item.price,
    tag: "Oferta",
    region: destination.region,
    theme: destination.theme,
  };
}

export async function GET() {
  const token = process.env.TRAVELPAYOUTS_API_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "TRAVELPAYOUTS_API_TOKEN não configurado." },
      { status: 503 },
    );
  }

  try {
    const results = await Promise.all(
      DESTINATIONS.map((destination) => fetchOffer(destination, token)),
    );

    const offers = results.filter((offer): offer is FlightOffer => offer !== null);

    return NextResponse.json({
      offers,
      source: "Aviasales Flight Data API / Travelpayouts",
      cached: true,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível consultar as ofertas agora." },
      { status: 502 },
    );
  }
}
