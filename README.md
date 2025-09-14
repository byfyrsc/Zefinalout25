# InteliFeed Hub - Plataforma de Feedback Inteligente

Uma plataforma mobile-first completa para coleta e análise de feedback de restaurantes, com recursos avançados de PWA, capacidades nativas e acessibilidade.

## 🚀 Funcionalidades Principais

### 📱 Mobile-First Experience
- **Dashboard Mobile Otimizado**: Interface específica para dispositivos móveis
- **Navegação por Gestos**: Swipe entre telas e pull-to-refresh
- **Bottom Navigation**: Navegação nativa mobile com haptic feedback
- **Safe Area Support**: Compatibilidade com notch e outras áreas seguras

### 🔧 PWA & Capacitor
- **Progressive Web App**: Service Worker automático com cache inteligente
- **Instalação Nativa**: Prompt de instalação personalizado
- **Capacitor Integration**: Funcionalidades nativas cross-platform
- **Offline-First**: Sincronização automática quando online

### 🎯 Capacidades Nativas
- **Haptic Feedback**: Vibração tátil para feedback de ações
- **Câmera**: Captura de fotos integrada
- **Geolocalização**: Localização automática de restaurantes
- **Push Notifications**: Notificações nativas

### ♿ Acessibilidade Avançada
- **Screen Reader Support**: Compatibilidade com leitores de tela
- **Navegação por Teclado**: Focus management e skip links
- **Alto Contraste**: Modo de alto contraste automático
- **Texto Grande**: Escalonamento de fonte configurável
- **Reduced Motion**: Respeita preferências de movimento

### ⚡ Performance
- **Virtual Scrolling**: Listas grandes com performance otimizada
- **Lazy Loading**: Carregamento sob demanda de imagens e componentes
- **Skeleton Loaders**: Estados de carregamento elegantes
- **Code Splitting**: Bundle splitting por rotas

### 🎨 Design System
- **Tokens Semânticos**: Sistema de cores e espaçamento consistente
- **Dark Mode**: Otimizado para telas OLED
- **Microinterações**: Animações fluidas com Framer Motion
- **Gradientes Inteligentes**: Gradientes adaptativos por tema

## 🛠️ Tecnologias

### Core
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** com design system customizado
- **Framer Motion** para microinterações
- **React Query** para gerenciamento de estado

### Mobile & PWA
- **Capacitor** para funcionalidades nativas
- **Vite PWA Plugin** para service worker
- **Workbox** para estratégias de cache

### Performance
- **React Virtual** para listas grandes
- **React Intersection Observer** para lazy loading
- **Bundle Splitting** automático
- **Image Optimization** com fallbacks

## 🚀 Getting Started

### Instalação
```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build para produção
npm run build
```

### Configuração de Desenvolvimento

Para facilitar o desenvolvimento, o projeto suporta autenticação mockada:

1.  Abra o `DevHelper` (o pequeno painel de ferramentas no canto inferior direito da tela em modo de desenvolvimento).
2.  Ative a chave "Usar dados mock".
3.  Recarregue a página.

Isso permite testar o dashboard e funcionalidades protegidas sem precisar de uma conta real. O usuário mockado é um `Admin` com acesso completo.

### Mobile Development
```bash
# Sincronizar com plataforma mobile
npx cap sync

# Rodar no iOS (requer macOS + Xcode)
npx cap run ios

# Rodar no Android (requer Android Studio)
npx cap run android
```

## 📱 PWA Installation

O app detecta automaticamente quando pode ser instalado e mostra um prompt elegante. Após instalação:

- ✅ Funciona offline
- ✅ Notificações push nativas
- ✅ Ícone na home screen
- ✅ Performance otimizada

## ♿ Acessibilidade

### Configurações Disponíveis
- **Reduzir Animações**: Minimiza transições e animações
- **Alto Contraste**: Melhora visibilidade com cores contrastantes
- **Texto Grande**: Aumenta fonte em 20%
- **Otimização para Screen Reader**: Melhora experiência com leitores de tela
- **Navegação por Teclado**: Destaca elementos em foco

## 📈 Performance

### Métricas Otimizadas
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Estratégias de Cache
- **Recursos Estáticos**: Cache-first com expiração de 30 dias
- **API Requests**: Network-first com fallback de 24h
- **Images**: Cache-first com compressão automática

## 🔄 Offline Support

O app funciona completamente offline:
- ✅ Interface completa disponível
- ✅ Formulários salvos localmente
- ✅ Sincronização automática quando online
- ✅ Indicadores visuais de status

---

**InteliFeed Hub** - Transformando feedback em insights acionáveis com tecnologia mobile-first premium. 🚀