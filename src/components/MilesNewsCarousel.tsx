"use client";

import { useEffect, useState } from "react";
import styles from "@/app/milhas/milhas.module.css";

type NewsItem = {
  program: string;
  eyebrow: string;
  title: string;
  description: string;
  detail: string;
  href: string;
};

const NEWS: NewsItem[] = [
  {
    program: "Azul Fidelidade",
    eyebrow: "PARCERIA EM DESTAQUE",
    title: "Nomad + Azul: conversão pode render até 30 mil pontos",
    description: "A Azul está destacando a parceria com a Nomad para clientes que adicionam saldo em reais e convertem para dólar ou euro pelo app.",
    detail: "Oferta divulgada na página oficial Nomad + Azul. Confira as condições e elegibilidade antes de participar.",
    href: "https://www.voeazul.com.br/br/pt/ofertas/nomad",
  },
  {
    program: "Smiles",
    eyebrow: "TERMINA HOJE",
    title: "Smiles oferece até 300% de bônus na compra de milhas",
    description: "A campanha de compra de milhas vai até 21h de 11/09/2026 e o percentual varia conforme Clube Smiles e categoria do participante.",
    detail: "Promoção oficial Smiles. Verifique o preço do milheiro para a sua conta antes da compra.",
    href: "https://www.smiles.com.br/campanhas/comprademilhas-300-20260902",
  },
  {
    program: "LATAM Pass",
    eyebrow: "OPORTUNIDADE LATAM PASS",
    title: "RevPoints podem ser convertidos em Milhas LATAM Pass",
    description: "A oferta aparece na central oficial do LATAM Pass com validade até 13/09/2026. Há também campanhas com Marriott Bonvoy e Shopee em andamento.",
    detail: "Consulte a central oficial para regras, prazos e condições de cada parceiro.",
    href: "https://latampass.latam.com/pt_br/ofertas",
  },
  {
    program: "TAP Miles&Go",
    eyebrow: "MILHAS INTERNACIONAIS",
    title: "TAP mantém ofertas de passagens Miles&Go e novas opções de acúmulo",
    description: "A TAP divulga oportunidades para reservar voos com milhas e campanhas de acúmulo com parceiros, incluindo estadias.",
    detail: "Os valores em milhas e taxas variam conforme rota e data. Consulte a disponibilidade oficial.",
    href: "https://www.flytap.com/pt-br/miles-and-go/promocoes",
  },
];

export function MilesNewsCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % NEWS.length), 6500);
    return () => window.clearInterval(timer);
  }, []);

  const item = NEWS[index];

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
          <strong>{String(index + 1).padStart(2, "0")} / {String(NEWS.length).padStart(2, "0")}</strong>
          <p>Promoções, parcerias e novidades que podem mudar o valor das suas milhas.</p>
        </div>
      </div>
      <div className={styles.newsControls}>
        <button type="button" onClick={() => setIndex((index - 1 + NEWS.length) % NEWS.length)} aria-label="Notícia anterior">←</button>
        <div>{NEWS.map((news, position) => <button type="button" key={news.title} onClick={() => setIndex(position)} className={position === index ? styles.newsDotActive : styles.newsDot} aria-label={`Ver notícia ${position + 1}`} />)}</div>
        <button type="button" onClick={() => setIndex((index + 1) % NEWS.length)} aria-label="Próxima notícia">→</button>
      </div>
    </section>
  );
}
