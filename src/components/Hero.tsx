import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, MessageSquare, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-restaurant.jpg";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/95"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-8">
          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent leading-tight">
              InteliFeed Hub
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Transforme feedback de clientes em insights acionáveis para seu restaurante
            </p>
          </div>

          {/* Value Props */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto my-12">
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
              <MessageSquare className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Coleta Inteligente</h3>
              <p className="text-sm text-muted-foreground">Pesquisas personalizadas que capturam o sentimento real dos clientes</p>
            </div>
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
              <BarChart3 className="h-8 w-8 text-secondary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Analytics Avançado</h3>
              <p className="text-sm text-muted-foreground">Dashboards com insights preditivos powered by IA</p>
            </div>
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
              <TrendingUp className="h-8 w-8 text-accent mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Automação Marketing</h3>
              <p className="text-sm text-muted-foreground">Campanhas automáticas baseadas em comportamento dos clientes</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" className="text-lg px-8 py-6">
              Começar Gratuitamente
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Ver Demo
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-6">Confiado por mais de 500+ restaurantes</p>
            <div className="flex justify-center items-center gap-8 opacity-60">
              <div className="bg-muted rounded-lg px-6 py-3 text-sm font-medium">Restaurant A</div>
              <div className="bg-muted rounded-lg px-6 py-3 text-sm font-medium">Bistro B</div>
              <div className="bg-muted rounded-lg px-6 py-3 text-sm font-medium">Café C</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;