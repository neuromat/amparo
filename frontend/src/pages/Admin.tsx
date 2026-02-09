import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/config/api';
import { Users, Check, X, Copy } from 'lucide-react';

interface PendingUser {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  created_at: string;
}

export function Admin() {
  const { user, logout } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvedInfo, setApprovedInfo] = useState<{ username: string; password: string } | null>(null);

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/pending-users`, {
        credentials: 'include'
      });
      const data = await res.json();
      setPendingUsers(data);
    } catch (err) {
      console.error('Erro ao carregar usuários pendentes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/approve-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user_id: userId, role: 'editor' })
      });

      const data = await res.json();
      setApprovedInfo({ username: data.username, password: data.temp_password });
      loadPendingUsers();
    } catch (err) {
      alert('Erro ao aprovar usuário');
    }
  };

  const handleReject = async (userId: number) => {
    if (!confirm('Tem certeza que deseja rejeitar este usuário?')) return;

    try {
      await fetch(`${API_BASE_URL}/api/auth/reject-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user_id: userId })
      });

      loadPendingUsers();
    } catch (err) {
      alert('Erro ao rejeitar usuário');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Admin - AMPARO</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Olá, {user?.nome}
          </span>
          <Button variant="outline" onClick={logout}>Sair</Button>
        </div>
      </div>

      {/* Usuários Pendentes */}
      <Card className="border-2 border-[#E6E6FA]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Usuários Aguardando Aprovação ({pendingUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando...</p>
          ) : pendingUsers.length === 0 ? (
            <p className="text-muted-foreground">Nenhum usuário aguardando aprovação</p>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.nome}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-sm text-muted-foreground">{user.telefone}</p>
                    <p className="text-xs text-muted-foreground">
                      Cadastrado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => handleApprove(user.id)}
                    >
                      <Check className="w-4 h-4" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-2"
                      onClick={() => handleReject(user.id)}
                    >
                      <X className="w-4 h-4" />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de credenciais aprovadas */}
      {approvedInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Usuário Aprovado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Envie estas credenciais ao usuário de forma segura. Esta informação não será exibida novamente.
              </p>
              <div className="space-y-2 bg-muted p-4 rounded-lg font-mono text-sm">
                <div className="flex justify-between items-center">
                  <span><strong>Usuário:</strong> {approvedInfo.username}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigator.clipboard.writeText(approvedInfo.username)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span><strong>Senha:</strong> {approvedInfo.password}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigator.clipboard.writeText(approvedInfo.password)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <Button className="w-full" onClick={() => setApprovedInfo(null)}>
                Fechar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
