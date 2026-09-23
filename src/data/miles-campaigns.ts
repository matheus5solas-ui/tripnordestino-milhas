export type MilesCampaign = {
  program: string;
  title: string;
  period: string;
  status: "Ativa";
  description: string;
  detail?: string;
  eyebrow?: string;
  href: string;
  expiresAt?: string;
  featured?: boolean;
  pricing?: { source: string; checkedAt: string; transferredPoints: number; cashPrice: number; bonusPercent: number; pixDiscountPercent?: number; extraMiles?: number; pointsUsed?: number; };
};

export const MILES_CAMPAIGNS: MilesCampaign[] = [
  { program: "LATAM Pass", title: "25% de bônus na transferência + 1.500 milhas extras", period: "21/09 às 10h até 22/09/2026 às 23h59", status: "Ativa", description: "Ganhe 25% de bônus na transferência para o LATAM Pass. Na primeira transferência, a campanha também oferece 1.500 Milhas LATAM Pass extras, conforme regulamento.", detail: "Bônus limitado a 300.000 Milhas LATAM Pass por CPF. Consulte o regulamento e faça a transferência dentro do período promocional.", eyebrow: "TRANSFERÊNCIA COM BÔNUS", href: "https://latampass.latam.com/pt_br/ofertas", expiresAt: "2026-09-22T23:59:59-03:00", featured: true, pricing: { source: "Livelo - simulação vigente", checkedAt: "2026-09-22T09:18:00-03:00", transferredPoints: 12000, cashPrice: 383.84, bonusPercent: 25, pixDiscountPercent: 5, extraMiles: 1500, pointsUsed: 120 } },
  { program: "Azul Fidelidade", title: "Até 110% de bônus na transferência de pontos", period: "23/09 a 27/09/2026", status: "Ativa", description: "Transfira pontos de bancos parceiros para o Azul Fidelidade. Na primeira transferência da campanha, clientes Azul Fidelidade recebem 50% de bônus e assinantes Clube Azul recebem 80%. Conforme o tempo de Clube, o bônus pode chegar a 110%.", detail: "Cadastro prévio obrigatório. Limite de 300.000 pontos bônus por CPF e 100.000 para Clube. Bônus válidos por 6 meses; crédito em até 15 dias úteis após o término da promoção.", eyebrow: "TRANSFERÊNCIA COM BÔNUS", href: "https://www.voeazul.com.br/br/pt/ofertas/bancos", expiresAt: "2026-09-27T23:59:59-03:00", featured: true },
  { program: "LATAM Pass", title: "Aniversário LATAM Pass: ofertas para acumular e resgatar milhas", period: "Até 10/10/2026", status: "Ativa", description: "Campanha de aniversário destacada na central oficial do LATAM Pass, com ofertas para acumular e resgatar milhas.", detail: "Consulte a central oficial para ver quais ofertas estão vigentes e as condições de cada parceiro.", eyebrow: "ANIVERSÁRIO LATAM PASS", href: "https://latampass.latam.com/pt_br/ofertas", expiresAt: "2026-10-10T23:59:59-03:00", featured: true },
  { program: "Iberia Club", title: "Esfera → Iberia Club: até 25% de Avios bônus", period: "Até 22/09/2026", status: "Ativa", description: "Transferência de pontos Esfera para o Iberia Club com 25% de bônus para clientes Clube Esfera e 10% de bônus para os demais clientes.", detail: "Campanha exibida pela Esfera. Consulte os termos e condições e faça a transferência dentro do período promocional.", eyebrow: "TRANSFERÊNCIA ESFERA → IBERIA", href: "https://www.esfera.com.vc/transfira-pontos-esfera", expiresAt: "2026-09-22T23:59:59-03:00", featured: true },
  { program: "Iberia Club", title: "Até 20% de desconto em resgates com Avios", period: "Até 23/09/2026", status: "Ativa", description: "Desconto em resgates de voos selecionados operados pela Iberia, incluindo rotas com origem ou destino no Brasil.", detail: "Confira rotas, cabines, datas de viagem e disponibilidade diretamente na Iberia.", eyebrow: "AVIOS EM DESTAQUE", href: "https://www.iberia.com/us/iberia-club/use-avios/", expiresAt: "2026-09-23T23:59:59-03:00", featured: true },
  { program: "LATAM Pass", title: "Marriott Bonvoy + LATAM Pass", period: "Até 15/11/2026", status: "Ativa", description: "Cadastro no Marriott Bonvoy com oferta de 700 milhas LATAM Pass.", href: "https://latampass.latam.com/pt_br/ofertas", expiresAt: "2026-11-15T23:59:59-03:00" },
  { program: "LATAM Pass", title: "Coleção LATAM Pass / Shopee", period: "Até 30/09/2026", status: "Ativa", description: "Acúmulo de milhas em compras elegíveis através da coleção LATAM Pass.", href: "https://latampass.latam.com/pt_br/ofertas", expiresAt: "2026-09-30T23:59:59-03:00" },
  { program: "TAP Miles&Go", title: "Cash&Miles", period: "Disponível atualmente", status: "Ativa", description: "Permite combinar milhas e dinheiro na reserva de voos elegíveis da TAP.", detail: "Os valores em milhas e taxas variam conforme rota e data. Consulte a disponibilidade oficial.", eyebrow: "MILHAS INTERNACIONAIS", href: "https://www.flytap.com/pt-br/miles-and-go/promocoes", featured: true },
];

export function activeMilesCampaigns(now = Date.now()) {
  return MILES_CAMPAIGNS.filter((campaign) => {
    if (!campaign.expiresAt) return true;
    const expiry = Date.parse(campaign.expiresAt);
    return !Number.isNaN(expiry) && now <= expiry;
  });
}

export function campaignPricing(campaign: MilesCampaign) {
  const p = campaign.pricing;
  if (!p) return null;
  const baseMiles = p.transferredPoints * (1 + p.bonusPercent / 100);
  const cashMilheiro = p.cashPrice / (baseMiles / 1000);
  const pixCash = p.pixDiscountPercent ? p.cashPrice * (1 - p.pixDiscountPercent / 100) : null;
  const pixMilheiro = pixCash == null ? null : pixCash / (baseMiles / 1000);
  const firstTransferMiles = baseMiles + (p.extraMiles || 0);
  const firstTransferMilheiro = p.extraMiles ? p.cashPrice / (firstTransferMiles / 1000) : null;
  const pixFirstTransferMilheiro = pixCash != null && p.extraMiles ? pixCash / (firstTransferMiles / 1000) : null;
  return { baseMiles, cashMilheiro, pixMilheiro, firstTransferMilheiro, pixFirstTransferMilheiro };
}
