import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { 
  FileText, 
  Search,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Trash2,
  Calendar,
  CheckSquare,
  Square,
  Archive,
  ArchiveRestore,
  FolderArchive
} from "lucide-react";
import { useLocation } from "wouter";

export default function History() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  
  const { data: analyses, isLoading, refetch } = trpc.analysis.list.useQuery({ savedOnly: true });
  const { data: archivedAnalyses, isLoading: isLoadingArchived, refetch: refetchArchived } = trpc.analysis.listArchived.useQuery();
  
  const deleteAnalysis = trpc.analysis.delete.useMutation();
  const deleteMany = trpc.analysis.deleteMany.useMutation();
  const archiveMany = trpc.analysis.archiveMany.useMutation();
  const restoreMany = trpc.analysis.restoreMany.useMutation();

  const currentAnalyses = activeTab === "active" ? analyses : archivedAnalyses;
  const currentLoading = activeTab === "active" ? isLoading : isLoadingArchived;

  const filteredAnalyses = useMemo(() => {
    return currentAnalyses?.filter(a => 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.objective.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  }, [currentAnalyses, searchQuery]);

  const allSelected = filteredAnalyses.length > 0 && filteredAnalyses.every(a => selectedIds.has(a.id));
  const someSelected = selectedIds.size > 0;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAnalyses.map(a => a.id)));
    }
  };

  const handleSelectOne = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Tem certeza que deseja excluir permanentemente esta análise?")) return;
    
    try {
      await deleteAnalysis.mutateAsync({ id });
      toast.success("Análise excluída permanentemente");
      refetch();
      refetchArchived();
    } catch (error) {
      toast.error("Erro ao excluir análise");
    }
  };

  const handleArchive = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setIsProcessing(true);
    try {
      await archiveMany.mutateAsync({ ids: [id] });
      toast.success("Análise arquivada");
      setSelectedIds(new Set());
      refetch();
      refetchArchived();
    } catch (error) {
      toast.error("Erro ao arquivar análise");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleArchiveSelected = async () => {
    if (selectedIds.size === 0) return;
    
    const count = selectedIds.size;
    
    setIsProcessing(true);
    try {
      await archiveMany.mutateAsync({ ids: Array.from(selectedIds) });
      toast.success(`${count} análise(s) arquivada(s)`);
      setSelectedIds(new Set());
      refetch();
      refetchArchived();
    } catch (error) {
      toast.error("Erro ao arquivar análises");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreSelected = async () => {
    if (selectedIds.size === 0) return;
    
    const count = selectedIds.size;
    
    setIsProcessing(true);
    try {
      await restoreMany.mutateAsync({ ids: Array.from(selectedIds) });
      toast.success(`${count} análise(s) restaurada(s)`);
      setSelectedIds(new Set());
      refetch();
      refetchArchived();
    } catch (error) {
      toast.error("Erro ao restaurar análises");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    
    const count = selectedIds.size;
    if (!confirm(`Tem certeza que deseja excluir permanentemente ${count} análise(s)?`)) return;
    
    setIsProcessing(true);
    try {
      await deleteMany.mutateAsync({ ids: Array.from(selectedIds) });
      toast.success(`${count} análise(s) excluída(s) permanentemente`);
      setSelectedIds(new Set());
      refetch();
      refetchArchived();
    } catch (error) {
      toast.error("Erro ao excluir análises");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedIds(new Set());
    setSearchQuery("");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'processing': return 'Processando';
      case 'failed': return 'Falhou';
      default: return 'Rascunho';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderAnalysisList = () => {
    if (currentLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-fgv-blue" />
        </div>
      );
    }

    if (filteredAnalyses.length === 0) {
      return (
        <div className="text-center py-12">
          {activeTab === "active" ? (
            <>
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? "Nenhuma análise encontrada com esse termo"
                  : "Você ainda não salvou nenhuma análise no histórico"
                }
              </p>
              {!searchQuery && (
                <Button 
                  onClick={() => setLocation("/analysis/new")}
                  className="bg-fgv-blue hover:bg-fgv-blue/90"
                >
                  Criar Nova Análise
                </Button>
              )}
            </>
          ) : (
            <>
              <FolderArchive className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? "Nenhuma análise arquivada encontrada com esse termo"
                  : "Você não tem análises arquivadas"
                }
              </p>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {filteredAnalyses.map((analysis) => (
          <div
            key={analysis.id}
            className={`flex items-center justify-between p-4 rounded-lg border transition-colors group ${
              selectedIds.has(analysis.id) 
                ? 'border-fgv-blue bg-fgv-blue/5' 
                : 'border-border hover:bg-muted/50'
            } cursor-pointer`}
            onClick={() => setLocation(`/analysis/${analysis.id}`)}
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Checkbox */}
              <div 
                className="flex-shrink-0"
                onClick={(e) => handleSelectOne(analysis.id, e)}
              >
                <Checkbox
                  checked={selectedIds.has(analysis.id)}
                  className="data-[state=checked]:bg-fgv-blue data-[state=checked]:border-fgv-blue"
                />
              </div>
              
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                activeTab === "archived" ? "bg-gray-200" : "bg-fgv-blue/10"
              }`}>
                {activeTab === "archived" ? (
                  <FolderArchive className="w-6 h-6 text-gray-500" />
                ) : (
                  <FileText className="w-6 h-6 text-fgv-blue" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium line-clamp-1">{analysis.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {analysis.objective}
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatDate(analysis.createdAt)}
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {getStatusIcon(analysis.status)}
                    <span className="text-muted-foreground">
                      {getStatusLabel(analysis.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {activeTab === "active" ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleArchive(analysis.id, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Arquivar"
                >
                  <Archive className="w-4 h-4 text-amber-500" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    restoreMany.mutateAsync({ ids: [analysis.id] }).then(() => {
                      toast.success("Análise restaurada");
                      refetch();
                      refetchArchived();
                    });
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Restaurar"
                >
                  <ArchiveRestore className="w-4 h-4 text-green-500" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => handleDelete(analysis.id, e)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                title="Excluir permanentemente"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--fgv-primary-4)]">Histórico de Análises</h1>
            <p className="text-white/80">Suas análises salvas e arquivadas</p>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
            <Input
              placeholder="Buscar análises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
        </div>

        {/* Analyses List */}
        <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <TabsList>
                  <TabsTrigger value="active" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Ativas ({analyses?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="archived" className="gap-2">
                    <FolderArchive className="w-4 h-4" />
                    Arquivadas ({archivedAnalyses?.length || 0})
                  </TabsTrigger>
                </TabsList>
                
                {/* Bulk actions */}
                {filteredAnalyses.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      className="gap-2"
                    >
                      {allSelected ? (
                        <>
                          <CheckSquare className="w-4 h-4" />
                          Desmarcar
                        </>
                      ) : (
                        <>
                          <Square className="w-4 h-4" />
                          Selecionar Todos
                        </>
                      )}
                    </Button>
                    
                    {someSelected && activeTab === "active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleArchiveSelected}
                        disabled={isProcessing}
                        className="gap-2 text-amber-600 border-amber-300 hover:bg-amber-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Archive className="w-4 h-4" />
                        )}
                        Arquivar ({selectedIds.size})
                      </Button>
                    )}
                    
                    {someSelected && activeTab === "archived" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRestoreSelected}
                        disabled={isProcessing}
                        className="gap-2 text-green-600 border-green-300 hover:bg-green-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ArchiveRestore className="w-4 h-4" />
                        )}
                        Restaurar ({selectedIds.size})
                      </Button>
                    )}
                    
                    {someSelected && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteSelected}
                        disabled={isProcessing}
                        className="gap-2"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Excluir ({selectedIds.size})
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Tabs>
            
            <CardDescription className="mt-2">
              {filteredAnalyses.length} análise(s) {activeTab === "archived" ? "arquivada(s)" : ""} encontrada(s)
              {someSelected && ` • ${selectedIds.size} selecionada(s)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderAnalysisList()}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
