import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowLeft, Clock, Award, Package, Dumbbell } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import type { Exercicio } from '@/types/content';

export function ExercicioDetail() {
  const { id } = useParams<{ id: string }>();
  const [exercicio, setExercicio] = useState<Exercicio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(`${API_ENDPOINTS.conteudos.exercicios}/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Exercício não encontrado');
        return res.json();
      })
      .then(data => {
        setExercicio(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao carregar exercício:', err);
        setError(true);
        setLoading(false);
      });
  }, [id]);

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

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
      'iniciante': 'bg-green-100 text-green-800 border-green-200',
      'intermediário': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'avançado': 'bg-red-100 text-red-800 border-red-200',
      'todos os níveis': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[level?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Carregando exercício...</p>
        </div>
      </div>
    );
  }

  if (error || !exercicio) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Exercício não encontrado</h1>
          <Link to="/conteudos/exercicios">
            <Button>Voltar para Exercícios</Button>
          </Link>
        </div>
      </div>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(exercicio.video_url);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Back button */}
      <Link to="/conteudos/exercicios">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar para Exercícios
        </Button>
      </Link>

      {/* Título e Badges */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge className={`${getDifficultyColor(exercicio.difficulty_level)} border`}>
            {exercicio.difficulty_level}
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 capitalize">
            {exercicio.category}
          </Badge>
          {exercicio.mockup && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              EXEMPLO
            </Badge>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
          {exercicio.title}
        </h1>
        <p className="text-lg text-muted-foreground">
          {exercicio.description}
        </p>
      </div>

      {/* Metadados */}
      <Card className="mb-8 border-2 border-[#E6E6FA]">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Instrutor</p>
                <p className="font-medium">{exercicio.instructor}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Duração</p>
                <p className="font-medium">{exercicio.duration_minutes} minutos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Categoria</p>
                <p className="font-medium capitalize">{exercicio.category}</p>
              </div>
            </div>
            {exercicio.published_date && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Publicado em</p>
                  <p className="font-medium">{formatDate(exercicio.published_date)}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Equipamentos Necessários */}
      {exercicio.equipment_needed && exercicio.equipment_needed.length > 0 && (
        <Card className="mb-8 border-2 border-[#E6E6FA]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Equipamentos Necessários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {exercicio.equipment_needed.map((item, index) => (
                <Badge key={index} variant="outline" className="capitalize">
                  {item}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vídeo */}
      {embedUrl && (
        <Card className="mb-8 border-2 border-[#E6E6FA] overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#E6E6FA]/20 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5" />
              Vídeo do Exercício
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={embedUrl}
                title={exercicio.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Descrição Detalhada */}
      {exercicio.body && (
        <Card className="border-2 border-[#E6E6FA]">
          <CardHeader>
            <CardTitle>Sobre o Exercício</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-slate max-w-none prose-headings:text-primary prose-h2:text-2xl prose-h3:text-xl prose-p:text-muted-foreground prose-li:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: exercicio.body }}
            />
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {exercicio.tags && exercicio.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {exercicio.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
