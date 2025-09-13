import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Send, 
  Utensils, 
  Smile, 
  Meh, 
  Frown,
  ThumbsUp,
  Clock,
  DollarSign,
  Users,
  MapPin,
  ArrowRight
} from "lucide-react";

const FeedbackForm = () => {
  const [step, setStep] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sentiment, setSentiment] = useState("");
  const [visitType, setVisitType] = useState("");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setStep(1);
      setRating(0);
      setComment("");
      setSelectedCategories([]);
      setSentiment("");
      setVisitType("");
      setCustomerInfo({ name: "", email: "", phone: "" });
    }, 3000);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-strong">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
              <ThumbsUp className="h-8 w-8 text-success-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Feedback Enviado!</h3>
            <p className="text-muted-foreground mb-4">Obrigado por compartilhar sua experiência conosco.</p>
            <Badge variant="secondary" className="mb-2">
              Análise de sentimento: {sentiment || "Processando..."}
            </Badge>
            <p className="text-xs text-muted-foreground">
              Suas respostas nos ajudam a melhorar continuamente nossos serviços.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <h3 className="text-lg font-medium">Como foi sua experiência geral?</h3>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-all duration-200 hover:scale-110"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        star <= rating 
                          ? 'text-warning fill-current' 
                          : 'text-muted hover:text-warning/50'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-muted-foreground">
                  {rating === 1 && "Muito insatisfeito"}
                  {rating === 2 && "Insatisfeito"}  
                  {rating === 3 && "Neutro"}
                  {rating === 4 && "Satisfeito"}
                  {rating === 5 && "Muito satisfeito"}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Como você se sentiu durante a visita?</h4>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Smile, label: "Muito feliz", value: "muito_feliz", color: "text-success" },
                  { icon: Meh, label: "Neutro", value: "neutro", color: "text-warning" },
                  { icon: Frown, label: "Insatisfeito", value: "insatisfeito", color: "text-destructive" }
                ].map(({ icon: Icon, label, value, color }) => (
                  <Button
                    key={value}
                    type="button"
                    variant={sentiment === value ? "default" : "outline"}
                    className="h-20 flex-col space-y-2"
                    onClick={() => setSentiment(value)}
                  >
                    <Icon className={`h-6 w-6 ${sentiment === value ? 'text-foreground' : color}`} />
                    <span className="text-xs">{label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg font-medium">O que mais chamou sua atenção?</h3>
              <p className="text-sm text-muted-foreground">Selecione todas as opções que se aplicam</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Utensils, label: "Qualidade da comida" },
                  { icon: Users, label: "Atendimento" },
                  { icon: MapPin, label: "Ambiente" },
                  { icon: DollarSign, label: "Preço" },
                  { icon: Clock, label: "Tempo de espera" },
                  { icon: MapPin, label: "Localização" }
                ].map(({ icon: Icon, label }) => (
                  <Button
                    key={label}
                    type="button"
                    variant={selectedCategories.includes(label) ? "default" : "outline"}
                    className="justify-start text-left h-auto py-3"
                    onClick={() => toggleCategory(label)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Tipo de visita:</h4>
              <div className="grid grid-cols-2 gap-3">
                {["Primeira vez", "Cliente regular", "Ocasião especial", "Trabalho/Negócios"].map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={visitType === type ? "default" : "outline"}
                    className="text-sm"
                    onClick={() => setVisitType(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Conte-nos mais sobre sua experiência</h3>
              <Textarea
                placeholder="Compartilhe detalhes sobre sua visita, sugestões ou elogios..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[150px] resize-none"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Informações opcionais</h3>
              <p className="text-sm text-muted-foreground">
                Ajude-nos a personalizar ainda mais sua experiência
              </p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl shadow-strong">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <Utensils className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Como foi sua experiência?</CardTitle>
          <p className="text-muted-foreground">Sua opinião nos ajuda a melhorar nosso atendimento</p>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Etapa {step} de {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button 
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={step === 1}
                className={step === 1 ? "invisible" : ""}
              >
                Anterior
              </Button>
              
              {step < totalSteps ? (
                <Button 
                  type="button"
                  onClick={handleNext}
                  disabled={step === 1 && rating === 0}
                >
                  Próximo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  variant="hero"
                  disabled={rating === 0}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Feedback
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackForm;