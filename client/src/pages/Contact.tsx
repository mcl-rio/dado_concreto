import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Mail, MapPin, Phone, Send, CheckCircle, Loader2, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import Breadcrumbs from "@/components/Breadcrumbs";
import { GlobeBackground } from "@/components/GlobeBackground";
import { toast } from "sonner";

// Animated checkmark component
function AnimatedCheckmark() {
  return (
    <div className="relative w-24 h-24 mx-auto">
      {/* Outer circle with pulse animation */}
      <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-25" />
      
      {/* Main circle */}
      <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg animate-scale-in">
        {/* SVG Checkmark with draw animation */}
        <svg
          className="w-12 h-12 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M5 13l4 4L19 7"
            className="animate-draw-check"
            style={{
              strokeDasharray: 24,
              strokeDashoffset: 24,
              animation: "drawCheck 0.5s ease-out 0.3s forwards",
            }}
          />
        </svg>
      </div>
      
      {/* Sparkle particles */}
      <div className="absolute -top-2 -right-2 animate-sparkle-1">
        <Sparkles className="w-5 h-5 text-yellow-400" />
      </div>
      <div className="absolute -bottom-1 -left-3 animate-sparkle-2">
        <Sparkles className="w-4 h-4 text-yellow-500" />
      </div>
      <div className="absolute top-0 -left-4 animate-sparkle-3">
        <Sparkles className="w-3 h-3 text-green-400" />
      </div>
      <div className="absolute -bottom-2 right-0 animate-sparkle-4">
        <Sparkles className="w-4 h-4 text-blue-400" />
      </div>
    </div>
  );
}

// Confetti particle component
function ConfettiParticle({ delay, color, left }: { delay: number; color: string; left: string }) {
  return (
    <div
      className="absolute w-2 h-2 rounded-full animate-confetti"
      style={{
        backgroundColor: color,
        left: left,
        top: "-10px",
        animationDelay: `${delay}ms`,
      }}
    />
  );
}

