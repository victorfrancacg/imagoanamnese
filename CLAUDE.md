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

## Pendências Técnicas

### Bug Intermitente: Loading Infinito na Finalização (Risco Alto)
**Status:** Não resolvido - Monitorar

**Descrição:** Ao finalizar um questionário de RM/TC como assistente, o sistema pode entrar em loading infinito na primeira tentativa após login. Após refresh (F5), funciona normalmente.

**Sintomas:**
- Botão "Finalizar" fica em estado de loading indefinidamente
- Console mostra múltiplos `Loading profile for user` sem completar
- Evento `SIGNED_IN` dispara durante a mutation

**Logs característicos:**
```
AuthContext.tsx: Auth state changed: SIGNED_IN
AuthContext.tsx: Loading profile for user: [id]
(sem "Profile loaded successfully" depois)
```

**Causa provável:** Race condition entre:
1. Mutation chamando Supabase (upload/update)
2. Supabase fazendo refresh de token
3. AuthContext disparando `loadProfile` devido a evento de auth
4. Closure desatualizada no `onAuthStateChange` (linha 141) - `profile` sempre é `null`

**Arquivo afetado:** `src/pages/tecnico/QuestionnaireSignature.tsx`

**Correções aplicadas (janeiro/2026):**
1. `onSuccess` agora usa `async/await` no `invalidateQueries`
2. `uploadFinalPDF` agora lança exceções em vez de retornar `null`
3. Logs de debug adicionados com prefixo `[Finalizar]`

**Correção pendente:** Refatorar `src/contexts/AuthContext.tsx` para usar `useRef` no lugar da closure desatualizada do `profile` (linha 141-142).

**Como reproduzir:** Fazer login → navegar até questionário RM → assinar → clicar "Finalizar" (pode não ocorrer sempre).

---

### useAdminQuestionnaireSearch.ts (Risco Médio)
**Status:** Monitorar

O hook `src/hooks/useAdminQuestionnaireSearch.ts` usa um padrão de query que pode causar problemas de loading infinito em certas condições.

**Problema potencial:** O `queryKey` inclui o objeto `filters` inteiro e o `enabled` depende dos valores dos filtros.

**Solução recomendada:** Refatorar para usar `enabled: false` com disparo manual via `refetch()`.
