import { NextRequest, NextResponse } from "next/server";

const PRODUCTION_HOST = "tripnordestino-milhas.vercel.app";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] ?? "";

  // URLs de deployment da Vercel são imutáveis e podem continuar mostrando versões antigas.
  // Sempre que alguém abrir uma dessas URLs, redirecionamos para o alias estável de produção.
  if (
    host.endsWith(".vercel.app") &&
    host !== PRODUCTION_HOST &&
    host.startsWith("tripnordestino-milhas-")
  ) {
    const url = request.nextUrl.clone();
    url.protocol = "https";
    url.host = PRODUCTION_HOST;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
