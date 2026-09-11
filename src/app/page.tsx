import { AlertSection } from "@/components/AlertSection";
import { CurrencyTicker } from "@/components/CurrencyTicker";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { OffersSection } from "@/components/OffersSection";
import { SearchBox } from "@/components/SearchBox";
import { ShieldCheck, Sparkles, Zap } from "lucide-react";

export default function Home() {
  return <main>
    <div className="hero" id="buscar">
      <Header/>
      <CurrencyTicker/>
      <div className="sun one"/><div className="sun two"/>
      <div className="hero-copy"><span className="hero-kicker"><Sparkles size={14}/> Seu próximo destino começa aqui</span><h1>Viaje mais.<br/><em>Compare melhor.</em></h1><p>Encontre passagens em dinheiro e milhas<br className="desktop-break"/> e escolha a opção que vale mais a pena.</p></div>
      <SearchBox/>
      <div className="trust"><span><Zap size={17}/>Comparação simples e rápida</span><span><ShieldCheck size={17}/>Sem taxas escondidas</span><span><Sparkles size={17}/>Dinheiro e milhas lado a lado</span></div>
    </div>
    <OffersSection/>
    <AlertSection/>
    <section id="favoritos" className="favorites-cta"><HeartIcon/><div><h2>Guarde as viagens que fazem seus olhos brilharem.</h2><p>Toque no coração das ofertas para montar sua lista de favoritos.</p></div><a href="#ofertas">Explorar ofertas →</a></section>
    <Footer/>
  </main>;
}

function HeartIcon() { return <span className="favorite-icon">♡</span>; }
