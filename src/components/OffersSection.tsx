"use client";

import { useCallback, useEffect, useState } from "react";
import { MOCK_OFFERS } from "@/data/mock-offers";
import type { FlightOffer } from "@/types/travel";
import { OfferCard } from "./OfferCard";

type SearchMode = "cash" | "miles" | "compare";
type OffersApiResponse = { offers?: FlightOffer[]; source?: string; cached?: boolean; updatedAt?: string; matchType?: "exact"|"recent" };
type SearchDetail = { origin:string; destination:string; departure?:string; returnDate?:string; mode?:SearchMode; maxCashPrice?:number; maxMiles?:number };

export function OffersSection() {
  const [region, setRegion] = useState<"Brasil"|"Internacional">("Brasil");
  const [liveOffers, setLiveOffers] = useState<FlightOffer[]|null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string>();
  const [matchType, setMatchType] = useState<"exact"|"recent">("exact");
  const [mode, setMode] = useState<SearchMode>("compare");
  const [query, setQuery] = useState<SearchDetail>({ origin:"FOR", destination:"" });

  const loadOffers = useCallback(async (search: SearchDetail) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ origin:search.origin });
      if (search.destination) params.set("destination", search.destination);
      if (search.departure) params.set("departure_at", search.departure);
      if (search.returnDate) params.set("return_at", search.returnDate);
      const response = await fetch(`/api/offers?${params.toString()}`, { cache:"no-store" });
      if (!response.ok) throw new Error("Falha ao carregar ofertas");
      const payload = await response.json() as OffersApiResponse;
      setMatchType(payload.matchType ?? "exact");
      if (payload.offers?.length) {
        setLiveOffers(payload.offers);
        setUsingFallback(false);
        setUpdatedAt(payload.updatedAt);
        const firstRegion = payload.offers[0].region;
        if (search.destination) setRegion(firstRegion);
      } else {
        setLiveOffers([]);
        setUsingFallback(false);
        setUpdatedAt(payload.updatedAt);
      }
    } catch {
      if (!search.destination) { setLiveOffers(MOCK_OFFERS); setUsingFallback(true); }
      else { setLiveOffers([]); setUsingFallback(false); }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadOffers(query);
    const timer = window.setInterval(() => loadOffers(query), 15 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [query, loadOffers]);

  useEffect(() => {
    function onSearch(event: Event) {
      const detail = (event as CustomEvent<SearchDetail>).detail;
      setMode(detail.mode ?? mode);
      setQuery(detail);
    }
    function onMode(event: Event) {
      const detail = (event as CustomEvent<{mode:SearchMode}>).detail;
      setMode(detail.mode);
    }
    window.addEventListener("tripnordestinos:flight-search", onSearch);
    window.addEventListener("tripnordestinos:payment-mode", onMode);
    return () => {
      window.removeEventListener("tripnordestinos:flight-search", onSearch);
      window.removeEventListener("tripnordestinos:payment-mode", onMode);
    };
  }, [mode]);

  const sourceOffers = liveOffers ?? MOCK_OFFERS;
  const regionOffers = query.destination ? sourceOffers : sourceOffers.filter((offer) => offer.region === region);
  const cashFiltered = query.maxCashPrice ? regionOffers.filter((offer) => offer.cashPrice <= query.maxCashPrice!) : regionOffers;
  const milesOffers = cashFiltered.filter((offer) => typeof offer.milesPrice === "number" && (!query.maxMiles || offer.milesPrice! <= query.maxMiles));
  const offers = mode === "miles" ? milesOffers : cashFiltered;
  const title = query.destination ? `Ofertas de ${query.origin} para ${query.destination}` : "Melhores ofertas saindo de Fortaleza";
  const subtitle = loading
    ? "Consultando ofertas..."
    : mode === "miles"
      ? "Buscamos somente valores reais em programas de fidelidade. Não convertemos preços em dinheiro para criar milhas estimadas."
      : mode === "compare"
        ? "Compare tarifas em dinheiro agora. Quando uma fonte real de milhas estiver disponível, os dois valores aparecerão lado a lado."
        : query.destination
          ? matchType === "recent"
            ? "Não havia preço armazenado para as datas exatas. Abaixo estão ofertas recentes da mesma rota para você comparar."
            : "Resultados em dinheiro encontrados para os aeroportos e datas escolhidos."
          : "Encontramos oportunidades em dinheiro para você viajar mais e pagar menos.";

  return (
    <section id="ofertas" className="offers-section">
      <div className="section-heading"><div><span className="eyebrow">{mode === "miles" ? "OFERTAS EM MILHAS" : mode === "compare" ? "DINHEIRO + MILHAS" : query.destination ? "SUA PESQUISA" : "DECOLANDO DE FOR"}</span><h2>{title}</h2><p>{subtitle}</p></div>
        {!query.destination && <div className="region-tabs" role="tablist"><button onClick={() => setRegion("Brasil")} className={region==="Brasil"?"active":""}>Brasil</button><button onClick={() => setRegion("Internacional")} className={region==="Internacional"?"active":""}>Internacional</button></div>}
      </div>
      {!loading && mode === "miles" && milesOffers.length === 0 ? <div className="empty-offers"><strong>A busca real em milhas está em preparação.</strong><span>Não vamos transformar um preço em reais em uma quantidade fictícia de milhas. Assim que integrarmos uma fonte de disponibilidade dos programas de fidelidade, as ofertas aparecerão aqui.</span></div> : !loading && offers.length === 0 ? <div className="empty-offers"><strong>Nenhuma oferta encontrada com esses filtros.</strong><span>Tente aumentar o limite de preço, escolher outro aeroporto ou consultar novamente mais tarde.</span></div> : <div className="offers-grid">{offers.map((offer) => <OfferCard key={offer.id} offer={offer}/>)}</div>}
      {mode !== "miles" && <p className="demo-note">{usingFallback ? "* Dados demonstrativos exibidos temporariamente. A fonte de ofertas não respondeu nesta consulta." : `* Ofertas em dinheiro via Aviasales/Travelpayouts. Consulta do site atualizada a cada 15 min${updatedAt ? ` • última consulta ${new Date(updatedAt).toLocaleTimeString("pt-BR", {hour:"2-digit",minute:"2-digit"})}` : ""}. ${matchType === "recent" && query.destination ? "Os valores exibidos são recentes da mesma rota, mas não correspondem necessariamente às datas solicitadas. " : ""}A fonte é cacheada e o preço pode mudar ao verificar disponibilidade.`}</p>}
    </section>
  );
}
