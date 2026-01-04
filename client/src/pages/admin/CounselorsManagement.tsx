import { useState, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  User,
  BookOpen,
  Brain,
  Settings,
  Save,
  X,
  Eye,
  EyeOff,
  GripVertical,
  Upload,
  Image as ImageIcon,
  Bot,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface Book {
  title: string;
  year?: number;
  description?: string;
}

interface CounselorFormData {
  counselorId: string;
  name: string;
  shortName: string;
  nationality: string;
  birthYear: number | undefined;
  deathYear: number | undefined;
  photoUrl: string;
  homePhotoUrl: string;
  bioPhotoUrl: string;
  shortBio: string;
  fullBio: string;
  mainTheory: string;
  keyContributions: string[];
  areasOfExpertise: string[];
  mainBooks: Book[];
  personalityTraits: string[];
  writingStyle: string;
  analysisApproach: string;
  keyPhrases: string[];
  isActive: boolean;
  disabledBannerText: string;
  displayOrder: number;
  personality: string;
}

const defaultFormData: CounselorFormData = {
  counselorId: "",
  name: "",
  shortName: "",
  nationality: "",
  birthYear: undefined,
  deathYear: undefined,
  photoUrl: "",
  homePhotoUrl: "",
  bioPhotoUrl: "",
  shortBio: "",
  fullBio: "",
  mainTheory: "",
  keyContributions: [],
  areasOfExpertise: [],
  mainBooks: [],
  personalityTraits: [],
  writingStyle: "",
  analysisApproach: "",
  keyPhrases: [],
  isActive: true,
  disabledBannerText: "",
  displayOrder: 0,
  personality: "",
};

// Sortable Item Component
function SortableCounselorCard({ 
  counselor, 
  onEdit, 
  onDelete, 
  onToggleActive,
  llmConfigs
}: { 
  counselor: any; 
  onEdit: (c: any) => void; 
  onDelete: (id: number, isBuiltIn: boolean) => void;
  onToggleActive: (id: number) => void;
  llmConfigs?: any[];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: counselor.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`${!counselor.isActive ? 'opacity-60' : ''} ${isDragging ? 'shadow-lg ring-2 ring-[var(--fgv-primary-2)]' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded"
            >
              <GripVertical className="w-5 h-5 text-gray-400" />
            </div>
            
            {/* Photo with inactive overlay */}
            <div className="relative">
              {counselor.homePhotoUrl || counselor.photoUrl ? (
                <img
                  src={counselor.homePhotoUrl || counselor.photoUrl}
                  alt={counselor.name}
                  className={`w-16 h-16 rounded-full object-cover border-2 ${
                    counselor.isActive 
                      ? 'border-[var(--fgv-primary-3)]' 
                      : 'border-red-500 grayscale opacity-60'
                  }`}
                />
              ) : (
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  counselor.isActive 
                    ? 'bg-[var(--fgv-secondary-4)]' 
                    : 'bg-red-100'
                }`}>
                  <User className={`w-8 h-8 ${
                    counselor.isActive 
                      ? 'text-[var(--fgv-secondary-2)]' 
                      : 'text-red-400'
                  }`} />
                </div>
              )}
              {/* Tarja de inativo com texto personalizado */}
              {!counselor.isActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-red-600 text-white text-[7px] font-bold px-2 py-0.5 rounded transform -rotate-12 shadow-md max-w-[90%] text-center truncate" title={counselor.unavailabilityText || 'INATIVO'}>
                    {counselor.unavailabilityText || 'INATIVO'}
                  </div>
                </div>
              )}
            </div>
            
            {/* Info */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[var(--fgv-primary-1)]">{counselor.name}</h3>
                <Badge variant="outline" className="text-xs">#{counselor.displayOrder}</Badge>
                {counselor.isBuiltIn && (
                  <Badge variant="secondary" className="text-xs">Padrão</Badge>
                )}
                {!counselor.isActive && (
                  <Badge variant="outline" className="text-xs text-red-500 border-red-500">Inativo</Badge>
                )}
                {/* Indicador de conexão LLM */}
                {(() => {
                  const llmConfig = llmConfigs?.find(c => c.counselorId === counselor.counselorId);
                  // Verificar se há uma configuração válida de LLM:
                  // 1. Deve existir um registro na tabela counselor_llm_config
                  // 2. O llmProvider deve ser um valor válido (não vazio e não apenas espaços)
                  // 3. O llmModel deve ser um valor válido (não vazio e não apenas espaços)
                  const hasValidProvider = llmConfig?.llmProvider && llmConfig.llmProvider.trim() !== '' && llmConfig.llmProvider !== 'gemini';
                  const hasValidModel = llmConfig?.llmModel && llmConfig.llmModel.trim() !== '';
                  // Verificar se o provedor é 'google' (válido) ou outro provedor válido
                  const isValidProvider = hasValidProvider || (llmConfig?.llmProvider === 'google');
                  const isConnected = llmConfig && isValidProvider && hasValidModel;
                  return (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${isConnected ? 'text-green-600 border-green-500 bg-green-50' : 'text-amber-600 border-amber-500 bg-amber-50'}`}
                      title={isConnected ? `Conectado: ${llmConfig.llmProvider} / ${llmConfig.llmModel}` : 'Sem LLM configurado - configure na aba LLMs'}
                    >
                      <Bot className="w-3 h-3 mr-1" />
                      {isConnected ? 'LLM' : 'Sem LLM'}
                    </Badge>
                  );
                })()}
              </div>
              <p className="text-sm text-[var(--fgv-secondary-2)]">
                {counselor.nationality} • {counselor.birthYear}
                {counselor.deathYear ? `-${counselor.deathYear}` : " - presente"}
              </p>
              <p className="text-sm text-[var(--fgv-primary-3)]">{counselor.mainTheory}</p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleActive(counselor.id)}
              title={counselor.isActive ? "Desativar" : "Ativar"}
            >
              {counselor.isActive ? (
                <Eye className="w-4 h-4 text-green-500" />
              ) : (
                <EyeOff className="w-4 h-4 text-red-500" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(counselor)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            {!counselor.isBuiltIn && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(counselor.id, counselor.isBuiltIn)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        {counselor.shortBio && (
          <p className="mt-3 text-sm text-[var(--fgv-secondary-1)] border-t pt-3">
            {counselor.shortBio}
          </p>
        )}
        
        {/* Indicadores de campos preenchidos/vazios */}
        <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
          <FieldIndicator label="Bio" filled={!!counselor.fullBio} />
          <FieldIndicator label="Teoria" filled={!!counselor.mainTheory} />
          <FieldIndicator label="Contribuições" filled={hasJsonArrayContent(counselor.keyContributions)} />
          <FieldIndicator label="Obras" filled={hasJsonArrayContent(counselor.mainBooks)} />
          <FieldIndicator label="Personalidade" filled={hasJsonArrayContent(counselor.personalityTraits)} />
          <FieldIndicator label="Estilo de Escrita" filled={hasStringContent(counselor.writingStyle)} />
          <FieldIndicator label="Abordagem" filled={hasStringContent(counselor.analysisApproach)} />
          <FieldIndicator label="Frases" filled={hasJsonArrayContent(counselor.keyPhrases)} />
          <FieldIndicator label="Foto Home" filled={!!counselor.homePhotoUrl} />
          <FieldIndicator label="Foto Bio" filled={!!counselor.bioPhotoUrl} />
        </div>
      </CardContent>
    </Card>
  );
}

// Funções helper para verificar conteúdo de campos JSON e strings
function hasJsonArrayContent(value: any): boolean {
  if (!value) return false;
  if (Array.isArray(value)) return value.length > 0;
  // Se for string, tentar parsear como JSON
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) && parsed.length > 0;
    } catch {
      return false;
    }
  }
  return false;
}

function hasStringContent(value: any): boolean {
  if (!value) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  // Se for objeto (pode acontecer com campos JSON mal formatados), tentar extrair texto
  if (typeof value === 'object') {
    try {
      const str = JSON.stringify(value);
      // Verificar se não é apenas um objeto vazio ou array vazio
      return str !== '{}' && str !== '[]' && str !== 'null';
    } catch {
      return false;
    }
  }
  return false;
}

// Componente de indicador de campo preenchido/vazio
function FieldIndicator({ label, filled }: { label: string; filled: boolean }) {
  return (
    <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
      filled 
        ? 'bg-green-100 text-green-700' 
        : 'bg-amber-100 text-amber-700'
    }`}>
      {filled ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <AlertCircle className="w-3 h-3" />
      )}
      <span>{label}</span>
    </div>
  );
}

export default function CounselorsManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CounselorFormData>(defaultFormData);
  const [activeTab, setActiveTab] = useState("basic");
  const [uploadingImage, setUploadingImage] = useState<'home' | 'bio' | null>(null);
  
  const homeImageInputRef = useRef<HTMLInputElement>(null);
  const bioImageInputRef = useRef<HTMLInputElement>(null);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Queries
  const counselors = trpc.counselors.list.useQuery();
  const counselorConfigs = trpc.admin.getCounselorLlmConfigs.useQuery();
  const utils = trpc.useUtils();

  // Mutations
  const createCounselor = trpc.counselors.create.useMutation({
    onSuccess: () => {
      toast.success("Conselheiro criado com sucesso!");
      utils.counselors.list.invalidate();
      utils.admin.getCounselorLlmConfigs.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao criar conselheiro: ${error.message}`);
    },
  });

  const updateCounselor = trpc.counselors.update.useMutation({
    onSuccess: () => {
      toast.success("Conselheiro atualizado com sucesso!");
      utils.counselors.list.invalidate();
      utils.admin.getCounselorLlmConfigs.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar conselheiro: ${error.message}`);
    },
  });

  const deleteCounselor = trpc.counselors.delete.useMutation({
    onSuccess: () => {
      toast.success("Conselheiro excluído com sucesso!");
      utils.counselors.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir conselheiro: ${error.message}`);
    },
  });

  const toggleActive = trpc.counselors.toggleActive.useMutation({
    onSuccess: () => {
      utils.counselors.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao alterar status: ${error.message}`);
    },
  });

  const reorderCounselors = trpc.counselors.reorder.useMutation({
    onSuccess: () => {
      toast.success("Ordem atualizada!");
      utils.counselors.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao reordenar: ${error.message}`);
    },
  });

  const updateCounselorPersonality = trpc.admin.updateCounselorPersonality.useMutation({
    onSuccess: () => {
      utils.admin.getCounselorLlmConfigs.invalidate();
    },
  });

  const [isAutoFilling, setIsAutoFilling] = useState(false);
  // Helper function to normalize values that might be objects to strings
  const normalizeToString = (value: any, fallback: string = ''): string => {
    if (!value) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      // If it's an object with a text, content, or description property, use that
      if (value.text) return String(value.text);
      if (value.content) return String(value.content);
      if (value.description) return String(value.description);
      // If it has a toString method that returns something meaningful
      const str = value.toString();
      if (str !== '[object Object]') return str;
      // Otherwise return the fallback
      return fallback;
    }
    return String(value);
  };

  const generateAutoFill = trpc.counselors.generateAutoFill.useMutation({
    onSuccess: (data) => {
      setIsAutoFilling(false);
      // Fill form with generated data - cast to proper types
      // Use normalizeToString for fields that might come as objects from LLM
      setFormData(prev => ({
        ...prev,
        counselorId: normalizeToString(data.counselorId, prev.counselorId),
        name: normalizeToString(data.name, prev.name),
        shortName: normalizeToString(data.shortName, prev.shortName),
        nationality: normalizeToString(data.nationality, prev.nationality),
        birthYear: data.birthYear ? Number(data.birthYear) : prev.birthYear,
        deathYear: data.deathYear ? Number(data.deathYear) : prev.deathYear,
        mainTheory: normalizeToString(data.mainTheory, prev.mainTheory),
        shortBio: normalizeToString(data.shortBio, prev.shortBio),
        fullBio: normalizeToString(data.fullBio, prev.fullBio),
        keyContributions: Array.isArray(data.keyContributions) ? data.keyContributions as string[] : prev.keyContributions,
        areasOfExpertise: Array.isArray(data.areasOfExpertise) ? data.areasOfExpertise as string[] : prev.areasOfExpertise,
        mainBooks: Array.isArray(data.mainBooks) ? data.mainBooks as { title: string; year: number | undefined; description: string }[] : prev.mainBooks,
        personalityTraits: Array.isArray(data.personalityTraits) ? data.personalityTraits as string[] : prev.personalityTraits,
        writingStyle: normalizeToString(data.writingStyle, prev.writingStyle),
        analysisApproach: normalizeToString(data.analysisApproach, prev.analysisApproach),
        keyPhrases: Array.isArray(data.keyPhrases) ? data.keyPhrases as string[] : prev.keyPhrases,
        homePhotoUrl: normalizeToString(data.homePhotoUrl, prev.homePhotoUrl),
        bioPhotoUrl: normalizeToString(data.bioPhotoUrl, prev.bioPhotoUrl),
        personality: normalizeToString(data.llmPersonality, prev.personality),
      }));
      toast.success("Dados gerados com sucesso! Revise e ajuste conforme necessário.");
    },
    onError: (error) => {
      setIsAutoFilling(false);
      toast.error(`Erro ao gerar dados: ${error.message}`);
    },
  });

  const handleAutoFill = () => {
    if (!formData.name.trim()) {
      toast.error("Digite o nome do conselheiro primeiro");
      return;
    }
    setIsAutoFilling(true);
    generateAutoFill.mutate({ name: formData.name });
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingId(null);
    setActiveTab("basic");
  };

  const openEditDialog = (counselor: any) => {
    // Find personality from configs
    const config = counselorConfigs.data?.find(c => c.counselorId === counselor.counselorId);
    
    setEditingId(counselor.id);
    setFormData({
      counselorId: counselor.counselorId || "",
      name: counselor.name || "",
      shortName: counselor.shortName || "",
      nationality: counselor.nationality || "",
      birthYear: counselor.birthYear || undefined,
      deathYear: counselor.deathYear || undefined,
      photoUrl: counselor.photoUrl || "",
      homePhotoUrl: counselor.homePhotoUrl || "",
      bioPhotoUrl: counselor.bioPhotoUrl || "",
      shortBio: counselor.shortBio || "",
      fullBio: counselor.fullBio || "",
      mainTheory: counselor.mainTheory || "",
      keyContributions: parseJsonArray(counselor.keyContributions),
      areasOfExpertise: parseJsonArray(counselor.areasOfExpertise),
      mainBooks: parseJsonArray(counselor.mainBooks),
      personalityTraits: parseJsonArray(counselor.personalityTraits),
      writingStyle: normalizeToString(counselor.writingStyle, ""),
      analysisApproach: normalizeToString(counselor.analysisApproach, ""),
      keyPhrases: parseJsonArray(counselor.keyPhrases),
      isActive: counselor.isActive ?? true,
      disabledBannerText: counselor.unavailabilityText || "",
      displayOrder: counselor.displayOrder || 0,
      personality: normalizeToString(config?.personality, ""),
    });
    setIsDialogOpen(true);
  };

  const parseJsonArray = (value: any): any[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const handleSubmit = async () => {
    if (!formData.counselorId || !formData.name) {
      toast.error("ID e Nome são obrigatórios");
      return;
    }

    const data = {
      ...formData,
      birthYear: formData.birthYear || undefined,
      deathYear: formData.deathYear || undefined,
      // Ensure writingStyle and analysisApproach are proper strings
      writingStyle: normalizeToString(formData.writingStyle, ''),
      analysisApproach: normalizeToString(formData.analysisApproach, ''),
    };

    // Remove personality from counselor data (it's stored separately)
    const { personality, ...counselorData } = data;

    try {
      if (editingId) {
        await updateCounselor.mutateAsync({ id: editingId, ...counselorData });
        // Update personality separately
        if (personality !== undefined) {
          await updateCounselorPersonality.mutateAsync({
            counselorId: formData.counselorId,
            personality: personality || null,
          });
        }
      } else {
        await createCounselor.mutateAsync(counselorData);
        // Also save personality for new counselors
        if (personality) {
          await updateCounselorPersonality.mutateAsync({
            counselorId: formData.counselorId,
            personality: personality,
          });
        }
      }
    } catch (error) {
      // Error handled by mutation callbacks
    }
  };

  const handleDelete = (id: number, isBuiltIn: boolean) => {
    if (isBuiltIn) {
      toast.error("Não é possível excluir conselheiros padrão do sistema");
      return;
    }
    if (confirm("Tem certeza que deseja excluir este conselheiro?")) {
      deleteCounselor.mutate({ id });
    }
  };

  // Handle drag end for reordering
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const items = counselors.data || [];
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newOrder = arrayMove(items, oldIndex, newIndex);
      
      // Update display order for all items
      const updates = newOrder.map((item, index) => ({
        id: item.id,
        displayOrder: index,
      }));

      reorderCounselors.mutate(updates);
    }
  }, [counselors.data, reorderCounselors]);

  // Upload image mutation
  const uploadImage = trpc.counselors.uploadImage.useMutation({
    onError: (error) => {
      toast.error(`Erro ao fazer upload: ${error.message}`);
    },
  });

  // Image upload handler - uploads to S3 and updates form state synchronously
  const handleImageUpload = async (type: 'home' | 'bio', file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setUploadingImage(type);

    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Upload to S3
      const result = await uploadImage.mutateAsync({
        type,
        base64Data: base64,
        mimeType: file.type,
        counselorId: formData.counselorId || undefined,
      });

      // Update form state with S3 URL (synchronous update)
      setFormData(prev => ({
        ...prev,
        [type === 'home' ? 'homePhotoUrl' : 'bioPhotoUrl']: result.url,
      }));

      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploadingImage(null);
    }
  };

  // Helper functions for array fields
  const addToArray = (field: keyof CounselorFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] as any[]), value],
    }));
  };

  const removeFromArray = (field: keyof CounselorFormData, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as any[]).filter((_, i) => i !== index),
    }));
  };

  const updateArrayItem = (field: keyof CounselorFormData, index: number, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as any[]).map((item, i) => (i === index ? value : item)),
    }));
  };

  if (counselors.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--fgv-primary-2)]" />
      </div>
    );
  }

  const sortedCounselors = [...(counselors.data || [])].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div></div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button 
              className="bg-[var(--fgv-primary-2)] hover:bg-[var(--fgv-primary-1)]"
              onClick={() => {
                resetForm();
                setEditingId(null);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Conselheiro
            </Button>
          </DialogTrigger>
          <DialogContent className="!max-w-[98vw] !w-[98vw] max-h-[95vh] overflow-y-auto p-8">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Conselheiro" : "Novo Conselheiro"}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados do Conselheiro. Os campos marcados com * são obrigatórios.
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Básico
                </TabsTrigger>
                <TabsTrigger value="images" className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Imagens
                </TabsTrigger>
                <TabsTrigger value="bio" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Biografia
                </TabsTrigger>
                <TabsTrigger value="personality" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Personalidade
                </TabsTrigger>
                <TabsTrigger value="config" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Config
                </TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-base font-semibold">Nome Completo *</Label>
                    <div className="flex gap-3">
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="ex: Nome Completo do Conselheiro"
                        className="flex-1 h-12 text-base"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAutoFill}
                        disabled={isAutoFilling || !formData.name.trim()}
                        className="whitespace-nowrap"
                        title="Preencher automaticamente usando IA (regenerar dados)"
                      >
                        {isAutoFilling ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...</>
                        ) : (
                          <><Bot className="w-4 h-4 mr-2" /> {editingId ? 'Regenerar com IA' : 'Preencher com IA'}</>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="counselorId" className="text-base font-semibold">ID do Conselheiro</Label>
                    <Input
                      id="counselorId"
                      value={formData.counselorId}
                      onChange={(e) => setFormData({ ...formData, counselorId: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                      placeholder="ex: novo_conselheiro"
                      disabled={!!editingId}
                      className="h-12 text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="shortName" className="text-base font-semibold">Nome Curto</Label>
                    <Input
                      id="shortName"
                      value={formData.shortName}
                      onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                      placeholder="ex: Nome Curto"
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="nationality" className="text-base font-semibold">Nacionalidade</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      placeholder="ex: Britânico"
                      className="h-12 text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="birthYear" className="text-base font-semibold">Ano de Nascimento</Label>
                    <Input
                      id="birthYear"
                      type="number"
                      value={formData.birthYear || ""}
                      onChange={(e) => setFormData({ ...formData, birthYear: e.target.value ? parseInt(e.target.value) : undefined })}
                      placeholder="ex: 1861"
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="deathYear" className="text-base font-semibold">Ano de Falecimento</Label>
                    <Input
                      id="deathYear"
                      type="number"
                      value={formData.deathYear || ""}
                      onChange={(e) => setFormData({ ...formData, deathYear: e.target.value ? parseInt(e.target.value) : undefined })}
                      placeholder="ex: 1947 (deixe vazio se vivo)"
                      className="h-12 text-base"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="mainTheory" className="text-base font-semibold">Teoria Principal</Label>
                  <Input
                    id="mainTheory"
                    className="h-12 text-base"
                    value={formData.mainTheory}
                    onChange={(e) => setFormData({ ...formData, mainTheory: e.target.value })}
                    placeholder="ex: Teoria do Heartland"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="shortBio" className="text-base font-semibold">Biografia Curta</Label>
                  <Textarea
                    id="shortBio"
                    value={formData.shortBio}
                    onChange={(e) => setFormData({ ...formData, shortBio: e.target.value })}
                    placeholder="Breve descrição do Conselheiro (1-2 frases)"
                    rows={3}
                    className="text-base min-h-[100px]"
                  />
                </div>
              </TabsContent>

              {/* Images Tab */}
              <TabsContent value="images" className="space-y-8 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Foto da Home</CardTitle>
                    <CardDescription>
                      Imagem exibida na galeria de conselheiros da página inicial (recomendado: 400x500px, formato retrato)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-6">
                      <div className="w-40 h-48 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 relative group">
                        {formData.homePhotoUrl ? (
                          <>
                            <img src={formData.homePhotoUrl} alt="Home" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye className="w-8 h-8 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto" />
                            <p className="text-xs text-gray-400 mt-2">400x500px</p>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <input
                          ref={homeImageInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload('home', file);
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={() => homeImageInputRef.current?.click()}
                          disabled={uploadingImage === 'home'}
                        >
                          {uploadingImage === 'home' ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          Upload Imagem
                        </Button>
                        <div className="space-y-2">
                          <Label htmlFor="homePhotoUrl">Ou cole a URL da imagem</Label>
                          <Input
                            id="homePhotoUrl"
                            value={formData.homePhotoUrl}
                            onChange={(e) => setFormData({ ...formData, homePhotoUrl: e.target.value })}
                            placeholder="https://..."
                          />
                        </div>
                        {formData.homePhotoUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => setFormData({ ...formData, homePhotoUrl: "" })}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Remover
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Foto da Biografia</CardTitle>
                    <CardDescription>
                      Imagem exibida na página de perfil/biografia do conselheiro (recomendado: 600x800px, formato retrato)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-6">
                      <div className="w-40 h-48 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 relative group">
                        {formData.bioPhotoUrl ? (
                          <>
                            <img src={formData.bioPhotoUrl} alt="Bio" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye className="w-8 h-8 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto" />
                            <p className="text-xs text-gray-400 mt-2">600x800px</p>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <input
                          ref={bioImageInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload('bio', file);
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={() => bioImageInputRef.current?.click()}
                          disabled={uploadingImage === 'bio'}
                        >
                          {uploadingImage === 'bio' ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          Upload Imagem
                        </Button>
                        <div className="space-y-2">
                          <Label htmlFor="bioPhotoUrl">Ou cole a URL da imagem</Label>
                          <Input
                            id="bioPhotoUrl"
                            value={formData.bioPhotoUrl}
                            onChange={(e) => setFormData({ ...formData, bioPhotoUrl: e.target.value })}
                            placeholder="https://..."
                          />
                        </div>
                        {formData.bioPhotoUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => setFormData({ ...formData, bioPhotoUrl: "" })}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Remover
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Legacy photo URL */}
                <div className="space-y-2">
                  <Label htmlFor="photoUrl">URL de Foto (legado)</Label>
                  <Input
                    id="photoUrl"
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    placeholder="https://... (usado como fallback)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Esta URL é usada como fallback quando as fotos específicas não estão definidas.
                  </p>
                </div>
              </TabsContent>

              {/* Biography Tab */}
              <TabsContent value="bio" className="space-y-6 mt-6">
                <div className="space-y-3">
                  <Label htmlFor="fullBio" className="text-base font-semibold">Biografia Completa</Label>
                  <Textarea
                    id="fullBio"
                    value={formData.fullBio}
                    onChange={(e) => setFormData({ ...formData, fullBio: e.target.value })}
                    placeholder="Biografia detalhada do Conselheiro"
                    rows={8}
                    className="text-base min-h-[200px]"
                  />
                </div>

                {/* Key Contributions */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Contribuições Principais</Label>
                  <div className="space-y-3">
                    {formData.keyContributions.map((contribution, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Input
                          value={contribution}
                          onChange={(e) => updateArrayItem("keyContributions", index, e.target.value)}
                          placeholder="ex: Desenvolveu a teoria do Heartland"
                          className="h-11 text-base"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromArray("keyContributions", index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addToArray("keyContributions", "")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Contribuição
                    </Button>
                  </div>
                </div>

                {/* Areas of Expertise */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Áreas de Especialização</Label>
                  <div className="space-y-3">
                    {formData.areasOfExpertise.map((area, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Input
                          value={area}
                          onChange={(e) => updateArrayItem("areasOfExpertise", index, e.target.value)}
                          placeholder="ex: Geopolítica, Geografia Política"
                          className="h-11 text-base"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromArray("areasOfExpertise", index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addToArray("areasOfExpertise", "")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Área
                    </Button>
                  </div>
                </div>

                {/* Main Books */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Obras Principais</Label>
                  <div className="space-y-4">
                    {formData.mainBooks.map((book, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Input
                              value={book.title}
                              onChange={(e) => updateArrayItem("mainBooks", index, { ...book, title: e.target.value })}
                              placeholder="Título da obra"
                              className="flex-1 h-11 text-base"
                            />
                            <Input
                              type="number"
                              value={book.year || ""}
                              onChange={(e) => updateArrayItem("mainBooks", index, { ...book, year: e.target.value ? parseInt(e.target.value) : undefined })}
                              placeholder="Ano"
                              className="w-28 h-11 text-base"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromArray("mainBooks", index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <Input
                            value={book.description || ""}
                            onChange={(e) => updateArrayItem("mainBooks", index, { ...book, description: e.target.value })}
                            placeholder="Descrição breve"
                          />
                        </div>
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addToArray("mainBooks", { title: "", year: undefined, description: "" })}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Obra
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Personality Tab */}
              <TabsContent value="personality" className="space-y-6 mt-6">
                {/* LLM Personality */}
                <Card className="border-[var(--fgv-primary-3)]">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bot className="w-5 h-5" />
                      Personalidade para LLM
                    </CardTitle>
                    <CardDescription>
                      Defina a personalidade que o LLM assumirá ao representar este conselheiro. 
                      Este texto é lido antes de executar qualquer tarefa.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={formData.personality}
                      onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                      placeholder="Ex: Formal e analítico, com tendência a usar exemplos históricos. Prefere argumentos baseados em dados e estatísticas. Costuma citar suas próprias obras e teorias..."
                      rows={6}
                      className="text-base min-h-[150px]"
                    />
                  </CardContent>
                </Card>

                {/* Personality Traits */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Traços de Personalidade</Label>
                  <div className="space-y-3">
                    {formData.personalityTraits.map((trait, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Input
                          value={trait}
                          onChange={(e) => updateArrayItem("personalityTraits", index, e.target.value)}
                          placeholder="ex: Analítico, Pragmático, Visionário"
                          className="h-11 text-base"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromArray("personalityTraits", index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addToArray("personalityTraits", "")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Traço
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="writingStyle" className="text-base font-semibold">Estilo de Escrita</Label>
                  <Textarea
                    id="writingStyle"
                    value={formData.writingStyle}
                    onChange={(e) => setFormData({ ...formData, writingStyle: e.target.value })}
                    placeholder="Descreva o estilo de escrita característico deste Conselheiro"
                    rows={4}
                    className="text-base min-h-[120px]"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="analysisApproach" className="text-base font-semibold">Abordagem de Análise</Label>
                  <Textarea
                    id="analysisApproach"
                    value={formData.analysisApproach}
                    onChange={(e) => setFormData({ ...formData, analysisApproach: e.target.value })}
                    placeholder="Descreva como este Conselheiro aborda análises geopolíticas"
                    rows={4}
                    className="text-base min-h-[120px]"
                  />
                </div>

                {/* Key Phrases */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Frases Características</Label>
                  <div className="space-y-3">
                    {formData.keyPhrases.map((phrase, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Input
                          value={phrase}
                          onChange={(e) => updateArrayItem("keyPhrases", index, e.target.value)}
                          placeholder="ex: 'Quem domina o Heartland, domina o mundo'"
                          className="h-11 text-base"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromArray("keyPhrases", index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addToArray("keyPhrases", "")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Frase
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Configuration Tab */}
              <TabsContent value="config" className="space-y-6 mt-6">
                <div className="space-y-3">
                  <Label htmlFor="displayOrder" className="text-base font-semibold">Ordem de Exibição</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="h-11 text-base w-32"
                  />
                  <p className="text-sm text-muted-foreground">
                    Você também pode arrastar os cards na lista para reordenar.
                  </p>
                </div>

                <div className="flex items-center space-x-3 py-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive" className="text-base font-semibold">Conselheiro Ativo</Label>
                </div>

                {/* Campo de texto para tarja quando desabilitado */}
                {!formData.isActive && (
                  <div className="space-y-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Label htmlFor="disabledBannerText" className="text-yellow-800 font-medium">
                      Texto da Tarja de Indisponibilidade
                    </Label>
                    <Textarea
                      id="disabledBannerText"
                      value={formData.disabledBannerText}
                      onChange={(e) => setFormData({ ...formData, disabledBannerText: e.target.value })}
                      placeholder="Ex: Este conselheiro está temporariamente indisponível para manutenção."
                      rows={2}
                      className="border-yellow-300"
                    />
                    <p className="text-xs text-yellow-600">
                      Este texto será exibido na tarja sobre a foto do conselheiro na galeria e na página de perfil.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createCounselor.isPending || updateCounselor.isPending}
                className="bg-[var(--fgv-primary-2)] hover:bg-[var(--fgv-primary-1)]"
              >
                {(createCounselor.isPending || updateCounselor.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                <Save className="w-4 h-4 mr-2" />
                {editingId ? "Salvar Alterações" : "Criar Conselheiro"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <GripVertical className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">Arraste para reordenar</p>
              <p className="text-xs text-blue-600">
                Use o ícone de arrastar à esquerda de cada card para alterar a ordem de exibição dos conselheiros na home e em outras áreas do sistema.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Counselors List with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedCounselors.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid gap-4">
            {sortedCounselors.map((counselor) => (
              <SortableCounselorCard
                key={counselor.id}
                counselor={counselor}
                onEdit={openEditDialog}
                onDelete={handleDelete}
                onToggleActive={(id) => toggleActive.mutate({ id })}
                llmConfigs={counselorConfigs.data}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {sortedCounselors.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="w-12 h-12 mx-auto text-[var(--fgv-secondary-3)] mb-4" />
            <p className="text-[var(--fgv-secondary-2)]">
              Nenhum Conselheiro cadastrado ainda.
            </p>
            <Button
              className="mt-4 bg-[var(--fgv-primary-2)] hover:bg-[var(--fgv-primary-1)]"
              onClick={() => {
                resetForm();
                setEditingId(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Conselheiro
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
