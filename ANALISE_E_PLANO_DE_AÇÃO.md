# Análise Técnica e Plano de Ação - WebApp

## 📋 1. RESUMO EXECUTIVO

- **Visão geral do sistema**: Trata-se de um sistema de software como serviço (SaaS) multi-tenant, focado no gerenciamento de restaurantes. A aplicação é construída como um Progressive Web App (PWA) com potencial para ser distribuída em lojas de aplicativos móveis via Capacitor.
- **Principais números (preliminares)**: A análise inicial do código-fonte revela uma estrutura complexa com dezenas de componentes, múltiplos contextos e uma arquitetura de backend serverless bem definida no Supabase.
- **Status geral de saúde do projeto**: O projeto aparenta ter uma boa saúde técnica. Utiliza tecnologias modernas, possui uma estrutura de código organizada, e inclui ferramentas de qualidade de código como TypeScript e ESLint. A presença de testes (`vitest`, `@testing-library`) é um bom indicativo, embora a cobertura precise ser analisada.
- **Principais problemas encontrados**: Análise a ser realizada.

---

## 🏗️ 2. ARQUITETURA DO SISTEMA

### Diagrama de Módulos (Alto Nível)

```mermaid
graph TD
    subgraph Frontend (React/Vite)
        A[Auth - Login/Cadastro] --> B{Layout Principal};
        B --> C[Dashboard de Analytics];
        B --> D[Gerenciamento de Restaurantes];
        B --> E[Gestão de Campanhas];
        B --> F[Hub de Feedback/NPS];
        B --> G[Funcionalidades de Gamificação];
        B --> H[Configurações de Faturamento];
    end

    subgraph Backend (Supabase)
        I[Auth]
        J[Database - PostgreSQL]
        K[Storage]
        L[Functions - Deno]
    end

    Frontend --> Backend;
    C -- Interage com --> J;
    D -- Interage com --> J;
    E -- Interage com --> J;
    F -- Interage com --> J;
    G -- Interage com --> J;
    A -- Interage com --> I;
    Frontend -- Notificações em tempo real --> M[Realtime];
    Backend -- Webhooks --> N[Stripe];
```

### Stack Tecnológica Completa

#### Frontend
- **Framework**: React 18.3.1
- **Linguagem**: TypeScript 5.9.2
- **Build Tool**: Vite 7.1.4
- **Roteamento**: React Router DOM 7.8.2
- **Gerenciamento de Estado**:
  - Zustand 5.0.8 (estado global da UI)
  - TanStack Query 5.90.5 (gerenciamento de estado do servidor, cache, etc.)
- **UI Components**:
  - shadcn/ui (baseado em Radix UI e Tailwind CSS)
  - Radix UI (primitivos de componentes acessíveis)
- **Estilização**: Tailwind CSS 3.4.17
- **Formulários**: React Hook Form 7.65.0 com Zod 3.25.76 para validação de schema.
- **Animação**: Framer Motion 12.23.12
- **Gráficos e Visualização de Dados**: Recharts 2.15.4
- **Mobile**: Capacitor 7.4.3 (permite empacotar como app nativo)
- **PWA**: `vite-plugin-pwa` para funcionalidades de Progressive Web App.

#### Backend
- **Plataforma**: Supabase
- **Banco de Dados**: PostgreSQL (via Supabase)
- **Autenticação**: Supabase Auth
- **Funções Serverless**: Supabase Edge Functions (escritas em TypeScript/Deno)
- **Armazenamento de Arquivos**: Supabase Storage

#### Testes
- **Framework de Testes**: Vitest 3.2.4
- **Utilitários de Teste**: Testing Library (React, DOM, Jest-DOM)

#### Qualidade de Código e Ferramentas
- **Linting**: ESLint 9.35.0
- **Verificação de Tipos**: TypeScript 5.9.2
- **Gerenciador de Pacotes**: npm (inferido pelo `package-lock.json`)

#### Integrações Externas
- **Pagamentos**: Stripe 18.4.0
- **Monitoramento de Erros**: Sentry 10.21.0

### Fluxo de Dados
1.  O usuário interage com a UI (React).
2.  Componentes React utilizam hooks do `react-query` para buscar ou modificar dados.
3.  As chamadas de dados são feitas ao cliente Supabase (`@supabase/supabase-js`).
4.  O cliente Supabase interage com a API do PostgreSQL (PostgREST) para operações CRUD e com as Edge Functions para lógicas de negócio mais complexas.
5.  As Edge Functions podem se comunicar com serviços externos, como o Stripe.
6.  O banco de dados utiliza RLS (Row Level Security) para garantir que os usuários só possam acessar os dados de seus respectivos tenants.
7.  O estado da UI é gerenciado pelo Zustand, enquanto o estado do servidor é gerenciado pelo React Query.

