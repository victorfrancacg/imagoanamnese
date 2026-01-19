import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import imagoLogo from '@/assets/imago-logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabaseTecnico as supabase } from '@/integrations/supabase/tecnicoClient';

type Profissao = 'biomedico' | 'tecnico_radiologia' | 'tecnico_enfermagem' | 'assistente_sala';

// Lista de UFs brasileiras
const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function Register() {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    password: '',
    confirmPassword: '',
    profissao: '' as Profissao | '',
    crbmRegiao: '',
    crbmNumero: '',
    crtrRegiao: '',
    crtrNumero: '',
    corenUf: '',
    corenNumero: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Formata o registro profissional baseado na profissão selecionada
  const formatarRegistroProfissional = (): string | null => {
    switch (formData.profissao) {
      case 'biomedico':
        return `CRBM-${formData.crbmRegiao} nº ${formData.crbmNumero}`;
      case 'tecnico_radiologia':
        return `CRTR-${formData.crtrRegiao} nº ${formData.crtrNumero}`;
      case 'tecnico_enfermagem':
        return `COREN-${formData.corenUf} ${formData.corenNumero}`;
      case 'assistente_sala':
        return null;
      default:
        return null;
    }
  };

  // Verifica se os campos de registro estão preenchidos (quando aplicável)
  const isRegistroValido = (): boolean => {
    switch (formData.profissao) {
      case 'biomedico':
        return !!formData.crbmRegiao && !!formData.crbmNumero;
      case 'tecnico_radiologia':
        return !!formData.crtrRegiao && !!formData.crtrNumero;
      case 'tecnico_enfermagem':
        return !!formData.corenUf && !!formData.corenNumero;
      case 'assistente_sala':
        return true;
      default:
        return false;
    }
  };

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
      if (!formData.profissao) {
        throw new Error('Selecione uma profissão');
      }

      if (!isRegistroValido()) {
        throw new Error('Preencha os campos do registro profissional');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('As senhas não coincidem');
      }

      if (formData.password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }

      // Formatar o registro profissional
      const registroProfissional = formatarRegistroProfissional();

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
        p_professional_id: registroProfissional,
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
            src={imagoLogo}
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

            {/* Select de Profissão */}
            <div className="space-y-2">
              <Label>Profissão</Label>
              <Select
                value={formData.profissao}
                onValueChange={(value: Profissao) =>
                  setFormData({ ...formData, profissao: value })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione sua profissão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="biomedico">Biomédico</SelectItem>
                  <SelectItem value="tecnico_radiologia">Técnico de Radiologia</SelectItem>
                  <SelectItem value="tecnico_enfermagem">Técnico de Enfermagem</SelectItem>
                  <SelectItem value="assistente_sala">Assistente de Sala</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campos condicionais - CRBM (Biomédico) */}
            {formData.profissao === 'biomedico' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Região CRBM</Label>
                  <Select
                    value={formData.crbmRegiao}
                    onValueChange={(value) =>
                      setFormData({ ...formData, crbmRegiao: value })
                    }
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Região" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1ª Região</SelectItem>
                      <SelectItem value="2">2ª Região</SelectItem>
                      <SelectItem value="3">3ª Região</SelectItem>
                      <SelectItem value="4">4ª Região</SelectItem>
                      <SelectItem value="5">5ª Região</SelectItem>
                      <SelectItem value="6">6ª Região</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="crbmNumero">Número</Label>
                  <Input
                    id="crbmNumero"
                    type="text"
                    placeholder="Ex: 1234"
                    value={formData.crbmNumero}
                    onChange={(e) =>
                      setFormData({ ...formData, crbmNumero: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Campos condicionais - CRTR (Técnico de Radiologia) */}
            {formData.profissao === 'tecnico_radiologia' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Região CRTR</Label>
                  <Select
                    value={formData.crtrRegiao}
                    onValueChange={(value) =>
                      setFormData({ ...formData, crtrRegiao: value })
                    }
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Região" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={String(num)}>
                          {num}ª Região
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="crtrNumero">Número</Label>
                  <Input
                    id="crtrNumero"
                    type="text"
                    placeholder="Ex: 12345"
                    value={formData.crtrNumero}
                    onChange={(e) =>
                      setFormData({ ...formData, crtrNumero: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Campos condicionais - COREN (Técnico de Enfermagem) */}
            {formData.profissao === 'tecnico_enfermagem' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>UF</Label>
                  <Select
                    value={formData.corenUf}
                    onValueChange={(value) =>
                      setFormData({ ...formData, corenUf: value })
                    }
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {UFS.map((uf) => (
                        <SelectItem key={uf} value={uf}>
                          {uf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="corenNumero">Número</Label>
                  <Input
                    id="corenNumero"
                    type="text"
                    placeholder="Ex: 123456"
                    value={formData.corenNumero}
                    onChange={(e) =>
                      setFormData({ ...formData, corenNumero: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Mensagem para Assistente de Sala */}
            {formData.profissao === 'assistente_sala' && (
              <p className="text-sm text-muted-foreground">
                Assistentes de sala não necessitam de registro profissional.
              </p>
            )}

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
