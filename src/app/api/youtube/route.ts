import { NextResponse } from "next/server";

const CHANNEL_HANDLE = "@TripNordestinos";
const CHANNEL_URL = `https://www.youtube.com/${CHANNEL_HANDLE}`;
const VIDEOS_URL = `${CHANNEL_URL}/videos`;
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/152 Safari/537.36";

type Video = {
  videoId: string;
  title: string;
  published: string;
  url: string;
  thumbnail: string;
};

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function getVideoMeta(videoId: string) {
  let title = "Vídeo TripNordestinos";
  let durationSeconds = 0;

  try {
    const [oembedResponse, watchResponse] = await Promise.all([
      fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`,
        { next: { revalidate: 900 } },
      ),
      fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        next: { revalidate: 900 },
        headers: { "User-Agent": USER_AGENT, "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8" },
      }),
    ]);

    if (oembedResponse.ok) {
      const data = (await oembedResponse.json()) as { title?: string };
      title = data.title ?? title;
    }

    if (watchResponse.ok) {
      const html = await watchResponse.text();
      durationSeconds = Number(html.match(/"lengthSeconds":"(\d+)"/)?.[1] ?? 0);
    }
  } catch {
    // Mantém os valores padrão e deixa o fallback decidir.
  }

  return { title, durationSeconds };
}

function makeVideo(videoId: string, title: string, published = ""): Video {
  return {
    videoId,
    title,
    published,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  };
}

async function fromVideosTab(): Promise<Video[]> {
  const response = await fetch(VIDEOS_URL, {
    cache: "no-store",
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    },
  });

  if (!response.ok) return [];
  const html = await response.text();

  // A estrutura do YouTube muda com frequência. Em vez de depender de um renderer específico,
  // capturamos os IDs na ordem em que aparecem na aba /videos e removemos duplicados.
  const ids = [...html.matchAll(/"videoId":"([A-Za-z0-9_-]{11})"/g)].map((match) => match[1]);
  const uniqueIds = [...new Set(ids)].slice(0, 8);
  if (!uniqueIds.length) return [];

  const candidates = await Promise.all(
    uniqueIds.map(async (videoId) => {
      const meta = await getVideoMeta(videoId);
      return { videoId, ...meta };
    }),
  );

  // Os vlogs do canal são vídeos longos. Filtrar por duração evita Shorts mesmo se o YouTube
  // misturar algum deles na resposta da aba /videos.
  return candidates
    .filter((video) => video.durationSeconds === 0 || video.durationSeconds > 180)
    .slice(0, 3)
    .map((video) => makeVideo(video.videoId, video.title));
}

async function fromRssFallback(): Promise<Video[]> {
  const channelPage = await fetch(CHANNEL_URL, {
    cache: "no-store",
    headers: { "User-Agent": USER_AGENT, "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8" },
  });
  if (!channelPage.ok) return [];

  const channelHtml = await channelPage.text();
  const channelId =
    channelHtml.match(/"channelId":"(UC[^"]+)"/)?.[1] ??
    channelHtml.match(/youtube\.com\/channel\/(UC[\w-]+)/)?.[1];
  if (!channelId) return [];

  const feed = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, {
    cache: "no-store",
    headers: { "User-Agent": USER_AGENT },
  });
  if (!feed.ok) return [];

  const xml = await feed.text();
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, 15);
  const candidates = await Promise.all(
    entries.map(async (match) => {
      const entry = match[1];
      const videoId = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1] ?? "";
      const rssTitle = decodeXml(entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "Vídeo TripNordestinos");
      const published = entry.match(/<published>(.*?)<\/published>/)?.[1] ?? "";
      const meta = videoId ? await getVideoMeta(videoId) : { title: rssTitle, durationSeconds: 0 };
      return { videoId, title: meta.title || rssTitle, published, durationSeconds: meta.durationSeconds };
    }),
  );

  return candidates
    .filter((video) => video.videoId && video.durationSeconds > 180)
    .slice(0, 3)
    .map((video) => makeVideo(video.videoId, video.title, video.published));
}

export async function GET() {
  try {
    let videos = await fromVideosTab();
    if (videos.length < 3) {
      videos = await fromRssFallback();
    }

    return NextResponse.json(
      {
        videos,
        channelUrl: CHANNEL_URL,
        source: videos.length ? "youtube" : "unavailable",
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
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
