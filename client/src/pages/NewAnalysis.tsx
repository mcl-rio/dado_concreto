import { useState, useEffect, useMemo, useRef } from "react";
import { Streamdown } from "streamdown";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useLocation } from "wouter";
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
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles,
  Target,
  FileText,
  Users,
  Settings,
  Download,
  Search,
  Upload,
  Newspaper,
  Globe,
  X,
  Check,
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Anchor,
  Scale,
  Flag,
  Brain,
  MessageSquare,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  StopCircle,
  Layout,
  CheckCircle,
  FileSearch,
} from "lucide-react";

// Step definitions - Correspondem aos 7 passos do método
const STEPS = [
  { id: "proposal", title: "Passo 1 - Proposta de Pesquisa", icon: Target, description: "Título, objetivo, contexto e fontes" },
  { id: "evaluation", title: "Passo 2 - Avaliação da Proposta", icon: Brain, description: "Parecer do GennovAIs" },
  { id: "structure", title: "Passo 3 - Estruturação do Projeto", icon: Settings, description: "Defina a estrutura" },
  { id: "counselors", title: "Passo 4 - Escolha dos Conselheiros", icon: Users, description: "Selecione os especialistas" },
  { id: "payment", title: "Passo 5 - Pagamento", icon: CheckCircle2, description: "Confirme a análise" },
  { id: "council", title: "Passo 6 - Sessão do Conselho", icon: MessageSquare, description: "Debate dos Conselheiros" },
  { id: "report", title: "Passo 7 - Relatório Final", icon: FileText, description: "Consolidação final" },
];

// Ícones e cores são definidos dinamicamente
// Valores padrão para conselheiros sem configuração específica
const DEFAULT_ANALYST_ICON = Brain;
const DEFAULT_ANALYST_COLOR = "bg-[#5C5B5F]";

interface Source {
  id: string;
  type: "news" | "file" | "web" | "knowledge" | "websearch";
  title: string;
  url?: string;
  content?: string;
  _pendingUpload?: {
    base64Content: string;
    mimeType: string;
    fileName: string;
  };
}

interface AnalysisStep {
  step: string;
  analyst?: string;
  status: "pending" | "running" | "completed" | "error" | "retrying" | "rejected";
  startTime?: number;
  endTime?: number;
  duration?: number;
  result?: string;
  error?: string;
  estimatedCost?: number;
  estimatedDuration?: number;
  novaesMessage?: string;
  creativeMessage?: string; // Mensagem criativa sobre o que o Conselheiro está fazendo
  phase?: string;
  retryCount?: number;
  progress?: number; // 0-100 para barra de progresso
  // Campos para modo espectador (debate em tempo real)
  spectatorMode?: {
    opinionExcerpt?: string; // Trecho do parecer sendo elaborado
    keyArguments?: string[]; // Argumentos-chave identificados
    theoreticalBasis?: string; // Base teórica sendo aplicada
    novaesReaction?: {
      type: 'approval' | 'rejection' | 'questioning' | 'praise';
      message: string;
      timestamp: number;
    };
    debateContext?: string; // Contexto do debate atual
  };
}

