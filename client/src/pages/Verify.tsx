import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, CheckCircle, XCircle, Shield, FileText, Calendar, User, Clock, Loader2 } from "lucide-react";
import { useLocation, useParams } from "wouter";
import Breadcrumbs from "@/components/Breadcrumbs";
import { GlobeBackground } from "@/components/GlobeBackground";
import { trpc } from "@/lib/trpc";

interface VerificationResult {
  isValid: boolean;
  sessionCode?: string;
  title?: string;
  objective?: string;
  status?: string;
  createdAt?: string;
  completedAt?: string;
  authorName?: string;
  message?: string;
}

export default function Verify() {
  const [, setLocation] = useLocation();
  const params = useParams<{ code?: string }>();
  const [searchCode, setSearchCode] = useState(params.code || "");
  const [submittedCode, setSubmittedCode] = useState(params.code || "");

  // Query para verificação
  const { data: result, isLoading, error } = trpc.verification.verify.useQuery(
    { sessionCode: submittedCode },
    { enabled: !!submittedCode }
  );

  // Se houver código na URL, buscar automaticamente
  useEffect(() => {
    if (params.code) {
      setSearchCode(params.code);
      setSubmittedCode(params.code);
    }
  }, [params.code]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      setSubmittedCode(searchCode.trim().toUpperCase());
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusLabel = (status: string | undefined) => {
    const labels: Record<string, string> = {
      draft: "Rascunho",
      processing: "Em processamento",
      completed: "Concluída",
      failed: "Falhou",
      timeout: "Tempo esgotado",
      cancelled: "Cancelada",
    };
    return labels[status || ""] || status || "Desconhecido";
  };

  const getStatusColor = (status: string | undefined) => {
    const colors: Record<string, string> = {
      draft: "text-gray-500",
      processing: "text-yellow-500",
      completed: "text-green-500",
      failed: "text-red-500",
      timeout: "text-orange-500",
      cancelled: "text-gray-400",
    };
    return colors[status || ""] || "text-gray-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002D4D] via-[#003A79] to-[#002D4D] text-white relative overflow-hidden">
      <GlobeBackground />
      
      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-[#002D4D]/80 backdrop-blur-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <a href="https://dint.fgv.br/" target="_blank" rel="noopener noreferrer">
              <img
                src="/fgv-logo.png"
                alt="FGV Diretoria Internacional"
                className="h-14 w-auto"
              />
            </a>
            <Button
              variant="ghost"
              onClick={() => { setLocation("/"); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100); }}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 container py-8">
        <Breadcrumbs
          items={[
            { label: "Início", href: "/" },
            { label: "Verificação de Autenticidade" },
          ]}
        />

        <div className="max-w-3xl mx-auto mt-8">
          {/* Título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
              <Shield className="h-8 w-8 text-[var(--fgv-aux-yellow-2)]" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Verificação de Autenticidade</h1>
            <p className="text-white/70">
              Verifique a autenticidade de um relatório gerado pelo Conselho IA de Geopolítica da FGV
            </p>
          </div>

          {/* Formulário de busca */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-4">
                <Input
                  type="text"
                  placeholder="Digite o código de sessão (ex: FGV-GEO-2025-0001)"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <Button
                  type="submit"
                  disabled={!searchCode.trim() || isLoading}
                  className="bg-[#008BC9] hover:bg-[#006d9e] text-white"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Verificar
                    </>
                  )}
                </Button>
              </form>
              <p className="text-white/50 text-sm mt-3">
                O código de sessão pode ser encontrado no cabeçalho do relatório PDF ou no QR Code.
              </p>
            </CardContent>
          </Card>

          {/* Resultado da verificação */}
          {submittedCode && !isLoading && result && (
            <Card className={`border-2 backdrop-blur-sm ${
              result.isValid 
                ? "bg-green-500/10 border-green-500/30" 
                : "bg-red-500/10 border-red-500/30"
            }`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {result.isValid ? (
                    <>
                      <CheckCircle className="h-8 w-8 text-green-400" />
                      <span className="text-green-400">Documento Autêntico</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-8 w-8 text-red-400" />
                      <span className="text-red-400">Documento Não Encontrado</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.isValid ? (
                  <div className="space-y-6">
                    <p className="text-white/80">
                      Este relatório foi gerado pelo Conselho IA de Geopolítica da FGV e é autêntico.
                    </p>
                    
                    <div className="grid gap-4">
                      <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                        <Shield className="h-5 w-5 text-[var(--fgv-aux-yellow-2)] mt-0.5" />
                        <div>
                          <p className="text-white/50 text-sm">Código de Sessão</p>
                          <p className="font-mono text-lg">{'sessionCode' in result ? result.sessionCode : 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                        <FileText className="h-5 w-5 text-[var(--fgv-aux-yellow-2)] mt-0.5" />
                        <div>
                          <p className="text-white/50 text-sm">Título da Análise</p>
                          <p className="font-medium">{'title' in result ? result.title : 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                        <User className="h-5 w-5 text-[var(--fgv-aux-yellow-2)] mt-0.5" />
                        <div>
                          <p className="text-white/50 text-sm">Autor</p>
                          <p className="font-medium">{'authorName' in result ? result.authorName : 'N/A'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                          <Calendar className="h-5 w-5 text-[var(--fgv-aux-yellow-2)] mt-0.5" />
                          <div>
                            <p className="text-white/50 text-sm">Data de Criação</p>
                            <p className="font-medium text-sm">{'createdAt' in result ? formatDate(String(result.createdAt)) : 'N/A'}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                          <Clock className="h-5 w-5 text-[var(--fgv-aux-yellow-2)] mt-0.5" />
                          <div>
                            <p className="text-white/50 text-sm">Status</p>
                            <p className={`font-medium ${'status' in result ? getStatusColor(result.status) : ''}`}>
                              {'status' in result ? getStatusLabel(result.status) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {'objective' in result && result.objective && (
                        <div className="p-4 bg-white/5 rounded-lg">
                          <p className="text-white/50 text-sm mb-2">Objetivo da Análise</p>
                          <p className="text-white/80 text-sm">{result.objective}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-white/80 mb-4">
                      {'message' in result ? result.message : "O código de sessão informado não foi encontrado em nosso sistema."}
                    </p>
                    <p className="text-white/50 text-sm">
                      Verifique se o código foi digitado corretamente. O formato esperado é: FGV-GEO-AAAA-NNNN
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Informações adicionais */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm mt-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-[var(--fgv-aux-yellow-2)]" />
                Sobre a Verificação
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/70 space-y-4">
              <p>
                Todo relatório gerado pelo Conselho IA de Geopolítica da FGV possui um código de sessão único 
                que permite verificar sua autenticidade. Este código é incluído no cabeçalho do documento PDF 
                e também está disponível através do QR Code presente no relatório.
              </p>
              <p>
                A verificação confirma que o documento foi realmente gerado por nossa plataforma, 
                garantindo a integridade e procedência da análise. Não são exibidas informações 
                sensíveis ou o conteúdo completo da análise nesta verificação.
              </p>
              <p className="text-sm text-white/50">
                Em caso de dúvidas sobre a autenticidade de um documento, entre em contato com a 
                coordenação do Conselho através do{" "}
                <a href="/contact" className="text-[var(--fgv-aux-yellow-2)] hover:underline">
                  formulário de contato
                </a>.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#002D4D]/80 backdrop-blur-sm py-6 mt-12">
        <div className="container text-center text-white/50 text-sm">
          <p>© 2026 Diretoria Internacional da Fundação Getulio Vargas. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