---

## 📊 3. INVENTÁRIO DE MÓDULOS

### Módulo de Autenticação (Público)
- **Propósito**: Gerenciar o acesso dos usuários à plataforma.
- **Rotas/URLs**: `/login`, `/forgot-password`
- **Componentes principais**: `LoginForm`, `SignUpForm`, `ForgotPassword`
- **Tabelas relacionadas**: `users`, `auth.users`
- **Status funcional**: A ser testado.
- **Regras de negócio**:
  1. Usuários se autenticam com email e senha.
  2. Existe um fluxo de recuperação de senha.
  3. Novos usuários podem se cadastrar, criando um novo `tenant`.
- **Problemas identificados**: Nenhum ainda.

### Módulo Principal (Dashboard)
- **Propósito**: Hub central para usuários autenticados, permitindo a seleção de `tenant` e `location` e a navegação para outros módulos.
- **Rotas/URLs**: `/`, `/dashboard`
- **Componentes principais**: `DashboardLayout`, `RestaurantSelector`, `TenantSelector`
- **Tabelas relacionadas**: `tenants`, `locations`, `users`
- **Status funcional**: A ser testado.
- **Regras de negócio**:
  1. Usuários devem selecionar um `tenant` e uma `location` para acessar os dados.
  2. Apenas `tenants` e `locations` associados ao usuário são exibidos.
- **Problemas identificados**: Nenhum ainda.

### Módulo de Restaurante/Localização
- **Propósito**: Gerenciar informações e dados específicos de uma localização.
- **Rotas/URLs**: `/overview`, `/feedback`, `/qrcode`, `/location-analytics`, `/location-settings`
- **Componentes principais**: `RestaurantOverviewPage`, `FeedbackList`, `QRCodeGenerator`, `RestaurantAnalytics`, `RestaurantSettings`
- **Tabelas relacionadas**: `locations`, `feedbacks`
- **Status funcional**: A ser testado.
- **Regras de negócio**:
  1. Exibe um resumo das métricas do restaurante.
  2. Lista e permite a gestão dos feedbacks recebidos.
  3. Gera QR Codes para coleta de feedback.
  4. Permite a configuração de detalhes da localização.
- **Problemas identificados**: Nenhum ainda.

### Módulo de Analytics
- **Propósito**: Fornecer visualizações e insights sobre os dados coletados.
- **Rotas/URLs**: `/advanced-analytics`, `/general-analytics`, `/ai-insights`, `/reports`
- **Componentes principais**: `AdvancedAnalyticsPage`, `GeneralAnalyticsPage`, `AIInsightsPage`, `ReportsPage`, `AnalyticsDashboard`
- **Tabelas relacionadas**: `feedbacks`, `daily_feedback_summary` (view materializada)
- **Status funcional**: A ser testado.
- **Regras de negócio**:
  1. Exibe gráficos e métricas sobre NPS, ratings e sentimentos.
  2. Permite a exportação de relatórios.
  3. Apresenta insights gerados por IA (a ser verificado como funciona).
- **Problemas identificados**: Nenhum ainda.

### Módulo de Faturamento (Billing)
- **Propósito**: Gerenciar planos, assinaturas e pagamentos.
- **Rotas/URLs**: `/billing`, `/billing/success`, `/billing/cancel`
- **Componentes principais**: `BillingPage`, `PricingPlans`
- **Tabelas relacionadas**: `tenants`, `subscriptions`
- **Status funcional**: A ser testado.
- **Regras de negócio**:
  1. Integração com Stripe para processamento de pagamentos.
  2. Usuários (proprietários) podem visualizar e alterar planos.
  3. Fluxos de sucesso e cancelamento de pagamento.
- **Problemas identificados**: Nenhum ainda.

### Módulo de Gamificação (Admin)
- **Propósito**: Configurar e gerenciar as estratégias de gamificação para os clientes.
- **Rotas/URLs**: `/gamification`, `/events`
- **Componentes principais**: `GamificationDashboard`, `EventsHub`, `EventsPage`
- **Tabelas relacionadas**: `events`, `rewards`, `gamification_profiles`
- **Status funcional**: A ser testado.
- **Regras de negócio**:
  1. Criação e gerenciamento de eventos gamificados (ex: desafios de feedback).
  2. Definição de recompensas para os clientes.
- **Problemas identificados**: Nenhum ainda.

