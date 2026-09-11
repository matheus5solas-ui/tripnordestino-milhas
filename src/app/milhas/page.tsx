import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import styles from "./milhas.module.css";

const programs = [
  {
    name: "LATAM Pass",
    status: "Sem bônus de transferência ativo confirmado",
    latest: "25% de bônus",
    latestDetail: "Itaú → LATAM Pass, válida de 01 a 04/09/2026.",
    cost: "Depende do custo do ponto de origem",
    note: "Ex.: se seu ponto custar R$ 35,00/milhar, com 25% de bônus o custo efetivo fica em R$ 28,00/milhar.",
  },
  {
    name: "Smiles",
    status: "Campanha ativa hoje",
    latest: "250% a 300% de bônus na compra",
    latestDetail: "Compra de milhas até 21h de 11/09/2026. O percentual varia conforme o plano do Clube/categoria.",
    cost: "Calculado a partir do preço exibido na compra",
    note: "O custo por milheiro muda conforme o plano e o valor mostrado para sua conta no momento da compra.",
  },
  {
    name: "Azul Fidelidade",
    status: "Campanha ativa",
    latest: "Até 110% de bônus + 2.000 pontos",
    latestDetail: "Transferência de pontos de parceiros bancários. Oferta exibida pela Azul com validade de 11 a 13/09/2026.",
    cost: "Depende do custo do ponto de origem",
    note: "O bônus efetivo depende das regras, parceiro e elegibilidade da promoção. Consulte e cadastre-se na página oficial antes da transferência.",
  },
  {
    name: "Iberia Club",
    status: "Monitorando",
    latest: "Sem campanha pública validada agora",
    latestDetail: "Acompanhar compra e bonificações de Avios em canais oficiais.",
    cost: "Aguardando campanha validada",
    note: "O custo de Avios pode variar por país, moeda e oferta.",
  },
  {
    name: "TAP Miles&Go",
    status: "Ofertas do programa ativas",
    latest: "Cash&Miles e ofertas de acúmulo",
    latestDetail: "A TAP mantém ofertas e opções de compra/acúmulo, sem bônus de transferência público equivalente confirmado agora.",
    cost: "Aguardando promoção específica de compra",
    note: "O custo será calculado quando houver preço promocional de compra de milhas disponível.",
  },
];

const campaigns = [
  {
    program: "Azul Fidelidade",
    title: "Até 110% de bônus + 2.000 pontos na primeira transferência",
    period: "11 a 13/09/2026",
    status: "Ativa",
    description: "Semana do Cliente: campanha de transferência de pontos de parceiros bancários para o Azul Fidelidade. Consulte elegibilidade e faça o cadastro antes de transferir.",
    href: "https://www.voeazul.com.br/br/pt/home",
  },
  {
    program: "Smiles",
    title: "Até 300% de bônus na compra de milhas",
    period: "Até 21h de 11/09/2026",
    status: "Ativa",
    description: "250% no Clube 1.000 e bônus progressivo até 300% para Clube 20.000 e/ou categoria Magno/Diamante.",
    href: "https://www.smiles.com.br/campanhas/comprademilhas-300-20260902",
  },
  {
    program: "LATAM Pass",
    title: "RevPoints → Milhas LATAM Pass",
    period: "Até 13/09/2026",
    status: "Ativa",
    description: "Campanha listada na central oficial de ofertas LATAM Pass.",
    href: "https://latampass.latam.com/pt_br/ofertas",
  },
  {
    program: "LATAM Pass",
    title: "Marriott Bonvoy + LATAM Pass",
    period: "Até 15/11/2026",
    status: "Ativa",
    description: "Cadastro no Marriott Bonvoy com oferta de 700 milhas LATAM Pass.",
    href: "https://latampass.latam.com/pt_br/ofertas",
  },
  {
    program: "LATAM Pass",
    title: "Coleção LATAM Pass / Shopee",
    period: "Até 30/09/2026",
    status: "Ativa",
    description: "Acúmulo de milhas em compras elegíveis através da coleção LATAM Pass.",
    href: "https://latampass.latam.com/pt_br/ofertas",
  },
  {
    program: "TAP Miles&Go",
    title: "Cash&Miles",
    period: "Disponível atualmente",
    status: "Ativa",
    description: "Permite combinar milhas e dinheiro na reserva de voos elegíveis da TAP.",
    href: "https://www.flytap.com/pt-br/miles-and-go/promo",
  },
];

export default function MilesPage() {
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

      <section className={styles.section}>
        <div className={styles.headingRow}>
          <div>
            <span className={styles.kicker}>AGORA</span>
            <h2>Campanhas em destaque</h2>
            <p>Somente promoções encontradas em páginas oficiais e com situação identificável.</p>
          </div>
          <span className={styles.updated}>Atualizado em 11/09/2026</span>
        </div>

        <div className={styles.campaignGrid}>
          {campaigns.map((campaign) => (
            <article className={styles.campaignCard} key={`${campaign.program}-${campaign.title}`}>
              <div className={styles.cardTop}>
                <span className={styles.program}>{campaign.program}</span>
                <span className={styles.active}>{campaign.status}</span>
              </div>
              <h3>{campaign.title}</h3>
              <strong className={styles.period}>{campaign.period}</strong>
              <p>{campaign.description}</p>
              <a href={campaign.href} target="_blank" rel="noreferrer">Ver fonte oficial →</a>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.softSection}`}>
        <div className={styles.headingRow}>
          <div>
            <span className={styles.kicker}>CUSTO DO MILHEIRO</span>
            <h2>Cadastro de referência por programa</h2>
            <p>O valor final depende da forma de aquisição. Por isso mostramos a última bonificação validada e a regra de cálculo, sem inventar preço.</p>
          </div>
        </div>

        <div className={styles.programGrid}>
          {programs.map((program) => (
            <article className={styles.programCard} key={program.name}>
              <div className={styles.cardTop}>
                <h3>{program.name}</h3>
                <span className={styles.status}>{program.status}</span>
              </div>
              <div className={styles.metric}>
                <span>Última referência</span>
                <strong>{program.latest}</strong>
                <small>{program.latestDetail}</small>
              </div>
              <div className={styles.costBox}>
                <span>Custo do milheiro</span>
                <strong>{program.cost}</strong>
              </div>
              <p className={styles.note}>{program.note}</p>
            </article>
          ))}
        </div>

        <div className={styles.formulaBox}>
          <div>
            <span className={styles.kicker}>COMO CALCULAMOS</span>
            <h2>Preço do ponto ÷ fator de bônus</h2>
            <p>Exemplo: ponto de origem a R$ 35,00 por milheiro e bônus de 25% → R$ 35,00 ÷ 1,25 = R$ 28,00 por milheiro no programa de destino.</p>
          </div>
          <Link href="/#alertas" className={styles.cta}>Criar alerta de oportunidade</Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
