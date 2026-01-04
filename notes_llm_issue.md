# Análise do Problema do Indicador LLM

## Problema Identificado
Na aba LLMs do painel admin, alguns conselheiros aparecem com os campos Provedor e Modelo vazios na UI:
- José Maria da Silva Paranhos Júnior (Barão do Rio Branco)
- Luiz Inácio Lula da Silva
- Paulino José Soares de Sousa (Visconde do Uruguai)
- Vladimir Vladimirovich Putin

## Análise dos Dados
Ao verificar a tabela `counselor_llm_config`, todos os conselheiros TÊM registros com:
- llmProvider: "gemini" 
- llmModel: "gemini-2.0-flash-exp"

Portanto, o problema NÃO é que os dados não existem no banco.

## Causa Raiz Real
O problema está na UI da aba LLMs que não está exibindo corretamente os valores "gemini" e "gemini-2.0-flash-exp" nos dropdowns. Isso pode ser porque:
1. O valor "gemini" não é uma opção válida no dropdown de provedores (pode ser que o dropdown espere "google" em vez de "gemini")
2. O modelo "gemini-2.0-flash-exp" pode não estar na lista de modelos disponíveis

## Verificação
Os conselheiros com llmProvider = "google" aparecem corretamente.
Os conselheiros com llmProvider = "gemini" aparecem com dropdown vazio.

## Solução para o Indicador
O indicador de LLM no CounselorsManagement deve verificar se o conselheiro tem um registro válido na tabela counselor_llm_config, independente do valor do provedor. Se o registro existe com llmProvider e llmModel preenchidos, deve mostrar verde.

A lógica atual está correta, mas os dados de llmConfigs podem não estar sincronizados com a tabela counselors.
