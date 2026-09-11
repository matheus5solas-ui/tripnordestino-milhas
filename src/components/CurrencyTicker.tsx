"use client";

import { useEffect, useState } from "react";
import styles from "./CurrencyTicker.module.css";

type Quote = { code: string; name: string; flag: string; value: number; change: number | null };

type Status = "loading" | "ready" | "error";

function price(value: number) {
  if (value < 0.01) return value.toLocaleString("pt-BR", { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  if (value < 1) return value.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 4 });
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function CurrencyTicker() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);

    fetch("/api/currencies", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("currency api error");
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        if (Array.isArray(data.quotes) && data.quotes.length) {
          setQuotes(data.quotes);
          setStatus("ready");
        } else {
          setStatus("error");
        }
      })
      .catch(() => { if (active) setStatus("error"); })
      .finally(() => window.clearTimeout(timeout));

    return () => { active = false; controller.abort(); window.clearTimeout(timeout); };
  }, []);

  if (status === "loading") return <div className={`${styles.strip} ${styles.loading}`}><span>CÂMBIO PARA VIAJANTES</span><small>Carregando cotações...</small></div>;
  if (status === "error" || !quotes.length) return <div className={`${styles.strip} ${styles.loading}`}><span>CÂMBIO PARA VIAJANTES</span><small>Cotações temporariamente indisponíveis</small></div>;

  const loop = [...quotes, ...quotes];

  return (
    <div className={styles.strip} aria-label="Cotações de moedas para viajantes">
      <div className={styles.label}><strong>CÂMBIO</strong><span>1 moeda em R$</span></div>
      <div className={styles.window}>
        <div className={styles.track}>
          {loop.map((quote, index) => {
            const hasChange = typeof quote.change === "number" && Number.isFinite(quote.change);
            const change = hasChange ? quote.change as number : 0;
            return <div className={styles.item} key={`${quote.code}-${index}`} title={`${quote.name}: 1 ${quote.code} em reais`}>
              <span className={styles.flag}>{quote.flag}</span>
              <strong>{quote.code}</strong>
              <span>R$ {price(quote.value)}</span>
              {hasChange ? <em className={change > 0 ? styles.up : change < 0 ? styles.down : styles.flat}>{change > 0 ? "▲" : change < 0 ? "▼" : "•"} {Math.abs(change).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%</em> : <em className={styles.flat}>cotação</em>}
            </div>;
          })}
        </div>
      </div>
      <span className={styles.source}>cotação indicativa</span>
    </div>
  );
}
