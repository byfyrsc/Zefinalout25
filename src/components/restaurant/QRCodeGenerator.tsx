import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Location } from "@/types/tenant"; // Alterado para Location
import { Download, Copy, RefreshCw, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";

interface QRCodeGeneratorProps {
  location: Location; // Alterado para location
}

const QRCodeGenerator = ({ location }: QRCodeGeneratorProps) => { // Alterado para location
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [customMessage, setCustomMessage] = useState("Deixe seu feedback sobre nossa experiência!");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const feedbackUrl = `${window.location.origin}/feedback/${location.id}`; // Alterado para location.id

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      const qrDataUrl = await QRCode.toDataURL(feedbackUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o QR Code",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateQRCode();
  }, [location.id]); // Alterado para location.id

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "Link copiado para a área de transferência",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link",
        variant: "destructive",
      });
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `qrcode-${location.name.toLowerCase().replace(/\s+/g, '-')}.png`; // Alterado para location.name
    link.href = qrCodeUrl;
    link.click();
    
    toast({
      title: "Download iniciado",
      description: "QR Code salvo com sucesso",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* QR Code Display */}
      <Card className="bg-gradient-to-br from-card to-muted/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>QR Code de Feedback</span>
            <Badge variant="outline" className="text-xs">
              {location.name}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="p-6 bg-white rounded-lg shadow-medium">
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code de Feedback" 
                  className="w-64 h-64"
                />
              ) : (
                <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <RefreshCw className={`h-8 w-8 mx-auto mb-2 ${isGenerating ? 'animate-spin' : ''}`} />
                    <p className="text-sm text-muted-foreground">
                      {isGenerating ? 'Gerando...' : 'QR Code'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {customMessage}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={downloadQRCode} 
                disabled={!qrCodeUrl}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download PNG
              </Button>
              <Button 
                variant="outline" 
                onClick={generateQRCode}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                Gerar Novo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card className="bg-gradient-to-br from-card to-muted/10">
        <CardHeader>
          <CardTitle>Configurações do QR Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="feedback-url">Link de Feedback</Label>
            <div className="flex gap-2">
              <Input 
                id="feedback-url"
                value={feedbackUrl}
                readOnly
                className="bg-muted/50"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => copyToClipboard(feedbackUrl)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => window.open(feedbackUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="custom-message">Mensagem Personalizada</Label>
            <Input 
              id="custom-message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Digite uma mensagem para o cliente"
            />
          </div>

          <div className="space-y-3">
            <Label>Informações da Localização</Label> {/* Alterado para Localização */}
            <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nome:</span>
                <span className="font-medium">{location.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Endereço:</span>
                <span className="font-medium text-right max-w-[200px]">{location.address}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Telefone:</span>
                <span className="font-medium">{location.phone}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/50">
            <h4 className="font-medium mb-3">Como usar o QR Code:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Imprima o QR Code e coloque nas mesas</li>
              <li>• Clientes escaneiam com a câmera do celular</li>
              <li>• Acesso direto ao formulário de feedback</li>
              <li>• Feedback é enviado automaticamente para seu dashboard</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeGenerator;