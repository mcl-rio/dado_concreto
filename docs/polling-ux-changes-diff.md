# Diff das Alterações de Polling e UX do Passo 6

## Resumo das Alterações

Este documento descreve as alterações feitas no componente `NewAnalysis.tsx` para melhorar o comportamento de polling e a experiência visual do Passo 6 (Sessão do Conselho).

---

## 1. Novos Estados de Controle de Polling

**Localização:** Linhas 363-365

```diff
  // Estados de SSE removidos - fluxo simplificado com polling
  
+ // Estados para controle de polling do status da análise
+ const [isPollingActive, setIsPollingActive] = useState(false);
+ const [pollingError, setPollingError] = useState<string | null>(null);
+ 
  // Estado para progresso da geração de estrutura
```

**Descrição:** Adicionados dois novos estados:
- `isPollingActive`: controla se o polling está ativo (para exibir/ocultar spinner)
- `pollingError`: armazena mensagem de erro amigável quando a análise falha

---

## 2. Intervalo de Polling Alterado de 5s para 10s

**Localização:** Linha 1170

```diff
-      }, 5000); // Polling a cada 5 segundos
+      }, 10000); // Polling a cada 10 segundos (alterado de 5s para 10s)
```

**Descrição:** O intervalo entre verificações de status foi aumentado de 5 para 10 segundos.

---

## 3. Lógica de Polling Atualizada

**Localização:** Linhas 1132-1170

```diff
      // A análise executa em background, polling verifica o status
      console.log('[Execution] Análise iniciada em background:', result);
      
+     // Ativar estado de polling
+     setIsPollingActive(true);
+     setPollingError(null);
+     
      // Iniciar polling para verificar status usando fetch direto
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/trpc/analysis.get?input=${encodeURIComponent(JSON.stringify({ id: analysisId }))}`);
          const json = await response.json();
          const analysisData = json?.result?.data;
          console.log('[Polling] Status:', analysisData?.status);
          
          if (analysisData?.status === 'completed' && analysisData?.generatedContent) {
+           // Parar polling imediatamente quando status for completed
            clearInterval(pollInterval);
+           setIsPollingActive(false);
            setGeneratedContent(analysisData.generatedContent);
            setExecutionEndTime(Date.now());
            setExecutionSteps(prev => prev.map(s => ({ ...s, status: "completed" as const })));
            setIsExecuting(false);
            console.log('[Polling] Análise concluída!');
-         } else if (analysisData?.status === 'error') {
+         } else if (analysisData?.status === 'error' || analysisData?.status === 'failed') {
+           // Parar polling imediatamente quando status for failed/error
            clearInterval(pollInterval);
+           setIsPollingActive(false);
+           setPollingError('Ocorreu um problema ao gerar o relatório. Tente novamente mais tarde ou entre em contato com a coordenação.');
            setExecutionSteps(prev => prev.map(s => 
              s.status === "running" ? { ...s, status: "error" as const, error: "Erro na análise" } : s
            ));
            setIsExecuting(false);
            console.log('[Polling] Erro na análise');
          }
        } catch (err) {
          console.error('[Polling] Erro ao verificar status:', err);
        }
      }, 10000); // Polling a cada 10 segundos (alterado de 5s para 10s)
```

**Descrição:** 
- Ativa `isPollingActive` ao iniciar o polling
- Para o polling imediatamente quando status é `completed` ou `failed`
- Define mensagem de erro amigável quando status é `failed`

---

## 4. Indicador Visual de Polling na UI

**Localização:** Linhas 2921-2937 (dentro do cabeçalho do painel de progresso)

```diff
                              <div>
                                <p className="font-bold text-lg text-[var(--fgv-primary-1)]">
-                                 {generatedContent ? "Sessão Encerrada" : "Conselho em Sessão"}
+                                 {pollingError ? "Erro na Sessão" : generatedContent ? "Sessão Encerrada" : "Conselho em Sessão"}
                                </p>
                                <p className="text-sm text-[var(--fgv-secondary-2)]">
                                  {totalSteps > 0 ? `${completedSteps} de ${totalSteps} etapas • ` : ""}{formatTime(elapsedTime)}
                                </p>
+                               {/* Indicador de polling ativo */}
+                               {isPollingActive && !generatedContent && !pollingError && (
+                                 <div className="flex items-center gap-2 mt-1">
+                                   <Loader2 className="w-3 h-3 animate-spin text-[var(--fgv-primary-3)]" />
+                                   <span className="text-xs text-[var(--fgv-primary-3)]">
+                                     Verificando o status da Sessão do Conselho...
+                                   </span>
+                                 </div>
+                               )}
                              </div>
```

**Descrição:** 
- Exibe spinner discreto e mensagem "Verificando o status da Sessão do Conselho..." enquanto polling está ativo
- Esconde automaticamente quando `generatedContent` é preenchido ou quando há erro

---

## 5. Mensagem de Erro Amigável

**Localização:** Linhas 3449-3464 (novo bloco antes do aviso de conclusão)

```diff
+                   {/* Aviso de Erro na Sessão */}
+                   {pollingError && (
+                     <div className="p-4 bg-red-50 border-2 border-red-500 rounded-lg mb-4 animate-fade-in">
+                       <div className="flex items-center gap-3">
+                         <div className="p-2 rounded-full bg-red-500">
+                           <AlertCircle className="w-6 h-6 text-white" />
+                         </div>
+                         <div>
+                           <h4 className="font-bold text-red-700 text-lg">Erro na Sessão do Conselho</h4>
+                           <p className="text-red-600 text-sm">
+                             {pollingError}
+                           </p>
+                         </div>
+                       </div>
+                     </div>
+                   )}
+                   
                    {/* Aviso de Conclusão do Debate */}
-                   {generatedContent && (
+                   {generatedContent && !pollingError && (
                      <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg mb-4 animate-fade-in">
```

**Descrição:** 
- Exibe mensagem de erro amigável quando `pollingError` está definido
- Mensagem: "Ocorreu um problema ao gerar o relatório. Tente novamente mais tarde ou entre em contato com a coordenação."
- Esconde o aviso de conclusão quando há erro

---

## Fluxo de Estados

```
┌─────────────────┐
│ Início Polling  │
│ isPollingActive │
│ = true          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────────┐
│ Polling a cada  │────▶│ Status = completed   │
│ 10 segundos     │     │ isPollingActive=false│
└────────┬────────┘     │ Exibe relatório      │
         │              └──────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Status = failed/error   │
│ isPollingActive = false │
│ pollingError = mensagem │
│ Exibe erro amigável     │
└─────────────────────────┘
```

---

## Resumo Visual

| Estado | Spinner | Mensagem | Relatório | Erro |
|--------|---------|----------|-----------|------|
| Polling ativo | ✅ Visível | "Verificando o status..." | Oculto | Oculto |
| Completed | ❌ Oculto | Oculta | ✅ Visível | Oculto |
| Failed | ❌ Oculto | Oculta | Oculto | ✅ Visível |

---

**Arquivo:** `client/src/pages/NewAnalysis.tsx`  
**Data:** 31/12/2025
