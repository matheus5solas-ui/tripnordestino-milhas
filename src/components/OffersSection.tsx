"use client";

import { useState } from "react";
import { MOCK_OFFERS } from "@/data/mock-offers";
import { OfferCard } from "./OfferCard";

export function OffersSection() {
  const [region, setRegion] = useState<"Brasil" | "Internacional">("Brasil");
  const offers = MOCK_OFFERS.filter((offer) => offer.region === region);
  return (
    <section id="ofertas" className="offers-section">
      <div className="section-heading">
        <div><span className="eyebrow">DECOLANDO DE FOR</span><h2>Melhores ofertas saindo de Fortaleza</h2><p>Encontramos oportunidades para você viajar mais e pagar menos.</p></div>
        <div className="region-tabs" role="tablist"><button onClick={() => setRegion("Brasil")} className={region === "Brasil" ? "active" : ""}>Brasil</button><button onClick={() => setRegion("Internacional")} className={region === "Internacional" ? "active" : ""}>Internacional</button></div>
      </div>
      <div className="offers-grid">{offers.map((offer) => <OfferCard key={offer.id} offer={offer}/>)}</div>
      <p className="demo-note">* Valores ilustrativos para demonstração. Preços e disponibilidade podem variar.</p>
    </section>
  );
}
