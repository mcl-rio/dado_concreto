# Debug: Erro durante Consolidação do Maestro - v3

## Problema Identificado
A página volta para "Pronto para Executar" durante a etapa de consolidação do Maestro.

## Logs do Servidor
- [09:00:09] Maestro consolidando pareceres running
- [09:00:09] Total de pareceres a consolidar: 6
- Após isso, a página voltou para "Pronto para Executar"

## Hipóteses
1. **SSE desconectou**: O cliente SSE pode ter desconectado durante a consolidação (que pode levar mais tempo)
2. **Erro no LLM**: A chamada ao LLM para consolidação pode ter falhado
3. **Timeout**: A consolidação pode ter excedido algum timeout

## Próximos Passos
1. Verificar se há erro no backend durante a consolidação
2. Aumentar o timeout da consolidação
3. Melhorar a reconexão do SSE para não resetar o estado da página
4. Verificar se o frontend está tratando corretamente os erros do SSE

## Solução Proposta
O problema parece ser que quando o SSE desconecta ou há erro, o frontend reseta o estado para "Pronto para Executar".
Precisamos:
1. Manter o estado de execução mesmo se o SSE desconectar
2. Tentar reconectar automaticamente sem resetar o estado
3. Adicionar polling como fallback para verificar o status da análise
