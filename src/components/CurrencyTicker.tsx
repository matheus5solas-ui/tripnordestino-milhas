"use client";

import { useEffect, useState } from "react";
import styles from "./CurrencyTicker.module.css";

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

  if (!quotes.length) return <div className={`${styles.strip} ${styles.loading}`}><span>CÂMBIO PARA VIAJANTES</span><small>Carregando cotações...</small></div>;
  const loop = [...quotes, ...quotes];

  return (
    <div className={styles.strip} aria-label="Cotações de moedas para viajantes">
      <div className={styles.label}><strong>CÂMBIO</strong><span>1 moeda em R$</span></div>
      <div className={styles.window}>
        <div className={styles.track}>
          {loop.map((quote, index) => (
            <div className={styles.item} key={`${quote.code}-${index}`} title={`${quote.name}: 1 ${quote.code} em reais`}>
              <span className={styles.flag}>{quote.flag}</span>
              <strong>{quote.code}</strong>
              <span>R$ {price(quote.value)}</span>
              <em className={quote.change > 0 ? styles.up : quote.change < 0 ? styles.down : styles.flat}>{quote.change > 0 ? "▲" : quote.change < 0 ? "▼" : "•"} {Math.abs(quote.change).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%</em>
            </div>
          ))}
        </div>
      </div>
      <span className={styles.source}>cotação indicativa</span>
    </div>
  );
}
