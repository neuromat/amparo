// Tipos de conteúdo disponíveis
export type ContentType = 'palestras' | 'exercicios' | 'estudos' | 'cartilhas';

// Interface base para todos os conteúdos
export interface BaseContent {
  id: number;
  title: string;
  description?: string;
  published_date?: string;
  mockup?: boolean; // Indica se é conteúdo mockup/fictício para testes
}

// Vídeo (usado em palestras e exercícios)
export interface Video {
  id: number;
  video: string;
  blog_post_id?: number;
}

// Palestra
export interface Palestra extends BaseContent {
  slug: string;
  speaker: string;
  moderator: string;
  image: string;
  publish: boolean;
  banner: boolean;
  date_time: string;
  resume_speaker: string;
  affiliation: string;
  body: string;
  videos: Video[];
}

// Exercício
export interface Exercicio extends BaseContent {
  instructor: string;
  duration_minutes: number;
  difficulty_level: string;
  category: string;
  video_url: string;
  thumbnail?: string;
  tags: string[];
  equipment_needed: string[];
  body: string;
}

// Estudo
export interface Estudo extends BaseContent {
  author: string;
  content_type: 'html' | 'pdf' | 'external_link' | 'video';
  category: string;
  tags: string[];
  body: string;
  external_link?: string | null;
  pdf_file?: string | null;
  reading_time_minutes: number;
}

// Cartilha
export interface Cartilha extends BaseContent {
  blog_post_id: number;
  pdf_file: string;
  speaker: string;
  affiliation: string;
  resume_speaker?: string;
}

// Resposta paginada genérica
export interface PaginatedResponse<T> {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  data?: T[];
}

// Respostas específicas por tipo de conteúdo
export interface PalestrasResponse extends PaginatedResponse<Palestra> {
  palestras: Palestra[];
}

export interface ExerciciosResponse extends PaginatedResponse<Exercicio> {
  exercicios: Exercicio[];
}

export interface EstudosResponse extends PaginatedResponse<Estudo> {
  estudos: Estudo[];
}

export interface CartilhasResponse extends PaginatedResponse<Cartilha> {
  cartilhas: Cartilha[];
}

// Estatísticas
export interface Stats {
  total_usuarios: number;
  total_palestras: number;
  total_videos: number;
  total_exercicios: number;
  total_estudos: number;
  total_cartilhas: number;
  total_conteudos: number;
  usuarios_por_tipo?: {
    [key: string]: number;
  };
}
