import { NextResponse } from "next/server";

const CHANNEL_HANDLE = "@TripNordestinos";

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export async function GET() {
  try {
    const channelPage = await fetch(`https://www.youtube.com/${CHANNEL_HANDLE}`, {
      next: { revalidate: 900 },
      headers: { "User-Agent": "Mozilla/5.0 TripNordestinos/1.0" },
    });

    const html = await channelPage.text();
    const channelId =
      html.match(/"channelId":"(UC[^"]+)"/)?.[1] ??
      html.match(/youtube\.com\/channel\/(UC[\w-]+)/)?.[1];

    if (!channelId) {
      throw new Error("Canal do YouTube não encontrado");
    }

    const feed = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      { next: { revalidate: 900 } },
    );

    if (!feed.ok) {
      throw new Error("Feed do YouTube indisponível");
    }

    const xml = await feed.text();

    const videos = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
      .slice(0, 3)
      .map((match) => {
        const entry = match[1];
        const videoId = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1] ?? "";
        const title = decodeXml(
          entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] ??
            "Vídeo TripNordestinos",
        );
        const published = entry.match(/<published>(.*?)<\/published>/)?.[1] ?? "";

        return {
          videoId,
          title,
          published,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        };
      })
      .filter((video) => video.videoId);

    return NextResponse.json({
      videos,
      channelUrl: `https://www.youtube.com/${CHANNEL_HANDLE}`,
    });
  } catch {
    return NextResponse.json(
      {
        videos: [],
        channelUrl: `https://www.youtube.com/${CHANNEL_HANDLE}`,
        error: "Não foi possível atualizar os vídeos agora.",
      },
      { status: 200 },
    );
  }
}
