import { NextRequest, NextResponse } from "next/server";
import type { FlightOffer, OfferRegion } from "@/types/travel";

const BRAZIL_IATA = new Set(["AJU","AQA","ATM","BEL","BPS","BSB","BVB","CAC","CAW","CFB","CGB","CGH","CGR","CNF","CPV","CWB","CXJ","DOU","FEN","FLN","FOR","GIG","GRU","GYN","IGU","IMP","IOS","JDO","JOI","JPA","JTC","LDB","LEC","MAO","MAB","MCZ","MGF","NAT","NVT","OPS","PET","PLU","PMW","PNZ","POA","PPB","PVH","RAO","REC","RIA","SDU","SLZ","SSA","STM","THE","UBA","UDI","VCP","VDC","VIX","XAP","ARU","BRA","BVH","CCM","CKS","CLV","CZS","ERN","GPB","IPN","IZA","JJG","JPR","LAJ","MEA","MII","MOC","PAV","PFB","PGZ","ROO","SJK","SMT","TFF","TJL","URB","VAL"]);

const DESTINATION_NAMES: Record<string, string> = {
  AJU:"Aracaju",BEL:"Belém",BPS:"Porto Seguro",BSB:"Brasília",CGB:"Cuiabá",CGH:"São Paulo",CGR:"Campo Grande",CNF:"Belo Horizonte",CWB:"Curitiba",FEN:"Fernando de Noronha",FLN:"Florianópolis",FOR:"Fortaleza",GIG:"Rio de Janeiro",GRU:"São Paulo",GYN:"Goiânia",IGU:"Foz do Iguaçu",JPA:"João Pessoa",MAO:"Manaus",MCZ:"Maceió",NAT:"Natal",NVT:"Navegantes",POA:"Porto Alegre",REC:"Recife",SDU:"Rio de Janeiro",SLZ:"São Luís",SSA:"Salvador",THE:"Teresina",VCP:"Campinas",VIX:"Vitória",EZE:"Buenos Aires",AEP:"Buenos Aires",SCL:"Santiago",LIM:"Lima",MVD:"Montevidéu",ASU:"Assunção",BOG:"Bogotá",PTY:"Cidade do Panamá",MIA:"Miami",MCO:"Orlando",FLL:"Fort Lauderdale",JFK:"Nova York",EWR:"Nova York",LIS:"Lisboa",OPO:"Porto",MAD:"Madri",BCN:"Barcelona",CDG:"Paris",ORY:"Paris",LHR:"Londres",FCO:"Roma"
};

const AIRLINES: Record<string, string> = {
  AD:"Azul Linhas Aéreas",G3:"GOL Linhas Aéreas",LA:"LATAM Airlines","2Z":"VOEPASS",TP:"TAP Air Portugal",IB:"Iberia",UX:"Air Europa",AR:"Aerolíneas Argentinas",AV:"Avianca",CM:"Copa Airlines",AA:"American Airlines",DL:"Delta Air Lines",UA:"United Airlines",AF:"Air France",KL:"KLM",LH:"Lufthansa",AZ:"ITA Airways",BA:"British Airways"
};

type AviasalesOffer = {
  price?: number;
  departure_at?: string;
  return_at?: string;
  origin?: string;
  destination?: string;
  origin_airport?: string;
  destination_airport?: string;
  airline?: string;
  flight_number?: string | number;
  transfers?: number;
  return_transfers?: number;
  found_at?: string;
  link?: string;
};

type AviasalesResponse = { success?: boolean; data?: AviasalesOffer[] };

function formatDateRange(departure?: string, returning?: string) {
  if (!departure) return "Datas recentes";
  const formatter = new Intl.DateTimeFormat("pt-BR", { day:"2-digit", month:"short", timeZone:"UTC" });
  const outbound = formatter.format(new Date(departure)).replace(".", "");
  if (!returning) return outbound;
  return `${outbound} – ${formatter.format(new Date(returning)).replace(".", "")}`;
}

