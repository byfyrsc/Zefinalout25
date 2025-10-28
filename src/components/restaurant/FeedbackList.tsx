import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnhancedSkeleton } from "@/components/ui/enhanced-skeleton";
import { ElasticButton, StaggeredList } from "@/components/ui/micro-interactions";
import { useAccessibility, ScreenReaderOnly } from "@/components/accessibility/AccessibilityProvider";
import { Feedback } from "@/types/tenant"; // Importar Feedback do types/tenant
import { Star, Calendar, User, MessageSquare, Filter, Search } from "lucide-react";

interface FeedbackListProps {
  feedbacks: Feedback[];
}

const FeedbackList = ({ feedbacks }: FeedbackListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [isLoading, setIsLoading] = useState(false);
  const { announceToScreenReader } = useAccessibility();

  const filteredFeedbacks = feedbacks
    .filter(feedback => {
      const matchesSearch = feedback.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (feedback.customerName?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === "all" || feedback.category === categoryFilter;
      const matchesRating = ratingFilter === "all" || feedback.rating.toString() === ratingFilter;
      
      return matchesSearch && matchesCategory && matchesRating;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  const getCategoryColor = (category: string) => {
    const colors = {
      food: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      service: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      ambiance: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      price: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      overall: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    };
    return colors[category as keyof typeof colors] || colors.overall;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      food: "Comida",
      service: "Serviço",
      ambiance: "Ambiente",
      price: "Preço",
      overall: "Geral",
    };
    return labels[category as keyof typeof labels] || category;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-gradient-to-r from-muted/30 to-background/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome ou comentário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="food">Comida</SelectItem>
                  <SelectItem value="service">Serviço</SelectItem>
                  <SelectItem value="ambiance">Ambiente</SelectItem>
                  <SelectItem value="price">Preço</SelectItem>
                  <SelectItem value="overall">Geral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Avaliação</label>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="5">5 estrelas</SelectItem>
                  <SelectItem value="4">4 estrelas</SelectItem>
                  <SelectItem value="3">3 estrelas</SelectItem>
                  <SelectItem value="2">2 estrelas</SelectItem>
                  <SelectItem value="1">1 estrela</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ordenar por</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mais recente</SelectItem>
                  <SelectItem value="oldest">Mais antigo</SelectItem>
                  <SelectItem value="highest">Maior nota</SelectItem>
                  <SelectItem value="lowest">Menor nota</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredFeedbacks.length} de {feedbacks.length} feedbacks
        </p>
        <Badge variant="outline" className="text-xs">
          Total: {feedbacks.length}
        </Badge>
      </div>

      {/* Feedback Cards */}
      <div className="space-y-4">
        {filteredFeedbacks.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum feedback encontrado</h3>
              <p className="text-muted-foreground">
                {feedbacks.length === 0 
                  ? "Ainda não há feedbacks para esta localização." 
                  : "Tente ajustar os filtros para encontrar feedbacks."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <StaggeredList>
            {filteredFeedbacks.map((feedback) => (
              <Card 
                key={feedback.id} 
                className="bg-gradient-to-r from-card to-muted/5 hover:shadow-medium transition-all duration-300 hover:scale-[1.01]"
                role="article"
                aria-label={`Feedback de ${feedback.isAnonymous ? 'cliente anônimo' : feedback.customerName || 'cliente'}, ${feedback.rating} estrelas`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {feedback.isAnonymous ? (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                <span className="text-sm text-muted-foreground">Anônimo</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-foreground" aria-hidden="true" />
                                <span className="text-sm font-medium">
                                  {feedback.customerName || "Cliente"}
                                </span>
                              </div>
                            )}
                          </div>
                          <Badge className={getCategoryColor(feedback.category)}>
                            {getCategoryLabel(feedback.category)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <div aria-label={`${feedback.rating} de 5 estrelas`}>
                            {renderStars(feedback.rating)}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" aria-hidden="true" />
                            <time dateTime={feedback.createdAt}>
                              {new Date(feedback.createdAt).toLocaleDateString('pt-BR')}
                            </time>
                          </div>
                        </div>
                      </div>
                      
                      <blockquote className="text-foreground leading-relaxed pl-4 border-l-2 border-primary/30">
                        "{feedback.comment}"
                      </blockquote>
                      
                      {feedback.customerEmail && !feedback.isAnonymous && (
                        <div className="text-xs text-muted-foreground">
                          {feedback.customerEmail}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </StaggeredList>
        )}
      </div>
    </div>
  );
};

export default FeedbackList;