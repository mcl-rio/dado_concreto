import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Analyst {
  id: string;
  name: string;
  fullName: string;
  theory: string;
  flag: string;
  portrait: string;
  colorPortrait: string;
  objectPosition: string;
  school: string;
  schoolColor: string;
  quote: string;
  isActive: boolean;
  unavailabilityText: string | null;
}

interface CounselorCarouselProps {
  analysts: Analyst[];
  imageSize: number;
  speed: number;
  onCounselorClick: (id: string) => void;
}

export function CounselorCarousel({ 
  analysts, 
  imageSize, 
  speed, 
  onCounselorClick 
}: CounselorCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'exit-right' | 'behind' | 'enter-left' | 'exit-left' | 'enter-right'>('idle');
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Avançar para o próximo conselheiro com animação circular (sai pela direita, volta por trás, entra pela esquerda)
  const goToNext = useCallback(() => {
    if (animationPhase !== 'idle') return;
    
    const nextIdx = (currentIndex + 1) % analysts.length;
    
    // Fase 1: Saída pela direita
    setAnimationPhase('exit-right');
    
    // Fase 2: Passar por trás (invisível)
    setTimeout(() => {
      setDisplayIndex(nextIdx);
      setAnimationPhase('behind');
    }, 300);
    
    // Fase 3: Entrar pela esquerda
    setTimeout(() => {
      setAnimationPhase('enter-left');
    }, 350);
    
    // Fase 4: Voltar ao idle
    setTimeout(() => {
      setCurrentIndex(nextIdx);
      setAnimationPhase('idle');
    }, 700);
  }, [currentIndex, analysts.length, animationPhase]);

  // Voltar para o conselheiro anterior com animação circular inversa (sai pela esquerda, volta por trás, entra pela direita)
  const goToPrev = useCallback(() => {
    if (animationPhase !== 'idle') return;
    
    const prevIdx = (currentIndex - 1 + analysts.length) % analysts.length;
    
    // Fase 1: Saída pela esquerda
    setAnimationPhase('exit-left');
    
    // Fase 2: Passar por trás (invisível)
    setTimeout(() => {
      setDisplayIndex(prevIdx);
      setAnimationPhase('behind');
    }, 300);
    
    // Fase 3: Entrar pela direita
    setTimeout(() => {
      setAnimationPhase('enter-right');
    }, 350);
    
    // Fase 4: Voltar ao idle
    setTimeout(() => {
      setCurrentIndex(prevIdx);
      setAnimationPhase('idle');
    }, 700);
  }, [currentIndex, analysts.length, animationPhase]);

  // Autoplay com pausa no hover - movimento automático avança
  useEffect(() => {
    if (analysts.length <= 1) return;
    
    // Limpar intervalo anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Só criar novo intervalo se não estiver pausado
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        goToNext();
      }, speed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [speed, analysts.length, goToNext, isPaused]);

  // Ir para um índice específico (usa animação de avanço)
  const goToIndex = (index: number) => {
    if (index === currentIndex || animationPhase !== 'idle') return;
    
    // Determinar direção baseada no índice
    const isForward = index > currentIndex || (currentIndex === analysts.length - 1 && index === 0);
    
    if (isForward) {
      setAnimationPhase('exit-right');
      setTimeout(() => {
        setDisplayIndex(index);
        setAnimationPhase('behind');
      }, 300);
      setTimeout(() => {
        setAnimationPhase('enter-left');
      }, 350);
    } else {
      setAnimationPhase('exit-left');
      setTimeout(() => {
        setDisplayIndex(index);
        setAnimationPhase('behind');
      }, 300);
      setTimeout(() => {
        setAnimationPhase('enter-right');
      }, 350);
    }
    
    setTimeout(() => {
      setCurrentIndex(index);
      setAnimationPhase('idle');
    }, 700);
  };

  // Handlers de mouse para pausar/retomar
  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  if (analysts.length === 0) return null;

  const currentAnalyst = analysts[displayIndex];

  // Tamanhos reduzidos para visual mais discreto
  const displaySize = Math.min(imageSize, 100); // Limitar tamanho máximo

  // Determinar classes de animação baseado na fase
  const getAnimationClasses = () => {
    switch (animationPhase) {
      case 'exit-right':
        return 'opacity-0 translate-x-20 scale-90'; // Sai pela direita
      case 'exit-left':
        return 'opacity-0 -translate-x-20 scale-90'; // Sai pela esquerda
      case 'behind':
        return 'opacity-0 scale-75'; // Por trás (invisível e menor)
      case 'enter-left':
        return 'opacity-100 translate-x-0 scale-100'; // Entrando pela esquerda (animação de volta)
      case 'enter-right':
        return 'opacity-100 translate-x-0 scale-100'; // Entrando pela direita (animação de volta)
      default:
        return 'opacity-100 translate-x-0 scale-100'; // Idle
    }
  };

  // Determinar transform origin para efeito de rotação
  const getTransformStyle = () => {
    if (animationPhase === 'behind') {
      return {
        transitionDuration: '50ms',
        transform: 'scale(0.75) translateY(10px)',
      };
    }
    if (animationPhase === 'enter-left') {
      return {
        transitionDuration: '350ms',
        transform: 'translateX(0) scale(1)',
      };
    }
    if (animationPhase === 'enter-right') {
      return {
        transitionDuration: '350ms',
        transform: 'translateX(0) scale(1)',
      };
    }
    return {
      transitionDuration: '300ms',
    };
  };

  return (
    <TooltipProvider>
      <div 
        className="mt-5 sm:mt-7"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Título discreto */}
        <div className="flex items-center justify-center gap-2.5 mb-3.5">
          <div className="h-px bg-white/15 flex-1 max-w-[35px] sm:max-w-[55px]"></div>
          <span className="text-white/50 text-[10px] sm:text-xs font-medium uppercase tracking-widest">
            Conselheiros
          </span>
          <div className="h-px bg-white/15 flex-1 max-w-[35px] sm:max-w-[55px]"></div>
        </div>

        {/* Container do carrossel - mais compacto */}
        <div 
          className="relative flex items-center justify-center"
          style={{ minHeight: displaySize + 45, perspective: '500px' }}
        >
          {/* Seta esquerda - mais discreta */}
          <button
            onClick={goToPrev}
            disabled={animationPhase !== 'idle'}
            className={`absolute z-10 p-1.5 rounded-full transition-all duration-300 ${
              animationPhase !== 'idle' 
                ? 'opacity-0 cursor-not-allowed' 
                : 'opacity-40 hover:opacity-80 cursor-pointer hover:bg-white/10'
            }`}
            style={{ 
              left: `calc(50% - ${displaySize * 0.9}px)`,
              top: '40%',
              transform: 'translateY(-50%)',
            }}
            aria-label="Conselheiro anterior"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
          </button>

          {/* Conselheiro atual (central) - com animação circular e tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className={`flex flex-col items-center cursor-pointer group transition-all ease-out ${getAnimationClasses()}`}
                style={getTransformStyle()}
                onClick={() => onCounselorClick(currentAnalyst.id)}
              >
                {/* Foto - borda mais sutil */}
                <div className="relative">
                  <div 
                    className={`rounded-full overflow-hidden shadow-lg transition-all duration-300 group-hover:scale-105 ${
                      isPaused 
                        ? 'border-2 border-[var(--fgv-aux-yellow-2)]/60' 
                        : 'border-2 border-white/30 group-hover:border-white/50'
                    }`}
                    style={{ 
                      width: displaySize, 
                      height: displaySize,
                    }}
                  >
                    <img 
                      src={currentAnalyst.portrait} 
                      alt={currentAnalyst.name}
                      className="w-full h-full object-cover transition-all duration-300 grayscale"
                      style={{ objectPosition: currentAnalyst.objectPosition }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-counselor.png';
                      }}
                    />
                  </div>
                  {/* Bandeira - menor */}
                  <div 
                    className="absolute -bottom-0.5 -right-0.5"
                    style={{ fontSize: Math.max(18, displaySize * 0.2) }}
                  >
                    {currentAnalyst.flag}
                  </div>
                </div>

                {/* Nome completo - fonte menor */}
                <span className={`mt-1.5 text-xs sm:text-sm font-medium text-center transition-colors whitespace-nowrap ${
                  isPaused ? 'text-[var(--fgv-aux-yellow-2)]/90' : 'text-white/80 group-hover:text-white'
                }`}>
                  {currentAnalyst.name}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent 
              side="bottom" 
              className="bg-[var(--fgv-primary-1)] text-white border-[var(--fgv-primary-2)] max-w-xs"
            >
              <p className="text-sm font-medium">{currentAnalyst.theory}</p>
            </TooltipContent>
          </Tooltip>

          {/* Seta direita - mais discreta */}
          <button
            onClick={goToNext}
            disabled={animationPhase !== 'idle'}
            className={`absolute z-10 p-1.5 rounded-full transition-all duration-300 ${
              animationPhase !== 'idle' 
                ? 'opacity-0 cursor-not-allowed' 
                : 'opacity-40 hover:opacity-80 cursor-pointer hover:bg-white/10'
            }`}
            style={{ 
              right: `calc(50% - ${displaySize * 0.9}px)`,
              top: '40%',
              transform: 'translateY(-50%)',
            }}
            aria-label="Próximo conselheiro"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
          </button>
        </div>

        {/* Indicadores de posição - mais discretos e menores */}
        <div className="flex justify-center gap-1.5 mt-1.5">
          {analysts.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              disabled={animationPhase !== 'idle'}
              className={`rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-[var(--fgv-aux-yellow-2)]/70 w-4 h-1.5' 
                  : 'bg-white/20 hover:bg-white/40 w-1.5 h-1.5'
              } ${animationPhase !== 'idle' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              aria-label={`Ver ${analysts[index].name}`}
            />
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
