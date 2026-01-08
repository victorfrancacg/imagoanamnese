import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabaseTecnico as supabase } from '@/integrations/supabase/tecnicoClient';

export default function Register() {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    password: '',
    confirmPassword: '',
    professionalId: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações
      if (formData.password !== formData.confirmPassword) {
        throw new Error('As senhas não coincidem');
      }

      if (formData.password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }

      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nome: formData.nome,
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Erro ao criar usuário');
      }

      // 2. Criar perfil com status pendente usando função RPC (bypassa RLS)
      const { error: profileError } = await supabase.rpc('register_technician', {
        user_id: authData.user.id,
        p_nome: formData.nome,
        p_cpf: formData.cpf,
        p_professional_id: formData.professionalId,
      });

      if (profileError) throw profileError;

      // 3. Fazer logout imediato (técnico não pode logar até ser aprovado)
      await supabase.auth.signOut();

      setSuccess(true);
      toast({
        title: 'Cadastro enviado com sucesso!',
        description: 'Aguarde a aprovação do administrador para acessar o sistema.',
      });

      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate('/tecnico/login');
      }, 3000);
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);
      toast({
        title: 'Erro ao cadastrar',
        description: error.message || 'Ocorreu um erro ao processar seu cadastro.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle2 className="mx-auto h-16 w-16 text-green-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Cadastro Enviado!</h2>
              <p className="text-muted-foreground mb-4">
                Seu cadastro foi enviado com sucesso e está aguardando aprovação do administrador.
              </p>
              <p className="text-sm text-muted-foreground">
                Você receberá uma confirmação quando seu acesso for liberado.
              </p>
              <div className="mt-6">
                <Link to="/tecnico/login">
                  <Button>Voltar para Login</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <img
            src="/src/assets/imago-logo.png"
            alt="IMAGO Radiologia"
            className="h-12 mx-auto"
          />
          <div>
            <CardTitle className="text-2xl">Cadastro de Técnico</CardTitle>
            <CardDescription>
              Preencha seus dados para solicitar acesso ao sistema
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                name="nome"
                type="text"
                placeholder="Seu nome completo"
                value={formData.nome}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                name="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="professionalId">COREN/CRM</Label>
              <Input
                id="professionalId"
                name="professionalId"
                type="text"
                placeholder="Número do registro profissional"
                value={formData.professionalId}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Digite a senha novamente"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Link to="/tecnico/login" className="flex-1">
                <Button type="button" variant="outline" className="w-full" disabled={loading}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              </Link>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cadastrar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
