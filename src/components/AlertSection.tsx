"use client";

import { Bell, Check, MapPin, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";

export function AlertSection() {
  const [created, setCreated] = useState(false);
  function submit(event: FormEvent) { event.preventDefault(); setCreated(true); }
  return (
    <section id="alertas" className="alert-section">
      <div className="alert-copy">
        <span className="alert-icon"><Bell size={25}/></span><span className="eyebrow">NÃO PERCA A OPORTUNIDADE</span>
        <h2>O preço caiu?<br/>A gente te avisa.</h2>
        <p>Crie um alerta do seu jeito e receba as melhores oportunidades para sua próxima viagem.</p>
        <div className="example"><Sparkles size={18}/><span><small>EXEMPLO DE ALERTA</small>“Voos de Fortaleza para qualquer destino do Brasil por até R$ 600”</span></div>
      </div>
      <form className="alert-form" onSubmit={submit}>
        <h3>Crie seu alerta</h3><p>Leva menos de um minuto.</p>
        <div className="alert-fields">
          <label>Saindo de<div><MapPin size={17}/><input defaultValue="Fortaleza (FOR)"/></div></label>
          <label>Destino<div><MapPin size={17}/><select defaultValue="Brasil"><option>Qualquer destino no Brasil</option><option>Qualquer destino internacional</option><option>Destino específico</option></select></div></label>
          <label>Preço máximo em reais<div className="prefix"><span>R$</span><input inputMode="numeric" placeholder="600"/></div></label>
          <label>Ou máximo de milhas<div className="prefix"><span>✦</span><input inputMode="numeric" placeholder="20.000"/></div></label>
        </div>
        <button className="create-alert">{created ? <><Check size={19}/>Alerta criado!</> : <><Bell size={19}/>Criar alerta de preço</>}</button>
        <small className="privacy">Você poderá editar ou pausar seus alertas quando quiser.</small>
      </form>
    </section>
  );
}
