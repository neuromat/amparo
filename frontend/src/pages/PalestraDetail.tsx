import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User, Building2, ArrowLeft } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

interface Video {
  id: number;
  video: string;
}

interface Palestra {
  id: number;
  title: string;
  speaker: string;
  moderator: string;
  date_time: string;
  affiliation: string;
  resume_speaker: string;
  body: string;
  videos: Video[];
}

export function PalestraDetail() {
  const { id } = useParams<{ id: string }>();
  const [palestra, setPalestra] = useState<Palestra | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(`${API_ENDPOINTS.palestras}/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Palestra não encontrada');
        return res.json();
      })
      .then(data => {
        setPalestra(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao carregar palestra:', err);
        setError(true);
        setLoading(false);
      });
  }, [id]);

  const getYouTubeEmbedUrl = (url: string) => {
    // Converte URLs do YouTube para formato embed
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Carregando palestra...</p>
        </div>
      </div>
    );
  }

  if (error || !palestra) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Palestra não encontrada</h1>
          <Link to="/blog">
            <Button>Voltar para Palestras</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Back button */}
      <Link to="/blog">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar para Palestras
        </Button>
      </Link>

      {/* Title and metadata */}
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-primary leading-tight">
          {palestra.title}
        </h1>

        <div className="flex flex-wrap gap-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{formatDate(palestra.date_time)}</span>
          </div>

          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">{palestra.speaker}</span>
          </div>

          {palestra.affiliation && (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="text-sm">{palestra.affiliation}</span>
            </div>
          )}
        </div>

        {palestra.moderator && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Moderador:</span> {palestra.moderator}
          </p>
        )}
      </div>

      {/* Video player */}
      {palestra.videos.length > 0 && (
        <Card className="mb-8 overflow-hidden">
          <CardContent className="p-0">
            {palestra.videos.map((video, index) => {
              const embedUrl = getYouTubeEmbedUrl(video.video);
              return embedUrl ? (
                <div key={video.id} className={index > 0 ? 'mt-4' : ''}>
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={embedUrl}
                      title={`${palestra.title} - Vídeo ${index + 1}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : (
                <div key={video.id} className="p-4 text-center text-muted-foreground">
                  Vídeo não disponível
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Speaker bio */}
      {palestra.resume_speaker && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="w-5 h-5" />
              Sobre o Palestrante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {palestra.resume_speaker}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Body content */}
      {palestra.body && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: palestra.body }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
