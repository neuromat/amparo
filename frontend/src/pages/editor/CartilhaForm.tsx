import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/config/api';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

export function CartilhaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id !== 'novo';

  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<string[]>(['']);
  const [formData, setFormData] = useState({
    speaker: '',
    title: '',
    subtitle: '',
    content: '',
    date_time: '',
    affiliation: '',
    image: '',
    publish: true,
    posted: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (isEdit) {
      loadCartilha();
    }
  }, [id]);

  const loadCartilha = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cartilhas/${id}`);
      const data = await res.json();

      setFormData({
        speaker: data.speaker || '',
        title: data.title || '',
        subtitle: data.subtitle || '',
        content: data.content || '',
        date_time: data.date_time ? data.date_time.substring(0, 16) : '',
        affiliation: data.affiliation || '',
        image: data.image || '',
        publish: data.publish !== false,
        posted: data.posted || new Date().toISOString().split('T')[0]
      });

      // Carregar arquivos PDF
      if (data.files && data.files.length > 0) {
        setFiles(data.files.map((f: any) => f.file));
      }
    } catch (err) {
      console.error('Erro ao carregar cartilha:', err);
      alert('Erro ao carregar cartilha');
    }
  };

  const handleAddFile = () => {
    setFiles([...files, '']);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleFileChange = (index: number, value: string) => {
    const newFiles = [...files];
    newFiles[index] = value;
    setFiles(newFiles);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const slug = generateSlug(formData.title);

      const payload = {
        // blog_blog
        speaker: formData.speaker,
        slug: slug,
        image: formData.image,
        publish: formData.publish,
        posted: formData.posted,
        // blog_blog_translation
        title: formData.title,
        subtitle: formData.subtitle,
        content: formData.content,
        date_time: formData.date_time ? new Date(formData.date_time).toISOString() : new Date().toISOString(),
        affiliation: formData.affiliation,
        language_code: 'pt-br',
        // blog_lecturefile
        files: files.filter(f => f.trim())
      };

      const url = isEdit
        ? `${API_BASE_URL}/api/conteudos/cartilhas/${id}`
        : `${API_BASE_URL}/api/conteudos/cartilhas`;

      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(isEdit ? 'Cartilha atualizada!' : 'Cartilha criada!');
        navigate('/editor');
      } else {
        const data = await res.json();
        alert(`Erro: ${data.error || 'Erro desconhecido'}`);
      }
    } catch (err) {
      alert('Erro ao salvar cartilha');
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
            {isEdit ? 'Editar Cartilha' : 'Nova Cartilha'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium mb-2">Título da Cartilha *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
              />
            </div>

            {/* Subtítulo */}
            <div>
              <label className="block text-sm font-medium mb-2">Subtítulo</label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Autor/Responsável */}
              <div>
                <label className="block text-sm font-medium mb-2">Autor/Responsável</label>
                <input
                  type="text"
                  value={formData.speaker}
                  onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
                />
              </div>

              {/* Afiliação */}
              <div>
                <label className="block text-sm font-medium mb-2">Afiliação/Instituição</label>
                <input
                  type="text"
                  placeholder="ex: NeuroMat USP"
                  value={formData.affiliation}
                  onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Data de Criação */}
              <div>
                <label className="block text-sm font-medium mb-2">Data de Criação</label>
                <input
                  type="datetime-local"
                  value={formData.date_time}
                  onChange={(e) => setFormData({ ...formData, date_time: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
                />
              </div>

              {/* Data de Publicação */}
              <div>
                <label className="block text-sm font-medium mb-2">Data de Publicação</label>
                <input
                  type="date"
                  value={formData.posted}
                  onChange={(e) => setFormData({ ...formData, posted: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
                />
              </div>
            </div>

            {/* Imagem */}
            <div>
              <label className="block text-sm font-medium mb-2">Caminho da Imagem</label>
              <input
                type="text"
                placeholder="ex: banner/2024/cartilha.jpg"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
              />
            </div>

            {/* Arquivos PDF */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Arquivos PDF *</label>
                <Button type="button" size="sm" onClick={handleAddFile} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Adicionar Arquivo
                </Button>
              </div>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="ex: lecture/2024-01/cartilha-parkinson.pdf"
                      value={file}
                      onChange={(e) => handleFileChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
                    />
                    {files.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Caminho relativo do arquivo PDF no servidor
              </p>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium mb-2">Descrição (HTML)</label>
              <textarea
                rows={8}
                placeholder="Cole aqui o HTML com a descrição da cartilha..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none font-mono text-sm"
              />
            </div>

            {/* Checkbox Publicar */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.publish}
                  onChange={(e) => setFormData({ ...formData, publish: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Publicar</span>
              </label>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="gap-2">
                <Save className="w-4 h-4" />
                {loading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar')} Cartilha
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
