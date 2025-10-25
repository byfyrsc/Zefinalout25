import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Sparkles, Users, BarChart3, MessageCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Componente para apresentar as features do produto
const ProductFeatures = () => {
  const features = [
    {
      icon: BarChart3,
      title: 'Analytics Inteligentes',
      description: 'Insights automáticos com IA para otimizar a experiência do seu cliente.'
    },
    {
      icon: MessageCircle,
      title: 'Feedback em Tempo Real',
      description: 'Colete e responda feedbacks instantaneamente em todos os seus canais.'
    },
    {
      icon: Users,
      title: 'Gestão Multi-tenant',
      description: 'Gerencie múltiplas unidades com controle de acesso granular e seguro.'
    },
    {
      icon: Sparkles,
      title: 'Gamificação Engajadora',
      description: 'Engaje seus clientes com eventos interativos, missões e recompensas.'
    }
  ];

  return (
    <div className="hidden lg:flex flex-col justify-center space-y-8 p-8 rounded-xl text-foreground bg-[radial-gradient(ellipse_at_top_left,theme(colors.primary.DEFAULT)/0.15,transparent_50%),radial-gradient(ellipse_at_bottom_right,theme(colors.accent.DEFAULT)/0.15,transparent_50%)]">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center space-x-2 mb-4"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="h-5 w-5" />
        </div>
        <span className="text-2xl font-bold">DigaZÉ</span>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-4"
      >
        <h1 className="text-4xl font-bold tracking-tight">
          Transforme feedback em <span className="text-primary">crescimento real</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          A plataforma SaaS completa para gestão de experiência do cliente em restaurantes e food services.
        </p>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          );
        })}
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="bg-card border-border shadow-soft mt-auto">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-success" />
              <p className="text-sm text-muted-foreground">
                Junte-se a centenas de restaurantes que já estão inovando.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

// Componente principal da página de autenticação
export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoginView, setIsLoginView] = useState(true);
  const [useMockAuth, setUseMockAuth] = useState(false);

  useEffect(() => {
    setUseMockAuth(localStorage.getItem('useMockAuth') === 'true');
  }, []);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (user || useMockAuth) { // Redirect if user is logged in or mock auth is active
      navigate(from, { replace: true });
    }
  }, [user, navigate, from, useMockAuth]);

  const toggleView = () => setIsLoginView(!isLoginView);

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-gradient-to-b from-background to-muted/30">
      <ProductFeatures />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header para mobile */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:hidden flex flex-col items-center text-center"
          >
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold">DigaZÉ</span>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">
              {isLoginView ? 'Bem-vindo de volta!' : 'Crie sua conta'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isLoginView ? 'Insira seus dados para continuar.' : 'Preencha o formulário para começar.'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {isLoginView ? (
              <Card className="bg-card border-border shadow-soft">
                <CardHeader>
                  <CardTitle className="text-2xl">Bem-vindo de volta!</CardTitle>
                  <CardDescription>Insira seus dados para acessar sua conta.</CardDescription>
                </CardHeader>
                <CardContent>
                  <LoginForm redirectTo={from} onToggleMode={toggleView} />
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-background/75 backdrop-blur-md border-border/30 shadow-soft">
                <CardHeader className="hidden lg:block">
                  <CardTitle className="text-2xl">Crie sua conta</CardTitle>
                  <CardDescription>Preencha o formulário para começar a usar o DigaZÉ.</CardDescription>
                </CardHeader>
                <CardContent>
                  <SignUpForm redirectTo={from} onToggleMode={toggleView} />
                </CardContent>
              </Card>
            )}
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center text-sm text-muted-foreground"
          >
            {isLoginView ? "Não tem uma conta?" : "Já possui uma conta?"}{' '}
            <Button variant="link" onClick={toggleView} className="p-0 h-auto font-semibold text-primary">
              {isLoginView ? "Crie uma agora" : "Faça login"}
            </Button>
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center"
          >
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao site
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}