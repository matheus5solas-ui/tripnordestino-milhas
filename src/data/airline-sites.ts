export type AirlineSite = {
  name: string;
  url: string;
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

export function getAirlineSite(code?: string, fallbackName?: string): AirlineSite | null {
  if (!code) return null;
  const normalized = code.toUpperCase();
  return AIRLINE_SITES[normalized] ?? (fallbackName ? { name: fallbackName, url: "" } : null);
}
