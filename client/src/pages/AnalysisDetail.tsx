import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { 
  ArrowLeft, 
  FileText, 
  Download,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Newspaper,
  Globe,
  Upload,
  Save,
  Trash2,
  ExternalLink
} from "lucide-react";
import { useLocation, useParams } from "wouter";

export default function AnalysisDetail() {
  const params = useParams<{ id: string }>();
  const analysisId = parseInt(params.id || "0");
  const [, setLocation] = useLocation();
  const [saveToHistory, setSaveToHistory] = useState(false);
  
  const { data: analysis, isLoading, refetch } = trpc.analysis.get.useQuery(
    { id: analysisId },
    { enabled: !!analysisId }
  );
  
  const updateAnalysis = trpc.analysis.update.useMutation();
  const deleteAnalysis = trpc.analysis.delete.useMutation();
  const generateReport = trpc.report.generate.useMutation();
  const exportDocx = trpc.report.exportDocx.useMutation();
  const { data: printableReport } = trpc.report.getPrintable.useQuery(
    { analysisId },
    { enabled: !!analysisId && analysis?.status === 'completed' }
  );

  const handleSaveToHistory = async (checked: boolean) => {
    setSaveToHistory(checked);
    try {
      await updateAnalysis.mutateAsync({
        id: analysisId,
        savedToHistory: checked
      });
      toast.success(checked ? "Análise salva no histórico" : "Análise removida do histórico");
    } catch (error) {
      toast.error("Erro ao atualizar");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta análise?")) return;
    
    try {
      await deleteAnalysis.mutateAsync({ id: analysisId });
      toast.success("Análise excluída");
      setLocation("/dashboard");
    } catch (error) {
      toast.error("Erro ao excluir análise");
    }
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    try {
      const result = await generateReport.mutateAsync({ analysisId, format });
      window.open(result.url, '_blank');
      toast.success(`Relatório ${format.toUpperCase()} gerado!`);
    } catch (error) {
      toast.error("Erro ao gerar relatório");
    }
  };

  const handleExportDocx = async () => {
    try {
      const result = await exportDocx.mutateAsync({ analysisId });
      // Create a download link
      const link = document.createElement('a');
      link.href = result.url;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Relatório Word (DOCX) gerado com sucesso!');
    } catch (error) {
      toast.error("Erro ao gerar relatório Word");
    }
  };

  const handlePrint = () => {
    if (printableReport?.html) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printableReport.html);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Concluída</span>
          </div>
        );
      case 'processing':
        return (
          <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Processando</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Falhou</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-muted-foreground bg-muted px-3 py-1 rounded-full">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Rascunho</span>
          </div>
        );
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'news': return <Newspaper className="w-4 h-4" />;
      case 'web': return <Globe className="w-4 h-4" />;
      default: return <Upload className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-fgv-blue" />
        </div>
      </DashboardLayout>
    );
  }

  if (!analysis) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Análise não encontrada</h2>
          <Button onClick={() => setLocation("/dashboard")}>
            Voltar ao Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-[var(--fgv-primary-4)]">{analysis.title}</h1>
                {getStatusBadge(analysis.status)}
              </div>
              <p className="text-white/80">{analysis.objective}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="content">
          <TabsList>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="sources">Fontes ({analysis.sources?.length || 0})</TabsTrigger>
            <TabsTrigger value="export">Exportar</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-6">
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle>Análise Gerada</CardTitle>
                <CardDescription>
                  Conteúdo gerado pela inteligência artificial
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysis.status === 'completed' && analysis.generatedContent ? (
                  <div className="prose prose-slate max-w-none">
                    <Streamdown>{analysis.generatedContent}</Streamdown>
                  </div>
                ) : analysis.status === 'processing' ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin text-fgv-blue mx-auto mb-4" />
                    <p className="text-muted-foreground">Processando análise...</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Isso pode levar alguns minutos
                    </p>
                  </div>
                ) : analysis.status === 'failed' ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">Erro ao processar análise</p>
                    <Button 
                      className="mt-4"
                      onClick={() => setLocation(`/analysis/new`)}
                    >
                      Tentar novamente
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Esta análise ainda não foi executada
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources" className="mt-6">
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle>Fontes Utilizadas</CardTitle>
                <CardDescription>
                  Documentos e notícias usados na análise
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysis.sources && analysis.sources.length > 0 ? (
                  <div className="space-y-3">
                    {analysis.sources.map((source) => (
                      <div
                        key={source.id}
                        className="flex items-start justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            {getSourceIcon(source.sourceType)}
                          </div>
                          <div>
                            <p className="font-medium">
                              {source.title || source.fileName || 'Fonte sem título'}
                            </p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {source.sourceType}
                            </p>
                            {source.extractedText && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {source.extractedText.substring(0, 200)}...
                              </p>
                            )}
                          </div>
                        </div>
                        {source.url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(source.url!, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma fonte adicionada
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="mt-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Exportar Relatório
                  </CardTitle>
                  <CardDescription>
                    Baixe o relatório com identidade visual FGV
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="w-full bg-fgv-blue hover:bg-fgv-blue/90"
                    onClick={handlePrint}
                    disabled={analysis.status !== 'completed'}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Visualizar / Imprimir PDF
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleExport('pdf')}
                    disabled={analysis.status !== 'completed' || generateReport.isPending}
                  >
                    {generateReport.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Baixar HTML
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full border-fgv-accent text-fgv-accent hover:bg-fgv-accent/10"
                    onClick={handleExportDocx}
                    disabled={analysis.status !== 'completed' || exportDocx.isPending}
                  >
                    {exportDocx.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4 mr-2" />
                    )}
                    Baixar Word (DOCX)
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    Histórico
                  </CardTitle>
                  <CardDescription>
                    Salve esta análise para consulta futura
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="save-history">Salvar no histórico</Label>
                    <Switch
                      id="save-history"
                      checked={analysis.savedToHistory || saveToHistory}
                      onCheckedChange={handleSaveToHistory}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Análises salvas ficam disponíveis na seção de histórico
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
