"use client";

import { CalendarDays, Heart, Plane } from "lucide-react";
import { useState } from "react";
import type { FlightOffer } from "@/types/travel";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("pt-BR");

export function OfferCard({ offer }: { offer: FlightOffer }) {
  const [favorite, setFavorite] = useState(false);
  return (
    <article className="offer-card">
      <div className={`destination-art ${offer.theme}`}>
        <span className={`deal-tag ${offer.tag === "Ótimo preço" ? "great" : "sale"}`}>{offer.tag}</span>
        <button onClick={() => setFavorite(!favorite)} aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"} className={favorite ? "heart saved" : "heart"}><Heart size={19} fill={favorite ? "currentColor" : "none"}/></button>
        <div className="skyline" aria-hidden="true" />
        <div className="destination-title"><h3>{offer.destination}</h3><span>{offer.airport}</span></div>
      </div>
      <div className="offer-body">
        <div className="route-row"><span><Plane size={16}/>{offer.route}</span><span><CalendarDays size={15}/>{offer.dates}</span></div>
        <div className="price-label">Ida e volta a partir de</div>
        <div className="price-row">
          <div><strong>{money.format(offer.cashPrice)}</strong><small>por pessoa</small></div>
          {offer.milesPrice && <><span className="or">ou</span><div className="miles"><strong>{number.format(offer.milesPrice)}</strong><small>milhas + taxas</small></div></>}
        </div>
        <button className="details">Ver detalhes <span>→</span></button>
      </div>
    </article>
  );
}
