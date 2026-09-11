import { NextResponse } from "next/server";
import type { FlightOffer, OfferRegion } from "@/types/travel";

const BRAZIL_IATA = new Set([
  "AJU","AQA","ATM","BEL","BPS","BSB","BVB","CAC","CAW","CFB","CGB","CGH","CGR","CNF","CPV","CWB","CXJ","DOU","FEN","FLN","FOR","GIG","GYN","IGU","IMP","IOS","JDO","JOI","JPA","JTC","LDB","LEC","MAO","MAB","MCZ","MGF","NAT","NVT","OPS","PET","PMW","PNZ","POA","PPB","PVH","RAO","REC","RIA","SDU","SLZ","SSA","STM","THE","UBA","UDI","VCP","VDC","VIX","XAP",
  "ARU","BRA","BVH","CCM","CKS","CLV","CZS","ERN","GPB","IPN","IZA","JJG","JPR","LAJ","MEA","MII","MOC","PAV","PFB","PGZ","ROO","SJK","SMT","TFF","TJL","URB","VAL",
]);

const DESTINATION_NAMES: Record<string, string> = {
  AJU: "Aracaju", AQA: "Araraquara", ATM: "Altamira", BEL: "Belém", BPS: "Porto Seguro",
  BSB: "Brasília", BVB: "Boa Vista", CAC: "Cascavel", CAW: "Campos dos Goytacazes", CGB: "Cuiabá",
  CGH: "São Paulo", CGR: "Campo Grande", CNF: "Belo Horizonte", CPV: "Campina Grande", CWB: "Curitiba",
  CXJ: "Caxias do Sul", DOU: "Dourados", FEN: "Fernando de Noronha", FLN: "Florianópolis", FOR: "Fortaleza",
  GIG: "Rio de Janeiro", GYN: "Goiânia", IGU: "Foz do Iguaçu", IMP: "Imperatriz", IOS: "Ilhéus",
  JDO: "Juazeiro do Norte", JOI: "Joinville", JPA: "João Pessoa", JTC: "Bauru", LDB: "Londrina",
  LEC: "Lençóis", MAO: "Manaus", MAB: "Marabá", MCZ: "Maceió", MGF: "Maringá",
  NAT: "Natal", NVT: "Navegantes", OPS: "Sinop", PET: "Pelotas", PMW: "Palmas", PNZ: "Petrolina",
  POA: "Porto Alegre", PPB: "Presidente Prudente", PVH: "Porto Velho", RAO: "Ribeirão Preto", REC: "Recife",
  RIA: "Santa Maria", SDU: "Rio de Janeiro", SLZ: "São Luís", SSA: "Salvador", STM: "Santarém",
  THE: "Teresina", UBA: "Uberaba", UDI: "Uberlândia", VCP: "Campinas", VDC: "Vitória da Conquista",
  VIX: "Vitória", XAP: "Chapecó", ARU: "Araçatuba", BRA: "Barreiras", BVH: "Vilhena",
  CCM: "Criciúma", CKS: "Carajás", CLV: "Caldas Novas", CZS: "Cruzeiro do Sul", ERN: "Eirunepé",
  GPB: "Guarapuava", IPN: "Ipatinga", IZA: "Juiz de Fora", JJG: "Jaguaruna", JPR: "Ji-Paraná",
  LAJ: "Lages", MEA: "Macaé", MII: "Marília", MOC: "Montes Claros", PAV: "Paulo Afonso",
  PFB: "Passo Fundo", PGZ: "Ponta Grossa", ROO: "Rondonópolis", SJK: "São José dos Campos",
  SMT: "Sorriso", TFF: "Tefé", TJL: "Três Lagoas", URB: "Urubupungá", VAL: "Valença",
  EZE: "Buenos Aires", AEP: "Buenos Aires", SCL: "Santiago", LIM: "Lima", MVD: "Montevidéu",
  ASU: "Assunção", BOG: "Bogotá", PTY: "Cidade do Panamá", MEX: "Cidade do México", CUN: "Cancún",
  MIA: "Miami", MCO: "Orlando", FLL: "Fort Lauderdale", JFK: "Nova York", EWR: "Nova York",
  BOS: "Boston", LAX: "Los Angeles", SFO: "San Francisco", LAS: "Las Vegas", ORD: "Chicago",
  YYZ: "Toronto", YUL: "Montreal", LIS: "Lisboa", OPO: "Porto", MAD: "Madri", BCN: "Barcelona",
  CDG: "Paris", ORY: "Paris", LHR: "Londres", LGW: "Londres", FCO: "Roma", MXP: "Milão",
  AMS: "Amsterdã", FRA: "Frankfurt", ZRH: "Zurique", IST: "Istambul", DXB: "Dubai", DOH: "Doha",
  NRT: "Tóquio", HND: "Tóquio", ICN: "Seul", BKK: "Bangkok", SIN: "Singapura", SYD: "Sydney",
};

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

function toOffer(item: AviasalesOffer): FlightOffer | null {
  const code = (item.destination ?? item.destination_airport ?? "").toUpperCase();
  if (!code || code === "FOR" || typeof item.price !== "number") return null;

  const region: OfferRegion = BRAZIL_IATA.has(code) ? "Brasil" : "Internacional";
  const destination = DESTINATION_NAMES[code] ?? code;

  return {
    id: code.toLowerCase(),
    destination,
    airport: item.destination_airport ?? code,
    route: `FOR → ${code}`,
    dates: formatDateRange(item.departure_at, item.return_at),
    cashPrice: item.price,
    tag: "Oferta",
    region,
    theme: "generic",
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
    const params = new URLSearchParams({
      origin: "FOR",
      currency: "brl",
      market: "br",
      locale: "pt",
      sorting: "price",
      direct: "false",
      one_way: "false",
      unique: "true",
      limit: "1000",
      page: "1",
      token,
    });

    const response = await fetch(
      `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${params.toString()}`,
      { next: { revalidate: 3600 } },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "A Travelpayouts não respondeu à consulta de ofertas." },
        { status: 502 },
      );
    }

    const payload = (await response.json()) as AviasalesResponse;
    if (!payload.success || !Array.isArray(payload.data)) {
      return NextResponse.json(
        { error: "A Travelpayouts não retornou ofertas válidas." },
        { status: 502 },
      );
    }

    const cheapestByDestination = new Map<string, FlightOffer>();

    for (const item of payload.data) {
      const offer = toOffer(item);
      if (!offer) continue;

      const current = cheapestByDestination.get(offer.id);
      if (!current || offer.cashPrice < current.cashPrice) {
        cheapestByDestination.set(offer.id, offer);
      }
    }

    const offers = Array.from(cheapestByDestination.values()).sort(
      (a, b) => a.cashPrice - b.cashPrice,
    );

    return NextResponse.json({
      offers,
      source: "Aviasales Flight Data API / Travelpayouts",
      cached: true,
      updatedAt: new Date().toISOString(),
      counts: {
        brazil: offers.filter((offer) => offer.region === "Brasil").length,
        international: offers.filter((offer) => offer.region === "Internacional").length,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível consultar as ofertas agora." },
      { status: 502 },
    );
  }
}
