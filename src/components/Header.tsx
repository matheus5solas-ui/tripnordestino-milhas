"use client";

import { Bell, Heart, Menu, Plane, Search, Tag, X } from "lucide-react";
import { useState } from "react";

const links = [
  { label: "Buscar voos", href: "#buscar", icon: Search },
  { label: "Ofertas", href: "#ofertas", icon: Tag },
  { label: "Alertas", href: "#alertas", icon: Bell },
  { label: "Favoritos", href: "#favoritos", icon: Heart },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <a className="brand" href="#" aria-label="TripNordestino Milhas — início">
        <span className="brand-mark"><Plane size={22} strokeWidth={2.6} /></span>
        <span>TripNordestino <strong>Milhas</strong></span>
      </a>
      <button className="menu-button" aria-label="Abrir menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      <nav className={open ? "nav open" : "nav"} aria-label="Navegação principal">
        {links.map(({ label, href, icon: Icon }, index) => (
          <a key={href} className={index === 0 ? "active" : ""} href={href} onClick={() => setOpen(false)}>
            <Icon size={17} />{label}
          </a>
        ))}
      </nav>
    </header>
  );
}
