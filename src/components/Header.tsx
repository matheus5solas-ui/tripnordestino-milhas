"use client";

import Link from "next/link";
import { Bell, Heart, Menu, Plane, Search, Tag, X } from "lucide-react";
import { useState } from "react";

const links = [
  { label: "Buscar voos", href: "/#buscar", icon: Search },
  { label: "Ofertas", href: "/#ofertas", icon: Tag },
  { label: "Milhas", href: "/milhas", icon: Tag },
  { label: "Alertas", href: "/#alertas", icon: Bell },
  { label: "Favoritos", href: "/#favoritos", icon: Heart },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="TripNordestinos — início">
        <span className="brand-mark"><Plane size={22} strokeWidth={2.6} /></span>
        <span>TripNordestinos</span>
      </Link>
      <button className="menu-button" aria-label="Abrir menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      <nav className={open ? "nav open" : "nav"} aria-label="Navegação principal">
        {links.map(({ label, href, icon: Icon }, index) => (
          <Link key={href} className={index === 0 ? "active" : ""} href={href} onClick={() => setOpen(false)}>
            <Icon size={17} />{label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
