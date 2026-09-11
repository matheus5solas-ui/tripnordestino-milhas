export type AirlineSite = {
  name: string;
  url: string;
};

export type AirlineSearchParams = {
  origin?: string;
  destination?: string;
  departureAt?: string;
  returnAt?: string;
  passengers?: number;
};

const AIRLINE_SITES: Record<string, AirlineSite> = {
  AD: { name: "Azul", url: "https://www.voeazul.com.br/br/pt/home" },
  G3: { name: "GOL", url: "https://www.voegol.com.br/" },
  LA: { name: "LATAM", url: "https://www.latamairlines.com/br/pt" },
  "2Z": { name: "VOEPASS", url: "https://www.voepass.com.br/" },
  TP: { name: "TAP", url: "https://www.flytap.com/pt-br/" },
  IB: { name: "Iberia", url: "https://www.iberia.com/br/" },
  UX: { name: "Air Europa", url: "https://www.aireuropa.com/" },
  AR: { name: "Aerolíneas Argentinas", url: "https://www.aerolineas.com/" },
  AV: { name: "Avianca", url: "https://www.avianca.com/pt/" },
  CM: { name: "Copa Airlines", url: "https://www.copaair.com/pt-br/" },
  AA: { name: "American Airlines", url: "https://www.aa.com/pt-br/" },
  DL: { name: "Delta", url: "https://www.delta.com/br/pt" },
  UA: { name: "United", url: "https://www.united.com/pt/br" },
  AF: { name: "Air France", url: "https://wwws.airfrance.com.br/" },
  KL: { name: "KLM", url: "https://www.klm.com.br/" },
  LH: { name: "Lufthansa", url: "https://www.lufthansa.com/br/pt/homepage" },
  AZ: { name: "ITA Airways", url: "https://www.ita-airways.com/pt_br/" },
  BA: { name: "British Airways", url: "https://www.britishairways.com/" }
};

function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIsoDate(value?: string) {
  const date = parseDate(value);
  if (!date) return null;
  return date.toISOString().slice(0, 10);
}

function toLatamDate(value?: string) {
  const date = toIsoDate(value);
  return date ? `${date}T00:00:00.000Z` : null;
}

function toAzulDate(value?: string) {
  const date = parseDate(value);
  if (!date) return null;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  }).format(date);
}

function normalizeSearch(params: AirlineSearchParams) {
  return {
    origin: params.origin?.toUpperCase(),
    destination: params.destination?.toUpperCase(),
    departure: toIsoDate(params.departureAt),
    returning: toIsoDate(params.returnAt),
    passengers: Math.max(1, params.passengers ?? 1),
  };
}

function buildAzulUrl(params: AirlineSearchParams) {
  const origin = params.origin?.toUpperCase();
  const destination = params.destination?.toUpperCase();
  const departure = toAzulDate(params.departureAt);
  const returning = toAzulDate(params.returnAt);

  if (!origin || !destination || !departure) return AIRLINE_SITES.AD.url;

  const search = new URLSearchParams();
  search.set("c[0].ds", origin);
  search.set("c[0].std", departure);
  search.set("c[0].as", destination);

  if (returning) {
    search.set("c[1].ds", destination);
    search.set("c[1].std", returning);
    search.set("c[1].as", origin);
  }

  search.set("p[0].t", "ADT");
  search.set("p[0].c", String(Math.max(1, params.passengers ?? 1)));
  search.set("p[0].cp", "false");
  search.set("f.dl", "3");
  search.set("f.dr", "3");
  search.set("cc", "BRL");

  return `https://www.voeazul.com.br/br/pt/home/selecao-voo?${search.toString()}`;
}

function buildGolUrl(params: AirlineSearchParams) {
  const { origin, destination, departure, returning, passengers } = normalizeSearch(params);
  if (!origin || !destination || !departure) return AIRLINE_SITES.G3.url;

  const search = new URLSearchParams({
    from: origin,
    to: destination,
    departureDate: departure,
    numAdults: String(passengers),
    numChildren: "0",
    numInfants: "0",
  });
  if (returning) search.set("returnDate", returning);

  return `https://www.voegol.com.br/itineraries?${search.toString()}`;
}

function buildLatamUrl(params: AirlineSearchParams) {
  const { origin, destination, returning, passengers } = normalizeSearch(params);
  const outbound = toLatamDate(params.departureAt);
  const inbound = toLatamDate(params.returnAt);
  if (!origin || !destination || !outbound) return AIRLINE_SITES.LA.url;

  const search = new URLSearchParams({
    origin,
    outbound,
    destination,
    adt: String(passengers),
    chd: "0",
    inf: "0",
    trip: returning ? "RT" : "OW",
    cabin: "Economy",
    redemption: "false",
    sort: "RECOMMENDED",
  });
  if (inbound) search.set("inbound", inbound);

  return `https://www.latamairlines.com/br/pt/oferta-voos?${search.toString()}`;
}

export function getDecolarBookingUrl(params: AirlineSearchParams) {
  const { origin, destination, departure, returning, passengers } = normalizeSearch(params);
  if (!origin || !destination || !departure) return "https://www.decolar.com/passagens-aereas";

  if (returning) {
    return `https://www.decolar.com/shop/flights/results/roundtrip/${origin}/${destination}/${departure}/${returning}/${passengers}/0/0?from=SB&di=${passengers}&reSearch=true`;
  }

  return `https://www.decolar.com/shop/flights/results/oneway/${origin}/${destination}/${departure}/${passengers}/0/0?from=SB&di=${passengers}&reSearch=true`;
}

export function getAirlineSite(code?: string, fallbackName?: string): AirlineSite | null {
  if (!code) return null;
  const normalized = code.toUpperCase();
  return AIRLINE_SITES[normalized] ?? (fallbackName ? { name: fallbackName, url: "" } : null);
}

export function getAirlineBookingUrl(code: string | undefined, params: AirlineSearchParams) {
  if (!code) return null;
  const normalized = code.toUpperCase();
  if (normalized === "AD") return buildAzulUrl(params);
  if (normalized === "G3") return buildGolUrl(params);
  if (normalized === "LA") return buildLatamUrl(params);
  return AIRLINE_SITES[normalized]?.url ?? null;
}
