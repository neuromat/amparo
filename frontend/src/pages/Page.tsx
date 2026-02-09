import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API_ENDPOINTS } from '@/config/api';

interface PageData {
  id: number;
  slug: string;
  home_page: boolean;
  enabled: boolean;
  title: string;
  summary: string;
  body: string;
}

export function Page() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);

    fetch(API_ENDPOINTS.pages)
      .then(res => res.json())
      .then((pages: PageData[]) => {
        const foundPage = pages.find(p => p.slug === slug);
        if (foundPage) {
          setPage(foundPage);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao carregar página:', err);
        setError(true);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-4">Página não encontrada</h1>
          <p className="text-muted-foreground">A página que você procura não existe.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-4xl mx-auto border-t-4 border-t-[#FFE5D4]">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl text-primary">
            {page.title}
          </CardTitle>
          {page.summary && (
            <p className="text-lg text-muted-foreground mt-4">{page.summary}</p>
          )}
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: page.body }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
