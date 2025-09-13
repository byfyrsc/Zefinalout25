import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import {
  Download,
  FileText,
  FileSpreadsheet,
  Image,
  Calendar as CalendarIcon,
  Filter,
  CheckCircle,
  Mail,
  Share2,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReportConfig {
  format: "pdf" | "excel" | "csv" | "png";
  dateRange: {
    from: Date;
    to: Date;
  };
  sections: string[];
  frequency?: "once" | "daily" | "weekly" | "monthly";
  email?: string;
}

const availableSections = [
  { id: "summary", label: "Resumo Executivo", description: "Visão geral das métricas principais" },
  { id: "satisfaction", label: "Análise de Satisfação", description: "Tendências e distribuição de satisfação" },
  { id: "sentiment", label: "Análise de Sentimento", description: "Insights de IA sobre feedback dos clientes" },
  { id: "categories", label: "Performance por Categoria", description: "Avaliação detalhada por área" },
  { id: "trends", label: "Tendências Temporais", description: "Análise de padrões por horário/dia" },
  { id: "comparison", label: "Comparação Competitiva", description: "Benchmarking com concorrentes" },
  { id: "insights", label: "Insights de IA", description: "Predições e recomendações" },
  { id: "feedback", label: "Feedback Detalhado", description: "Lista completa de comentários" },
];

const ReportExporter = () => {
  const [config, setConfig] = useState<ReportConfig>({
    format: "pdf",
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
      to: new Date(),
    },
    sections: ["summary", "satisfaction", "sentiment"],
    frequency: "once",
  });

  const [isExporting, setIsExporting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSectionToggle = (sectionId: string) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.includes(sectionId)
        ? prev.sections.filter(id => id !== sectionId)
        : [...prev.sections, sectionId]
    }));
  };

  const exportReport = async () => {
    setIsExporting(true);
    
    // Simulação de exportação
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Relatório exportado com sucesso!",
      description: `Arquivo ${config.format.toUpperCase()} foi gerado e será baixado em instantes.`,
      duration: 5000,
    });
    
    setIsExporting(false);
  };

  const scheduleReport = () => {
    toast({
      title: "Relatório agendado!",
      description: `Relatório será enviado ${config.frequency === 'daily' ? 'diariamente' : 
                   config.frequency === 'weekly' ? 'semanalmente' : 'mensalmente'} para ${config.email}`,
      duration: 5000,
    });
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "pdf":
        return <FileText className="h-4 w-4" />;
      case "excel":
      case "csv":
        return <FileSpreadsheet className="h-4 w-4" />;
      case "png":
        return <Image className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Exportar Relatórios</h2>
        <p className="text-muted-foreground">Configure e exporte relatórios personalizados</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuração */}
        <div className="lg:col-span-2 space-y-6">
          {/* Formato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Formato do Relatório
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["pdf", "excel", "csv", "png"].map((format) => (
                  <Button
                    key={format}
                    variant={config.format === format ? "default" : "outline"}
                    className="flex flex-col items-center gap-2 h-20"
                    onClick={() => setConfig(prev => ({ ...prev, format: format as any }))}
                  >
                    {getFormatIcon(format)}
                    <span className="text-xs uppercase">{format}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Período */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Período de Análise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Data Inicial</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(config.dateRange.from, "PPP", { locale: ptBR })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={config.dateRange.from}
                          onSelect={(date) => date && setConfig(prev => ({
                            ...prev,
                            dateRange: { ...prev.dateRange, from: date }
                          }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Data Final</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(config.dateRange.to, "PPP", { locale: ptBR })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={config.dateRange.to}
                          onSelect={(date) => date && setConfig(prev => ({
                            ...prev,
                            dateRange: { ...prev.dateRange, to: date }
                          }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Quick presets */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfig(prev => ({
                      ...prev,
                      dateRange: {
                        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        to: new Date()
                      }
                    }))}
                  >
                    7 dias
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfig(prev => ({
                      ...prev,
                      dateRange: {
                        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        to: new Date()
                      }
                    }))}
                  >
                    30 dias
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfig(prev => ({
                      ...prev,
                      dateRange: {
                        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                        to: new Date()
                      }
                    }))}
                  >
                    90 dias
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seções */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Seções do Relatório
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {availableSections.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-start space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={section.id}
                      checked={config.sections.includes(section.id)}
                      onCheckedChange={() => handleSectionToggle(section.id)}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={section.id}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {section.label}
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {section.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Agendamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Agendamento (Opcional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select 
                value={config.frequency} 
                onValueChange={(value) => setConfig(prev => ({ ...prev, frequency: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Apenas uma vez</SelectItem>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>

              {config.frequency !== "once" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Email para envio</label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    className="w-full p-2 border border-border rounded-md bg-background"
                    value={config.email || ""}
                    onChange={(e) => setConfig(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview e Ações */}
        <Card className="lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle>Preview do Relatório</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Resumo da configuração */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Formato</label>
                <div className="flex items-center gap-2 mt-1">
                  {getFormatIcon(config.format)}
                  <span className="text-sm font-medium uppercase">{config.format}</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Período</label>
                <p className="text-sm font-medium">
                  {format(config.dateRange.from, "dd/MM/yyyy", { locale: ptBR })} - {" "}
                  {format(config.dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Seções Incluídas</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {config.sections.map((sectionId) => {
                    const section = availableSections.find(s => s.id === sectionId);
                    return (
                      <Badge key={sectionId} variant="secondary" className="text-xs">
                        {section?.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {config.frequency !== "once" && (
                <div>
                  <label className="text-xs text-muted-foreground">Frequência</label>
                  <p className="text-sm font-medium">
                    {config.frequency === "daily" ? "Diário" :
                     config.frequency === "weekly" ? "Semanal" : "Mensal"}
                  </p>
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="space-y-2 pt-4 border-t">
              <Button 
                className="w-full" 
                onClick={exportReport}
                disabled={isExporting || config.sections.length === 0}
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Agora
                  </>
                )}
              </Button>

              {config.frequency !== "once" && config.email && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={scheduleReport}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Agendar Envio
                </Button>
              )}

              <Button variant="outline" className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar Link
              </Button>
            </div>

            {/* Estimativa de tamanho */}
            <div className="text-xs text-muted-foreground pt-2 border-t">
              <p>Tamanho estimado: ~{config.sections.length * 0.5}MB</p>
              <p>Tempo de geração: ~{config.sections.length * 2}s</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportExporter;