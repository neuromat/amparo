// Configuração da API
// Em desenvolvimento, usa localhost:5000
// Em produção, usa caminhos relativos (mesma origem)
export const API_BASE_URL = import.meta.env.MODE === 'production'
  ? ''
  : 'http://localhost:5000';

export const API_ENDPOINTS = {
  stats: `${API_BASE_URL}/api/stats`,
  conteudosStats: `${API_BASE_URL}/api/conteudos/stats`,

  // Legacy endpoints (manter para compatibilidade)
  palestras: `${API_BASE_URL}/api/palestras`,

  // Novos endpoints de conteúdos
  conteudos: {
    palestras: `${API_BASE_URL}/api/conteudos/palestras`,
    exercicios: `${API_BASE_URL}/api/conteudos/exercicios`,
    estudos: `${API_BASE_URL}/api/conteudos/estudos`,
    cartilhas: `${API_BASE_URL}/api/conteudos/cartilhas`,
  },

  pages: `${API_BASE_URL}/api/pages`,
};
