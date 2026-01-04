import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Loader2
} from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: analyses, isLoading } = trpc.analysis.list.useQuery({});

  const stats = {
    total: analyses?.length || 0,
    completed: analyses?.filter(a => a.status === 'completed').length || 0,
    processing: analyses?.filter(a => a.status === 'processing').length || 0,
    draft: analyses?.filter(a => a.status === 'draft').length || 0,
  };

  const recentAnalyses = analyses?.slice(0, 5) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'processing': return 'Processando';
      case 'failed': return 'Falhou';
      default: return 'Rascunho';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--fgv-primary-4)]">
              Olá, {user?.name?.split(' ')[0] || 'Usuário'}!
            </h1>
            <p className="text-white/80">
              Bem-vindo ao Conselho IA de Geopolítica da FGV
            </p>
          </div>
          <Button 
            onClick={() => setLocation("/analysis/new")}
            className="btn-fgv-gold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Análise
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription>Total de Análises</CardDescription>
              <CardTitle className="text-3xl text-fgv-blue">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription>Concluídas</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.completed}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription>Em Processamento</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{stats.processing}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription>Rascunhos</CardDescription>
              <CardTitle className="text-3xl text-muted-foreground">{stats.draft}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Analyses */}
        <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Análises Recentes</CardTitle>
              <CardDescription>Suas últimas análises geopolíticas</CardDescription>
            </div>
            {analyses && analyses.length > 5 && (
              <Button variant="ghost" onClick={() => setLocation("/history")}>
                Ver todas
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-fgv-blue" />
              </div>
            ) : recentAnalyses.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Você ainda não criou nenhuma análise
                </p>
                <Button 
                  onClick={() => setLocation("/analysis/new")}
                  className="btn-fgv-gold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Análise
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAnalyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setLocation(`/analysis/${analysis.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-fgv-blue/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-fgv-blue" />
                      </div>
                      <div>
                        <h3 className="font-medium">{analysis.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {analysis.objective}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        {getStatusIcon(analysis.status)}
                        <span className="hidden sm:inline">{getStatusLabel(analysis.status)}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow bg-white/95 backdrop-blur-sm border-white/20 shadow-lg"
            onClick={() => setLocation("/analysis/new")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[var(--fgv-aux-yellow-2)]/20 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-fgv-blue" />
                </div>
                <div>
                  <h3 className="font-semibold">Nova Análise</h3>
                  <p className="text-sm text-muted-foreground">Criar uma nova análise geopolítica</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow bg-white/95 backdrop-blur-sm border-white/20 shadow-lg"
            onClick={() => setLocation("/history")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-fgv-blue/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-fgv-blue" />
                </div>
                <div>
                  <h3 className="font-semibold">Histórico</h3>
                  <p className="text-sm text-muted-foreground">Ver análises salvas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {(user?.role === 'administrador' || user?.role === 'diretor') && (
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow bg-white/95 backdrop-blur-sm border-white/20 shadow-lg"
              onClick={() => setLocation("/admin")}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Configurações</h3>
                    <p className="text-sm text-muted-foreground">Ajustes do sistema</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