// Componente para item arrastável de fonte
function SortableSourceItem({ 
  source, 
  onRemove 
}: { 
  source: Source; 
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: source.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 bg-[var(--fgv-secondary-5)] rounded-lg border ${
        isDragging ? 'border-[var(--fgv-primary-3)] shadow-lg' : 'border-[var(--fgv-secondary-4)]'
      } transition-all`}
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-[var(--fgv-secondary-4)] rounded transition-colors"
          aria-label="Arrastar para reordenar"
        >
          <GripVertical className="w-4 h-4 text-[var(--fgv-secondary-2)]" />
        </button>
        {source.type === "news" && <Newspaper className="w-4 h-4 text-[var(--fgv-primary-2)]" />}
        {source.type === "file" && <FileText className="w-4 h-4 text-[var(--fgv-primary-2)]" />}
        {source.type === "web" && <Globe className="w-4 h-4 text-[var(--fgv-primary-2)]" />}
        {source.type === "knowledge" && <Brain className="w-4 h-4 text-[var(--fgv-primary-2)]" />}
        {source.type === "websearch" && <Search className="w-4 h-4 text-[var(--fgv-primary-2)]" />}
        <span className="text-sm font-medium line-clamp-1">{source.title}</span>
      </div>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onRemove(source.id)}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default function NewAnalysis() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Parâmetros do sistema (carimbo, etc.)
  const { data: systemParams } = trpc.admin.getPublicParameters.useQuery();
  
  // URLs das imagens do sistema (carimbos, coordenadores) - do S3
  const { data: systemImageUrls } = trpc.admin.getSystemImageUrls.useQuery();
  
  // Extrair valores dos parâmetros com defaults
  const getParamValue = (key: string, defaultValue: string) => {
    const param = systemParams?.find(p => p.key === key);
    return param?.value || defaultValue;
  };
  
  // URLs dos carimbos (do S3 ou fallback local)
  const stampApprovedUrl = systemImageUrls?.stamp_approved || '/stamps/aprovada.png';
  const stampReviewUrl = systemImageUrls?.stamp_review || '/stamps/revisar.png';
  const stampRejectedUrl = systemImageUrls?.stamp_rejected || '/stamps/rejeitada.png';
  
  // Parâmetros do carimbo
  const stampSize = parseFloat(getParamValue('stamp_size', '100')) / 100; // converter % para decimal
  const stampSoundEnabled = getParamValue('stamp_sound_enabled', 'true') === 'true';
  
  // Form state
  const [currentStep, setCurrentStep] = useState<string>("proposal");
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [context, setContext] = useState("");
  // Campo tema removido
  const [sources, setSources] = useState<Source[]>([
    {
      id: `knowledge_default`,
      type: "knowledge",
      title: "Conhecimentos dos Conselheiros",
      content: "Utilizar o conhecimento especializado dos conselheiros para a análise."
    }
  ]);
  const [selectedAnalysts, setSelectedAnalysts] = useState<string[]>([]);
  const [selectedCounselors, setSelectedCounselors] = useState<string[]>([]);
  const [analysisId, setAnalysisId] = useState<number | null>(null);
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [analysisStructure, setAnalysisStructure] = useState<any>(null);
  const [reportStructure, setReportStructure] = useState<any>(null);
  const [novaesVerdict, setNovAIsVerdict] = useState<'green' | 'yellow' | 'red' | null>(null);
  const [novaesJustification, setNovAIsJustification] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  // Estado para reasoning do GennovAIs durante avaliação
  const [evaluationStep, setEvaluationStep] = useState(0);
  const [currentReasoningText, setCurrentReasoningText] = useState("");
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(15); // segundos
  const [isPlayingTypingSound, setIsPlayingTypingSound] = useState(false);
  const typingAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Mensagens dinâmicas variáveis para cada etapa
  const evaluationSteps = [
    { 
      id: 1, 
      label: "Recebendo proposta de análise",
      icon: "FileText",
      messages: [
        "Hmm, deixa eu colocar meus óculos de leitura... Pronto! Analisando sua proposta...",
        "Ah, uma nova proposta! Adoro quando chega trabalho interessante. Processando...",
        "*ajustando a gravata* Muito bem, vamos ver o que temos aqui...",
        "Carregando os dados... Enquanto isso, vou preparar meu café virtual. ☕",
        "Recebido! Já estou com os neurônios artificiais aquecidos para analisar isso."
      ]
    },
    { 
      id: 2, 
      label: "Analisando título e objetivo",
      icon: "Target",
      messages: [
        "Verificando a clareza do título... Será que os Conselheiros aprovariam esse escopo?",
        "Analisando o objetivo... *colocando óculos imaginários* Interessante, muito interessante.",
        "Hmm, esse título me lembra uma discussão acalorada entre os Conselheiros...",
        "Avaliando a precisão terminológica... Os Conselheiros seriam rigorosos com isso!",
        "Verificando se o escopo é viável... *pensando se devo pedir um café* Não, foco!"
      ]
    },
    { 
      id: 3, 
      label: "Avaliando contexto fornecido",
      icon: "FileSearch",
      messages: [
        "Examinando o contexto... Isso me faz lembrar das aulas do General Novaes.",
        "Verificando a fundamentação... *bocejando* Ops, desculpe! Estou focado, prometo.",
        "Analisando a relevância dos dados... Os Conselheiros ficariam orgulhosos dessa proposta!",
        "Identificando lacunas... Será que preciso de mais café? Não, melhor continuar.",
        "Contexto interessante! Os Conselheiros teriam muito a dizer sobre isso..."
      ]
    },
    { 
      id: 4, 
      label: "Verificando adequação metodológica",
      icon: "Settings",
      messages: [
        "Verificando o método... *estalando os dedos virtuais* Vamos lá!",
        "Analisando compatibilidade com os métodos do Conselho... Isso é sério!",
        "Pensando em qual Conselheiro seria ideal... Todos querem participar!",
        "Avaliando viabilidade... *quase pedindo uma pausa para o café* Mas não, foco!",
        "Identificando os melhores Conselheiros... Será que todos vão concordar?"
      ]
    },
    { 
      id: 5, 
      label: "Consultando base de conhecimento",
      icon: "Search",
      messages: [
        "Consultando os arquivos... *som de gavetas abrindo* Onde coloquei aquele relatório?",
        "Buscando precedências... Ah, encontrei algo similar de 1947! Brincadeira, é recente.",
        "Verificando padrões da FGV... O rigor acadêmico aqui é coisa séria!",
        "Consultando referências... *com sono* Talvez um cochilo... Não! Quase terminando!",
        "Comparando com análises anteriores... Essa proposta tem potencial!"
      ]
    },
    { 
      id: 6, 
      label: "Elaborando parecer final",
      icon: "CheckCircle",
      messages: [
        "Sintetizando tudo... *respirando fundo* Momento da verdade!",
        "Preparando o parecer... Espero que você goste! Trabalhei duro nisso.",
        "Finalizando a avaliação... *tambores rufando* E o veredicto é...",
        "Consolidando as observações... Agora sim posso tomar aquele café!",
        "Quase lá! Só mais alguns ajustes no parecer... *digitando freneticamente*"
      ]
    },
  ];
  
  // Função para obter mensagem aleatória de uma etapa
  const getRandomMessage = (stepIndex: number) => {
    const step = evaluationSteps[stepIndex];
    if (!step) return "";
    const messages = step.messages;
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  // News search state
  const [newsQuery, setNewsQuery] = useState("");
  const [newsResults, setNewsResults] = useState<any[]>([]);
  const [searchingNews, setSearchingNews] = useState(false);
  
  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Web URL state
  const [webUrl, setWebUrl] = useState("");
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  
  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [executionSteps, setExecutionSteps] = useState<AnalysisStep[]>([]);
  const [executionStartTime, setExecutionStartTime] = useState<number | null>(null);
  const [executionEndTime, setExecutionEndTime] = useState<number | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [totalCost, setTotalCost] = useState<number>(0);
  
  // Flag para controlar auto-execução (evita executar múltiplas vezes)
  const [autoExecuteTriggered, setAutoExecuteTriggered] = useState(false);
  
  // Estados para o container de debug
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugLogs, setDebugLogs] = useState<Array<{
    timestamp: number;
    type: 'info' | 'success' | 'error' | 'warning' | 'llm_call' | 'llm_response' | 'sse_event';
    function: string;
    message: string;
    duration?: number;
    prompt?: string;
    response?: string;
    tokens?: { input?: number; output?: number };
    cost?: number;
  }>>([]);
  
  // Estados de SSE removidos - fluxo simplificado com polling
  
  // Estados para controle de polling do status da análise
  const [isPollingActive, setIsPollingActive] = useState(false);
  const [pollingError, setPollingError] = useState<string | null>(null);
  
  // Estado para progresso da geração de estrutura
  const [structureProgressStep, setStructureProgressStep] = useState(0);
  // Estado para controlar se a geração de estrutura foi iniciada (evita flash da tela de fallback)
  const [isGeneratingStructure, setIsGeneratingStructure] = useState(false);
  const structureSteps = [
    { id: 1, label: "Analisando fontes fornecidas", icon: "FileText" },
    { id: 2, label: "Identificando temas principais", icon: "Search" },
    { id: 3, label: "Definindo método adequado", icon: "Settings" },
    { id: 4, label: "Estruturando seções da análise", icon: "Layout" },
    { id: 5, label: "Finalizando proposta", icon: "CheckCircle" },
  ];
  
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Handler para reordenar fontes via drag and drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setSources((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  
  // tRPC queries and mutations
  const analysts = trpc.analysts.list.useQuery();
  const counselors = trpc.counselors.listActive.useQuery();
  const coordinatorConfigs = trpc.admin.getCoordinatorLlmConfigs.useQuery();
  const quotaInfo = trpc.users.getQuotaInfo.useQuery();
  const estimateCost = trpc.analysts.estimateCost.useQuery(
    { analystIds: selectedAnalysts },
    { enabled: selectedAnalysts.length > 0 }
  );
  
  const createAnalysis = trpc.analysis.create.useMutation();
  const updateAnalysis = trpc.analysis.update.useMutation();
  const addSource = trpc.analysis.addSource.useMutation();
  const suggestObjectives = trpc.ai.suggestObjectives.useMutation();
  const defaultExample = trpc.ai.getDefaultExample.useQuery();
  const generateStructure = trpc.ai.generateStructure.useMutation();
  const evaluateProposal = trpc.ai.evaluateProposal.useMutation();
  const generateStructureOnlyMutation = trpc.ai.generateStructureOnly.useMutation();
  const generateReportStructure = trpc.ai.generateReportStructure.useMutation();
  const executeMultiAgent = trpc.analysis.executeMultiAgent.useMutation();
  const cancelAnalysis = trpc.analysis.cancelAnalysis.useMutation();
  const resumeAnalysis = trpc.analysis.resumeFromStep.useMutation({
    onSuccess: () => {
      toast.success('Análise resumida com sucesso');
    },
    onError: (error) => {
      toast.error(`Erro ao resumir análise: ${error.message}`);
    },
  });
  const searchNews = trpc.news.search.useMutation();
  const uploadFile = trpc.files.upload.useMutation();
  const fetchUrlContent = trpc.news.fetchContent.useMutation();
  const getPrintable = trpc.report.getPrintable.useQuery(
    { analysisId: analysisId! },
    { enabled: !!analysisId && !!generatedContent }
  );
  const exportDocx = trpc.report.exportDocx.useMutation();
  
  // Calculate current step index
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;
  
  // Check if user has quota
  const hasQuota = useMemo(() => {
    if (!quotaInfo.data) return true;
    return quotaInfo.data.remaining > 0;
  }, [quotaInfo.data]);
  
  // Handle objective suggestions
  const handleSuggestObjectives = async () => {
    if (!title.trim()) {
      console.log("Digite um título para receber sugestões");
      return;
    }
    try {
      await suggestObjectives.mutateAsync({ topic: title });
    } catch (error) {
      console.error("Erro ao gerar sugestões");
    }
  };
  
  // Handle create analysis or update existing - agora inicia avaliação automaticamente com reasoning
  const handleCreateAnalysis = async () => {
    if (!title.trim() || !objective.trim()) {
      console.log("Preencha o título e objetivo");
      return;
    }
    
    // Limpar estado de avaliação anterior para forçar nova avaliação
    setNovAIsVerdict(null);
    setNovAIsJustification(null);
    setAnalysisStructure(null);
    setEvaluationStep(0);
    setCurrentReasoningText("");
    
    try {
      let currentAnalysisId = analysisId;
      
      // Se já existe uma análise, atualiza ela ao invés de criar nova
      if (analysisId) {
        await updateAnalysis.mutateAsync({
          id: analysisId,
          title,
          objective,
          context: context || undefined,
        });
        console.log("Análise atualizada com sucesso");
      } else {
        const result = await createAnalysis.mutateAsync({
          title,
          objective,
          context: context || undefined,
          selectedAnalysts,
        });
        currentAnalysisId = result.id;
        setAnalysisId(result.id);
        if (result.sessionCode) {
          setSessionCode(result.sessionCode);
        }
        console.log("Análise criada com sucesso", { sessionCode: result.sessionCode });
      }
      
      // CORREÇÃO: Processar uploads pendentes antes da avaliação
      // Fontes com _pendingUpload precisam ser enviadas ao servidor agora que temos analysisId
      const pendingSources = sources.filter(s => s._pendingUpload);
      if (pendingSources.length > 0) {
        console.log(`[Upload] Processando ${pendingSources.length} arquivo(s) pendente(s)...`);
        
        for (const source of pendingSources) {
          if (source._pendingUpload) {
            try {
              console.log(`[Upload] Enviando arquivo pendente: ${source._pendingUpload.fileName}`);
              const uploadResult = await uploadFile.mutateAsync({
                analysisId: currentAnalysisId!,
                fileName: source._pendingUpload.fileName,
                mimeType: source._pendingUpload.mimeType,
                base64Content: source._pendingUpload.base64Content,
              });
              
              // Atualizar a fonte local com o conteúdo extraído
              if (uploadResult.extractedText) {
                setSources(prev => prev.map(s => 
                  s.id === source.id 
                    ? { ...s, content: uploadResult.extractedText, _pendingUpload: undefined }
                    : s
                ));
                console.log(`[Upload] Arquivo processado com sucesso: ${source._pendingUpload.fileName}`);
              }
            } catch (uploadError) {
              console.error(`[Upload] Erro ao processar arquivo pendente: ${source._pendingUpload.fileName}`, uploadError);
            }
          }
        }
      }
      
      // Processar fontes que não são especiais (knowledge, websearch) e adicionar ao banco
      // Isso garante que fontes de notícias, web e arquivos já processados sejam salvos
      const regularSourcesToAdd = sources.filter(s => 
        s.type !== 'knowledge' && 
        s.type !== 'websearch' && 
        !s._pendingUpload && // Não processar pendentes novamente
        s.content // Só adicionar se tiver conteúdo
      );
      
      for (const source of regularSourcesToAdd) {
        try {
          // Verificar se a fonte já foi adicionada (evitar duplicatas)
          // Fontes de arquivo já são adicionadas pelo uploadFile
          if (source.type !== 'file') {
            await addSource.mutateAsync({
              analysisId: currentAnalysisId!,
              sourceType: source.type as 'news' | 'file' | 'web',
              title: source.title,
              url: source.url,
              content: source.content,
            });
            console.log(`[Sources] Fonte adicionada: ${source.title}`);
          }
        } catch (sourceError) {
          console.error(`[Sources] Erro ao adicionar fonte: ${source.title}`, sourceError);
        }
      }
      
      // Mudar para o Passo 2 e iniciar avaliação automaticamente
      setCurrentStep("evaluation");
      setIsEvaluating(true);
      
      // Iniciar simulação de reasoning em paralelo com a avaliação real
      // Iniciar som de digitação
      try {
        typingAudioRef.current = new Audio('/sounds/typing-soft.mp3');
        typingAudioRef.current.loop = true;
        typingAudioRef.current.volume = 0.15;
        typingAudioRef.current.play().catch(() => {});
        setIsPlayingTypingSound(true);
      } catch (e) {
        console.log('Som de digitação não disponível');
      }
      
      // Atualizar tempo estimado
      const timeInterval = setInterval(() => {
        setEstimatedTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      
      const reasoningInterval = setInterval(() => {
        setEvaluationStep(prev => {
          if (prev < evaluationSteps.length - 1) {
            const nextStep = prev + 1;
            setCurrentReasoningText(getRandomMessage(nextStep));
            return nextStep;
          }
          return prev;
        });
      }, 2500); // Avança a cada 2.5 segundos
      
      // Iniciar avaliação automaticamente
      try {
        const result = await evaluateProposal.mutateAsync({ analysisId: currentAnalysisId! });
        clearInterval(reasoningInterval);
        clearInterval(timeInterval);
        setEvaluationStep(evaluationSteps.length - 1); // Ir para o último passo
        
        // Parar som de digitação
        if (typingAudioRef.current) {
          typingAudioRef.current.pause();
          typingAudioRef.current = null;
          setIsPlayingTypingSound(false);
        }
        
        const verdict = result.novaesVerdict || 'green';
        const justification = result.novaesJustification || 'Proposta aprovada.';
        setNovAIsVerdict(verdict);
        setNovAIsJustification(justification);
        
        // Tocar som de carimbo correspondente ao resultado (se habilitado)
        // O som é tocado após 1.5s para sincronizar com a animação do carimbo
        // A animação tem delay de 1.5s, então o som deve tocar nesse momento
        if (stampSoundEnabled) {
          const soundFile = verdict === 'green' ? '/sounds/stamp-approved.wav' : 
                           verdict === 'yellow' ? '/sounds/stamp-review.wav' : 
                           '/sounds/stamp-rejected.wav';
          // Delay de 1.5s para sincronizar com a animação do carimbo (animation-delay: 1.5s)
          setTimeout(() => {
            const audio = new Audio(soundFile);
            audio.volume = 0.5;
            audio.play().catch(() => {}); // Ignorar erros de autoplay
          }, 1500);
        }
      } catch (evalError) {
        clearInterval(reasoningInterval);
        clearInterval(timeInterval);
        // Parar som de digitação em caso de erro
        if (typingAudioRef.current) {
          typingAudioRef.current.pause();
          typingAudioRef.current = null;
          setIsPlayingTypingSound(false);
        }
        console.error('Erro ao avaliar proposta:', evalError);
      } finally {
        setIsEvaluating(false);
      }
    } catch (error) {
      console.error("Erro ao criar/atualizar análise");
    }
  };
  
  // Handle news search
  const handleSearchNews = async () => {
    if (!newsQuery.trim()) return;
    setSearchingNews(true);
    try {
      const results = await searchNews.mutateAsync({ query: newsQuery });
      const allNews = [...(results.newsapi || []), ...(results.gdelt || [])];
      setNewsResults(allNews.slice(0, 20));
    } catch (error) {
      console.error("Erro ao buscar notícias");
    } finally {
      setSearchingNews(false);
    }
  };
  
  // Handle add news source
  const handleAddNewsSource = async (news: any) => {
    if (!analysisId) return;
    
    const newSource: Source = {
      id: `news-${Date.now()}`,
      type: "news",
      title: news.title,
      url: news.url,
      content: news.description || news.content,
    };
    
    setSources(prev => [...prev, newSource]);
    
    try {
      await addSource.mutateAsync({
        analysisId,
        sourceType: "news",
        title: news.title,
        url: news.url,
        content: news.description || news.content,
      });
    } catch (error) {
      console.error("Erro ao adicionar fonte");
    }
  };
  
  // Handle fetch URL content
  const handleFetchUrl = async () => {
    if (!webUrl.trim() || !analysisId) {
      if (!analysisId) {
        console.log("Crie uma análise primeiro");
      }
      return;
    }
    
    // Validate URL
    try {
      new URL(webUrl);
    } catch {
      console.log("URL inválida. Inclua http:// ou https://");
      return;
    }
    
    setIsFetchingUrl(true);
    
    try {
      const result = await fetchUrlContent.mutateAsync({ url: webUrl });
      
      if (!result.content || result.content.trim().length < 50) {
        console.log("Não foi possível extrair conteúdo desta página");
        return;
      }
      
      // Extract title from URL or use domain
      const urlObj = new URL(webUrl);
      const title = urlObj.hostname + urlObj.pathname.substring(0, 50);
      
      const newSource: Source = {
        id: `web-${Date.now()}`,
        type: "web",
        title: title,
        url: webUrl,
        content: result.content,
      };
      
      setSources(prev => [...prev, newSource]);
      
      await addSource.mutateAsync({
        analysisId,
        sourceType: "web",
        title: title,
        url: webUrl,
        content: result.content,
      });
      
      setWebUrl("");
      console.log("Conteúdo da página extraído com sucesso");
    } catch (error) {
      console.error("Erro ao buscar conteúdo da URL");
    } finally {
      setIsFetchingUrl(false);
    }
  };
  
  // Trigger file input click programmatically
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      // Reset the input value to allow re-uploading the same file
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Handle file upload with animation - robust version that prevents browser/extension interception
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent default behavior and stop propagation to avoid extension interception
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.target.files;
    if (!files || files.length === 0) {
      console.log('[Upload] No file selected');
      return;
    }
    
    const file = files[0];
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const allowedExtensions = ['.pdf', '.docx', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      console.log('Formato de arquivo não suportado. Use PDF, DOCX ou TXT.');
      return;
    }
    
    // Check file size (max 50MB)
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_FILE_SIZE) {
      console.log(`Arquivo muito grande. Tamanho máximo: 50MB. Seu arquivo: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
      return;
    }
    
    console.log(`[Upload] Starting upload for: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`);
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate progress animation
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);
    
    try {
      // Read file as ArrayBuffer first (more reliable than readAsDataURL for binary files)
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Convert to base64 manually
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      const base64 = btoa(binary);
      
      console.log(`[Upload] File read successfully. Base64 length: ${base64.length}`);
      
      // Determine correct MIME type
      let mimeType = file.type;
      if (!mimeType || mimeType === 'application/octet-stream') {
        if (fileExtension === '.pdf') mimeType = 'application/pdf';
        else if (fileExtension === '.docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        else if (fileExtension === '.txt') mimeType = 'text/plain';
      }
      
      // Se temos analysisId, fazer upload para o servidor
      // Senão, processar localmente e adicionar como fonte temporária
      if (analysisId) {
        const result = await uploadFile.mutateAsync({
          analysisId,
          fileName: file.name,
          mimeType: mimeType,
          base64Content: base64,
        });
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        console.log(`[Upload] Server response:`, result);
        
        if (result.extractedText) {
          const newSource: Source = {
            id: `file-${Date.now()}`,
            type: "file",
            title: file.name,
            content: result.extractedText,
          };
          
          setSources(prev => [...prev, newSource]);
          
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
            console.log("Arquivo processado e adicionado às fontes!");
          }, 500);
        } else {
          throw new Error('Nenhum texto foi extraído do arquivo');
        }
      } else {
        // Processar localmente - ler conteúdo do arquivo como texto
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        let textContent = '';
        
        if (mimeType === 'text/plain') {
          // Para arquivos TXT, decodificar diretamente
          textContent = new TextDecoder().decode(uint8Array);
        } else {
          // Para PDF e DOCX, armazenar base64 para processamento posterior
          textContent = `[Arquivo: ${file.name}] - Conteúdo será processado após submissão da proposta.`;
        }
        
        const newSource: Source = {
          id: `file-${Date.now()}`,
          type: "file",
          title: file.name,
          content: textContent,
          // Armazenar dados para upload posterior
          _pendingUpload: {
            base64Content: base64,
            mimeType: mimeType,
            fileName: file.name,
          }
        };
        
        setSources(prev => [...prev, newSource]);
        
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          console.log("Arquivo adicionado às fontes!");
        }, 500);
      }
    } catch (error: any) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
      console.error('[Upload] Error:', error);
      
      // Provide detailed error messages with instructions
      const errorMessage = error?.message || error?.data?.message || '';
      
      if (errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT')) {
        console.error('O servidor demorou muito para responder. Tente novamente ou use um arquivo menor.');
      } else if (errorMessage.includes('network') || errorMessage.includes('NETWORK') || errorMessage.includes('fetch')) {
        console.error('Erro de conexão. Verifique sua internet e tente novamente.');
      } else if (errorMessage.includes('extract') || errorMessage.includes('text') || errorMessage.includes('parse')) {
        console.error('Não foi possível extrair texto do arquivo.');
      } else if (errorMessage.includes('size') || errorMessage.includes('large') || errorMessage.includes('413')) {
        console.error('Arquivo muito grande para processar.');
      } else if (errorMessage.includes('format') || errorMessage.includes('type') || errorMessage.includes('mime')) {
        console.error('Formato de arquivo não suportado.');
      } else {
        console.error(`Erro ao processar arquivo: ${errorMessage || 'Erro desconhecido'}`);
      }
    }
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Remove source
  const removeSource = (id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
  };
  
  // Analyst descriptions for feedback - busca dados dinâmicos do banco
  const getAnalystDescription = (analystId: string) => {
    const analyst = analysts.data?.find(a => a.id === analystId);
    if (!analyst) return null;
    return {
      name: analyst.name,
      theory: analyst.keyTheory || 'Teoria Geopolítica',
      perspective: analyst.perspective || 'análise geopolítica'
    };
  };

  // Toggle analyst selection
  const toggleAnalyst = (analystId: string) => {
    setSelectedAnalysts(prev => {
      if (prev.includes(analystId)) {
        if (prev.length <= 2) {
          console.log("Selecione pelo menos 2 conselheiros");
          return prev;
        }
        // Show feedback about what the user is losing
        const analystInfo = getAnalystDescription(analystId);
        if (analystInfo) {
console.log(`Você está removendo ${analystInfo.name}. Sua análise perderá a perspectiva de ${analystInfo.perspective} (${analystInfo.theory}).`);
        }
        return prev.filter(id => id !== analystId);
      }
      return [...prev, analystId];
    });
  };
  
  // Handle generate structure (apenas gera estrutura, avaliação já foi feita no Passo 2)
  const handleGenerateStructure = async () => {
    if (!analysisId) return;
    
    // Marcar que a geração foi iniciada (evita flash da tela de fallback)
    setIsGeneratingStructure(true);
    
    // Resetar e iniciar progresso
    setStructureProgressStep(0);
    
    // Simular progresso das etapas enquanto aguarda resposta
    const progressInterval = setInterval(() => {
      setStructureProgressStep(prev => {
        if (prev < 4) return prev + 1;
        return prev;
      });
    }, 2500); // Avança uma etapa a cada 2.5 segundos
    
    try {
      // Usar a nova rota que apenas gera estrutura
      const result = await generateStructureOnlyMutation.mutateAsync({ analysisId });
      
      // Marcar última etapa como concluída
      setStructureProgressStep(5);
      clearInterval(progressInterval);
      
      // Pequeno delay para mostrar conclusão antes de exibir resultado
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAnalysisStructure(result.structure);
      setIsGeneratingStructure(false);
      
      const reportResult = await generateReportStructure.mutateAsync({ analysisId });
      setReportStructure(reportResult.reportStructure);
    } catch (error) {
      clearInterval(progressInterval);
      setStructureProgressStep(0);
      setIsGeneratingStructure(false);
      console.error("Erro ao gerar estrutura:", error);
    }
  };
  
  // Handle execute analysis
  const handleExecuteAnalysis = async () => {
    console.log('[handleExecuteAnalysis] Iniciando...', { analysisId, isExecuting });
    if (!analysisId) {
      console.error('[handleExecuteAnalysis] analysisId não disponível!');
      return;
    }
    
    // Limpar logs anteriores e iniciar novos
    setDebugLogs([{
      timestamp: Date.now(),
      type: 'info',
      function: 'handleExecuteAnalysis',
      message: `Iniciando execução da análise #${analysisId} com ${selectedCounselors.length} conselheiros`
    }]);
    
    setIsExecuting(true);
    setExecutionStartTime(Date.now());
    
    // Initialize execution steps with correct names and estimated durations (synced with backend)
    const initialSteps: AnalysisStep[] = [
      { 
        step: "GennovAIs convoca Conselheiros", 
        status: "pending",
        estimatedDuration: 3, // Backend: 2s delay
        phase: "convocation",
        progress: 0,
        novaesMessage: `O GennovAIs está convocando os Conselheiros ${selectedAnalysts.map(id => analysts.data?.find(a => a.id === id)?.fullName || id).join(", ")} para elaborar seus pareceres individuais.`
      },
      ...selectedAnalysts.flatMap(id => {
        const analyst = analysts.data?.find(a => a.id === id);
        return [
          {
            step: `${analyst?.fullName || analyst?.name || id} elaborando parecer`,
            analyst: id,
            status: "pending" as const,
            estimatedDuration: 60, // Backend: 60s real average
            phase: "analysis",
            progress: 0,
            novaesMessage: `O GennovAIs solicitou a ${analyst?.fullName || analyst?.name || id} que elabore seu parecer aplicando a ${analyst?.keyTheory || 'sua teoria'}.`
          },
          {
            step: `GennovAIs avalia parecer de ${analyst?.fullName || analyst?.name || id}`,
            analyst: id,
            status: "pending" as const,
            estimatedDuration: 15, // Backend: 15s NovAIs review
            phase: "novaes_review", // Sincronizado com backend
            progress: 0,
            novaesMessage: `O GennovAIs está avaliando rigorosamente o parecer de ${analyst?.fullName || analyst?.name || id}.`
          }
        ];
      }),
      { 
        step: "GennovAIs e Max Weber unificam relatório", 
        status: "pending",
        estimatedDuration: 50, // Backend: 50s consolidation
        phase: "consolidation",
        progress: 0,
        novaesMessage: `O GennovAIs e o Max Weber estão trabalhando juntos para unificar os ${selectedAnalysts.length} pareceres aprovados em um único relatório coeso.`
      },
    ];
    setExecutionSteps(initialSteps);
    
    // Polling simplificado para verificar status da análise
    // SSE removido - fluxo simplificado com polling
    
    // Marcar primeiro step como running
    setExecutionSteps(prev => {
      const newSteps = [...prev];
      if (newSteps.length > 0) {
        newSteps[0] = { ...newSteps[0], status: "running", startTime: Date.now() };
      }
      return newSteps;
    });
    
    try {
      // Update analysis with selected counselors PRIMEIRO
      await updateAnalysis.mutateAsync({
        id: analysisId,
        selectedAnalysts: selectedCounselors,
      });
      
      console.log('[Execution] Iniciando análise com polling...');
      
      // Verificar se as opções especiais estão habilitadas
      const useWebSearch = sources.some(s => s.type === "websearch");
      const useCounselorKnowledge = sources.some(s => s.type === "knowledge");
      
      // Filtrar fontes que não são opções especiais
      const regularSources = sources
        .filter(s => s.type !== "websearch" && s.type !== "knowledge")
        .map(s => s.content || s.title);
      
      // Preparar estrutura aprovada do Passo 3 para enviar ao backend
      let structureText = '';
      if (analysisStructure) {
        try {
          // Converter estrutura para texto legível
          if (analysisStructure.sections && Array.isArray(analysisStructure.sections)) {
            structureText = analysisStructure.sections
              .map((s: any, i: number) => `${i + 1}. ${s.title}${s.description ? ': ' + s.description : ''}`)
              .join('\n');
            if (analysisStructure.title) {
              structureText = `TÍTULO: ${analysisStructure.title}\n\nSEÇÕES:\n${structureText}`;
            }
            if (analysisStructure.methodology) {
              structureText += `\n\nMETODOLOGIA: ${analysisStructure.methodology}`;
            }
          } else {
            structureText = JSON.stringify(analysisStructure, null, 2);
          }
          console.log('[Execution] Estrutura aprovada preparada:', structureText.length, 'chars');
        } catch (err) {
          console.warn('[Execution] Erro ao preparar estrutura:', err);
        }
      }
      
      // Execute multi-agent analysis (executa em background, SSE irá atualizar os steps em tempo real)
      const result = await executeMultiAgent.mutateAsync({
        analysisId,
        sources: regularSources,
        useWebSearch,
        useCounselorKnowledge,
        structure: structureText, // Estrutura aprovada do Passo 3
      });
      
      // A análise executa em background, polling verifica o status
      console.log('[Execution] Análise iniciada em background:', result);
      
      // Ativar estado de polling
      setIsPollingActive(true);
      setPollingError(null);
      
      // Iniciar polling para verificar status usando fetch direto
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/trpc/analysis.get?input=${encodeURIComponent(JSON.stringify({ id: analysisId }))}`);
          const json = await response.json();
          const analysisData = json?.result?.data;
          console.log('[Polling] Status:', analysisData?.status);
          
          if (analysisData?.status === 'completed' && analysisData?.generatedContent) {
            // Parar polling imediatamente quando status for completed
            clearInterval(pollInterval);
            setIsPollingActive(false);
            setGeneratedContent(analysisData.generatedContent);
            setExecutionEndTime(Date.now());
            setExecutionSteps(prev => prev.map(s => ({ ...s, status: "completed" as const })));
            setIsExecuting(false);
            console.log('[Polling] Análise concluída!');
          } else if (analysisData?.status === 'error' || analysisData?.status === 'failed') {
            // Parar polling imediatamente quando status for failed/error
            clearInterval(pollInterval);
            setIsPollingActive(false);
            setPollingError('Ocorreu um problema ao gerar o relatório. Tente novamente mais tarde ou entre em contato com a coordenação.');
            setExecutionSteps(prev => prev.map(s => 
              s.status === "running" ? { ...s, status: "error" as const, error: "Erro na análise" } : s
            ));
            setIsExecuting(false);
            console.log('[Polling] Erro na análise');
          }
        } catch (err) {
          console.error('[Polling] Erro ao verificar status:', err);
        }
      }, 10000); // Polling a cada 10 segundos (alterado de 5s para 10s)
    } catch (error) {
      console.error('[Execution] Erro:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`Erro ao executar análise: ${errorMessage}`);
      setExecutionSteps(prev => prev.map((s) => 
        s.status === "running" ? { ...s, status: "error" as const, error: errorMessage } : s
      ));
      // NÃO resetar isExecuting para manter o estado de execução visível
      // O usuário pode ver o que aconteceu e tentar novamente
    } finally {
      // Polling continua em background até conclusão
      // Cleanup automático quando análise for concluída
    }
  };
  
  // Handle cancel analysis
  const handleCancelAnalysis = async () => {
    if (!analysisId || isCancelling) return;
    
    // Confirmar cancelamento
    const confirmed = window.confirm(
      "Tem certeza que deseja cancelar a análise em andamento?\n\nEsta ação não pode ser desfeita e todo o progresso será perdido."
    );
    
    if (!confirmed) return;
    
    setIsCancelling(true);
    
    try {
      await cancelAnalysis.mutateAsync({ analysisId });
      console.log("Análise cancelada com sucesso.");
      setIsExecuting(false);
      setExecutionSteps(prev => prev.map(s => 
        s.status === "running" ? { ...s, status: "error" as const, error: "Cancelado pelo usuário" } : s
      ));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao cancelar análise";
      console.error(errorMessage);
    } finally {
      setIsCancelling(false);
    }
  };
  
  // Handle export PDF
  const handleExportPDF = () => {
    if (!getPrintable.data?.html) return;
    
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(getPrintable.data.html);
      printWindow.document.close();
      printWindow.print();
    }
  };
  
  // Handle export DOCX
  const handleExportDOCX = async () => {
    if (!analysisId) return;
    
    try {
      console.log("Gerando documento Word...");
      const result = await exportDocx.mutateAsync({ analysisId });
      
      // Download the file
      const link = document.createElement("a");
      link.href = result.url;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log("Documento Word gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar documento Word");
    }
  };
  
  // Calculate elapsed time with real-time updates
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Update elapsed time every second during execution
  // Inicia o timer assim que entrar na etapa execute OU quando isExecuting for true
  useEffect(() => {
    // Iniciar timer quando entrar na etapa execute (mesmo antes de isExecuting)
    const shouldCount = (currentStep === "execute" && !generatedContent) || isExecuting;
    
    if (!shouldCount) {
      return;
    }
    
    // Usar executionStartTime se disponível, senão usar o tempo atual
    const startTime = executionStartTime || Date.now();
    
    // Se não temos executionStartTime ainda, setar agora
    if (!executionStartTime && currentStep === "execute") {
      setExecutionStartTime(Date.now());
    }
    
    // Update immediately
    setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    
    // Set up interval to update every second
    const interval = setInterval(() => {
      const currentStartTime = executionStartTime || startTime;
      const elapsed = Math.floor((Date.now() - currentStartTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [currentStep, isExecuting, executionStartTime, generatedContent]);
  
  // Auto-executar quando chegar na etapa "execute" (elimina tela intermediária)
  useEffect(() => {
    // Log sempre que o useEffect é chamado
    console.log('[AutoExecute] useEffect disparado! currentStep:', currentStep);
    console.log('[AutoExecute] Verificando condições:', {
      currentStep,
      analysisId,
      isExecuting,
      generatedContent: !!generatedContent,
      autoExecuteTriggered
    });
    
    if (currentStep === "execute" && analysisId && !isExecuting && !generatedContent && !autoExecuteTriggered) {
      console.log('[AutoExecute] Todas as condições satisfeitas, iniciando execução...');
      setAutoExecuteTriggered(true);
      // Pequeno delay para garantir que a UI renderizou
      const timer = setTimeout(() => {
        console.log('[AutoExecute] Chamando handleExecuteAnalysis...');
        handleExecuteAnalysis();
      }, 500);
      return () => clearTimeout(timer);
    } else if (currentStep === "execute") {
      console.log('[AutoExecute] Condições não satisfeitas:', {
        hasAnalysisId: !!analysisId,
        notExecuting: !isExecuting,
        noGeneratedContent: !generatedContent,
        notTriggered: !autoExecuteTriggered
      });
    }
  }, [currentStep, analysisId, isExecuting, generatedContent, autoExecuteTriggered]);
  
  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--fgv-primary-2)]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Nova Proposta de Pesquisa</h1>
          <p className="text-white/80">
            Crie uma análise geopolítica com múltiplas perspectivas
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStepIndex > index;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-[var(--fgv-primary-2)] text-white"
                          : isCompleted
                          ? "bg-[var(--fgv-aux-teal-2)] text-white"
                          : "bg-white/20 text-white/60"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${
                      isActive ? "text-white" : "text-white/60"
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-16 h-1 mx-2 rounded ${
                      isCompleted ? "bg-[var(--fgv-aux-teal-2)]" : "bg-white/30"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {/* Quota Info */}
        {quotaInfo.data && (
          <div className="mb-2 px-3 py-2 border border-white/20 bg-white/10 backdrop-blur-sm rounded-md">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-white/80" />
              <p className="text-sm font-medium text-white">
                Pesquisas disponíveis: {quotaInfo.data.remaining} de {quotaInfo.data.quota}
                <span className="text-white/60 ml-1">
                  {quotaInfo.data.remaining > 0 ? "restantes" : "(contate a coordenação)"}
                </span>
              </p>
            </div>
          </div>
        )}
        
        {/* Step Content */}
        <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
          <CardContent className="p-6">
            {/* Step 1: Objective */}
            {currentStep === "proposal" && (
              <div className="animate-fade-in">
                {/* Hero Header */}
                <div className="relative mb-8 p-8 -mx-6 -mt-6 bg-gradient-to-br from-[var(--fgv-primary-1)] to-[var(--fgv-primary-2)] rounded-t-lg">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        <Target className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Passo 1 - Proposta de Pesquisa</h2>
                        <p className="text-white/80 text-sm">Esta é uma etapa importante. Seja claro e específico.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-8 px-2">
                  {/* Botão Carregar Exemplo */}
                  <div className="flex justify-end mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (defaultExample.data) {
                          setTitle(defaultExample.data.title);
                          setObjective(defaultExample.data.objective || '');
                          setContext(defaultExample.data.context);
                          console.log('Exemplo carregado com sucesso!');
                        }
                      }}
                      disabled={!defaultExample.data}
                      className="text-[var(--fgv-primary-2)] border-[var(--fgv-primary-2)] hover:bg-[var(--fgv-primary-2)] hover:text-white"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Carregar Exemplo
                    </Button>
                  </div>

                  {/* Título - Campo Principal */}
                  <div className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--fgv-primary-2)] to-[var(--fgv-aux-teal-2)] rounded-full"></div>
                    <Label htmlFor="title" className="text-lg font-semibold text-[var(--fgv-primary-1)] flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 rounded-full bg-[var(--fgv-primary-2)] text-white text-sm flex items-center justify-center">1</span>
                      Título da Pesquisa
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Ex: Pesquisa Comparativa das Estratégias EUA-China para América Latina"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-14 text-lg border-2 border-[var(--fgv-secondary-4)] focus:border-[var(--fgv-primary-2)] transition-colors bg-[var(--fgv-secondary-5)]/50"
                    />
                    <p className="text-xs text-[var(--fgv-secondary-2)] mt-2">Um título claro e descritivo para identificar sua análise</p>
                  </div>
                  
                  {/* Contexto - Antes dos Objetivos */}
                  <div className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--fgv-aux-teal-2)] to-[var(--fgv-primary-3)] rounded-full"></div>
                    <Label htmlFor="context" className="text-lg font-semibold text-[var(--fgv-primary-1)] flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 rounded-full bg-[var(--fgv-aux-teal-2)] text-white text-sm flex items-center justify-center">2</span>
                      Contexto da Pesquisa
                      <Badge variant="outline" className="ml-2 text-[var(--fgv-secondary-2)] border-[var(--fgv-secondary-3)]">
                        Opcional
                      </Badge>
                    </Label>
                    <Textarea
                      id="context"
                      placeholder="Forneça informações de contexto que podem enriquecer a análise, como eventos recentes, dados específicos, cenário atual ou perspectivas que deseja explorar..."
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      rows={5}
                      className="text-base border-2 border-[var(--fgv-secondary-4)] focus:border-[var(--fgv-primary-2)] transition-colors bg-[var(--fgv-secondary-5)]/50 resize-y"
                    />
                    <p className="text-xs text-[var(--fgv-secondary-2)] mt-2">Informações de contexto ajudam os conselheiros a fornecer análises mais precisas e relevantes</p>
                  </div>
                  
                  {/* Objetivos da Pesquisa - Campo Principal Grande */}
                  <div className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--fgv-primary-3)] to-[var(--fgv-primary-2)] rounded-full"></div>
                    <Label htmlFor="objective" className="text-lg font-semibold text-[var(--fgv-primary-1)] flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 rounded-full bg-[var(--fgv-primary-2)] text-white text-sm flex items-center justify-center">3</span>
                      Objetivos da Pesquisa
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Textarea
                        id="objective"
                        placeholder="Descreva detalhadamente os objetivos da análise. Quanto mais específico, melhor será o resultado. Inclua: O que você deseja analisar, quais questões deseja responder e quais aspectos são mais importantes."
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        rows={12}
                        className="text-base border-2 border-[var(--fgv-secondary-4)] focus:border-[var(--fgv-primary-2)] transition-colors bg-[var(--fgv-secondary-5)]/50 resize-y min-h-[200px]"
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-[var(--fgv-secondary-3)]">
                        {objective.length} caracteres
                      </div>
                    </div>
                    <p className="text-xs text-[var(--fgv-secondary-2)] mt-2">Seja específico sobre o que deseja analisar, incluindo países, atores, períodos e aspectos relevantes</p>
                  </div>
                </div>
                
                {/* Seção de Fontes - Integrada ao Passo 1 */}
                <div className="relative mt-8">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--fgv-primary-2)] to-[var(--fgv-aux-teal-2)] rounded-full"></div>
                  <Label className="text-lg font-semibold text-[var(--fgv-primary-1)] flex items-center gap-2 mb-4">
                    <span className="w-7 h-7 rounded-full bg-[var(--fgv-aux-teal-2)] text-white text-sm flex items-center justify-center">4</span>
                      Fontes de Dados
                  </Label>
                  <p className="text-sm text-[var(--fgv-secondary-2)] mb-4">Selecione as fontes de informação para fundamentar sua análise</p>
                  
                  {/* Source Options - Checkboxes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div
                      onClick={() => {
                        const hasKnowledge = sources.some(s => s.type === "knowledge");
                        if (hasKnowledge) {
                          setSources(sources.filter(s => s.type !== "knowledge"));
                        } else {
                          setSources([...sources, {
                            id: `knowledge_${Date.now()}`,
                            type: "knowledge",
                            title: "Conhecimentos dos Conselheiros",
                            content: "Utilizar o conhecimento especializado dos conselheiros para a análise."
                          }]);
                        }
                      }}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        sources.some(s => s.type === "knowledge")
                          ? "border-[var(--fgv-primary-3)] bg-[var(--fgv-primary-3)]/10"
                          : "border-border hover:border-[var(--fgv-primary-3)]/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          sources.some(s => s.type === "knowledge")
                            ? "border-[var(--fgv-primary-3)] bg-[var(--fgv-primary-3)]"
                            : "border-muted-foreground"
                        }`}>
                          {sources.some(s => s.type === "knowledge") && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <Brain className="w-5 h-5 text-[var(--fgv-primary-3)]" />
                        <div>
                          <p className="font-medium">Use os conhecimentos dos Conselheiros</p>
                          <p className="text-sm text-muted-foreground">Expertise teórica dos pensadores geopolíticos</p>
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        const hasWebSearch = sources.some(s => s.type === "websearch");
                        if (hasWebSearch) {
                          setSources(sources.filter(s => s.type !== "websearch"));
                        } else {
                          setSources([...sources, {
                            id: `websearch_${Date.now()}`,
                            type: "websearch",
                            title: "Consulta à Web",
                            content: "Buscar informações atualizadas na internet sobre o tema da análise."
                          }]);
                        }
                      }}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        sources.some(s => s.type === "websearch")
                          ? "border-[var(--fgv-primary-3)] bg-[var(--fgv-primary-3)]/10"
                          : "border-border hover:border-[var(--fgv-primary-3)]/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          sources.some(s => s.type === "websearch")
                            ? "border-[var(--fgv-primary-3)] bg-[var(--fgv-primary-3)]"
                            : "border-muted-foreground"
                        }`}>
                          {sources.some(s => s.type === "websearch") && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <Search className="w-5 h-5 text-[var(--fgv-primary-3)]" />
                        <div>
                          <p className="font-medium">Consulte a web</p>
                          <p className="text-sm text-muted-foreground">Busca automática de informações atualizadas na internet</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fontes Adicionais - Tabs */}
                  <div className="border-t pt-6 mt-6">
                    <p className="text-sm font-medium mb-4 text-muted-foreground">Fontes adicionais</p>
                    <Tabs defaultValue="news">
                      <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="news" className="flex items-center gap-2">
                          <Newspaper className="w-4 h-4" />
                          Notícias
                        </TabsTrigger>
                        <TabsTrigger value="files" className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Arquivos
                        </TabsTrigger>
                        <TabsTrigger value="web" className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          URLs
                        </TabsTrigger>
                      </TabsList>
                    
                      <TabsContent value="news" className="space-y-4 mt-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Buscar notícias..."
                            value={newsQuery}
                            onChange={(e) => setNewsQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearchNews()}
                          />
                          <Button onClick={handleSearchNews} disabled={searchingNews}>
                            {searchingNews ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Search className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        
                        {newsResults.length > 0 && (
                          <div className="max-h-64 overflow-y-auto space-y-2">
                            {newsResults.map((news, i) => (
                              <div
                                key={i}
                                className="p-3 border rounded-lg flex items-start justify-between gap-4 hover:border-[var(--fgv-primary-3)] transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm line-clamp-1">{news.title}</p>
                                  <p className="text-xs text-[var(--fgv-secondary-2)]">{news.source}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAddNewsSource(news)}
                                  className="border-[var(--fgv-primary-3)] text-[var(--fgv-primary-2)]"
                                >
                                  Adicionar
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="files" className="space-y-4 mt-4">
                        <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                          isUploading 
                            ? 'border-[var(--fgv-primary-3)] bg-[var(--fgv-primary-3)]/5' 
                            : 'border-[var(--fgv-secondary-4)] hover:border-[var(--fgv-primary-3)]'
                        }`}>
                          {isUploading ? (
                            <div className="space-y-4">
                              <div className="relative w-16 h-16 mx-auto">
                                <div className="absolute inset-0 rounded-full border-4 border-[var(--fgv-secondary-4)]"></div>
                                <div 
                                  className="absolute inset-0 rounded-full border-4 border-[var(--fgv-primary-3)] border-t-transparent animate-spin"
                                  style={{ animationDuration: '1s' }}
                                ></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Upload className="w-6 h-6 text-[var(--fgv-primary-3)]" />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <p className="text-[var(--fgv-primary-2)] font-medium">
                                  {uploadProgress < 100 ? 'Processando arquivo...' : 'Concluído!'}
                                </p>
                                <div className="w-48 mx-auto bg-[var(--fgv-secondary-4)] rounded-full h-2 overflow-hidden">
                                  <div 
                                    className="h-full bg-[var(--fgv-primary-3)] transition-all duration-300 ease-out"
                                    style={{ width: `${uploadProgress}%` }}
                                  />
                                </div>
                                <p className="text-xs text-[var(--fgv-secondary-2)]">
                                  {uploadProgress}%
                                </p>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Hidden file input */}
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                                onChange={handleFileUpload}
                                className="sr-only"
                                tabIndex={-1}
                                aria-hidden="true"
                              />
                              <Upload className="w-12 h-12 text-[var(--fgv-secondary-3)] mx-auto mb-4" />
                              <p className="text-[var(--fgv-secondary-2)] mb-4">
                                Clique no botão abaixo para selecionar um arquivo
                              </p>
                              <p className="text-xs text-[var(--fgv-secondary-3)] mb-4">
                                Formatos suportados: PDF, DOCX, TXT (máx. 50MB)
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={triggerFileUpload}
                                className="gap-2"
                              >
                                <Upload className="w-4 h-4" />
                                Selecionar Arquivo
                              </Button>
                            </>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="web" className="space-y-4 mt-4">
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Cole a URL da página web..."
                              value={webUrl}
                              onChange={(e) => setWebUrl(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleFetchUrl()}
                              disabled={isFetchingUrl}
                            />
                            <Button 
                              onClick={handleFetchUrl} 
                              disabled={isFetchingUrl || !webUrl.trim()}
                              className="min-w-[100px]"
                            >
                              {isFetchingUrl ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Globe className="w-4 h-4 mr-2" />
                                  Buscar
                                </>
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-[var(--fgv-secondary-3)]">
                            Cole URLs de artigos, relatórios ou páginas web para extrair o conteúdo como fonte.
                          </p>
                          {isFetchingUrl && (
                            <div className="flex items-center justify-center gap-3 py-4">
                              <div className="relative w-8 h-8">
                                <div className="absolute inset-0 rounded-full border-2 border-[var(--fgv-secondary-4)]"></div>
                                <div className="absolute inset-0 rounded-full border-2 border-[var(--fgv-primary-3)] border-t-transparent animate-spin"></div>
                              </div>
                              <span className="text-sm text-[var(--fgv-secondary-2)]">Extraindo conteúdo da página...</span>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Fontes Selecionadas - Com Drag and Drop */}
                  {sources.length > 0 && (
                    <div className="space-y-2 mt-6">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Fontes Selecionadas ({sources.length})</Label>
                        <span className="text-xs text-[var(--fgv-secondary-3)]">Arraste para reordenar</span>
                      </div>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={sources.map(s => s.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            {sources.map((source) => (
                              <SortableSourceItem
                                key={source.id}
                                source={source}
                                onRemove={(id) => setSources(sources.filter(s => s.id !== id))}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  )}
                </div>
                
                {/* Footer com Botão */}
                <div className="flex justify-between items-center mt-10 pt-6 border-t border-[var(--fgv-secondary-4)]">
                  <div className="text-sm text-[var(--fgv-secondary-2)]">
                    <span className="text-red-500">*</span> Campos obrigatórios
                  </div>
                  <Button
                    onClick={handleCreateAnalysis}
                    disabled={createAnalysis.isPending || !title.trim() || !objective.trim()}
                    className="h-12 px-8 text-base bg-[var(--fgv-primary-2)] hover:bg-[var(--fgv-primary-1)] shadow-lg hover:shadow-xl transition-all"
                  >
                    {createAnalysis.isPending && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                    Enviar proposta à avaliação do GennovAIs
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Step 2: Evaluation - Parecer do GennovAIs - Tela Unificada */}
            {currentStep === "evaluation" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <CardTitle className="text-xl mb-2 text-[var(--fgv-primary-1)]">
                    Passo 2 - Avaliação da Proposta
                  </CardTitle>
                  <CardDescription>
                    O GennovAIs, Coordenador do Conselho, avaliará sua proposta de análise
                  </CardDescription>
                </div>

                {/* Seção 1: Evolução da Avaliação (sempre visível durante avaliação ou após conclusão) */}
                {(isEvaluating || novaesVerdict) && (
                  <div className="text-center py-12">
                    <div className="max-w-2xl mx-auto">
                      {/* Avatar do GennovAIs */}
                      <div className="flex justify-center gap-4 mb-8">
                        <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-[var(--fgv-primary-2)] to-[var(--fgv-primary-1)] flex items-center justify-center mx-auto ${isEvaluating && !novaesVerdict ? 'animate-pulse' : ''}`}>
                          <Brain className="w-12 h-12 text-white" />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-[var(--fgv-primary-1)] mb-4">
                        {isEvaluating && !novaesVerdict ? 'GennovAIs está avaliando sua proposta' : 'Avaliação concluída'}
                      </h3>
                      <p className="text-[var(--fgv-secondary-2)] mb-8">
                        O Coordenador do Conselho está analisando sua proposta e verificando a adequação metodológica.
                      </p>
                      
                      {/* Indicador de Progresso Detalhado - Modelo do Passo 3 */}
                      <div className="bg-white/50 rounded-xl p-6 mb-6 border border-[var(--fgv-secondary-4)]">
                        <div className="space-y-4">
                          {evaluationSteps.map((step, index) => {
                            const isCompleted = novaesVerdict ? true : evaluationStep > index;
                            const isCurrent = !novaesVerdict && evaluationStep === index;
                            const isPending = !novaesVerdict && evaluationStep < index;
                            
                            const IconComponent = step.icon === "FileText" ? FileText :
                                                 step.icon === "Target" ? Target :
                                                 step.icon === "FileSearch" ? FileSearch :
                                                 step.icon === "Settings" ? Settings :
                                                 step.icon === "Search" ? Search :
                                                 CheckCircle;
                            
                            return (
                              <div key={step.id} className={`flex items-center gap-4 transition-all duration-300 ${
                                isCompleted ? 'opacity-100' : isCurrent ? 'opacity-100' : 'opacity-40'
                              }`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                  isCompleted ? 'bg-green-500 text-white' :
                                  isCurrent ? 'bg-[var(--fgv-primary-2)] text-white animate-pulse' :
                                  'bg-[var(--fgv-secondary-4)] text-[var(--fgv-secondary-3)]'
                                }`}>
                                  {isCompleted ? (
                                    <Check className="w-5 h-5" />
                                  ) : isCurrent ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                  ) : (
                                    <IconComponent className="w-5 h-5" />
                                  )}
                                </div>
                                <div className="flex-1 text-left">
                                  <p className={`font-medium transition-colors duration-300 ${
                                    isCompleted ? 'text-green-600' :
                                    isCurrent ? 'text-[var(--fgv-primary-1)]' :
                                    'text-[var(--fgv-secondary-3)]'
                                  }`}>
                                    {step.label}
                                  </p>
                                </div>
                                {isCompleted && (
                                  <span className="text-xs text-green-500 font-medium">Concluído</span>
                                )}
                                {isCurrent && (
                                  <span className="text-xs text-[var(--fgv-primary-2)] font-medium animate-pulse">Em andamento...</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Barra de progresso geral - Modelo do Passo 3 */}
                      <div className="max-w-md mx-auto mb-4">
                        <div className="h-2 bg-[var(--fgv-secondary-4)] rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              novaesVerdict === 'green' ? 'bg-green-500' :
                              novaesVerdict === 'yellow' ? 'bg-yellow-500' :
                              novaesVerdict === 'red' ? 'bg-red-500' :
                              'bg-gradient-to-r from-[var(--fgv-primary-2)] to-[var(--fgv-primary-1)]'
                            }`}
                            style={{width: novaesVerdict ? '100%' : `${((evaluationStep + 1) / evaluationSteps.length) * 100}%`}} 
                          />
                        </div>
                        <p className="text-sm text-[var(--fgv-secondary-2)] mt-2">
                          Etapa {Math.min(evaluationStep + 1, evaluationSteps.length)} de {evaluationSteps.length}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Seção 2: Parecer do GennovAIs (após conclusão da avaliação) */}
                {novaesVerdict && (
                  <div className={`p-6 bg-white rounded-lg border-l-4 shadow-sm animate-parecer-appear animate-evaluation-glow ${
                    novaesVerdict === 'green' ? 'border-green-500' : 
                    novaesVerdict === 'yellow' ? 'border-yellow-500' : 'border-red-500'
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-3 h-3 rounded-full ${
                        novaesVerdict === 'green' ? 'bg-green-500' : 
                        novaesVerdict === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="font-bold text-[var(--fgv-primary-1)]">Parecer do GennovAIs:</span>
                    </div>
                    <p className="text-[var(--fgv-secondary-1)] leading-relaxed whitespace-pre-wrap">{novaesJustification}</p>
                  </div>
                )}

                {/* Seção 3: Carimbo Visual com Animação (após conclusão da avaliação) */}
                {novaesVerdict && (
                  <div className="flex justify-center py-6 animate-evaluation-section-delay-2">
                    <div 
                      className={`relative animate-stamp-appear ${
                        novaesVerdict === 'green' ? 'text-green-600' : 
                        novaesVerdict === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                      }`}
                      style={{ transform: `scale(${stampSize})` }}
                    >
                      {novaesVerdict === 'green' ? (
                        <img 
                          src={stampApprovedUrl} 
                          alt="Proposta Aprovada"
                          className="w-[30rem] h-auto object-contain transform -rotate-6"
                        />
                      ) : novaesVerdict === 'yellow' ? (
                        <img 
                          src={stampReviewUrl} 
                          alt="Proposta a Revisar"
                          className="w-[30rem] h-auto object-contain transform -rotate-6"
                        />
                      ) : (
                        <img 
                          src={stampRejectedUrl} 
                          alt="Proposta Rejeitada"
                          className="w-[30rem] h-auto object-contain transform -rotate-6"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Botões de navegação (após conclusão da avaliação) */}
                {novaesVerdict && (
                  <div className="flex justify-between pt-4 border-t animate-evaluation-section-delay-2">
                    {/* Botão Voltar - sempre visível para amarelo/vermelho */}
                    {novaesVerdict !== 'green' && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setCurrentStep("proposal");
                          setAnalysisStructure(null);
                          setNovAIsVerdict(null);
                          setNovAIsJustification(null);
                        }}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar e revisar proposta
                      </Button>
                    )}
                    
                    {/* Botão para Passo 3 - apenas se aprovado */}
                    {novaesVerdict === 'green' && (
                      <div className="flex gap-3 ml-auto">
                        <Button 
                          variant="outline" 
                          onClick={() => setCurrentStep("proposal")}
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Voltar e editar proposta
                        </Button>
                        <Button
                          onClick={async () => {
                            // Marcar que a geração foi iniciada ANTES de mudar de tela
                            setIsGeneratingStructure(true);
                            
                            // Transição automática: muda para Passo 3 e inicia geração de estrutura
                            setCurrentStep("structure");
                            
                            // Iniciar geração de estrutura automaticamente
                            if (!analysisId) return;
                            
                            // Resetar e iniciar progresso
                            setStructureProgressStep(0);
                            
                            // Simular progresso das etapas enquanto aguarda resposta
                            const progressInterval = setInterval(() => {
                              setStructureProgressStep(prev => {
                                if (prev < 4) return prev + 1;
                                return prev;
                              });
                            }, 2500);
                            
                            try {
                              const result = await generateStructureOnlyMutation.mutateAsync({ analysisId });
                              setStructureProgressStep(5);
                              clearInterval(progressInterval);
                              await new Promise(resolve => setTimeout(resolve, 500));
                              setAnalysisStructure(result.structure);
                              setIsGeneratingStructure(false);
                              
                              const reportResult = await generateReportStructure.mutateAsync({ analysisId });
                              setReportStructure(reportResult.reportStructure);
                            } catch (error) {
                              clearInterval(progressInterval);
                              setStructureProgressStep(0);
                              setIsGeneratingStructure(false);
                              console.error("Erro ao gerar estrutura:", error);
                            }
                          }}
                          disabled={generateStructureOnlyMutation.isPending}
                          className="bg-[var(--fgv-primary-2)] hover:bg-[var(--fgv-primary-1)]"
                        >
                          {generateStructureOnlyMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Gerando estrutura...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Solicitar ao GennovAIs sugestão de estrutura da análise
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Step 3: Structure - Estruturação do Projeto */}
            {currentStep === "structure" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <CardTitle className="text-xl mb-2 text-[var(--fgv-primary-1)]">
                    Passo 3 - Estruturação do Projeto
                  </CardTitle>
                  <CardDescription>
                    O GennovAIs estruturará sua proposta em um projeto de análise
                  </CardDescription>
                </div>
                
                {!analysisStructure ? (
                  <div className="text-center py-12">
                    {/* Página de espera durante geração de estrutura */}
                    {(generateStructureOnlyMutation.isPending || isGeneratingStructure) ? (
                      <div className="max-w-2xl mx-auto">
                        <div className="flex justify-center gap-4 mb-8">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--fgv-primary-2)] to-[var(--fgv-primary-1)] flex items-center justify-center mx-auto animate-pulse">
                            <Brain className="w-12 h-12 text-white" />
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold text-[var(--fgv-primary-1)] mb-4">GennovAIs está estruturando sua análise</h3>
                        <p className="text-[var(--fgv-secondary-2)] mb-8">
                          O Coordenador do Conselho está analisando suas fontes e elaborando uma estrutura de análise adequada ao seu objetivo.
                        </p>
                        
                        {/* Indicador de Progresso Detalhado */}
                        <div className="bg-white/50 rounded-xl p-6 mb-6 border border-[var(--fgv-secondary-4)]">
                          <div className="space-y-4">
                            {structureSteps.map((step, index) => {
                              const isCompleted = structureProgressStep > index;
                              const isCurrent = structureProgressStep === index;
                              const isPending = structureProgressStep < index;
                              
                              const IconComponent = step.icon === "FileText" ? FileText :
                                                   step.icon === "Search" ? Search :
                                                   step.icon === "Settings" ? Settings :
                                                   step.icon === "Layout" ? Layout :
                                                   CheckCircle;
                              
                              return (
                                <div key={step.id} className={`flex items-center gap-4 transition-all duration-300 ${
                                  isCompleted ? 'opacity-100' : isCurrent ? 'opacity-100' : 'opacity-40'
                                }`}>
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    isCompleted ? 'bg-green-500 text-white' :
                                    isCurrent ? 'bg-[var(--fgv-primary-2)] text-white animate-pulse' :
                                    'bg-[var(--fgv-secondary-4)] text-[var(--fgv-secondary-3)]'
                                  }`}>
                                    {isCompleted ? (
                                      <Check className="w-5 h-5" />
                                    ) : isCurrent ? (
                                      <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                      <IconComponent className="w-5 h-5" />
                                    )}
                                  </div>
                                  <div className="flex-1 text-left">
                                    <p className={`font-medium transition-colors duration-300 ${
                                      isCompleted ? 'text-green-600' :
                                      isCurrent ? 'text-[var(--fgv-primary-1)]' :
                                      'text-[var(--fgv-secondary-3)]'
                                    }`}>
                                      {step.label}
                                    </p>
                                  </div>
                                  {isCompleted && (
                                    <span className="text-xs text-green-500 font-medium">Concluído</span>
                                  )}
                                  {isCurrent && (
                                    <span className="text-xs text-[var(--fgv-primary-2)] font-medium animate-pulse">Em andamento...</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        {/* Barra de progresso geral */}
                        <div className="max-w-md mx-auto mb-4">
                          <div className="h-2 bg-[var(--fgv-secondary-4)] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[var(--fgv-primary-2)] to-[var(--fgv-primary-1)] transition-all duration-500" 
                              style={{width: `${(structureProgressStep / structureSteps.length) * 100}%`}} 
                            />
                          </div>
                          <p className="text-sm text-[var(--fgv-secondary-2)] mt-2">
                            Etapa {Math.min(structureProgressStep + 1, structureSteps.length)} de {structureSteps.length}
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* A geração de estrutura agora é iniciada automaticamente na transição do Passo 2 */
                      <>
                        <div className="flex justify-center gap-4 mb-6">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--fgv-primary-2)] to-[var(--fgv-primary-1)] flex items-center justify-center mx-auto">
                            <Sparkles className="w-10 h-10 text-white" />
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-[var(--fgv-primary-1)] mb-2">Aguardando estruturação</h3>
                        <p className="text-[var(--fgv-secondary-2)] mb-6 max-w-md mx-auto">
                          Se você chegou aqui diretamente, volte ao Passo 2 e clique em "Solicitar ao GennovAIs sugestão de estrutura".
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep("evaluation")}
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Voltar ao Passo 2
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Editable Analysis Structure */}
                    <div className="p-4 bg-[var(--fgv-secondary-5)] rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-[var(--fgv-primary-1)]">Proposta de Estrutura da Pesquisa</h4>
                      </div>
                      
                      {/* Methodology */}
                      {analysisStructure.methodology && (
                        <div className="mb-4 p-3 bg-white/50 rounded border border-[var(--fgv-secondary-4)]">
                          <Label className="text-xs text-[var(--fgv-secondary-2)] mb-1 block">Método</Label>
                          <Textarea
                            value={analysisStructure.methodology}
                            onChange={(e) => setAnalysisStructure({
                              ...analysisStructure,
                              methodology: e.target.value
                            })}
                            className="min-h-[60px] text-sm"
                          />
                        </div>
                      )}
                      
                      {/* Editable Sections with Move/Delete Controls */}
                      <div className="space-y-3">
                        {analysisStructure.sections?.map((section: any, i: number) => (
                          <div key={section.id || i} className="p-3 bg-white/50 rounded border border-[var(--fgv-secondary-4)] group hover:border-[var(--fgv-primary-3)] transition-colors">
                            <div className="flex items-start gap-2">
                              {/* Move Controls */}
                              <div className="flex flex-col gap-1 pt-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-[var(--fgv-secondary-3)] hover:text-[var(--fgv-primary-2)] hover:bg-[var(--fgv-primary-2)]/10 disabled:opacity-30"
                                  disabled={i === 0}
                                  onClick={() => {
                                    const newSections = [...analysisStructure.sections];
                                    [newSections[i - 1], newSections[i]] = [newSections[i], newSections[i - 1]];
                                    setAnalysisStructure({ ...analysisStructure, sections: newSections });
                                  }}
                                  title="Mover para cima"
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </Button>
                                <div className="flex items-center justify-center h-6 w-6">
                                  <GripVertical className="w-4 h-4 text-[var(--fgv-secondary-3)]" />
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-[var(--fgv-secondary-3)] hover:text-[var(--fgv-primary-2)] hover:bg-[var(--fgv-primary-2)]/10 disabled:opacity-30"
                                  disabled={i === analysisStructure.sections.length - 1}
                                  onClick={() => {
                                    const newSections = [...analysisStructure.sections];
                                    [newSections[i], newSections[i + 1]] = [newSections[i + 1], newSections[i]];
                                    setAnalysisStructure({ ...analysisStructure, sections: newSections });
                                  }}
                                  title="Mover para baixo"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </Button>
                              </div>
                              
                              {/* Section Number */}
                              <span className="w-6 h-6 rounded-full bg-[var(--fgv-primary-2)] text-white text-xs flex items-center justify-center flex-shrink-0 mt-1">
                                {i + 1}
                              </span>
                              
                              {/* Section Content */}
                              <div className="flex-1 space-y-2">
                                <Input
                                  value={section.title || ''}
                                  onChange={(e) => {
                                    const newSections = [...analysisStructure.sections];
                                    newSections[i] = { ...newSections[i], title: e.target.value };
                                    setAnalysisStructure({ ...analysisStructure, sections: newSections });
                                  }}
                                  className="font-medium text-sm"
                                  placeholder="Título da seção"
                                />
                                <Textarea
                                  value={section.description || ''}
                                  onChange={(e) => {
                                    const newSections = [...analysisStructure.sections];
                                    newSections[i] = { ...newSections[i], description: e.target.value };
                                    setAnalysisStructure({ ...analysisStructure, sections: newSections });
                                  }}
                                  className="text-sm min-h-[40px]"
                                  placeholder="Descrição do conteúdo"
                                />
                                {section.estimatedTime && (
                                  <div className="flex items-center gap-2 text-xs text-[var(--fgv-secondary-2)]">
                                    <Clock className="w-3 h-3" />
                                    <span>~{section.estimatedTime} min</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Delete Button */}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (analysisStructure.sections.length <= 1) {
                                    console.log("A estrutura deve ter pelo menos uma seção");
                                    return;
                                  }
                                  const newSections = analysisStructure.sections.filter((_: any, idx: number) => idx !== i);
                                  setAnalysisStructure({ ...analysisStructure, sections: newSections });
                                }}
                                className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                                title="Excluir seção"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Add Section Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newSection = {
                            id: String(Date.now()),
                            title: 'Nova Seção',
                            description: 'Descreva o conteúdo desta seção',
                            estimatedTime: '5'
                          };
                          setAnalysisStructure({
                            ...analysisStructure,
                            sections: [...analysisStructure.sections, newSection]
                          });
                          console.log("Seção adicionada");
                        }}
                        className="mt-4 w-full border-dashed border-2 hover:border-[var(--fgv-primary-2)] hover:bg-[var(--fgv-primary-2)]/5"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Nova Seção
                      </Button>
                    </div>
                    
                    {/* Expected Outcomes */}
                    {analysisStructure.expectedOutcomes && (
                      <div className="p-4 bg-[var(--fgv-secondary-5)] rounded-lg">
                        <h4 className="font-medium mb-2 text-[var(--fgv-primary-1)]">Resultados Esperados</h4>
                        <div className="space-y-2">
                          {analysisStructure.expectedOutcomes.map((outcome: string, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-[var(--fgv-aux-teal-2)]" />
                              <Input
                                value={outcome}
                                onChange={(e) => {
                                  const newOutcomes = [...analysisStructure.expectedOutcomes];
                                  newOutcomes[i] = e.target.value;
                                  setAnalysisStructure({ ...analysisStructure, expectedOutcomes: newOutcomes });
                                }}
                                className="text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Avaliação da Estrutura */}
                    {analysisStructure.novaesNotes && (
                      <div className="p-4 bg-[var(--fgv-secondary-5)] rounded-lg">
                        <h4 className="font-medium mb-3 text-[var(--fgv-primary-1)]">Comentários do GennovAIs</h4>
                        <p className="text-sm text-[var(--fgv-secondary-2)]">{analysisStructure.novaesNotes}</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep("evaluation")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  <Button
                    onClick={() => {
                      // Atualizar lista de conselheiros ao clicar no botão
                      counselors.refetch();
                      setCurrentStep("counselors");
                    }}
                    disabled={!analysisStructure}
                    className="bg-[var(--fgv-primary-2)] hover:bg-[var(--fgv-primary-1)] px-6"
                  >
                    Escolher Conselheiros
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Step 4: Counselors - Escolha dos Conselheiros */}
            {currentStep === "counselors" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <CardTitle className="text-xl mb-2 text-[var(--fgv-primary-1)]">
                    Passo 4 - Escolha dos Conselheiros
                  </CardTitle>
                  <CardDescription>
                    Selecione os Conselheiros que participarão da análise de sua proposta
                  </CardDescription>
                </div>
                
                {/* Sugestão automática baseada no tema */}
                {selectedCounselors.length === 0 && (title || objective) && (
                  <div className="p-4 bg-[var(--fgv-aux-teal-2)]/10 rounded-lg border border-[var(--fgv-aux-teal-2)]">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-[var(--fgv-aux-teal-2)] mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-[var(--fgv-primary-1)] mb-2">
                          Sugestão baseada no tema da sua análise
                        </p>
                        <p className="text-xs text-[var(--fgv-secondary-2)] mb-3">
                          Com base no título e objetivos, identificamos conselheiros que podem contribuir especialmente para sua análise.
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Seleciona todos os conselheiros ativos cadastrados
                            const allActive = counselors.data?.filter(c => c.isActive).map(c => c.counselorId) || [];
                            if (allActive.length > 0) {
                              setSelectedCounselors(allActive);
                            } else {
                              // Fallback se não houver conselheiros
                              const validSuggestions: string[] = [];
                              const suggested = validSuggestions.filter(id => 
                                counselors.data?.some(c => c.counselorId === id && c.isActive)
                              );
                              setSelectedCounselors(validSuggestions);
                            }
                          }}
                          className="text-[var(--fgv-aux-teal-2)] border-[var(--fgv-aux-teal-2)] hover:bg-[var(--fgv-aux-teal-2)]/10"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Aplicar sugestão automática
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Lista de Conselheiros */}
                <div className="p-6 bg-[var(--fgv-secondary-5)] rounded-lg space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-[var(--fgv-primary-1)]">Conselheiros Disponíveis</h4>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const allActive = counselors.data?.filter(c => c.isActive).map(c => c.counselorId) || [];
                          setSelectedCounselors(allActive);
                        }}
                        className="text-xs"
                      >
                        Selecionar todos
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCounselors([])}
                        className="text-xs"
                      >
                        Limpar seleção
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-[var(--fgv-secondary-2)] mb-4">
                    Escolha os especialistas que trarão diferentes perspectivas teóricas para sua análise.
                    Recomendamos selecionar pelo menos 3 conselheiros para uma análise mais rica.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {counselors.data?.map((counselor) => {
                      const isSelected = selectedCounselors.includes(counselor.counselorId);
                      const isDisabled = !counselor.isActive;
                      return (
                        <div
                          key={counselor.counselorId}
                          onClick={() => {
                            if (isDisabled) return; // Não permite selecionar conselheiros inativos
                            if (isSelected) {
                              setSelectedCounselors(prev => prev.filter(id => id !== counselor.counselorId));
                            } else {
                              setSelectedCounselors(prev => [...prev, counselor.counselorId]);
                            }
                          }}
                          className={`p-4 rounded-lg border-2 transition-all relative ${
                            isDisabled
                              ? 'border-gray-200 opacity-60 cursor-not-allowed'
                              : isSelected 
                                ? 'border-[var(--fgv-primary-2)] bg-[var(--fgv-primary-2)]/10 cursor-pointer' 
                                : 'border-gray-200 hover:border-[var(--fgv-primary-3)] cursor-pointer'
                          }`}
                        >
                          {/* Faixa de inatividade */}
                          {isDisabled && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 rotate-[-15deg]">
                              <div className="bg-red-600/90 text-white px-4 py-1 text-xs font-bold tracking-wider shadow-lg border border-red-700 whitespace-nowrap">
                                {counselor.unavailabilityText || 'INATIVO'}
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                              {counselor.homePhotoUrl ? (
                                <img 
                                  src={counselor.homePhotoUrl} 
                                  alt={counselor.shortName || counselor.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Users className="w-6 h-6" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-[var(--fgv-primary-1)]">{counselor.shortName}</h5>
                              <p className="text-xs text-[var(--fgv-secondary-2)]">{counselor.nationality}</p>
                              <p className="text-xs text-[var(--fgv-primary-3)] line-clamp-1">{counselor.mainTheory}</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isSelected 
                                ? 'border-[var(--fgv-primary-2)] bg-[var(--fgv-primary-2)] text-white' 
                                : 'border-gray-300'
                            }`}>
                              {isSelected && <Check className="w-4 h-4" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Resumo com estimativas */}
                  <div className="mt-4 p-4 bg-white rounded-lg border border-[var(--fgv-primary-3)]/20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-[var(--fgv-secondary-2)] mb-1">Conselheiros selecionados</p>
                        <p className="text-lg font-bold text-[var(--fgv-primary-1)]">
                          {selectedCounselors.length}
                          {selectedCounselors.length < 3 && (
                            <span className="text-xs font-normal text-[var(--fgv-aux-orange-1)] ml-2">
                              (mín. 3 recomendado)
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--fgv-secondary-2)] mb-1">Tempo estimado</p>
                        <p className="text-lg font-bold text-[var(--fgv-primary-1)] flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {selectedCounselors.length === 0 ? '--' : `${Math.max(3, selectedCounselors.length * 2)} - ${Math.max(5, selectedCounselors.length * 3)} min`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--fgv-secondary-2)] mb-1">Preço</p>
                        <p className="text-lg font-bold text-[var(--fgv-aux-teal-2)] flex items-center gap-1">
                          <Badge variant="outline" className="bg-[var(--fgv-aux-teal-2)]/10 text-[var(--fgv-aux-teal-2)] border-[var(--fgv-aux-teal-2)]">
                            Gratuito
                          </Badge>
                          <span className="text-xs font-normal text-[var(--fgv-secondary-2)] ml-1">
                            (R$ 0,00)
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep("structure")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  <Button
                    onClick={() => setCurrentStep("payment")}
                    disabled={selectedCounselors.length === 0}
                    className="bg-[var(--fgv-primary-2)] hover:bg-[var(--fgv-primary-1)] px-6"
                  >
                    Prosseguir para Pagamento
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Step 5: Payment - Pagamento */}
            {currentStep === "payment" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <CardTitle className="text-xl mb-2 text-[var(--fgv-primary-1)]">
                    Passo 5 - Pagamento
                  </CardTitle>
                  <CardDescription>
                    Confirme os detalhes da análise e efetue o pagamento
                  </CardDescription>
                </div>
                
                {/* Resumo da Pesquisa */}
                <div className="p-6 bg-[var(--fgv-secondary-5)] rounded-lg space-y-4">
                  <h4 className="font-semibold text-[var(--fgv-primary-1)]">Resumo da Pesquisa</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-[var(--fgv-secondary-2)]">Título</Label>
                      <p className="font-medium">{title}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-[var(--fgv-secondary-2)]">Conselheiros</Label>
                      <p className="font-medium">{selectedCounselors.length} selecionados</p>
                    </div>
                    <div>
                      <Label className="text-sm text-[var(--fgv-secondary-2)]">Fontes</Label>
                      <p className="font-medium">{sources.length} fontes</p>
                    </div>
                    <div>
                      <Label className="text-sm text-[var(--fgv-secondary-2)]">Seções</Label>
                      <p className="font-medium">{analysisStructure?.sections?.length || 0} seções</p>
                    </div>
                  </div>
                </div>
                
                {/* Status de Pagamento - Gratuito */}
                <div className="p-6 bg-gradient-to-r from-[var(--fgv-aux-teal-2)]/10 to-[var(--fgv-aux-teal-1)]/10 rounded-lg border-2 border-[var(--fgv-aux-teal-2)]">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--fgv-aux-teal-2)] flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[var(--fgv-primary-1)]">Gratuito durante o Beta</h4>
                      <p className="text-[var(--fgv-secondary-2)]">Aproveite! Durante o período beta, todas as análises são gratuitas.</p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-white/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--fgv-secondary-2)]">Valor da análise:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg line-through text-[var(--fgv-secondary-3)]">R$ 49,90</span>
                        <Badge className="bg-[var(--fgv-aux-teal-2)] text-white">GRATUITO</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep("structure")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentStep("council");
                      // Iniciar execução diretamente após transição
                      setTimeout(() => {
                        if (analysisId && !isExecuting) {
                          handleExecuteAnalysis();
                        }
                      }, 100);
                    }}
                    className="bg-[var(--fgv-aux-teal-2)] hover:bg-[var(--fgv-aux-teal-1)] px-8"
                  >
                    Confirmar e Iniciar Pesquisa
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Step 5: Council - Sessão do Conselho */}
            {currentStep === "council" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <CardTitle className="text-xl mb-2 text-[var(--fgv-primary-1)]">
                    Passo 6 - Sessão do Conselho
                  </CardTitle>
                  <CardDescription>
                    A análise será processada em segundo plano. Você poderá ver o relatório quando estiver pronto.
                  </CardDescription>
                </div>
                
                {/* Painel de Informações da Sessão */}
                <div className="p-4 bg-[var(--fgv-secondary-5)] rounded-lg border border-[var(--fgv-secondary-4)]">
                  {/* Código de Sessão e Título */}
                  <div className="mb-4">
                    {sessionCode && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-[var(--fgv-primary-2)] text-white text-sm font-mono font-bold rounded">
                          {sessionCode}
                        </span>
                        <span className="text-xs text-[var(--fgv-secondary-2)]">
                          Código de Rastreabilidade
                        </span>
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-[var(--fgv-primary-1)]">
                      {title || 'Análise Geopolítica'}
                    </h3>
                  </div>
                  
                  {/* Participantes */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-[var(--fgv-secondary-2)] mb-2">Participantes da Sessão:</h4>
                    <div className="flex flex-wrap gap-2">
                      {/* GennovAIs - Moderador */}
                      <div className="flex items-center gap-1 px-3 py-1 bg-[var(--fgv-primary-2)]/10 rounded-full border border-[var(--fgv-primary-2)]">
                        <Users className="w-3 h-3 text-[var(--fgv-primary-2)]" />
                        <span className="text-xs font-medium text-[var(--fgv-primary-2)]">
                          GennovAIs (Moderador)
                        </span>
                      </div>
                      {/* Conselheiros selecionados */}
                      {selectedCounselors.map(id => {
                        const counselor = counselors.data?.find(a => a.counselorId === id);
                        return (
                          <div key={id} className="flex items-center gap-1 px-3 py-1 bg-[var(--fgv-aux-teal-2)]/10 rounded-full border border-[var(--fgv-aux-teal-2)]">
                            <Brain className="w-3 h-3 text-[var(--fgv-aux-teal-2)]" />
                            <span className="text-xs font-medium text-[var(--fgv-aux-teal-2)]">
                              {counselor?.shortName || counselor?.name || id}
                            </span>
                          </div>
                        );
                      })}
                      {/* Max Weber - Editor */}
                      <div className="flex items-center gap-1 px-3 py-1 bg-[var(--fgv-aux-purple-2)]/10 rounded-full border border-[var(--fgv-aux-purple-2)]">
                        <FileText className="w-3 h-3 text-[var(--fgv-aux-purple-2)]" />
                        <span className="text-xs font-medium text-[var(--fgv-aux-purple-2)]">
                          Max Weber (Editor)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Datas de Início e Término */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[var(--fgv-secondary-3)]" />
                      <span className="text-[var(--fgv-secondary-2)]">
                        Início: {executionStartTime ? new Date(executionStartTime).toLocaleString('pt-BR') : 'Aguardando...'}
                      </span>
                    </div>
                    {executionEndTime && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 font-medium">
                          Término: {new Date(executionEndTime).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Mostrar interface de progresso sempre (mesmo antes de isExecuting) */}
                {(currentStep === "council") && (
                  <div className="space-y-6">
                    {/* Caixa Única de Progresso */}
                    {(() => {
                      // Encontrar o step atual (running ou retrying)
                      const currentRunningStep = executionSteps.find(s => s.status === "running" || s.status === "retrying");
                      const completedSteps = executionSteps.filter(s => s.status === "completed").length;
                      const totalSteps = executionSteps.length;
                      const analyst = currentRunningStep?.analyst ? analysts.data?.find(a => a.id === currentRunningStep.analyst) : null;
                      const Icon = currentRunningStep?.analyst ? DEFAULT_ANALYST_ICON : MessageSquare;
                      const now = Date.now(); // Tempo atual para cálculos de progresso
                      
                      // Calcular progresso do step atual
                      const getCurrentProgress = () => {
                        if (!currentRunningStep) return generatedContent ? 100 : 0;
                        
                        // Se temos progresso do backend, usar ele (incluindo 0)
                        if (currentRunningStep.progress !== undefined && currentRunningStep.progress !== null) {
                          return currentRunningStep.progress;
                        }
                        
                        // Fallback: calcular baseado no tempo decorrido vs estimado
                        if (currentRunningStep.startTime && currentRunningStep.estimatedDuration) {
                          const elapsed = (now - currentRunningStep.startTime) / 1000;
                          // Usar curva logaritmica para parecer mais natural
                          const linearProgress = (elapsed / currentRunningStep.estimatedDuration) * 100;
                          // Nunca passar de 95% até receber confirmação do backend
                          return Math.min(linearProgress, 95);
                        }
                        
                        return 10; // Valor inicial para mostrar que algo está acontecendo
                      };
                      
                      // Calcular tempo restante estimado
                      const getEstimatedTimeRemaining = () => {
                        if (generatedContent) return null;
                        
                        // Se não temos steps ainda, calcular estimativa baseada nos analistas selecionados
                        if (!currentRunningStep && executionSteps.length === 0) {
                          // Convocação (3s) + cada analista (75s elabora + 30s avalia) + consolidação (50s)
                          const estimatedTotal = 3 + (selectedAnalysts.length * 105) + 50;
                          const mins = Math.floor(estimatedTotal / 60);
                          const secs = estimatedTotal % 60;
                          return `~${mins}m ${secs}s`;
                        }
                        
                        if (!currentRunningStep) return null;
                        
                        // Calcular tempo restante do step atual
                        let stepTimeRemaining = 0;
                        if (currentRunningStep.startTime && currentRunningStep.estimatedDuration) {
                          const elapsed = (now - currentRunningStep.startTime) / 1000;
                          stepTimeRemaining = Math.max(0, currentRunningStep.estimatedDuration - elapsed);
                        } else if (currentRunningStep.estimatedDuration) {
                          stepTimeRemaining = currentRunningStep.estimatedDuration;
                        }
                        
                        // Somar tempo dos steps pendentes
                        const pendingStepsTime = executionSteps
                          .filter(s => s.status === 'pending')
                          .reduce((acc, s) => acc + (s.estimatedDuration || 30), 0);
                        
                        const totalRemaining = Math.ceil(stepTimeRemaining + pendingStepsTime);
                        
                        if (totalRemaining <= 0) return null;
                        
                        // Formatar tempo
                        if (totalRemaining >= 60) {
                          const mins = Math.floor(totalRemaining / 60);
                          const secs = totalRemaining % 60;
                          return `~${mins}m ${secs}s`;
                        }
                        return `~${totalRemaining}s`;
                      };
                      
                      // Gerar mensagem criativa baseada no step atual
                      // Prioriza mensagem criativa do backend quando disponível
                      const getCreativeMessage = () => {
                        if (!currentRunningStep) {
                          return generatedContent 
                            ? "Análise concluída com sucesso! O relatório está pronto para exportação."
                            : "Preparando para iniciar a análise...";
                        }
                        
                        // Se há mensagem criativa do backend, usar ela (personalizada por Conselheiro)
                        if (currentRunningStep.creativeMessage) {
                          return currentRunningStep.creativeMessage;
                        }
                        
                        const phase = currentRunningStep.phase;
                        const analystName = analyst?.fullName || analyst?.name || "";
                        const theory = analyst?.keyTheory || "";
                        const retrying = currentRunningStep.status === "retrying";
                        const retryCount = currentRunningStep.retryCount || 0;
                        
                        if (phase === "convocation") {
                          return `O GennovAIs está reunindo os Conselheiros na sala de estratégia. Cada especialista receberá o briefing completo sobre o tema em análise. A sessão do Conselho está prestes a começar.`;
                        }
                        
                        if (phase === "analysis") {
                          if (retrying) {
                            return `${analystName} está refinando seu parecer após feedback do GennovAIs. O Conselheiro revisita suas fontes e aprofunda a análise com base na ${theory}. Tentativa ${retryCount + 1} em andamento.`;
                          }
                          return `${analystName} mergulha nas fontes disponíveis, aplicando a ${theory} para extrair insights estratégicos. O Conselheiro analisa cada detalhe com a precisão de décadas de experiência.`;
                        }
                        
                        if (phase === "consolidation") {
                          return `O GennovAIs reúne todos os pareceres sobre a mesa. Com visão estratégica, ele identifica convergências e complementaridades entre as perspectivas dos Conselheiros, preparando a síntese final.`;
                        }
                        
                        if (phase === "novaes_review") {
                          if (currentRunningStep.step.includes("reavalia")) {
                            return `O GennovAIs reavalia o relatório aprimorado. Após as correções solicitadas, o documento está mais robusto e pronto para a revisão final.`;
                          }
                          return `Atenção! O GennovAIs identificou pontos que precisam de aprimoramento no relatório. O Coordenador do Conselho exige excelência acadêmica em cada documento produzido.`;
                        }
                        
                        if (phase === "review") {
                          return `O Max Weber realiza a revisão final do documento. Cada parágrafo é verificado quanto à coesão, clareza e rigor acadêmico. O relatório está sendo polido para publicação.`;
                        }
                        
                        if (phase === "websearch") {
                          return `Buscando fontes atualizadas na web para enriquecer a análise. O sistema vasculha bases de dados e notícias recentes sobre o tema.`;
                        }
                        
                        return currentRunningStep.novaesMessage || "Processando...";
                      };
                      
                      return (
                        <div className="p-6 rounded-xl border-2 border-[var(--fgv-primary-3)] bg-gradient-to-br from-[var(--fgv-primary-1)]/5 to-[var(--fgv-primary-3)]/10 shadow-lg">
                          {/* Cabeçalho com status geral */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              {(isExecuting || (!generatedContent && !isExecuting)) ? (
                                <div className="p-3 rounded-full bg-[var(--fgv-primary-2)] animate-pulse">
                                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                                </div>
                              ) : (
                                <div className="p-3 rounded-full bg-[var(--fgv-aux-teal-2)]">
                                  <CheckCircle2 className="w-6 h-6 text-white" />
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-lg text-[var(--fgv-primary-1)]">
                                  {pollingError ? "Erro na Sessão" : generatedContent ? "Sessão Encerrada" : "Conselho em Sessão"}
                                </p>
                                <p className="text-sm text-[var(--fgv-secondary-2)]">
                                  {totalSteps > 0 ? `${completedSteps} de ${totalSteps} etapas • ` : ""}{formatTime(elapsedTime)}
                                </p>
                                {/* Indicador de polling ativo */}
                                {isPollingActive && !generatedContent && !pollingError && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <Loader2 className="w-3 h-3 animate-spin text-[var(--fgv-primary-3)]" />
                                    <span className="text-xs text-[var(--fgv-primary-3)]">
                                      Verificando o status da Sessão do Conselho...
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {currentRunningStep && analyst && (
                                <div className={`p-2 rounded-lg ${DEFAULT_ANALYST_COLOR}`}>
                                  <Icon className="w-5 h-5 text-white" />
                                </div>
                              )}
                              {/* Botão Cancelar - mostrar sempre que não tiver resultado */}
                              {!generatedContent && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCancelAnalysis}
                                  disabled={isCancelling}
                                  className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400"
                                >
                                  {isCancelling ? (
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                  ) : (
                                    <StopCircle className="w-4 h-4 mr-1" />
                                  )}
                                  {isCancelling ? "Cancelando..." : "Cancelar"}
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {/* Tarefa atual */}
                          {currentRunningStep ? (
                            <div className="mb-4 p-4 rounded-lg bg-white/50 border border-[var(--fgv-secondary-4)]">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fgv-primary-3)]">
                                  {currentRunningStep.phase === "convocation" ? "Abertura da Sessão" :
                                   currentRunningStep.phase === "analysis" ? "Apresentação de Parecer" :
                                   currentRunningStep.phase === "consolidation" ? "Unificação do Relatório" :
                                   currentRunningStep.phase === "novaes_review" ? "Intervenção do Coordenador" :
                                   currentRunningStep.phase === "review" ? "Finalização" :
                                   currentRunningStep.phase === "websearch" ? "Pesquisa Web" : "Processamento"}
                                </span>
                                {currentRunningStep.status === "retrying" && (
                                  <Badge variant="outline" className="text-[var(--fgv-aux-yellow-2)] border-[var(--fgv-aux-yellow-2)] text-xs">
                                    Tentativa {(currentRunningStep.retryCount || 0) + 1}
                                  </Badge>
                                )}
                              </div>
                              <p className="font-medium text-[var(--fgv-primary-1)] mb-1">
                                {currentRunningStep.step}
                              </p>
                              {analyst && (
                                <p className="text-sm text-[var(--fgv-secondary-2)]">
                                  {analyst.fullName} • {analyst.keyTheory}
                                </p>
                              )}
                            </div>
                          ) : !generatedContent && (
                            <div className="mb-4 p-4 rounded-lg bg-white/50 border border-[var(--fgv-secondary-4)]">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fgv-primary-3)]">
                                  Abertura da Sessão
                                </span>
                              </div>
                              <p className="font-medium text-[var(--fgv-primary-1)] mb-1">
                                GennovAIs convoca Conselheiros
                              </p>
                              <p className="text-sm text-[var(--fgv-secondary-2)]">
                                Preparando a sessão do Conselho com {selectedAnalysts.length} Conselheiros
                              </p>
                            </div>
                          )}
                          
                          {/* Barra de progresso da tarefa atual */}
                          <div className="mb-4">
                            <div className="flex justify-between text-xs text-[var(--fgv-secondary-2)] mb-1">
                              <span className="flex items-center gap-2">
                                Progresso da tarefa atual
                                {!generatedContent && (
                                  <span className="inline-flex items-center gap-1 text-[var(--fgv-primary-3)]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--fgv-primary-3)] animate-pulse" />
                                    <span className="text-[10px]">
                                      {currentRunningStep?.phase === 'convocation' || !currentRunningStep ? 'Preparando sessão' : 'Processando'}
                                    </span>
                                  </span>
                                )}
                              </span>
                              <span className="flex items-center gap-2">
                                <span className="font-semibold">{Math.round(getCurrentProgress())}%</span>
                                {getEstimatedTimeRemaining() && (
                                  <span className="text-[var(--fgv-secondary-3)] text-[10px]">
                                    ({getEstimatedTimeRemaining()})
                                  </span>
                                )}
                              </span>
                            </div>
                            <div className="h-3 bg-[var(--fgv-secondary-4)] rounded-full overflow-hidden relative">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ease-out ${
                                  generatedContent 
                                    ? "bg-[var(--fgv-aux-teal-2)]" 
                                    : currentRunningStep?.status === "retrying"
                                    ? "bg-[var(--fgv-aux-yellow-2)] animate-progress-glow"
                                    : "bg-[var(--fgv-primary-3)]"
                                } ${
                                  !generatedContent ? "progress-bar-active animate-progress-pulse" : ""
                                }`}
                                style={{ width: `${getCurrentProgress()}%` }}
                              />
                            </div>
                            {/* Tempo total restante estimado */}
                            {!generatedContent && (
                              <div className="flex items-center justify-center gap-2 mt-2 text-xs text-[var(--fgv-secondary-2)]">
                                <Clock className="w-3 h-3" />
                                <span>Tempo total estimado: {getEstimatedTimeRemaining()}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Mensagem criativa */}
                          <div className={`p-4 rounded-lg border-l-4 ${
                            currentRunningStep?.phase === "novaes_review" && !currentRunningStep?.step.includes("reavalia")
                              ? "bg-[var(--fgv-aux-yellow-2)]/10 border-[var(--fgv-aux-yellow-2)]"
                              : generatedContent
                              ? "bg-[var(--fgv-aux-teal-2)]/10 border-[var(--fgv-aux-teal-2)]"
                              : "bg-[var(--fgv-primary-2)]/10 border-[var(--fgv-primary-2)]"
                          }`}>
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                currentRunningStep?.phase === "novaes_review" && !currentRunningStep?.step.includes("reavalia")
                                  ? "bg-[var(--fgv-aux-yellow-2)]"
                                  : generatedContent
                                  ? "bg-[var(--fgv-aux-teal-2)]"
                                  : "bg-[var(--fgv-primary-2)]"
                              }`}>
                                <MessageSquare className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className={`text-xs font-semibold mb-1 ${
                                  currentRunningStep?.phase === "novaes_review" && !currentRunningStep?.step.includes("reavalia")
                                    ? "text-[var(--fgv-aux-yellow-2)]"
                                    : generatedContent
                                    ? "text-[var(--fgv-aux-teal-2)]"
                                    : "text-[var(--fgv-primary-2)]"
                                }`}>
                                  {currentRunningStep?.phase === "novaes_review" && !currentRunningStep?.step.includes("reavalia")
                                    ? "🔍 Intervenção do Coordenador"
                                    : generatedContent
                                    ? "✅ Relatório Finalizado"
                                    : "📝 Bastidores da Sessão do Conselho"}
                                </p>
                                <p className="text-sm text-[var(--fgv-secondary-1)] leading-relaxed">
                                  {getCreativeMessage()}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Modo Espectador - Debate em Tempo Real */}
                          {currentRunningStep?.spectatorMode && (
                            <div className="mt-4 p-4 rounded-lg bg-gradient-to-br from-[var(--fgv-primary-1)]/5 to-[var(--fgv-primary-3)]/10 border border-[var(--fgv-primary-3)]/30">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fgv-primary-2)]">
                                  🎭 Modo Espectador - Debate ao Vivo
                                </span>
                              </div>
                              
                              {/* Contexto do debate */}
                              {currentRunningStep.spectatorMode.debateContext && (
                                <p className="text-sm text-[var(--fgv-secondary-1)] mb-3 italic">
                                  {currentRunningStep.spectatorMode.debateContext}
                                </p>
                              )}
                              
                              {/* Base teórica */}
                              {currentRunningStep.spectatorMode.theoreticalBasis && (
                                <div className="mb-3 p-2 rounded bg-[var(--fgv-primary-2)]/10">
                                  <span className="text-xs font-semibold text-[var(--fgv-primary-2)]">📚 Base Teórica: </span>
                                  <span className="text-xs text-[var(--fgv-secondary-1)]">
                                    {currentRunningStep.spectatorMode.theoreticalBasis}
                                  </span>
                                </div>
                              )}
                              
                              {/* Trecho do parecer */}
                              {currentRunningStep.spectatorMode.opinionExcerpt && (
                                <div className="mb-3 p-3 rounded bg-white/50 border-l-2 border-[var(--fgv-primary-3)]">
                                  <span className="text-xs font-semibold text-[var(--fgv-primary-3)] block mb-1">
                                    ✍️ Trecho do Parecer:
                                  </span>
                                  <p className="text-sm text-[var(--fgv-secondary-1)] italic leading-relaxed">
                                    "{currentRunningStep.spectatorMode.opinionExcerpt}"
                                  </p>
                                </div>
                              )}
                              
                              {/* Argumentos-chave */}
                              {currentRunningStep.spectatorMode.keyArguments && currentRunningStep.spectatorMode.keyArguments.length > 0 && (
                                <div className="mb-3">
                                  <span className="text-xs font-semibold text-[var(--fgv-primary-2)] block mb-2">
                                    💡 Argumentos Identificados:
                                  </span>
                                  <div className="space-y-1">
                                    {currentRunningStep.spectatorMode.keyArguments.map((arg, idx) => (
                                      <div key={idx} className="flex items-start gap-2 text-xs text-[var(--fgv-secondary-1)]">
                                        <span className="text-[var(--fgv-primary-3)]">•</span>
                                        <span>{arg}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Reação do GennovAIs */}
                              {currentRunningStep.spectatorMode.novaesReaction && (
                                <div className={`p-3 rounded-lg border ${
                                  currentRunningStep.spectatorMode.novaesReaction.type === 'approval'
                                    ? 'bg-[var(--fgv-aux-teal-2)]/10 border-[var(--fgv-aux-teal-2)]'
                                    : currentRunningStep.spectatorMode.novaesReaction.type === 'rejection'
                                    ? 'bg-[var(--fgv-aux-pink-2)]/10 border-[var(--fgv-aux-pink-2)]'
                                    : 'bg-[var(--fgv-aux-yellow-2)]/10 border-[var(--fgv-aux-yellow-2)]'
                                }`}>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">
                                      {currentRunningStep.spectatorMode.novaesReaction.type === 'approval' ? '✅' :
                                       currentRunningStep.spectatorMode.novaesReaction.type === 'rejection' ? '❌' :
                                       currentRunningStep.spectatorMode.novaesReaction.type === 'praise' ? '🌟' : '❓'}
                                    </span>
                                    <span className={`text-xs font-bold ${
                                      currentRunningStep.spectatorMode.novaesReaction.type === 'approval'
                                        ? 'text-[var(--fgv-aux-teal-2)]'
                                        : currentRunningStep.spectatorMode.novaesReaction.type === 'rejection'
                                        ? 'text-[var(--fgv-aux-pink-2)]'
                                        : 'text-[var(--fgv-aux-yellow-2)]'
                                    }`}>
                                      GennovAIs {currentRunningStep.spectatorMode.novaesReaction.type === 'approval' ? 'Aprovou' :
                                                      currentRunningStep.spectatorMode.novaesReaction.type === 'rejection' ? 'Rejeitou' :
                                                      currentRunningStep.spectatorMode.novaesReaction.type === 'praise' ? 'Elogiou' : 'Questionou'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-[var(--fgv-secondary-1)] font-medium">
                                    "{currentRunningStep.spectatorMode.novaesReaction.message}"
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Log do Conselho - Histórico de Etapas - Modelo Padronizado do Passo 3 */}
                          {executionSteps.length > 0 && (
                            <div className="mt-6 border-t border-[var(--fgv-secondary-4)] pt-4">
                              <div className="flex items-center gap-2 mb-3">
                                <MessageSquare className="w-4 h-4 text-[var(--fgv-primary-2)]" />
                                <span className="text-sm font-semibold text-[var(--fgv-primary-1)]">
                                  Log do Conselho
                                </span>
                                <span className="text-xs text-[var(--fgv-secondary-3)]">
                                  ({executionSteps.filter(s => s.status === 'completed').length}/{executionSteps.length} etapas)
                                </span>
                              </div>
                              
                              {/* Lista de etapas no modelo padronizado do Passo 3 */}
                              <div className="bg-white/50 rounded-xl p-6 mb-4 border border-[var(--fgv-secondary-4)]">
                                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                                  {executionSteps.map((step, index) => {
                                    const stepAnalyst = step.analyst ? analysts.data?.find(a => a.id === step.analyst) : null;
                                    const isCompleted = step.status === "completed";
                                    const isCurrent = step.status === "running" || step.status === "retrying";
                                    const isError = step.status === "error";
                                    const isPending = step.status === "pending";
                                    
                                    return (
                                      <div key={index} className={`flex items-center gap-4 transition-all duration-300 ${
                                        isCompleted ? 'opacity-100' : isCurrent ? 'opacity-100' : 'opacity-40'
                                      }`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                          isCompleted ? 'bg-green-500 text-white' :
                                          isCurrent ? 'bg-[var(--fgv-primary-2)] text-white animate-pulse' :
                                          isError ? 'bg-[var(--fgv-aux-pink-2)] text-white' :
                                          'bg-[var(--fgv-secondary-4)] text-[var(--fgv-secondary-3)]'
                                        }`}>
                                          {isCompleted ? (
                                            <Check className="w-5 h-5" />
                                          ) : isCurrent ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                          ) : isError ? (
                                            <AlertCircle className="w-5 h-5" />
                                          ) : (
                                            <Clock className="w-5 h-5" />
                                          )}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                          <p className={`font-medium transition-colors duration-300 ${
                                            isCompleted ? 'text-green-600' :
                                            isCurrent ? 'text-[var(--fgv-primary-1)]' :
                                            isError ? 'text-[var(--fgv-aux-pink-2)]' :
                                            'text-[var(--fgv-secondary-3)]'
                                          }`}>
                                            {step.step}
                                          </p>
                                          {stepAnalyst && (
                                            <p className="text-xs text-[var(--fgv-secondary-2)] mt-0.5">
                                              {stepAnalyst.fullName || stepAnalyst.name}
                                            </p>
                                          )}
                                          {step.error && (
                                            <p className="text-xs text-[var(--fgv-aux-pink-2)] mt-0.5">
                                              Erro: {step.error}
                                            </p>
                                          )}
                                        </div>
                                        {isCompleted && (
                                          <span className="text-xs text-green-500 font-medium flex-shrink-0">Concluído</span>
                                        )}
                                        {isCurrent && (
                                          <span className="text-xs text-[var(--fgv-primary-2)] font-medium animate-pulse flex-shrink-0">Em andamento...</span>
                                        )}
                                        {isError && (
                                          <span className="text-xs text-[var(--fgv-aux-pink-2)] font-medium flex-shrink-0">Erro</span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                              
                              {/* Barra de progresso geral - Modelo do Passo 3 */}
                              <div className="max-w-md mx-auto mb-4">
                                <div className="h-2 bg-[var(--fgv-secondary-4)] rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full transition-all duration-500 ${
                                      generatedContent 
                                        ? 'bg-green-500' 
                                        : 'bg-gradient-to-r from-[var(--fgv-primary-2)] to-[var(--fgv-primary-1)]'
                                    }`}
                                    style={{width: `${totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0}%`}} 
                                  />
                                </div>
                                <p className="text-sm text-[var(--fgv-secondary-2)] mt-2 text-center">
                                  Etapa {completedSteps} de {totalSteps}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {/* Painéis de SSE removidos - fluxo simplificado */}
                          
                          {/* Container de Debug - Logs Detalhados */}
                          <div className="mt-6 border-t border-[var(--fgv-secondary-4)] pt-4">
                            <button
                              onClick={() => setShowDebugPanel(!showDebugPanel)}
                              className="flex items-center gap-2 text-sm font-medium text-[var(--fgv-secondary-2)] hover:text-[var(--fgv-primary-2)] transition-colors"
                            >
                              <Bug className="w-4 h-4" />
                              <span>Painel de Debug</span>
                              <ChevronRight className={`w-4 h-4 transition-transform ${showDebugPanel ? 'rotate-90' : ''}`} />
                              {debugLogs.length > 0 && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {debugLogs.length} logs
                                </Badge>
                              )}
                            </button>
                            
                            {showDebugPanel && (
                              <div className="mt-4 bg-[#1a1a2e] rounded-lg border border-[var(--fgv-secondary-4)] overflow-hidden">
                                {/* Header do Debug Panel */}
                                <div className="flex items-center justify-between px-4 py-2 bg-[#16213e] border-b border-[var(--fgv-secondary-4)]">
                                  <div className="flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-green-400" />
                                    <span className="text-sm font-mono text-green-400">Debug Console</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        const logText = debugLogs.map(log => 
                                          `[${new Date(log.timestamp).toISOString()}] [${log.type.toUpperCase()}] ${log.function}: ${log.message}${log.prompt ? `\n  Prompt: ${log.prompt}` : ''}${log.response ? `\n  Response: ${log.response}` : ''}${log.duration ? `\n  Duration: ${log.duration}ms` : ''}`
                                        ).join('\n\n');
                                        navigator.clipboard.writeText(logText);
                                        toast.success('Logs copiados para a área de transferência');
                                      }}
                                      className="p-1 hover:bg-white/10 rounded transition-colors"
                                      title="Copiar logs"
                                    >
                                      <Copy className="w-4 h-4 text-gray-400" />
                                    </button>
                                    <button
                                      onClick={() => setDebugLogs([])}
                                      className="p-1 hover:bg-white/10 rounded transition-colors"
                                      title="Limpar logs"
                                    >
                                      <Trash2 className="w-4 h-4 text-gray-400" />
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Logs */}
                                <div className="max-h-96 overflow-y-auto p-4 font-mono text-xs space-y-3">
                                  {debugLogs.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">Nenhum log disponível. Inicie uma análise para ver os logs.</p>
                                  ) : (
                                    debugLogs.map((log, index) => (
                                      <div 
                                        key={index} 
                                        className={`p-3 rounded border-l-4 ${
                                          log.type === 'error' ? 'bg-red-900/20 border-red-500 text-red-300' :
                                          log.type === 'warning' ? 'bg-yellow-900/20 border-yellow-500 text-yellow-300' :
                                          log.type === 'success' ? 'bg-green-900/20 border-green-500 text-green-300' :
                                          log.type === 'llm_call' ? 'bg-purple-900/20 border-purple-500 text-purple-300' :
                                          log.type === 'llm_response' ? 'bg-blue-900/20 border-blue-500 text-blue-300' :
                                          log.type === 'sse_event' ? 'bg-cyan-900/20 border-cyan-500 text-cyan-300' :
                                          'bg-gray-800/50 border-gray-500 text-gray-300'
                                        }`}
                                      >
                                        {/* Header do Log */}
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                              log.type === 'error' ? 'bg-red-500/30 text-red-200' :
                                              log.type === 'warning' ? 'bg-yellow-500/30 text-yellow-200' :
                                              log.type === 'success' ? 'bg-green-500/30 text-green-200' :
                                              log.type === 'llm_call' ? 'bg-purple-500/30 text-purple-200' :
                                              log.type === 'llm_response' ? 'bg-blue-500/30 text-blue-200' :
                                              log.type === 'sse_event' ? 'bg-cyan-500/30 text-cyan-200' :
                                              'bg-gray-500/30 text-gray-200'
                                            }`}>
                                              {log.type === 'sse_event' ? 'SSE' : log.type}
                                            </span>
                                            <span className="text-white/80 font-semibold">{log.function}</span>
                                          </div>
                                          <div className="flex items-center gap-2 text-gray-400">
                                            {log.duration && (
                                              <span className="flex items-center gap-1">
                                                <Timer className="w-3 h-3" />
                                                {log.duration > 1000 ? `${(log.duration / 1000).toFixed(1)}s` : `${log.duration}ms`}
                                              </span>
                                            )}
                                            {log.cost && (
                                              <span className="flex items-center gap-1">
                                                <Zap className="w-3 h-3" />
                                                ${log.cost.toFixed(4)}
                                              </span>
                                            )}
                                            <span className="text-[10px]">
                                              {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })}
                                            </span>
                                          </div>
                                        </div>
                                        
                                        {/* Mensagem Principal */}
                                        <p className="text-sm leading-relaxed">{log.message}</p>
                                        
                                        {/* Prompt (se houver) */}
                                        {log.prompt && (
                                          <div className="mt-2 p-2 bg-black/30 rounded">
                                            <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-1">
                                              <Code className="w-3 h-3" />
                                              <span>PROMPT / CREATIVE MESSAGE</span>
                                            </div>
                                            <p className="text-gray-300 text-[11px] leading-relaxed whitespace-pre-wrap">
                                              {log.prompt.length > 500 ? log.prompt.substring(0, 500) + '...' : log.prompt}
                                            </p>
                                          </div>
                                        )}
                                        
                                        {/* Response (se houver) */}
                                        {log.response && (
                                          <div className="mt-2 p-2 bg-black/30 rounded">
                                            <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-1">
                                              <MessageSquare className="w-3 h-3" />
                                              <span>RESPONSE / NOVAES MESSAGE</span>
                                            </div>
                                            <p className="text-gray-300 text-[11px] leading-relaxed whitespace-pre-wrap">
                                              {log.response.length > 500 ? log.response.substring(0, 500) + '...' : log.response}
                                            </p>
                                          </div>
                                        )}
                                        
                                        {/* Tokens (se houver) */}
                                        {log.tokens && (
                                          <div className="mt-2 flex items-center gap-4 text-[10px] text-gray-400">
                                            {log.tokens.input && <span>Input: {log.tokens.input} tokens</span>}
                                            {log.tokens.output && <span>Output: {log.tokens.output} tokens</span>}
                                          </div>
                                        )}
                                      </div>
                                    ))
                                  )}
                                </div>
                                
                                {/* Footer com estatísticas */}
                                {debugLogs.length > 0 && (
                                  <div className="px-4 py-2 bg-[#16213e] border-t border-[var(--fgv-secondary-4)] flex items-center justify-between text-[10px] text-gray-400">
                                    <div className="flex items-center gap-4">
                                      <span>Total: {debugLogs.length} logs</span>
                                      <span className="text-red-400">Erros: {debugLogs.filter(l => l.type === 'error').length}</span>
                                      <span className="text-yellow-400">Avisos: {debugLogs.filter(l => l.type === 'warning').length}</span>
                                      <span className="text-cyan-400">SSE: {debugLogs.filter(l => l.type === 'sse_event').length}</span>
                                    </div>
                                    {debugLogs.length > 0 && debugLogs[debugLogs.length - 1].timestamp && debugLogs[0].timestamp && (
                                      <span>
                                        Duração: {((debugLogs[debugLogs.length - 1].timestamp - debugLogs[0].timestamp) / 1000).toFixed(1)}s
                                      </span>
                                    )}
                                  </div>
                                )}

                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                    
                    {/* Aviso de Erro na Sessão */}
                    {pollingError && (
                      <div className="p-4 bg-red-50 border-2 border-red-500 rounded-lg mb-4 animate-fade-in">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-red-500">
                            <AlertCircle className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-red-700 text-lg">Erro na Sessão do Conselho</h4>
                            <p className="text-red-600 text-sm">
                              {pollingError}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Aviso de Conclusão do Debate */}
                    {generatedContent && !pollingError && (
                      <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg mb-4 animate-fade-in">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-green-500">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-green-700 text-lg">Sessão do Conselho Concluída!</h4>
                            <p className="text-green-600 text-sm">
                              O debate foi finalizado com sucesso. O relatório foi consolidado por Max Weber e está pronto para exportação.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Export Options - Passo 7: Relatório Final */}
                    {generatedContent && (
                      <div id="generated-report" className="p-6 bg-[var(--fgv-aux-teal-2)]/10 rounded-lg border border-[var(--fgv-aux-teal-2)]">
                        <h4 className="font-bold text-[var(--fgv-primary-1)] mb-4 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-[var(--fgv-aux-teal-2)]" />
                          Passo 7 - Relatório Final
                        </h4>
                        
                        {/* Botões de Ação */}
                        <div className="flex flex-wrap gap-3 mb-6">
                          <Button
                            onClick={() => {
                              const reportContent = document.getElementById('report-content');
                              if (reportContent) {
                                reportContent.classList.toggle('hidden');
                              }
                            }}
                            className="bg-[var(--fgv-primary-2)] hover:bg-[var(--fgv-primary-1)]"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Exibir Relatório Final
                          </Button>
                          <Button
                            onClick={handleExportPDF}
                            variant="outline"
                            className="border-[var(--fgv-primary-2)] text-[var(--fgv-primary-2)] hover:bg-[var(--fgv-primary-2)]/10"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Exportar PDF
                          </Button>
                          <Button
                            onClick={handleExportDOCX}
                            disabled={exportDocx.isPending}
                            variant="outline"
                            className="border-[var(--fgv-aux-teal-2)] text-[var(--fgv-aux-teal-2)] hover:bg-[var(--fgv-aux-teal-2)]/10"
                          >
                            {exportDocx.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <FileText className="w-4 h-4 mr-2" />
                            )}
                            Exportar Word
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => navigate(`/analysis/${analysisId}`)}
                            className="border-[var(--fgv-primary-3)] text-[var(--fgv-primary-2)]"
                          >
                            Ver Detalhes
                          </Button>
                        </div>
                        
                        {/* Conteúdo do Relatório (inicialmente oculto) */}
                        <div id="report-content" className="hidden mt-6 p-6 bg-white rounded-lg border border-[var(--fgv-secondary-4)] shadow-inner max-h-[600px] overflow-y-auto">
                          <div className="prose prose-sm max-w-none text-[var(--fgv-secondary-1)]">
                            <Streamdown>{generatedContent}</Streamdown>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                

              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Import missing component
import { BarChart3, Bug, Terminal, Code, Timer, Zap, ChevronRight, Copy, Eye, EyeOff } from "lucide-react";
