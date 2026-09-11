"use client";

import { useEffect, useState } from "react";

type Quote = { code: string; name: string; flag: string; value: number; change: number };

function price(value: number) {
  if (value < 0.01) return value.toLocaleString("pt-BR", { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  if (value < 1) return value.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 4 });
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function CurrencyTicker() {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/currencies")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => { if (active && Array.isArray(data.quotes)) setQuotes(data.quotes); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  if (!quotes.length) return <div className="currency-strip currency-loading"><span>CÂMBIO PARA VIAJANTES</span><small>Carregando cotações...</small></div>;
  const loop = [...quotes, ...quotes];

  return (
    <div className="currency-strip" aria-label="Cotações de moedas para viajantes">
      <div className="currency-label"><strong>CÂMBIO</strong><span>1 moeda em R$</span></div>
      <div className="currency-window">
        <div className="currency-track">
          {loop.map((quote, index) => (
            <div className="currency-item" key={`${quote.code}-${index}`} title={`${quote.name}: 1 ${quote.code} em reais`}>
              <span className="currency-flag">{quote.flag}</span>
              <strong>{quote.code}</strong>
              <span>R$ {price(quote.value)}</span>
              <em className={quote.change > 0 ? "currency-up" : quote.change < 0 ? "currency-down" : "currency-flat"}>{quote.change > 0 ? "▲" : quote.change < 0 ? "▼" : "•"} {Math.abs(quote.change).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%</em>
            </div>
          ))}
        </div>
      </div>
      <span className="currency-source">cotação indicativa</span>
    </div>
  );
}
