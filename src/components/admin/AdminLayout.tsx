import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AdminLayout() {
  const { user, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/admin/login');
      toast({
        title: 'Logout realizado',
        description: 'Você saiu do sistema com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao sair',
        description: 'Não foi possível realizar o logout.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/admin" className="flex items-center gap-2">
                <img
                  src="/src/assets/imago-logo.png"
                  alt="IMAGO Radiologia"
                  className="h-8"
                />
                <span className="font-semibold text-lg">Portal Admin</span>
              </Link>

              <nav className="hidden md:flex items-center gap-4">
                <Link to="/admin">
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/admin/tecnicos-pendentes">
                  <Button variant="ghost" size="sm">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Técnicos Pendentes
                  </Button>
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-sm text-muted-foreground">
                {user?.email}
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} IMAGO Radiologia - Painel Administrativo
        </div>
      </footer>
    </div>
  );
}
