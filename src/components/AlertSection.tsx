"use client";

import { Bell, Check, MapPin, Sparkles } from "lucide-react";
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
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus("loading"); setMessage("");
    const response = await fetch("/api/alerts", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ name, whatsapp, origin:"FOR", destinationScope:destination, mode, maxCashPrice:mode === "cash" ? Number(cashLimit) : undefined, maxMiles:mode === "miles" ? Number(milesLimit) : undefined, consent })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setStatus("error"); setMessage(data.error ?? "Não foi possível criar o alerta."); return; }
    setStatus("success"); setMessage("Alerta cadastrado! Vamos monitorar as oportunidades disponíveis para esse limite.");
  }

  const example = mode === "cash" ? `Voos de Fortaleza para ${destination.toLowerCase()} por até R$ ${cashLimit || "600"}` : `Voos de Fortaleza para ${destination.toLowerCase()} por até ${Number(milesLimit || 20000).toLocaleString("pt-BR")} milhas`;

  return (
    <section id="alertas" className="alert-section">
      <div className="alert-copy">
        <span className="alert-icon"><Bell size={25}/></span><span className="eyebrow">NÃO PERCA A OPORTUNIDADE</span>
        <h2>Defina seu preço.<br/>A gente monitora.</h2>
        <p>Cadastre seu WhatsApp e diga quanto quer pagar. Quando encontrarmos uma oportunidade dentro do seu limite, o alerta fica pronto para chegar até você.</p>
        <div className="example"><Sparkles size={18}/><span><small>SEU ALERTA</small>“{example}”</span></div>
      </div>
      <form className="alert-form" onSubmit={submit}>
        <h3>Crie seu alerta</h3><p>Leva menos de um minuto.</p>
        <div className="mode-switch" aria-label="Tipo de alerta"><button type="button" className={mode === "cash" ? "selected" : ""} onClick={() => setMode("cash")}>Dinheiro</button><button type="button" className={mode === "miles" ? "selected" : ""} onClick={() => setMode("miles")}>Milhas</button></div>
        <div className="alert-fields">
          <label>Seu nome<div><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Como podemos te chamar?" required/></div></label>
          <label>Seu WhatsApp<div><input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} inputMode="tel" placeholder="(85) 99999-9999" required/></div></label>
          <label>Saindo de<div><MapPin size={17}/><input value="Fortaleza (FOR)" readOnly/></div></label>
          <label>Destino<div><MapPin size={17}/><select value={destination} onChange={(e) => setDestination(e.target.value)}><option>Qualquer destino no Brasil</option><option>Qualquer destino internacional</option><option>Destino específico</option></select></div></label>
          {mode === "cash" ? <label>Me avise quando encontrar até<div className="prefix"><span>R$</span><input inputMode="numeric" value={cashLimit} onChange={(e) => setCashLimit(e.target.value.replace(/\D/g,""))} required/></div></label> : <label>Me avise quando encontrar até<div className="prefix"><span>✦</span><input inputMode="numeric" value={milesLimit} onChange={(e) => setMilesLimit(e.target.value.replace(/\D/g,""))} required/></div></label>}
        </div>
        <label className="privacy" style={{display:"flex", gap:8, alignItems:"flex-start", textAlign:"left"}}><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required/> Quero receber alertas de viagem do TripNordestinos no WhatsApp. Posso cancelar depois.</label>
        <button className="create-alert" disabled={status === "loading"}>{status === "success" ? <><Check size={19}/>Alerta cadastrado!</> : <><Bell size={19}/>{status === "loading" ? "Cadastrando..." : "Criar alerta"}</>}</button>
        {message && <small className="privacy">{message}</small>}
        <small className="privacy">Seus dados serão usados para administrar e enviar os alertas solicitados.</small>
      </form>
    </section>
  );
}
