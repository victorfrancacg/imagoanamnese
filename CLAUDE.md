# ImagoAnamnese

Sistema de anamnese clínica para exames de imagem (Ressonância Magnética, Tomografia, Mamografia e Densitometria).

## Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (Auth, Database PostgreSQL, Storage)
- **Data Fetching**: TanStack React Query
- **Roteamento**: React Router DOM
- **PDF**: jsPDF

## Estrutura de Pastas

```
src/
├── components/       # Componentes reutilizáveis
│   ├── admin/        # Componentes do painel admin
│   ├── tecnico/      # Componentes do painel técnico
│   └── ui/           # Componentes shadcn/ui
├── contexts/         # React Contexts (Auth)
├── hooks/            # Custom hooks
├── integrations/     # Configurações Supabase
│   └── supabase/
│       ├── adminClient.ts    # Cliente Supabase para admin
│       └── tecnicoClient.ts  # Cliente Supabase para técnico
├── lib/              # Utilitários e helpers
├── pages/            # Páginas da aplicação
│   ├── admin/        # Páginas do painel admin
│   ├── tecnico/      # Páginas do painel técnico
│   └── paciente/     # Páginas do questionário do paciente
└── types/            # Definições TypeScript
```

## Comandos

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview do build
```

## Fluxo de Status dos Questionários

### Mamografia / Densitometria
```
paciente_preenchendo → aguardando_operador → finalizado
```

### Ressonância Magnética / Tomografia
```
paciente_preenchendo → aguardando_assistente → (telecomando?)
                                                 ├─ Sim → finalizado
                                                 └─ Não → aguardando_operador → finalizado
```

## Autenticação

O sistema usa **dois clientes Supabase separados** com sessões independentes:

- `supabaseAdmin` (sessionStorage: `admin-*`) - Painel administrativo
- `supabaseTecnico` (sessionStorage: `tecnico-*`) - Painel técnico

### Contexts
- `AdminAuthContext` - Auth para `/admin/*`
- `AuthContext` - Auth para `/tecnico/*`

## Tipos de Usuário

| Tipo | Status | Acesso |
|------|--------|--------|
| `admin` | `ativo` | Painel admin, gerenciamento de técnicos |
| `tecnico` | `pendente` | Aguardando aprovação |
| `tecnico` | `ativo` | Painel técnico, revisão de questionários |
| `tecnico` | `inativo` | Acesso bloqueado |

## Convenções

- Código e comentários em **português**
- Componentes em `PascalCase`
- Hooks começam com `use`
- Arquivos de página em `PascalCase.tsx`
- Utilitários em `camelCase.ts`

## Banco de Dados (Supabase)

### Tabelas principais
- `profiles` - Perfis de usuários (admin/técnico)
- `questionarios` - Questionários de anamnese

### Storage
- `questionarios-pdfs` - PDFs gerados dos questionários
