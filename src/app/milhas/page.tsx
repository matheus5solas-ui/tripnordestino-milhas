import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MilesNewsCarousel } from "@/components/MilesNewsCarousel";
import styles from "./milhas.module.css";

const programs = [
  { name: "LATAM Pass", status: "Campanha ativa", latest: "25% de bônus Livelo", latestDetail: "Livelo → LATAM Pass, válida até 22/09/2026; primeira transferência pode render 1.500 milhas extras.", cost: "Depende do custo do ponto Livelo", note: "É necessário cadastro prévio na campanha e transferência mínima conforme regulamento." },
  { name: "Smiles", status: "Última campanha encerrada", latest: "250% a 300% de bônus na compra", latestDetail: "Campanha de compra de milhas encerrada em 11/09/2026.", cost: "Calculado a partir do preço exibido na compra", note: "O custo por milheiro muda conforme o plano e o valor mostrado para sua conta no momento da compra." },
  { name: "Azul Fidelidade", status: "Última campanha encerrada", latest: "Até 110% de bônus + 2.000 pontos", latestDetail: "Oferta de transferência divulgada com validade de 11 a 13/09/2026.", cost: "Depende do custo do ponto de origem", note: "O bônus efetivo depende das regras, parceiro e elegibilidade da promoção. Consulte a página oficial antes da transferência." },
  { name: "Iberia Club", status: "Campanhas ativas", latest: "Até 25% de bônus + resgates com desconto", latestDetail: "Esfera → Iberia Club até 22/09/2026 e até 20% de desconto em resgates selecionados até 23/09/2026.", cost: "Depende da origem dos pontos e da oferta", note: "Consulte as regras da Esfera/Iberia e as rotas elegíveis antes de transferir ou resgatar." },
  { name: "TAP Miles&Go", status: "Ofertas do programa ativas", latest: "Cash&Miles e ofertas de acúmulo", latestDetail: "A TAP mantém ofertas e opções de compra/acúmulo, sem bônus de transferência público equivalente confirmado agora.", cost: "Aguardando promoção específica de compra", note: "O custo será calculado quando houver preço promocional de compra de milhas disponível." },
];

type Campaign = {
  program: string;
  title: string;
  period: string;
  status: string;
  description: string;
  href: string;
  expiresAt?: string;
};

const campaigns: Campaign[] = [
  { program: "LATAM Pass", title: "Livelo → LATAM Pass: 25% de bônus", period: "Até 22/09/2026", status: "Ativa", description: "Transferência de pontos Livelo para o LATAM Pass com 25% de milhas bônus; há benefício adicional para primeira transferência conforme as regras da campanha.", href: "https://web.latampass.latam.com/pt_br/promocao/livelo-campanhas", expiresAt: "2026-09-22T23:59:59-03:00" },
  { program: "Iberia Club", title: "Esfera → Iberia Club: até 25% de bônus", period: "Até 22/09/2026", status: "Ativa", description: "Campanha de transferência Esfera para Iberia Club com bonificação de até 25% em Avios, conforme elegibilidade e condições da promoção.", href: "https://www.esfera.com.vc/termos-e-condicoes", expiresAt: "2026-09-22T23:59:59-03:00" },
  { program: "Iberia Club", title: "Até 20% de desconto em resgates com Avios", period: "Até 23/09/2026", status: "Ativa", description: "Desconto em resgates de voos selecionados operados pela Iberia, incluindo rotas com origem ou destino no Brasil.", href: "https://www.iberia.com/br/iberia-club/comprar-voos-avios/", expiresAt: "2026-09-23T23:59:59-03:00" },
  { program: "Azul Fidelidade", title: "Até 110% de bônus + 2.000 pontos na primeira transferência", period: "11 a 13/09/2026", status: "Ativa", description: "Semana do Cliente: campanha de transferência de pontos de parceiros bancários para o Azul Fidelidade. Consulte elegibilidade e faça o cadastro antes de transferir.", href: "https://www.voeazul.com.br/br/pt/home", expiresAt: "2026-09-13T23:59:59-03:00" },
  { program: "Smiles", title: "Até 300% de bônus na compra de milhas", period: "Até 21h de 11/09/2026", status: "Ativa", description: "250% no Clube 1.000 e bônus progressivo até 300% para Clube 20.000 e/ou categoria Magno/Diamante.", href: "https://www.smiles.com.br/campanhas/comprademilhas-300-20260902", expiresAt: "2026-09-11T21:00:00-03:00" },
  { program: "LATAM Pass", title: "RevPoints → Milhas LATAM Pass", period: "Até 13/09/2026", status: "Ativa", description: "Campanha listada na central oficial de ofertas LATAM Pass.", href: "https://latampass.latam.com/pt_br/ofertas", expiresAt: "2026-09-13T23:59:59-03:00" },
  { program: "LATAM Pass", title: "Marriott Bonvoy + LATAM Pass", period: "Até 15/11/2026", status: "Ativa", description: "Cadastro no Marriott Bonvoy com oferta de 700 milhas LATAM Pass.", href: "https://latampass.latam.com/pt_br/ofertas", expiresAt: "2026-11-15T23:59:59-03:00" },
  { program: "LATAM Pass", title: "Coleção LATAM Pass / Shopee", period: "Até 30/09/2026", status: "Ativa", description: "Acúmulo de milhas em compras elegíveis através da coleção LATAM Pass.", href: "https://latampass.latam.com/pt_br/ofertas", expiresAt: "2026-09-30T23:59:59-03:00" },
  { program: "TAP Miles&Go", title: "Cash&Miles", period: "Disponível atualmente", status: "Ativa", description: "Permite combinar milhas e dinheiro na reserva de voos elegíveis da TAP.", href: "https://www.flytap.com/pt-br/miles-and-go/promocoes" },
];

function activeCampaigns() {
  const now = Date.now();
  return campaigns.filter((campaign) => !campaign.expiresAt || now <= Date.parse(campaign.expiresAt));
}

function updatedLabel() {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Fortaleza" }).format(new Date());
}

export const dynamic = "force-dynamic";

export default function MilesPage() {
  const visibleCampaigns = activeCampaigns();

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
