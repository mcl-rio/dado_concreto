import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Brain, 
  Users, 
  MessageSquare, 
  FileCheck, 
  Workflow,
  Globe2,
  Anchor,
  Map,
  Scale,
  Shield,
  Target,
  Sparkles,
  ArrowRight,
  Loader2
} from "lucide-react";
import { useLocation } from "wouter";
import Breadcrumbs from "@/components/Breadcrumbs";
import { GlobeBackground } from "@/components/GlobeBackground";
import { trpc } from "@/lib/trpc";

const processSteps = [
  {
    step: 1,
    title: "Proposta de Pesquisa",
    description: "O usuário submete sua proposta de análise geopolítica, definindo título, objetivo, contexto e anexando fontes relevantes.",
    icon: FileCheck
  },
  {
    step: 2,
    title: "Avaliação pelo GennovAIs",
    description: "O GennovAIs, Coordenador do Conselho e avatar do GennovAIs, avalia a proposta e emite um parecer sobre sua viabilidade.",
    icon: Brain
  },
  {
    step: 3,
    title: "Estruturação do Projeto",
    description: "Se aprovada, o GennovAIs propõe uma estrutura para o projeto de análise, que pode ser ajustada pelo usuário.",
    icon: Workflow
  },
  {
    step: 4,
    title: "Escolha dos Conselheiros",
    description: "O usuário seleciona os Conselheiros que participarão da análise, escolhendo entre os especialistas disponíveis com diferentes perspectivas teóricas.",
    icon: Users
  },
  {
    step: 5,
    title: "Pagamento",
    description: "Confirme sua análise para iniciar o processo. Durante o período beta, todas as análises são gratuitas.",
    icon: Scale,
    badge: "Gratuito"
  },
  {
    step: 6,
    title: "Sessão do Conselho",
    description: "O GennovAIs convoca o Conselho e preside a reunião. Os Conselheiros selecionados debatem exaustivamente o tema sob suas perspectivas teóricas.",
    icon: MessageSquare
  },
  {
    step: 7,
    title: "Relatório Final",
    description: "O GennovAIs ressuscita Max Weber para auxiliar na consolidação das análises em um relatório final exclusivo com padrão FGV.",
    icon: Sparkles
  }
];

// Ícones e cores são definidos dinamicamente com base nos dados do conselheiro
// Ícone padrão: Brain | Cor padrão: #5C5B5F (cinza FGV)
const defaultIcon = Brain;
const defaultColor = '#5C5B5F';

