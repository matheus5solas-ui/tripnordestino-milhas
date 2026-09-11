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

export async function GET() {
  try {
    const pairs = currencies.map(([code]) => `${code}-BRL`).join(",");
    const response = await fetch(`https://economia.awesomeapi.com.br/json/last/${pairs}`, {
      next: { revalidate: 900 },
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`Currency provider returned ${response.status}`);
    const data = await response.json() as Record<string, AwesomeQuote>;
    const quotes = currencies.flatMap(([code, name, flag]) => {
      const quote = data[`${code}BRL`];
      if (!quote?.bid) return [];
      return [{ code, name, flag, value: Number(quote.bid), change: Number(quote.pctChange ?? 0), timestamp: quote.timestamp ? Number(quote.timestamp) : null }];
    });
    return NextResponse.json({ quotes, base: "BRL", source: "AwesomeAPI", updatedAt: new Date().toISOString() }, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" } });
  } catch (error) {
    console.error("Currency quotes error", error);
    return NextResponse.json({ quotes: [], error: "Não foi possível carregar as cotações agora." }, { status: 502 });
  }
}
