import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { YoutubeVideos } from "@/components/YoutubeVideos";

export default function YoutubePage() {
  return (
    <main>
      <div className="youtube-hero">
        <Header />
        <div className="youtube-intro">
          <span className="eyebrow">TRIPNORDESTINOS NO YOUTUBE</span>
          <h1>Viaje com a gente, <em>de verdade.</em></h1>
          <p>Nosso canal mostra vlogs reais e descontraídos dos lugares por onde viajamos, com dicas, experiências e preços para ajudar você a planejar a próxima viagem.</p>
          <a href="https://www.youtube.com/@TripNordestinos" target="_blank" rel="noopener noreferrer" className="youtube-channel-link">Conhecer o canal no YouTube →</a>
        </div>
      </div>
      <YoutubeVideos />
      <Footer />
    </main>
  );
}
