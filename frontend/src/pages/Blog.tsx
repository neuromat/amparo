import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Play, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

interface Palestra {
  id: number;
  title: string;
  speaker: string;
  date_time: string;
  affiliation: string;
  resume_speaker: string;
  subcategory?: string;
  videos: Array<{ id: number; video: string }>;
}

interface PalestrasResponse {
  palestras: Palestra[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const subcategoryParam = searchParams.get('subcategory') || 'all';
  const [data, setData] = useState<PalestrasResponse | null>(null);
  const [filteredData, setFilteredData] = useState<PalestrasResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeSubcategory, setActiveSubcategory] = useState<string>(subcategoryParam);

  useEffect(() => {
    setLoading(true);
    // Carrega todas as palestras para permitir busca client-side
    const subcategoryQuery = activeSubcategory !== 'all' ? `&subcategory=${activeSubcategory}` : '';
    fetch(`${API_ENDPOINTS.palestras}?page=1&per_page=100${subcategoryQuery}`)
      .then(res => res.json())
      .then(responseData => {
        setData(responseData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao carregar palestras:', err);
        setLoading(false);
      });
  }, [activeSubcategory]);

  // Filtrar palestras quando há busca
  useEffect(() => {
    if (!data) return;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = data.palestras.filter(palestra =>
        palestra.title.toLowerCase().includes(query) ||
        palestra.speaker.toLowerCase().includes(query) ||
        palestra.affiliation?.toLowerCase().includes(query)
      );

      // Paginar os resultados filtrados
      const per_page = 12;
      const start = (page - 1) * per_page;
      const end = start + per_page;

      setFilteredData({
        palestras: filtered.slice(start, end),
        total: filtered.length,
        page: page,
        per_page: per_page,
        total_pages: Math.ceil(filtered.length / per_page)
      });
    } else {
      // Sem busca, aplicar paginação normal
      const per_page = 12;
      const start = (page - 1) * per_page;
      const end = start + per_page;

      setFilteredData({
        palestras: data.palestras.slice(start, end),
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Carregando palestras...</p>
        </div>
      </div>
    );
  }

  const displayData = filteredData || data;

  const handleSubcategoryChange = (subcategory: string) => {
    setActiveSubcategory(subcategory);
    setPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12 text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-primary">
          Palestras e Depoimentos
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Conteúdo educacional ministrado por profissionais experientes sobre temas
          importantes relacionados à Doença de Parkinson
        </p>
        {displayData && (
          <div className="space-y-2">
            {searchQuery && (
              <div className="flex items-center justify-center gap-2 text-primary">
                <Search className="w-4 h-4" />
                <p className="text-sm font-medium">
                  Resultados para: "{searchQuery}"
                </p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              {displayData.total} palestra{displayData.total !== 1 ? 's' : ''} {searchQuery ? 'encontrada' + (displayData.total !== 1 ? 's' : '') : 'disponíveis'}
            </p>
          </div>
        )}
      </div>

      {/* Subcategory Navigation */}
      <div className="mb-8 flex justify-center gap-4 flex-wrap">
        <Button
          variant={activeSubcategory === 'all' ? 'default' : 'outline'}
          onClick={() => handleSubcategoryChange('all')}
          className={activeSubcategory === 'all' ? 'bg-primary' : 'border-2 border-[#E6E6FA]'}
        >
          Todos
        </Button>
        <Button
          variant={activeSubcategory === 'palestras' ? 'default' : 'outline'}
          onClick={() => handleSubcategoryChange('palestras')}
          className={activeSubcategory === 'palestras' ? 'bg-primary' : 'border-2 border-[#E6E6FA]'}
        >
          Palestras
        </Button>
        <Button
          variant={activeSubcategory === 'depoimentos' ? 'default' : 'outline'}
          onClick={() => handleSubcategoryChange('depoimentos')}
          className={activeSubcategory === 'depoimentos' ? 'bg-primary' : 'border-2 border-[#E6E6FA]'}
        >
          Minha História com Parkinson
        </Button>
      </div>

      {/* Grid de Palestras */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {displayData?.palestras.map((palestra) => (
          <Card key={palestra.id} className="flex flex-col hover:shadow-lg transition-shadow border-t-4 border-t-[#FFE5D4]">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(palestra.date_time)}</span>
              </div>
              <CardTitle className="line-clamp-2 text-lg leading-tight">
                {palestra.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">{palestra.speaker}</p>
                    {palestra.affiliation && (
                      <p className="text-muted-foreground text-xs mt-0.5">
                        {palestra.affiliation}
                      </p>
                    )}
                  </div>
                </div>

                {palestra.videos.length > 0 && (
                  <Badge className="gap-1 bg-[#A8DADC] hover:bg-[#A8DADC]/90 text-white border-0">
                    <Play className="w-3 h-3" />
                    Vídeo disponível
                  </Badge>
                )}
              </div>
            </CardContent>

            <CardFooter>
              <Link to={`/conteudos/palestras/${palestra.id}`} className="w-full">
                <Button className="w-full gap-2">
                  <Play className="w-4 h-4" />
                  Ver Palestra
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Paginação */}
      {displayData && displayData.total_pages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          <div className="text-sm text-muted-foreground">
            Página {page} de {displayData.total_pages}
          </div>

          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(displayData.total_pages, p + 1))}
            disabled={page === displayData.total_pages}
            className="gap-2"
          >
            Próxima
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Mensagem quando não há resultados */}
      {displayData && displayData.palestras.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-primary mb-2">
            Nenhuma palestra encontrada
          </h3>
          <p className="text-muted-foreground">
            Tente buscar por outros termos
          </p>
          <Link to="/blog">
            <Button variant="outline" className="mt-4">
              Ver todas as palestras
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
