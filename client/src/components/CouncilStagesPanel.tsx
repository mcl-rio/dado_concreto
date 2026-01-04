/**
 * CouncilStagesPanel - Painel de visualização das 5 etapas do Conselho
 * 
 * Exibe o progresso das 5 etapas da Sessão do Conselho:
 * 1. Convocação da sessão pelo GennovAIs
 * 2. Elaboração de parecer(es) pelos Conselheiros
 * 3. Avaliação dos pareceres pelo GennovAIs
 * 4. Consolidação pelo Max Weber
 * 5. Salvamento e conclusão
 */

import { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Loader2,
  ChevronDown,
  ChevronRight,
  Bug,
  Terminal,
  Copy,
  Trash2,
  Pause,
  Play,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Definição das 5 etapas
export const COUNCIL_STAGES = [
  {
    id: 'convocation',
    name: 'Etapa 1: Convocação da Sessão',
    description: 'O GennovAIs convoca os Conselheiros e apresenta o tema da análise.',
    icon: Users,
    color: 'var(--fgv-primary-2)',
  },
  {
    id: 'counselor_opinions',
    name: 'Etapa 2: Elaboração dos Pareceres',
    description: 'Cada Conselheiro selecionado elabora seu parecer individual.',
    icon: FileText,
    color: 'var(--fgv-aux-teal-2)',
  },
  {
    id: 'novaes_evaluation',
    name: 'Etapa 3: Avaliação pelo GennovAIs',
    description: 'O GennovAIs avalia cada parecer, aprovando ou solicitando melhorias.',
    icon: CheckCircle2,
    color: 'var(--fgv-aux-yellow-2)',
  },
  {
    id: 'weber_consolidation',
    name: 'Etapa 4: Consolidação pelo Max Weber',
    description: 'Max Weber consolida todos os pareceres aprovados em um relatório único.',
    icon: FileText,
    color: 'var(--fgv-aux-purple-2)',
  },
  {
    id: 'save_and_complete',
    name: 'Etapa 5: Salvamento e Conclusão',
    description: 'O relatório final é salvo no banco de dados e a sessão é encerrada.',
    icon: CheckCircle2,
    color: 'var(--fgv-aux-teal-2)',
  },
];

// Tipos de status de etapa
export type StageStatus = 'pending' | 'running' | 'completed' | 'error' | 'paused';

// Interface para informações de etapa
export interface StageInfo {
  stage: string;
  status: StageStatus;
  message?: string;
  error?: string;
  duration?: number;
  timestamp?: number;
  details?: Record<string, unknown>;
}

// Interface para evento SSE de etapa
export interface StageEvent {
  type: string;
  analysisId: number;
  timestamp: number;
  stage?: string;
  stageName?: string;
  status?: string; // Aceita qualquer string do backend
  message?: string;
  error?: string;
  duration?: number;
  details?: Record<string, unknown>;
}

// Props do componente
interface CouncilStagesPanelProps {
  analysisId: number | null;
  isExecuting: boolean;
  isPaused?: boolean;
  onResume?: () => void;
  stageEvents: StageEvent[];
  currentStageId?: string;
  completedStages?: string[];
  errorStages?: string[];
}

export default function CouncilStagesPanel({
  analysisId,
  isExecuting,
  isPaused = false,
  onResume,
  stageEvents,
  currentStageId,
  completedStages = [],
  errorStages = [],
}: CouncilStagesPanelProps) {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [showDebugSSE, setShowDebugSSE] = useState(false);
  const debugPanelRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll para o final dos eventos SSE
  useEffect(() => {
    if (debugPanelRef.current && showDebugSSE) {
      debugPanelRef.current.scrollTop = debugPanelRef.current.scrollHeight;
    }
  }, [stageEvents, showDebugSSE]);
  
  // Determinar status de cada etapa
  const getStageStatus = (stageId: string): StageStatus => {
    if (errorStages.includes(stageId)) return 'error';
    if (completedStages.includes(stageId)) return 'completed';
    if (currentStageId === stageId) {
      return isPaused ? 'paused' : 'running';
    }
    return 'pending';
  };
  
  // Obter último evento de uma etapa
  const getLastEventForStage = (stageId: string): StageEvent | undefined => {
    return [...stageEvents]
      .reverse()
      .find(e => e.stage === stageId);
  };
  
  // Formatar timestamp
  const formatTimestamp = (ts: number): string => {
    return new Date(ts).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  };
  
  // Formatar duração
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const mins = Math.floor(ms / 60000);
    const secs = Math.round((ms % 60000) / 1000);
    return `${mins}m ${secs}s`;
  };
  
  // Renderizar ícone de status
  const renderStatusIcon = (status: StageStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-[var(--fgv-primary-2)] animate-spin" />;
      case 'paused':
        return <Pause className="w-5 h-5 text-[var(--fgv-aux-yellow-2)]" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-[var(--fgv-aux-pink-2)]" />;
      default:
        return <Clock className="w-5 h-5 text-[var(--fgv-secondary-3)]" />;
    }
  };
  
  // Renderizar cor de fundo baseada no status
  const getStatusBgColor = (status: StageStatus): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 border-green-500/30';
      case 'running':
        return 'bg-[var(--fgv-primary-2)]/10 border-[var(--fgv-primary-2)]/30 animate-pulse';
      case 'paused':
        return 'bg-[var(--fgv-aux-yellow-2)]/10 border-[var(--fgv-aux-yellow-2)]/30';
      case 'error':
        return 'bg-[var(--fgv-aux-pink-2)]/10 border-[var(--fgv-aux-pink-2)]/30';
      default:
        return 'bg-[var(--fgv-secondary-5)] border-[var(--fgv-secondary-4)]';
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Título do Painel */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[var(--fgv-primary-1)]">
            Etapas da Sessão do Conselho
          </h3>
          {isExecuting && (
            <Badge variant="outline" className="text-xs bg-[var(--fgv-primary-2)]/10 border-[var(--fgv-primary-2)]">
              {isPaused ? 'Pausado' : 'Em execução'}
            </Badge>
          )}
        </div>
        {isPaused && onResume && (
          <Button
            size="sm"
            onClick={onResume}
            className="flex items-center gap-1 bg-[var(--fgv-primary-2)] hover:bg-[var(--fgv-primary-1)]"
          >
            <Play className="w-3 h-3" />
            Continuar
          </Button>
        )}
      </div>
      
      {/* Lista de Etapas */}
      <div className="space-y-2">
        {COUNCIL_STAGES.map((stage, index) => {
          const status = getStageStatus(stage.id);
          const lastEvent = getLastEventForStage(stage.id);
          const isExpanded = expandedStage === stage.id;
          const StageIcon = stage.icon;
          
          return (
            <div
              key={stage.id}
              className={`rounded-lg border transition-all ${getStatusBgColor(status)}`}
            >
              {/* Header da Etapa */}
              <button
                onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
                className="w-full flex items-center justify-between p-3 text-left"
              >
                <div className="flex items-center gap-3">
                  {/* Número da etapa */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    status === 'completed' ? 'bg-green-500 text-white' :
                    status === 'running' ? 'bg-[var(--fgv-primary-2)] text-white' :
                    status === 'paused' ? 'bg-[var(--fgv-aux-yellow-2)] text-white' :
                    status === 'error' ? 'bg-[var(--fgv-aux-pink-2)] text-white' :
                    'bg-[var(--fgv-secondary-4)] text-[var(--fgv-secondary-2)]'
                  }`}>
                    {index + 1}
                  </div>
                  
                  {/* Info da etapa */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--fgv-primary-1)]">
                        {stage.name}
                      </span>
                      {renderStatusIcon(status)}
                    </div>
                    <p className="text-xs text-[var(--fgv-secondary-2)] mt-0.5">
                      {lastEvent?.message || stage.description}
                    </p>
                  </div>
                </div>
                
                {/* Duração e expand */}
                <div className="flex items-center gap-2">
                  {lastEvent?.duration && (
                    <span className="text-xs text-[var(--fgv-secondary-3)]">
                      {formatDuration(lastEvent.duration)}
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-[var(--fgv-secondary-3)]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[var(--fgv-secondary-3)]" />
                  )}
                </div>
              </button>
              
              {/* Detalhes expandidos */}
              {isExpanded && lastEvent && (
                <div className="px-3 pb-3 border-t border-[var(--fgv-secondary-4)]">
                  <div className="mt-3 p-2 bg-[var(--fgv-secondary-5)] rounded text-xs font-mono">
                    <div className="flex justify-between text-[var(--fgv-secondary-2)] mb-1">
                      <span>Timestamp:</span>
                      <span>{formatTimestamp(lastEvent.timestamp)}</span>
                    </div>
                    {lastEvent.details && Object.keys(lastEvent.details).length > 0 && (
                      <div className="mt-2 pt-2 border-t border-[var(--fgv-secondary-4)]">
                        <span className="text-[var(--fgv-secondary-2)]">Detalhes:</span>
                        <pre className="mt-1 text-[10px] text-[var(--fgv-secondary-1)] overflow-x-auto">
                          {JSON.stringify(lastEvent.details, null, 2)}
                        </pre>
                      </div>
                    )}
                    {lastEvent.error && (
                      <div className="mt-2 pt-2 border-t border-[var(--fgv-aux-pink-2)]/30">
                        <span className="text-[var(--fgv-aux-pink-2)]">Erro:</span>
                        <p className="mt-1 text-[var(--fgv-aux-pink-2)]">{lastEvent.error}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Painel de Debug SSE */}
      <div className="mt-4 border-t border-[var(--fgv-secondary-4)] pt-4">
        <button
          onClick={() => setShowDebugSSE(!showDebugSSE)}
          className="flex items-center gap-2 text-sm font-medium text-[var(--fgv-secondary-2)] hover:text-[var(--fgv-primary-2)] transition-colors"
        >
          <Bug className="w-4 h-4" />
          <span>Debug SSE Events</span>
          <ChevronRight className={`w-4 h-4 transition-transform ${showDebugSSE ? 'rotate-90' : ''}`} />
          {stageEvents.length > 0 && (
            <Badge variant="outline" className="ml-2 text-xs">
              {stageEvents.length} eventos
            </Badge>
          )}
        </button>
        
        {showDebugSSE && (
          <div className="mt-4 bg-[#1a1a2e] rounded-lg border border-[var(--fgv-secondary-4)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#16213e] border-b border-[var(--fgv-secondary-4)]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-mono text-cyan-400">SSE Stage Events</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const logText = stageEvents.map(e => 
                      `[${formatTimestamp(e.timestamp)}] ${e.type}: ${e.stageName || e.stage || 'N/A'} - ${e.message || ''}`
                    ).join('\n');
                    navigator.clipboard.writeText(logText);
                    toast.success('Eventos copiados');
                  }}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title="Copiar eventos"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
            
            {/* Lista de eventos */}
            <div 
              ref={debugPanelRef}
              className="max-h-64 overflow-y-auto p-4 font-mono text-xs space-y-2"
            >
              {stageEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Nenhum evento SSE recebido. Inicie uma análise para ver os eventos.
                </p>
              ) : (
                stageEvents.map((event, index) => (
                  <div 
                    key={index}
                    className={`p-2 rounded border-l-2 ${
                      event.type.includes('error') ? 'bg-red-900/20 border-red-500 text-red-300' :
                      event.type.includes('complete') ? 'bg-green-900/20 border-green-500 text-green-300' :
                      event.type.includes('start') ? 'bg-blue-900/20 border-blue-500 text-blue-300' :
                      event.type.includes('paused') ? 'bg-yellow-900/20 border-yellow-500 text-yellow-300' :
                      'bg-cyan-900/20 border-cyan-500 text-cyan-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white/80">{event.type}</span>
                      <span className="text-gray-400 text-[10px]">
                        {formatTimestamp(event.timestamp)}
                      </span>
                    </div>
                    <div className="text-[11px]">
                      {event.stageName && (
                        <span className="text-cyan-200">{event.stageName}</span>
                      )}
                      {event.message && (
                        <span className="text-gray-300 ml-2">- {event.message}</span>
                      )}
                      {event.error && (
                        <span className="text-red-300 block mt-1">Erro: {event.error}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
