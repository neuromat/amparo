import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowLeft, Clock, BookOpen, FileText, Download, ExternalLink, Play } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import type { Estudo } from '@/types/content';

export function EstudoDetail() {
  const { id } = useParams<{ id: string }>();
  const [estudo, setEstudo] = useState<Estudo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(`${API_ENDPOINTS.conteudos.estudos}/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Estudo não encontrado');
        return res.json();
      })
      .then(data => {
        setEstudo(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao carregar estudo:', err);
        setError(true);
        setLoading(false);
      });
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getContentTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'html': 'Artigo',
      'pdf': 'Documento PDF',
      'video': 'Vídeo',
      'external_link': 'Link Externo'
    };
    return labels[type] || 'Conteúdo';
  };

  const getContentTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'html': 'bg-blue-100 text-blue-800 border-blue-200',
      'pdf': 'bg-red-100 text-red-800 border-red-200',
      'video': 'bg-purple-100 text-purple-800 border-purple-200',
      'external_link': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Carregando estudo...</p>
        </div>
      </div>
    );
  }

  if (error || !estudo) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Estudo não encontrado</h1>
          <Link to="/conteudos/estudos">
            <Button>Voltar para Estudos</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Back button */}
      <Link to="/conteudos/estudos">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar para Estudos
        </Button>
      </Link>

      {/* Título e Badges */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge className={`${getContentTypeColor(estudo.content_type)} border`}>
            {getContentTypeLabel(estudo.content_type)}
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 capitalize">
            {estudo.category}
          </Badge>
          {estudo.mockup && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              EXEMPLO
            </Badge>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
          {estudo.title}
        </h1>
        <p className="text-lg text-muted-foreground">
          {estudo.description}
        </p>
      </div>

      {/* Metadados */}
      <Card className="mb-8 border-2 border-[#E6E6FA]">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Autor</p>
                <p className="font-medium">{estudo.author}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Tempo de leitura</p>
                <p className="font-medium">{estudo.reading_time_minutes} minutos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Categoria</p>
                <p className="font-medium capitalize">{estudo.category}</p>
              </div>
            </div>
            {estudo.published_date && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Publicado em</p>
                  <p className="font-medium">{formatDate(estudo.published_date)}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo - Tipo HTML */}
      {estudo.content_type === 'html' && estudo.body && (
        <Card className="mb-8 border-2 border-[#E6E6FA]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Conteúdo Completo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-slate max-w-none prose-headings:text-primary prose-h2:text-2xl prose-h3:text-xl prose-p:text-muted-foreground prose-li:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: estudo.body }}
            />
          </CardContent>
        </Card>
      )}

      {/* Conteúdo - Tipo PDF */}
      {estudo.content_type === 'pdf' && (
        <Card className="mb-8 border-2 border-[#E6E6FA]">
          <CardHeader className="bg-gradient-to-r from-red-50 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-700" />
              Documento PDF
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {estudo.body && (
              <div
                className="prose prose-slate max-w-none mb-6 prose-p:text-muted-foreground prose-li:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: estudo.body }}
              />
            )}
            {estudo.pdf_file ? (
              <div className="bg-muted/30 border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Documento PDF Disponível</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Arquivo: <code className="bg-muted px-2 py-1 rounded text-xs">{estudo.pdf_file}</code>
                </p>
                <Button className="gap-2" disabled>
                  <Download className="w-4 h-4" />
                  Baixar PDF
                  <span className="text-xs ml-2">(link mockup)</span>
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Este é um dado de exemplo. Em produção, o download real estará disponível.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Arquivo PDF não disponível.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Conteúdo - Tipo Vídeo */}
      {estudo.content_type === 'video' && estudo.external_link && (
        <Card className="mb-8 border-2 border-[#E6E6FA] overflow-hidden">
          <CardContent className="p-0">
            {(() => {
              const embedUrl = getYouTubeEmbedUrl(estudo.external_link!);
              return embedUrl ? (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={embedUrl}
                    title={estudo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Play className="w-16 h-16 mx-auto mb-4" />
                  <a href={estudo.external_link!} target="_blank" rel="noopener noreferrer">
                    <Button className="gap-2">
                      <Play className="w-4 h-4" />
                      Assistir Vídeo
                    </Button>
                  </a>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Conteúdo - Tipo Link Externo */}
      {estudo.content_type === 'external_link' && (
        <Card className="mb-8 border-2 border-[#E6E6FA]">
          <CardHeader className="bg-gradient-to-r from-green-50 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-green-700" />
              Artigo Externo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {estudo.body && (
              <div
                className="prose prose-slate max-w-none mb-6 prose-p:text-muted-foreground prose-li:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: estudo.body }}
              />
            )}
            {estudo.external_link ? (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8 text-center">
                <ExternalLink className="w-16 h-16 mx-auto mb-4 text-green-700" />
                <h3 className="text-lg font-semibold mb-2">Acesse o Artigo Completo</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  O conteúdo completo está disponível no link externo abaixo
                </p>
                <a href={estudo.external_link} target="_blank" rel="noopener noreferrer">
                  <Button className="gap-2 bg-green-700 hover:bg-green-800">
                    <ExternalLink className="w-4 h-4" />
                    Acessar Artigo
                  </Button>
                </a>
                <p className="text-xs text-muted-foreground mt-4">
                  Link: <code className="bg-muted px-2 py-1 rounded text-xs">{estudo.external_link}</code>
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Link externo não disponível.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {estudo.tags && estudo.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {estudo.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
