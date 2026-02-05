import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText, ChevronLeft, ChevronRight, Download, Building2 } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import type { Cartilha, CartilhasResponse } from '@/types/content';

export function CartilhasList() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [data, setData] = useState<CartilhasResponse | null>(null);
  const [filteredData, setFilteredData] = useState<CartilhasResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_ENDPOINTS.conteudos.cartilhas}?page=1&per_page=100`)
      .then(res => res.json())
      .then(responseData => {
        setData(responseData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao carregar cartilhas:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!data) return;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = data.cartilhas.filter(cartilha =>
        cartilha.title.toLowerCase().includes(query) ||
        cartilha.speaker?.toLowerCase().includes(query) ||
        cartilha.affiliation?.toLowerCase().includes(query)
      );

      const per_page = 12;
      const start = (page - 1) * per_page;
      const end = start + per_page;

      setFilteredData({
        cartilhas: filtered.slice(start, end),
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
        cartilhas: data.cartilhas.slice(start, end),
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
          <p className="text-muted-foreground">Carregando cartilhas...</p>
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
          <FileText className="w-10 h-10 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold text-primary">
            Cartilhas
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Material educativo em PDF para download
        </p>
        {searchQuery && (
          <p className="text-sm text-muted-foreground">
            Resultados para: <strong>"{searchQuery}"</strong>
          </p>
        )}
      </div>

      {/* Grid de Cartilhas */}
      {displayData && displayData.cartilhas.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {displayData.cartilhas.map((cartilha) => (
              <Card key={cartilha.id} className="hover:shadow-lg transition-shadow border-2 border-[#E6E6FA] overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-white via-[#FFF8F0] to-[#E6E6FA]/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-red-100 text-red-800 border-0">
                      <FileText className="w-3 h-3 mr-1" />
                      PDF
                    </Badge>
                  </div>
                  <CardTitle className="text-xl line-clamp-2 min-h-[3.5rem]">
                    {cartilha.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {cartilha.speaker && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="line-clamp-1">{cartilha.speaker}</span>
                      </div>
                    )}
                    {cartilha.affiliation && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="line-clamp-2">{cartilha.affiliation}</span>
                      </div>
                    )}
                    {cartilha.published_date && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{formatDate(cartilha.published_date)}</span>
                      </div>
                    )}
                  </div>
                  {cartilha.pdf_file && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-md">
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <Download className="w-3 h-3" />
                        <code className="text-xs">{cartilha.pdf_file.split('/').pop()}</code>
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-gradient-to-br from-[#E6E6FA]/10 to-transparent">
                  <Link to={`/conteudos/cartilhas/${cartilha.id}`} className="w-full">
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      <FileText className="w-4 h-4 mr-2" />
                      Ver Cartilha
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
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">Nenhuma cartilha encontrada</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? 'Tente ajustar sua busca ou limpar os filtros.'
              : 'Ainda não há cartilhas disponíveis.'}
          </p>
          {searchQuery && (
            <Link to="/conteudos/cartilhas">
              <Button variant="outline">Limpar busca</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
