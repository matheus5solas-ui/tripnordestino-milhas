"use client";

import { useEffect, useState } from "react";
import { Play } from "lucide-react";

type Video = { videoId: string; title: string; published: string; url: string; thumbnail: string };

export function YoutubeVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/youtube")
      .then((response) => response.json())
      .then((data) => setVideos(data.videos ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="youtube-section">
      <div className="youtube-heading">
        <div>
          <span className="eyebrow">ÚLTIMOS VÍDEOS</span>
          <h2>Vlogs, dicas e preços sem enrolação.</h2>
          <p>Os três vídeos mais recentes do canal aparecem aqui automaticamente.</p>
        </div>
      </div>
      {loading ? <div className="youtube-empty">Buscando os vídeos mais recentes…</div> : videos.length ? (
        <div className="youtube-grid">
          {videos.map((video) => (
            <a key={video.videoId} className="youtube-card" href={video.url} target="_blank" rel="noopener noreferrer">
              <div className="youtube-thumb">
                <img src={video.thumbnail} alt="" />
                <span><Play size={20} fill="currentColor" /></span>
              </div>
              <div className="youtube-card-copy">
                <small>{video.published ? new Date(video.published).toLocaleDateString("pt-BR") : "TripNordestinos"}</small>
                <h3>{video.title}</h3>
                <strong>Assistir no YouTube →</strong>
              </div>
            </a>
          ))}
        </div>
      ) : <div className="youtube-empty">Os vídeos não puderam ser carregados agora. <a href="https://www.youtube.com/@TripNordestinos" target="_blank" rel="noopener noreferrer">Abrir o canal →</a></div>}
    </section>
  );
}
