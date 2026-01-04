import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mail } from "lucide-react";
import { useLocation } from "wouter";
import Breadcrumbs from "@/components/Breadcrumbs";
import { GlobeBackground } from "@/components/GlobeBackground";
import { trpc } from "@/lib/trpc";

const coordinators = [
  {
    id: "andre-novaes",
    name: "General André Novaes",
    title: "Coordenador de Geopolítica da Diretoria Internacional da FGV",
    email: "andre.novaes@fgv.br",
    photoKey: "coordinator_novaes",
    photoFallback: "/coordinators/novaes.jpg",
    bio: `André Novaes é Assessor Especial da Diretoria Internacional da FGV, onde é professor dos programas internacionais de pós-graduação e consultor em Geopolítica Brasileira e Internacional. É doutor em Ciências Militares pela Escola de Comando e Estado-Maior do Exército (ECEME) e possui cursos na FGV, IBMEC, no Chile, Uruguai e nos EUA, onde foi aluno e assessor no Colégio Interamericano de Defesa.`,
    career: `General-de-Exército da Reserva, integrou o Alto-Comando do Exército Brasileiro até abril de 2025, quando exercia o Comando de Operações Terrestres. Antes, como oficial-general, foi Comandante Militar do Leste, Chefe do Departamento de Educação e Cultura, Comandante da 2ª Divisão de Exército, Comandante da Academia Militar das Agulhas Negras (AMAN) e Comandante da 17ª Brigada de Infantaria de Selva.`,
    international: `Foi comandante de tropas no Haiti e Observador Militar da ONU durante a Guerra da Iugoslávia.`,
    
  },
  {
    id: "marlos-lima",
    name: "Marlos Correia Lima",
    title: "Diretor Internacional da FGV",
    email: "marlos.lima@fgv.br",
    photoKey: "coordinator_marlos",
    photoFallback: "/coordinators/marlos.png",
    bio: `Marlos Correia Lima é Diretor Internacional da Fundação Getulio Vargas. É consultor e leciona nos cursos de pós-graduação em planejamento estratégico, políticas públicas, cenários prospectivos e tomadas de decisão em ambientes de incerteza. Possui experiência na condução de projetos públicos e privados em âmbito internacional.`,
    career: `É economista pela UFRJ, mestre em Administração Pública pela FGV EBAPE e doutorando em Administração de Empresas pela FGV EAESP. Professor visitante em diversas universidades estrangeiras.`,
    international: `É membro fundador do Grupo Latino-Americano para a Administração Pública (GLAP/IIAS), membro da American Academy of Management e conselheiro da Cidade do Rio de Janeiro.`,
    
  }
];

export default function Coordination() {
  const [, navigate] = useLocation();
  
  // Buscar URLs das imagens do S3
  const { data: systemImageUrls } = trpc.admin.getSystemImageUrls.useQuery();
  
  // Função para obter a URL da foto do coordenador (S3 ou fallback)
  const getCoordinatorPhotoUrl = (photoKey: string, fallback: string) => {
    if (systemImageUrls && systemImageUrls[photoKey]) {
      return systemImageUrls[photoKey];
    }
    return fallback;
  };

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
      <Breadcrumbs items={[{ label: "Coordenação" }]} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[var(--fgv-primary-1)] via-[var(--fgv-primary-2)] to-[var(--fgv-primary-3)] text-white py-16 relative overflow-hidden">
        <GlobeBackground opacity={15} position="center" size="lg" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-fgv-light">
            Coordenação do Conselho
          </h1>
          <p className="text-xl text-[var(--fgv-primary-4)] max-w-3xl mx-auto">
            Conheça os coordenadores responsáveis pela direção do Conselho IA de Geopolítica da FGV
          </p>
        </div>
      </section>

      {/* Coordinators Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-16">
            {coordinators.map((coordinator, index) => (
              <Card key={coordinator.id} className="overflow-hidden border-none shadow-xl">
                <CardContent className="p-0">
                  <div className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                    {/* Info Section with Photo */}
                    <div className="lg:w-1/3 bg-gradient-to-br from-[var(--fgv-primary-1)] to-[var(--fgv-primary-2)] p-8 flex flex-col items-center justify-center text-white">
                      <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white/30 mb-6 shadow-xl">
                        <img 
                          src={getCoordinatorPhotoUrl(coordinator.photoKey, coordinator.photoFallback)} 
                          alt={coordinator.name}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <h2 className="text-2xl font-bold text-center mb-2 text-white">{coordinator.name}</h2>
                      <p className="text-[var(--fgv-primary-4)] text-center mb-4">{coordinator.title}</p>
                      <a 
                        href={`mailto:${coordinator.email}`}
                        className="flex items-center gap-2 text-white hover:text-[var(--fgv-primary-4)] transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        {coordinator.email}
                      </a>
                    </div>

                    {/* Content Section */}
                    <div className="lg:w-2/3 p-8 bg-white">
                      {/* Biografia Unificada */}
                      <p className="text-[var(--fgv-secondary-2)] leading-relaxed">
                        {coordinator.bio} {coordinator.career} {coordinator.international}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-[var(--fgv-primary-1)]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-fgv-light mb-6">Nossa Missão</h2>
          <p className="text-xl text-[var(--fgv-primary-4)] max-w-4xl mx-auto leading-relaxed">
            O Conselho IA de Geopolítica da FGV tem como missão produzir análises geopolíticas 
            de alta qualidade, combinando múltiplas perspectivas teóricas dos grandes pensadores 
            da geopolítica mundial com tecnologia de inteligência artificial de ponta, 
            contribuindo para a melhoria da qualidade do processo decisório em ambientes complexos e incertos.
          </p>
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
