# Observações da Tela de Execução

## Problemas Identificados:

1. **Nomenclatura incorreta**: Ainda mostra "elabora relatório" em vez de "elabora parecer" para os Conselheiros
2. **Falta a etapa do General Novaes**: Não aparece na lista de etapas
3. **Falta barras de progresso**: Não há barras visíveis na lista de etapas

## Etapas Atuais (incorretas):
- Maestro convoca Conselheiros ~15s
- Mackinder elabora relatório ~30s
- Mahan elabora relatório ~30s
- Spykman elabora relatório ~30s
- Kissinger elabora relatório ~30s
- Golbery elabora relatório ~30s
- Meira Mattos elabora relatório ~30s
- Maestro consolida relatórios ~20s
- Editor-Chefe revisa documento ~25s

## Etapas Corretas (a implementar):
- Maestro convoca Conselheiros ~15s
- Mackinder elabora parecer ~30s
- Mahan elabora parecer ~30s
- Spykman elabora parecer ~30s
- Kissinger elabora parecer ~30s
- Golbery elabora parecer ~30s
- Meira Mattos elabora parecer ~30s
- Maestro consolida pareceres ~20s
- **General Novaes avalia (surpresa - rejeita)** ~10s
- **Maestro aprimora relatório** ~15s
- **General Novaes aprova (surpresa)** ~5s
- Editor-Chefe revisa documento ~25s

## Mensagem de Erro:
"Você excedeu sua cota de análises. Entre em contato com a coordenação."
