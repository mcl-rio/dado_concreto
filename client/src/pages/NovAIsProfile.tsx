import { useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Shield, CheckCircle, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GlobeBackground } from "@/components/GlobeBackground";

export default function NovAIsProfile() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--fgv-primary-1)] to-[var(--fgv-primary-2)] relative overflow-hidden">
      <GlobeBackground opacity={10} position="center" size="xl" />
      {/* Header */}
      <header className="border-b border-white/10 bg-[var(--fgv-primary-1)]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="https://dint.fgv.br/" target="_blank" rel="noopener noreferrer">
            <img
              src="/logo-fgv-dint.svg"
              alt="FGV Diretoria Internacional"
              className="h-14"
            />
          </a>
          <Button
            variant="ghost"
            onClick={() => { setLocation("/"); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100); }}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <button onClick={() => { setLocation("/"); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100); }} className="hover:text-white/90 transition-colors">
            Início
          </button>
          <span>/</span>
          <button onClick={() => setLocation("/coordination")} className="hover:text-white/90 transition-colors">
            Coordenação
          </button>
          <span>/</span>
          <span className="text-white/90">GennovAIs</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-[300px_1fr] gap-8">
            {/* Profile Image */}
            <div className="flex flex-col items-center">
              <div className="w-72 h-72 rounded-lg overflow-hidden shadow-2xl mb-4 bg-[var(--fgv-secondary-5)]">
                <img
                  src="/novaes-profile.png"
                  alt="GennovAIs"
                  className="w-full h-full object-cover object-[center_20%] scale-110"
                />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-1">GennovAIs</h2>
                <p className="text-[var(--fgv-primary-4)] font-semibold mb-2">Coordenador do Conselho</p>
                <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
                  <Shield className="w-4 h-4" />
                  <span>Estrategista Militar</span>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="space-y-6">
              {/* Introdução */}
              <Card className="bg-white/95 border-none shadow-xl">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-[var(--fgv-primary-1)] mb-4">
                    O Guardião da Excelência Analítica
                  </h3>
                  <div className="space-y-4 text-[var(--fgv-secondary-1)] leading-relaxed">
                    <p>
                      O <strong>GennovAIs</strong> é o Coordenador do Conselho IA de Geopolítica da FGV, 
                      responsável por garantir que cada análise produzida atenda aos mais altos padrões de rigor 
                      acadêmico e relevância estratégica. Com décadas de experiência em planejamento estratégico 
                      militar e análise de cenários complexos, ele traz ao Conselho uma visão pragmática, direta 
                      e sem concessões à mediocridade.
                    </p>
                    <p>
                      Conhecido por sua postura firme e linguagem militar característica, o GennovAIs não 
                      hesita em rejeitar propostas vagas, mal fundamentadas ou que não agreguem valor estratégico. 
                      Sua missão é assegurar que o Conselho dedique seus recursos apenas a análises que realmente 
                      importam, protegendo a reputação institucional da FGV e a qualidade do trabalho entregue.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Os Três Papéis */}
              <Card className="bg-white/95 border-none shadow-xl">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-[var(--fgv-primary-1)] mb-4">
                    Os Três Papéis do Coordenador
                  </h3>
                  <div className="space-y-6">
                    {/* Papel 1: Avaliador */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-[var(--fgv-primary-2)] flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-[var(--fgv-primary-2)] mb-2">
                          1. Avaliador de Propostas
                        </h4>
                        <p className="text-[var(--fgv-secondary-1)] leading-relaxed mb-2">
                          Antes de qualquer análise ser iniciada, o GennovAIs avalia criticamente a proposta 
                          submetida. Ele verifica se o tema é relevante, se os objetivos estão claros, se o contexto 
                          é suficiente e se as fontes fornecidas são adequadas.
                        </p>
                        <p className="text-[var(--fgv-secondary-1)] leading-relaxed">
                          Seu parecer é classificado em três níveis:
                        </p>
                        <ul className="list-disc list-inside text-[var(--fgv-secondary-1)] ml-4 space-y-1">
                          <li><strong className="text-green-600">🟢 Sinal Verde:</strong> Proposta aprovada, pronta para estruturação</li>
                          <li><strong className="text-yellow-600">🟡 Sinal Amarelo:</strong> Proposta precisa de melhorias antes de prosseguir</li>
                          <li><strong className="text-red-600">🔴 Sinal Vermelho:</strong> Proposta rejeitada, tema inadequado ou fora do escopo</li>
                        </ul>
                      </div>
                    </div>

                    {/* Papel 2: Estruturador */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-[var(--fgv-primary-2)] flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-[var(--fgv-primary-2)] mb-2">
                          2. Gerador de Estruturas
                        </h4>
                        <p className="text-[var(--fgv-secondary-1)] leading-relaxed mb-2">
                          Uma vez aprovada a proposta, o GennovAIs lê atentamente todas as fontes fornecidas 
                          e elabora uma estrutura detalhada para a análise. Esta estrutura define as seções do 
                          relatório, os tópicos a serem abordados e a linha argumentativa geral.
                        </p>
                        <p className="text-[var(--fgv-secondary-1)] leading-relaxed">
                          A estrutura é enviada antecipadamente aos Conselheiros especialistas cadastrados no sistema, 
                          permitindo que cada um prepare seu parecer fundamentado antes da Sessão 
                          do Conselho. Isso garante eficiência e profundidade nas análises.
                        </p>
                      </div>
                    </div>

                    {/* Papel 3: Coordenador */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-[var(--fgv-primary-2)] flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-[var(--fgv-primary-2)] mb-2">
                          3. Coordenador de Sessões
                        </h4>
                        <p className="text-[var(--fgv-secondary-1)] leading-relaxed mb-2">
                          Durante a Sessão do Conselho, o GennovAIs assume o papel de maestro, convocando 
                          os Conselheiros e coordenando a apresentação de seus pareceres. Ele garante que cada 
                          especialista contribua com sua perspectiva única, mantendo o foco nos objetivos da análise.
                        </p>
                        <p className="text-[var(--fgv-secondary-1)] leading-relaxed">
                          Ao final, trabalha em conjunto com o Max Weber para consolidar todos os pareceres 
                          em um relatório final unificado, coerente e de alto valor estratégico.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personalidade */}
              <Card className="bg-white/95 border-none shadow-xl">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-[var(--fgv-primary-1)] mb-4">
                    Personalidade e Estilo
                  </h3>
                  <div className="space-y-4 text-[var(--fgv-secondary-1)] leading-relaxed">
                    <p>
                      O GennovAIs é conhecido por sua <strong>linguagem militar direta e sem rodeios</strong>. 
                      Ele não perde tempo com eufemismos ou cortesias vazias. Quando uma proposta é inadequada, 
                      ele deixa isso claro com mensagens firmes e, por vezes, bem-humoradas no estilo castrense:
                    </p>
                    <blockquote className="border-l-4 border-[var(--fgv-primary-3)] pl-4 italic text-[var(--fgv-secondary-2)]">
                      "Negativo, Conselheiro! Isso aqui parece relatório de recruta em primeiro dia de quartel!"
                    </blockquote>
                    <p>
                      Por outro lado, quando reconhece excelência, não economiza elogios:
                    </p>
                    <blockquote className="border-l-4 border-[var(--fgv-aux-teal-2)] pl-4 italic text-[var(--fgv-secondary-2)]">
                      "Aprovado com louvor! Parecer digno de um estrategista de primeira linha!"
                    </blockquote>
                    <p>
                      Sua abordagem pragmática e exigente garante que apenas análises de alto nível sejam 
                      produzidas pelo Conselho, mantendo a credibilidade e o rigor acadêmico que caracterizam 
                      a Fundação Getulio Vargas.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <div className="text-center pt-6">
                <Button
                  size="lg"
                  onClick={() => setLocation("/analysis/new")}
                  className="bg-[var(--fgv-aux-yellow-2)] text-[var(--fgv-primary-1)] hover:bg-[var(--fgv-aux-yellow-1)] hover:text-[var(--fgv-primary-1)] font-bold px-8 shadow-lg"
                >
                  Submeta sua Proposta ao GennovAIs
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[var(--fgv-primary-1)] py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <a href="https://dint.fgv.br/" target="_blank" rel="noopener noreferrer">
            <img
              src="/logo-fgv-dint.svg"
              alt="FGV Diretoria Internacional"
              className="h-12 mx-auto mb-4"
            />
          </a>
          <p className="text-white/60 text-sm">
            © 2026 Diretoria Internacional da Fundação Getulio Vargas
          </p>
        </div>
      </footer>
    </div>
  );
}
