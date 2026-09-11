"use client";

import { useEffect, useState } from "react";
import { MOCK_OFFERS } from "@/data/mock-offers";
import type { FlightOffer } from "@/types/travel";
import { OfferCard } from "./OfferCard";

type OffersApiResponse = {
  offers?: FlightOffer[];
  source?: string;
  cached?: boolean;
};

export function OffersSection() {
  const [region, setRegion] = useState<"Brasil" | "Internacional">("Brasil");
  const [liveOffers, setLiveOffers] = useState<FlightOffer[] | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadOffers() {
      try {
        const response = await fetch("/api/offers", { cache: "no-store" });
        if (!response.ok) throw new Error("Falha ao carregar ofertas");

        const payload = (await response.json()) as OffersApiResponse;
        if (!active) return;

        if (payload.offers && payload.offers.length > 0) {
          setLiveOffers(payload.offers);
          setUsingFallback(false);
          return;
        }

        setLiveOffers(MOCK_OFFERS);
        setUsingFallback(true);
      } catch {
        if (!active) return;
        setLiveOffers(MOCK_OFFERS);
        setUsingFallback(true);
      }
    }

    loadOffers();
    return () => {
      active = false;
    };
  }, []);

  const sourceOffers = liveOffers ?? MOCK_OFFERS;
  const offers = sourceOffers.filter((offer) => offer.region === region);

  return (
    <section id="ofertas" className="offers-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">DECOLANDO DE FOR</span>
          <h2>Melhores ofertas saindo de Fortaleza</h2>
          <p>Encontramos oportunidades para você viajar mais e pagar menos.</p>
        </div>
        <div className="region-tabs" role="tablist">
          <button onClick={() => setRegion("Brasil")} className={region === "Brasil" ? "active" : ""}>Brasil</button>
          <button onClick={() => setRegion("Internacional")} className={region === "Internacional" ? "active" : ""}>Internacional</button>
        </div>
      </div>
      <div className="offers-grid">{offers.map((offer) => <OfferCard key={offer.id} offer={offer}/>)}</div>
      <p className="demo-note">
        {usingFallback
          ? "* Dados demonstrativos exibidos temporariamente. A fonte de ofertas reais não respondeu nesta consulta."
          : "* Preços encontrados recentemente via Aviasales/Travelpayouts. São dados em cache e podem mudar ao consultar a disponibilidade atual."}
      </p>
    </section>
  );
}
