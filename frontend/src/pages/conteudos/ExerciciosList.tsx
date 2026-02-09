import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Dumbbell, ChevronLeft, ChevronRight, Clock, Award } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import type { ExerciciosResponse } from '@/types/content';

export function ExerciciosList() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const subcategoryParam = searchParams.get('subcategory') || 'all';
  const [data, setData] = useState<ExerciciosResponse | null>(null);
  const [filteredData, setFilteredData] = useState<ExerciciosResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeSubcategory, setActiveSubcategory] = useState<string>(subcategoryParam);

  useEffect(() => {
    setLoading(true);
    const subcategoryQuery = activeSubcategory !== 'all' ? `&subcategory=${activeSubcategory}` : '';
    fetch(`${API_ENDPOINTS.conteudos.exercicios}?page=1&per_page=100${subcategoryQuery}`)
      .then(res => res.json())
      .then(responseData => {
        setData(responseData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao carregar exercícios:', err);
        setLoading(false);
      });
  }, [activeSubcategory]);

  useEffect(() => {
    if (!data) return;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = data.exercicios.filter(exercicio =>
        exercicio.title.toLowerCase().includes(query) ||
        exercicio.instructor?.toLowerCase().includes(query) ||
        exercicio.category?.toLowerCase().includes(query) ||
        exercicio.difficulty_level?.toLowerCase().includes(query)
      );

      const per_page = 12;
      const start = (page - 1) * per_page;
      const end = start + per_page;

      setFilteredData({
        exercicios: filtered.slice(start, end),
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
        exercicios: data.exercicios.slice(start, end),
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

  const getDifficultyColor = (level: string) => {
    const colors: { [key: string]: string } = {
      'iniciante': 'bg-green-100 text-green-800',
      'intermediário': 'bg-yellow-100 text-yellow-800',
      'avançado': 'bg-red-100 text-red-800',
      'todos os níveis': 'bg-blue-100 text-blue-800'
    };
    return colors[level.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Carregando exercícios...</p>
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
        <div className="flex items-center justify-center gap-3 mb-4">
          <Dumbbell className="w-10 h-10 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold text-primary">
            Exercícios
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Vídeos com exercícios práticos e seguros para melhorar sua qualidade de vida
        </p>
        {searchQuery && (
          <p className="text-sm text-muted-foreground">
            Resultados para: <strong>"{searchQuery}"</strong>
          </p>
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
          variant={activeSubcategory === 'bora-dancar' ? 'default' : 'outline'}
          onClick={() => handleSubcategoryChange('bora-dancar')}
          className={activeSubcategory === 'bora-dancar' ? 'bg-primary' : 'border-2 border-[#E6E6FA]'}
        >
          Bora Dançar com Parkinson
        </Button>
        <Button
          variant={activeSubcategory === 'exercicios-fisicos' ? 'default' : 'outline'}
          onClick={() => handleSubcategoryChange('exercicios-fisicos')}
          className={activeSubcategory === 'exercicios-fisicos' ? 'bg-primary' : 'border-2 border-[#E6E6FA]'}
        >
          Exercícios Físicos
        </Button>
      </div>

      {/* Grid de Exercícios */}
      {displayData && displayData.exercicios.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {displayData.exercicios.map((exercicio) => (
              <Card key={exercicio.id} className="hover:shadow-lg transition-shadow border-2 border-[#E6E6FA] overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-white via-[#FFF8F0] to-[#E6E6FA]/20">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge className={`${getDifficultyColor(exercicio.difficulty_level)} border-0`}>
                      {exercicio.difficulty_level}
                    </Badge>
                    {exercicio.mockup && (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        EXEMPLO
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl line-clamp-2 min-h-[3.5rem]">
                    {exercicio.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="line-clamp-1">{exercicio.instructor}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{exercicio.duration_minutes} minutos</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Award className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="capitalize">{exercicio.category}</span>
                    </div>
                    {exercicio.published_date && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{formatDate(exercicio.published_date)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
                    {exercicio.description}
                  </p>
                </CardContent>
                <CardFooter className="bg-gradient-to-br from-[#E6E6FA]/10 to-transparent">
                  <Link to={`/conteudos/exercicios/${exercicio.id}`} className="w-full">
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      <Dumbbell className="w-4 h-4 mr-2" />
                      Ver Exercício
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
          <Dumbbell className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">Nenhum exercício encontrado</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? 'Tente ajustar sua busca ou limpar os filtros.'
              : 'Ainda não há exercícios disponíveis.'}
          </p>
          {searchQuery && (
            <Link to="/conteudos/exercicios">
              <Button variant="outline">Limpar busca</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
