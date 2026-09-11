"use client";

import { CalendarDays, Heart, Plane } from "lucide-react";
import { useState } from "react";
import type { FlightOffer } from "@/types/travel";
import { getAirlineSite } from "@/data/airline-sites";

const money = new Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL", maximumFractionDigits:0 });
const number = new Intl.NumberFormat("pt-BR");

function stops(value?: number) {
  if (value == null) return "Não informado";
  if (value === 0) return "Direto";
  return `${value} ${value === 1 ? "escala" : "escalas"}`;
}

export function OfferCard({ offer }: { offer: FlightOffer }) {
  const [favorite, setFavorite] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const airlineSite = getAirlineSite(offer.airlineCode, offer.airlineName);
  return (
    <article className={`offer-card ${expanded ? "expanded" : ""}`}>
      <button type="button" className={`destination-art ${offer.theme}`} onClick={() => setExpanded(!expanded)} aria-label={`Ver detalhes de ${offer.destination}`}>
        <span className={`deal-tag ${offer.tag === "Ótimo preço" ? "great" : "sale"}`}>{offer.tag}</span>
        <span className="skyline" aria-hidden="true" />
        <span className="destination-title"><h3>{offer.destination}</h3><span>{offer.airport}</span></span>
      </button>
      <button onClick={() => setFavorite(!favorite)} aria-label={favorite?"Remover dos favoritos":"Adicionar aos favoritos"} className={favorite?"heart saved":"heart"}><Heart size={19} fill={favorite?"currentColor":"none"}/></button>
      <div className="offer-body">
        <div className="route-row"><span><Plane size={16}/>{offer.route}</span><span><CalendarDays size={15}/>{offer.dates}</span></div>
        <div className="price-label">Ida e volta a partir de</div>
        <div className="price-row"><div><strong>{money.format(offer.cashPrice)}</strong><small>por pessoa</small></div>{offer.milesPrice && <><span className="or">ou</span><div className="miles"><strong>{number.format(offer.milesPrice)}</strong><small>milhas + taxas</small></div></>}</div>
        <button type="button" className="details" onClick={() => setExpanded(!expanded)}>{expanded?"Ocultar detalhes":"Ver detalhes"} <span>{expanded?"↑":"→"}</span></button>
        {expanded && <div className="flight-details">
          <div><span>Companhia</span><strong>{offer.airlineName ?? "Não informada pela fonte"}{offer.airlineCode ? ` (${offer.airlineCode})` : ""}</strong></div>
          <div><span>Voo</span><strong>{offer.flightNumber ? `${offer.airlineCode ?? ""} ${offer.flightNumber}`.trim() : "Não informado"}</strong></div>
          <div><span>Aeroportos</span><strong>{offer.originAirport ?? offer.route.split(" → ")[0]} → {offer.airport}</strong></div>
          <div><span>Ida</span><strong>{stops(offer.transfers)}</strong></div>
          <div><span>Volta</span><strong>{stops(offer.returnTransfers)}</strong></div>
          {airlineSite?.url ? <>
            <a className="booking-link" href={airlineSite.url} target="_blank" rel="noopener noreferrer">Buscar este voo na {airlineSite.name} →</a>
            <span className="booking-unavailable">O preço foi encontrado recentemente. Confirme datas, voo e valor diretamente no site da companhia.</span>
          </> : offer.bookingUrl ? <a className="booking-link" href={offer.bookingUrl} target="_blank" rel="noopener noreferrer">Comparar disponibilidade →</a> : <span className="booking-unavailable">Site oficial da companhia ainda não mapeado para esta oferta.</span>}
        </div>}
      </div>
    </article>
  );
}
