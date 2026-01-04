import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Target, 
  Users, 
  Globe2, 
  BookOpen, 
  Lightbulb, 
  Shield,
  GraduationCap,
  Building2,
  ArrowRight
} from "lucide-react";
import { useLocation } from "wouter";
import Breadcrumbs from "@/components/Breadcrumbs";
import { GlobeBackground } from "@/components/GlobeBackground";

export default function About() {
  const [, navigate] = useLocation();

  const objectives = [
    {
      icon: Target,
      title: "Análises Estratégicas",
      description: "Produzir análises geopolíticas de alta qualidade que auxiliem na compreensão de cenários internacionais complexos."
    },
    {
      icon: Users,
      title: "Múltiplas Perspectivas",
      description: "Integrar diferentes escolas de pensamento geopolítico para oferecer visões multifacetadas dos fenômenos internacionais."
    },
    {
      icon: Globe2,
      title: "Visão Global",
      description: "Acompanhar e analisar as principais tendências geopolíticas mundiais com foco especial na posição estratégica do Brasil."
    },
    {
      icon: BookOpen,
      title: "Excelência Acadêmica",
      description: "Manter o rigor metodológico e a qualidade acadêmica característicos da tradição da Fundação Getulio Vargas."
    }
  ];

  const values = [
    {
      icon: Lightbulb,
      title: "Inovação",
      description: "Utilização de inteligência artificial multiagente para enriquecer as análises geopolíticas."
    },
    {
      icon: Shield,
      title: "Rigor",
      description: "Compromisso com a precisão, fundamentação teórica e método científico."
    },
    {
      icon: GraduationCap,
      title: "Conhecimento",
      description: "Valorização do saber acadêmico e da expertise dos grandes pensadores geopolíticos."
    },
    {
      icon: Building2,
      title: "Institucionalidade",
      description: "Alinhamento com os valores e a missão da Fundação Getulio Vargas."
    }
  ];

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
            Voltar ao Início
          </Button>
        </div>
      </header>

      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: "Sobre o Conselho" }]} />

      {/* Hero Section */}
      <section className="bg-fgv-gradient text-white py-16 relative overflow-hidden">
        <GlobeBackground opacity={15} position="center" size="lg" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-fgv-light">
              Sobre o Conselho IA de Geopolítica da FGV
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              O Conselho IA de Geopolítica da FGV é uma iniciativa da Diretoria Internacional 
              da Fundação Getulio Vargas que combina a tradição acadêmica da instituição 
              com tecnologias avançadas de inteligência artificial para produzir análises 
              geopolíticas de excelência.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-[var(--fgv-primary-1)] mb-8 text-center">
              Nossa Missão
            </h2>
            <div className="bg-[var(--fgv-secondary-5)] rounded-xl p-8 border-l-4 border-[var(--fgv-primary-2)]">
              <p className="text-lg text-[var(--fgv-secondary-1)] leading-relaxed mb-4">
                Democratizar o acesso a análises geopolíticas de qualidade acadêmica, 
                utilizando um sistema inovador de inteligência artificial multiagente que 
                simula o debate entre diferentes escolas de pensamento geopolítico.
              </p>
              <p className="text-lg text-[var(--fgv-secondary-1)] leading-relaxed">
                Nosso objetivo é fornecer ferramentas que auxiliem pesquisadores, 
                profissionais e tomadores de decisão a compreender melhor os complexos 
                cenários geopolíticos contemporâneos, sempre mantendo o rigor metodológico 
                e a excelência que caracterizam a Fundação Getulio Vargas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Objectives Section */}
      <section className="py-16 bg-[var(--fgv-secondary-5)]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[var(--fgv-primary-1)] mb-12 text-center">
            Nossos Objetivos
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {objectives.map((objective, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-lg bg-[var(--fgv-primary-2)] flex items-center justify-center mb-3">
                    <objective.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg text-[var(--fgv-primary-1)]">
                    {objective.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[var(--fgv-secondary-2)] text-sm leading-relaxed">
                    {objective.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[var(--fgv-primary-1)] mb-12 text-center">
            Nossos Valores
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--fgv-primary-2)]/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-[var(--fgv-primary-2)]" />
                </div>
                <h3 className="font-bold text-lg text-[var(--fgv-primary-1)] mb-2">
                  {value.title}
                </h3>
                <p className="text-[var(--fgv-secondary-2)] text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About FGV Section */}
      <section className="py-16 bg-[var(--fgv-secondary-5)]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-[var(--fgv-primary-1)] mb-8 text-center">
              Sobre a FGV
            </h2>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <p className="text-lg text-[var(--fgv-secondary-1)] leading-relaxed mb-4">
                A <strong>Fundação Getulio Vargas (FGV)</strong> é uma instituição brasileira de ensino 
                superior e pesquisa, fundada em 1944, reconhecida internacionalmente pela excelência 
                em suas áreas de atuação: administração, economia, direito, ciências sociais e história.
              </p>
              <p className="text-lg text-[var(--fgv-secondary-1)] leading-relaxed mb-4">
                A <strong>Diretoria Internacional (DINT)</strong> é responsável por coordenar as 
                atividades internacionais da FGV, promovendo parcerias acadêmicas, intercâmbios 
                e projetos de cooperação com instituições de todo o mundo.
              </p>
              <p className="text-lg text-[var(--fgv-secondary-1)] leading-relaxed">
                O Conselho IA de Geopolítica da FGV é uma iniciativa que combina a tradição de 
                excelência da instituição com as mais modernas tecnologias de inteligência 
                artificial, representando o compromisso da FGV com a inovação e a produção 
                de conhecimento de ponta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[var(--fgv-primary-1)]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-fgv-light mb-4">
            Conheça Nosso Sistema
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Explore as funcionalidades do Conselho IA de Geopolítica da FGV e descubra 
            como nosso sistema pode auxiliar suas análises.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate("/method")}
              className="bg-[var(--fgv-aux-yellow-2)] text-[var(--fgv-primary-1)] hover:bg-[var(--fgv-aux-yellow-1)] hover:text-[var(--fgv-primary-1)] font-semibold px-8"
            >
              Conhecer o Método
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate("/coordination")}
              className="border-white/30 text-white hover:bg-white/10 font-semibold px-8"
            >
              <Users className="mr-2 h-5 w-5" />
              Conhecer a Coordenação
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--fgv-primary-1)] text-white py-8 border-t border-[var(--fgv-primary-2)]">
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
