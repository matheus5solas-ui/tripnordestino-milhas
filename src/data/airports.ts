export type AirportOption = {
  code: string;
  city: string;
  airport: string;
  country: string;
};

export const AIRPORTS: AirportOption[] = [
  { code: "FOR", city: "Fortaleza", airport: "Aeroporto Internacional de Fortaleza", country: "Brasil" },
  { code: "GRU", city: "São Paulo", airport: "Guarulhos", country: "Brasil" },
  { code: "CGH", city: "São Paulo", airport: "Congonhas", country: "Brasil" },
  { code: "VCP", city: "Campinas / São Paulo", airport: "Viracopos", country: "Brasil" },
  { code: "GIG", city: "Rio de Janeiro", airport: "Galeão", country: "Brasil" },
  { code: "SDU", city: "Rio de Janeiro", airport: "Santos Dumont", country: "Brasil" },
  { code: "BSB", city: "Brasília", airport: "Aeroporto Internacional de Brasília", country: "Brasil" },
  { code: "SSA", city: "Salvador", airport: "Aeroporto Internacional de Salvador", country: "Brasil" },
  { code: "REC", city: "Recife", airport: "Guararapes", country: "Brasil" },
  { code: "NAT", city: "Natal", airport: "Aeroporto Internacional de Natal", country: "Brasil" },
  { code: "JPA", city: "João Pessoa", airport: "Castro Pinto", country: "Brasil" },
  { code: "MCZ", city: "Maceió", airport: "Zumbi dos Palmares", country: "Brasil" },
  { code: "AJU", city: "Aracaju", airport: "Santa Maria", country: "Brasil" },
  { code: "THE", city: "Teresina", airport: "Senador Petrônio Portella", country: "Brasil" },
  { code: "SLZ", city: "São Luís", airport: "Marechal Cunha Machado", country: "Brasil" },
  { code: "BEL", city: "Belém", airport: "Val-de-Cans", country: "Brasil" },
  { code: "MAO", city: "Manaus", airport: "Eduardo Gomes", country: "Brasil" },
  { code: "CGB", city: "Cuiabá", airport: "Marechal Rondon", country: "Brasil" },
  { code: "CGR", city: "Campo Grande", airport: "Aeroporto Internacional de Campo Grande", country: "Brasil" },
  { code: "GYN", city: "Goiânia", airport: "Santa Genoveva", country: "Brasil" },
  { code: "CNF", city: "Belo Horizonte", airport: "Confins", country: "Brasil" },
  { code: "PLU", city: "Belo Horizonte", airport: "Pampulha", country: "Brasil" },
  { code: "VIX", city: "Vitória", airport: "Eurico de Aguiar Salles", country: "Brasil" },
  { code: "CWB", city: "Curitiba", airport: "Afonso Pena", country: "Brasil" },
  { code: "FLN", city: "Florianópolis", airport: "Hercílio Luz", country: "Brasil" },
  { code: "NVT", city: "Navegantes", airport: "Ministro Victor Konder", country: "Brasil" },
  { code: "POA", city: "Porto Alegre", airport: "Salgado Filho", country: "Brasil" },
  { code: "IGU", city: "Foz do Iguaçu", airport: "Aeroporto Internacional de Foz do Iguaçu", country: "Brasil" },
  { code: "FEN", city: "Fernando de Noronha", airport: "Aeroporto de Fernando de Noronha", country: "Brasil" },
  { code: "BPS", city: "Porto Seguro", airport: "Aeroporto de Porto Seguro", country: "Brasil" },
  { code: "EZE", city: "Buenos Aires", airport: "Ezeiza", country: "Argentina" },
  { code: "AEP", city: "Buenos Aires", airport: "Aeroparque Jorge Newbery", country: "Argentina" },
  { code: "SCL", city: "Santiago", airport: "Arturo Merino Benítez", country: "Chile" },
  { code: "LIM", city: "Lima", airport: "Jorge Chávez", country: "Peru" },
  { code: "MVD", city: "Montevidéu", airport: "Carrasco", country: "Uruguai" },
  { code: "ASU", city: "Assunção", airport: "Silvio Pettirossi", country: "Paraguai" },
  { code: "BOG", city: "Bogotá", airport: "El Dorado", country: "Colômbia" },
  { code: "PTY", city: "Cidade do Panamá", airport: "Tocumen", country: "Panamá" },
  { code: "MIA", city: "Miami", airport: "Miami International", country: "Estados Unidos" },
  { code: "MCO", city: "Orlando", airport: "Orlando International", country: "Estados Unidos" },
  { code: "FLL", city: "Fort Lauderdale", airport: "Fort Lauderdale-Hollywood", country: "Estados Unidos" },
  { code: "JFK", city: "Nova York", airport: "John F. Kennedy", country: "Estados Unidos" },
  { code: "EWR", city: "Nova York", airport: "Newark", country: "Estados Unidos" },
  { code: "LIS", city: "Lisboa", airport: "Humberto Delgado", country: "Portugal" },
  { code: "OPO", city: "Porto", airport: "Francisco Sá Carneiro", country: "Portugal" },
  { code: "MAD", city: "Madri", airport: "Adolfo Suárez Madrid-Barajas", country: "Espanha" },
  { code: "BCN", city: "Barcelona", airport: "El Prat", country: "Espanha" },
  { code: "CDG", city: "Paris", airport: "Charles de Gaulle", country: "França" },
  { code: "ORY", city: "Paris", airport: "Orly", country: "França" },
  { code: "LHR", city: "Londres", airport: "Heathrow", country: "Reino Unido" },
  { code: "FCO", city: "Roma", airport: "Fiumicino", country: "Itália" }
];

export function airportLabel(airport: AirportOption) {
  return `${airport.city} — ${airport.airport} (${airport.code})`;
}

export function resolveAirportCode(value: string) {
  const normalized = value.trim().toLowerCase();
  const directCode = value.match(/\(([A-Z]{3})\)\s*$/i)?.[1]?.toUpperCase();
  if (directCode) return directCode;
  const exact = AIRPORTS.find((airport) =>
    airport.code.toLowerCase() === normalized ||
    airportLabel(airport).toLowerCase() === normalized
  );
  return exact?.code;
}
