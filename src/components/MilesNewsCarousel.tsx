"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/app/milhas/milhas.module.css";
import { MILES_CAMPAIGNS } from "@/data/miles-campaigns";

const NEWS = MILES_CAMPAIGNS.filter((campaign) => campaign.featured);

function isActive(item: (typeof NEWS)[number], now: number) {
  if (!item.expiresAt) return true;
  const expiry = Date.parse(item.expiresAt);
  return Number.isNaN(expiry) || now <= expiry;
}

export function MilesNewsCarousel() {
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const news = useMemo(() => NEWS.filter((item) => isActive(item, now)), [now]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (index >= news.length) setIndex(0);
  }, [index, news.length]);

  useEffect(() => {
    if (news.length <= 1) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % news.length), 6500);
    return () => window.clearInterval(timer);
  }, [news.length]);

  if (news.length === 0) return null;
  const item = news[index] ?? news[0];

  return (
    <section className={styles.newsWrap} aria-label="Radar de notícias de milhas">
      <div className={styles.newsCard}>
        <div className={styles.newsCopy}>
          <div className={styles.newsMeta}><span>{item.eyebrow}</span><strong>{item.program}</strong></div>
          <h2>{item.title}</h2>
          <p>{item.description}</p>
          <small>{item.detail}</small>
          <a href={item.href} target="_blank" rel="noreferrer">Ver oportunidade oficial →</a>
        </div>
        <div className={styles.newsSide}>
          <span className={styles.newsLabel}>RADAR TRIPNORDESTINOS</span>
          <strong>{String(index + 1).padStart(2, "0")} / {String(news.length).padStart(2, "0")}</strong>
          <p>Promoções, parcerias e novidades que podem mudar o valor das suas milhas.</p>
        </div>
      </div>
      <div className={styles.newsControls}>
        <button type="button" onClick={() => setIndex((index - 1 + news.length) % news.length)} aria-label="Notícia anterior">←</button>
        <div>{news.map((newsItem, position) => <button type="button" key={newsItem.title} onClick={() => setIndex(position)} className={position === index ? styles.newsDotActive : styles.newsDot} aria-label={`Ver notícia ${position + 1}`} />)}</div>
        <button type="button" onClick={() => setIndex((index + 1) % news.length)} aria-label="Próxima notícia">→</button>
      </div>
    </section>
  );
}
