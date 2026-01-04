# Debug: Erro na Consolidação - SSE Desconecta

## Problema Identificado
O cliente SSE desconecta durante a etapa de consolidação do Maestro (Passo 8).

## Logs do Servidor
```
[08:47:36] [MultiAgent] Passo 8: Maestro consolidando pareceres...
[08:47:36] [MultiAgent] Total de pareceres a consolidar: 6
[08:47:45] [SSE] Cliente desconectado da análise 270002
```

## Análise
1. A consolidação demora mais tempo que as etapas anteriores
2. O cliente SSE desconecta após ~9 segundos da consolidação
3. Quando o SSE desconecta, o frontend perde a conexão e volta para a tela anterior

## Possíveis Causas
1. Timeout do EventSource no navegador
2. Heartbeat não está sendo enviado durante a consolidação
3. A reconexão SSE não está funcionando corretamente

## Solução Proposta
1. Aumentar frequência do heartbeat para 5 segundos
2. Enviar heartbeat durante operações longas como consolidação
3. Melhorar lógica de reconexão no frontend para não resetar o estado
4. Não voltar para tela anterior quando SSE desconecta - manter estado atual
