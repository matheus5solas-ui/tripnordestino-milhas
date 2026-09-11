import { NextResponse } from "next/server";

const CHANNEL_HANDLE = "@TripNordestinos";
const CHANNEL_URL = `https://www.youtube.com/${CHANNEL_HANDLE}`;
const VIDEOS_URL = `${CHANNEL_URL}/videos`;

async function getVideoTitle(videoId: string) {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`,
      { next: { revalidate: 900 } },
    );

    if (!response.ok) return "Vídeo TripNordestinos";
    const data = (await response.json()) as { title?: string };
    return data.title ?? "Vídeo TripNordestinos";
  } catch {
    return "Vídeo TripNordestinos";
  }
}

export async function GET() {
  try {
    // A aba /videos do canal contém apenas vídeos tradicionais; a página inicial/feed
    // também mistura Shorts, por isso não usamos mais o RSS geral do canal.
    const page = await fetch(VIDEOS_URL, {
      next: { revalidate: 900 },
      headers: {
        "User-Agent": "Mozilla/5.0 TripNordestinos/1.0",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
    });

    if (!page.ok) {
      throw new Error("Aba de vídeos do YouTube indisponível");
    }

    const html = await page.text();
    const matches = [
      ...html.matchAll(/"videoRenderer":\{"videoId":"([A-Za-z0-9_-]{11})"/g),
      ...html.matchAll(/"gridVideoRenderer":\{"videoId":"([A-Za-z0-9_-]{11})"/g),
    ].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

    const videoIds = [...new Set(matches.map((match) => match[1]))].slice(0, 3);

    if (!videoIds.length) {
      throw new Error("Nenhum vídeo tradicional encontrado");
    }

    const videos = await Promise.all(
      videoIds.map(async (videoId) => ({
        videoId,
        title: await getVideoTitle(videoId),
        published: "",
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      })),
    );

    return NextResponse.json({
      videos,
      channelUrl: CHANNEL_URL,
    });
  } catch {
    return NextResponse.json(
      {
        videos: [],
        channelUrl: CHANNEL_URL,
        error: "Não foi possível atualizar os vídeos agora.",
      },
      { status: 200 },
    );
  }
}
