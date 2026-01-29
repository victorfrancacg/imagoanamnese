# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Sobre o Projeto

Sistema de anamnese clínica para exames de imagem (Ressonância Magnética, Tomografia, Mamografia e Densitometria).

## Comandos

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run lint     # ESLint
npm run preview  # Preview do build
```

## Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (Auth, Database PostgreSQL, Storage)
- **Data Fetching**: TanStack React Query
- **Roteamento**: React Router DOM
- **PDF**: jsPDF

## Arquitetura

### Três Módulos Independentes

O sistema possui três módulos com rotas separadas:

1. **Paciente** (`/`) - Questionário público sem autenticação
2. **Técnico** (`/tecnico/*`) - Painel para técnicos revisarem e finalizarem questionários
3. **Admin** (`/admin/*`) - Painel para gerenciar técnicos

### Autenticação Dual

O sistema usa **dois clientes Supabase separados** com sessões independentes para permitir login simultâneo de admin e técnico no mesmo navegador:

- `supabaseAdmin` (sessionStorage: `admin-*`) → `AdminAuthContext`
- `supabaseTecnico` (sessionStorage: `tecnico-*`) → `AuthContext`

Arquivos relevantes:
- `src/integrations/supabase/adminClient.ts`
- `src/integrations/supabase/tecnicoClient.ts`
- `src/contexts/AdminAuthContext.tsx`
- `src/contexts/AuthContext.tsx`

### Fluxo de Status dos Questionários

**Mamografia / Densitometria:**
```
paciente_preenchendo → aguardando_operador → finalizado
```

**Ressonância Magnética / Tomografia:**
```
paciente_preenchendo → aguardando_assistente → (telecomando?)
                                                 ├─ Sim → finalizado
                                                 └─ Não → aguardando_operador → finalizado
```

### Geração de PDF

O sistema gera PDFs usando jsPDF com arquitetura modular:

```
src/lib/pdf/
├── index.ts                 # Re-exports de todas as funções
├── core/                    # Utilitários compartilhados
│   ├── types.ts
│   ├── constants.ts
│   ├── layout.ts
│   ├── builder.ts
│   └── formatters.ts
└── exames/                  # Um diretório por tipo de exame
    ├── mamografia/
    ├── densitometria/
    ├── ressonancia/
    └── tomografia/
```

Cada exame tem:
- `fields.ts` - Campos específicos do questionário
- `termo.ts` - Termo de consentimento
- `index.ts` - Funções `generate{Exame}PDF` e `generateFinal{Exame}PDF`

### Tipos de Usuário

| Tipo | Status | Acesso |
|------|--------|--------|
| `admin` | `ativo` | Painel admin, gerenciamento de técnicos |
| `tecnico` | `pendente` | Aguardando aprovação |
| `tecnico` | `ativo` | Painel técnico, revisão de questionários |
| `tecnico` | `inativo` | Acesso bloqueado |

### Banco de Dados (Supabase)

**Tabelas principais:**
- `profiles` - Perfis de usuários (admin/técnico)
- `questionarios` - Questionários de anamnese

**Storage:**
- `questionarios-pdfs` - PDFs gerados dos questionários

**Tipos:** `src/integrations/supabase/types.ts` contém os tipos gerados + interface manual `RespostasCompletas`

## Convenções

- Código e comentários em **português**
- Componentes em `PascalCase`
- Hooks começam com `use`
- Arquivos de página em `PascalCase.tsx`
- Utilitários em `camelCase.ts`

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

---

## Auditoria de Segurança (janeiro/2026)

### CRITICAL

#### 1. Políticas RLS totalmente abertas na tabela `questionarios`
**Status:** Não corrigido
**Arquivo:** `supabase/migrations/20260106185752_remote_schema.sql` (linhas 93-117)

As policies `Anyone can insert/read/update` usam `using (true)` / `with check (true)`, permitindo que qualquer pessoa sem autenticação leia, insira e atualize todos os questionários médicos via API. Combinado com a key exposta (#2), permite acesso total aos dados de pacientes.

**Ação:** Criar nova migration restringindo políticas. INSERT pode continuar anônimo (paciente preenche sem login), mas SELECT e UPDATE devem exigir autenticação ou restringir por escopo (ex: paciente só acessa o próprio questionário).

**Risco de quebra:** ALTO — o módulo paciente depende de acesso anônimo. Testar extensivamente.

#### 2. Credenciais Supabase commitadas no repositório
**Status:** Não corrigido
**Arquivo:** `.env`

Publishable key e URL do projeto estão no git. Qualquer pessoa com acesso ao repositório pode usar para acessar a API.

**Ação:** Adicionar `.env` ao `.gitignore`, remover do histórico (`git rm --cached .env`), rotacionar a key no painel Supabase.

**Risco de quebra:** Nenhum.

#### 3. Dados sensíveis enviados a webhook externo sem proteção
**Status:** Não corrigido
**Arquivo:** `src/hooks/useQuestionarioSave.ts` (linhas 18, 105-112)

PHI (CPF, nome, histórico médico, telefone) enviado via `fetch` com `mode: "no-cors"` para webhook n8n. Sem timeout, sem tratamento de erro robusto.

**Ação:** Adicionar timeout com AbortController (5s), remover `mode: "no-cors"`, mover URL para variável de ambiente.

**Risco de quebra:** Baixo.

### HIGH

#### 4. Registro de técnico sem validação server-side
**Status:** Não corrigido
**Arquivos:** `src/pages/tecnico/Register.tsx`, função RPC `register_technician`

CPF validado apenas por contagem de dígitos no frontend. Sem checksum, sem verificação de credenciais profissionais no servidor.

**Ação:** Adicionar validação de formato CPF (`^\d{11}$`) e checksum na função RPC.

**Risco de quebra:** Baixo (apenas novos registros afetados).

#### 5. Sem auditoria de ações admin
**Status:** Não corrigido
**Arquivos:** `supabase/functions/approve-technician/index.ts`, `supabase/functions/reject-technician/index.ts`

Aprovação/rejeição de técnicos sem log de quem fez, quando ou de onde.

**Ação:** Criar tabela `admin_audit_logs` e registrar ações nas Edge Functions.

**Risco de quebra:** Nenhum (aditivo).

#### 6. Qualquer técnico pode editar qualquer questionário
**Status:** Não corrigido
**Arquivo:** `src/hooks/useQuestionarioUpdate.ts`

Sem RLS restritiva, qualquer técnico autenticado pode atualizar qualquer questionário de qualquer paciente.

**Ação:** Adicionar RLS policy restringindo updates por role e/ou atribuição.

**Risco de quebra:** ALTO — precisa garantir que técnicos continuem editando os questionários que atendem.

#### 7. CORS `Access-Control-Allow-Origin: *` nas Edge Functions
**Status:** Não corrigido
**Arquivos:** Todas as Edge Functions (`approve-technician`, `reject-technician`, `sync-external-db`)

Qualquer site pode chamar as funções de aprovar/rejeitar técnicos.

**Ação:** Substituir `*` por lista de origens permitidas (produção + dev).

**Risco de quebra:** Médio — se a lista não incluir todos os domínios usados, as chamadas falham.

#### 8. Validação de input apenas no frontend
**Status:** Não corrigido
**Arquivo:** `src/lib/validation.ts`

Sem constraints no banco para CPF, telefone, peso, altura. Dados inválidos podem ser inseridos via API.

**Ação:** Adicionar CHECK constraints na tabela `questionarios`. Verificar dados existentes antes de aplicar.

**Risco de quebra:** Médio — migration falha se já existirem dados inválidos no banco.

### MEDIUM

#### 9. sessionStorage não criptografado
**Status:** Não corrigido
**Arquivo:** `src/pages/tecnico/MamografiaDesenho.tsx`

Desenhos mamográficos armazenados em base64 no sessionStorage, visíveis no DevTools.

**Ação:** Criptografar antes de armazenar; limpar no unload da página.

#### 10. Funções admin sem 2FA
**Status:** Não corrigido
**Arquivo:** `supabase/functions/approve-technician/index.ts`

Ações admin dependem apenas de JWT. Token vazado = controle total.

**Ação:** Implementar 2FA ou re-autenticação para ações sensíveis.

#### 11. Webhook URL hardcoded sem timeout
**Status:** Não corrigido
**Arquivo:** `src/hooks/useQuestionarioSave.ts` (linha 18)

URL exposta no código, fetch sem timeout pode travar indefinidamente.

**Ação:** Mover para variável de ambiente, adicionar timeout.

### LOW

#### 12. Sem Content Security Policy (CSP)
**Status:** Não corrigido

Sem headers CSP configurados, aumentando o impacto de eventual XSS.

**Ação:** Configurar CSP no servidor/deploy.
