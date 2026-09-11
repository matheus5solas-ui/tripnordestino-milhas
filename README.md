# TripNordestino Milhas

Primeira versão de um buscador responsivo de passagens aéreas para comparar valores em dinheiro e milhas, com foco em ofertas saindo de Fortaleza.

## Funcionalidades

- Busca por origem, destino, ida, volta e número de passageiros.
- Comparação por dinheiro, milhas ou ambos, com filtros máximos opcionais.
- Vitrines nacionais e internacionais alimentadas por dados de demonstração.
- Favoritos locais na interface e formulário inicial de alertas de preço.
- Contratos desacoplados para futuros provedores de voos e persistência de alertas.
- Layout responsivo e pronto para deploy na Vercel.

> **Importante:** não há scraping nem conexão com programas de fidelidade. Todos os preços exibidos são mocks em `src/data/mock-offers.ts`.

## Tecnologias

- Next.js (App Router)
- React e TypeScript
- CSS responsivo
- Lucide React
- Estrutura preparada para Supabase

## Executar localmente

Requer Node.js 20 ou superior.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). As variáveis do Supabase são opcionais nesta versão.

## Verificações

```bash
npm run lint
npm run typecheck
npm run build
```

## Arquitetura para integrações futuras

- `src/services/flight-provider.ts`: porta `FlightOfferProvider` e adapter mock. Uma API autorizada pode implementar esse contrato sem alterar a UI.
- `src/services/alert-repository.ts`: porta de persistência dos alertas, pronta para receber um adapter Supabase.
- `src/types/travel.ts`: modelos compartilhados de busca, oferta e alerta.
- `src/data/mock-offers.ts`: dados explicitamente marcados como demonstração.

Para conectar o Supabase futuramente, configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` com base no `.env.example`, crie um cliente em `src/lib/` e implemente `AlertRepository`.

## Deploy na Vercel

Importe este repositório na Vercel, mantenha o preset **Next.js** e adicione as variáveis de ambiente quando a integração com Supabase for implementada. O comando de build padrão é `npm run build`.
