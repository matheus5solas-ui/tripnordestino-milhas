import { NextResponse } from "next/server";

export const revalidate = 900;

const currencies = [
  ["USD", "Dólar EUA", "🇺🇸"], ["EUR", "Euro", "🇪🇺"], ["ARS", "Peso argentino", "🇦🇷"],
  ["CLP", "Peso chileno", "🇨🇱"], ["CHF", "Franco suíço", "🇨🇭"], ["JPY", "Iene japonês", "🇯🇵"],
  ["CNY", "Yuan chinês", "🇨🇳"], ["KRW", "Won sul-coreano", "🇰🇷"], ["THB", "Baht tailandês", "🇹🇭"],
  ["GBP", "Libra esterlina", "🇬🇧"], ["CAD", "Dólar canadense", "🇨🇦"], ["AUD", "Dólar australiano", "🇦🇺"],
  ["NZD", "Dólar neozelandês", "🇳🇿"], ["MXN", "Peso mexicano", "🇲🇽"], ["COP", "Peso colombiano", "🇨🇴"],
  ["PEN", "Sol peruano", "🇵🇪"], ["UYU", "Peso uruguaio", "🇺🇾"], ["PYG", "Guarani paraguaio", "🇵🇾"],
  ["ZAR", "Rand sul-africano", "🇿🇦"], ["SGD", "Dólar singapuriano", "🇸🇬"], ["HKD", "Dólar de Hong Kong", "🇭🇰"],
  ["AED", "Dirham dos Emirados", "🇦🇪"], ["TRY", "Lira turca", "🇹🇷"], ["INR", "Rúpia indiana", "🇮🇳"],
] as const;

type AwesomeQuote = { bid?: string; pctChange?: string; timestamp?: string };
type ExchangeResponse = { result?: string; rates?: Record<string, number>; time_last_update_utc?: string };
type Quote = { code: string; name: string; flag: string; value: number; change: number | null; timestamp: number | null };

async function getAwesomeQuotes(): Promise<Map<string, Quote>> {
  const result = new Map<string, Quote>();
  const chunks: typeof currencies[number][][] = [];
  for (let i = 0; i < currencies.length; i += 6) chunks.push([...currencies.slice(i, i + 6)]);

  await Promise.all(chunks.map(async (chunk) => {
    try {
      const pairs = chunk.map(([code]) => `${code}-BRL`).join(",");
      const response = await fetch(`https://economia.awesomeapi.com.br/json/last/${pairs}`, {
        next: { revalidate: 900 },
        headers: { Accept: "application/json" },
      });
      if (!response.ok) return;
      const data = await response.json() as Record<string, AwesomeQuote>;
      for (const [code, name, flag] of chunk) {
        const quote = data[`${code}BRL`];
        const value = Number(quote?.bid);
        if (!Number.isFinite(value) || value <= 0) continue;
        result.set(code, {
          code, name, flag, value,
          change: Number.isFinite(Number(quote?.pctChange)) ? Number(quote?.pctChange) : null,
          timestamp: quote?.timestamp ? Number(quote.timestamp) : null,
        });
      }
    } catch {
      // Another provider below fills any missing currencies.
    }
  }));

  return result;
}

async function getFallbackQuotes(existing: Map<string, Quote>) {
  const response = await fetch("https://open.er-api.com/v6/latest/BRL", {
    next: { revalidate: 3600 },
    headers: { Accept: "application/json" },
  });
  if (!response.ok) return;
  const data = await response.json() as ExchangeResponse;
  if (!data.rates) return;

  for (const [code, name, flag] of currencies) {
    if (existing.has(code)) continue;
    const brlToCurrency = data.rates[code];
    if (!Number.isFinite(brlToCurrency) || brlToCurrency <= 0) continue;
    existing.set(code, {
      code, name, flag,
      value: 1 / brlToCurrency,
      change: null,
      timestamp: null,
    });
  }
}

export async function GET() {
  try {
    const quotesByCode = await getAwesomeQuotes();
    await getFallbackQuotes(quotesByCode);
    const quotes = currencies.flatMap(([code]) => {
      const quote = quotesByCode.get(code);
      return quote ? [quote] : [];
    });

    if (!quotes.length) throw new Error("No currency quotes available");

    return NextResponse.json(
      { quotes, base: "BRL", source: "market providers", updatedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" } },
    );
  } catch (error) {
    console.error("Currency quotes error", error);
    return NextResponse.json({ quotes: [], error: "Não foi possível carregar as cotações agora." }, { status: 502 });
  }
}