// Success animation component
function SuccessAnimation({ onComplete }: { onComplete?: () => void }) {
  const [showContent, setShowContent] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const confettiColors = [
    "#003A79", // FGV blue
    "#C59B2A", // FGV aux yellow / Dourado
    "#008BC9", // FGV light blue
    "#73BFE8", // FGV lighter blue
    "#2B8671", // FGV aux teal
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Confetti particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <ConfettiParticle
            key={i}
            delay={i * 50}
            color={confettiColors[i % confettiColors.length]}
            left={`${5 + (i * 4.5)}%`}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center py-8">
        <AnimatedCheckmark />
        
        <div
          className={`mt-8 transition-all duration-500 ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h2 className="text-3xl font-bold text-fgv-primary-1 mb-3">
            Mensagem Enviada!
          </h2>
          <p className="text-fgv-secondary-1 mb-2 text-lg">
            Obrigado pelo seu contato.
          </p>
          <p className="text-fgv-secondary-2 text-sm max-w-sm mx-auto">
            Nossa equipe responderá em breve para o email informado.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Contact() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const sendContactMutation = trpc.contact.send.useMutation({
    onSuccess: () => {
      setIsAnimating(true);
      setTimeout(() => {
        setIsSubmitted(true);
        setIsAnimating(false);
      }, 300);
      toast.success("Mensagem enviada com sucesso!");
    },
    onError: (error: { message: string }) => {
      toast.error("Erro ao enviar mensagem: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }
    sendContactMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fgv-primary-1 via-fgv-primary-2 to-fgv-accent-1 flex items-center justify-center p-4">
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl max-w-md w-full overflow-hidden">
          <CardContent className="p-8">
            <SuccessAnimation />
            
            <div className="flex flex-col gap-3 mt-8 animate-fade-in-up" style={{ animationDelay: "1s" }}>
              <Button
                onClick={() => { setLocation("/"); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100); }}
                className="bg-fgv-primary-2 hover:bg-fgv-primary-1 text-white transition-all duration-300 hover:scale-105"
              >
                Voltar para a Página Inicial
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({ name: "", email: "", subject: "", message: "" });
                }}
                className="border-fgv-primary-2 text-fgv-primary-2 hover:bg-fgv-primary-2/10 transition-all duration-300"
              >
                Enviar Nova Mensagem
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fgv-primary-1 via-fgv-primary-2 to-fgv-accent-1 relative overflow-hidden">
      <GlobeBackground opacity={10} position="center" size="xl" />
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setLocation("/"); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100); }}
              className="text-fgv-primary-2 hover:bg-fgv-primary-2/10 transition-colors"
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
              onClick={() => setLocation("/faq")}
              className="text-fgv-primary-2 hover:bg-fgv-primary-2/10 transition-colors"
            >
              FAQ
            </Button>
            <Button
              onClick={() => setLocation("/dashboard")}
              className="bg-fgv-primary-2 hover:bg-fgv-primary-1 text-white transition-colors"
            >
              Acessar Plataforma
            </Button>
          </nav>
        </div>
      </header>

      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: "Contato" }]} />

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm mb-6">
            <Mail className="h-4 w-4" />
            Fale Conosco
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-fgv-light mb-4">
            Entre em Contato
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Tem dúvidas, sugestões ou deseja solicitar acesso ao sistema? 
            Envie sua mensagem e nossa equipe responderá em breve.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-fgv-primary-2/10 rounded-lg text-fgv-primary-2">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-fgv-primary-1 mb-1">Endereço</h3>
                      <p className="text-fgv-secondary-1 text-sm">
                        Praia de Botafogo, 190<br />
                        Rio de Janeiro - RJ<br />
                        CEP: 22250-900
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-fgv-primary-2/10 rounded-lg text-fgv-primary-2">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-fgv-primary-1 mb-1">Email</h3>
                      <p className="text-fgv-secondary-1 text-sm">
                        marlos@marlos.com.br<br />
                        andre.novaes63@gmail.com
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-fgv-primary-2/10 rounded-lg text-fgv-primary-2">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-fgv-primary-1 mb-1">Telefone</h3>
                      <p className="text-fgv-secondary-1 text-sm">
                        +55 (21) 3799-5500
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Coordinators */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-fgv-primary-1 mb-4">Coordenação</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <img
                        src="/andre-novaes.png"
                        alt="General André Novaes"
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-fgv-primary-2/20"
                      />
                      <div>
                        <p className="font-medium text-fgv-primary-1 text-sm">Gen. André Novaes</p>
                        <p className="text-fgv-secondary-1 text-xs">Coordenador Acadêmico</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <img
                        src="/marlos-lima.png"
                        alt="Prof. Marlos Lima"
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-fgv-primary-2/20"
                      />
                      <div>
                        <p className="font-medium text-fgv-primary-1 text-sm">Prof. Marlos Lima</p>
                        <p className="text-fgv-secondary-1 text-xs">Diretor Internacional</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2">
              <Card className={`bg-white/95 backdrop-blur-sm border-0 shadow-lg transition-all duration-500 ${isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-fgv-primary-1 mb-6">
                    Envie sua Mensagem
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-fgv-primary-1">
                          Nome Completo *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          placeholder="Seu nome"
                          className="border-fgv-secondary-3 focus:border-fgv-primary-2 transition-colors"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-fgv-primary-1">
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          placeholder="seu@email.com"
                          className="border-fgv-secondary-3 focus:border-fgv-primary-2 transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-fgv-primary-1">
                        Assunto *
                      </Label>
                      <Select
                        value={formData.subject}
                        onValueChange={(value) => handleChange("subject", value)}
                      >
                        <SelectTrigger className="border-fgv-secondary-3 focus:border-fgv-primary-2 transition-colors">
                          <SelectValue placeholder="Selecione o assunto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="access">Solicitar Acesso ao Sistema</SelectItem>
                          <SelectItem value="support">Suporte Técnico</SelectItem>
                          <SelectItem value="partnership">Parcerias e Colaborações</SelectItem>
                          <SelectItem value="feedback">Feedback e Sugestões</SelectItem>
                          <SelectItem value="press">Imprensa e Comunicação</SelectItem>
                          <SelectItem value="other">Outro Assunto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-fgv-primary-1">
                        Mensagem *
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        placeholder="Escreva sua mensagem aqui..."
                        className="min-h-[150px] border-fgv-secondary-3 focus:border-fgv-primary-2 transition-colors resize-none"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <p className="text-sm text-fgv-secondary-1">
                        * Campos obrigatórios
                      </p>
                      <Button
                        type="submit"
                        disabled={sendContactMutation.isPending}
                        className="bg-fgv-primary-2 hover:bg-fgv-primary-1 text-white px-8 transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:hover:scale-100"
                      >
                        {sendContactMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Enviar Mensagem
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-fgv-primary-1 text-white py-8 px-4 mt-12">
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

      {/* Custom styles for animations */}
      <style>{`
        @keyframes drawCheck {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(400px) rotate(720deg);
            opacity: 0;
          }
        }
        
        @keyframes sparkle {
          0%, 100% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1) rotate(180deg);
            opacity: 1;
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.5s ease-out forwards;
        }
        
        .animate-confetti {
          animation: confetti 2s ease-out forwards;
        }
        
        .animate-sparkle-1 {
          animation: sparkle 1s ease-in-out 0.3s forwards;
        }
        
        .animate-sparkle-2 {
          animation: sparkle 1s ease-in-out 0.5s forwards;
        }
        
        .animate-sparkle-3 {
          animation: sparkle 1s ease-in-out 0.7s forwards;
        }
        
        .animate-sparkle-4 {
          animation: sparkle 1s ease-in-out 0.9s forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
