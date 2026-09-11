"use client";

import { Bell, MapPin, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";

type Mode = "cash" | "miles";

export function AlertSection() {
  const [mode, setMode] = useState<Mode>("cash");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [destination, setDestination] = useState("Qualquer destino no Brasil");
  const [cashLimit, setCashLimit] = useState("600");
  const [milesLimit, setMilesLimit] = useState("20000");
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("Função ainda não habilitada.");
  }

  const example = mode === "cash"
    ? `Voos de Fortaleza para ${destination.toLowerCase()} por até R$ ${cashLimit || "600"}`
    : `Voos de Fortaleza para ${destination.toLowerCase()} por até ${Number(milesLimit || 20000).toLocaleString("pt-BR")} milhas`;

  return (
    <section id="alertas" className="alert-section">
      <div className="alert-copy">
        <span className="alert-icon"><Bell size={25}/></span><span className="eyebrow">NÃO PERCA A OPORTUNIDADE</span>
        <h2>Defina seu preço.<br/>A gente monitora.</h2>
        <p>Cadastre seu WhatsApp e diga quanto quer pagar. Estamos testando esta funcionalidade antes de liberar os avisos automáticos para todos.</p>
        <div className="example"><Sparkles size={18}/><span><small>SEU ALERTA</small>“{example}”</span></div>
      </div>
      <form className="alert-form" onSubmit={submit}>
        <div style={{display:"inline-flex", alignItems:"center", gap:7, padding:"7px 11px", marginBottom:12, borderRadius:999, background:"#fff3cd", color:"#7a5700", fontSize:12, fontWeight:800, letterSpacing:".04em"}}>● FUNÇÃO AINDA EM TESTES</div>
        <h3>Crie seu alerta</h3><p>Você já pode visualizar como a função vai funcionar.</p>
        <div className="mode-switch" aria-label="Tipo de alerta"><button type="button" className={mode === "cash" ? "selected" : ""} onClick={() => { setMode("cash"); setMessage(""); }}>Dinheiro</button><button type="button" className={mode === "miles" ? "selected" : ""} onClick={() => { setMode("miles"); setMessage(""); }}>Milhas</button></div>
        <div className="alert-fields">
          <label>Seu nome<div><input value={name} onChange={(e) => { setName(e.target.value); setMessage(""); }} placeholder="Como podemos te chamar?" required/></div></label>
          <label>Seu WhatsApp<div><input value={whatsapp} onChange={(e) => { setWhatsapp(e.target.value); setMessage(""); }} inputMode="tel" placeholder="(85) 99999-9999" required/></div></label>
          <label>Saindo de<div><MapPin size={17}/><input value="Fortaleza (FOR)" readOnly/></div></label>
          <label>Destino<div><MapPin size={17}/><select value={destination} onChange={(e) => { setDestination(e.target.value); setMessage(""); }}><option>Qualquer destino no Brasil</option><option>Qualquer destino internacional</option><option>Destino específico</option></select></div></label>
          {mode === "cash" ? <label>Me avise quando encontrar até<div className="prefix"><span>R$</span><input inputMode="numeric" value={cashLimit} onChange={(e) => { setCashLimit(e.target.value.replace(/\D/g,"")); setMessage(""); }} required/></div></label> : <label>Me avise quando encontrar até<div className="prefix"><span>✦</span><input inputMode="numeric" value={milesLimit} onChange={(e) => { setMilesLimit(e.target.value.replace(/\D/g,"")); setMessage(""); }} required/></div></label>}
        </div>
        <label className="privacy" style={{display:"flex", gap:8, alignItems:"flex-start", textAlign:"left"}}><input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setMessage(""); }} required/> Quero receber alertas de viagem do TripNordestinos no WhatsApp quando esta função estiver disponível. Posso cancelar depois.</label>
        <button className="create-alert"><Bell size={19}/>Criar alerta</button>
        {message && <div role="status" style={{marginTop:10, padding:"10px 12px", borderRadius:10, background:"#fff3cd", color:"#7a5700", fontSize:13, fontWeight:800, textAlign:"center"}}>{message}</div>}
        <small className="privacy">Função em fase de testes. Nenhum cadastro ou dado é enviado nesta etapa.</small>
      </form>
    </section>
  );
}
