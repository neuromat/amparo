import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowLeft, FileText, Download, Building2 } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import type { Cartilha } from '@/types/content';

export function CartilhaDetail() {
  const { id } = useParams<{ id: string }>();
  const [cartilha, setCartilha] = useState<Cartilha | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(`${API_ENDPOINTS.conteudos.cartilhas}/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Cartilha não encontrada');
        return res.json();
      })
      .then(data => {
        setCartilha(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao carregar cartilha:', err);
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Carregando cartilha...</p>
        </div>
      </div>
    );
  }

  if (error || !cartilha) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Cartilha não encontrada</h1>
          <Link to="/conteudos/cartilhas">
            <Button>Voltar para Cartilhas</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Back button */}
      <Link to="/conteudos/cartilhas">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar para Cartilhas
        </Button>
      </Link>

      {/* Título e Badge */}
      <div className="mb-8">
        <Badge className="bg-red-100 text-red-800 border-red-200 mb-4">
          <FileText className="w-3 h-3 mr-1" />
          Documento PDF
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
          {cartilha.title}
        </h1>
        {cartilha.description && (
          <p className="text-lg text-muted-foreground">
            {cartilha.description}
          </p>
        )}
      </div>

      {/* Metadados */}
      <Card className="mb-8 border-2 border-[#E6E6FA]">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cartilha.speaker && (
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Autor/Palestrante</p>
                  <p className="font-medium">{cartilha.speaker}</p>
                </div>
              </div>
            )}
            {cartilha.affiliation && (
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Afiliação</p>
                  <p className="font-medium">{cartilha.affiliation}</p>
                </div>
              </div>
            )}
            {cartilha.published_date && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Publicado em</p>
                  <p className="font-medium">{formatDate(cartilha.published_date)}</p>
                </div>
              </div>
            )}
            {cartilha.pdf_file && (
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Arquivo</p>
                  <p className="font-medium text-xs break-all">{cartilha.pdf_file.split('/').pop()}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Biografia do palestrante (se disponível) */}
      {cartilha.resume_speaker && (
        <Card className="mb-8 border-2 border-[#E6E6FA]">
          <CardHeader>
            <CardTitle>Sobre o Autor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{cartilha.resume_speaker}</p>
          </CardContent>
        </Card>
      )}

      {/* Área de Download */}
      {cartilha.pdf_file && (
        <Card className="border-2 border-[#E6E6FA]">
          <CardHeader className="bg-gradient-to-r from-red-50 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-red-700" />
              Download do Material
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="bg-red-50/50 border-2 border-dashed border-red-200 rounded-lg p-8 text-center">
              <FileText className="w-20 h-20 mx-auto mb-4 text-red-700" />
              <h3 className="text-lg font-semibold mb-2">Material Educativo em PDF</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Baixe o material completo em formato PDF
              </p>
              <div className="mb-6">
                <code className="bg-muted px-3 py-2 rounded text-xs block max-w-md mx-auto overflow-hidden text-ellipsis">
                  {cartilha.pdf_file}
                </code>
              </div>
              <Button className="gap-2 bg-red-700 hover:bg-red-800" disabled>
                <Download className="w-4 h-4" />
                Baixar PDF
                <span className="text-xs ml-2">(link mockup)</span>
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Este é um link de exemplo. Em produção, o download real estará disponível.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
