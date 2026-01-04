import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, HelpCircle, FileText, Users, Brain, Download, Shield } from "lucide-react";
import { useLocation } from "wouter";
import Breadcrumbs from "@/components/Breadcrumbs";
import { GlobeBackground } from "@/components/GlobeBackground";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

const faqCategories: FAQCategory[] = [
  {
    title: "Sobre o Sistema",
    icon: <HelpCircle className="h-5 w-5" />,
    items: [
      {
        question: "O que é o Conselho IA de Geopolítica da FGV?",
        answer: "O Conselho IA de Geopolítica da FGV é umo sistema de análise geopolítica que utiliza um sistema de inteligência artificial multiagente para produzir análises profissionais. O sistema combina múltiplas perspectivas teóricas de grandes pensadores geopolíticos para gerar relatórios abrangentes e bem fundamentados."
      },
      {
        question: "Quem pode utilizar o sistema?",
        answer: "O sistema está disponível para usuários convidados pela coordenação do Conselho. Pesquisadores, conselheiros, professores e profissionais interessados em geopolítica podem solicitar acesso através do formulário de contato ou diretamente com a coordenação."
      },
      {
        question: "Como funciona o acesso ao sistema?",
        answer: "Cada usuário recebe uma quota de análises definida pela coordenação. O sistema exibe claramente o número de análises disponíveis. Caso precise de mais análises, entre em contato com a coordenação do Conselho."
      }
    ]
  },
  {
    title: "Tipos de Análise",
    icon: <FileText className="h-5 w-5" />,
    items: [
      {
        question: "Quais tipos de análise posso realizar?",
        answer: "O sistema suporta diversos tipos de análise geopolítica, incluindo: análises comparativas entre países ou regiões, análises de cenários prospectivos, avaliações de riscos geopolíticos, estudos de caso históricos, análises de políticas externas e avaliações estratégicas regionais."
      },
      {
        question: "Posso fazer análises comparativas entre documentos?",
        answer: "Sim! O sistema permite fazer upload de múltiplos documentos (PDF, DOCX, TXT) e realizar análises comparativas. Você pode, por exemplo, comparar estratégias de diferentes países, políticas de diferentes períodos ou posicionamentos de diferentes atores internacionais."
      },
      {
        question: "O sistema analisa notícias atuais?",
        answer: "Sim, o sistema integra-se com serviços de notícias (NewsAPI e GDELT) para buscar informações atualizadas sobre temas geopolíticos. Você pode incluir notícias recentes como fontes para suas análises, garantindo que os relatórios considerem desenvolvimentos recentes."
      }
    ]
  },
  {
    title: "Sistema Multiagente",
    icon: <Users className="h-5 w-5" />,
    items: [
      {
        question: "O que é o sistema multiagente?",
        answer: "O sistema multiagente é uma arquitetura de inteligência artificial onde múltiplos agentes especializados trabalham em conjunto para produzir análises. Cada agente representa a perspectiva teórica de um pensador geopolítico clássico, trazendo diferentes abordagens para o mesmo problema."
      },
      {
        question: "Quem são os conselheiros virtuais disponíveis?",
        answer: "Os conselheiros virtuais são cadastrados pelo administrador do sistema e representam pensadores geopolíticos clássicos. Cada um traz uma perspectiva teórica única para as análises. Consulte a galeria na página inicial para conhecer os conselheiros disponíveis."
      },
      {
        question: "Posso escolher quais conselheiros participam da análise?",
        answer: "Sim! Durante o processo de criação da análise, você pode selecionar quais conselheiros deseja incluir. Recomendamos manter todos os conselheiros selecionados para obter perspectivas diversificadas e uma análise mais completa."
      },
      {
        question: "Como funciona o debate entre os conselheiros?",
        answer: "Após cada conselheiro produzir sua análise individual, um agente orquestrador coordena um 'debate' onde as diferentes perspectivas são confrontadas e sintetizadas. Um agente revisor então consolida as contribuições em um relatório coerente e bem estruturado."
      }
    ]
  },
  {
    title: "Processo de Análise",
    icon: <Brain className="h-5 w-5" />,
    items: [
      {
        question: "Quanto tempo leva para gerar uma análise?",
        answer: "O tempo de geração varia de acordo com a complexidade da análise e o número de conselheiros selecionados. Em média, uma análise completa leva entre 3 a 10 minutos. O sistema exibe o progresso em tempo real durante todo o processo."
      },
      {
        question: "Posso editar a estrutura da análise antes de executar?",
        answer: "Sim! O sistema oferece editores interativos onde você pode revisar e personalizar tanto a estrutura da análise quanto o formato do relatório final antes de executar. Isso permite adaptar o resultado às suas necessidades específicas."
      },
      {
        question: "O que acontece se a análise falhar?",
        answer: "Em caso de falha durante o processamento, a análise não é cobrada da sua quota. Você receberá uma notificação explicando o problema e poderá tentar novamente. Se o problema persistir, entre em contato com a coordenação através do formulário de contato."
      }
    ]
  },
  {
    title: "Relatórios e Exportação",
    icon: <Download className="h-5 w-5" />,
    items: [
      {
        question: "Em quais formatos posso exportar os relatórios?",
        answer: "Os relatórios podem ser exportados em PDF (para visualização e impressão) ou Word/DOCX (para edição posterior). Ambos os formatos mantêm a identidade visual da FGV com formatação profissional."
      },
      {
        question: "Os relatórios incluem referências e fontes?",
        answer: "Sim! Todos os relatórios incluem uma seção de fontes consultadas, listando os documentos, notícias e outras referências utilizadas na análise. Isso garante a rastreabilidade e credibilidade das informações apresentadas."
      },
      {
        question: "Posso salvar análises para consulta futura?",
        answer: "Sim! Ao finalizar uma análise, você pode optar por salvá-la no histórico. As análises salvas ficam disponíveis para consulta e download a qualquer momento através da seção 'Histórico' do seu painel."
      }
    ]
  },
  {
    title: "Privacidade e Segurança",
    icon: <Shield className="h-5 w-5" />,
    items: [
      {
        question: "Meus documentos são armazenados de forma segura?",
        answer: "Sim! Todos os documentos enviados são processados de forma segura e não são compartilhados com terceiros. Os arquivos são utilizados apenas para a geração da análise solicitada e podem ser excluídos a qualquer momento."
      },
      {
        question: "Quem tem acesso às minhas análises?",
        answer: "Apenas você e os administradores do sistema têm acesso às suas análises. Os relatórios gerados são privados e não são compartilhados com outros usuários. Você controla se deseja salvar ou não cada análise no histórico."
      },
      {
        question: "Como posso excluir meus dados?",
        answer: "Você pode excluir análises individuais do seu histórico a qualquer momento. Para solicitar a exclusão completa de seus dados do sistema, entre em contato com a coordenação através do formulário de contato."
      }
    ]
  }
];

