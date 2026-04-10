import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Play, Dumbbell, BookOpen, FileText, Calendar, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

interface SearchResult {
  id: number;
  type: 'palestra' | 'exercicio' | 'estudo' | 'cartilha';
  title: string;
  subtitle: string;
  date: string | null;
  link: string;
}

const TYPE_CONFIG = {
  palestra: { label: 'Palestra', icon: Play, color: 'bg-blue-100 text-blue-800' },
  exercicio: { label: 'Exercício', icon: Dumbbell, color: 'bg-green-100 text-green-800' },
  estudo: { label: 'Pesquisa', icon: BookOpen, color: 'bg-purple-100 text-purple-800' },
  cartilha: { label: 'Cartilha', icon: FileText, color: 'bg-orange-100 text-orange-800' },
};

type ContentType = 'all' | 'palestra' | 'exercicio' | 'estudo' | 'cartilha';

const FILTER_OPTIONS: { value: ContentType; label: string; icon: typeof Play }[] = [
  { value: 'all', label: 'Todos', icon: Search },
  { value: 'palestra', label: 'Palestras', icon: Play },
  { value: 'exercicio', label: 'Exercícios', icon: Dumbbell },
  { value: 'estudo', label: 'Pesquisas', icon: BookOpen },
  { value: 'cartilha', label: 'Cartilhas', icon: FileText },
];

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [allResults, setAllResults] = useState<SearchResult[]>([]);
  const [activeFilter, setActiveFilter] = useState<ContentType>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setAllResults([]);
      return;
    }

    setLoading(true);
    setActiveFilter('all');
    fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        setAllResults(data.results || []);
      })
      .catch(err => console.error('Erro na busca:', err))
      .finally(() => setLoading(false));
  }, [query]);

  const filteredResults = activeFilter === 'all'
    ? allResults
    : allResults.filter(r => r.type === activeFilter);

  const total = filteredResults.length;

  // Contagem por tipo para mostrar nos botões
  const counts = allResults.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-primary">
          Resultados da Busca
        </h1>
        {query && (
          <div className="flex items-center justify-center gap-2 text-primary">
            <Search className="w-5 h-5" />
            <p className="text-lg font-medium">"{query}"</p>
          </div>
        )}
        {!loading && (
          <p className="text-sm text-muted-foreground">
            {total} resultado{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Filtros por tipo */}
      {!loading && allResults.length > 0 && (
        <div className="mb-8 flex justify-center gap-3 flex-wrap">
          {FILTER_OPTIONS.map(({ value, label, icon: Icon }) => {
            const count = value === 'all' ? allResults.length : (counts[value] || 0);
            if (value !== 'all' && count === 0) return null;
            return (
              <Button
                key={value}
                variant={activeFilter === value ? 'default' : 'outline'}
                onClick={() => setActiveFilter(value)}
                className={`gap-2 ${activeFilter === value ? 'bg-primary' : 'border-2 border-[#E6E6FA]'}`}
              >
                <Icon className="w-4 h-4" />
                {label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeFilter === value ? 'bg-white/20' : 'bg-[#E6E6FA]'
                }`}>
                  {count}
                </span>
              </Button>
            );
          })}
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Buscando...</p>
        </div>
      )}

      {!loading && filteredResults.length > 0 && (
        <div className="max-w-3xl mx-auto space-y-4">
          {filteredResults.map((result) => {
            const config = TYPE_CONFIG[result.type];
            const Icon = config.icon;

            return (
              <Card key={`${result.type}-${result.id}`} className="hover:shadow-lg transition-shadow border-l-4 border-l-[#A8DADC]">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${config.color} border-0 gap-1`}>
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </Badge>
                        {result.date && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(result.date)}
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg leading-tight">
                        {result.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  {result.subtitle && (
                    <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                      {result.subtitle}
                    </p>
                  )}
                  <Link to={result.link} className="flex-shrink-0 ml-4">
                    <Button size="sm" className="gap-1">
                      Ver
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && query && filteredResults.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-primary mb-2">
            Nenhum resultado encontrado
          </h3>
          <p className="text-muted-foreground mb-6">
            Tente buscar por outros termos
          </p>
          <Link to="/">
            <Button variant="outline">Voltar ao início</Button>
          </Link>
        </div>
      )}

      {!loading && !query && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-primary mb-2">
            Digite um termo para buscar
          </h3>
          <p className="text-muted-foreground">
            Busque em palestras, exercícios, pesquisas e cartilhas
          </p>
        </div>
      )}
    </div>
  );
}
