import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/config/api';
import { ArrowLeft, Save } from 'lucide-react';

export function ExercicioForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id !== 'novo';

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    duration_minutes: '',
    difficulty_level: 'iniciante',
    category: '',
    subcategory: 'exercicios-fisicos',
    video_url: '',
    thumbnail: '',
    tags: '',
    equipment_needed: '',
    body: ''
  });

  useEffect(() => {
    if (isEdit) {
      loadExercicio();
    }
  }, [id]);

  const loadExercicio = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/exercicios/${id}`);
      const data = await res.json();

      setFormData({
        title: data.title || '',
        description: data.description || '',
        instructor: data.instructor || '',
        duration_minutes: data.duration_minutes?.toString() || '',
        difficulty_level: data.difficulty_level || 'iniciante',
        category: data.category || '',
        subcategory: data.subcategory || 'exercicios-fisicos',
        video_url: data.video_url || '',
        thumbnail: data.thumbnail || '',
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
        equipment_needed: Array.isArray(data.equipment_needed) ? data.equipment_needed.join(', ') : '',
        body: data.body || ''
      });
    } catch (err) {
      console.error('Erro ao carregar exercício:', err);
      alert('Erro ao carregar exercício');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Preparar dados
      const payload = {
        ...formData,
        duration_minutes: parseInt(formData.duration_minutes) || null,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        equipment_needed: formData.equipment_needed.split(',').map(e => e.trim()).filter(e => e),
        published_date: new Date().toISOString(),
        mockup: false
      };

      const url = isEdit
        ? `${API_BASE_URL}/api/conteudos/exercicios/${id}`
        : `${API_BASE_URL}/api/conteudos/exercicios`;

      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(isEdit ? 'Exercício atualizado!' : 'Exercício criado!');
        navigate('/editor');
      } else {
        const data = await res.json();
        alert(`Erro: ${data.error || 'Erro desconhecido'}`);
      }
    } catch (err) {
      alert('Erro ao salvar exercício');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Button variant="outline" className="mb-6" onClick={() => navigate('/editor')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <Card className="border-2 border-[#E6E6FA]">
        <CardHeader className="bg-gradient-to-r from-[#E6E6FA] to-[#A8DADC]/30">
          <CardTitle>
            {isEdit ? 'Editar Exercício' : 'Novo Exercício'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium mb-2">Título *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium mb-2">Descrição *</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Instrutor */}
              <div>
                <label className="block text-sm font-medium mb-2">Instrutor</label>
                <input
                  type="text"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
                />
              </div>

              {/* Duração */}
              <div>
                <label className="block text-sm font-medium mb-2">Duração (minutos)</label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Nível */}
              <div>
                <label className="block text-sm font-medium mb-2">Nível de Dificuldade</label>
                <select
                  value={formData.difficulty_level}
                  onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
                >
                  <option value="iniciante">Iniciante</option>
                  <option value="intermediário">Intermediário</option>
                  <option value="avançado">Avançado</option>
                </select>
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium mb-2">Categoria</label>
                <input
                  type="text"
                  placeholder="ex: equilíbrio, coordenação"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
                />
              </div>
            </div>

            {/* Subcategoria */}
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Exercício *</label>
              <select
                required
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
              >
                <option value="exercicios-fisicos">Exercícios Físicos</option>
                <option value="bora-dancar">Bora Dançar com Parkinson</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Selecione em qual seção este exercício será exibido
              </p>
            </div>

            {/* URL do Vídeo */}
            <div>
              <label className="block text-sm font-medium mb-2">URL do Vídeo (YouTube)</label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2">Tags (separadas por vírgula)</label>
              <input
                type="text"
                placeholder="ex: equilíbrio, prevenção, iniciante"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
              />
            </div>

            {/* Equipamentos */}
            <div>
              <label className="block text-sm font-medium mb-2">Equipamentos Necessários (separados por vírgula)</label>
              <input
                type="text"
                placeholder="ex: cadeira, parede, bola"
                value={formData.equipment_needed}
                onChange={(e) => setFormData({ ...formData, equipment_needed: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
              />
            </div>

            {/* Conteúdo HTML */}
            <div>
              <label className="block text-sm font-medium mb-2">Conteúdo (HTML)</label>
              <textarea
                rows={10}
                placeholder="Cole aqui o HTML do conteúdo..."
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Suporta HTML. Use &lt;div class='prose'&gt; para estilização automática.
              </p>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="gap-2">
                <Save className="w-4 h-4" />
                {loading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar')} Exercício
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/editor')}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
