import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/Logo';
import { Users, Video, BookOpen, ArrowRight, Play, ChevronLeft, ChevronRight, Mail, Phone, User, Heart, Dumbbell, FileText } from 'lucide-react';
import { API_ENDPOINTS, API_BASE_URL } from '@/config/api';

interface Stats {
  total_usuarios: number;
  total_palestras: number;
  total_videos: number;
  total_exercicios: number;
  total_estudos: number;
  total_cartilhas: number;
  total_conteudos: number;
  usuarios_por_tipo: Record<string, number>;
}

interface LatestVideo {
  id: number;
  title: string;
  speaker: string;
  date: string;
  video_url: string;
  source: string;
  link: string;
}

export function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [latestVideos, setLatestVideos] = useState<LatestVideo[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Form states
  const [formData, setFormData] = useState({ nome: '', telefone: '', email: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');

    // Aplica máscara (DD) 9XXXX-XXXX
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, telefone: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao enviar formulário');
      }

      setFormSubmitted(true);
      setFormData({ nome: '', telefone: '', email: '' });

      // Reset após 5 segundos
      setTimeout(() => setFormSubmitted(false), 5000);
    } catch (err: any) {
      alert(err.message || 'Erro ao enviar formulário');
    } finally {
      setFormLoading(false);
    }
  };

  useEffect(() => {
    // Carregar estatísticas
    fetch(API_ENDPOINTS.stats)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Erro ao carregar estatísticas:', err));

    // Carregar 6 vídeos mais recentes de todas as categorias
    fetch(`${API_BASE_URL}/api/latest-videos?limit=6`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setLatestVideos(data);
        }
      })
      .catch(err => console.error('Erro ao carregar vídeos recentes:', err));
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % latestVideos.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + latestVideos.length) % latestVideos.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#E6E6FA] via-[#A8DADC] to-[#FFF8F0] py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center space-y-6">
            <Badge variant="outline" className="text-sm px-4 py-1 border-primary/30 bg-white/80">
              Rede de Apoio NeuroMat
            </Badge>

            <h1 className="text-5xl md:text-6xl font-bold text-primary leading-tight">
              AMPARO
            </h1>

            <p className="text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto">
              Apoio a Amigos e Pessoas com Doença de Parkinson
            </p>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Uma rede dedicada a promover a melhora na qualidade de vida das pessoas
              com Doença de Parkinson e seus familiares através da educação, apoio e
              compartilhamento de conhecimento.
            </p>

            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link to="/conteudos/palestras">
                <Button size="lg" className="gap-2">
                  <Play className="w-5 h-5" />
                  Assistir Palestras
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/cadastro-pesquisador">
                <Button size="lg" variant="outline" className="gap-2 border-2 border-[#A8DADC] text-primary hover:bg-[#A8DADC]/10">
                  <BookOpen className="w-5 h-5" />
                  Sou Pesquisador/Estudante
                </Button>
              </Link>
              <a href="http://neuromat.numec.prp.usp.br/" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="gap-2">
                  <Logo className="h-5 w-auto rounded-sm" />
                  Saiba Mais
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-primary mb-2">Nossos Números</h2>
              <p className="text-muted-foreground">Conteúdo disponível para você</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* Card Usuários */}
              <Card className="border-2 border-[#E6E6FA] hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuários</CardTitle>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{stats.total_usuarios.toLocaleString('pt-BR')}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Membros ativos
                  </p>
                </CardContent>
              </Card>

              {/* Card Palestras */}
              <Card className="border-2 border-[#E6E6FA] hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Palestras</CardTitle>
                  <Play className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{stats.total_palestras}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vídeos educacionais
                  </p>
                </CardContent>
              </Card>

              {/* Card Exercícios */}
              <Card className="border-2 border-[#E6E6FA] hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Exercícios</CardTitle>
                  <Dumbbell className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{stats.total_exercicios}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Atividades físicas
                  </p>
                </CardContent>
              </Card>

              {/* Card Estudos */}
              <Card className="border-2 border-[#E6E6FA] hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pesquisas</CardTitle>
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{stats.total_estudos}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Artigos e materiais
                  </p>
                </CardContent>
              </Card>

              {/* Card Cartilhas */}
              <Card className="border-2 border-[#E6E6FA] hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cartilhas</CardTitle>
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{stats.total_cartilhas}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDFs disponíveis
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Latest Videos Carousel Section */}
      {latestVideos.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-[#A8DADC] hover:bg-[#A8DADC]/90 text-white border-0">
                Conteúdos Mais Recentes
              </Badge>
              <h2 className="text-3xl font-bold text-primary">
                Assista os últimos conteúdos
              </h2>
              <p className="text-muted-foreground mt-2">
                Conteúdo educacional atualizado sobre Doença de Parkinson
              </p>
            </div>

            <div className="relative">
              {/* Carousel Container */}
              <div className="overflow-hidden rounded-xl">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {latestVideos.map((video, idx) => (
                    <div key={`${video.source}-${video.id}-${idx}`} className="min-w-full px-2">
                      <Card className="overflow-hidden border-2 border-[#E6E6FA] shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-[#E6E6FA] to-[#A8DADC]/30">
                          <CardTitle className="text-xl text-primary line-clamp-2">
                            {video.title}
                          </CardTitle>
                          <CardDescription className="text-base">
                            <span className="font-medium">{video.speaker}</span>
                          </CardDescription>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(video.date).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                            <iframe
                              className="absolute top-0 left-0 w-full h-full"
                              src={(() => {
                                const videoId = video.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
                                return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
                              })()}
                              title={video.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </CardContent>
                        <CardContent className="pt-4 pb-6 text-center">
                          <Link to={video.link}>
                            <Button className="gap-2">
                              Ver detalhes completos
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              {latestVideos.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white hover:bg-[#E6E6FA] text-primary rounded-full p-3 shadow-lg transition-all hover:scale-110 z-10"
                    aria-label="Vídeo anterior"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white hover:bg-[#E6E6FA] text-primary rounded-full p-3 shadow-lg transition-all hover:scale-110 z-10"
                    aria-label="Próximo vídeo"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Indicators */}
              {latestVideos.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {latestVideos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentSlide
                          ? 'w-8 bg-primary'
                          : 'w-2 bg-[#E6E6FA] hover:bg-[#A8DADC]'
                      }`}
                      aria-label={`Ir para vídeo ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-primary">
            Nosso Propósito
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Logo className="h-6 w-auto rounded-sm" />
                  Formação de Rede
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Conectar pessoas com Doença de Parkinson, familiares, cuidadores, estudantes
                  e profissionais de saúde para identificar desafios e desenvolver estratégias
                  de melhoria da qualidade de vida.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-primary" />
                  Educação e Capacitação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Promover a educação de pessoas com Doença de Parkinson, familiares e cuidadores
                  para o autocuidado e participação ativa nas decisões sobre o tratamento através
                  de palestras mensais com especialistas.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  Cuidado Interprofissional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Promover o cuidado interprofissional através de palestras e discussões de casos
                  clínicos com profissionais experientes de diferentes áreas da saúde que trabalham
                  com Doença de Parkinson.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-6 h-6 text-primary" />
                  Conteúdo Acessível
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Disponibilizar palestras via web sobre temas importantes em Doença de Parkinson,
                  ministradas por profissionais com experiência na área, acessíveis a todos os
                  membros da rede.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="relative">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#E6E6FA]/20 via-[#A8DADC]/10 to-[#FFE5D4]/20 rounded-3xl transform -rotate-1"></div>

            <Card className="relative border-2 border-[#E6E6FA] shadow-2xl rounded-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#A8DADC]/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FFE5D4]/10 rounded-full blur-3xl"></div>

              <CardHeader className="text-center space-y-4 pb-8 relative">
                <div className="flex justify-center">
                  <div className="p-4 bg-gradient-to-br from-[#E6E6FA] to-[#A8DADC] rounded-full">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl md:text-4xl font-bold text-primary">
                  Faça Parte da Nossa Rede
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Estamos aqui para apoiar você! Preencha os dados abaixo e nossa equipe entrará em contato
                  para conectar você com informações, suporte e uma comunidade que se importa.
                </CardDescription>
              </CardHeader>

              <CardContent className="relative pb-8">
                {formSubmitted ? (
                  <div className="text-center py-12 space-y-4 animate-in fade-in duration-500">
                    <div className="flex justify-center">
                      <div className="p-4 bg-green-100 rounded-full">
                        <Heart className="w-12 h-12 text-green-600 animate-pulse" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-green-600">Muito obrigado!</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Recebemos suas informações com carinho. Em breve nossa equipe entrará em contato
                      para dar as boas-vindas à Rede AMPARO.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                    {/* Nome */}
                    <div className="space-y-2">
                      <label htmlFor="nome" className="flex items-center gap-2 text-sm font-medium text-primary">
                        <User className="w-4 h-4" />
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        id="nome"
                        required
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        placeholder="Como você gostaria de ser chamado?"
                        className="w-full px-4 py-3 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none focus:ring-2 focus:ring-[#A8DADC]/20 transition-all placeholder:text-muted-foreground/50"
                      />
                    </div>

                    {/* Telefone */}
                    <div className="space-y-2">
                      <label htmlFor="telefone" className="flex items-center gap-2 text-sm font-medium text-primary">
                        <Phone className="w-4 h-4" />
                        Telefone com DDD
                      </label>
                      <input
                        type="tel"
                        id="telefone"
                        required
                        value={formData.telefone}
                        onChange={handlePhoneChange}
                        placeholder="(11) 98765-4321"
                        maxLength={15}
                        className="w-full px-4 py-3 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none focus:ring-2 focus:ring-[#A8DADC]/20 transition-all placeholder:text-muted-foreground/50"
                      />
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="inline-block w-1 h-1 bg-[#A8DADC] rounded-full"></span>
                        Digite seu telefone com DDD para que possamos entrar em contato
                      </p>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-primary">
                        <Mail className="w-4 h-4" />
                        E-mail
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="seu.email@exemplo.com"
                        className="w-full px-4 py-3 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none focus:ring-2 focus:ring-[#A8DADC]/20 transition-all placeholder:text-muted-foreground/50"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <Button
                        type="submit"
                        disabled={formLoading}
                        size="lg"
                        className="w-full bg-gradient-to-r from-primary to-[#A8DADC] hover:from-primary/90 hover:to-[#A8DADC]/90 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                      >
                        {formLoading ? (
                          <span className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Enviando...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Heart className="w-5 h-5" />
                            Quero Fazer Parte da Rede AMPARO
                          </span>
                        )}
                      </Button>
                    </div>

                    <p className="text-center text-xs text-muted-foreground">
                      Seus dados estão seguros conosco e serão utilizados apenas para contato relacionado à Rede AMPARO.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-[#E6E6FA] to-[#FFE5D4]">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h2 className="text-3xl font-bold text-primary">
            Participe da Nossa Rede
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que buscam melhorar a qualidade de vida
            através do conhecimento e apoio mútuo.
          </p>
          <Link to="/conteudos/palestras">
            <Button size="lg" className="gap-2">
              <Play className="w-5 h-5" />
              Explorar Conteúdo
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
