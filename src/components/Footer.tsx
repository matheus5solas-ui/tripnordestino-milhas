import { Instagram, Mail, Plane } from "lucide-react";

export function Footer() {
  return <footer><div className="footer-brand"><span className="brand-mark"><Plane size={19}/></span><div><strong>TripNordestino Milhas</strong><small>Viaje mais. Compare melhor.</small></div></div><p>Feito com ☀️ no Nordeste, para quem quer ir mais longe.</p><div className="social"><a href="mailto:ola@tripnordestino.com" aria-label="E-mail"><Mail size={18}/></a><a href="#" aria-label="Instagram"><Instagram size={18}/></a></div></footer>;
}