export default function Method() {
  const [, navigate] = useLocation();
  
  // Buscar conselheiros do banco de dados
  const { data: counselorsData, isLoading: loadingCounselors } = trpc.counselors.listActive.useQuery();
  
  // Mapear dados do banco para formato da página
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
    
    const keyContributions = c.keyContributions as string[] | null;
    const areasOfExpertise = c.areasOfExpertise as string[] | null;
    
    return {
      id: c.counselorId,
      name: c.shortName || c.name,
      theory: c.mainTheory || '',
      flag: getFlag(c.nationality),
      icon: defaultIcon,
      color: defaultColor,
      focus: areasOfExpertise?.[0] || c.mainTheory || '',
      description: c.shortBio || '',
      keyQuestion: `Como ${c.shortName || c.name} analisaria esta questão geopolítica?`,
      contributions: Array.isArray(keyContributions) ? keyContributions : (Array.isArray(areasOfExpertise) ? areasOfExpertise : []),
      isActive: c.isActive,
      unavailabilityText: c.unavailabilityText,
    };
  });

  return (
    <div className="min-h-screen bg-[var(--fgv-secondary-5)]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="https://dint.fgv.br/" target="_blank" rel="noopener noreferrer">
            <img 
              src="/fgv-logo.png" 
              alt="FGV Diretoria Internacional" 
              className="h-14 cursor-pointer"
            />
          </a>
          <Button 
            variant="outline" 
            onClick={() => { navigate("/"); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100); }}
            className="border-[var(--fgv-primary-2)] text-[var(--fgv-primary-2)] hover:bg-[var(--fgv-primary-2)] hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: "Método de Análise" }]} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[var(--fgv-primary-1)] via-[var(--fgv-primary-2)] to-[var(--fgv-primary-3)] text-white py-16 relative overflow-hidden">
        <GlobeBackground opacity={15} position="center" size="lg" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6">
            <Brain className="w-5 h-5" />
            <span className="text-sm font-medium">Sistema de IA Multiagente</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-fgv-light">
            Método de Análise
          </h1>
          <p className="text-xl text-[var(--fgv-primary-4)] max-w-3xl mx-auto">
            Conheça como nosso sistema combina múltiplas perspectivas teóricas dos grandes 
            pensadores da geopolítica para produzir análises profundas e multifacetadas
          </p>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-[var(--fgv-primary-1)] mb-6 text-center">
              Visão Geral do Sistema
            </h2>
            <div className="prose prose-lg max-w-none text-[var(--fgv-secondary-1)]">
              <p className="text-lg leading-relaxed mb-6">
                O Conselho IA de Geopolítica da FGV utiliza um sistema de <strong>Inteligência Artificial Generativa multiagente</strong> que 
                simula um conselho de especialistas em geopolítica. Cada agente representa um dos grandes pensadores 
                da geopolítica mundial, aplicando sua escola de pensamento específica para analisar questões contemporâneas.
              </p>
              <p className="text-lg leading-relaxed mb-6">
                Este sistema foi projetado para superar as limitações de análises unidimensionais, oferecendo uma 
                visão <strong>multifacetada e equilibrada</strong> que considera diferentes perspectivas teóricas. O resultado é uma 
                análise mais rica, que identifica fatores que poderiam ser negligenciados por uma única abordagem.
              </p>

            </div>
          </div>
        </div>
      </section>

      {/* Process Flow Section */}
      <section className="py-16 bg-[var(--fgv-secondary-5)]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[var(--fgv-primary-1)] mb-12 text-center">
            Fluxo do Processo de Análise
          </h2>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processSteps.map((step, index) => (
                <Card key={step.step} className="border-none shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[var(--fgv-primary-2)] to-[var(--fgv-primary-3)]" />
                  {'badge' in step && step.badge && (
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                      {step.badge}
                    </span>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--fgv-primary-2)] text-white flex items-center justify-center font-bold">
                        {step.step}
                      </div>
                      <CardTitle className="text-lg text-[var(--fgv-primary-1)]">{step.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[var(--fgv-secondary-2)] text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                  {index < processSteps.length - 1 && index % 3 !== 2 && (
                    <div className="hidden lg:block absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                      <ArrowRight className="w-6 h-6 text-[var(--fgv-primary-3)]" />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Analysts Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[var(--fgv-primary-1)] mb-4 text-center">
            Os Conselheiros Geopolíticos
          </h2>
          <p className="text-lg text-[var(--fgv-secondary-1)] max-w-3xl mx-auto text-center mb-12">
            Cada conselheiro traz uma perspectiva teórica única, enriquecendo a análise com diferentes 
            ângulos de observação e interpretação dos fenômenos geopolíticos
          </p>
          
          {loadingCounselors ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="border-none shadow-lg animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-full bg-gray-200" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded" />
                        <div className="h-3 w-24 bg-gray-200 rounded" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-6 w-20 bg-gray-200 rounded-full mb-4" />
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-gray-200 rounded" />
                      <div className="h-3 w-3/4 bg-gray-200 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {analysts.map((analyst) => {
              const IconComponent = analyst.icon;
              return (
                <Card 
                  key={analyst.id} 
                  className={`border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer relative ${!analyst.isActive ? 'opacity-70' : ''}`}
                  onClick={() => navigate(`/conselheiro/${analyst.id}`)}
                >
                  {/* Faixa de inatividade */}
                  {!analyst.isActive && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 rotate-[-30deg]">
                      <div className="bg-red-600/90 text-white px-6 py-1.5 text-sm font-bold tracking-wider shadow-lg border-2 border-red-700 whitespace-nowrap">
                        {analyst.unavailabilityText || 'INATIVO'}
                      </div>
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: analyst.color }}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{analyst.flag}</span>
                          <CardTitle className="text-lg" style={{ color: analyst.color }}>
                            {analyst.name}
                          </CardTitle>
                        </div>
                        <p className="text-sm text-[var(--fgv-secondary-2)]">{analyst.theory}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span 
                        className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: analyst.color }}
                      >
                        {analyst.focus}
                      </span>
                    </div>
                    <p className="text-[var(--fgv-secondary-2)] text-sm mb-4 leading-relaxed">
                      {analyst.description}
                    </p>
                    <div className="bg-[var(--fgv-secondary-5)] p-3 rounded-lg mb-4">
                      <p className="text-xs font-medium text-[var(--fgv-primary-2)] mb-1">Pergunta-chave:</p>
                      <p className="text-sm text-[var(--fgv-secondary-1)] italic">
                        "{analyst.keyQuestion}"
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[var(--fgv-primary-2)] mb-2">Contribuições:</p>
                      <div className="flex flex-wrap gap-1">
                        {analyst.contributions.slice(0, 3).map((contribution, i) => (
                          <span 
                            key={i}
                            className="px-2 py-0.5 bg-[var(--fgv-secondary-4)] text-[var(--fgv-secondary-1)] rounded text-xs"
                          >
                            {contribution}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[var(--fgv-primary-3)] mt-4 text-center">
                      Clique para ver perfil completo →
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          )}
        </div>
      </section>



      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[var(--fgv-primary-1)] mb-12 text-center">
            Benefícios da Abordagem Multiagente
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                title: "Múltiplas Perspectivas",
                description: "Cada questão é analisada sob diferentes ângulos teóricos, revelando aspectos que uma única abordagem poderia negligenciar."
              },
              {
                title: "Equilíbrio Analítico",
                description: "O debate entre perspectivas divergentes produz análises mais equilibradas e menos sujeitas a vieses ideológicos."
              },
              {
                title: "Profundidade Teórica",
                description: "Cada analista aplica décadas de desenvolvimento teórico em sua escola de pensamento específica."
              },
              {
                title: "Qualidade Acadêmica",
                description: "O processo de revisão garante que o resultado final atenda aos padrões de excelência da FGV."
              }
            ].map((benefit, index) => (
              <Card key={index} className="border-[var(--fgv-secondary-4)] text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-[var(--fgv-primary-4)]/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-[var(--fgv-primary-2)]">{index + 1}</span>
                  </div>
                  <h3 className="font-bold text-[var(--fgv-primary-1)] mb-2">{benefit.title}</h3>
                  <p className="text-sm text-[var(--fgv-secondary-2)]">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[var(--fgv-secondary-5)]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[var(--fgv-primary-1)] mb-4">
            Pronto para Começar?
          </h2>
          <p className="text-lg text-[var(--fgv-secondary-1)] max-w-2xl mx-auto mb-8">
            Experimente o poder da análise multiagente e obtenha insights geopolíticos 
            de alta qualidade para suas decisões estratégicas.
          </p>
          <Button 
            onClick={() => navigate("/dashboard")}
            className="bg-[var(--fgv-primary-2)] hover:bg-[var(--fgv-primary-1)] text-white px-8 py-6 text-lg"
          >
            Iniciar Análise
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--fgv-primary-1)] text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <a href="https://dint.fgv.br/" target="_blank" rel="noopener noreferrer">
            <img 
              src="/fgv-logo.png" 
              alt="FGV" 
              className="h-12 mx-auto mb-4 brightness-0 invert"
            />
          </a>
          <p className="text-[var(--fgv-secondary-3)]">
            © 2026 Diretoria Internacional da Fundação Getulio Vargas. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
