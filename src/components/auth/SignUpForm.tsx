import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock, Loader2, ShieldAlert } from 'lucide-react';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';

interface SignUpFormProps {
  onToggleMode?: () => void;
  redirectTo?: string;
}

export const SignUpForm = ({ onToggleMode, redirectTo }: SignUpFormProps) => {
  const { signUp, loading, isRateLimited } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    tenantName: '',
    subdomain: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        tenantName: formData.tenantName,
        subdomain: formData.subdomain
      });
      
      if (error) {
        setError(error.message);
      } else if (redirectTo) {
        // For signup, we don't redirect immediately as email confirmation is required
        // The user will be redirected after confirming their email
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
        <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
        <CardDescription>
          Crie sua conta no DigaZÉ
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {(error || showRateLimitMessage) && (
            <Alert variant="destructive">
              <AlertDescription className="flex items-center">
                <ShieldAlert className="h-4 w-4 mr-2" />
                {showRateLimitMessage 
                  ? 'Muitas tentativas de cadastro. Por favor, aguarde antes de tentar novamente.' 
                  : error}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Primeiro Nome</Label>
              <Input
                id="firstName"
                placeholder="Seu primeiro nome"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
                disabled={isSubmitting || loading || showRateLimitMessage}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Último Nome</Label>
              <Input
                id="lastName"
                placeholder="Seu último nome"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
                disabled={isSubmitting || loading || showRateLimitMessage}
              />
            </div>
          </div>
          
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
            <PasswordStrengthIndicator password={formData.password} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="pl-10 pr-10"
                required
                disabled={isSubmitting || loading || showRateLimitMessage}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isSubmitting || loading || showRateLimitMessage}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tenantName">Nome da Empresa</Label>
            <Input
              id="tenantName"
              placeholder="Nome da sua empresa"
              value={formData.tenantName}
              onChange={(e) => handleInputChange('tenantName', e.target.value)}
              required
              disabled={isSubmitting || loading || showRateLimitMessage}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subdomain">Subdomínio</Label>
            <div className="relative">
              <Input
                id="subdomain"
                placeholder="seudominio"
                value={formData.subdomain}
                onChange={(e) => handleInputChange('subdomain', e.target.value)}
                required
                disabled={isSubmitting || loading || showRateLimitMessage}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-muted-foreground text-sm">.digaze.com</span>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || loading || showRateLimitMessage}
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              'Criar Conta'
            )}
          </Button>
          
          {onToggleMode && (
            <>
              <Separator />
              <div className="text-center text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <Button 
                  type="button" 
                  variant="link" 
                  className="p-0 h-auto font-normal text-primary"
                  onClick={onToggleMode}
                >
                  Faça login
                </Button>
              </div>
            </>
          )}
        </CardFooter>
      </form>
    </Card>
  );
};