import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, BookOpen, ChevronLeft, ChevronRight, FileText, Link as LinkIcon, Clock, Play } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import type { EstudosResponse } from '@/types/content';

export function EstudosList() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [data, setData] = useState<EstudosResponse | null>(null);
  const [filteredData, setFilteredData] = useState<EstudosResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_ENDPOINTS.conteudos.estudos}?page=1&per_page=100`)
      .then(res => res.json())
      .then(responseData => {
        setData(responseData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao carregar estudos:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!data) return;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = data.estudos.filter(estudo =>
        estudo.title.toLowerCase().includes(query) ||
        estudo.author?.toLowerCase().includes(query) ||
        estudo.category?.toLowerCase().includes(query)
      );

      const per_page = 12;
      const start = (page - 1) * per_page;
      const end = start + per_page;

      setFilteredData({
        estudos: filtered.slice(start, end),
        total: filtered.length,
        page: page,
        per_page: per_page,
        total_pages: Math.ceil(filtered.length / per_page)
      });
    } else {
      const per_page = 12;
      const start = (page - 1) * per_page;
      const end = start + per_page;

      setFilteredData({
        estudos: data.estudos.slice(start, end),
        total: data.total,
        page: page,
        per_page: per_page,
        total_pages: Math.ceil(data.total / per_page)
      });
    }
  }, [data, searchQuery, page]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'html':
        return <BookOpen className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'video':
        return <Play className="w-4 h-4" />;
      case 'external_link':
        return <LinkIcon className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getContentTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'html': 'Artigo',
      'pdf': 'PDF',
      'video': 'Vídeo',
      'external_link': 'Link Externo'
    };
    return labels[type] || 'Conteúdo';
  };

  const getContentTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'html': 'bg-blue-100 text-blue-800',
      'pdf': 'bg-red-100 text-red-800',
      'video': 'bg-purple-100 text-purple-800',
      'external_link': 'bg-green-100 text-green-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Carregando estudos...</p>
        </div>
      </div>
    );
  }

  const displayData = filteredData || data;

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12 text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BookOpen className="w-10 h-10 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold text-primary">
            Pesquisas
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Artigos científicos, guias práticos e estudos sobre Doença de Parkinson
        </p>
        {searchQuery && (
          <p className="text-sm text-muted-foreground">
            Resultados para: <strong>"{searchQuery}"</strong>
          </p>
        )}
      </div>

      {/* Grid de Estudos */}
      {displayData && displayData.estudos.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {displayData.estudos.map((estudo) => (
              <Card key={estudo.id} className="hover:shadow-lg transition-shadow border-2 border-[#E6E6FA] overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-white via-[#FFF8F0] to-[#E6E6FA]/20">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge className={`${getContentTypeColor(estudo.content_type)} border-0 flex items-center gap-1`}>
                      {getContentTypeIcon(estudo.content_type)}
                      {getContentTypeLabel(estudo.content_type)}
                    </Badge>
                    {estudo.mockup && (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        EXEMPLO
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl line-clamp-2 min-h-[3.5rem]">
                    {estudo.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="line-clamp-1">{estudo.author}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{estudo.reading_time_minutes} min de leitura</span>
                    </div>
                    {estudo.published_date && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{formatDate(estudo.published_date)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 line-clamp-3">
                    {estudo.description}
                  </p>
                  {/* Tags */}
                  {estudo.tags && estudo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {estudo.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-gradient-to-br from-[#E6E6FA]/10 to-transparent">
                  <Link to={`/conteudos/estudos/${estudo.id}`} className="w-full">
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      {estudo.content_type === 'video' ? (
                        <><Play className="w-4 h-4 mr-2" />Ver Vídeo</>
                      ) : (
                        <><BookOpen className="w-4 h-4 mr-2" />Ler Estudo</>
                      )}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Paginação */}
          {displayData.total_pages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-2 border-[#E6E6FA]"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {displayData.page} de {displayData.total_pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(displayData.total_pages, p + 1))}
                disabled={page === displayData.total_pages}
                className="border-2 border-[#E6E6FA]"
              >
                Próxima
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">Nenhum estudo encontrado</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? 'Tente ajustar sua busca ou limpar os filtros.'
              : 'Ainda não há estudos disponíveis.'}
          </p>
          {searchQuery && (
            <Link to="/conteudos/estudos">
              <Button variant="outline">Limpar busca</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
