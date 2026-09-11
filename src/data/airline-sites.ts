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

function toAzulDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  }).format(date);
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

export function getAirlineSite(code?: string, fallbackName?: string): AirlineSite | null {
  if (!code) return null;
  const normalized = code.toUpperCase();
  return AIRLINE_SITES[normalized] ?? (fallbackName ? { name: fallbackName, url: "" } : null);
}

export function getAirlineBookingUrl(code: string | undefined, params: AirlineSearchParams) {
  if (!code) return null;
  const normalized = code.toUpperCase();
  if (normalized === "AD") return buildAzulUrl(params);
  return AIRLINE_SITES[normalized]?.url ?? null;
}
