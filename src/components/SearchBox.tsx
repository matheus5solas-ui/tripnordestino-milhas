"use client";

import { ArrowRightLeft, CalendarDays, ChevronDown, MapPin, Search, SlidersHorizontal, Users } from "lucide-react";
import { FormEvent, useState } from "react";

export function SearchBox() {
  const [mode, setMode] = useState("compare");
  const [filters, setFilters] = useState(false);
  const [searched, setSearched] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    setSearched(true);
    document.querySelector("#ofertas")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <form className="search-card" onSubmit={submit}>
      <div className="search-topline">
        <div className="mode-switch" aria-label="Forma de pagamento">
          {[['cash', 'Dinheiro'], ['miles', 'Milhas'], ['compare', 'Comparar']].map(([value, label]) => (
            <button type="button" key={value} className={mode === value ? "selected" : ""} onClick={() => setMode(value)}>{label}</button>
          ))}
        </div>
        <span className="best-hint">Compare e escolha o melhor valor</span>
      </div>
      <div className="fields-row">
        <label className="field location-field">
          <span>Origem</span><div><MapPin size={19}/><input aria-label="Origem" defaultValue="Fortaleza (FOR)" /></div>
        </label>
        <button type="button" className="swap" aria-label="Trocar origem e destino"><ArrowRightLeft size={17}/></button>
        <label className="field location-field">
          <span>Destino</span><div><MapPin size={19}/><input aria-label="Destino" placeholder="Para onde você vai?" /></div>
        </label>
        <label className="field date-field">
          <span>Ida</span><div><CalendarDays size={18}/><input aria-label="Data de ida" type="date" /></div>
        </label>
        <label className="field date-field">
          <span>Volta</span><div><CalendarDays size={18}/><input aria-label="Data de volta" type="date" /></div>
        </label>
        <label className="field passenger-field">
          <span>Passageiros</span><div><Users size={18}/><select aria-label="Passageiros" defaultValue="1"><option value="1">1 passageiro</option><option value="2">2 passageiros</option><option value="3">3 passageiros</option><option value="4">4 passageiros</option></select><ChevronDown size={15}/></div>
        </label>
        <button className="search-button"><Search size={19}/>Buscar</button>
      </div>
      <div className="filter-row">
        <button type="button" className="filter-toggle" onClick={() => setFilters(!filters)}><SlidersHorizontal size={16}/>Filtros opcionais<ChevronDown className={filters ? "rotate" : ""} size={15}/></button>
        {filters && <div className="optional-filters">
          <label>Preço máximo <span>R$</span><input inputMode="numeric" placeholder="Ex.: 800" /></label>
          <label>Máximo de milhas <input inputMode="numeric" placeholder="Ex.: 25.000" /></label>
        </div>}
        {searched && <span className="search-feedback">Exibindo ofertas de demonstração</span>}
      </div>
    </form>
  );
}
