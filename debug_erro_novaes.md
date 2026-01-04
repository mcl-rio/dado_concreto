# Debug: Erro do General Novaes Sendo Emitido Como Erro Final

## Problema Identificado
O erro "Qualidade insuficiente - Revisão solicitada" do General Novaes (que é intencional como parte do fluxo) está sendo emitido como erro final da análise via SSE.

## Logs do Servidor
```
[09:17:15] [MultiAgent] Tempo total: 500393 ms
[09:17:15] [MultiAgent] Custo total estimado: $ 1.4916
[09:17:15] [SSE] Erro na análise 270004: Qualidade insuficiente - Revisão solicitada
```

## Análise
1. A análise foi concluída com sucesso (tempo total: 500s, custo: $1.49)
2. Porém, o sistema está emitindo o erro do Novaes como erro final
3. Isso acontece porque o status do step `novaesStep1` é "error" (intencional)
4. No final da função, o código verifica se há algum step com status "error" e emite erro

## Causa Raiz
Na linha 1027-1036 do multiAgents.ts:
```typescript
analysis.status = analysis.steps.some(s => s.status === "error") ? "error" : "completed";

if (analysis.status === "error") {
  const errorStep = analysis.steps.find(s => s.status === "error");
  progressEmitter.emitError(dbAnalysisId, errorStep?.error || "Erro desconhecido na análise");
}
```

O step do Novaes (primeira avaliação) tem status "error" intencionalmente, mas isso está fazendo com que toda a análise seja marcada como erro.

## Solução
Mudar o status do step do Novaes de "error" para um novo status como "rejected" ou simplesmente não contar esse step específico na verificação de erro final.
