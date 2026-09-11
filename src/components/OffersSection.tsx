"use client";

import { useCallback, useEffect, useState } from "react";
import { MOCK_OFFERS } from "@/data/mock-offers";
import type { FlightOffer } from "@/types/travel";
import { OfferCard } from "./OfferCard";

type OffersApiResponse = { offers?: FlightOffer[]; source?: string; cached?: boolean; updatedAt?: string };
type SearchDetail = { origin:string; destination:string; departure?:string; returnDate?:string };

export function OffersSection() {
  const [region, setRegion] = useState<"Brasil"|"Internacional">("Brasil");
  const [liveOffers, setLiveOffers] = useState<FlightOffer[]|null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string>();
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
      setQuery(detail);
    }
    window.addEventListener("tripnordestinos:flight-search", onSearch);
    return () => window.removeEventListener("tripnordestinos:flight-search", onSearch);
  }, []);

  const sourceOffers = liveOffers ?? MOCK_OFFERS;
  const offers = query.destination ? sourceOffers : sourceOffers.filter((offer) => offer.region === region);
  const title = query.destination ? `Ofertas de ${query.origin} para ${query.destination}` : "Melhores ofertas saindo de Fortaleza";

  return (
    <section id="ofertas" className="offers-section">
      <div className="section-heading"><div><span className="eyebrow">{query.destination ? "SUA PESQUISA" : "DECOLANDO DE FOR"}</span><h2>{title}</h2><p>{loading ? "Consultando ofertas..." : query.destination ? "Resultados recentes para os aeroportos e datas escolhidos." : "Encontramos oportunidades para você viajar mais e pagar menos."}</p></div>
        {!query.destination && <div className="region-tabs" role="tablist"><button onClick={() => setRegion("Brasil")} className={region==="Brasil"?"active":""}>Brasil</button><button onClick={() => setRegion("Internacional")} className={region==="Internacional"?"active":""}>Internacional</button></div>}
      </div>
      {!loading && offers.length === 0 ? <div className="empty-offers"><strong>Nenhuma oferta recente encontrada para essa combinação.</strong><span>Tente outras datas ou aeroportos. A base atual é de preços encontrados recentemente, não disponibilidade em tempo real.</span></div> : <div className="offers-grid">{offers.map((offer) => <OfferCard key={offer.id} offer={offer}/>)}</div>}
      <p className="demo-note">{usingFallback ? "* Dados demonstrativos exibidos temporariamente. A fonte de ofertas não respondeu nesta consulta." : `* Ofertas via Aviasales/Travelpayouts. Consulta do site atualizada a cada 15 min${updatedAt ? ` • última consulta ${new Date(updatedAt).toLocaleTimeString("pt-BR", {hour:"2-digit",minute:"2-digit"})}` : ""}. A fonte é cacheada e o preço pode mudar ao verificar disponibilidade.`}</p>
    </section>
  );
}
