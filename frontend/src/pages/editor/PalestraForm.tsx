import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/config/api';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

export function PalestraForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id !== 'novo';

  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<string[]>(['']);
  const [formData, setFormData] = useState({
    speaker: '',
    moderator: '',
    title: '',
    subtitle: '',
    content: '',
    date_time: '',
    affiliation: '',
    subcategory: 'palestras',
    image: '',
    publish: true,
    banner: false,
    posted: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (isEdit) {
      loadPalestra();
    }
  }, [id]);

  const loadPalestra = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/palestras/${id}`);
      const data = await res.json();

      setFormData({
        speaker: data.speaker || '',
        moderator: data.moderator || '',
        title: data.title || '',
        subtitle: data.subtitle || '',
        content: data.content || '',
        date_time: data.date_time ? data.date_time.substring(0, 16) : '',
        affiliation: data.affiliation || '',
        subcategory: data.subcategory || 'palestras',
        image: data.image || '',
        publish: data.publish !== false,
        banner: data.banner === true,
        posted: data.posted || new Date().toISOString().split('T')[0]
      });

      // Carregar vídeos
      if (data.videos && data.videos.length > 0) {
        setVideos(data.videos.map((v: any) => v.video));
      }
    } catch (err) {
      console.error('Erro ao carregar palestra:', err);
      alert('Erro ao carregar palestra');
    }
  };

  const handleAddVideo = () => {
    setVideos([...videos, '']);
  };

  const handleRemoveVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const handleVideoChange = (index: number, value: string) => {
    const newVideos = [...videos];
    newVideos[index] = value;
    setVideos(newVideos);
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
        moderator: formData.moderator,
        slug: slug,
        image: formData.image,
        subcategory: formData.subcategory,
        publish: formData.publish,
        banner: formData.banner,
        posted: formData.posted,
        // blog_blog_translation
        title: formData.title,
        subtitle: formData.subtitle,
        content: formData.content,
        date_time: formData.date_time ? new Date(formData.date_time).toISOString() : new Date().toISOString(),
        affiliation: formData.affiliation,
        language_code: 'pt-br',
        // blog_lecturevideo
        videos: videos.filter(v => v.trim())
      };

      const url = isEdit
        ? `${API_BASE_URL}/api/conteudos/palestras/${id}`
        : `${API_BASE_URL}/api/conteudos/palestras`;

      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(isEdit ? 'Palestra atualizada!' : 'Palestra criada!');
        navigate('/editor');
      } else {
        const data = await res.json();
        alert(`Erro: ${data.error || 'Erro desconhecido'}`);
      }
    } catch (err) {
      alert('Erro ao salvar palestra');
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
            {isEdit ? 'Editar Palestra' : 'Nova Palestra'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium mb-2">Título da Palestra *</label>
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
              {/* Palestrante */}
              <div>
                <label className="block text-sm font-medium mb-2">Palestrante *</label>
                <input
                  type="text"
                  required
                  value={formData.speaker}
                  onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
                />
              </div>

              {/* Moderador */}
              <div>
                <label className="block text-sm font-medium mb-2">Moderador</label>
                <input
                  type="text"
                  value={formData.moderator}
                  onChange={(e) => setFormData({ ...formData, moderator: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
                />
              </div>
            </div>

            {/* Afiliação */}
            <div>
              <label className="block text-sm font-medium mb-2">Afiliação</label>
              <input
                type="text"
                placeholder="ex: Universidade de São Paulo"
                value={formData.affiliation}
                onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
              />
            </div>

            {/* Subcategoria */}
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Conteúdo *</label>
              <select
                required
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
              >
                <option value="palestras">Palestra</option>
                <option value="depoimentos">Minha História com Parkinson</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Selecione se é uma palestra educacional ou um depoimento pessoal
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Data e Hora da Palestra */}
              <div>
                <label className="block text-sm font-medium mb-2">Data e Hora da Palestra</label>
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

            {/* Imagem/Banner */}
            <div>
              <label className="block text-sm font-medium mb-2">Caminho da Imagem/Banner</label>
              <input
                type="text"
                placeholder="ex: banner/2024/palestra.jpg"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
              />
            </div>

            {/* Vídeos */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Vídeos (YouTube)</label>
                <Button type="button" size="sm" onClick={handleAddVideo} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Adicionar Vídeo
                </Button>
              </div>
              <div className="space-y-2">
                {videos.map((video, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                      value={video}
                      onChange={(e) => handleVideoChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none"
                    />
                    {videos.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveVideo(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Conteúdo/Descrição */}
            <div>
              <label className="block text-sm font-medium mb-2">Descrição/Conteúdo (HTML)</label>
              <textarea
                rows={8}
                placeholder="Cole aqui o HTML do conteúdo..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none font-mono text-sm"
              />
            </div>

            {/* Checkboxes */}
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.publish}
                  onChange={(e) => setFormData({ ...formData, publish: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Publicar</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.banner}
                  onChange={(e) => setFormData({ ...formData, banner: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Exibir no Banner</span>
              </label>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="gap-2">
                <Save className="w-4 h-4" />
                {loading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar')} Palestra
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
