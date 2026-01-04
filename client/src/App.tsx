import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import NewAnalysis from "./pages/NewAnalysis";
import AnalysisDetail from "./pages/AnalysisDetail";
import AdminPanel from "./pages/AdminPanel";
import History from "./pages/History";
import AnalystProfile from "./pages/AnalystProfile";
import Coordination from "./pages/Coordination";
import Method from "./pages/Method";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import About from "./pages/About";
import NovAIsProfile from "./pages/NovAIsProfile";
import Verify from "./pages/Verify";
import PageTransition from "./components/PageTransition";

function Router() {
  return (
    <PageTransition>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/analysis/new" component={NewAnalysis} />
        <Route path="/analysis/:id" component={AnalysisDetail} />
        <Route path="/history" component={History} />
        <Route path="/admin" component={AdminPanel} />
        <Route path="/conselheiro/:analystId" component={AnalystProfile} />
        <Route path="/coordination" component={Coordination} />
        <Route path="/coordenador/novais" component={NovAIsProfile} />
        <Route path="/method" component={Method} />
        <Route path="/faq" component={FAQ} />
        <Route path="/contact" component={Contact} />
        <Route path="/about" component={About} />
        <Route path="/verify" component={Verify} />
        <Route path="/verify/:code" component={Verify} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </PageTransition>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          {/* Toaster removido - mensagens de notificação desabilitadas */}
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