function toOffer(item: AviasalesOffer, requestedOrigin: string): FlightOffer | null {
  const code = (item.destination_airport ?? item.destination ?? "").toUpperCase();
  const originCode = (item.origin_airport ?? item.origin ?? requestedOrigin).toUpperCase();
  if (!code || code === originCode || typeof item.price !== "number") return null;
  const airlineCode = item.airline?.toUpperCase();
  const rawLink = item.link?.trim();
  const bookingUrl = rawLink ? (rawLink.startsWith("http") ? rawLink : `https://www.aviasales.com${rawLink.startsWith("/") ? "" : "/"}${rawLink}`) : undefined;
  return {
    id: `${originCode}-${code}-${item.departure_at ?? "recent"}-${airlineCode ?? "airline"}`,
    destination: DESTINATION_NAMES[code] ?? code,
    airport: code,
    originAirport: originCode,
    route: `${originCode} → ${code}`,
    dates: formatDateRange(item.departure_at, item.return_at),
    cashPrice: item.price,
    tag:"Oferta",
    region: (BRAZIL_IATA.has(code) ? "Brasil" : "Internacional") as OfferRegion,
    theme:"generic",
    airlineCode,
    airlineName: airlineCode ? (AIRLINES[airlineCode] ?? airlineCode) : undefined,
    flightNumber: item.flight_number != null ? String(item.flight_number) : undefined,
    transfers: item.transfers,
    returnTransfers: item.return_transfers,
    departureAt: item.departure_at,
    returnAt: item.return_at,
    foundAt: item.found_at,
    bookingUrl
  };
}

function mapOffers(data: AviasalesOffer[], origin: string, destination: string) {
  const cheapest = new Map<string, FlightOffer>();
  for (const item of data) {
    const offer = toOffer(item, origin);
    if (!offer) continue;
    const key = destination ? `${offer.route}-${offer.dates}-${offer.airlineCode ?? "airline"}` : offer.airport;
    const current = cheapest.get(key);
    if (!current || offer.cashPrice < current.cashPrice) cheapest.set(key, offer);
  }
  return Array.from(cheapest.values()).sort((a,b) => a.cashPrice-b.cashPrice);
}

async function queryTravelpayouts(params: URLSearchParams) {
  const response = await fetch(`https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${params.toString()}`, { next:{ revalidate:900 } });
  if (!response.ok) return null;
  const payload = await response.json() as AviasalesResponse;
  if (!payload.success || !Array.isArray(payload.data)) return null;
  return payload.data;
}

export async function GET(request: NextRequest) {
  const token = process.env.TRAVELPAYOUTS_API_TOKEN;
  if (!token) return NextResponse.json({ error:"TRAVELPAYOUTS_API_TOKEN não configurado." }, { status:503 });

  const search = request.nextUrl.searchParams;
  const origin = (search.get("origin") || "FOR").toUpperCase().replace(/[^A-Z]/g, "").slice(0,3);
  const destination = (search.get("destination") || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0,3);
  const departureAt = search.get("departure_at") || "";
  const returnAt = search.get("return_at") || "";

  try {
    const baseParams = new URLSearchParams({ origin, currency:"brl", market:"br", locale:"pt", sorting:"price", direct:"false", one_way:"false", unique: destination ? "false" : "true", limit: destination ? "100" : "1000", page:"1", token });
    if (destination) baseParams.set("destination", destination);

    const exactParams = new URLSearchParams(baseParams);
    if (departureAt) exactParams.set("departure_at", departureAt);
    if (returnAt) exactParams.set("return_at", returnAt);

    const exactData = await queryTravelpayouts(exactParams);
    if (exactData === null) return NextResponse.json({ error:"A Travelpayouts não respondeu à consulta de ofertas." }, { status:502 });

    let offers = mapOffers(exactData, origin, destination);
    let matchType: "exact" | "recent" = "exact";

    if (destination && offers.length === 0 && (departureAt || returnAt)) {
      const recentData = await queryTravelpayouts(baseParams);
      if (recentData) {
        offers = mapOffers(recentData, origin, destination);
        matchType = "recent";
      }
    }

    return NextResponse.json({
      offers,
      source:"Aviasales Flight Data API / Travelpayouts",
      cached:true,
      matchType,
      requestedDates:{ departureAt, returnAt },
      refreshIntervalMinutes:15,
      updatedAt:new Date().toISOString()
    });
  } catch {
    return NextResponse.json({ error:"Não foi possível consultar as ofertas agora." }, { status:502 });
  }
}
