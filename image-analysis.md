# Análise de Enquadramento das Imagens dos Conselheiros

## Problema Identificado
As imagens dos conselheiros na galeria da página principal têm enquadramentos diferentes:
- Mackinder: rosto mais centralizado
- Mahan: rosto mais para cima
- Spykman: rosto mais centralizado
- Kissinger: rosto mais para baixo (óculos visíveis)
- Golbery: rosto mais centralizado
- Meira Mattos: rosto mais para cima

## Solução
Usar object-position específico para cada imagem para centralizar todos os rostos de forma uniforme, ou usar um enquadramento mais genérico que funcione para todas as imagens.

A melhor abordagem é usar object-top para todas as imagens, já que os retratos geralmente têm o rosto na parte superior.
