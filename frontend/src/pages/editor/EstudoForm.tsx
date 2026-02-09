import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/config/api';
import { ArrowLeft, Save } from 'lucide-react';

export function EstudoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id !== 'novo';

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    content_type: 'html',
    category: '',
    tags: '',
    body: '',
    external_link: '',
    pdf_file: '',
    reading_time_minutes: ''
  });

  useEffect(() => {
    if (isEdit) {
      loadEstudo();
    }
  }, [id]);

  const loadEstudo = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/estudos/${id}`);
      const data = await res.json();

      setFormData({
        title: data.title || '',
        description: data.description || '',
        author: data.author || '',
        content_type: data.content_type || 'html',
        category: data.category || '',
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
        body: data.body || '',
        external_link: data.external_link || '',
        pdf_file: data.pdf_file || '',
        reading_time_minutes: data.reading_time_minutes?.toString() || ''
      });
    } catch (err) {
      console.error('Erro ao carregar estudo:', err);
      alert('Erro ao carregar estudo');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        reading_time_minutes: parseInt(formData.reading_time_minutes) || null,
        published_date: new Date().toISOString(),
        mockup: false
      };

      const url = isEdit
        ? `${API_BASE_URL}/api/conteudos/estudos/${id}`
        : `${API_BASE_URL}/api/conteudos/estudos`;

      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(isEdit ? 'Estudo atualizado!' : 'Estudo criado!');
        navigate('/editor');
      } else {
        const data = await res.json();
        alert(`Erro: ${data.error || 'Erro desconhecido'}`);
      }
    } catch (err) {
      alert('Erro ao salvar estudo');
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
            {isEdit ? 'Editar Estudo' : 'Novo Estudo'}
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
              {/* Autor */}
              <div>
                <label className="block text-sm font-medium mb-2">Autor</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
                />
              </div>

              {/* Tipo de Conteúdo */}
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Conteúdo *</label>
                <select
                  required
                  value={formData.content_type}
                  onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
                >
                  <option value="html">HTML (conteúdo inline)</option>
                  <option value="pdf">PDF (arquivo para download)</option>
                  <option value="video">Vídeo (YouTube)</option>
                  <option value="external_link">Link Externo</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium mb-2">Categoria</label>
                <input
                  type="text"
                  placeholder="ex: tratamento, nutrição, sono"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
                />
              </div>

              {/* Tempo de Leitura */}
              <div>
                <label className="block text-sm font-medium mb-2">Tempo de Leitura (minutos)</label>
                <input
                  type="number"
                  value={formData.reading_time_minutes}
                  onChange={(e) => setFormData({ ...formData, reading_time_minutes: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2">Tags (separadas por vírgula)</label>
              <input
                type="text"
                placeholder="ex: tratamento, pesquisa, novidades"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
              />
            </div>

            {/* Campos condicionais baseados no tipo */}
            {formData.content_type === 'html' && (
              <div>
                <label className="block text-sm font-medium mb-2">Conteúdo HTML *</label>
                <textarea
                  required
                  rows={15}
                  placeholder="Cole aqui o HTML do conteúdo..."
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use &lt;div class='prose'&gt; para estilização automática.
                </p>
              </div>
            )}

            {formData.content_type === 'pdf' && (
              <div>
                <label className="block text-sm font-medium mb-2">Caminho do Arquivo PDF *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: estudos/2024-02/guia-nutricao-parkinson.pdf"
                  value={formData.pdf_file}
                  onChange={(e) => setFormData({ ...formData, pdf_file: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Caminho relativo do arquivo no servidor
                </p>
              </div>
            )}

            {formData.content_type === 'video' && (
              <div>
                <label className="block text-sm font-medium mb-2">URL do Vídeo (YouTube) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.external_link}
                  onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
                />
              </div>
            )}

            {formData.content_type === 'external_link' && (
              <div>
                <label className="block text-sm font-medium mb-2">Link Externo *</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={formData.external_link}
                  onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
                />
              </div>
            )}

            {/* Conteúdo de prévia (sempre mostrado) */}
            {formData.content_type !== 'html' && (
              <div>
                <label className="block text-sm font-medium mb-2">Texto de Prévia (HTML)</label>
                <textarea
                  rows={6}
                  placeholder="Texto que aparecerá antes do botão de download/link externo..."
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Opcional. Use para descrever o que o usuário encontrará no PDF/link.
                </p>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="gap-2">
                <Save className="w-4 h-4" />
                {loading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar')} Estudo
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
