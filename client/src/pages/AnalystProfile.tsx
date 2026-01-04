import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Globe2, BookOpen, Lightbulb, Quote, Loader2 } from "lucide-react";
import { useLocation, useParams } from "wouter";
import Breadcrumbs from "@/components/Breadcrumbs";
import { GlobeBackground } from "@/components/GlobeBackground";
import { trpc } from "@/lib/trpc";

// Helper para determinar bandeira baseada na nacionalidade
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
  if (nat.includes('holand') || nat.includes('dutch')) return '🇳🇱';
  return '🇺🇳';
};

export default function AnalystProfile() {
  const { analystId } = useParams<{ analystId: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Buscar dados do conselheiro do banco de dados
  const { data: analyst, isLoading, error } = trpc.counselors.getByKey.useQuery(
    { counselorId: analystId || '' },
    { enabled: !!analystId }
  );

  // Buscar todos os conselheiros ativos para a seção "Outros Membros"
  const { data: allCounselors } = trpc.counselors.listActive.useQuery();

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [analystId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--fgv-primary-1)] to-[var(--fgv-primary-2)] flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!analyst || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--fgv-primary-1)] to-[var(--fgv-primary-2)] flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">Conselheiro não encontrado</h2>
            <p className="text-muted-foreground mb-4">
              O conselheiro solicitado não existe ou foi removido do sistema.
            </p>
            <Button onClick={() => { navigate("/"); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100); }}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extrair dados do banco
  const flag = getFlag(analyst.nationality);
  const years = analyst.birthYear && analyst.deathYear 
    ? `${analyst.birthYear}-${analyst.deathYear}`
    : analyst.birthYear 
      ? `${analyst.birthYear}-presente`
      : '';
  
  // Parse JSON fields - podem vir como string JSON ou array
  const parseJsonField = <T,>(field: unknown): T[] => {
    if (!field) return [];
    if (Array.isArray(field)) return field as T[];
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };
  
  const keyContributions = parseJsonField<{ title: string; description: string } | string>(analyst.keyContributions);
  const mainBooks = parseJsonField<{ title: string; year?: number; description?: string }>(analyst.mainBooks);
  const keyPhrases = parseJsonField<string>(analyst.keyPhrases);
  const areasOfExpertise = parseJsonField<string>(analyst.areasOfExpertise);

  // Formatar contribuições
  const contributions = Array.isArray(keyContributions) 
    ? keyContributions.map((c, i) => {
        if (typeof c === 'string') {
          return { title: `Contribuição ${i + 1}`, description: c };
        }
        return c;
      })
    : [];

  // Formatar obras principais
  const majorWorks = mainBooks.map(book => {
    if (typeof book === 'string') return book;
    return book.year ? `${book.title} (${book.year})` : book.title;
  });

  // Citação famosa (primeira frase-chave ou shortBio)
  const famousQuote = keyPhrases[0] || analyst.shortBio || '';

  // Outros conselheiros (excluindo o atual)
  const otherCounselors = (allCounselors || []).filter(c => c.counselorId !== analyst.counselorId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--fgv-secondary-5)] to-[var(--fgv-secondary-4)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--fgv-secondary-4)] sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <a href="https://dint.fgv.br/" target="_blank" rel="noopener noreferrer">
              <img 
                src="/fgv-logo.png" 
                alt="FGV Diretoria Internacional" 
                className="h-14 object-contain"
              />
            </a>
          </div>
          <Button 
            variant="outline"
            onClick={() => { navigate("/"); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100); }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      {/* Breadcrumbs */}
      <Breadcrumbs items={[
        { label: "Conselheiros", href: "/#analysts" },
        { label: analyst.shortName || analyst.name }
      ]} />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[var(--fgv-primary-1)] via-[var(--fgv-primary-2)] to-[var(--fgv-primary-3)] text-white py-16 relative overflow-hidden">
        <GlobeBackground opacity={10} position="center" size="lg" />
        
        {/* Faixa de inatividade */}
        {!analyst.isActive && (
          <div className="absolute top-8 right-8 z-20 rotate-[15deg]">
            <div className="bg-red-600/95 text-white px-8 py-2 text-lg font-bold tracking-wider shadow-lg border-2 border-red-700">
              {analyst.unavailabilityText || 'INATIVO'}
            </div>
          </div>
        )}
        
        <div className="container relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className={`w-64 h-64 md:w-72 md:h-72 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl flex-shrink-0 ring-4 ring-white/10 ${!analyst.isActive ? 'opacity-70 grayscale' : ''}`}>
              <img 
                src={analyst.bioPhotoUrl || analyst.photoUrl || `/${analyst.counselorId}-profile.png`} 
                alt={analyst.name}
                className="w-full h-full object-cover scale-110"
                style={{ objectPosition: 'center 15%' }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">{flag}</span>
                <span className="text-sm opacity-80">{analyst.nationality}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-fgv-light">{analyst.name}</h1>
              {years && <p className="text-lg opacity-90 mb-2">{years}</p>}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
                <Globe2 className="h-4 w-4" />
                <span className="font-medium">{analyst.mainTheory}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Biography */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-[var(--fgv-primary-1)] mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Biografia
                </h2>
                <div className="prose prose-slate max-w-none">
                  {analyst.fullBio ? (
                    analyst.fullBio.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="text-muted-foreground mb-4 leading-relaxed">
                        {paragraph}
                      </p>
                    ))
                  ) : analyst.shortBio ? (
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {analyst.shortBio}
                    </p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      Biografia não disponível.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contributions */}
            {contributions.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-[var(--fgv-primary-1)] mb-4 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Principais Contribuições para a Geopolítica
                  </h2>
                  <div className="space-y-6">
                    {contributions.map((contribution, index) => (
                      <div key={index} className="border-l-4 border-[var(--fgv-primary-3)] pl-4">
                        <h3 className="font-semibold text-[var(--fgv-primary-1)] mb-2">
                          {contribution.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {contribution.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Areas of Expertise (if no contributions) */}
            {contributions.length === 0 && areasOfExpertise.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-[var(--fgv-primary-1)] mb-4 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Áreas de Especialização
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {areasOfExpertise.map((area, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-[var(--fgv-primary-4)]/20 text-[var(--fgv-primary-1)] rounded-full text-sm"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Famous Quote */}
            {famousQuote && (
              <Card className="bg-gradient-to-br from-[var(--fgv-primary-1)] to-[var(--fgv-primary-2)] text-white">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 opacity-50 mb-4" />
                  <blockquote className="text-lg italic leading-relaxed mb-4">
                    "{famousQuote}"
                  </blockquote>
                  <p className="text-sm opacity-80">— {analyst.shortName || analyst.name}</p>
                </CardContent>
              </Card>
            )}

            {/* Major Works */}
            {majorWorks.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-[var(--fgv-primary-1)] mb-4">Obras Principais</h3>
                  <ul className="space-y-2">
                    {majorWorks.map((work, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-[var(--fgv-primary-3)]">•</span>
                        {work}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Other Analysts */}
            {otherCounselors.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-[var(--fgv-primary-1)] mb-4">Outros Membros do Conselho</h3>
                  <div className="space-y-2">
                    {otherCounselors.map((otherAnalyst) => (
                      <button
                        key={otherAnalyst.counselorId}
                        onClick={() => navigate(`/conselheiro/${otherAnalyst.counselorId}`)}
                        className="w-full text-left p-2 rounded-lg hover:bg-muted transition-colors flex items-center gap-3"
                      >
                        <span className="text-lg">{getFlag(otherAnalyst.nationality)}</span>
                        <div>
                          <p className="font-medium text-sm">{otherAnalyst.shortName || otherAnalyst.name}</p>
                          <p className="text-xs text-muted-foreground">{otherAnalyst.mainTheory}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[var(--fgv-primary-1)] text-white py-8">
        <div className="container text-center">
          <p className="text-sm opacity-80">
            © {new Date().getFullYear()} FGV - Fundação Getulio Vargas. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
