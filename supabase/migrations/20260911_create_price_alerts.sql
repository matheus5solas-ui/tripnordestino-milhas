create extension if not exists pgcrypto;

create table if not exists public.price_alerts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp text not null,
  email text,
  origin text not null default 'FOR',
  destination_scope text not null,
  alert_mode text not null check (alert_mode in ('cash', 'miles')),
  max_cash_price numeric,
  max_miles integer,
  enabled boolean not null default true,
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists price_alerts_enabled_idx on public.price_alerts (enabled);
create index if not exists price_alerts_created_at_idx on public.price_alerts (created_at desc);
create index if not exists price_alerts_whatsapp_idx on public.price_alerts (whatsapp);

alter table public.price_alerts enable row level security;

-- O cadastro público acontece somente pela API server-side usando a service role.
-- Não criamos policies públicas de select/insert para evitar exposição da base de contatos.

create or replace function public.set_price_alerts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists price_alerts_set_updated_at on public.price_alerts;
create trigger price_alerts_set_updated_at
before update on public.price_alerts
for each row
execute function public.set_price_alerts_updated_at();
