import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { Loader2, Mail, ArrowLeft } from "lucide-react";

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.auth.loginWithEmail.useMutation({
    onSuccess: () => {
      // Redirect to dashboard after successful login
      window.location.href = "/dashboard";
    },
    onError: (err) => {
      setError(err.message);
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !email.includes("@")) {
      setError("Por favor, insira um email válido.");
      setIsLoading(false);
      return;
    }

    loginMutation.mutate({ email: email.toLowerCase() });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003A79] via-[#002855] to-[#001a3d] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/fgv-logo.png"
            alt="FGV"
            className="h-16 mx-auto mb-4"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <h1 className="text-2xl font-bold text-white">Conselho IA de Geopolítica</h1>
          <p className="text-blue-200 mt-2">Fundação Getulio Vargas</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Entrar</CardTitle>
            <CardDescription className="text-center">
              Use seu email cadastrado para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#003A79] hover:bg-[#002855]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/")}
                className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Voltar para a página inicial
              </button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
              <strong>Primeiro acesso?</strong> Se você foi convidado pela coordenação,
              basta inserir seu email para criar sua conta automaticamente.
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-blue-200 text-sm mt-6">
          Não tem acesso? Entre em contato com a{" "}
          <a href="/contact" className="underline hover:text-white">
            coordenação do Conselho
          </a>
        </p>
      </div>
    </div>
  );
}
