import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Globe2, 
  Users, 
  FileText, 
  Brain, 
  ArrowRight, 
  Shield, 
  Clock,
  BarChart3,
  Sparkles,
  Search,
  Upload,
  Download,
  Loader2,
  Lightbulb,
  CheckCircle,
  PenTool,
  MessageSquare,
  FileCheck,
  Mail,
  CreditCard,
  LayoutDashboard,
  Settings
} from "lucide-react";
import { useLocation } from "wouter";
import { CounselorCarousel } from "@/components/CounselorCarousel";
import { FeedbackContact } from "@/components/FeedbackContact";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  
  // Contagem de análises para prova social (valor do banco de dados)
  const publicCount = trpc.admin.getPublicCount.useQuery();
  const analysisCount = publicCount.data || { total: 0, completed: 0 };
  
  // Parâmetros do sistema (globo, carimbo, etc.)
  const { data: systemParams } = trpc.admin.getPublicParameters.useQuery();
  
  // Extrair valores dos parâmetros com defaults
  const getParamValue = (key: string, defaultValue: string) => {
    const param = systemParams?.find(p => p.key === key);
    return param?.value || defaultValue;
  };
  
  // Parâmetros do globo
  const globeRotationSpeed = parseFloat(getParamValue('globe_rotation_speed', '0.0013')); // segundos por rotação
  const globeOpacity = parseFloat(getParamValue('globe_opacity', '15')) / 100; // converter % para decimal
  const globeIntensity = parseFloat(getParamValue('globe_intensity', '100')) / 100; // converter % para decimal
  const globeSize = parseFloat(getParamValue('globe_size', '100')) / 100; // converter % para decimal
  const globeCenterX = parseFloat(getParamValue('globe_center_x', '25')); // % de deslocamento horizontal
  const globeCenterY = parseFloat(getParamValue('globe_center_y', '50')); // % de deslocamento vertical
  
  // Parâmetros da logo e título
  const logoHeight = parseFloat(getParamValue('logo_height', '80')); // altura em pixels
  const logoPositionX = parseFloat(getParamValue('logo_position_x', '0')); // deslocamento horizontal em pixels
  const logoPositionY = parseFloat(getParamValue('logo_position_y', '0')); // deslocamento vertical em pixels
  const titleFontSize = parseFloat(getParamValue('title_font_size', '50')); // tamanho da fonte em pixels
  
  // Parâmetros do carrossel de conselheiros
  const carouselImageSize = parseInt(getParamValue('carousel_image_size', '80')); // tamanho da imagem em pixels
  const carouselSpeed = parseInt(getParamValue('carousel_speed', '5000')); // velocidade em milissegundos
  
  // Parâmetros de posição do bloco esquerdo
  const heroLeftOffsetX = parseFloat(getParamValue('hero_left_offset_x', '0')); // deslocamento horizontal em pixels
  const heroLeftOffsetY = parseFloat(getParamValue('hero_left_offset_y', '-70')); // deslocamento vertical em pixels
  
  // Parallax e fade effect state
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Efeito de parallax no scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Calcular opacidade e transformação baseado no scroll
  const heroOpacity = Math.max(0, 1 - scrollY / 600);
  const heroTranslateY = scrollY * 0.3;
  const heroScale = Math.max(0.9, 1 - scrollY / 3000);
  
  // Email validation state
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [email, setEmail] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const validateEmail = trpc.users.validateEmail.useMutation();

  // Intersection Observer para detectar quando a galeria entra na viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsGalleryVisible(true);
            observer.disconnect(); // Desconecta após a primeira animação
          }
        });
      },
      { threshold: 0.2 } // Dispara quando 20% da seção está visível
    );

    if (galleryRef.current) {
      observer.observe(galleryRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/analysis/new");
    } else {
      setShowEmailDialog(true);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      toast.error("Digite seu email");
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Digite um email válido");
      return;
    }
    
    setIsValidating(true);
    try {
      const result = await validateEmail.mutateAsync({ email: email.trim() });
      
      if (result.valid) {
        toast.success(result.message);
        setShowEmailDialog(false);
        // Store email in localStorage for session
        localStorage.setItem('userEmail', email.trim().toLowerCase());
        if (result.user) {
          localStorage.setItem('userData', JSON.stringify(result.user));
        }
        navigate("/analysis/new");
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao validar email");
    } finally {
      setIsValidating(false);
    }
  };

  // Buscar conselheiros do banco de dados
  const { data: counselorsData, isLoading: loadingCounselors } = trpc.counselors.listActive.useQuery();
  
  // Mapear dados do banco para formato da galeria
  const analysts = (counselorsData || []).map(c => {
    // Determinar bandeira baseada na nacionalidade
    const getFlag = (nationality: string | null) => {
      if (!nationality) return '🇺🇳';
      const nat = nationality.toLowerCase();
      if (nat.includes('britânico') || nat.includes('british')) return '🇬🇧';
      if (nat.includes('americano') || nat.includes('american')) return '🇺🇸';
      if (nat.includes('brasileiro') || nat.includes('brazilian')) return '🇧🇷';
      if (nat.includes('alemão') || nat.includes('german')) return '🇩🇪';
      if (nat.includes('francês') || nat.includes('french')) return '🇫🇷';
      if (nat.includes('russo') || nat.includes('russian')) return '🇷🇺';
      if (nat.includes('chinês') || nat.includes('chinese')) return '🇨🇳';
      return '🇺🇳';
    };
    
    // Determinar escola baseada na nacionalidade
    const getSchool = (nationality: string | null) => {
      if (!nationality) return { name: 'Internacional', color: '#5C5B5F' };
      const nat = nationality.toLowerCase();
      if (nat.includes('britânico')) return { name: 'Clássica', color: '#5C5B5F' };
      if (nat.includes('americano')) return { name: 'Americana', color: '#008BC9' };
      if (nat.includes('brasileiro')) return { name: 'Brasileira', color: '#2B8671' };
      return { name: 'Internacional', color: '#5C5B5F' };
    };
    
    const school = getSchool(c.nationality);
    const keyPhrases = c.keyPhrases as string[] | null;
    
    // Definir objectPosition personalizado para cada conselheiro
    const getObjectPosition = (counselorId: string) => {
      const positions: Record<string, string> = {
        'hitler': 'center 20%',
        'meira-mattos': 'center 15%',
        'kissinger': 'center 20%',
        'golbery': 'center 15%',
      };
      return positions[counselorId] || 'center';
    };
    
    return {
      id: c.counselorId,
      name: c.shortName || c.name,
      fullName: c.name,
      theory: c.mainTheory || '',
      flag: getFlag(c.nationality),
      portrait: c.homePhotoUrl || c.photoUrl || `/${c.counselorId}-gallery.png`,
      colorPortrait: c.bioPhotoUrl || c.photoUrl || `/${c.counselorId}-profile.png`,
      objectPosition: getObjectPosition(c.counselorId),
      school: school.name,
      schoolColor: school.color,
      quote: keyPhrases?.[0] || c.shortBio || '',
      isActive: c.isActive,
      unavailabilityText: c.unavailabilityText,
    };
  });

  const features = [
    {
      icon: Brain,
      title: "Sistema multiagentes",
      description: "Renomados especialistas em Geopolítica com perspectivas teóricas distintas debatem para gerar análises profundas e multifacetadas."
    },
    {
      icon: Search,
      title: "Fontes diversificadas",
      description: "Integre os conhecimentos de nossos Conselheiros com documentos, textos acadêmicos, notícias, vídeos e páginas web para fundamentar suas análises."
    },
    {
      icon: FileText,
      title: "Relatórios profissionais",
      description: "Exporte análises prontas para apresentação."
    },
    {
      icon: Clock,
      title: "Acompanhamento em tempo real",
      description: "Acompanhe de perto cada etapa do processo."
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section com Header integrado */}
      <section id="hero" className="bg-fgv-gradient text-white min-h-screen flex flex-col relative overflow-hidden">
        {/* Globo decorativo de fundo com efeito parallax e rotação - tamanho e posição configuráveis */}
        {/* Oculto em mobile (hidden) e visível a partir de md (md:block) */}
        <div 
          className="absolute right-0 top-1/2 pointer-events-none hidden md:block"
          style={{ 
            width: `${910 * globeSize}px`,
            height: `${910 * globeSize}px`,
            transform: `translateX(calc(${globeCenterX}% + 3rem)) translateY(calc(-${globeCenterY}% + 3rem + ${scrollY * 0.15}px))`,
          }}
        >
          {/* Imagem do globo - opacidade, velocidade, tamanho e intensidade configuráveis */}
          <img 
            src="/globe-network-v2.png" 
            alt="" 
            className="w-full h-full object-contain"
            style={{ 
              opacity: globeOpacity,
              animation: `globe-rotate ${Math.round(1 / globeRotationSpeed)}s linear infinite`,
              filter: `brightness(${globeIntensity})`
            }}
            aria-hidden="true"
          />
          {/* Linhas de conexão entre os nós - SVG animado - sincronizado com parâmetros do globo */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none" 
            aria-hidden="true"
            style={{
              opacity: globeOpacity * 1.5, // Linhas um pouco mais visíveis que o globo
              filter: `brightness(${globeIntensity})`,
              animation: `globe-rotate ${Math.round(1 / globeRotationSpeed)}s linear infinite`
            }}
          >
            {/* Linhas conectando nós - sincronizadas com animações dos nós */}
            {/* Grupo 1: Conexões do nó pulse-1 */}
            <line x1="35%" y1="25%" x2="45%" y2="30%" className="animate-line-pulse-1" stroke="var(--fgv-aux-yellow-1)" strokeWidth={Math.max(1, 1 * globeSize)} />
            <line x1="35%" y1="25%" x2="55%" y2="40%" className="animate-line-pulse-1" stroke="var(--fgv-aux-orange-1)" strokeWidth={Math.max(1, 1 * globeSize)} />
            <line x1="65%" y1="35%" x2="55%" y2="40%" className="animate-line-pulse-1" stroke="var(--fgv-aux-yellow-2)" strokeWidth={Math.max(1, 1 * globeSize)} />
            <line x1="65%" y1="35%" x2="60%" y2="55%" className="animate-line-pulse-1" stroke="var(--fgv-aux-orange-1)" strokeWidth={Math.max(1, 1 * globeSize)} />
            
            {/* Grupo 2: Conexões do nó pulse-2 */}
            <line x1="55%" y1="40%" x2="50%" y2="45%" className="animate-line-pulse-2" stroke="var(--fgv-aux-orange-2)" strokeWidth={Math.max(1, 1 * globeSize)} />
            <line x1="55%" y1="40%" x2="40%" y2="60%" className="animate-line-pulse-2" stroke="var(--fgv-aux-yellow-1)" strokeWidth={Math.max(1, 1 * globeSize)} />
            <line x1="60%" y1="55%" x2="50%" y2="45%" className="animate-line-pulse-2" stroke="var(--fgv-aux-orange-1)" strokeWidth={Math.max(1, 1 * globeSize)} />
            <line x1="35%" y1="50%" x2="40%" y2="60%" className="animate-line-pulse-2" stroke="var(--fgv-aux-yellow-2)" strokeWidth={Math.max(1, 1 * globeSize)} />
            
            {/* Grupo 3: Conexões do nó pulse-3 */}
            <line x1="40%" y1="60%" x2="50%" y2="70%" className="animate-line-pulse-3" stroke="var(--fgv-aux-yellow-1)" strokeWidth={Math.max(1, 1 * globeSize)} />
            <line x1="50%" y1="45%" x2="35%" y2="50%" className="animate-line-pulse-3" stroke="var(--fgv-aux-orange-2)" strokeWidth={Math.max(1, 1 * globeSize)} />
            <line x1="50%" y1="70%" x2="55%" y2="65%" className="animate-line-pulse-3" stroke="var(--fgv-aux-orange-1)" strokeWidth={Math.max(1, 1 * globeSize)} />
            <line x1="55%" y1="65%" x2="60%" y2="55%" className="animate-line-pulse-3" stroke="var(--fgv-aux-yellow-2)" strokeWidth={Math.max(1, 1 * globeSize)} />
          </svg>
          
          {/* Nós iluminados em amarelo/laranja - posicionados sobre o globo - sincronizados com parâmetros */}
          <div 
            className="absolute inset-0 pointer-events-none" 
            aria-hidden="true"
            style={{
              opacity: Math.min(1, globeOpacity * 2), // Nós mais visíveis que o globo
              filter: `brightness(${globeIntensity})`,
              animation: `globe-rotate ${Math.round(1 / globeRotationSpeed)}s linear infinite`
            }}
          >
            {/* Nós com animação de pulso em amarelo/laranja - tamanho proporcional ao globo */}
            <div className="absolute rounded-full animate-node-pulse-1" style={{ top: '25%', left: '35%', width: `${12 * globeSize}px`, height: `${12 * globeSize}px` }} />
            <div className="absolute rounded-full animate-node-pulse-2" style={{ top: '40%', left: '55%', width: `${10 * globeSize}px`, height: `${10 * globeSize}px` }} />
            <div className="absolute rounded-full animate-node-pulse-3" style={{ top: '60%', left: '40%', width: `${12 * globeSize}px`, height: `${12 * globeSize}px` }} />
            <div className="absolute rounded-full animate-node-pulse-1" style={{ top: '35%', left: '65%', width: `${10 * globeSize}px`, height: `${10 * globeSize}px` }} />
            <div className="absolute rounded-full animate-node-pulse-2" style={{ top: '55%', left: '60%', width: `${12 * globeSize}px`, height: `${12 * globeSize}px` }} />
            <div className="absolute rounded-full animate-node-pulse-3" style={{ top: '70%', left: '50%', width: `${10 * globeSize}px`, height: `${10 * globeSize}px` }} />
            <div className="absolute rounded-full animate-node-pulse-1" style={{ top: '30%', left: '45%', width: `${12 * globeSize}px`, height: `${12 * globeSize}px` }} />
            <div className="absolute rounded-full animate-node-pulse-2" style={{ top: '50%', left: '35%', width: `${10 * globeSize}px`, height: `${10 * globeSize}px` }} />
            <div className="absolute rounded-full animate-node-pulse-3" style={{ top: '45%', left: '50%', width: `${8 * globeSize}px`, height: `${8 * globeSize}px` }} />
            <div className="absolute rounded-full animate-node-pulse-1" style={{ top: '65%', left: '55%', width: `${10 * globeSize}px`, height: `${10 * globeSize}px` }} />
          </div>
        </div>
        {/* Header fixo no topo */}
        <header className="sticky top-0 z-50 bg-gradient-to-b from-[var(--fgv-primary-1)] to-transparent pt-9 pb-2">
          <div className="container flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="https://dint.fgv.br/" target="_blank" rel="noopener noreferrer">
                <img 
                  src="/fgv-logo.png" 
                  alt="FGV Diretoria Internacional" 
                  className="object-contain brightness-0 invert"
                  style={{ 
                    height: `${logoHeight}px`,
                    transform: `translate(${logoPositionX}px, ${logoPositionY}px)`
                  }}
                />
              </a>
            </div>
          </div>
        </header>

        {/* Conteúdo do Hero com efeito parallax - posição configurável */}
        <div 
          ref={heroRef}
          className="flex-1 flex items-center py-12 sm:py-16 md:py-20 transition-all duration-100"
          style={{
            opacity: heroOpacity,
            transform: `translateX(${heroLeftOffsetX}px) translateY(${heroTranslateY + heroLeftOffsetY}px) scale(${heroScale})`,
          }}
        >
        <div className="container px-4 sm:px-4 sm:pr-[300px] md:pr-[350px] lg:pr-[400px] xl:pr-[450px]">
          <div className="flex items-center gap-8">
            {/* Conteúdo de texto - lado esquerdo - expandido horizontalmente */}
            <div className="flex-1 max-w-5xl">
              {/* Eyebrow text com badge BETA alinhado */}
              <div 
                className="inline-flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-sm mb-3 sm:mb-3.5 animate-hero-fade-slide-right"
                style={{ animationDelay: '0.2s' }}
              >
                <span className="text-[9px] sm:text-xs font-medium tracking-wide uppercase leading-tight">Sistema Multiagente de Inteligência Artificial Generativa da Fundação Getulio Vargas</span>
                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold bg-[var(--fgv-aux-yellow-2)] text-[var(--fgv-primary-1)] shadow-lg animate-pulse whitespace-nowrap">
                  BETA
                </span>
              </div>
              
              {/* Título principal - com animação de entrada elegante - tamanho configurável */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 mb-2 sm:mb-3.5 animate-hero-fade-slide-up" style={{ animationDelay: '0.3s' }}>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-fgv-light leading-tight sm:whitespace-nowrap" style={{ fontSize: window.innerWidth < 640 ? 'clamp(1.5rem, 6vw, 2rem)' : `${titleFontSize}px` }}>
                  Conselho IA de Geopolítica da FGV
                </h1>
              </div>
              
              {/* Subtítulo com destaque - com animação de entrada elegante */}
              <p 
                className="text-sm sm:text-xl md:text-2xl mb-2 sm:mb-3.5 font-light text-[var(--fgv-aux-yellow-2)] animate-hero-fade-slide-up"
                style={{ animationDelay: '0.4s' }}
              >
                Análises geopolíticas exclusivas
              </p>
              
              {/* Descrição em dois parágrafos - com animação de entrada elegante */}
              <div 
                className="text-xs sm:text-base md:text-lg text-white/80 mb-4 sm:mb-7 md:mb-9 animate-hero-blur-fade leading-relaxed space-y-2 sm:space-y-3.5"
                style={{ animationDelay: '0.5s' }}
              >
                <p>
                  Obtenha análises geopolíticas estruturadas com rigor acadêmico e qualidade FGV. Nosso sistema multiagente reúne grandes pensadores em um debate conduzido pelo GennovAIs, avatar do General Novaes.
                </p>
                <p className="text-white/70">
                  Submeta sua proposta, selecione os conselheiros e acompanhe a discussão. Ao final, Max Weber consolida as perspectivas em um relatório exclusivo. Na versão beta, o processo é gratuito.
                </p>
              </div>
              
              {/* Contador de análises - prova social */}
              {analysisCount && analysisCount.total > 0 && (
                <div 
                  className="flex flex-row items-center gap-3 sm:gap-5 mb-3 sm:mb-7 -mt-1 sm:-mt-3.5 animate-hero-fade-slide-up"
                  style={{ animationDelay: '0.55s' }}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 text-white/90">
                    <BarChart3 className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[var(--fgv-aux-yellow-2)]" />
                    <span className="text-xs sm:text-lg font-semibold">{analysisCount.total}</span>
                    <span className="text-white/70 text-[10px] sm:text-base">propostas submetidas</span>
                  </div>
                  {analysisCount.completed > 0 && (
                    <div className="flex items-center gap-1.5 sm:gap-2 text-white/90">
                      <CheckCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-green-400" />
                      <span className="text-xs sm:text-lg font-semibold">{analysisCount.completed}</span>
                      <span className="text-white/70 text-[10px] sm:text-base">análises concluídas</span>
                    </div>
                  )}
                </div>
              )}
            
            {/* Botões com animação de entrada escalonada e elegante */}
            <div className="flex flex-col items-start gap-2 sm:gap-2.5 animate-hero-fade-slide-up" style={{ animationDelay: '0.65s' }}>
              {/* Primeira linha de botões */}
              <div className="flex flex-wrap gap-1.5 sm:gap-1.5">
                <Button 
                  size="sm"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 font-medium px-2.5 sm:px-5 py-1.5 sm:py-2.5 text-[11px] sm:text-sm transition-all duration-300 hover:scale-105 h-auto min-h-[32px] sm:min-h-[38px]"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Como funciona
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 font-medium px-2.5 sm:px-5 py-1.5 sm:py-2.5 text-[11px] sm:text-sm transition-all duration-300 hover:scale-105 h-auto min-h-[32px] sm:min-h-[38px]"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Recursos
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 font-medium px-2.5 sm:px-5 py-1.5 sm:py-2.5 text-[11px] sm:text-sm transition-all duration-300 hover:scale-105 h-auto min-h-[32px] sm:min-h-[38px]"
                  onClick={() => document.getElementById('analysts')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Conselheiros
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 font-medium px-2.5 sm:px-5 py-1.5 sm:py-2.5 text-[11px] sm:text-sm transition-all duration-300 hover:scale-105 h-auto min-h-[32px] sm:min-h-[38px]"
                  onClick={() => navigate('/coordination')}
                >
                  Coordenação
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="sm"
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10 font-medium px-2.5 sm:px-5 py-1.5 sm:py-2.5 text-[11px] sm:text-sm cursor-default h-auto min-h-[32px] sm:min-h-[38px]"
                        onClick={(e) => e.preventDefault()}
                      >
                        Preços
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-green-600 text-white border-green-700">
                      <p>Gratuito durante o beta</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {/* Botão Configurações - apenas para administradores */}
                {user?.role === 'administrador' && (
                  <Button 
                    size="sm"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 font-medium px-2.5 sm:px-5 py-1.5 sm:py-2.5 text-[11px] sm:text-sm transition-all duration-300 hover:scale-105 h-auto min-h-[32px] sm:min-h-[38px]"
                    onClick={() => navigate('/admin')}
                  >
                    <Settings className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                    Configurações
                  </Button>
                )}
              </div>
              {/* Botões principais em linha separada, alinhados à esquerda */}
              <div className="flex flex-wrap gap-2 sm:gap-2.5 mt-1.5 sm:mt-1">
                {/* Botão Seu Dashboard */}
                {isAuthenticated && (
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="font-semibold px-3 sm:px-6 py-2 sm:py-2.5 text-[11px] sm:text-sm border-white/50 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 h-auto min-h-[36px] sm:min-h-[40px]"
                  >
                    <LayoutDashboard className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Seu dashboard</span>
                    <span className="sm:hidden">Dashboard</span>
                  </Button>
                )}
                {/* Botão Apresente sua proposta */}
                <Button 
                  size="sm"
                  onClick={handleGetStarted}
                  className="btn-fgv-gold px-4 sm:px-7 py-2 sm:py-2.5 text-[11px] sm:text-sm shadow-lg h-auto min-h-[36px] sm:min-h-[40px]"
                >
                  <span className="hidden sm:inline">Apresente uma proposta de análise</span>
                  <span className="sm:hidden">Nova proposta</span>
                  <ArrowRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
              
              {/* Carrossel de Conselheiros - Um por vez com transição */}
              {analysts.filter(a => a.isActive).length > 0 && (
                <CounselorCarousel 
                  analysts={analysts.filter(a => a.isActive)}
                  imageSize={carouselImageSize}
                  speed={carouselSpeed}
                  onCounselorClick={(id) => navigate(`/counselor/${id}`)}
                />
              )}
            </div>
            </div>
            

          </div>
        </div>
        </div>
        
        {/* Espaço inferior da hero */}
        <div className="pb-12 sm:pb-16 md:pb-20"></div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-16" style={{ backgroundColor: '#f8f8f8' }}>
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--fgv-primary-1)' }}>
              Como funciona
            </h2>
            <p className="text-lg text-[var(--fgv-secondary-1)] max-w-2xl mx-auto">
              Sete passos para obter uma análise geopolítica profissional
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6 lg:gap-2 relative">
            {/* Linha conectora entre os passos - apenas em desktop */}
            <div className="hidden lg:block absolute top-6 left-[8%] right-[8%] h-0.5 bg-[var(--fgv-primary-3)] opacity-30" />
            
            {[
              { step: 1, title: "Proposta de Pesquisa", desc: "Título, objetivo e contexto", icon: Lightbulb, badge: null },
              { step: 2, title: "Avaliação", desc: "GennovAIs emite parecer", icon: CheckCircle, badge: null },
              { step: 3, title: "Estruturação", desc: "GennovAIs propõe estrutura", icon: PenTool, badge: null },
              { step: 4, title: "Conselheiros", desc: "Escolha os especialistas", icon: Users, badge: null },
              { step: 5, title: "Pagamento", desc: "Confirme para iniciar", icon: CreditCard, badge: "Gratuito" },
              { step: 6, title: "Sessão do Conselho", desc: "Debate dos Conselheiros", icon: MessageSquare, badge: null },
              { step: 7, title: "Relatório Final", desc: "Consolidação das análises", icon: FileCheck, badge: null },
            ].map((item, index) => (
              <div key={item.step} className="text-center relative z-10 p-4 bg-white/50 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="relative inline-block">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-[var(--fgv-primary-2)] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
                    <item.icon className="w-6 h-6 lg:w-7 lg:h-7" />
                  </div>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="text-xs text-[var(--fgv-primary-3)] font-semibold mb-1">Passo {item.step}</div>
                <h3 className="font-bold text-[var(--fgv-primary-1)] mb-1 text-sm lg:text-base leading-tight">{item.title}</h3>
                <p className="text-xs lg:text-sm text-[var(--fgv-secondary-2)] leading-tight">{item.desc}</p>
              </div>
            ))}
          </div>
          
          {/* Link to Methodology */}
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              onClick={() => navigate("/method")}
              className="border-[var(--fgv-primary-2)] text-[var(--fgv-primary-2)] hover:bg-[var(--fgv-primary-2)] hover:text-white"
            >
              <Brain className="w-4 h-4 mr-2" />
              Conheça o método completo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--fgv-primary-2)' }}>
              Recursos
            </h2>
            <p className="text-lg text-[var(--fgv-secondary-1)] max-w-2xl mx-auto">
              Ferramentas avançadas para análises geopolíticas
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-[var(--fgv-secondary-4)] hover:border-[var(--fgv-primary-3)] transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-[var(--fgv-primary-2)] flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-[var(--fgv-primary-1)]">{feature.title}</h3>
                  <p className="text-[var(--fgv-secondary-1)]">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Trust Signals */}
          <div className="mt-12 pt-8 border-t border-[var(--fgv-secondary-4)]">
            <div className="flex flex-wrap justify-center items-center gap-8 text-[var(--fgv-secondary-2)]">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[var(--fgv-primary-3)]" />
                <span className="text-sm font-medium">Dados protegidos</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-[var(--fgv-primary-3)]" />
                <span className="text-sm font-medium">Fontes verificadas</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[var(--fgv-primary-3)]" />
                <span className="text-sm font-medium">Desenvolvido pela FGV</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analysts Gallery Section */}
      <section id="analysts" className="py-20 bg-[var(--fgv-secondary-3)]" ref={galleryRef}>
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--fgv-primary-1)]">
              Nossos Conselheiros
            </h2>
            <p className="text-lg text-[var(--fgv-secondary-1)] max-w-2xl mx-auto">
              Grandes pensadores geopolíticos com perspectivas teóricas distintas 
              colaboram para enriquecer cada análise
            </p>
          </div>
          
          {/* Portrait Gallery - Grayscale with FGV Gray */}
          {loadingCounselors ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-[var(--fgv-secondary-2)] rounded-lg" />
                </div>
              ))}
            </div>
          ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {analysts.map((analyst, index) => (
              <div 
                key={analyst.id} 
                className={`group cursor-pointer transition-all duration-700 ease-out ${
                  isGalleryVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-12'
                }`}
                style={{ 
                  transitionDelay: isGalleryVisible ? `${index * 150}ms` : '0ms'
                }}
                onClick={() => navigate(`/conselheiro/${analyst.id}`)}
              >
                {/* Portrait Frame */}
                <div className={`relative overflow-hidden rounded-lg bg-[var(--fgv-secondary-2)] shadow-xl transition-all duration-300 ${analyst.isActive ? 'group-hover:shadow-2xl group-hover:scale-105' : 'opacity-70'}`}>
                  {/* Tarja de indisponibilidade para conselheiros desabilitados */}
                  {!analyst.isActive && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 rotate-[-30deg]">
                      <div className="bg-red-600/90 text-white px-6 py-1.5 text-sm font-bold tracking-wider shadow-lg border-2 border-red-700 whitespace-nowrap">
                        {analyst.unavailabilityText || 'INATIVO'}
                      </div>
                    </div>
                  )}
                  
                  {/* Decorative Frame Border */}
                  <div className="absolute inset-0 border-4 border-[var(--fgv-secondary-1)]/30 rounded-lg pointer-events-none z-10" />
                  
                  {/* Portrait Image - Grayscale to Color on Hover */}
                  <div className="aspect-square overflow-hidden relative">
                    {/* Imagem em preto e branco (base) */}
                    <img 
                      src={analyst.portrait} 
                      alt={analyst.fullName}
                      className="w-full h-full object-cover grayscale contrast-110 brightness-90 absolute inset-0 transition-opacity duration-500 group-hover:opacity-0"
                      style={{ objectPosition: analyst.objectPosition }}
                    />
                    {/* Imagem colorida (revelada no hover) */}
                    <img 
                      src={analyst.colorPortrait} 
                      alt={analyst.fullName}
                      className="w-full h-full object-cover opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
                      style={{ objectPosition: analyst.objectPosition }}
                    />
                    
                    {/* Quote Overlay on Hover - apenas para conselheiros ativos */}
                    {analyst.isActive && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center p-4 z-20">
                        <p className="text-white text-xs italic text-center leading-relaxed">
                          "{analyst.quote}"
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Name Plate */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--fgv-secondary-1)] via-[var(--fgv-secondary-1)]/90 to-transparent p-4 pt-8 z-30">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="text-sm">{analyst.flag}</span>
                    </div>
                    <h3 className="font-bold text-white text-center text-sm">{analyst.name}</h3>
                    <p className="text-xs text-white/70 text-center">{analyst.theory}</p>
                  </div>
                </div>
                
                {/* Hover Indicator */}
                <p className="text-xs text-white/50 text-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver perfil completo
                </p>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Coordination Section */}
      <section id="coordination" className="py-16 bg-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--fgv-primary-2)' }}>
            A Coordenação
          </h2>
          <p className="text-lg text-[var(--fgv-secondary-1)] max-w-2xl mx-auto mb-8">
            Conheça a equipe responsável pela coordenação do Conselho IA de Geopolítica da FGV
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate("/coordination")}
            className="border-[var(--fgv-primary-2)] text-[var(--fgv-primary-2)] hover:bg-[var(--fgv-primary-2)] hover:text-white"
          >
            <Users className="w-4 h-4 mr-2" />
            Coordenadores
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[var(--fgv-primary-1)]">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-fgv-light">
            Pronto para começar?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Acesse e produza análises geopolíticas de qualidade acadêmica 
            com o suporte da Inteligência Artificial Generativa multiagentes da FGV.
          </p>
          <Button 
            size="lg"
            onClick={handleGetStarted}
            className="btn-fgv-gold px-8"
          >
            Apresente sua proposta de análise
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Feedback Contact */}
      <FeedbackContact />

      {/* Footer */}
      <footer className="bg-[var(--fgv-primary-1)] border-t-0 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <a href="https://dint.fgv.br/" target="_blank" rel="noopener noreferrer">
                <img 
                  src="/fgv-logo.png" 
                  alt="FGV" 
                  className="h-16 object-contain brightness-0 invert mb-4"
                />
              </a>
              <p className="text-white/70 text-sm max-w-md">
                Sistema de análise geopolítica com IA Generativa desenvolvido pela Diretoria Internacional 
                da Fundação Getulio Vargas.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4"></h4>
              <ul className="space-y-2">
                <li>
                  <a href="/about" className="text-white/70 hover:text-white text-sm transition-colors">
                    Sobre o Conselho
                  </a>
                </li>
                <li>
                  <a href="/method" className="text-white/70 hover:text-white text-sm transition-colors">
                    Sobre o método
                  </a>
                </li>
                <li>
                  <a href="/coordination" className="text-white/70 hover:text-white text-sm transition-colors">
                    Sobre a coordenação
                  </a>
                </li>
                <li>
                  <a href="/faq" className="text-white/70 hover:text-white text-sm transition-colors">
                    Perguntas frequentes
                  </a>
                </li>
              </ul>
            </div>
            <div style={{height: '140px'}}>
              <h4 className="text-white font-semibold mb-4"></h4>
              <ul className="space-y-2">
                <li>
                  <a href="/contact" className="text-white/70 hover:text-white text-sm transition-colors">
                    Fale conosco
                  </a>
                </li>

              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/60 text-sm">
              © 2026 Diretoria Internacional da Fundação Getulio Vargas. Todos os direitos reservados.
            </p>

          </div>
        </div>
      </footer>

      {/* Email Validation Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[var(--fgv-primary-2)]" />
              Acesso ao Sistema
            </DialogTitle>
            <DialogDescription>
              Digite seu email cadastrado para acessar o sistema de análise geopolítica.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
                disabled={isValidating}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Não tem acesso? Entre em contato com a coordenação do Conselho para solicitar um convite.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)} disabled={isValidating}>
              Cancelar
            </Button>
            <Button 
              onClick={handleEmailSubmit} 
              disabled={isValidating}
              className="bg-[var(--fgv-primary-2)] hover:bg-[var(--fgv-primary-1)]"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                'Acessar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