### Módulo do Cliente Final
- **Propósito**: Interface para os clientes dos restaurantes interagirem com as funcionalidades de gamificação.
- **Rotas/URLs**: `/customer/gamification`, `/customer/events`, `/customer/rewards`
- **Componentes principais**: `CustomerLayout`, `CustomerGamificationDashboard`, `CustomerEventsPage`, `CustomerRewardsPage`
- **Tabelas relacionadas**: `gamification_profiles`, `gamification_points`, `rewards`, `reward_redemptions`
- **Status funcional**: A ser testado.
- **Regras de negócio**:
  1. Clientes podem visualizar seus pontos, nível e medalhas.
  2. Clientes podem participar de eventos ativos.
  3. Clientes podem resgatar recompensas com seus pontos.
- **Problemas identificados**: Nenhum ainda.

---

## 🗄️ 4. ESTRUTURA DO BANCO DE DADOS

### Tabela: `tenants`
- **Propósito**: Armazena as informações de cada organização/cliente SaaS (multi-tenancy).
- **Colunas Principais**: `id`, `name`, `subdomain`, `plan_id`, `subscription_status`, `stripe_customer_id`, `usage_limits`, `current_usage`.
- **Relacionamentos**: N/A (Tabela raiz).
- **Políticas RLS**: `tenant_isolation` - Usuários só podem acessar o `tenant` ao qual pertencem.

### Tabela: `users`
- **Propósito**: Armazena os perfis dos usuários da plataforma (donos, admins, gerentes, etc.).
- **Colunas Principais**: `id` (FK para `auth.users`), `tenant_id`, `email`, `full_name`, `role`.
- **Relacionamentos**: `tenants` (N-1).
- **Políticas RLS**: `user_isolation` - Usuários só podem acessar outros usuários dentro do mesmo `tenant`.

### Tabela: `locations`
- **Propósito**: Representa os restaurantes ou pontos de venda de um `tenant`.
- **Colunas Principais**: `id`, `tenant_id`, `name`, `slug`, `address`, `manager_id`.
- **Relacionamentos**: `tenants` (N-1), `users` (N-1, para gerente).
- **Políticas RLS**: `location_isolation` - Usuários só podem acessar localizações do seu `tenant`.

### Tabela: `feedbacks`
- **Propósito**: Armazena cada feedback submetido por clientes.
- **Colunas Principais**: `id`, `location_id`, `responses`, `nps_score`, `overall_rating`, `sentiment`, `status`, `assigned_to`.
- **Relacionamentos**: `locations` (N-1), `users` (N-1, para responsável).
- **Políticas RLS**: `feedback_isolation` - Acesso permitido se o feedback pertence a uma localização do `tenant` do usuário.

### Tabela: `campaigns`
- **Propósito**: Gerencia campanhas de comunicação (email, SMS, etc.).
- **Colunas Principais**: `id`, `tenant_id`, `name`, `type`, `content`, `target_audience`, `status`, `metrics`.
- **Relacionamentos**: `tenants` (N-1), `users` (N-1, para `created_by`).
- **Políticas RLS**: `campaign_isolation` - Acesso restrito ao `tenant`.

### Tabela: `events`
- **Propósito**: Armazena os eventos de gamificação.
- **Colunas Principais**: `id`, `tenant_id`, `name`, `type`, `config`, `starts_at`, `ends_at`, `status`.
- **Relacionamentos**: `tenants` (N-1), `users` (N-1, para `created_by`).
- **Políticas RLS**: `event_isolation` - Acesso restrito ao `tenant`.

### Tabela: `gamification_profiles`
- **Propósito**: Perfil de gamificação para cada cliente final.
- **Colunas Principais**: `id`, `tenant_id`, `customer_id`, `total_points`, `level`, `badges`.
- **Relacionamentos**: `tenants` (N-1), `customers` (N-1, tabela `customers` não encontrada, pode ser implícita em `customer_data` de `feedbacks`).
- **Políticas RLS**: `gamification_profiles_isolation` - Acesso restrito ao `tenant`.

### Tabela: `rewards`
- **Propósito**: Catálogo de recompensas que podem ser resgatadas com pontos.
- **Colunas Principais**: `id`, `tenant_id`, `name`, `cost`, `type`, `status`.
- **Relacionamentos**: `tenants` (N-1).
- **Políticas RLS**: `rewards_isolation` - Acesso restrito ao `tenant`.

### Tabela: `audit_logs`
- **Propósito**: Registra ações importantes realizadas no sistema para fins de auditoria.
- **Colunas Principais**: `id`, `tenant_id`, `user_id`, `action`, `resource_type`, `resource_id`.
- **Relacionamentos**: `tenants` (N-1), `users` (N-1).
- **Políticas RLS**: `audit_log_isolation` - Acesso restrito ao `tenant`.

---

## ✅ 5. MATRIZ DE TESTES FUNCIONAIS

