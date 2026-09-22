import fs from "node:fs/promises";

const SOURCES = [
  { id: "latam", name: "LATAM Pass", url: "https://latampass.latam.com/pt_br/ofertas" },
  { id: "smiles", name: "Smiles", url: "https://www.smiles.com.br/portal/campanhas" },
  { id: "azul", name: "Azul Fidelidade", url: "https://passagens.voeazul.com.br/pt/buscador-de-pontos" },
  { id: "livelo", name: "Livelo", url: "https://www.livelo.com.br/ganhe-pontos" },
  { id: "esfera", name: "Esfera", url: "https://www.esfera.com.vc/transfira-pontos-esfera" },
  { id: "iberia", name: "Iberia Club", url: "https://www.iberia.com/br/iberia-club/" },
  { id: "tap", name: "TAP Miles&Go", url: "https://www.flytap.com/pt-br/miles-and-go/promocoes" },
];

const previousPath = new URL("../src/data/miles-radar.json", import.meta.url);
const candidatesPath = new URL("../src/data/miles-candidates.json", import.meta.url);
let previous = { sources: [] };
try { previous = JSON.parse(await fs.readFile(previousPath, "utf8")); } catch {}

function textOnly(html) {
  return html
    .replace(/<script[\\s\\S]*?<\\/script>/gi, " ")
    .replace(/<style[\\s\\S]*?<\\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#x27;|&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\\s+/g, " ")
    .trim();
}

function extractCandidates(source, text) {
  const normalized = text.replace(/\s+/g, " ").trim();
  const keyword = /(b[oô]nus|milhas|avios|transfer|promo[cç][aã]o|oferta|desconto)/i;
  const date = /(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\s+de\s+[a-zç]+(?:\s+de\s+\d{4})?)/i;
  const percent = /\b\d{1,3}%/;
  const candidates = [];
  for (const match of normalized.matchAll(/.{0,180}(?:b[oô]nus|milhas|avios|transfer[^ ]*|promo[cç][aã]o|oferta|desconto).{0,320}/gi)) {
    const excerpt = match[0].trim();
    if (!keyword.test(excerpt)) continue;
    const hasDate = date.test(excerpt);
    const hasBenefit = percent.test(excerpt) || /\b\d[\d.]*\s*(?:milhas|avios|pontos)\b/i.test(excerpt);
    if (!hasDate || !hasBenefit) continue;
    candidates.push({
      sourceId: source.id,
      program: source.name,
      sourceUrl: source.url,
      excerpt: excerpt.slice(0, 600),
      detectedAt: checkedAt,
      status: "candidate",
      publishable: false,
      reason: "Requer validação de regulamento, validade e elegibilidade antes da publicação."
    });
    if (candidates.length >= 12) break;
  }
  return candidates;
}

function signature(text) {
  const normalized = text.toLowerCase();
  const terms = ["bônus", "bonus", "milhas", "avios", "transfer", "promo", "oferta", "livelo", "esfera", "smiles", "azul"];
  const chunks = [];
  for (const term of terms) {
    let from = 0;
    while ((from = normalized.indexOf(term, from)) !== -1 && chunks.length < 80) {
      chunks.push(normalized.slice(Math.max(0, from - 100), Math.min(normalized.length, from + 220)));
      from += term.length;
    }
  }
  return chunks.join("\n").slice(0, 18000);
}

const checkedAt = new Date().toISOString();
const sources = [];
const candidates = [];

for (const source of SOURCES) {
  const old = previous.sources?.find((item) => item.id === source.id);
  try {
    const response = await fetch(source.url, {
      headers: { "user-agent": "TripNordestinos/1.0 (+https://tripnordestinos.com.br)" },
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const plainText = textOnly(html);
    const sig = signature(plainText);
    candidates.push(...extractCandidates(source, plainText));
    sources.push({
      ...source,
      ok: true,
      checkedAt,
      changedAt: old?.signature && old.signature !== sig ? checkedAt : (old?.changedAt || checkedAt),
      signature: sig,
    });
  } catch (error) {
    sources.push({
      ...source,
      ok: false,
      checkedAt,
      changedAt: old?.changedAt || null,
      signature: old?.signature || "",
      error: String(error?.message || error),
    });
  }
}

await fs.writeFile(previousPath, JSON.stringify({ checkedAt, sources }, null, 2) + "\n");
await fs.writeFile(candidatesPath, JSON.stringify({ checkedAt, candidates }, null, 2) + "\n");
console.log(`Radar verificado em ${checkedAt}: ${sources.filter(s => s.ok).length}/${sources.length} fontes acessíveis; ${candidates.length} candidatos aguardando validação.`);