export default function FAQ() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-fgv-primary-1 via-fgv-primary-2 to-fgv-accent-1 relative overflow-hidden">
      <GlobeBackground opacity={10} position="top" size="xl" />
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setLocation("/"); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100); }}
              className="text-fgv-primary-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <a href="https://dint.fgv.br/" target="_blank" rel="noopener noreferrer">
              <img
                src="/fgv-logo.png"
                alt="FGV Diretoria Internacional"
                className="h-14 object-contain"
              />
            </a>
          </div>
          <nav className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/contact")}
              className="text-fgv-primary-2"
            >
              Contato
            </Button>
            <Button
              onClick={() => setLocation("/dashboard")}
              className="bg-fgv-primary-2 hover:bg-fgv-primary-1 text-white"
            >
              Acessar Plataforma
            </Button>
          </nav>
        </div>
      </header>

      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: "Perguntas Frequentes" }]} />

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm mb-6">
            <HelpCircle className="h-4 w-4" />
            Central de Ajuda
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-fgv-light mb-4">
            Perguntas Frequentes
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Encontre respostas para as dúvidas mais comuns sobre o sistema de análise geopolítica do Conselho IA de Geopolítica da FGV.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-fgv-primary-2/10 rounded-lg text-fgv-primary-2">
                      {category.icon}
                    </div>
                    <h2 className="text-xl font-semibold text-fgv-primary-1">
                      {category.title}
                    </h2>
                  </div>
                  <Accordion type="single" collapsible className="w-full">
                    {category.items.map((item, itemIndex) => (
                      <AccordionItem
                        key={itemIndex}
                        value={`item-${categoryIndex}-${itemIndex}`}
                        className="border-fgv-secondary-1/20"
                      >
                        <AccordionTrigger className="text-left text-fgv-primary-1 hover:text-fgv-primary-2 hover:no-underline">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-fgv-secondary-1 leading-relaxed">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-fgv-primary-1 mb-4">
                Não encontrou o que procurava?
              </h2>
              <p className="text-fgv-secondary-1 mb-6">
                Entre em contato com a coordenação do Conselho IA de Geopolítica da FGV. 
                Estamos prontos para ajudar com suas dúvidas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => setLocation("/contact")}
                  className="bg-fgv-primary-2 hover:bg-fgv-primary-1 text-white"
                >
                  Entrar em Contato
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/method")}
                  className="border-fgv-primary-2 text-fgv-primary-2 hover:bg-fgv-primary-2/10"
                >
                  Conhecer o Método
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-fgv-primary-1 text-white py-8 px-4">
        <div className="container mx-auto text-center">
          <a href="https://dint.fgv.br/" target="_blank" rel="noopener noreferrer">
            <img
              src="/fgv-logo.png"
              alt="FGV"
              className="h-12 mx-auto mb-4 brightness-0 invert"
            />
          </a>
          <p className="text-white/60 text-sm">
            © 2026 Diretoria Internacional da Fundação Getulio Vargas. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
