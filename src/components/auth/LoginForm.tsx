import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock, Loader2, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LoginFormProps {
  onToggleMode?: () => void;
  redirectTo?: string;
}

export const LoginForm = ({ onToggleMode, redirectTo }: LoginFormProps) => {
  const { signIn, loading, isRateLimited } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRateLimitMessage, setShowRateLimitMessage] = useState(false);

  // Handle rate limiting display
  useEffect(() => {
    if (isRateLimited()) {
      setShowRateLimitMessage(true);
      const timer = setTimeout(() => {
        setShowRateLimitMessage(false);
      }, 60000); // Show for 1 minute
      return () => clearTimeout(timer);
    }
  }, [isRateLimited]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        setError(error.message);
      } else if (redirectTo) {
        window.location.href = redirectTo;
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
        <CardDescription>
          Acesse sua conta do DigaZÉ
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {(error || showRateLimitMessage) && (
            <Alert variant="destructive">
              <AlertDescription className="flex items-center">
                <ShieldAlert className="h-4 w-4 mr-2" />
                {showRateLimitMessage 
                  ? 'Muitas tentativas de login. Por favor, aguarde antes de tentar novamente.' 
                  : error}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10"
                required
                disabled={isSubmitting || loading || showRateLimitMessage}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="pl-10 pr-10"
                required
                disabled={isSubmitting || loading || showRateLimitMessage}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting || loading || showRateLimitMessage}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Link 
              to="/forgot-password" 
              className="text-sm text-primary hover:underline"
            >
              Esqueceu a senha?
            </Link>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || loading || !formData.email || !formData.password || showRateLimitMessage}
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
          
          {onToggleMode && (
            <>
              <Separator />
              <div className="text-center text-sm text-muted-foreground">
                Não tem uma conta?{' '}
                <Button 
                  type="button" 
                  variant="link" 
                  className="p-0 h-auto font-normal text-primary"
                  onClick={onToggleMode}
                >
                  Criar conta
                </Button>
              </div>
            </>
          )}
        </CardFooter>
      </form>
    </Card>
  );
};