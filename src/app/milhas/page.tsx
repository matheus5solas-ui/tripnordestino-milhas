import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MilesNewsCarousel } from "@/components/MilesNewsCarousel";
import styles from "./milhas.module.css";
import { activeMilesCampaigns } from "@/data/miles-campaigns";

const programs = [
  { name: "LATAM Pass", status: "Transferência com bônus ativa", latest: "25% de bônus + 1.500 milhas extras", latestDetail: "Campanha de transferência para o LATAM Pass válida até 22/09/2026 às 23h59.", cost: "R$ 28,00/milhar na referência Livelo elegível", note: "Referência: lote Livelo elegível de R$ 35,00/milhar ÷ 1,25 = R$ 28,00/milhar LATAM. As 1.500 milhas extras da primeira transferência podem reduzir ainda mais o custo efetivo; elegibilidade e condições devem ser conferidas." },
  { name: "Smiles", status: "Última campanha encerrada", latest: "250% a 300% de bônus na compra", latestDetail: "Campanha de compra de milhas encerrada em 11/09/2026.", cost: "Calculado a partir do preço exibido na compra", note: "O custo por milheiro muda conforme o plano e o valor mostrado para sua conta no momento da compra." },
  { name: "Azul Fidelidade", status: "Última campanha encerrada", latest: "Até 110% de bônus + 2.000 pontos", latestDetail: "Oferta de transferência divulgada com validade de 11 a 13/09/2026.", cost: "Depende do custo do ponto de origem", note: "O bônus efetivo depende das regras, parceiro e elegibilidade da promoção. Consulte a página oficial antes da transferência." },
  { name: "Iberia Club", status: "Campanha ativa", latest: "Até 20% de desconto em resgates", latestDetail: "Iberia anuncia até 20% de desconto em resgates com Avios para reservas até 23/09/2026 e voos até 18/03.", cost: "Depende da rota e disponibilidade", note: "Consulte destinos e condições diretamente na Iberia antes do resgate." },
  { name: "TAP Miles&Go", status: "Ofertas do programa ativas", latest: "Cash&Miles e ofertas de acúmulo", latestDetail: "A TAP mantém ofertas e opções de compra/acúmulo, sem bônus de transferência público equivalente confirmado agora.", cost: "Aguardando promoção específica de compra", note: "O custo será calculado quando houver preço promocional de compra de milhas disponível." },
];

function updatedLabel() {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Fortaleza" }).format(new Date());
}

export const dynamic = "force-dynamic";

export default function MilesPage() {
  const visibleCampaigns = activeMilesCampaigns();

  return (
    <main>
      <div className={styles.hero}>
        <Header />
        <div className={styles.intro}>
          <span className={styles.kicker}>CENTRAL DE MILHAS</span>
          <h1>Campanhas, bônus e custo do milheiro.</h1>
          <p>Uma área dedicada para acompanhar oportunidades de LATAM Pass, Smiles, Azul, Iberia e TAP.</p>
        </div>
      </div>

      <MilesNewsCarousel />

      <section className={styles.section}>
        <div className={styles.headingRow}>
          <div><span className={styles.kicker}>AGORA</span><h2>Campanhas em destaque</h2><p>Somente promoções encontradas em páginas oficiais e com situação identificável.</p></div>
          <span className={styles.updated}>Atualizado em {updatedLabel()}</span>
        </div>
        <div className={styles.campaignGrid}>{visibleCampaigns.map((campaign) => (
          <article className={styles.campaignCard} key={`${campaign.program}-${campaign.title}`}>
            <div className={styles.cardTop}><span className={styles.program}>{campaign.program}</span><span className={styles.active}>{campaign.status}</span></div>
            <h3>{campaign.title}</h3><strong className={styles.period}>{campaign.period}</strong><p>{campaign.description}</p>
            <a href={campaign.href} target="_blank" rel="noreferrer">Ver fonte oficial →</a>
          </article>
        ))}</div>
      </section>

      <section className={`${styles.section} ${styles.softSection}`}>
        <div className={styles.headingRow}><div><span className={styles.kicker}>CUSTO DO MILHEIRO</span><h2>Cadastro de referência por programa</h2><p>O valor final depende da forma de aquisição. Por isso mostramos a última bonificação validada e a regra de cálculo, sem inventar preço.</p></div></div>
        <div className={styles.programGrid}>{programs.map((program) => (
          <article className={styles.programCard} key={program.name}>
            <div className={styles.cardTop}><h3>{program.name}</h3><span className={styles.status}>{program.status}</span></div>
            <div className={styles.metric}><span>Última referência</span><strong>{program.latest}</strong><small>{program.latestDetail}</small></div>
            <div className={styles.costBox}><span>Custo do milheiro</span><strong>{program.cost}</strong></div><p className={styles.note}>{program.note}</p>
          </article>
        ))}</div>
        <div className={styles.formulaBox}><div><span className={styles.kicker}>COMO CALCULAMOS</span><h2>Preço do ponto ÷ fator de bônus</h2><p>Exemplo: ponto de origem a R$ 35,00 por milheiro e bônus de 25% → R$ 35,00 ÷ 1,25 = R$ 28,00 por milheiro no programa de destino.</p></div><Link href="/#alertas" className={styles.cta}>Criar alerta de oportunidade</Link></div>
      </section>
      <Footer />
    </main>
  );
}
