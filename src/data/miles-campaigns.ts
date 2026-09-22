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
};

export const MILES_CAMPAIGNS: MilesCampaign[] = [
  { program: "LATAM Pass", title: "Aniversário LATAM Pass: ofertas para acumular e resgatar milhas", period: "Até 10/10/2026", status: "Ativa", description: "Campanha de aniversário destacada na central oficial do LATAM Pass, com ofertas para acumular e resgatar milhas.", detail: "Consulte a central oficial para ver quais ofertas estão vigentes e as condições de cada parceiro.", eyebrow: "ANIVERSÁRIO LATAM PASS", href: "https://latampass.latam.com/pt_br/ofertas", expiresAt: "2026-10-10T23:59:59-03:00", featured: true },
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
