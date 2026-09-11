"use client";

import { ArrowRightLeft, CalendarDays, ChevronDown, MapPin, Search, SlidersHorizontal, Users } from "lucide-react";
import { FormEvent, useState } from "react";
import { AIRPORTS, airportLabel, resolveAirportCode } from "@/data/airports";

export function SearchBox() {
  const [mode, setMode] = useState("compare");
  const [filters, setFilters] = useState(false);
  const [searched, setSearched] = useState(false);
  const [origin, setOrigin] = useState("Fortaleza — Aeroporto Internacional de Fortaleza (FOR)");
  const [destination, setDestination] = useState("");
  const [departure, setDeparture] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState("1");

  function submit(event: FormEvent) {
    event.preventDefault();
    const originCode = resolveAirportCode(origin);
    const destinationCode = resolveAirportCode(destination);
    if (!originCode || !destinationCode) return;
    setSearched(true);
    window.dispatchEvent(new CustomEvent("tripnordestinos:flight-search", { detail: { origin: originCode, destination: destinationCode, departure, returnDate, passengers: Number(passengers), mode } }));
    document.querySelector("#ofertas")?.scrollIntoView({ behavior:"smooth" });
  }

  function swap() {
    const previousOrigin = origin;
    setOrigin(destination);
    setDestination(previousOrigin);
  }

  return (
    <form className="search-card" onSubmit={submit}>
      <datalist id="airport-options">{AIRPORTS.map((airport) => <option key={airport.code} value={airportLabel(airport)}>{airport.country}</option>)}</datalist>
      <div className="search-topline">
        <div className="mode-switch" aria-label="Forma de pagamento">
          {[["cash","Dinheiro"],["miles","Milhas"],["compare","Comparar"]].map(([value,label]) => <button type="button" key={value} className={mode===value?"selected":""} onClick={() => setMode(value)}>{label}</button>)}
        </div>
        <span className="best-hint">Escolha o aeroporto exato, como na companhia aérea</span>
      </div>
      <div className="fields-row">
        <label className="field location-field"><span>Origem</span><div><MapPin size={19}/><input aria-label="Origem" list="airport-options" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Cidade ou aeroporto" required /></div></label>
        <button type="button" className="swap" aria-label="Trocar origem e destino" onClick={swap}><ArrowRightLeft size={17}/></button>
        <label className="field location-field"><span>Destino</span><div><MapPin size={19}/><input aria-label="Destino" list="airport-options" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Cidade, aeroporto ou código IATA" required /></div></label>
        <label className="field date-field"><span>Ida</span><div><CalendarDays size={18}/><input aria-label="Data de ida" type="date" value={departure} onChange={(e) => setDeparture(e.target.value)} /></div></label>
        <label className="field date-field"><span>Volta</span><div><CalendarDays size={18}/><input aria-label="Data de volta" type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} /></div></label>
        <label className="field passenger-field"><span>Passageiros</span><div><Users size={18}/><select aria-label="Passageiros" value={passengers} onChange={(e) => setPassengers(e.target.value)}><option value="1">1 passageiro</option><option value="2">2 passageiros</option><option value="3">3 passageiros</option><option value="4">4 passageiros</option></select><ChevronDown size={15}/></div></label>
        <button className="search-button"><Search size={19}/>Buscar</button>
      </div>
      <div className="filter-row">
        <button type="button" className="filter-toggle" onClick={() => setFilters(!filters)}><SlidersHorizontal size={16}/>Filtros opcionais<ChevronDown className={filters?"rotate":""} size={15}/></button>
        {filters && <div className="optional-filters"><label>Preço máximo <span>R$</span><input inputMode="numeric" placeholder="Ex.: 800" /></label><label>Máximo de milhas <input inputMode="numeric" placeholder="Ex.: 25.000" /></label></div>}
        {searched && <span className="search-feedback">Buscando ofertas recentes para os aeroportos selecionados</span>}
      </div>
    </form>
  );
}
