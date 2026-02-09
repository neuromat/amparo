import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Search, Menu, X, ChevronDown, Play, Dumbbell, FileText, MapPin, LogIn, User } from 'lucide-react';
import { Logo } from './Logo';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function Layout() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [conteudosOpen, setConteudosOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/blog?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b-2 border-[#E6E6FA] bg-gradient-to-r from-white via-[#FFF8F0] to-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-md">
        <nav className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 text-primary group flex-shrink-0">
              <Logo className="h-14 w-auto transition-transform group-hover:scale-110 rounded-md shadow-sm" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-[#1E6FD9] to-[#A8DADC] bg-clip-text text-transparent">
                  AMPARO
                </span>
                <span className="text-xs text-muted-foreground hidden sm:block">
                  Rede de Apoio NeuroMat
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6 flex-1 justify-center">
              <Link
                to="/"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-[#E6E6FA]/30 transition-all font-medium"
              >
                <Home className="w-4 h-4" />
                <span>Início</span>
              </Link>
              <Link
                to="/pages/o-projeto"
                className="px-4 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-[#E6E6FA]/30 transition-all font-medium"
              >
                O Projeto
              </Link>

              {/* Dropdown Conteúdos */}
              <div className="relative group">
                <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-[#E6E6FA]/30 transition-all font-medium">
                  <BookOpen className="w-4 h-4" />
                  <span>Conteúdos</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute left-0 mt-2 w-56 bg-white border-2 border-[#E6E6FA] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <Link
                    to="/conteudos/palestras"
                    className="flex items-center space-x-2 px-4 py-3 hover:bg-[#E6E6FA]/30 transition-colors first:rounded-t-lg"
                  >
                    <Play className="w-4 h-4" />
                    <span>Palestras e Depoimentos</span>
                  </Link>
                  <Link
                    to="/conteudos/exercicios"
                    className="flex items-center space-x-2 px-4 py-3 hover:bg-[#E6E6FA]/30 transition-colors"
                  >
                    <Dumbbell className="w-4 h-4" />
                    <span>Exercícios</span>
                  </Link>
                  <Link
                    to="/conteudos/estudos"
                    className="flex items-center space-x-2 px-4 py-3 hover:bg-[#E6E6FA]/30 transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Pesquisas</span>
                  </Link>
                  <Link
                    to="/conteudos/cartilhas"
                    className="flex items-center space-x-2 px-4 py-3 hover:bg-[#E6E6FA]/30 transition-colors last:rounded-b-lg"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Cartilhas</span>
                  </Link>
                </div>
              </div>

              {/* Auth Links - Desktop */}
              <div className="flex items-center gap-3 ml-auto">
                {!user ? (
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-[#E6E6FA]/30 transition-all font-medium"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                ) : (
                  <>
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {user.nome}
                    </span>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all font-medium"
                      >
                        Admin
                      </Link>
                    )}
                    {(user.role === 'editor' || user.role === 'admin') && (
                      <Link
                        to="/editor"
                        className="px-4 py-2 rounded-lg bg-[#A8DADC] text-white hover:bg-[#A8DADC]/90 transition-all font-medium"
                      >
                        Editor
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="px-4 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-[#E6E6FA]/30 transition-all font-medium"
                    >
                      Sair
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center flex-shrink-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar palestras..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 px-4 py-2 pl-10 rounded-full border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none focus:ring-2 focus:ring-[#A8DADC]/20 transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </form>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-[#E6E6FA]/30 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 space-y-3 border-t border-[#E6E6FA] pt-4">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-[#E6E6FA]/30 transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Início</span>
              </Link>
              <Link
                to="/pages/o-projeto"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-[#E6E6FA]/30 transition-all"
              >
                O Projeto
              </Link>

              {/* Mobile Conteúdos Accordion */}
              <div>
                <button
                  onClick={() => setConteudosOpen(!conteudosOpen)}
                  className="flex items-center justify-between w-full px-4 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-[#E6E6FA]/30 transition-all"
                >
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Conteúdos</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${conteudosOpen ? 'rotate-180' : ''}`} />
                </button>
                {conteudosOpen && (
                  <div className="mt-2 ml-4 space-y-2">
                    <Link
                      to="/conteudos/palestras"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-[#E6E6FA]/30 transition-all"
                    >
                      <Play className="w-4 h-4" />
                      <span>Palestras e Depoimentos</span>
                    </Link>
                    <Link
                      to="/conteudos/exercicios"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-[#E6E6FA]/30 transition-all"
                    >
                      <Dumbbell className="w-4 h-4" />
                      <span>Exercícios</span>
                    </Link>
                    <Link
                      to="/conteudos/estudos"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-[#E6E6FA]/30 transition-all"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Pesquisas</span>
                    </Link>
                    <Link
                      to="/conteudos/cartilhas"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-[#E6E6FA]/30 transition-all"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Cartilhas</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="px-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar conteúdos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 rounded-full border-2 border-[#E6E6FA] focus:border-[#A8DADC] focus:outline-none focus:ring-2 focus:ring-[#A8DADC]/20"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </form>

              {/* Auth Links - Mobile */}
              <div className="border-t border-[#E6E6FA] pt-4 mt-4 space-y-3">
                {!user ? (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-[#E6E6FA]/30 transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                ) : (
                  <>
                    <div className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{user.nome}</span>
                    </div>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all mx-4"
                      >
                        <span>Admin</span>
                      </Link>
                    )}
                    {(user.role === 'editor' || user.role === 'admin') && (
                      <Link
                        to="/editor"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#A8DADC] text-white hover:bg-[#A8DADC]/90 transition-all mx-4"
                      >
                        <span>Editor</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-[#E6E6FA]/30 transition-all w-full text-left"
                    >
                      <span>Sair</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-gradient-to-b from-[#FFF8F0] to-[#E6E6FA]/30 mt-12">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* NeuroMat */}
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-4">Uma iniciativa</h3>
              <a
                href="http://neuromat.numec.prp.usp.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block transition-transform hover:scale-105"
              >
                <div className="bg-white p-8 rounded-lg shadow-sm border hover:shadow-md transition-shadow min-h-[180px] flex flex-col items-center justify-center">
                  <div className="text-primary font-bold text-2xl mb-2">NeuroMat</div>
                  <div className="text-xs text-muted-foreground text-center max-w-[200px]">
                    Research, Innovation and Dissemination Center for Neuromathematics
                  </div>
                </div>
              </a>
            </div>

            {/* FAPESP */}
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-4">Apoio</h3>
              <a
                href="http://www.fapesp.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block transition-transform hover:scale-105"
              >
                <div className="bg-gradient-to-br from-[#E6E6FA] to-[#A8DADC] p-8 rounded-lg shadow-sm border-2 border-[#A8DADC] hover:shadow-md hover:border-primary transition-all min-h-[180px] flex items-center justify-center">
                  <img
                    src="https://fapesp.br/assets/img/logo-simple2.png"
                    alt="Logo FAPESP"
                    className="max-w-[180px] h-auto"
                  />
                </div>
              </a>
            </div>

            {/* Facebook / Redes Sociais */}
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-4">Siga-nos</h3>
              <a
                href="https://www.facebook.com/redeAMPARO"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block transition-transform hover:scale-105"
              >
                <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-center gap-2 text-primary font-bold text-xl">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Rede AMPARO
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Conecte-se com nossa comunidade
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Localização */}
          <div className="border-t pt-8 pb-6">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
              <a
                href="https://maps.google.com/?q=Av.+Prof.+Luciano+Gualberto,+1171+-+Butantã,+São+Paulo,+SP,+Brazil"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:text-primary transition-colors text-center"
              >
                Av. Prof. Luciano Gualberto, 1171 - Butantã, São Paulo, SP, Brasil
              </a>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <Link to="/pages/termos-de-uso" className="hover:text-primary transition-colors">
                  Termos de uso
                </Link>
                <span>|</span>
                <Link to="/pages/politica-de-privacidade" className="hover:text-primary transition-colors">
                  Política de privacidade
                </Link>
              </div>
              <div className="text-center md:text-right">
                Esta página está licenciada sob a{' '}
                <a
                  href="https://www.mozilla.org/en-US/MPL/2.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors underline"
                >
                  Mozilla Public License Version 2.0
                </a>
              </div>
            </div>
            <div className="text-center mt-4 text-xs text-muted-foreground">
              © {new Date().getFullYear()} AMPARO - Rede de Apoio NeuroMat a Amigos e Pessoas com Doença de Parkinson
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
