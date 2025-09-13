import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAccessibility } from './AccessibilityProvider';
import { Eye, Type, Keyboard, Volume2, Contrast } from 'lucide-react';

export const AccessibilitySettings = () => {
  const { settings, updateSetting } = useAccessibility();

  const settingsConfig = [
    {
      key: 'reducedMotion' as const,
      label: 'Reduzir Animações',
      description: 'Minimiza animações e transições',
      icon: Eye,
    },
    {
      key: 'highContrast' as const,
      label: 'Alto Contraste',
      description: 'Aumenta o contraste para melhor visibilidade',
      icon: Contrast,
    },
    {
      key: 'largeText' as const,
      label: 'Texto Grande',
      description: 'Aumenta o tamanho do texto em 20%',
      icon: Type,
    },
    {
      key: 'screenReaderOptimized' as const,
      label: 'Otimizado para Leitor de Tela',
      description: 'Melhora a experiência com leitores de tela',
      icon: Volume2,
    },
    {
      key: 'keyboardNavigation' as const,
      label: 'Navegação por Teclado',
      description: 'Destaca melhor os elementos em foco',
      icon: Keyboard,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Configurações de Acessibilidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {settingsConfig.map(({ key, label, description, icon: Icon }) => (
          <div key={key} className="flex items-center justify-between space-x-4">
            <div className="flex items-start space-x-3 flex-1">
              <Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="space-y-1">
                <Label htmlFor={key} className="text-sm font-medium cursor-pointer">
                  {label}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>
            <Switch
              id={key}
              checked={settings[key]}
              onCheckedChange={(checked) => updateSetting(key, checked)}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Algumas configurações são detectadas automaticamente baseadas nas preferências do sistema.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};