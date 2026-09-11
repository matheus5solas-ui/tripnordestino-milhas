import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type AlertPayload = {
  name?: string;
  whatsapp?: string;
  email?: string;
  origin?: string;
  destinationScope?: string;
  mode?: "cash" | "miles";
  maxCashPrice?: number;
  maxMiles?: number;
  consent?: boolean;
};

function digits(value: string) {
  return value.replace(/\D/g, "");
}

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function sendAdminWhatsApp(names: string[]) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const adminPhone = process.env.ALERT_ADMIN_WHATSAPP;
  const apiVersion = process.env.WHATSAPP_GRAPH_VERSION || "v23.0";
  if (!token || !phoneNumberId || !adminPhone || names.length === 0) return { configured: false };

  const list = names.map((name, index) => `${String(index + 1).padStart(2, "0")} - ${name}`).join("\n");
  const body = `TripNordestinos — cadastrados para receber alertas (${names.length}):\n${list}`;
  const response = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to: digits(adminPhone), type: "text", text: { preview_url: false, body } }),
  });
  return { configured: true, ok: response.ok };
}

export async function POST(request: NextRequest) {
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ error: "Cadastro de alertas ainda não está configurado no servidor." }, { status: 503 });

  let payload: AlertPayload;
  try { payload = await request.json() as AlertPayload; }
  catch { return NextResponse.json({ error: "Dados inválidos." }, { status: 400 }); }

  const name = payload.name?.trim().slice(0, 100) ?? "";
  const whatsapp = digits(payload.whatsapp ?? "");
  const email = payload.email?.trim().toLowerCase().slice(0, 200) || null;
  const origin = (payload.origin || "FOR").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);
  const destinationScope = payload.destinationScope?.trim().slice(0, 120) ?? "";
  const mode = payload.mode === "miles" ? "miles" : "cash";

  if (name.length < 2 || whatsapp.length < 10 || !destinationScope || payload.consent !== true) {
    return NextResponse.json({ error: "Preencha nome, WhatsApp, destino e aceite receber os alertas." }, { status: 400 });
  }
  if (mode === "cash" && (!payload.maxCashPrice || payload.maxCashPrice <= 0)) return NextResponse.json({ error: "Informe um preço máximo válido." }, { status: 400 });
  if (mode === "miles" && (!payload.maxMiles || payload.maxMiles <= 0)) return NextResponse.json({ error: "Informe um limite de milhas válido." }, { status: 400 });

  const { error } = await db.from("price_alerts").insert({
    name, whatsapp, email, origin, destination_scope: destinationScope, alert_mode: mode,
    max_cash_price: mode === "cash" ? payload.maxCashPrice : null,
    max_miles: mode === "miles" ? payload.maxMiles : null,
    enabled: true,
  });
  if (error) return NextResponse.json({ error: "Não foi possível salvar o alerta agora." }, { status: 500 });

  // Envia ao administrador a lista acumulada, não apenas o último cadastro.
  const { data: subscribers } = await db.from("price_alerts").select("name").eq("enabled", true).order("created_at", { ascending: true }).limit(100);
  await sendAdminWhatsApp((subscribers ?? []).map((item) => item.name));

  return NextResponse.json({ ok: true });
}
