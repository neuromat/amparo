import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/config/api';
import { Play, Dumbbell, BookOpen, FileText, Plus, Edit, Trash2, User } from 'lucide-react';

interface ContentItem {
  id: number;
  title: string;
  published_date?: string;
  posted?: string;
  speaker?: string;
  instructor?: string;
  author?: string;
}

export function Editor() {
  const { user, logout } = useAuth();
  const [palestras, setPalestras] = useState<ContentItem[]>([]);
  const [exercicios, setExercicios] = useState<ContentItem[]>([]);
  const [estudos, setEstudos] = useState<ContentItem[]>([]);
  const [cartilhas, setCartilhas] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllContent();
  }, []);

  const loadAllContent = async () => {
    try {
      // Carregar palestras
      const resPalestras = await fetch(`${API_BASE_URL}/api/palestras`);
      const dataPalestras = await resPalestras.json();
      setPalestras(dataPalestras.palestras || []);

      // Carregar exercícios
      const resExercicios = await fetch(`${API_BASE_URL}/api/exercicios`);
      const dataExercicios = await resExercicios.json();
      setExercicios(dataExercicios.exercicios || []);

      // Carregar estudos
      const resEstudos = await fetch(`${API_BASE_URL}/api/estudos`);
      const dataEstudos = await resEstudos.json();
      setEstudos(dataEstudos.estudos || []);

      // Carregar cartilhas
      const resCartilhas = await fetch(`${API_BASE_URL}/api/cartilhas`);
      const dataCartilhas = await resCartilhas.json();
      setCartilhas(dataCartilhas.cartilhas || []);
    } catch (err) {
      console.error('Erro ao carregar conteúdos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tipo: string, id: number) => {
    if (!confirm(`Tem certeza que deseja deletar este ${tipo}?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/conteudos/${tipo}/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        alert('Conteúdo deletado com sucesso!');
        loadAllContent();
      } else {
        const data = await res.json();
        alert(`Erro ao deletar: ${data.error || 'Erro desconhecido'}`);
      }
    } catch (err) {
      alert('Erro ao deletar conteúdo');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Editor - AMPARO</h1>
          <p className="text-muted-foreground mt-1">Gerencie todos os conteúdos da plataforma</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <User className="w-4 h-4" />
            {user?.nome}
          </span>
          <Button variant="outline" onClick={logout}>Sair</Button>
        </div>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="space-y-8">
          {/* Palestras */}
          <Card className="border-2 border-[#E6E6FA]">
            <CardHeader className="bg-gradient-to-r from-[#E6E6FA] to-[#A8DADC]/30">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Palestras ({palestras.length})
                </CardTitle>
                <Link to="/editor/palestras/novo">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nova Palestra
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {palestras.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhuma palestra cadastrada</p>
              ) : (
                <div className="space-y-3">
                  {palestras.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-[#E6E6FA]/10">
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.speaker}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/editor/palestras/${item.id}`}>
                          <Button size="sm" variant="outline" className="gap-2">
                            <Edit className="w-4 h-4" />
                            Editar
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-2"
                          onClick={() => handleDelete('palestras', item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Deletar
                        </Button>
                      </div>
                    </div>
                  ))}
                  {palestras.length > 5 && (
                    <p className="text-sm text-center text-muted-foreground pt-2">
                      E mais {palestras.length - 5} palestras...
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exercícios */}
          <Card className="border-2 border-[#E6E6FA]">
            <CardHeader className="bg-gradient-to-r from-[#E6E6FA] to-[#A8DADC]/30">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5" />
                  Exercícios ({exercicios.length})
                </CardTitle>
                <Link to="/editor/exercicios/novo">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Exercício
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {exercicios.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhum exercício cadastrado</p>
              ) : (
                <div className="space-y-3">
                  {exercicios.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-[#E6E6FA]/10">
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.instructor}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/editor/exercicios/${item.id}`}>
                          <Button size="sm" variant="outline" className="gap-2">
                            <Edit className="w-4 h-4" />
                            Editar
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-2"
                          onClick={() => handleDelete('exercicios', item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Deletar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estudos */}
          <Card className="border-2 border-[#E6E6FA]">
            <CardHeader className="bg-gradient-to-r from-[#E6E6FA] to-[#A8DADC]/30">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Estudos ({estudos.length})
                </CardTitle>
                <Link to="/editor/estudos/novo">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Estudo
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {estudos.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhum estudo cadastrado</p>
              ) : (
                <div className="space-y-3">
                  {estudos.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-[#E6E6FA]/10">
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.author}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/editor/estudos/${item.id}`}>
                          <Button size="sm" variant="outline" className="gap-2">
                            <Edit className="w-4 h-4" />
                            Editar
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-2"
                          onClick={() => handleDelete('estudos', item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Deletar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cartilhas */}
          <Card className="border-2 border-[#E6E6FA]">
            <CardHeader className="bg-gradient-to-r from-[#E6E6FA] to-[#A8DADC]/30">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Cartilhas ({cartilhas.length})
                </CardTitle>
                <Link to="/editor/cartilhas/novo">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nova Cartilha
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {cartilhas.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhuma cartilha cadastrada</p>
              ) : (
                <div className="space-y-3">
                  {cartilhas.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-[#E6E6FA]/10">
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.speaker}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/editor/cartilhas/${item.id}`}>
                          <Button size="sm" variant="outline" className="gap-2">
                            <Edit className="w-4 h-4" />
                            Editar
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-2"
                          onClick={() => handleDelete('cartilhas', item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Deletar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