| Página/Módulo | Create | Read | Update | Delete | Status Geral | Observações |
|---------------|--------|------|--------|--------|--------------|-------------|
| Login         | N/A    | N/A  | N/A    | N/A    | ⏳ A testar   | Testar login com credenciais válidas e inválidas. |
| Cadastro      | ⏳      | N/A  | N/A    | N/A    | ⏳ A testar   | Testar criação de novo tenant e usuário owner. |
| Dashboard     | N/A    | ⏳    | N/A    | N/A    | ⏳ A testar   | Testar seleção de tenant e location. |
| Localizações  | ⏳      | ⏳    | ⏳      | ⏳      | ⏳ A testar   | Testar CRUD completo de localizações. |
| Feedbacks     | N/A    | ⏳    | ⏳      | ⏳      | ⏳ A testar   | Testar visualização, filtro e arquivamento. |
| Campanhas     | ⏳      | ⏳    | ⏳      | ⏳      | ⏳ A testar   | Testar criação, agendamento e visualização de métricas. |
| Gamificação   | ⏳      | ⏳    | ⏳      | ⏳      | ⏳ A testar   | Testar criação de eventos e recompensas. |
| Faturamento   | N/A    | ⏳    | ⏳      | N/A    | ⏳ A testar   | Testar visualização de planos e integração com Stripe. |

**Legenda**: ✅ Funcionando | ⚠️ Parcial | ❌ Quebrado | N/A Não aplicável | ⏳ A testar

---

## 🐛 6. REGISTRO DE BUGS E PROBLEMAS

*(Esta seção será preenchida durante a fase de testes funcionais)*

---

## 📅 7. CRONOGRAMA DE RESOLUÇÃO

*(Estimativas preliminares. Serão refinadas após a conclusão dos testes)*

### FASE 1: BUGS CRÍTICOS (Estimativa: A definir)
- [ ] Nenhum bug crítico identificado até o momento.

### FASE 2: BUGS GRAVES (Estimativa: A definir)
- [ ] Nenhum bug grave identificado até o momento.

### FASE 3: BUGS MENORES (Estimativa: A definir)
- [ ] Nenhum bug menor identificado até o momento.

### FASE 4: MELHORIAS (Estimativa: A definir)
- [ ] [MEL-001] - Implementar cobertura de testes automatizados para as funções Supabase.
- [ ] [MEL-002] - Criar documentação de API para as funções serverless.
- [ ] [MEL-003] - Revisar e otimizar as queries de analytics para grandes volumes de dados.

---

## 📈 8. MÉTRICAS E INDICADORES

- **Total de páginas/rotas**: ~25
- **Total de módulos**: 7
- **Total de tabelas**: 11
- **Taxa de funcionalidade**: A ser definida após testes.
- **Bugs críticos**: 0 (até o momento)
- **Bugs graves**: 0 (até o momento)
- **Bugs menores**: 0 (até o momento)
- **Cobertura de testes**: A ser analisada com `vitest coverage`.

---

## 🎯 9. RECOMENDAÇÕES ESTRATÉGICAS

1.  **Prioridades Imediatas**: Executar a matriz de testes funcionais para validar todas as funcionalidades CRUD e regras de negócio identificadas.
2.  **Testes Automatizados**: Aumentar a cobertura de testes, especialmente para as funções serverless no Supabase, que contêm a lógica de negócio mais crítica. Isso garantirá que futuras alterações não quebrem funcionalidades existentes.
3.  **Segurança**: Realizar uma auditoria de segurança focada nas políticas RLS e nas permissões de acesso das funções serverless, garantindo que nenhum dado sensível seja exposto.
4.  **Performance**: Monitorar o tempo de carregamento das páginas de analytics e a performance das queries no Supabase à medida que o volume de dados cresce. As views materializadas são um bom começo, mas podem precisar de otimização.
5.  **Documentação**: Embora o código seja bem estruturado, criar uma documentação de API para as funções serverless e um guia de componentes no Storybook (ou similar) aceleraria o desenvolvimento e onboarding de novos membros na equipe.

---

## 📝 10. PRÓXIMOS PASSOS

1.  **Execução da Auditoria Funcional**: Seguir a "Matriz de Testes Funcionais" para testar cada módulo e funcionalidade do sistema.
2.  **Registro de Bugs**: Documentar quaisquer bugs ou inconsistências encontrados na seção "Registro de Bugs e Problemas".
3.  **Análise de Cobertura de Testes**: Executar o comando `npm run test -- --coverage` para gerar um relatório de cobertura e identificar áreas não testadas.
4.  **Revisão de Segurança**: Realizar testes de penetração focados em quebrar as políticas RLS, tentando acessar dados de outros tenants com diferentes papéis de usuário.
5.  **Refinamento do Cronograma**: Com base nos bugs encontrados, detalhar e priorizar o cronograma de resolução.