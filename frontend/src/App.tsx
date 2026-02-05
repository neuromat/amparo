import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Admin } from './pages/Admin';
import { Editor } from './pages/Editor';
import { Blog } from './pages/Blog';
import { PalestraDetail } from './pages/PalestraDetail';
import { Page } from './pages/Page';
import { PesquisadorForm } from './pages/PesquisadorForm';

// Páginas de Conteúdos
import { ExerciciosList } from './pages/conteudos/ExerciciosList';
import { ExercicioDetail } from './pages/conteudos/ExercicioDetail';
import { EstudosList } from './pages/conteudos/EstudosList';
import { EstudoDetail } from './pages/conteudos/EstudoDetail';
import { CartilhasList } from './pages/conteudos/CartilhasList';
import { CartilhaDetail } from './pages/conteudos/CartilhaDetail';

// Páginas do Editor
import { PalestraForm } from './pages/editor/PalestraForm';
import { ExercicioForm } from './pages/editor/ExercicioForm';
import { EstudoForm } from './pages/editor/EstudoForm';
import { CartilhaForm } from './pages/editor/CartilhaForm';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota de Login (sem Layout) */}
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="cadastro-pesquisador" element={<PesquisadorForm />} />

            {/* Rota Admin (protegida) */}
            <Route path="admin" element={
              <ProtectedRoute requireAdmin>
                <Admin />
              </ProtectedRoute>
            } />

            {/* Rotas Editor (protegidas) */}
            <Route path="editor" element={
              <ProtectedRoute requireEditor>
                <Editor />
              </ProtectedRoute>
            } />
            <Route path="editor/palestras/:id" element={
              <ProtectedRoute requireEditor>
                <PalestraForm />
              </ProtectedRoute>
            } />
            <Route path="editor/exercicios/:id" element={
              <ProtectedRoute requireEditor>
                <ExercicioForm />
              </ProtectedRoute>
            } />
            <Route path="editor/estudos/:id" element={
              <ProtectedRoute requireEditor>
                <EstudoForm />
              </ProtectedRoute>
            } />
            <Route path="editor/cartilhas/:id" element={
              <ProtectedRoute requireEditor>
                <CartilhaForm />
              </ProtectedRoute>
            } />

            {/* Redirects para compatibilidade */}
            <Route path="blog" element={<Navigate to="/conteudos/palestras" replace />} />
            <Route path="palestra/:id" element={<Navigate to="/conteudos/palestras/:id" replace />} />

            {/* Rotas de Conteúdos */}
            <Route path="conteudos">
              <Route path="palestras" element={<Blog />} />
              <Route path="palestras/:id" element={<PalestraDetail />} />
              <Route path="exercicios" element={<ExerciciosList />} />
              <Route path="exercicios/:id" element={<ExercicioDetail />} />
              <Route path="estudos" element={<EstudosList />} />
              <Route path="estudos/:id" element={<EstudoDetail />} />
              <Route path="cartilhas" element={<CartilhasList />} />
              <Route path="cartilhas/:id" element={<CartilhaDetail />} />
            </Route>

            {/* Páginas Estáticas */}
            <Route path="pages/:slug" element={<Page />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
