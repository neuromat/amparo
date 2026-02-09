import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/config/api';
import { Mail, Phone, User, GraduationCap, Link as LinkIcon, Briefcase, ArrowLeft } from 'lucide-react';

export function PesquisadorForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    instituicao: '',
    area_pesquisa: '',
    lattes: '',
    tipo_vinculo: 'estudante'
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
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
      const res = await fetch(`${API_BASE_URL}/api/contact/pesquisador`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao enviar formulário');
      }

      setFormSubmitted(true);
      setFormData({
        nome: '',
        telefone: '',
        email: '',
        instituicao: '',
        area_pesquisa: '',
        lattes: '',
        tipo_vinculo: 'estudante'
      });

      // Redirecionar após 3 segundos
      setTimeout(() => navigate('/'), 3000);
    } catch (err: any) {
      alert(err.message || 'Erro ao enviar formulário');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6E6FA] via-[#A8DADC] to-[#FFF8F0] py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Button
          variant="outline"
          className="mb-6 bg-white/80"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Home
        </Button>

        <Card className="border-2 border-[#E6E6FA] shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-8 bg-gradient-to-br from-[#E6E6FA] to-[#A8DADC]/30">
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-br from-[#E6E6FA] to-[#A8DADC] rounded-full">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold text-primary">
              Cadastro de Pesquisador/Estudante
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Faça parte da nossa comunidade acadêmica! Preencha os dados abaixo para ter acesso a conteúdos
              exclusivos e colaborar com pesquisas sobre Doença de Parkinson.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8 pb-8">
            {formSubmitted ? (
              <div className="text-center py-12 space-y-4 animate-in fade-in duration-500">
                <div className="flex justify-center">
                  <div className="p-4 bg-green-100 rounded-full">
                    <GraduationCap className="w-12 h-12 text-green-600 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-green-600">Cadastro Recebido!</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Obrigado por se juntar à nossa comunidade acadêmica. Em breve entraremos em contato
                  para fornecer acesso aos conteúdos e oportunidades de colaboração.
                </p>
                <p className="text-sm text-muted-foreground">
                  Você será redirecionado em instantes...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome */}
                <div className="space-y-2">
                  <label htmlFor="nome" className="flex items-center gap-2 text-sm font-medium text-primary">
                    <User className="w-4 h-4" />
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    id="nome"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Seu nome completo"
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none focus:ring-2 focus:ring-[#A8DADC]/20 transition-all"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Mail className="w-4 h-4" />
                    E-mail *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu.email@universidade.edu.br"
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none focus:ring-2 focus:ring-[#A8DADC]/20 transition-all"
                  />
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                  <label htmlFor="telefone" className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Phone className="w-4 h-4" />
                    Telefone com DDD *
                  </label>
                  <input
                    type="tel"
                    id="telefone"
                    required
                    value={formData.telefone}
                    onChange={handlePhoneChange}
                    placeholder="(11) 98765-4321"
                    maxLength={15}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none focus:ring-2 focus:ring-[#A8DADC]/20 transition-all"
                  />
                </div>

                {/* Tipo de Vínculo */}
                <div className="space-y-2">
                  <label htmlFor="tipo_vinculo" className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Briefcase className="w-4 h-4" />
                    Tipo de Vínculo *
                  </label>
                  <select
                    id="tipo_vinculo"
                    required
                    value={formData.tipo_vinculo}
                    onChange={(e) => setFormData({ ...formData, tipo_vinculo: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none focus:ring-2 focus:ring-[#A8DADC]/20 transition-all"
                  >
                    <option value="estudante">Estudante de Graduação</option>
                    <option value="mestrando">Mestrando</option>
                    <option value="doutorando">Doutorando</option>
                    <option value="pos-doc">Pós-Doutorado</option>
                    <option value="pesquisador">Pesquisador</option>
                    <option value="professor">Professor/Docente</option>
                  </select>
                </div>

                {/* Instituição */}
                <div className="space-y-2">
                  <label htmlFor="instituicao" className="flex items-center gap-2 text-sm font-medium text-primary">
                    <GraduationCap className="w-4 h-4" />
                    Instituição de Ensino/Pesquisa *
                  </label>
                  <input
                    type="text"
                    id="instituicao"
                    required
                    value={formData.instituicao}
                    onChange={(e) => setFormData({ ...formData, instituicao: e.target.value })}
                    placeholder="Ex: Universidade de São Paulo (USP)"
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none focus:ring-2 focus:ring-[#A8DADC]/20 transition-all"
                  />
                </div>

                {/* Área de Pesquisa */}
                <div className="space-y-2">
                  <label htmlFor="area_pesquisa" className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Briefcase className="w-4 h-4" />
                    Área de Pesquisa/Interesse *
                  </label>
                  <input
                    type="text"
                    id="area_pesquisa"
                    required
                    value={formData.area_pesquisa}
                    onChange={(e) => setFormData({ ...formData, area_pesquisa: e.target.value })}
                    placeholder="Ex: Neurociências, Fisioterapia, Biomedicina"
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none focus:ring-2 focus:ring-[#A8DADC]/20 transition-all"
                  />
                </div>

                {/* Link Lattes */}
                <div className="space-y-2">
                  <label htmlFor="lattes" className="flex items-center gap-2 text-sm font-medium text-primary">
                    <LinkIcon className="w-4 h-4" />
                    Link do Currículo Lattes
                  </label>
                  <input
                    type="url"
                    id="lattes"
                    value={formData.lattes}
                    onChange={(e) => setFormData({ ...formData, lattes: e.target.value })}
                    placeholder="http://lattes.cnpq.br/..."
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none focus:ring-2 focus:ring-[#A8DADC]/20 transition-all"
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-[#A8DADC] rounded-full"></span>
                    Opcional, mas recomendado para pesquisadores
                  </p>
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
                        <GraduationCap className="w-5 h-5" />
                        Cadastrar como Pesquisador/Estudante
                      </span>
                    )}
                  </Button>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  Seus dados estão seguros e serão utilizados apenas para contato relacionado à Rede AMPARO.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
