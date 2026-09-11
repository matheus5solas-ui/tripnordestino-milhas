import type { FlightOffer } from "@/types/travel";

// DADOS DE DEMONSTRAÇÃO: substitua este módulo por uma implementação de
// FlightOfferProvider quando uma fonte de preços autorizada estiver disponível.
export const MOCK_OFFERS: FlightOffer[] = [
  { id: "gru", destination: "São Paulo", airport: "GRU", route: "FOR → GRU", dates: "08 – 15 Out", cashPrice: 487, milesPrice: 12800, tag: "Ótimo preço", region: "Brasil", theme: "sao-paulo" },
  { id: "gig", destination: "Rio de Janeiro", airport: "GIG", route: "FOR → GIG", dates: "12 – 19 Nov", cashPrice: 539, milesPrice: 14700, tag: "Oferta", region: "Brasil", theme: "rio" },
  { id: "bsb", destination: "Brasília", airport: "BSB", route: "FOR → BSB", dates: "21 – 27 Out", cashPrice: 429, milesPrice: 11300, tag: "Ótimo preço", region: "Brasil", theme: "brasilia" },
  { id: "ssa", destination: "Salvador", airport: "SSA", route: "FOR → SSA", dates: "04 – 10 Dez", cashPrice: 398, milesPrice: 9800, tag: "Oferta", region: "Brasil", theme: "salvador" },
  { id: "rec", destination: "Recife", airport: "REC", route: "FOR → REC", dates: "16 – 20 Out", cashPrice: 319, tag: "Ótimo preço", region: "Brasil", theme: "recife" },
  { id: "eze", destination: "Buenos Aires", airport: "EZE", route: "FOR → EZE", dates: "03 – 12 Mar", cashPrice: 1839, milesPrice: 43800, tag: "Oferta", region: "Internacional", theme: "buenos-aires" },
  { id: "scl", destination: "Santiago", airport: "SCL", route: "FOR → SCL", dates: "10 – 19 Abr", cashPrice: 2104, milesPrice: 49700, tag: "Ótimo preço", region: "Internacional", theme: "santiago" },
  { id: "lis", destination: "Lisboa", airport: "LIS", route: "FOR → LIS", dates: "02 – 14 Mai", cashPrice: 3298, milesPrice: 78400, tag: "Oferta", region: "Internacional", theme: "lisboa" },
  { id: "mco", destination: "Orlando", airport: "MCO", route: "FOR → MCO", dates: "08 – 18 Jun", cashPrice: 2749, milesPrice: 69100, tag: "Ótimo preço", region: "Internacional", theme: "orlando" },
  { id: "mia", destination: "Miami", airport: "MIA", route: "FOR → MIA", dates: "13 – 22 Ago", cashPrice: 2586, tag: "Oferta", region: "Internacional", theme: "miami" },
];
