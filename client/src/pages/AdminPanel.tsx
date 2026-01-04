import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Calendar,
  Shield,
  Loader2,
  Trash2,
  CheckCircle2,
  XCircle,
  Bot,
  Settings,
  Save,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Zap,
  BarChart3,
  Thermometer,
  RotateCcw,
  Edit,
  FileText,
  AlertTriangle,
  UserCog,
  Search,
  Filter,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  Plus,
  ChevronUp,
  ChevronDown,
  Download,
  Key,
  Sliders,
  Globe,
  Volume2,
  VolumeX,
  Stamp,
  Move,
  Image
} from "lucide-react";
import CounselorsManagement from "./admin/CounselorsManagement";
import UsersManagement from "./admin/UsersManagement";
import ImageUploadSection from "./admin/ImageUploadSection";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation } from "wouter";
import * as XLSX from "xlsx";

export default function AdminPanel() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteValidUntil, setInviteValidUntil] = useState("");
  const [inviteQuota, setInviteQuota] = useState("5");
  const [inviteRole, setInviteRole] = useState<"pesquisador" | "diretor" | "administrador">("pesquisador");
  
  // Check if user is admin or owner
  const isAdmin = user?.role === 'administrador';
  const isOwner = user?.role === 'diretor';
  const hasAccess = isAdmin || isOwner;
  const [dialogOpen, setDialogOpen] = useState(false);

  // All hooks must be called before any conditional returns
  const { data: users, isLoading: loadingUsers, refetch: refetchUsers } = trpc.admin.getUsers.useQuery(
    undefined,
    { enabled: hasAccess }
  );
  const { data: invitedUsers, isLoading: loadingInvited, refetch: refetchInvited } = trpc.admin.getInvitedUsers.useQuery(
    undefined,
    { enabled: hasAccess }
  );
  
  const inviteUser = trpc.admin.inviteUser.useMutation();
  const updateInvitedUser = trpc.admin.updateInvitedUser.useMutation();
  const deleteInvitedUser = trpc.admin.deleteInvitedUser.useMutation();
  const updateUserAccess = trpc.admin.updateUserAccess.useMutation();
  
  // LLM Config hooks (admin only)
  const { data: llmConfigs, isLoading: loadingLlmConfigs, refetch: refetchLlmConfigs } = trpc.admin.getCounselorLlmConfigs.useQuery(
    undefined,
    { enabled: isAdmin }
  );
  const updateLlmConfig = trpc.admin.updateCounselorLlmConfig.useMutation();
  const bulkUpdateLlm = trpc.admin.bulkUpdateCounselorLlm.useMutation();
  const forceSyncCounselors = trpc.admin.forceSyncCounselors.useMutation();
  const reorderLlmConfigs = trpc.admin.reorderCounselorLlmConfigs.useMutation();
  
  // LLM Pricing hooks (admin only) - para validar modelos disponíveis
  const { data: availableLlmModels } = trpc.admin.getAvailableLlmModels.useQuery(
    undefined,
    { enabled: isAdmin }
  );
  
  // LLM editing state
  const [editingLlm, setEditingLlm] = useState<Record<string, {
    llmProvider: string;
    llmModel: string;
    endpoint: string;
    apiKey: string;
    isActive: boolean;
  }>>({});
  
  // LLM Usage Costs hooks (admin only)
  const { data: llmUsageSummary, isLoading: loadingUsageSummary } = trpc.admin.getLlmUsageSummary.useQuery(
    undefined,
    { enabled: isAdmin }
  );
  const { data: llmCostsByProvider, isLoading: loadingCostsByProvider } = trpc.admin.getLlmCostsByProvider.useQuery(
    undefined,
    { enabled: isAdmin }
  );
  const { data: recentLlmUsage, isLoading: loadingRecentUsage } = trpc.admin.getRecentLlmUsage.useQuery(
    { limit: 20 },
    { enabled: isAdmin }
  );

  // Report Costs hooks (admin only)
  const { data: reportCosts, isLoading: loadingReportCosts } = trpc.admin.getReportCosts.useQuery(
    { limit: 100 },
    { enabled: isAdmin }
  );
  const { data: reportCostsSummary, isLoading: loadingReportCostsSummary } = trpc.admin.getReportCostsSummary.useQuery(
    undefined,
    { enabled: isAdmin }
  );

  // Temperature Config hooks (admin only)
  const { data: temperatureConfigs, isLoading: loadingTemperatureConfigs, refetch: refetchTemperatureConfigs } = trpc.admin.getTemperatureConfigs.useQuery(
    undefined,
    { enabled: isAdmin }
  );
  const updateTemperatureConfig = trpc.admin.updateTemperatureConfig.useMutation();
  const bulkUpdateTemperatures = trpc.admin.bulkUpdateTemperatures.useMutation();
  const resetTemperatures = trpc.admin.resetTemperatures.useMutation();

  // Temperature editing state
  const [editingTemps, setEditingTemps] = useState<Record<string, number>>({});

  // Personality editing state
  const [editingPersonality, setEditingPersonality] = useState<string | null>(null);
  const [personalityValues, setPersonalityValues] = useState<Record<string, string>>({});
  
  // Counselor configs for personality tab (admin only)
  const { data: counselorConfigs, isLoading: loadingCounselorConfigs, refetch: refetchCounselorConfigs } = trpc.admin.getCounselorLlmConfigs.useQuery(
    undefined,
    { enabled: isAdmin }
  );
  const updateCounselorPersonality = trpc.admin.updateCounselorPersonality.useMutation();

  // System Prompts hooks (admin only)
  const { data: systemPrompts, isLoading: loadingSystemPrompts, refetch: refetchSystemPrompts } = trpc.admin.getSystemPrompts.useQuery(
    undefined,
    { enabled: isAdmin }
  );
  const updateSystemPrompt = trpc.admin.updateSystemPrompt.useMutation();
  const resetSystemPrompt = trpc.admin.resetSystemPrompt.useMutation();
  const resetAllSystemPrompts = trpc.admin.resetAllSystemPrompts.useMutation();
  const createSystemPrompt = trpc.admin.createSystemPrompt.useMutation();
  const deleteSystemPrompt = trpc.admin.deleteSystemPrompt.useMutation();

  // Prompts editing state
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [promptValues, setPromptValues] = useState<Record<string, string>>({});
  const [showNewPromptDialog, setShowNewPromptDialog] = useState(false);
  const [newPrompt, setNewPrompt] = useState({
    promptKey: '',
    promptName: '',
    description: '',
    promptContent: '',
  });

  // LLM Config handlers - agora usa dados da tabela de preços
  // IMPORTANTE: Esses useMemo devem estar ANTES de qualquer return condicional
  const LLM_PROVIDERS = useMemo(() => {
    if (!availableLlmModels || availableLlmModels.length === 0) {
      // Fallback se não houver dados
      return [
        { value: 'google', label: 'Google' },
        { value: 'anthropic', label: 'Anthropic' },
        { value: 'openai', label: 'OpenAI' },
        { value: 'deepseek', label: 'DeepSeek' },
      ];
    }
    const providers = Array.from(new Set(availableLlmModels.map(m => m.provider)));
    return providers.map(p => ({
      value: p,
      label: p.charAt(0).toUpperCase() + p.slice(1),
    }));
  }, [availableLlmModels]);

  const LLM_MODELS: Record<string, { value: string; label: string }[]> = useMemo(() => {
    if (!availableLlmModels || availableLlmModels.length === 0) {
      // Fallback se não houver dados
      return {
        google: [{ value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' }],
        anthropic: [{ value: 'claude-sonnet-4', label: 'Claude Sonnet 4' }],
        openai: [{ value: 'gpt-4o', label: 'GPT-4o' }],
        deepseek: [{ value: 'deepseek-chat', label: 'DeepSeek Chat' }],
      };
    }
    const models: Record<string, { value: string; label: string }[]> = {};
    for (const m of availableLlmModels) {
      if (!models[m.provider]) models[m.provider] = [];
      models[m.provider].push({
        value: m.modelName,
        label: m.displayName || m.modelName,
      });
    }
    return models;
  }, [availableLlmModels]);

  // Check if user has access (admin or owner) - after all hooks
  if (!hasAccess) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-4">
            Esta página é restrita a administradores e proprietários
          </p>
          <Button onClick={() => setLocation("/dashboard")}>
            Voltar ao Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Digite um email válido");
      return;
    }

    try {
      await inviteUser.mutateAsync({
        email: inviteEmail,
        validUntil: inviteValidUntil ? new Date(inviteValidUntil).toISOString() : undefined,
        analysisQuota: parseInt(inviteQuota) || 5,
        role: inviteRole
      });
      toast.success("Usuário convidado com sucesso!");
      setInviteEmail("");
      setInviteValidUntil("");
      setInviteQuota("5");
      setInviteRole("pesquisador");
      setDialogOpen(false);
      refetchInvited();
    } catch (error: any) {
      toast.error(error.message || "Erro ao convidar usuário");
    }
  };

  const handleToggleUserActive = async (userId: number, currentActive: boolean, validUntil: Date | null) => {
    try {
      await updateUserAccess.mutateAsync({
        userId,
        isActive: !currentActive,
        validUntil: validUntil?.toISOString() || null
      });
      toast.success(currentActive ? "Usuário desativado" : "Usuário ativado");
      refetchUsers();
    } catch (error) {
      toast.error("Erro ao atualizar usuário");
    }
  };

  const handleToggleInvitedActive = async (id: number, currentActive: boolean, validUntil: Date | null) => {
    try {
      await updateInvitedUser.mutateAsync({
        id,
        isActive: !currentActive,
        validUntil: validUntil?.toISOString() || null
      });
      toast.success(currentActive ? "Convite desativado" : "Convite ativado");
      refetchInvited();
    } catch (error) {
      toast.error("Erro ao atualizar convite");
    }
  };

  const handleDeleteInvited = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este convite?")) return;
    
    try {
      await deleteInvitedUser.mutateAsync({ id });
      toast.success("Convite excluído");
      refetchInvited();
    } catch (error) {
      toast.error("Erro ao excluir convite");
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Sem limite";
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const isExpired = (date: Date | string | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const handleLlmFieldChange = (counselorId: string, field: string, value: string | boolean) => {
    const config = llmConfigs?.find(c => c.counselorId === counselorId);
    if (!config) return;
    
    setEditingLlm(prev => ({
      ...prev,
      [counselorId]: {
        llmProvider: prev[counselorId]?.llmProvider ?? config.llmProvider,
        llmModel: prev[counselorId]?.llmModel ?? config.llmModel,
        endpoint: prev[counselorId]?.endpoint ?? config.endpoint ?? '',
        apiKey: prev[counselorId]?.apiKey ?? config.apiKey ?? '',
        isActive: prev[counselorId]?.isActive ?? config.isActive,
        [field]: value,
      },
    }));
  };

  const handleSaveLlmConfig = async (counselorId: string) => {
    const config = llmConfigs?.find(c => c.counselorId === counselorId);
    const editing = editingLlm[counselorId];
    if (!config) return;
    
    try {
      await updateLlmConfig.mutateAsync({
        counselorId: config.counselorId,
        counselorName: config.counselorName,
        llmProvider: editing?.llmProvider ?? config.llmProvider,
        llmModel: editing?.llmModel ?? config.llmModel,
        endpoint: editing?.endpoint || null,
        apiKey: editing?.apiKey || null,
        isActive: editing?.isActive ?? config.isActive,
      });
      toast.success(`Configuração de ${config.counselorName} atualizada!`);
      setEditingLlm(prev => {
        const newState = { ...prev };
        delete newState[counselorId];
        return newState;
      });
      refetchLlmConfigs();
    } catch (error) {
      toast.error('Erro ao salvar configuração');
    }
  };

  const handleBulkUpdateLlm = async () => {
    try {
      await bulkUpdateLlm.mutateAsync({
        llmProvider: 'google',
        llmModel: 'gemini-2.5-pro',
      });
      toast.success('Todos os agentes atualizados para Google Gemini 2.5 Pro!');
      setEditingLlm({});
      refetchLlmConfigs();
    } catch (error) {
      toast.error('Erro ao atualizar configurações');
    }
  };

  const handleForceSyncCounselors = async () => {
    try {
      const result = await forceSyncCounselors.mutateAsync();
      const messages: string[] = [];
      if (result.added.length > 0) {
        messages.push(`${result.added.length} adicionado(s)`);
      }
      if (result.updated.length > 0) {
        messages.push(`${result.updated.length} atualizado(s)`);
      }
      if (result.removed.length > 0) {
        messages.push(`${result.removed.length} removido(s)`);
      }
      if (messages.length === 0) {
        toast.success('Sincronização concluída! Todos os conselheiros já estavam sincronizados.');
      } else {
        toast.success(`Sincronização concluída: ${messages.join(', ')}`);
      }
      if (result.errors.length > 0) {
        toast.error(`Erros: ${result.errors.join(', ')}`);
      }
      refetchLlmConfigs();
    } catch (error) {
      toast.error('Erro ao sincronizar conselheiros');
    }
  };

  // Função para mover agente para cima ou para baixo na lista
  const handleMoveAgent = async (configs: typeof llmConfigs, index: number, direction: 'up' | 'down') => {
    if (!configs) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= configs.length) return;
    
    // Criar nova ordem
    const reorderedConfigs = [...configs];
    const [movedItem] = reorderedConfigs.splice(index, 1);
    reorderedConfigs.splice(newIndex, 0, movedItem);
    
    // Preparar dados para atualização
    const updates = reorderedConfigs.map((config, idx) => ({
      counselorId: config.counselorId,
      displayOrder: idx,
    }));
    
    try {
      await reorderLlmConfigs.mutateAsync(updates);
      await refetchLlmConfigs();
      toast.success('Ordem atualizada com sucesso');
    } catch (error) {
      toast.error('Erro ao reordenar agentes');
    }
  };

  // Função para renderizar uma linha de configuração de LLM
  const renderLlmConfigRow = (
    config: typeof llmConfigs extends (infer T)[] | undefined ? T : never,
    index?: number,
    configs?: typeof llmConfigs,
    showReorder?: boolean
  ) => {
    const editing = editingLlm[config.counselorId];
    const currentProvider = editing?.llmProvider ?? config.llmProvider;
    const currentModel = editing?.llmModel ?? config.llmModel;
    const currentEndpoint = editing?.endpoint ?? config.endpoint ?? '';
    const currentApiKey = editing?.apiKey ?? config.apiKey ?? '';
    const currentActive = editing?.isActive ?? config.isActive;
    const hasChanges = !!editing;

    // Mapear nomes amigáveis para os agentes (agentes de sistema)
    const systemAgentNames: Record<string, string> = {
      'gennovais': 'GennovAIs',
      'editor': 'Max Weber',
      'proposal_evaluator': 'Avaliador de Propostas',
      'structure_generator': 'Gerador de Estrutura',
      'web_searcher': 'Pesquisador Web',
    };
    
    const getAgentDisplayName = (id: string, name: string) => {
      // Primeiro verifica agentes de sistema
      if (systemAgentNames[id]) return systemAgentNames[id];
      // Para conselheiros, usa o nome do banco
      return name || id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    // Ícone baseado na categoria
    const getAgentIcon = (id: string) => {
      if (['gennovais', 'editor'].includes(id)) {
        return <Shield className="w-4 h-4 text-[var(--fgv-aux-purple-2)]" />;
      }
      if (['proposal_evaluator', 'structure_generator', 'web_searcher'].includes(id)) {
        return <Zap className="w-4 h-4 text-[var(--fgv-aux-teal-2)]" />;
      }
      return <Bot className="w-4 h-4 text-fgv-blue" />;
    };

    return (
      <TableRow key={config.id}>
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            {getAgentIcon(config.counselorId)}
            <span>{getAgentDisplayName(config.counselorId, config.counselorName)}</span>
          </div>
        </TableCell>
        <TableCell>
          <Select
            value={currentProvider}
            onValueChange={(value) => handleLlmFieldChange(config.counselorId, 'llmProvider', value)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LLM_PROVIDERS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell>
          <Select
            value={currentModel}
            onValueChange={(value) => handleLlmFieldChange(config.counselorId, 'llmModel', value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione o modelo" />
            </SelectTrigger>
            <SelectContent>
              {(LLM_MODELS[currentProvider] || []).map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  <div className="flex flex-col">
                    <span>{m.label}</span>
                    <span className="text-xs text-muted-foreground font-mono">{m.value}</span>
                  </div>
                </SelectItem>
              ))}
              {(!LLM_MODELS[currentProvider] || LLM_MODELS[currentProvider].length === 0) && (
                <SelectItem value="_none" disabled>
                  Nenhum modelo cadastrado para este provedor
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell>
          <Input
            placeholder="URL personalizada"
            value={currentEndpoint}
            onChange={(e) => handleLlmFieldChange(config.counselorId, 'endpoint', e.target.value)}
            className="w-[160px]"
          />
        </TableCell>
        <TableCell>
          <Input
            type="password"
            placeholder="Chave API"
            value={currentApiKey}
            onChange={(e) => handleLlmFieldChange(config.counselorId, 'apiKey', e.target.value)}
            className="w-[130px]"
          />
        </TableCell>
        <TableCell>
          <Switch
            checked={currentActive}
            onCheckedChange={(checked) => handleLlmFieldChange(config.counselorId, 'isActive', checked)}
          />
        </TableCell>
        <TableCell>
          <Button
            variant={hasChanges ? "default" : "ghost"}
            size="icon"
            onClick={() => handleSaveLlmConfig(config.counselorId)}
            disabled={!hasChanges || updateLlmConfig.isPending}
            className={hasChanges ? "bg-fgv-blue hover:bg-fgv-blue/90" : ""}
          >
            {updateLlmConfig.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
          </Button>
        </TableCell>
        {showReorder && configs && index !== undefined && (
          <TableCell>
            <div className="flex flex-col gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleMoveAgent(configs, index, 'up')}
                disabled={index === 0 || reorderLlmConfigs.isPending}
                title="Mover para cima"
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleMoveAgent(configs, index, 'down')}
                disabled={index === configs.length - 1 || reorderLlmConfigs.isPending}
                title="Mover para baixo"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </TableCell>
        )}
      </TableRow>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--fgv-primary-4)]">Painel de Configurações</h1>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Convidar Novo Usuário</DialogTitle>
                <DialogDescription>
                  O usuário receberá acesso após fazer login com este email
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@exemplo.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="validUntil">Válido até (opcional)</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={inviteValidUntil}
                    onChange={(e) => setInviteValidUntil(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Deixe em branco para acesso sem limite de tempo
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="quota">Número de Relatórios Gratuitos</Label>
                  <Input
                    id="quota"
                    type="number"
                    min="0"
                    placeholder="5"
                    value={inviteQuota}
                    onChange={(e) => setInviteQuota(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Após este limite, será cobrado $1 por análise
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="role">Tipo de Usuário</Label>
                  <select
                    id="role"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as "pesquisador" | "diretor" | "administrador")}
                  >
                    <option value="pesquisador">Pesquisador (apenas análises)</option>
                    <option value="diretor">Diretor (gerencia usuários e conselheiros)</option>
                    {isAdmin && <option value="administrador">Administrador (acesso total)</option>}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {inviteRole === 'pesquisador' && 'Pesquisadores podem apenas criar e visualizar análises'}
                    {inviteRole === 'diretor' && 'Diretores podem gerenciar usuários e conselheiros'}
                    {inviteRole === 'administrador' && 'Administradores têm acesso total ao sistema'}
                  </p>
                </div>
              </div>
              
              <DialogFooter className="flex gap-2 pt-4 border-t mt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleInviteUser}
                  disabled={inviteUser.isPending}
                  className="bg-fgv-blue hover:bg-fgv-blue/90"
                >
                  {inviteUser.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  Confirmar Convite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Users Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="w-full flex flex-wrap justify-start gap-1 h-auto p-2 bg-white/20 rounded-lg border border-white/30">
            <TabsTrigger value="users" className="flex items-center gap-2 text-white/90 data-[state=active]:bg-white data-[state=active]:text-[var(--fgv-primary-1)] hover:bg-white/20">
              <Users className="w-4 h-4" />
              Usuários
            </TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="counselors" className="flex items-center gap-2 text-white/90 data-[state=active]:bg-white data-[state=active]:text-[var(--fgv-primary-1)] hover:bg-white/20">
                  <UserCog className="w-4 h-4" />
                  Conselheiros
                </TabsTrigger>
                <TabsTrigger value="emails" className="flex items-center gap-2 text-white/90 data-[state=active]:bg-white data-[state=active]:text-[var(--fgv-primary-1)] hover:bg-white/20">
                  <Mail className="w-4 h-4" />
                  E-mails
                </TabsTrigger>
                <TabsTrigger value="prompts" className="flex items-center gap-2 text-white/90 data-[state=active]:bg-white data-[state=active]:text-[var(--fgv-primary-1)] hover:bg-white/20">
                  <FileText className="w-4 h-4" />
                  Prompts
                </TabsTrigger>
                <TabsTrigger value="llms" className="flex items-center gap-2 text-white/90 data-[state=active]:bg-white data-[state=active]:text-[var(--fgv-primary-1)] hover:bg-white/20">
                  <Bot className="w-4 h-4" />
                  LLMs
                </TabsTrigger>
                <TabsTrigger value="pricing" className="flex items-center gap-2 text-white/90 data-[state=active]:bg-white data-[state=active]:text-[var(--fgv-primary-1)] hover:bg-white/20">
                  <DollarSign className="w-4 h-4" />
                  Preços LLM
                </TabsTrigger>
                <TabsTrigger value="costs" className="flex items-center gap-2 text-white/90 data-[state=active]:bg-white data-[state=active]:text-[var(--fgv-primary-1)] hover:bg-white/20">
                  <TrendingUp className="w-4 h-4" />
                  Custos
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2 text-white/90 data-[state=active]:bg-white data-[state=active]:text-[var(--fgv-primary-1)] hover:bg-white/20">
                  <BarChart3 className="w-4 h-4" />
                  Histórico
                </TabsTrigger>
                <TabsTrigger value="parameters" className="flex items-center gap-2 text-white/90 data-[state=active]:bg-white data-[state=active]:text-[var(--fgv-primary-1)] hover:bg-white/20">
                  <Sliders className="w-4 h-4" />
                  Parâmetros
                </TabsTrigger>
                <TabsTrigger value="images" className="flex items-center gap-2 text-white/90 data-[state=active]:bg-white data-[state=active]:text-[var(--fgv-primary-1)] hover:bg-white/20">
                  <Image className="w-4 h-4" />
                  Imagens
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="llms" className="mt-6 space-y-6">
            {/* Configuração de LLM por Agente */}
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="w-5 h-5" />
                      Configuração de LLMs por Agente
                    </CardTitle>
                    <CardDescription>
                      Gerencie qual modelo de IA cada conselheiro e agente utiliza
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleForceSyncCounselors}
                      disabled={forceSyncCounselors.isPending}
                      className="flex items-center gap-2"
                    >
                      {forceSyncCounselors.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      Sincronizar Conselheiros
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleBulkUpdateLlm}
                      disabled={bulkUpdateLlm.isPending}
                      className="flex items-center gap-2"
                    >
                      {bulkUpdateLlm.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                      Unificar Todos para Gemini
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingLlmConfigs ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-fgv-blue" />
                  </div>
                ) : llmConfigs && llmConfigs.length > 0 ? (
                  <div className="space-y-8">
                    {/* Seção: Conselheiros */}
                    {(() => {
                      // Filtrar conselheiros (não são coordenadores nem tarefas)
                      const systemAgentIds = ['gennovais', 'editor', 'proposal_evaluator', 'structure_generator', 'web_searcher', 'counselor_autofill', 'price_updater'];
                      const counselorConfigs = llmConfigs.filter(c => 
                        !systemAgentIds.includes(c.counselorId)
                      );
                      if (counselorConfigs.length === 0) return null;
                      return (
                        <div>
                          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[var(--fgv-secondary-4)]">
                            <Users className="w-5 h-5 text-[var(--fgv-primary-2)]" />
                            <h3 className="text-lg font-semibold text-[var(--fgv-primary-1)]">Conselheiros</h3>
                            <span className="text-sm text-muted-foreground">(Analistas Geopolíticos)</span>
                          </div>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[220px]">Agente</TableHead>
                                  <TableHead>Provedor</TableHead>
                                  <TableHead>Modelo</TableHead>
                                  <TableHead>Endpoint</TableHead>
                                  <TableHead>API Key</TableHead>
                                  <TableHead className="w-[70px]">Ativo</TableHead>
                                  <TableHead className="w-[70px]">Salvar</TableHead>
                                  <TableHead className="w-[60px]">Ordem</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {counselorConfigs.map((config, index) => renderLlmConfigRow(config, index, counselorConfigs, true))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Seção: Coordenadores */}
                    {(() => {
                      const coordinatorConfigs = llmConfigs.filter(c => 
                        ['gennovais', 'editor'].includes(c.counselorId)
                      );
                      if (coordinatorConfigs.length === 0) return null;
                      return (
                        <div>
                          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[var(--fgv-secondary-4)]">
                            <Shield className="w-5 h-5 text-[var(--fgv-aux-purple-2)]" />
                            <h3 className="text-lg font-semibold text-[var(--fgv-primary-1)]">Coordenadores</h3>
                            <span className="text-sm text-muted-foreground">(GennovAIs e Max Weber)</span>
                          </div>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[220px]">Agente</TableHead>
                                  <TableHead>Provedor</TableHead>
                                  <TableHead>Modelo</TableHead>
                                  <TableHead>Endpoint</TableHead>
                                  <TableHead>API Key</TableHead>
                                  <TableHead className="w-[70px]">Ativo</TableHead>
                                  <TableHead className="w-[70px]">Salvar</TableHead>
                                  <TableHead className="w-[60px]">Ordem</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {coordinatorConfigs.map((config, index) => renderLlmConfigRow(config, index, coordinatorConfigs, true))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Seção: Tarefas */}
                    {(() => {
                      const taskConfigs = llmConfigs.filter(c => 
                        ['proposal_evaluator', 'structure_generator', 'web_searcher', 'counselor_autofill', 'price_updater'].includes(c.counselorId)
                      );
                      if (taskConfigs.length === 0) return null;
                      return (
                        <div>
                          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[var(--fgv-secondary-4)]">
                            <Zap className="w-5 h-5 text-[var(--fgv-aux-teal-2)]" />
                            <h3 className="text-lg font-semibold text-[var(--fgv-primary-1)]">Tarefas</h3>
                            <span className="text-sm text-muted-foreground">(Processos Automatizados)</span>
                          </div>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[220px]">Agente</TableHead>
                                  <TableHead>Provedor</TableHead>
                                  <TableHead>Modelo</TableHead>
                                  <TableHead>Endpoint</TableHead>
                                  <TableHead>API Key</TableHead>
                                  <TableHead className="w-[70px]">Ativo</TableHead>
                                  <TableHead className="w-[70px]">Salvar</TableHead>
                                  <TableHead className="w-[60px]">Ordem</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {taskConfigs.map((config, index) => renderLlmConfigRow(config, index, taskConfigs, true))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma configuração de LLM encontrada</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Configuração de Temperatura */}
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Thermometer className="w-5 h-5" />
                      Configuração de Temperatura
                    </CardTitle>
                    <CardDescription>
                      Ajuste a temperatura dos modelos LLM para cada tipo de agente. Valores mais altos geram respostas mais criativas, valores mais baixos geram respostas mais precisas.
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        await resetTemperatures.mutateAsync();
                        setEditingTemps({});
                        refetchTemperatureConfigs();
                        toast.success('Temperaturas restauradas para os valores padrão!');
                      } catch (error) {
                        toast.error('Erro ao restaurar temperaturas');
                      }
                    }}
                    disabled={resetTemperatures.isPending}
                  >
                    {resetTemperatures.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RotateCcw className="w-4 h-4 mr-2" />
                    )}
                    Restaurar Padrões
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingTemperatureConfigs ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : temperatureConfigs && temperatureConfigs.length > 0 ? (
                  <div className="space-y-6">
                    {/* Temperature Cards */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {temperatureConfigs.map((config) => {
                        const currentTemp = editingTemps[config.agentType] ?? parseFloat(config.temperature?.toString() || '0.7');
                        const isEdited = editingTemps[config.agentType] !== undefined;
                        
                        const getAgentLabel = (type: string) => {
                          switch (type) {
                            case 'counselor': return 'Conselheiros';
                            case 'gennovais': return 'GennovAIs';
                            case 'editor': return 'Max Weber';
                            case 'default': return 'Padrão';
                            default: return type;
                          }
                        };
                        
                        const getAgentIcon = (type: string) => {
                          switch (type) {
                            case 'counselor': return '🎭';
                            case 'gennovais': return '⭐';
                            case 'editor': return '✏️';
                            default: return '⚙️';
                          }
                        };
                        
                        const getTempColor = (temp: number) => {
                          if (temp <= 0.3) return 'text-[var(--fgv-primary-3)]';
                          if (temp <= 0.6) return 'text-[var(--fgv-aux-teal)]';
                          if (temp <= 0.8) return 'text-[var(--fgv-aux-yellow)]';
                          return 'text-[var(--fgv-aux-red)]';
                        };
                        
                        return (
                          <div
                            key={config.agentType}
                            className={`p-4 border rounded-lg transition-all ${
                              isEdited ? 'border-fgv-blue bg-fgv-blue/5' : 'border-border'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{getAgentIcon(config.agentType)}</span>
                                <div>
                                  <h4 className="font-semibold">{getAgentLabel(config.agentType)}</h4>
                                  <p className="text-xs text-muted-foreground">{config.description}</p>
                                </div>
                              </div>
                              <div className={`text-2xl font-bold ${getTempColor(currentTemp)}`}>
                                {currentTemp.toFixed(2)}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={currentTemp}
                                onChange={(e) => {
                                  setEditingTemps(prev => ({
                                    ...prev,
                                    [config.agentType]: parseFloat(e.target.value)
                                  }));
                                }}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-fgv-blue"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>❄️ Preciso (0.0)</span>
                                <span>🔥 Criativo (1.0)</span>
                              </div>
                            </div>
                            
                            {isEdited && (
                              <div className="flex gap-2 mt-3">
                                <Button
                                  size="sm"
                                  className="flex-1 bg-fgv-blue hover:bg-fgv-blue/90"
                                  onClick={async () => {
                                    try {
                                      await updateTemperatureConfig.mutateAsync({
                                        agentType: config.agentType,
                                        temperature: currentTemp,
                                        description: config.description || undefined,
                                      });
                                      setEditingTemps(prev => {
                                        const newState = { ...prev };
                                        delete newState[config.agentType];
                                        return newState;
                                      });
                                      refetchTemperatureConfigs();
                                      toast.success(`Temperatura de ${getAgentLabel(config.agentType)} atualizada!`);
                                    } catch (error) {
                                      toast.error('Erro ao salvar temperatura');
                                    }
                                  }}
                                  disabled={updateTemperatureConfig.isPending}
                                >
                                  {updateTemperatureConfig.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Save className="w-4 h-4 mr-1" />
                                  )}
                                  Salvar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingTemps(prev => {
                                      const newState = { ...prev };
                                      delete newState[config.agentType];
                                      return newState;
                                    });
                                  }}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Info Box */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Thermometer className="w-4 h-4" />
                        Sobre a Temperatura
                      </h4>
                      <div className="text-sm text-muted-foreground space-y-2">
                        <p>
                          <strong>Conselheiros (0.85):</strong> Alta criatividade para gerar análises diversificadas e perspectivas únicas de cada teórico geopolítico.
                        </p>
                        <p>
                          <strong>GennovAIs (0.60):</strong> Equilíbrio entre criatividade e estrutura para coordenar o debate e sintetizar as contribuições.
                        </p>
                        <p>
                          <strong>Editor (0.30):</strong> Alta precisão para garantir consistência, clareza e qualidade na revisão final do relatório.
                        </p>
                        <p className="text-xs mt-3 italic">
                          As temperaturas são registradas em cada chamada de API para análise posterior na aba "Custos".
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Thermometer className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma configuração de temperatura encontrada</p>
                    <Button
                      className="mt-4"
                      onClick={() => refetchTemperatureConfigs()}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Recarregar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* LLM Pricing Tab */}
          <TabsContent value="pricing" className="mt-6">
            <LlmPricingSection />
          </TabsContent>

          {/* Custos Tab - Unifica Custos LLM e Custos por Relatório */}
          <TabsContent value="costs" className="mt-6 space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingUsageSummary ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      `$${(llmUsageSummary?.totalCost || 0).toFixed(4)}`
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Acumulado desde o início</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tokens Totais</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingUsageSummary ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      (llmUsageSummary?.totalTokens || 0).toLocaleString()
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Input + Output</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Requisições</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingUsageSummary ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      (llmUsageSummary?.totalRequests || 0).toLocaleString()
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Total de chamadas API</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Provedores Ativos</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingUsageSummary ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      llmUsageSummary?.byProvider?.length || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Com uso registrado</p>
                </CardContent>
              </Card>
            </div>

            {/* Costs by Provider */}
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle>Custos por Provedor</CardTitle>
                <CardDescription>
                  Detalhamento de custos acumulados por provedor de LLM
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingCostsByProvider ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : llmCostsByProvider && llmCostsByProvider.length > 0 ? (
                  <div className="space-y-6">
                    {llmCostsByProvider.map((provider) => (
                      <div key={provider.provider} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-fgv-blue/10 flex items-center justify-center">
                              <Bot className="w-5 h-5 text-fgv-blue" />
                            </div>
                            <div>
                              <h4 className="font-semibold capitalize">{provider.provider}</h4>
                              <p className="text-sm text-muted-foreground">
                                {provider.requestCount} requisições
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-fgv-blue">
                              ${provider.totalCost.toFixed(4)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {provider.totalTokens.toLocaleString()} tokens
                            </p>
                          </div>
                        </div>
                        
                        {/* Models breakdown */}
                        {provider.models && provider.models.length > 0 && (
                          <div className="mt-4 border-t pt-4">
                            <p className="text-sm font-medium mb-2">Modelos utilizados:</p>
                            <div className="grid gap-2">
                              {provider.models.map((model) => (
                                <div key={model.model} className="flex items-center justify-between text-sm bg-muted/50 rounded px-3 py-2">
                                  <span className="font-mono text-xs">{model.model}</span>
                                  <div className="flex items-center gap-4">
                                    <span className="text-muted-foreground">
                                      {model.count} req | {model.tokens.toLocaleString()} tokens
                                    </span>
                                    <span className="font-semibold">${model.cost.toFixed(4)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum custo registrado ainda</p>
                    <p className="text-sm">Os custos serão exibidos após as primeiras análises</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Usage */}
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle>Uso Recente</CardTitle>
                <CardDescription>
                  Últimas chamadas de API registradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingRecentUsage ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : recentLlmUsage && recentLlmUsage.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead>Provedor</TableHead>
                          <TableHead>Modelo</TableHead>
                          <TableHead>Conselheiro</TableHead>
                          <TableHead className="text-right">Tokens</TableHead>
                          <TableHead className="text-right">Custo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentLlmUsage.map((usage) => (
                          <TableRow key={usage.id}>
                            <TableCell className="text-sm">
                              {new Date(usage.createdAt).toLocaleString('pt-BR')}
                            </TableCell>
                            <TableCell className="capitalize">{usage.llmProvider}</TableCell>
                            <TableCell className="font-mono text-xs">{usage.llmModel}</TableCell>
                            <TableCell className="capitalize">{usage.counselorId || '-'}</TableCell>
                            <TableCell className="text-right">
                              {usage.totalTokens.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              ${parseFloat(usage.costUsd?.toString() || '0').toFixed(6)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum uso registrado ainda</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Custos por Relatório - Integrado */}
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Custos por Relatório
                </CardTitle>
                <CardDescription>
                  Detalhamento de custos por relatório emitido
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Total de Relatórios</span>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                      {loadingReportCostsSummary ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        reportCostsSummary?.totalReports || 0
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Relatórios concluídos</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Custo Total</span>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                      {loadingReportCostsSummary ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        `$${(reportCostsSummary?.totalCost || 0).toFixed(4)}`
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Acumulado em relatórios</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Custo Médio</span>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                      {loadingReportCostsSummary ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        `$${(reportCostsSummary?.avgCostPerReport || 0).toFixed(4)}`
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Por relatório</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Tokens Totais</span>
                      <Zap className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                      {loadingReportCostsSummary ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        ((reportCostsSummary?.totalInputTokens || 0) + (reportCostsSummary?.totalOutputTokens || 0)).toLocaleString()
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Input + Output</p>
                  </div>
                </div>

                {/* Report Costs Table */}
                {loadingReportCosts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : reportCosts && reportCosts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Título do Relatório</TableHead>
                          <TableHead className="text-right">Tokens In</TableHead>
                          <TableHead className="text-right">Tokens Out</TableHead>
                          <TableHead className="text-right">Total Tokens</TableHead>
                          <TableHead className="text-right">Custo (USD)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportCosts.map((report) => (
                          <TableRow key={report.analysisId}>
                            <TableCell className="text-sm">
                              {report.completedAt ? new Date(report.completedAt).toLocaleString('pt-BR') : '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{report.userName}</span>
                                <span className="text-xs text-muted-foreground">{report.userEmail}</span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[300px] truncate" title={report.title}>
                              {report.title}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm">
                              {report.inputTokens.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm">
                              {report.outputTokens.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm font-semibold">
                              {report.totalTokens.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-fgv-blue">
                              ${report.totalCostUsd.toFixed(4)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum relatório concluído ainda</p>
                    <p className="text-sm">Os custos serão exibidos após a conclusão das primeiras análises</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Config Tab */}
          <TabsContent value="emails" className="mt-6">
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
              <CardContent className="pt-6">
                <EmailConfigSection />
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Prompts Tab */}
          <TabsContent value="prompts" className="mt-6">
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Prompts do Sistema</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      onClick={() => setShowNewPromptDialog(true)}
                      className="bg-[var(--fgv-primary-2)] hover:bg-[var(--fgv-primary-1)]"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Prompt
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          await resetAllSystemPrompts.mutateAsync();
                          refetchSystemPrompts();
                          toast.success('Todos os prompts foram resetados para o padrão!');
                        } catch (error) {
                          toast.error('Erro ao resetar prompts');
                        }
                      }}
                      disabled={resetAllSystemPrompts.isPending}
                    >
                      {resetAllSystemPrompts.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <RotateCcw className="w-4 h-4 mr-2" />
                      )}
                      Resetar Todos
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingSystemPrompts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : systemPrompts && systemPrompts.length > 0 ? (
                  <div className="space-y-6">
                    {/* Prompts ordenados por ordem de uso no fluxo de análise */}
                    <div className="space-y-4">
                      {(() => {
                        // Ordem de uso no fluxo de análise
                        const promptOrder = [
                          'novaes_proposal_evaluator',  // Passo 2
                          'novaes_structure_generator', // Passo 3
                          'novaes_session_coordinator', // Passo 6
                          'counselor_task',             // Passo 6
                          'novaes_approval_messages',   // Passo 6
                          'novaes_rejection_messages',  // Passo 6
                          'editor_consolidator',        // Passo 7
                          'counselor_autofill',         // Admin
                        ];
                        
                        const stepLabels: Record<string, string> = {
                          'novaes_proposal_evaluator': 'Passo 2',
                          'novaes_structure_generator': 'Passo 3',
                          'novaes_session_coordinator': 'Passo 6',
                          'counselor_task': 'Passo 6',
                          'novaes_approval_messages': 'Passo 6',
                          'novaes_rejection_messages': 'Passo 6',
                          'editor_consolidator': 'Passo 7',
                          'counselor_autofill': 'Admin',
                        };
                        
                        // Mapeamento de promptKey para counselorId na tabela counselor_llm_config
                        const promptToCounselorId: Record<string, string> = {
                          'novaes_proposal_evaluator': 'proposal_evaluator',
                          'novaes_structure_generator': 'structure_generator',
                          'novaes_session_coordinator': 'gennovais',
                          'counselor_task': 'counselor', // usa config geral dos conselheiros
                          'novaes_approval_messages': 'gennovais',
                          'novaes_rejection_messages': 'gennovais',
                          'editor_consolidator': 'editor',
                          'counselor_autofill': 'counselor_autofill',
                        };
                        
                        // Função para obter o LLM configurado para um prompt
                        const getLlmForPrompt = (promptKey: string): string => {
                          const counselorId = promptToCounselorId[promptKey];
                          if (!counselorId || !llmConfigs) return 'Não configurado';
                          
                          // Para counselor_task, mostrar info dos conselheiros
                          if (promptKey === 'counselor_task') {
                            const counselorLlms = llmConfigs.filter(c => 
                              !['gennovais', 'editor', 'proposal_evaluator', 'structure_generator', 'web_searcher', 'counselor_autofill'].includes(c.counselorId)
                            );
                            if (counselorLlms.length > 0) {
                              const uniqueModels = Array.from(new Set(counselorLlms.map(c => c.llmModel)));
                              return uniqueModels.join(' / ');
                            }
                            return 'Não configurado';
                          }
                          
                          const config = llmConfigs.find(c => c.counselorId === counselorId);
                          if (!config) return 'Não configurado';
                          return config.llmModel || 'Não configurado';
                        };
                        
                        // Informações de quem chama (caller é fixo, llm é dinâmico)
                        const promptCallers: Record<string, string> = {
                          'novaes_proposal_evaluator': 'GennovAIs (Coordenador)',
                          'novaes_structure_generator': 'GennovAIs (Coordenador)',
                          'novaes_session_coordinator': 'GennovAIs (Coordenador)',
                          'counselor_task': 'Conselheiros (6 especialistas)',
                          'novaes_approval_messages': 'GennovAIs (Coordenador)',
                          'novaes_rejection_messages': 'GennovAIs (Coordenador)',
                          'editor_consolidator': 'Max Weber (Editor-Chefe)',
                          'counselor_autofill': 'Admin (Preenchimento IA)',
                        };
                        
                        // Gerar promptMetadata dinamicamente
                        const promptMetadata: Record<string, { caller: string; llm: string }> = {};
                        Object.keys(promptCallers).forEach(key => {
                          promptMetadata[key] = {
                            caller: promptCallers[key],
                            llm: getLlmForPrompt(key)
                          };
                        });
                        
                        // Ordenar prompts pela ordem definida
                        const sortedPrompts = [...systemPrompts].sort((a, b) => {
                          const indexA = promptOrder.indexOf(a.promptKey);
                          const indexB = promptOrder.indexOf(b.promptKey);
                          if (indexA === -1 && indexB === -1) return 0;
                          if (indexA === -1) return 1;
                          if (indexB === -1) return -1;
                          return indexA - indexB;
                        });
                        
                        return sortedPrompts.map((prompt) => {
                          const isEditing = editingPrompt === prompt.promptKey;
                          const currentContent = promptValues[prompt.promptKey] ?? prompt.promptContent;
                          const isModified = prompt.promptContent !== prompt.defaultContent;
                          
                          return (
                            <div
                              key={prompt.promptKey}
                              className="p-4 border rounded-lg"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    {stepLabels[prompt.promptKey] && (
                                      <span className="text-xs bg-[var(--fgv-primary-2)] text-white px-2 py-0.5 rounded">
                                        {stepLabels[prompt.promptKey]}
                                      </span>
                                    )}
                                    <h4 className="font-semibold">{prompt.promptName}</h4>
                                    {isModified && (
                                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                                        Modificado
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {prompt.description}
                                  </p>
                                  <div className="flex flex-wrap gap-3 mt-2">
                                    <p className="text-xs text-muted-foreground">
                                      Chave: <code className="bg-muted px-1 rounded">{prompt.promptKey}</code>
                                    </p>
                                    {promptMetadata[prompt.promptKey] && (
                                      <>
                                        <p className="text-xs">
                                          <span className="text-muted-foreground">Chamado por:</span>{' '}
                                          <span className="font-medium text-[var(--fgv-primary-1)]">
                                            {promptMetadata[prompt.promptKey].caller}
                                          </span>
                                        </p>
                                        <p className="text-xs">
                                          <span className="text-muted-foreground">LLM:</span>{' '}
                                          <span className="font-medium bg-[var(--fgv-secondary-4)] text-[var(--fgv-primary-1)] px-1.5 py-0.5 rounded">
                                            {promptMetadata[prompt.promptKey].llm}
                                          </span>
                                        </p>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {!isEditing && (
                                  <div className="flex gap-2 items-center">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingPrompt(prompt.promptKey);
                                        setPromptValues(prev => ({
                                          ...prev,
                                          [prompt.promptKey]: prompt.promptContent
                                        }));
                                      }}
                                    >
                                      <Edit className="w-4 h-4 mr-1" />
                                      Editar
                                    </Button>
                                    {isModified && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={async () => {
                                          try {
                                            await resetSystemPrompt.mutateAsync({ promptKey: prompt.promptKey });
                                            refetchSystemPrompts();
                                            toast.success('Prompt resetado para o padrão!');
                                          } catch (error) {
                                            toast.error('Erro ao resetar prompt');
                                          }
                                        }}
                                        disabled={resetSystemPrompt.isPending}
                                      >
                                        <RotateCcw className="w-4 h-4" />
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                      onClick={async () => {
                                        if (confirm(`Tem certeza que deseja excluir o prompt "${prompt.promptName}"?`)) {
                                          try {
                                            await deleteSystemPrompt.mutateAsync({ promptKey: prompt.promptKey });
                                            refetchSystemPrompts();
                                            toast.success('Prompt excluído com sucesso!');
                                          } catch (error) {
                                            toast.error('Erro ao excluir prompt');
                                          }
                                        }
                                      }}
                                      disabled={deleteSystemPrompt.isPending}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                              
                              {isEditing ? (
                                <div className="space-y-3">
                                  <Textarea
                                    value={currentContent}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPromptValues(prev => ({
                                      ...prev,
                                      [prompt.promptKey]: e.target.value
                                    }))}
                                    className="min-h-[300px] font-mono text-sm"
                                    placeholder="Digite o conteúdo do prompt..."
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={async () => {
                                        try {
                                          await updateSystemPrompt.mutateAsync({
                                            promptKey: prompt.promptKey,
                                            promptContent: currentContent
                                          });
                                          setEditingPrompt(null);
                                          refetchSystemPrompts();
                                          toast.success('Prompt atualizado com sucesso!');
                                        } catch (error) {
                                          toast.error('Erro ao atualizar prompt');
                                        }
                                      }}
                                      disabled={updateSystemPrompt.isPending}
                                      className="bg-fgv-blue hover:bg-fgv-blue/90"
                                    >
                                      {updateSystemPrompt.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Save className="w-4 h-4 mr-1" />
                                      )}
                                      Salvar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingPrompt(null);
                                        setPromptValues(prev => {
                                          const newState = { ...prev };
                                          delete newState[prompt.promptKey];
                                          return newState;
                                        });
                                      }}
                                    >
                                      Cancelar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setPromptValues(prev => ({
                                          ...prev,
                                          [prompt.promptKey]: prompt.defaultContent
                                        }));
                                      }}
                                    >
                                      <RotateCcw className="w-4 h-4 mr-1" />
                                      Restaurar Padrão
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-muted/30 rounded p-3 max-h-[200px] overflow-y-auto">
                                  <pre className="text-sm whitespace-pre-wrap font-mono">{prompt.promptContent}</pre>
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                    
                    {/* Info Box */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-800">
                        <AlertTriangle className="w-4 h-4" />
                        Atenção ao Editar Prompts
                      </h4>
                      <div className="text-sm text-amber-700 space-y-2">
                        <p>
                          Os prompts definem o comportamento dos agentes do sistema. Alterações podem afetar significativamente a qualidade das análises.
                        </p>
                        <p>
                          <strong>Variáveis disponíveis no prompt de tarefa:</strong> <code>{'{COUNSELOR_NAME}'}</code>, <code>{'{KEY_THEORY}'}</code>
                        </p>
                        <p>
                          Use o botão "Restaurar Padrão" para reverter alterações individuais ou "Resetar Todos" para restaurar todos os prompts.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum prompt encontrado</p>
                    <Button
                      className="mt-4"
                      onClick={() => refetchSystemPrompts()}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Recarregar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Dialog para adicionar novo prompt */}
            <Dialog open={showNewPromptDialog} onOpenChange={setShowNewPromptDialog}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Prompt</DialogTitle>
                  <DialogDescription>
                    Crie um novo prompt para o sistema multi-agente.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="promptKey">Chave do Prompt</Label>
                    <Input
                      id="promptKey"
                      placeholder="ex: custom_analysis_prompt"
                      value={newPrompt.promptKey}
                      onChange={(e) => setNewPrompt(prev => ({ ...prev, promptKey: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">Identificador único (sem espaços, use underscore)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promptName">Nome do Prompt</Label>
                    <Input
                      id="promptName"
                      placeholder="ex: Prompt de Análise Personalizada"
                      value={newPrompt.promptName}
                      onChange={(e) => setNewPrompt(prev => ({ ...prev, promptName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      placeholder="Descreva o propósito deste prompt"
                      value={newPrompt.description}
                      onChange={(e) => setNewPrompt(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promptContent">Conteúdo do Prompt</Label>
                    <Textarea
                      id="promptContent"
                      placeholder="Digite o conteúdo do prompt..."
                      className="min-h-[200px] font-mono text-sm"
                      value={newPrompt.promptContent}
                      onChange={(e) => setNewPrompt(prev => ({ ...prev, promptContent: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewPromptDialog(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!newPrompt.promptKey || !newPrompt.promptName || !newPrompt.promptContent) {
                        toast.error('Preencha todos os campos obrigatórios');
                        return;
                      }
                      try {
                        await createSystemPrompt.mutateAsync({
                          promptKey: newPrompt.promptKey,
                          promptName: newPrompt.promptName,
                          description: newPrompt.description,
                          promptContent: newPrompt.promptContent,
                        });
                        refetchSystemPrompts();
                        setShowNewPromptDialog(false);
                        setNewPrompt({ promptKey: '', promptName: '', description: '', promptContent: '' });
                        toast.success('Prompt criado com sucesso!');
                      } catch (error) {
                        toast.error('Erro ao criar prompt');
                      }
                    }}
                    disabled={createSystemPrompt.isPending}
                    className="bg-[var(--fgv-primary-2)] hover:bg-[var(--fgv-primary-1)]"
                  >
                    {createSystemPrompt.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Criar Prompt
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Counselors Management Tab */}
          {isAdmin && (
            <TabsContent value="counselors" className="mt-6">
              <CounselorsManagement />
            </TabsContent>
          )}

          {/* History Tab */}
          {isAdmin && (
            <TabsContent value="history" className="mt-6">
              <AnalysisHistorySection />
            </TabsContent>
          )}

          {/* Parameters Tab */}
          {isAdmin && (
            <TabsContent value="parameters" className="mt-6">
              <ParametersSection />
            </TabsContent>
          )}

          {/* Images Tab */}
          {isAdmin && (
            <TabsContent value="images" className="mt-6">
              <ImageUploadSection />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Email Config Section Component
// Email editing state type
type EmailEditState = {
  configValue: string;
  sendEmails: boolean;
  emailSubject: string;
  emailBody: string;
  senderEmail: string;
};

function EmailConfigSection() {
  const { data: emailConfigs, isLoading, refetch } = trpc.admin.getEmailConfigs.useQuery();
  const updateEmailConfig = trpc.admin.updateEmailConfig.useMutation();
  const addEmailConfig = trpc.admin.addEmailConfig.useMutation();
  const deleteEmailConfig = trpc.admin.deleteEmailConfig.useMutation();
  
  const [editingEmails, setEditingEmails] = useState<Record<string, EmailEditState>>({});
  const [expandedConfig, setExpandedConfig] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConfig, setNewConfig] = useState({
    configKey: '',
    configValue: '',
    description: '',
    emailSubject: '',
    emailBody: '',
    senderEmail: 'marlos@marlos.com.br',
  });

  const handleEmailChange = (configKey: string, field: keyof EmailEditState, newValue: string | boolean) => {
    const config = emailConfigs?.find(c => c.configKey === configKey);
    if (!config) return;
    
    setEditingEmails(prev => ({
      ...prev,
      [configKey]: {
        configValue: prev[configKey]?.configValue ?? config.configValue,
        sendEmails: prev[configKey]?.sendEmails ?? config.sendEmails,
        emailSubject: prev[configKey]?.emailSubject ?? (config.emailSubject || ''),
        emailBody: prev[configKey]?.emailBody ?? (config.emailBody || ''),
        senderEmail: prev[configKey]?.senderEmail ?? (config.senderEmail || 'marlos@marlos.com.br'),
        [field]: newValue,
      },
    }));
  };

  const handleSaveEmail = async (configKey: string) => {
    const config = emailConfigs?.find(c => c.configKey === configKey);
    const editing = editingEmails[configKey];
    if (!config) return;
    
    try {
      await updateEmailConfig.mutateAsync({
        configKey,
        configValue: editing?.configValue ?? config.configValue,
        description: config.description || undefined,
        sendEmails: editing?.sendEmails ?? config.sendEmails,
        emailSubject: editing?.emailSubject ?? config.emailSubject ?? undefined,
        emailBody: editing?.emailBody ?? config.emailBody ?? undefined,
        senderEmail: editing?.senderEmail ?? config.senderEmail ?? 'marlos@marlos.com.br',
      });
      toast.success('Configuração de email atualizada!');
      setEditingEmails(prev => {
        const newState = { ...prev };
        delete newState[configKey];
        return newState;
      });
      refetch();
    } catch (error) {
      toast.error('Erro ao atualizar configuração');
    }
  };

  const handleAddConfig = async () => {
    if (!newConfig.configKey.trim()) {
      toast.error('Digite uma chave para a configuração');
      return;
    }
    
    try {
      await addEmailConfig.mutateAsync({
        configKey: newConfig.configKey,
        configValue: newConfig.configValue,
        description: newConfig.description || undefined,
        sendEmails: true,
        emailSubject: newConfig.emailSubject || undefined,
        emailBody: newConfig.emailBody || undefined,
        senderEmail: newConfig.senderEmail || 'marlos@marlos.com.br',
      });
      toast.success('Nova configuração de email adicionada!');
      setNewConfig({
        configKey: '',
        configValue: '',
        description: '',
        emailSubject: '',
        emailBody: '',
        senderEmail: 'marlos@marlos.com.br',
      });
      setShowAddForm(false);
      refetch();
    } catch (error) {
      toast.error('Erro ao adicionar configuração');
    }
  };

  const handleDeleteConfig = async (configKey: string) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração?')) return;
    
    try {
      await deleteEmailConfig.mutateAsync({ configKey });
      toast.success('Configuração excluída!');
      refetch();
    } catch (error) {
      toast.error('Erro ao excluir configuração');
    }
  };

  const toggleExpand = (configKey: string) => {
    setExpandedConfig(prev => prev === configKey ? null : configKey);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Configuração de Emails</h4>
            <p className="text-sm text-blue-700 mt-1">
              Todos os emails são enviados a partir de <strong>marlos@marlos.com.br</strong>. 
              Você pode editar os templates (assunto e corpo) de cada tipo de email abaixo.
            </p>
            <p className="text-sm text-blue-700 mt-1">
              <strong>Variáveis disponíveis:</strong> {`{{userName}}, {{title}}, {{content}}, {{dashboardUrl}}, {{systemUrl}}, {{analysisQuota}}, {{senderName}}, {{senderEmail}}, {{subject}}, {{message}}`}
            </p>
          </div>
        </div>
      </div>

      {/* Existing Configs */}
      <div className="space-y-4">
        {emailConfigs?.map((config) => {
          const editing = editingEmails[config.configKey];
          const isExpanded = expandedConfig === config.configKey;
          const hasChanges = editing !== undefined;
          
          const currentValue = editing?.configValue ?? config.configValue;
          const currentSendEmails = editing?.sendEmails ?? config.sendEmails;
          const currentSubject = editing?.emailSubject ?? (config.emailSubject || '');
          const currentBody = editing?.emailBody ?? (config.emailBody || '');
          const currentSender = editing?.senderEmail ?? (config.senderEmail || 'marlos@marlos.com.br');
          
          return (
            <div key={config.configKey} className="border rounded-lg overflow-hidden">
              {/* Header */}
              <div 
                className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleExpand(config.configKey)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                    <div>
                      <h4 className="font-medium">{config.configKey}</h4>
                      {config.description && (
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <label className="flex items-center gap-2 text-sm">
                      {currentSendEmails ? (
                        <Volume2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-gray-400" />
                      )}
                      <Switch
                        checked={currentSendEmails}
                        onCheckedChange={(checked) => handleEmailChange(config.configKey, 'sendEmails', checked)}
                      />
                    </label>
                    {hasChanges && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Alterações não salvas
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-4 space-y-4 border-t">
                  {/* Sender Email (read-only) */}
                  <div>
                    <Label className="flex items-center gap-2">
                      <Stamp className="w-4 h-4" />
                      Email Remetente
                    </Label>
                    <Input
                      value={currentSender}
                      disabled
                      className="bg-gray-100 mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Todos os emails são enviados a partir de marlos@marlos.com.br
                    </p>
                  </div>

                  {/* Recipient Email */}
                  <div>
                    <Label>Email Destinatário (para notificações admin)</Label>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      value={currentValue}
                      onChange={(e) => handleEmailChange(config.configKey, 'configValue', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {/* Email Subject */}
                  <div>
                    <Label>Assunto do Email</Label>
                    <Input
                      placeholder="Ex: [Conselho IA] Sua análise foi concluída: {{title}}"
                      value={currentSubject}
                      onChange={(e) => handleEmailChange(config.configKey, 'emailSubject', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {/* Email Body */}
                  <div>
                    <Label>Corpo do Email (HTML)</Label>
                    <Textarea
                      placeholder="Digite o conteúdo HTML do email..."
                      value={currentBody}
                      onChange={(e) => handleEmailChange(config.configKey, 'emailBody', e.target.value)}
                      className="mt-1 min-h-[200px] font-mono text-sm"
                    />
                  </div>

                  {/* Preview */}
                  {currentBody && (
                    <div>
                      <Label>Pré-visualização</Label>
                      <div 
                        className="mt-1 border rounded-lg p-4 bg-white max-h-[300px] overflow-auto"
                        dangerouslySetInnerHTML={{ __html: currentBody }}
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {hasChanges && (
                      <Button
                        onClick={() => handleSaveEmail(config.configKey)}
                        disabled={updateEmailConfig.isPending}
                        className="bg-fgv-blue hover:bg-fgv-blue/90"
                      >
                        {updateEmailConfig.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Salvar Alterações
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteConfig(config.configKey)}
                      disabled={deleteEmailConfig.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add New Config */}
      {showAddForm ? (
        <div className="p-4 border rounded-lg border-dashed space-y-4">
          <h4 className="font-medium">Nova Configuração de Email</h4>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Chave (identificador)</Label>
                <Input
                  placeholder="ex: support_email"
                  value={newConfig.configKey}
                  onChange={(e) => setNewConfig(prev => ({ ...prev, configKey: e.target.value }))}
                />
              </div>
              <div>
                <Label>Email Destinatário</Label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={newConfig.configValue}
                  onChange={(e) => setNewConfig(prev => ({ ...prev, configValue: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Descrição</Label>
              <Input
                placeholder="Descrição do uso deste email"
                value={newConfig.description}
                onChange={(e) => setNewConfig(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <Label>Assunto do Email</Label>
              <Input
                placeholder="Ex: [Conselho IA] Notificação"
                value={newConfig.emailSubject}
                onChange={(e) => setNewConfig(prev => ({ ...prev, emailSubject: e.target.value }))}
              />
            </div>
            <div>
              <Label>Corpo do Email (HTML)</Label>
              <Textarea
                placeholder="Digite o conteúdo HTML do email..."
                value={newConfig.emailBody}
                onChange={(e) => setNewConfig(prev => ({ ...prev, emailBody: e.target.value }))}
                className="min-h-[150px] font-mono text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleAddConfig}
              disabled={addEmailConfig.isPending}
              className="bg-fgv-blue hover:bg-fgv-blue/90"
            >
              {addEmailConfig.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => setShowAddForm(true)}
          className="w-full border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Nova Configuração de Email
        </Button>
      )}
    </div>
  );
}


// Analysis History Section Component
function AnalysisHistorySection() {
  const [filters, setFilters] = useState({
    userId: undefined as number | undefined,
    status: undefined as string | undefined,
    startDate: '',
    endDate: '',
    limit: 20,
    offset: 0,
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: historyData, isLoading, refetch } = trpc.admin.getAnalysisHistory.useQuery({
    userId: filters.userId,
    status: filters.status,
    startDate: filters.startDate ? new Date(filters.startDate).toISOString() : undefined,
    endDate: filters.endDate ? new Date(filters.endDate).toISOString() : undefined,
    limit: filters.limit,
    offset: filters.offset,
  });
  
  const { data: stats, isLoading: loadingStats } = trpc.admin.getAnalysisHistoryStats.useQuery();
  const { data: users } = trpc.admin.getUsers.useQuery();
  
  const deleteAnalysis = trpc.admin.deleteAnalysisAdmin.useMutation({
    onSuccess: () => {
      toast.success('Análise deletada com sucesso');
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao deletar análise: ${error.message}`);
    },
  });
  
  const deleteMultipleAnalyses = trpc.admin.deleteMultipleAnalysesAdmin.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.deletedCount} análise(s) deletada(s) com sucesso`);
      setSelectedIds([]);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao deletar análises: ${error.message}`);
    },
  });
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showDeleteMultipleConfirm, setShowDeleteMultipleConfirm] = useState(false);
  
  const handleDelete = (id: number) => {
    deleteAnalysis.mutate({ id });
    setDeleteConfirmId(null);
  };
  
  const handleDeleteMultiple = () => {
    deleteMultipleAnalyses.mutate({ ids: selectedIds });
    setShowDeleteMultipleConfirm(false);
  };
  
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAnalyses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAnalyses.map(a => a.id));
    }
  };
  
  const toggleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };
  
  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const formatCost = (cost: string | number | null) => {
    if (!cost) return '-';
    return `$${parseFloat(cost.toString()).toFixed(4)}`;
  };
  
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      draft: { label: 'Rascunho', className: 'bg-gray-100 text-gray-700' },
      processing: { label: 'Processando', className: 'bg-blue-100 text-blue-700' },
      completed: { label: 'Concluída', className: 'bg-green-100 text-green-700' },
      failed: { label: 'Falhou', className: 'bg-red-100 text-red-700' },
      timeout: { label: 'Timeout', className: 'bg-orange-100 text-orange-700' },
      cancelled: { label: 'Cancelada', className: 'bg-gray-100 text-gray-700' },
    };
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };
  
  const getRoleBadge = (role: string | null) => {
    if (!role) return null;
    const roleConfig: Record<string, { label: string; className: string }> = {
      pesquisador: { label: 'Pesquisador', className: 'bg-gray-500 text-white' },
      diretor: { label: 'Diretor', className: 'bg-blue-500 text-white' },
      administrador: { label: 'Admin', className: 'bg-red-500 text-white' },
    };
    const config = roleConfig[role] || { label: role, className: 'bg-gray-500 text-white' };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };
  
  const totalPages = Math.ceil((historyData?.total || 0) / filters.limit);
  const currentPage = Math.floor(filters.offset / filters.limit) + 1;
  
  const filteredAnalyses = historyData?.analyses?.filter(a => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      a.title?.toLowerCase().includes(term) ||
      a.userName?.toLowerCase().includes(term) ||
      a.userEmail?.toLowerCase().includes(term)
    );
  }) || [];
  
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader className="pb-2">
            <CardDescription>Total de Análises</CardDescription>
            <CardTitle className="text-2xl text-fgv-blue">
              {loadingStats ? <Loader2 className="w-5 h-5 animate-spin" /> : historyData?.total || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader className="pb-2">
            <CardDescription>Concluídas</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {loadingStats ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.statusCounts?.completed || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader className="pb-2">
            <CardDescription>Em Processamento</CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              {loadingStats ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.statusCounts?.processing || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader className="pb-2">
            <CardDescription>Custo Total</CardDescription>
            <CardTitle className="text-2xl text-fgv-yellow">
              {loadingStats ? <Loader2 className="w-5 h-5 animate-spin" /> : formatCost(stats?.totalCost || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      
      {/* Filters */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Label className="text-xs text-muted-foreground">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Título, usuário ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Usuário</Label>
              <Select
                value={filters.userId?.toString() || 'all'}
                onValueChange={(v) => setFilters(f => ({ ...f, userId: v === 'all' ? undefined : parseInt(v), offset: 0 }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os usuários</SelectItem>
                  {users?.map(u => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.name || u.email || `Usuário ${u.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(v) => setFilters(f => ({ ...f, status: v === 'all' ? undefined : v, offset: 0 }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="processing">Processando</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                  <SelectItem value="timeout">Timeout</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({ userId: undefined, status: undefined, startDate: '', endDate: '', limit: 20, offset: 0 });
                  setSearchTerm('');
                }}
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div>
              <Label className="text-xs text-muted-foreground">Data Início</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value, offset: 0 }))}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Data Fim</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value, offset: 0 }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Analysis List */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5" />
              Histórico de Análises
            </CardTitle>
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => setShowDeleteMultipleConfirm(true)}
                  disabled={deleteMultipleAnalyses.isPending}
                >
                  {deleteMultipleAnalyses.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Deletar ({selectedIds.length})
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
          <CardDescription>
            {selectedIds.length > 0 ? (
              <span className="text-blue-600 font-medium">
                {selectedIds.length} análise(s) selecionada(s)
              </span>
            ) : (
              <>Mostrando {filteredAnalyses.length} de {historyData?.total || 0} análises</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-fgv-blue" />
            </div>
          ) : filteredAnalyses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma análise encontrada</p>
              <p className="text-sm mt-2">Ajuste os filtros ou aguarde novas análises serem criadas.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <Checkbox
                          checked={selectedIds.length === filteredAnalyses.length && filteredAnalyses.length > 0}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Selecionar todos"
                        />
                      </TableHead>
                      <TableHead className="w-[50px]">ID</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Custo</TableHead>
                      <TableHead>Criada em</TableHead>
                      <TableHead>Concluída em</TableHead>
                      <TableHead className="w-[80px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAnalyses.map((analysis) => (
                      <TableRow key={analysis.id} className={selectedIds.includes(analysis.id) ? 'bg-blue-50' : ''}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(analysis.id)}
                            onCheckedChange={() => toggleSelectOne(analysis.id)}
                            aria-label={`Selecionar análise ${analysis.id}`}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs">{analysis.id}</TableCell>
                        <TableCell>
                          <div className="max-w-[300px]">
                            <p className="font-medium truncate">{analysis.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{analysis.objective}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm">{analysis.userName || 'Sem nome'}</span>
                            <span className="text-xs text-muted-foreground">{analysis.userEmail}</span>
                            {getRoleBadge(analysis.userRole)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(analysis.status)}</TableCell>
                        <TableCell className="font-mono text-sm">{formatCost(analysis.actualCost)}</TableCell>
                        <TableCell className="text-sm">{formatDate(analysis.createdAt)}</TableCell>
                        <TableCell className="text-sm">{formatDate(analysis.completedAt)}</TableCell>
                        <TableCell>
                          {deleteConfirmId === analysis.id ? (
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(analysis.id)}
                                disabled={deleteAnalysis.isPending}
                                className="h-7 px-2"
                              >
                                {deleteAnalysis.isPending ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3 h-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDeleteConfirmId(null)}
                                className="h-7 px-2"
                              >
                                <XCircle className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteConfirmId(analysis.id)}
                              className="h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages || 1}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setFilters(f => ({ ...f, offset: Math.max(0, f.offset - f.limit) }))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setFilters(f => ({ ...f, offset: f.offset + f.limit }))}
                  >
                    Próxima
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog de confirmação para deleção múltipla */}
      <Dialog open={showDeleteMultipleConfirm} onOpenChange={setShowDeleteMultipleConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirmar Deleção Múltipla
            </DialogTitle>
            <DialogDescription>
              Você está prestes a deletar <strong>{selectedIds.length}</strong> análise(s). 
              Esta ação é irreversível e todos os dados associados serão permanentemente removidos.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Atenção:</strong> Esta operação irá remover permanentemente:
              </p>
              <ul className="text-sm text-red-700 mt-2 list-disc list-inside">
                <li>{selectedIds.length} análise(s)</li>
                <li>Todos os relatórios associados</li>
                <li>Histórico de execução</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteMultipleConfirm(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteMultiple}
              disabled={deleteMultipleAnalyses.isPending}
            >
              {deleteMultipleAnalyses.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deletando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deletar {selectedIds.length} Análise(s)
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


// LLM Pricing Section Component
function LlmPricingSection() {
  const utils = trpc.useUtils();
  const { data: pricingData, isLoading, refetch } = trpc.admin.getLlmPricing.useQuery();
  const createPricing = trpc.admin.createLlmPricing.useMutation();
  const updatePricing = trpc.admin.updateLlmPricing.useMutation();
  const deletePricing = trpc.admin.deleteLlmPricing.useMutation();
  const updatePricesViaAI = trpc.admin.updateLlmPricesViaAI.useMutation();
  
  // Função para invalidar todas as queries relacionadas a LLM
  const invalidateLlmQueries = () => {
    refetch();
    utils.admin.getAvailableLlmModels.invalidate();
  };
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [aiUpdateResult, setAiUpdateResult] = useState<{
    success: boolean;
    updatedCount: number;
    source?: string;
    lastUpdated?: string;
    cost?: number;
  } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    provider: '',
    modelName: '',
    displayName: '',
    inputPricePerMillion: '',
    outputPricePerMillion: '',
    description: '',
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      provider: '',
      modelName: '',
      displayName: '',
      inputPricePerMillion: '',
      outputPricePerMillion: '',
      description: '',
      isActive: true,
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleEdit = (pricing: typeof pricingData extends (infer T)[] | undefined ? T : never) => {
    if (!pricing) return;
    setFormData({
      provider: pricing.provider,
      modelName: pricing.modelName,
      displayName: pricing.displayName || '',
      inputPricePerMillion: pricing.inputPricePerMillion?.toString() || '',
      outputPricePerMillion: pricing.outputPricePerMillion?.toString() || '',
      description: pricing.description || '',
      isActive: pricing.isActive,
    });
    setEditingId(pricing.id);
    setShowAddForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.provider || !formData.modelName || !formData.inputPricePerMillion || !formData.outputPricePerMillion) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (editingId) {
        await updatePricing.mutateAsync({
          id: editingId,
          ...formData,
        });
        toast.success('Preço atualizado com sucesso');
      } else {
        await createPricing.mutateAsync(formData);
        toast.success('Preço criado com sucesso');
      }
      resetForm();
      invalidateLlmQueries();
    } catch (error) {
      toast.error('Erro ao salvar preço');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este preço?')) return;
    
    try {
      await deletePricing.mutateAsync({ id });
      toast.success('Preço excluído com sucesso');
      invalidateLlmQueries();
    } catch (error) {
      toast.error('Erro ao excluir preço');
    }
  };

  const providers = ['google', 'anthropic', 'openai', 'deepseek'];

  const handleAIUpdate = async () => {
    try {
      setAiUpdateResult(null);
      const result = await updatePricesViaAI.mutateAsync();
      setAiUpdateResult(result);
      const createdMsg = result.createdCount ? `${result.createdCount} novos modelos, ` : '';
      const updatedMsg = result.updatedCount ? `${result.updatedCount} atualizados` : 'nenhum atualizado';
      toast.success(`${createdMsg}${updatedMsg}`);
      invalidateLlmQueries();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao atualizar preços: ${errorMessage}`);
    }
  };

  const handleExportXLSX = () => {
    if (!pricingData || pricingData.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    // Preparar dados para exportação
    const exportData = pricingData.map(pricing => ({
      'Provedor': pricing.provider,
      'Nome Exibição': pricing.displayName || pricing.modelName,
      'ID Técnico (API)': pricing.modelName,
      'Input ($/1M tokens)': parseFloat(pricing.inputPricePerMillion?.toString() || '0'),
      'Output ($/1M tokens)': parseFloat(pricing.outputPricePerMillion?.toString() || '0'),
      'Status': pricing.isActive ? 'Ativo' : 'Inativo',
      'Atualizado': pricing.priceUpdatedAt 
        ? new Date(pricing.priceUpdatedAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : '-',
      'Descrição': pricing.description || '',
    }));

    // Criar workbook e worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Preços LLMs');

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 12 }, // Provedor
      { wch: 25 }, // Nome Exibição
      { wch: 30 }, // ID Técnico
      { wch: 18 }, // Input
      { wch: 18 }, // Output
      { wch: 10 }, // Status
      { wch: 18 }, // Atualizado
      { wch: 40 }, // Descrição
    ];
    ws['!cols'] = colWidths;

    // Gerar arquivo e download
    const fileName = `precos-llm-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success('Arquivo exportado com sucesso!');
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Preços de LLMs
            </CardTitle>
            <CardDescription>
              Gerencie os preços por milhão de tokens para cada modelo de LLM
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleExportXLSX}
              disabled={!pricingData?.length}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar XLSX
            </Button>
            <Button
              onClick={handleAIUpdate}
              disabled={updatePricesViaAI.isPending || !pricingData?.length}
              variant="outline"
              className="border-[var(--fgv-aux-teal-2)] text-[var(--fgv-aux-teal-2)] hover:bg-[var(--fgv-aux-teal-2)] hover:text-white"
            >
              {updatePricesViaAI.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Atualizar via IA
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
              className="bg-[var(--fgv-primary-2)] hover:bg-[var(--fgv-primary-1)]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Modelo
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <Card className="mb-6 border-2 border-[var(--fgv-primary-3)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {editingId ? 'Editar Preço' : 'Novo Preço de LLM'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Provedor *</Label>
                  <Input
                    value={formData.provider}
                    onChange={(e) => setFormData(f => ({ ...f, provider: e.target.value.toLowerCase() }))}
                    placeholder="ex: google, anthropic, openai"
                    list="provider-suggestions"
                  />
                  <datalist id="provider-suggestions">
                    {providers.map(p => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <Label>Nome do Modelo *</Label>
                  <Input
                    value={formData.modelName}
                    onChange={(e) => setFormData(f => ({ ...f, modelName: e.target.value }))}
                    placeholder="ex: gemini-2.5-pro"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Nome de Exibição</Label>
                <Input
                  value={formData.displayName}
                  onChange={(e) => setFormData(f => ({ ...f, displayName: e.target.value }))}
                  placeholder="ex: Gemini 2.5 Pro"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço Input ($/1M tokens) *</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={formData.inputPricePerMillion}
                    onChange={(e) => setFormData(f => ({ ...f, inputPricePerMillion: e.target.value }))}
                    placeholder="ex: 1.25"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço Output ($/1M tokens) *</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={formData.outputPricePerMillion}
                    onChange={(e) => setFormData(f => ({ ...f, outputPricePerMillion: e.target.value }))}
                    placeholder="ex: 5.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                  placeholder="Descrição opcional do modelo"
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(f => ({ ...f, isActive: checked }))}
                />
                <Label>Modelo ativo (disponível para seleção)</Label>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSubmit} className="bg-[var(--fgv-primary-2)] hover:bg-[var(--fgv-primary-1)]">
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Atualizar' : 'Salvar'}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provedor</TableHead>
                <TableHead>Nome Exibição</TableHead>
                <TableHead>ID Técnico (API)</TableHead>
                <TableHead className="text-right">Input ($/1M)</TableHead>
                <TableHead className="text-right">Output ($/1M)</TableHead>
                <TableHead>Atualizado</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricingData?.map((pricing) => (
                <TableRow key={pricing.id}>
                  <TableCell className="font-medium capitalize">{pricing.provider}</TableCell>
                  <TableCell className="font-medium">{pricing.displayName || pricing.modelName}</TableCell>
                  <TableCell>
                    <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">{pricing.modelName}</code>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${parseFloat(pricing.inputPricePerMillion?.toString() || '0').toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${parseFloat(pricing.outputPricePerMillion?.toString() || '0').toFixed(2)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {pricing.priceUpdatedAt ? (
                      new Date(pricing.priceUpdatedAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {pricing.isActive ? (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-400">
                        <XCircle className="w-4 h-4" />
                        Inativo
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(pricing)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(pricing.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!pricingData || pricingData.length === 0) && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum preço cadastrado. Clique em "Adicionar Modelo" para começar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}


// Parameters Section Component
function ParametersSection() {
  const { data: parameters, isLoading, refetch } = trpc.admin.getSystemParameters.useQuery();
  const updateParameter = trpc.admin.updateSystemParameter.useMutation();
  const resetSubmitted = trpc.admin.resetProposalsSubmitted.useMutation();
  const resetCompleted = trpc.admin.resetProposalsCompleted.useMutation();
  
  const [editingParams, setEditingParams] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  
  // Initialize editing state when data loads
  useEffect(() => {
    if (parameters) {
      const initial: Record<string, string> = {};
      parameters.forEach(p => {
        initial[p.key] = p.value;
      });
      setEditingParams(initial);
    }
  }, [parameters]);
  
  const handleSave = async (key: string) => {
    setIsSaving(prev => ({ ...prev, [key]: true }));
    try {
      await updateParameter.mutateAsync({ key, value: editingParams[key] });
      toast.success(`Parâmetro "${key}" atualizado com sucesso`);
      refetch();
    } catch (error) {
      toast.error("Erro ao atualizar parâmetro");
    } finally {
      setIsSaving(prev => ({ ...prev, [key]: false }));
    }
  };
  
  const handleResetSubmitted = async () => {
    try {
      await resetSubmitted.mutateAsync();
      // Atualizar o estado local para refletir a mudança imediatamente
      setEditingParams(prev => ({ ...prev, proposals_submitted_override: '0' }));
      toast.success("Contador de propostas submetidas zerado");
      refetch();
    } catch (error) {
      toast.error("Erro ao zerar contador");
    }
  };
  
  const handleResetCompleted = async () => {
    try {
      await resetCompleted.mutateAsync();
      // Atualizar o estado local para refletir a mudança imediatamente
      setEditingParams(prev => ({ ...prev, proposals_completed_override: '0' }));
      toast.success("Contador de propostas concluídas zerado");
      refetch();
    } catch (error) {
      toast.error("Erro ao zerar contador");
    }
  };
  
  const getParamConfig = (key: string) => {
    const configs: Record<string, { label: string; description: string; min?: number; max?: number; step?: number; unit?: string }> = {
      globe_rotation_speed: { 
        label: "Velocidade do Globo", 
        description: "Velocidade de rotação do globo na página inicial",
        min: 0.0001, max: 0.01, step: 0.0001
      },
      globe_opacity: { 
        label: "Opacidade do Globo", 
        description: "Opacidade do globo em porcentagem",
        min: 0, max: 100, step: 5, unit: "%"
      },
      globe_intensity: { 
        label: "Intensidade/Brilho do Globo", 
        description: "Intensidade do brilho do globo e das redes neurais",
        min: 0, max: 200, step: 10, unit: "%"
      },
      globe_size: { 
        label: "Tamanho do Globo", 
        description: "Tamanho do globo em porcentagem",
        min: 50, max: 200, step: 10, unit: "%"
      },
      globe_center_x: { 
        label: "Centro do Globo (X)", 
        description: "Coordenada X do centro do globo (% de deslocamento horizontal)",
        min: 0, max: 100, step: 5, unit: "%"
      },
      globe_center_y: { 
        label: "Centro do Globo (Y)", 
        description: "Coordenada Y do centro do globo (% de deslocamento vertical)",
        min: 0, max: 100, step: 5, unit: "%"
      },
      logo_height: { 
        label: "Altura da Logo FGV", 
        description: "Altura da logo FGV em pixels",
        min: 40, max: 200, step: 10, unit: "px"
      },
      logo_position_x: { 
        label: "Posição X da Logo", 
        description: "Deslocamento horizontal da logo em pixels (positivo = direita, negativo = esquerda)",
        min: -100, max: 100, step: 5, unit: "px"
      },
      logo_position_y: { 
        label: "Posição Y da Logo", 
        description: "Deslocamento vertical da logo em pixels (positivo = baixo, negativo = cima)",
        min: -100, max: 100, step: 5, unit: "px"
      },
      title_font_size: { 
        label: "Tamanho do Título", 
        description: "Tamanho da fonte do título principal em pixels",
        min: 24, max: 100, step: 2, unit: "px"
      },
      stamp_size: { 
        label: "Tamanho do Carimbo", 
        description: "Tamanho do carimbo em porcentagem",
        min: 50, max: 200, step: 10, unit: "%"
      },
      stamp_sound_enabled: { 
        label: "Som do Carimbo", 
        description: "Ativar ou desativar o som do carimbo"
      },
      proposals_submitted_override: { 
        label: "Override Propostas Submetidas", 
        description: "Valor fixo para exibição (vazio = contagem real)"
      },
      proposals_completed_override: { 
        label: "Override Propostas Concluídas", 
        description: "Valor fixo para exibição (vazio = contagem real)"
      },
      carousel_image_size: { 
        label: "Tamanho da Imagem", 
        description: "Tamanho da foto do conselheiro no carrossel",
        min: 80, max: 200, step: 10, unit: "px"
      },
      carousel_speed: { 
        label: "Velocidade do Carrossel", 
        description: "Tempo de exibição de cada conselheiro",
        min: 2000, max: 10000, step: 500, unit: "ms"
      },
      hero_left_offset_x: { 
        label: "Posição X do Bloco Esquerdo", 
        description: "Deslocamento horizontal do bloco esquerdo (textos, botões, carrossel) em pixels",
        min: -200, max: 200, step: 10, unit: "px"
      },
      hero_left_offset_y: { 
        label: "Posição Y do Bloco Esquerdo", 
        description: "Deslocamento vertical do bloco esquerdo (textos, botões, carrossel) em pixels",
        min: -200, max: 200, step: 10, unit: "px"
      },
    };
    return configs[key] || { label: key, description: "" };
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--fgv-primary-2)]" />
      </div>
    );
  }
  
  // Group parameters
  const globeParams = parameters?.filter(p => p.key.startsWith('globe_')) || [];
  const stampParams = parameters?.filter(p => p.key.startsWith('stamp_')) || [];
  const overrideParams = parameters?.filter(p => p.key.includes('override')) || [];
  const logoParams = parameters?.filter(p => p.key.startsWith('logo_')) || [];
  const titleParams = parameters?.filter(p => p.key === 'title_font_size') || [];
  const carouselParams = parameters?.filter(p => p.key.startsWith('carousel_')) || [];
  const heroLeftParams = parameters?.filter(p => p.key.startsWith('hero_left_')) || [];
  const exampleProposalParams = parameters?.filter(p => p.key.startsWith('example_proposal_')) || [];
  
  return (
    <div className="space-y-6">
      {/* Globe Settings */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Configurações do Globo
          </CardTitle>
          <CardDescription>
            Ajuste a aparência e comportamento do globo na página inicial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {globeParams.map(param => {
            const config = getParamConfig(param.key);
            return (
              <div key={param.key} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <Label className="font-medium">{config.label}</Label>
                  <p className="text-sm text-gray-500">{config.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={editingParams[param.key] || ''}
                    onChange={(e) => setEditingParams(prev => ({ ...prev, [param.key]: e.target.value }))}
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    className="w-32"
                  />
                  {config.unit && <span className="text-sm text-gray-500">{config.unit}</span>}
                  <Button
                    size="sm"
                    onClick={() => handleSave(param.key)}
                    disabled={isSaving[param.key]}
                  >
                    {isSaving[param.key] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
      
      {/* Stamp Settings */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stamp className="w-5 h-5" />
            Configurações do Carimbo
          </CardTitle>
          <CardDescription>
            Ajuste o tamanho e som do carimbo de aprovação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {stampParams.map(param => {
            const config = getParamConfig(param.key);
            const isBoolean = param.type === 'boolean';
            
            return (
              <div key={param.key} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <Label className="font-medium">{config.label}</Label>
                  <p className="text-sm text-gray-500">{config.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isBoolean ? (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={editingParams[param.key] === 'true'}
                        onCheckedChange={(checked) => {
                          setEditingParams(prev => ({ ...prev, [param.key]: checked ? 'true' : 'false' }));
                        }}
                      />
                      {editingParams[param.key] === 'true' ? (
                        <Volume2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <VolumeX className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  ) : (
                    <>
                      <Input
                        type="number"
                        value={editingParams[param.key] || ''}
                        onChange={(e) => setEditingParams(prev => ({ ...prev, [param.key]: e.target.value }))}
                        min={config.min}
                        max={config.max}
                        step={config.step}
                        className="w-32"
                      />
                      {config.unit && <span className="text-sm text-gray-500">{config.unit}</span>}
                    </>
                  )}
                  <Button
                    size="sm"
                    onClick={() => handleSave(param.key)}
                    disabled={isSaving[param.key]}
                  >
                    {isSaving[param.key] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
      
      {/* Logo Settings */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Configurações da Logo
          </CardTitle>
          <CardDescription>
            Ajuste o tamanho da logo FGV na página inicial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {logoParams.map(param => {
            const config = getParamConfig(param.key);
            return (
              <div key={param.key} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <Label className="font-medium">{config.label}</Label>
                  <p className="text-sm text-gray-500">{config.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={editingParams[param.key] || ''}
                    onChange={(e) => setEditingParams(prev => ({ ...prev, [param.key]: e.target.value }))}
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    className="w-32"
                  />
                  {config.unit && <span className="text-sm text-gray-500">{config.unit}</span>}
                  <Button
                    size="sm"
                    onClick={() => handleSave(param.key)}
                    disabled={isSaving[param.key]}
                  >
                    {isSaving[param.key] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
      
      {/* Title Settings */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Configurações do Título
          </CardTitle>
          <CardDescription>
            Ajuste o tamanho da fonte do título principal na página inicial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {titleParams.map(param => {
            const config = getParamConfig(param.key);
            return (
              <div key={param.key} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <Label className="font-medium">{config.label}</Label>
                  <p className="text-sm text-gray-500">{config.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={editingParams[param.key] || ''}
                    onChange={(e) => setEditingParams(prev => ({ ...prev, [param.key]: e.target.value }))}
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    className="w-32"
                  />
                  {config.unit && <span className="text-sm text-gray-500">{config.unit}</span>}
                  <Button
                    size="sm"
                    onClick={() => handleSave(param.key)}
                    disabled={isSaving[param.key]}
                  >
                    {isSaving[param.key] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
      
      {/* Carousel Settings */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Configurações do Carrossel de Conselheiros
          </CardTitle>
          <CardDescription>
            Ajuste o tamanho das imagens e a velocidade de transição do carrossel na hero
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {carouselParams.map(param => {
            const config = getParamConfig(param.key);
            return (
              <div key={param.key} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <Label className="font-medium">{config.label}</Label>
                  <p className="text-sm text-gray-500">{config.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={editingParams[param.key] || ''}
                    onChange={(e) => setEditingParams(prev => ({ ...prev, [param.key]: e.target.value }))}
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    className="w-32"
                  />
                  {config.unit && <span className="text-sm text-gray-500">{config.unit}</span>}
                  <Button
                    size="sm"
                    onClick={() => handleSave(param.key)}
                    disabled={isSaving[param.key]}
                  >
                    {isSaving[param.key] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
      
      {/* Hero Left Block Settings */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Move className="w-5 h-5" />
            Posição do Bloco Esquerdo
          </CardTitle>
          <CardDescription>
            Ajuste a posição do bloco esquerdo (textos, botões e carrossel) na hero section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {heroLeftParams.map(param => {
            const config = getParamConfig(param.key);
            return (
              <div key={param.key} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <Label className="font-medium">{config.label}</Label>
                  <p className="text-sm text-gray-500">{config.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={editingParams[param.key] || ''}
                    onChange={(e) => setEditingParams(prev => ({ ...prev, [param.key]: e.target.value }))}
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    className="w-32"
                  />
                  {config.unit && <span className="text-sm text-gray-500">{config.unit}</span>}
                  <Button
                    size="sm"
                    onClick={() => handleSave(param.key)}
                    disabled={isSaving[param.key]}
                  >
                    {isSaving[param.key] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
      
      {/* Counter Overrides */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Contadores da Página Inicial
          </CardTitle>
          <CardDescription>
            Gerencie os contadores exibidos na página inicial (propostas submetidas e concluídas)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {overrideParams.map(param => {
            const config = getParamConfig(param.key);
            return (
              <div key={param.key} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <Label className="font-medium">{config.label}</Label>
                  <p className="text-sm text-gray-500">{config.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={editingParams[param.key] || ''}
                    onChange={(e) => setEditingParams(prev => ({ ...prev, [param.key]: e.target.value }))}
                    placeholder="Vazio = contagem real"
                    className="w-40"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSave(param.key)}
                    disabled={isSaving[param.key]}
                  >
                    {isSaving[param.key] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            );
          })}
          
          {/* Reset Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleResetSubmitted}
              disabled={resetSubmitted.isPending}
              className="flex items-center gap-2"
            >
              {resetSubmitted.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              Zerar Propostas Submetidas
            </Button>
            <Button
              variant="outline"
              onClick={handleResetCompleted}
              disabled={resetCompleted.isPending}
              className="flex items-center gap-2"
            >
              {resetCompleted.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              Zerar Propostas Concluídas
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Example Proposal Settings */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Exemplo de Proposta
          </CardTitle>
          <CardDescription>
            Configure o conteúdo do exemplo de proposta exibido no botão "Carregar Exemplo" na página de nova análise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label className="font-medium">Título da Proposta</Label>
            <p className="text-sm text-gray-500">Título que será exibido no campo de título ao carregar o exemplo</p>
            <Input
              value={editingParams['example_proposal_title'] || ''}
              onChange={(e) => setEditingParams(prev => ({ ...prev, example_proposal_title: e.target.value }))}
              placeholder="Digite o título do exemplo de proposta..."
              className="w-full"
            />
            <Button
              size="sm"
              onClick={() => handleSave('example_proposal_title')}
              disabled={isSaving['example_proposal_title']}
              className="mt-2"
            >
              {isSaving['example_proposal_title'] ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar Título
            </Button>
          </div>
          
          {/* Context */}
          <div className="space-y-2">
            <Label className="font-medium">Contexto</Label>
            <p className="text-sm text-gray-500">Contexto que será exibido no campo de contexto ao carregar o exemplo</p>
            <Textarea
              value={editingParams['example_proposal_context'] || ''}
              onChange={(e) => setEditingParams(prev => ({ ...prev, example_proposal_context: e.target.value }))}
              placeholder="Digite o contexto do exemplo de proposta..."
              className="w-full min-h-[200px]"
            />
            <Button
              size="sm"
              onClick={() => handleSave('example_proposal_context')}
              disabled={isSaving['example_proposal_context']}
              className="mt-2"
            >
              {isSaving['example_proposal_context'] ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar Contexto
            </Button>
          </div>
          
          {/* Objective */}
          <div className="space-y-2">
            <Label className="font-medium">Objetivo</Label>
            <p className="text-sm text-gray-500">Objetivo que será exibido no campo de objetivo ao carregar o exemplo</p>
            <Textarea
              value={editingParams['example_proposal_objective'] || ''}
              onChange={(e) => setEditingParams(prev => ({ ...prev, example_proposal_objective: e.target.value }))}
              placeholder="Digite o objetivo do exemplo de proposta..."
              className="w-full min-h-[300px]"
            />
            <Button
              size="sm"
              onClick={() => handleSave('example_proposal_objective')}
              disabled={isSaving['example_proposal_objective']}
              className="mt-2"
            >
              {isSaving['example_proposal_objective'] ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar Objetivo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
