# Relatório Completo: Passo 6 – Sessão do Conselho

## O que acontece quando você clica em "Iniciar Análise"

Este documento explica, de forma clara e acessível, todo o processo que ocorre nos bastidores quando você inicia o **Passo 6 – Sessão do Conselho** no sistema de análise geopolítica da FGV. Mesmo sem conhecimentos técnicos de informática, você conseguirá entender como a inteligência artificial trabalha para produzir seu relatório.

---

## Visão Geral do Processo

Quando você chega ao Passo 6, já passou por cinco etapas anteriores: definiu sua proposta de pesquisa, recebeu a avaliação do GennovAIs, estruturou o projeto, escolheu os conselheiros e confirmou o pagamento. Agora, o sistema inicia uma verdadeira "reunião virtual" entre especialistas de inteligência artificial.

O processo completo do Passo 6 pode ser dividido em **cinco grandes momentos**, que acontecem automaticamente e em sequência:

| Momento | Nome | Duração Aproximada | O que acontece |
|---------|------|-------------------|----------------|
| 1 | Convocação da Sessão | 2-3 segundos | O GennovAIs "abre a reunião" e convoca os conselheiros |
| 2 | Elaboração dos Pareceres | 45-60 segundos por conselheiro | Cada conselheiro escreve sua análise individual |
| 3 | Avaliação pelo GennovAIs | 10-15 segundos por parecer | O coordenador avalia e aprova (ou pede revisão) de cada parecer |
| 4 | Consolidação Final | 40-50 segundos | O Max Weber unifica todos os pareceres em um único relatório |
| 5 | Salvamento e Conclusão | Alguns segundos | O sistema salva o relatório e prepara para exportação |

---

## Momento 1: Convocação da Sessão

### O que você vê na tela

Quando o Passo 6 inicia, você verá uma tela mostrando:
- Um **código de rastreabilidade** (exemplo: "FGV-2026-001") que identifica sua análise
- O **título** da sua análise
- A lista de **participantes**: GennovAIs (Moderador), os Conselheiros que você escolheu, e Max Weber (Editor)
- O **horário de início** da sessão

### O que acontece nos bastidores

Imagine que o GennovAIs é um coordenador de reunião. Neste momento, ele está:

1. **Preparando a sala de reuniões virtual**: O sistema carrega todas as informações da sua análise (título, objetivo, fontes, estrutura definida)

2. **Enviando convites aos conselheiros**: O sistema identifica quais conselheiros você selecionou e prepara as "instruções" específicas para cada um

3. **Organizando os materiais**: Todas as fontes que você forneceu (notícias, documentos, links) são organizadas e preparadas para serem consultadas pelos conselheiros

O GennovAIs gera uma mensagem de convocação, algo como: *"GennovAIs convoca 4 Conselheiros para analisar: A influência da China na América Latina..."*

#### Detalhamento técnico dos bastidores

Nesta etapa, o sistema executa uma série de operações técnicas que preparam toda a infraestrutura necessária para a análise. Vamos detalhar cada uma delas:

**Carregamento dos Conselheiros do Banco de Dados**

Para cada conselheiro que você selecionou, o sistema busca no banco de dados todas as informações cadastradas sobre ele. Isso inclui não apenas o nome e a teoria principal, mas também a configuração de qual modelo de IA será utilizado (Gemini ou Claude) e qual "personalidade" foi definida pelo administrador.

O sistema executa uma consulta para cada conselheiro selecionado, recuperando dados como: nome completo, nacionalidade, período histórico, áreas de especialização, teoria principal, biografia resumida, estilo de escrita e abordagem analítica. Todos esses dados são combinados para criar o "perfil completo" que será usado nas etapas seguintes.

**Geração da Mensagem de Convocação**

Para criar a mensagem de abertura da sessão, o sistema utiliza um modelo de IA rápido chamado Gemini Flash. Este modelo foi escolhido especificamente para tarefas de coordenação porque responde em menos de 2 segundos, permitindo uma experiência fluida para o usuário.

O prompt enviado ao Gemini Flash para gerar a mensagem de convocação segue este formato:

> **Prompt de Sistema (instruções para a IA):**
> "Você é o GennovAIs, Coordenador do Conselho de Geopolítica da FGV. Gere UMA FRASE CURTA (máximo 2 linhas) no estilo militar bem-humorado para o contexto dado. Seja direto, engraçado e mantenha o tom de um general coordenando uma reunião caótica de intelectuais. NÃO use emojis. NÃO use bullet points. Apenas uma frase curta e direta."
>
> **Prompt de Usuário (contexto específico):**
> "Contexto: O GennovAIs está convocando 4 Conselheiros para analisar: 'A influência da China na América Latina'. Gere uma frase de abertura da sessão."

A IA então responde com algo como: *"Atenção, senhores Conselheiros! O General convoca a sessão. Temos quatro mentes brilhantes para desvendar os movimentos do Dragão na América Latina. Que comece o debate!"*

**Preparação do Contexto Completo**

Enquanto a mensagem de convocação é gerada, o sistema também prepara o "pacote de informações" que será enviado a cada conselheiro. Este pacote inclui:

| Componente | Descrição | Exemplo |
|------------|-----------|---------|
| Título da Análise | O objetivo principal definido no Passo 1 | "A influência da China na América Latina" |
| Contexto Adicional | Informações complementares do Passo 2 | "Foco nos últimos 5 anos, especialmente investimentos em infraestrutura" |
| Fontes Disponíveis | Textos de notícias, documentos e conteúdo de URLs | 5 notícias + 2 documentos PDF + 3 páginas web |
| Estrutura do Relatório | O formato aprovado no Passo 3 | "1. Introdução, 2. Contexto Histórico, 3. Análise Setorial..." |

Se você habilitou a opção "Busca na Web", o sistema também executa uma pesquisa automática na internet usando o título da sua análise como termo de busca. Os resultados (até 5 páginas) são baixados, processados e adicionados às fontes disponíveis.

**Carregamento de Mensagens Personalizadas**

O sistema também carrega do banco de dados as mensagens criativas que serão exibidas durante o processo. Existem três tipos de mensagens:
- **Mensagens de aprovação**: Frases que o GennovAIs usa quando aprova um parecer
- **Mensagens de rejeição**: Frases usadas quando pede revisão
- **Mensagens de coordenação**: Frases gerais sobre o andamento da sessão

Essas mensagens são configuráveis pelo administrador do sistema e dão personalidade ao processo.

---

## Momento 2: Elaboração dos Pareceres

### O que você vê na tela

A interface mostra:
- O nome do conselheiro que está trabalhando no momento
- Uma **barra de progresso** que avança de 0% a 100%
- **Mensagens criativas** que descrevem o que o conselheiro está fazendo (atualizadas a cada 5 segundos)
- O **tempo estimado** para conclusão

### O que acontece nos bastidores

Este é o momento mais importante e demorado. Para **cada conselheiro** que você selecionou, acontece o seguinte:

#### Passo 2.1: Preparação do Conselheiro

O sistema monta um "briefing" completo para o conselheiro, contendo:
- O título e objetivo da análise
- Todo o contexto adicional que você forneceu
- Todas as fontes disponíveis (textos de notícias, conteúdo de documentos, etc.)
- A estrutura do relatório que foi definida no Passo 3
- A "personalidade" do conselheiro (sua perspectiva teórica e forma de pensar)

#### Passo 2.2: Geração do Parecer

O conselheiro (que é uma inteligência artificial especializada) recebe todas essas informações e começa a escrever seu parecer. Cada conselheiro tem uma **perspectiva teórica única**:

| Conselheiro | Teoria Principal | Como ele analisa |
|-------------|-----------------|------------------|
| Mackinder | Teoria do Heartland | Foca em quem controla o "coração da terra" (Eurásia) |
| Mahan | Poder Marítimo | Analisa o controle dos mares e rotas comerciais |
| Spykman | Teoria do Rimland | Observa as regiões costeiras e sua importância estratégica |
| Brzezinski | Tabuleiro de Xadrez | Vê a geopolítica como um jogo de poder entre grandes potências |
| Kissinger | Realismo Diplomático | Analisa o equilíbrio de poder e a diplomacia |
| Mearsheimer | Realismo Ofensivo | Foca na competição entre grandes potências |

O parecer gerado é um texto discursivo (sem bullet points), com análise profunda baseada na perspectiva teórica do conselheiro.

#### Passo 2.3: Verificação de Qualidade
Antes de prosseguir, o sistema verifica se o parecer tem qualidade mínima:
- O texto precisa ter pelo menos 500 caracteres
- Se for muito curto, o sistema considera que houve um problema e pode tentar novamente

#### Detalhamento técnico dos bastidores

Esta é a etapa mais complexa do sistema, onde múltiplas chamadas a modelos de IA são orquestradas para produzir análises de alta qualidade. Vamos examinar cada componente em detalhes.

**Construção do System Prompt (Instruções de Personalidade)**

Cada conselheiro possui um "system prompt" que define sua personalidade e forma de pensar. Este prompt é construído dinamicamente a partir dos dados cadastrados no banco de dados. Por exemplo, para Halford J. Mackinder, o system prompt seria montado assim:

> **System Prompt do Mackinder:**
> "Você é Halford J. Mackinder, geógrafo e geopolítico britânico, criador da Teoria do Heartland.
>
> Sua principal teoria é a Teoria do Heartland, que postula que quem controla a região central da Eurásia (o 'Heartland') controla o 'Ilha-Mundo' (Eurásia-África), e quem controla a Ilha-Mundo controla o mundo.
>
> Estilo de escrita: Acadêmico, formal, com referências históricas e geográficas.
>
> Abordagem de análise: Sempre analisa questões geopolíticas através da lente do controle territorial e da importância estratégica das massas continentais."

Se o administrador configurou uma "personalidade adicional" para o conselheiro (por exemplo, "seja mais provocativo em suas análises"), essa informação é adicionada ao final do system prompt.

**Construção do Prompt de Tarefa**

Além do system prompt, cada conselheiro recebe um "prompt de tarefa" que contém as instruções específicas sobre o que deve ser produzido. Este prompt é um template que é preenchido com os dados da análise:

> **Prompt de Tarefa (template):**
> "TÍTULO DA ANÁLISE: {título}
>
> CONTEXTO ADICIONAL: {contexto}
>
> FONTES DISPONÍVEIS:
> {lista de todas as fontes com seus conteúdos}
>
> ESTRUTURA DO RELATÓRIO (siga esta estrutura):
> {estrutura definida no Passo 3}
>
> ---
>
> Como {nome do conselheiro}, especialista em {teoria principal}, elabore seu parecer sobre o tema proposto.
>
> INSTRUÇÕES:
> 1. Leia TODAS as fontes fornecidas cuidadosamente
> 2. Considere o título, contexto e objetivos da análise
> 3. Aplique sua perspectiva teórica específica ({teoria principal})
> 4. Escreva em TEXTO CORRIDO, DISCURSIVO, em parágrafos bem desenvolvidos
> 5. NUNCA use bullet points, listas numeradas ou marcadores
> 6. Seja OBJETIVO e DIRETO na redação
> 7. Fundamente todas as afirmações em evidências ou teoria
> 8. Siga a estrutura do relatório definida (se houver)
>
> Seu parecer deve ser denso, profundo e revelar seu conhecimento e experiência como um dos maiores pensadores geopolíticos da história."

**Exemplo Concreto de Prompt Enviado à IA**

Para ilustrar melhor, veja um exemplo completo de como seria o prompt enviado ao modelo de IA para o conselheiro Mackinder analisar "A influência da China na América Latina":

> **Prompt completo enviado ao Gemini:**
>
> "TÍTULO DA ANÁLISE: A influência da China na América Latina nos últimos 5 anos
>
> CONTEXTO ADICIONAL: Foco em investimentos em infraestrutura, especialmente portos e ferrovias. Considerar também acordos comerciais e empréstimos.
>
> FONTES DISPONÍVEIS:
>
> [Fonte 1] Notícia do Financial Times - 15/12/2025
> 'China investe US$ 50 bilhões em portos latino-americanos...'
> (conteúdo completo da notícia)
>
> [Fonte 2] Relatório do BID - Novembro/2025
> 'Análise dos investimentos chineses em infraestrutura...'
> (conteúdo completo do relatório)
>
> [Fonte 3] Artigo acadêmico da Foreign Affairs
> 'The Dragon in the Americas: China's Growing Influence...'
> (conteúdo completo do artigo)
>
> ---
>
> ESTRUTURA DO RELATÓRIO:
> 1. Introdução
> 2. Contexto Histórico das Relações China-América Latina
> 3. Análise dos Investimentos em Infraestrutura
> 4. Implicações Geopolíticas
> 5. Conclusões e Perspectivas
>
> ---
>
> Como Halford J. Mackinder, especialista em Teoria do Heartland, elabore seu parecer sobre o tema proposto.
>
> INSTRUÇÕES:
> 1. Leia TODAS as fontes fornecidas cuidadosamente
> 2. Considere o título, contexto e objetivos da análise
> 3. Aplique sua perspectiva teórica específica (Teoria do Heartland)
> 4. Escreva em TEXTO CORRIDO, DISCURSIVO, em parágrafos bem desenvolvidos
> 5. NUNCA use bullet points, listas numeradas ou marcadores
> 6. Seja OBJETIVO e DIRETO na redação
> 7. Fundamente todas as afirmações em evidências ou teoria
> 8. Siga a estrutura do relatório definida
>
> Seu parecer deve ser denso, profundo e revelar seu conhecimento e experiência como um dos maiores pensadores geopolíticos da história."

**Chamada à API do Modelo de IA**

Com o prompt completo montado, o sistema faz uma chamada HTTP para a API do modelo de IA configurado para aquele conselheiro. Dependendo da configuração, pode ser:

| Modelo | Provedor | Características |
|--------|----------|-----------------|
| Gemini 2.5 Pro | Google | Modelo principal, boa capacidade analítica, custo moderado |
| Gemini 2.0 Flash | Google | Modelo rápido, usado para coordenação e tarefas simples |
| Claude 3.7 Sonnet | Anthropic | Excelente para análises complexas, custo mais alto |

A chamada à API inclui parâmetros como:
- **Temperature**: Controla a "criatividade" da resposta (0.85 para conselheiros, 0.6 para GennovAIs, 0.3 para Max Weber)
- **Max Tokens**: Limite máximo de tokens na resposta (16.384 para análises completas)
- **Timeout**: Tempo máximo de espera (180 segundos para análises, 15 segundos para coordenação)

**Fluxo de Dados Durante a Geração**

Enquanto a IA está gerando o parecer, o sistema mantém um "heartbeat" (batimento cardíaco) que atualiza a interface a cada 5 segundos. Este heartbeat:
1. Incrementa a barra de progresso (de 25% até 85%)
2. Seleciona uma nova mensagem criativa do banco de dados
3. Envia essas atualizações para a interface do usuário

Quando a IA termina de gerar o parecer, o sistema:
1. Recebe o texto completo da resposta
2. Extrai informações de uso de tokens (quantos tokens de entrada e saída foram usados)
3. Calcula o custo estimado baseado nos preços configurados
4. Registra tudo no banco de dados para fins de auditoria e cobrança

**Registro de Uso e Custos**

Cada chamada à IA é registrada no banco de dados com os seguintes dados:

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| userId | ID do usuário que solicitou | 42 |
| analysisId | ID da análise | 156 |
| counselorId | ID do conselheiro | "mackinder" |
| llmProvider | Provedor do modelo | "google" |
| llmModel | Nome do modelo | "gemini-2.5-pro" |
| inputTokens | Tokens de entrada | 4.523 |
| outputTokens | Tokens de saída | 2.847 |
| costUsd | Custo em dólares | 0.0234 |
| temperature | Temperatura usada | 0.85 |
| requestType | Tipo de requisição | "individual_report" |

---

## Momento 3: Avaliação pelo GennovAIs

### O que você vê na tela

Após cada conselheiro terminar seu parecer, você verá:
- Uma mensagem indicando que o GennovAIs está avaliando o parecer
- O resultado: ✅ **Aprovado** ou ❌ **Rejeitado**
- Se rejeitado, uma mensagem explicando o motivo

### O que acontece nos bastidores

O GennovAIs funciona como um "controle de qualidade". Ele analisa cada parecer verificando:

1. **Profundidade da análise**: O parecer aborda o tema com profundidade suficiente?
2. **Fundamentação teórica**: O conselheiro aplicou corretamente sua perspectiva teórica?
3. **Coerência**: O texto faz sentido e está bem estruturado?
4. **Relevância**: O parecer responde ao objetivo da análise?

#### Se o parecer for APROVADO

O GennovAIs gera uma mensagem de aprovação, como: *"Aprovado com louvor! Parecer digno de um estrategista de primeira linha. Parabéns, Conselheiro!"*

O parecer é salvo no banco de dados e marcado como aprovado.

#### Se o parecer for REJEITADO

O GennovAIs gera uma mensagem de rejeição com feedback específico, como: *"Negativo, Conselheiro! Isso aqui parece relatório de recruta em primeiro dia de quartel. Refazer com mais rigor!"*

O conselheiro recebe o feedback e **tenta novamente** (até 2 tentativas adicionais). Na nova tentativa, o conselheiro leva em conta as críticas do GennovAIs para melhorar seu parecer.

#### Detalhamento técnico dos bastidores

A avaliação pelo GennovAIs é uma das etapas mais interessantes do sistema, pois envolve uma IA avaliando o trabalho de outra IA. Vamos examinar como isso funciona.

**O System Prompt do GennovAIs Avaliador**

O GennovAIs possui um prompt específico para a função de avaliação, que define os critérios de qualidade:

> **System Prompt do GennovAIs (Avaliador):**
> "Você é o GennovAIs, Coordenador do Conselho de Geopolítica da FGV. Sua função é avaliar a qualidade dos pareceres elaborados pelos Conselheiros.
>
> Critérios de avaliação:
> 1. O parecer está em formato discursivo (texto corrido, sem bullet points)?
> 2. A análise é objetiva e fundamentada?
> 3. O conhecimento geopolítico específico do Conselheiro foi aplicado corretamente?
> 4. O texto tem profundidade analítica adequada?
> 5. A redação é acadêmica e precisa?
>
> Você deve responder SEMPRE em formato JSON com a seguinte estrutura:
> {
>   "aprovado": true/false,
>   "feedback": "Comentário sobre a qualidade do parecer",
>   "melhorias_necessarias": ["Lista de melhorias específicas se não aprovado"]
> }
>
> Seja rigoroso mas justo. Aprove pareceres que atendam aos padrões de excelência da FGV."

**O Prompt de Avaliação**

Para cada parecer, o sistema monta um prompt de avaliação que inclui o texto completo do parecer:

> **Prompt de Avaliação:**
> "Avalie o seguinte parecer elaborado por Halford J. Mackinder (Teoria do Heartland):
>
> PARECER:
> [texto completo do parecer gerado pelo conselheiro]
>
> ---
>
> Avalie se o parecer atende aos critérios de qualidade. Responda em JSON."

**Processamento da Resposta JSON**

O GennovAIs (usando o modelo Claude) responde em formato JSON. O sistema então processa essa resposta:

```json
{
  "aprovado": true,
  "feedback": "Parecer de excelente qualidade. O Conselheiro Mackinder demonstrou domínio da Teoria do Heartland, aplicando-a de forma criativa ao contexto latino-americano. A análise sobre os investimentos chineses em portos como uma estratégia de controle de pontos de acesso marítimo está bem fundamentada.",
  "melhorias_necessarias": []
}
```

Ou, em caso de rejeição:

```json
{
  "aprovado": false,
  "feedback": "O parecer apresenta análise superficial e não aplica adequadamente a Teoria do Heartland ao contexto proposto.",
  "melhorias_necessarias": [
    "Aprofundar a conexão entre os investimentos chineses e a teoria do controle territorial",
    "Incluir análise sobre como a presença chinesa na América Latina afeta o equilíbrio de poder global",
    "Fundamentar melhor as afirmações com dados das fontes fornecidas"
  ]
}
```

**O Ciclo de Retry (Tentativas de Melhoria)**

Se o parecer for rejeitado, o sistema inicia um ciclo de retry. O conselheiro recebe um novo prompt que inclui o feedback do GennovAIs:

> **Prompt de Retry:**
> "TÍTULO DA ANÁLISE: A influência da China na América Latina nos últimos 5 anos
>
> [todas as fontes e contexto novamente]
>
> ---
>
> FEEDBACK DO GENERAL NOVAES (Coordenador):
> Aprofundar a conexão entre os investimentos chineses e a teoria do controle territorial; Incluir análise sobre como a presença chinesa na América Latina afeta o equilíbrio de poder global; Fundamentar melhor as afirmações com dados das fontes fornecidas.
>
> Reelabore seu parecer atendendo às observações acima.
>
> ---
>
> Como Halford J. Mackinder, especialista em Teoria do Heartland, elabore seu parecer sobre o tema proposto..."

O sistema permite até 2 tentativas adicionais (3 no total). Se após todas as tentativas o parecer ainda não for aprovado, o sistema registra um erro e continua com os demais conselheiros.

**Geração de Mensagens Dinâmicas**

Para tornar a experiência mais envolvente, o sistema gera mensagens dinâmicas usando o Gemini Flash. Por exemplo, quando um parecer é aprovado:

> **Prompt para mensagem de aprovação:**
> "Contexto: O GennovAIs APROVOU o parecer de Halford J. Mackinder. Gere uma frase de aprovação militar."
>
> **Resposta da IA:**
> "Excelente trabalho, Conselheiro Mackinder! Sua análise demonstra a precisão de um estrategista veterano. O General está satisfeito!"

**Salvamento do Parecer Aprovado**

Quando um parecer é aprovado, ele é salvo no banco de dados na tabela `counselor_opinions` com os seguintes dados:

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| analysisId | ID da análise | 156 |
| counselorId | ID do conselheiro | "mackinder" |
| counselorName | Nome completo | "Halford J. Mackinder" |
| opinionContent | Texto completo do parecer | "A presença chinesa na América Latina..." |
| status | Status do parecer | "approved" |
| reviewerFeedback | Feedback do GennovAIs | "Parecer de excelente qualidade..." |
| reviewedAt | Data/hora da aprovação | 2026-01-01 14:35:22 |

---

## Momento 4: Consolidação Final pelo Max Weber

### O que você vê na tela

Quando todos os pareceres estão aprovados, você verá:
- Uma mensagem indicando que o Max Weber está consolidando o relatório
- Uma barra de progresso que avança enquanto o trabalho é realizado
- Mensagens criativas sobre o processo de consolidação

### O que acontece nos bastidores

O Max Weber é o "editor final" do sistema. Sua função é pegar todos os pareceres individuais e transformá-los em um **único documento coeso**. Veja o que ele faz:

#### Passo 4.1: Reunião dos Pareceres

O sistema coleta todos os pareceres aprovados e os organiza. Por exemplo, se você selecionou 4 conselheiros, o Max Weber receberá 4 textos diferentes, cada um com uma perspectiva teórica distinta.

#### Passo 4.2: Integração das Perspectivas

O Max Weber analisa os pareceres e identifica:
- **Pontos de convergência**: Onde os conselheiros concordam
- **Pontos de divergência**: Onde há visões diferentes
- **Complementaridades**: Como uma perspectiva enriquece a outra

#### Passo 4.3: Redação do Relatório Final

O Max Weber escreve o relatório final seguindo regras específicas:

1. **NÃO menciona os nomes dos conselheiros** – O relatório parece ter sido escrito por uma única voz
2. **Segue a estrutura definida no Passo 3** – Respeita os capítulos e seções que você aprovou
3. **Usa estilo discursivo** – Texto corrido, sem bullet points, com qualidade acadêmica
4. **Integra as perspectivas** – As diferentes visões são combinadas de forma harmoniosa

#### Passo 4.4: Adição dos Metadados

Ao final, o sistema adiciona um bloco de informações no início do relatório:

```
## Dados da Sessão do Conselho

**Data:** 01/01/2026
**Horário:** 14:30 – 14:45
**Solicitante:** João Silva – joao.silva@email.com
**Participantes:**
- **Moderador:** General Novaes (GennovAIs)
- **Editor:** Max Weber
- **Conselheiros:** Mackinder, Mahan, Brzezinski, Kissinger
```

#### Detalhamento técnico dos bastidores

A consolidação é a etapa final de processamento de IA e também a mais complexa em termos de integração de conteúdo. Vamos examinar cada aspecto.

**O System Prompt do Max Weber**

O Max Weber possui um prompt detalhado que define sua função de editor e consolidador:

> **System Prompt do Max Weber:**
> "Você é o Max Weber do Conselho de Geopolítica da FGV. Você trabalha em conjunto com o GennovAIs para consolidar os pareceres aprovados dos Conselheiros em um único relatório final.
>
> CONTEXTO DA SESSÃO DO CONSELHO:
> O GennovAIs convocou a Sessão do Conselho e cada Conselheiro apresentou seu parecer individual. Após avaliação rigorosa do GennovAIs, todos os pareceres foram aprovados. Agora, você e o GennovAIs devem unificar essas perspectivas em um relatório coeso.
>
> REGRAS OBRIGATÓRIAS:
> 1. O relatório final NÃO DEVE mencionar os nomes dos Conselheiros
> 2. O relatório DEVE seguir a estrutura aprovada pelo usuário
> 3. Integre as diferentes perspectivas de forma coesa e fluida
> 4. Mantenha o estilo discursivo (texto corrido, sem bullet points)
> 5. Elimine redundâncias e contradições
> 6. Garanta qualidade acadêmica compatível com publicações da FGV
>
> O documento final deve:
> - Apresentar argumentação rigorosa e bem estruturada
> - Integrar as diferentes perspectivas teóricas de forma equilibrada
> - Oferecer conclusões fundamentadas em evidências
> - Manter tom acadêmico formal e objetivo
> - Estar pronto para publicação ou apresentação institucional
>
> IMPORTANTE: Não mencione 'Conselheiro' ou qualquer referência aos nomes dos analistas no texto final. As ideias devem ser apresentadas como análise integrada do Conselho.
>
> Responda sempre em português brasileiro, com excelência acadêmica."

**Montagem do Prompt de Consolidação**

O prompt de consolidação é o maior e mais complexo de todo o sistema. Ele inclui todos os pareceres aprovados, organizados por perspectiva teórica:

> **Prompt de Consolidação:**
> "TÍTULO DA ANÁLISE: A influência da China na América Latina nos últimos 5 anos
>
> CONTEXTO ADICIONAL: Foco em investimentos em infraestrutura, especialmente portos e ferrovias.
>
> PARECERES DOS CONSELHEIROS (4 pareceres aprovados):
>
> === PARECER 1 (Perspectiva: Teoria do Heartland) ===
>
> [texto completo do parecer do Mackinder - aproximadamente 2.000 palavras]
>
> ---
>
> === PARECER 2 (Perspectiva: Poder Marítimo) ===
>
> [texto completo do parecer do Mahan - aproximadamente 2.000 palavras]
>
> ---
>
> === PARECER 3 (Perspectiva: Tabuleiro de Xadrez) ===
>
> [texto completo do parecer do Brzezinski - aproximadamente 2.000 palavras]
>
> ---
>
> === PARECER 4 (Perspectiva: Realismo Diplomático) ===
>
> [texto completo do parecer do Kissinger - aproximadamente 2.000 palavras]
>
> ---
>
> ESTRUTURA DO RELATÓRIO (OBRIGATÓRIA):
> 1. Introdução
> 2. Contexto Histórico das Relações China-América Latina
> 3. Análise dos Investimentos em Infraestrutura
> 4. Implicações Geopolíticas
> 5. Conclusões e Perspectivas
>
> ---
>
> Trabalhando em conjunto com o GennovAIs, unifique todos os pareceres aprovados em um ÚNICO RELATÓRIO FINAL.
>
> REGRAS OBRIGATÓRIAS:
> 1. NÃO mencione os nomes dos Conselheiros
> 2. NÃO use termos como 'Conselheiro', 'analista' ou referências aos autores
> 3. Integre as perspectivas de forma coesa, como se fosse uma análise única
> 4. Siga a estrutura do relatório definida acima
> 5. Mantenha estilo discursivo (texto corrido, sem bullet points)
> 6. O relatório deve ser DENSO, PROFUNDO e REVELADOR do conhecimento geopolítico
> 7. Qualidade compatível com publicações acadêmicas da FGV
>
> FORMATO DO RELATÓRIO:
> - COMECE IMEDIATAMENTE com o título principal (# Título)
> - NÃO deixe linhas em branco antes do título
> - NÃO inclua metadados, datas ou informações de cabeçalho antes do conteúdo
> - O primeiro elemento do documento deve ser o título principal
>
> Produza o relatório final consolidado."

**Configuração de Temperatura para Consolidação**

O Max Weber usa uma temperatura mais baixa (0.3) do que os conselheiros (0.85). Isso significa que suas respostas são mais "conservadoras" e previsíveis, o que é desejável para um trabalho de edição e consolidação onde a criatividade excessiva poderia introduzir inconsistências.

| Agente | Temperatura | Razão |
|--------|-------------|-------|
| Conselheiros | 0.85 | Alta criatividade para análises originais |
| GennovAIs | 0.6 | Equilíbrio entre rigor e flexibilidade na avaliação |
| Max Weber | 0.3 | Baixa variabilidade para consolidação consistente |

**Processamento do Relatório Final**

Quando o Max Weber termina de gerar o relatório, o sistema executa várias operações:

1. **Validação do conteúdo**: Verifica se o relatório tem tamanho adequado (geralmente 4.000-8.000 palavras)

2. **Adição dos metadados da sessão**: O sistema adiciona automaticamente um bloco no início do relatório com informações sobre a sessão:

```markdown
## Dados da Sessão do Conselho

**Data:** 01/01/2026

**Horário:** 14:30 – 14:45

**Solicitante:** João Silva – joao.silva@email.com

**Participantes:**
- **Moderador:** General Novaes (GennovAIs)
- **Editor:** Max Weber
- **Conselheiros:** Halford J. Mackinder, Alfred Thayer Mahan, Zbigniew Brzezinski, Henry Kissinger

---
```

3. **Registro de custos**: Os tokens utilizados na consolidação são registrados no banco de dados

4. **Atualização do status**: A análise é marcada como "em finalização"

**Fluxo de Dados na Consolidação**

O diagrama abaixo ilustra o fluxo de dados durante a consolidação:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENTRADA PARA CONSOLIDAÇÃO                    │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   Parecer 1   │     │   Parecer 2   │     │   Parecer N   │
│  (Mackinder)  │     │    (Mahan)    │     │     (...)     │
│  ~2000 palavras│     │  ~2000 palavras│     │  ~2000 palavras│
└───────┬───────┘     └───────┬───────┘     └───────┬───────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PROMPT DE CONSOLIDAÇÃO                       │
│  • Todos os pareceres concatenados                              │
│  • Estrutura do relatório                                       │
│  • Instruções de integração                                     │
│  • Total: ~10.000-15.000 tokens de entrada                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MAX WEBER (Claude/Gemini)                    │
│  • Temperature: 0.3                                             │
│  • Max tokens: 16.384                                           │
│  • Timeout: 180 segundos                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RELATÓRIO CONSOLIDADO                        │
│  • Texto único e coeso                                          │
│  • ~4.000-8.000 palavras                                        │
│  • Segue estrutura definida                                     │
│  • Sem menção aos conselheiros                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PÓS-PROCESSAMENTO                            │
│  • Adição de metadados da sessão                                │
│  • Registro de custos                                           │
│  • Atualização de status                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Momento 5: Salvamento e Conclusão

### O que você vê na tela

Quando o processo termina, você verá:
- Uma mensagem de **"Sessão Encerrada"**
- O **tempo total** que a análise levou
- O **custo estimado** em tokens de IA
- Botões para **exportar o relatório** em PDF ou Word

### O que acontece nos bastidores

O sistema realiza as seguintes ações finais:

1. **Salva o relatório no banco de dados**: O texto completo é armazenado de forma segura
2. **Atualiza o status da análise**: Muda de "processando" para "concluída"
3. **Calcula estatísticas**: Tempo total, custo, número de tokens utilizados
4. **Prepara para exportação**: O relatório fica disponível para download em diferentes formatos

#### Detalhamento técnico dos bastidores

A etapa final envolve a persistência de dados e a preparação para exportação. Vamos examinar cada componente.

**Atualização do Banco de Dados**

O sistema atualiza várias tabelas no banco de dados:

| Tabela | Campos Atualizados | Descrição |
|--------|-------------------|-----------|
| analyses | status, finalReport, completedAt | Marca a análise como concluída e salva o relatório |
| analysis_costs | totalCost, totalTokens | Registra os custos totais da análise |
| counselor_opinions | (já atualizado) | Pareceres individuais já foram salvos |
| llm_usage_costs | (já atualizado) | Custos por chamada já foram registrados |

**Cálculo de Estatísticas Finais**

O sistema calcula e registra:

```javascript
{
  totalTime: 387000,        // Tempo total em milissegundos (6 min 27 seg)
  totalCost: 0.1847,        // Custo total em dólares
  totalTokens: {
    input: 45230,           // Total de tokens de entrada
    output: 18450           // Total de tokens de saída
  },
  stepsCompleted: 12,       // Número de etapas concluídas
  counselorsParticipated: 4 // Número de conselheiros que participaram
}
```

**Limpeza de Recursos Temporários**

O sistema também executa operações de limpeza:
- Remove mensagens temporárias usadas durante a análise
- Limpa caches de sessão
- Libera recursos de memória

**Preparação para Exportação**

O relatório final fica disponível para exportação em dois formatos:

| Formato | Características |
|---------|-----------------|
| PDF | Documento formatado com identidade visual FGV, cabeçalho, rodapé e fonte Gotham |
| Word (DOCX) | Documento editável com estilos aplicados, pronto para ajustes finais |

Ambos os formatos incluem:
- Capa com título e metadados da sessão
- Sumário automático (quando aplicável)
- Formatação profissional
- Logotipo da FGV

---

## O que acontece se algo der errado?

O sistema foi projetado para lidar com problemas de forma inteligente:

| Problema | Como o sistema resolve |
|----------|----------------------|
| Parecer muito curto | Tenta gerar novamente (até 3 vezes) |
| Parecer rejeitado pelo GennovAIs | O conselheiro recebe feedback e reescreve |
| Erro de conexão com a IA | Aguarda e tenta novamente |
| Erro grave | Marca a análise como "falhou" e notifica o usuário |

Se após todas as tentativas o sistema não conseguir completar a análise, você receberá uma mensagem de erro e poderá tentar novamente.

### Detalhamento técnico do tratamento de erros

O sistema implementa um tratamento de erros em múltiplas camadas para garantir robustez.

**Retry Automático para Chamadas de IA**

Cada chamada à API de IA possui um mecanismo de retry:

```
Tentativa 1 → Falhou (timeout)
    ↓
Aguarda 2 segundos
    ↓
Tentativa 2 → Falhou (erro de API)
    ↓
Aguarda 2 segundos
    ↓
Tentativa 3 → Sucesso!
```

**Fallback entre Modelos**

Se um modelo de IA falhar, o sistema tenta automaticamente modelos alternativos:

```
Gemini 2.5 Pro → Falhou
    ↓
Gemini 2.0 Flash → Falhou
    ↓
Gemini 1.5 Pro → Sucesso!
```

**Catch Global para Eventos SSE**

O sistema possui um bloco try/catch global que garante que eventos de conclusão ou erro sejam sempre emitidos para a interface, mesmo em caso de falhas inesperadas:

```
try {
    // Todo o processo de análise
} catch (globalError) {
    // Garantir que a interface seja notificada
    // Registrar erro no banco de dados
    // Limpar recursos temporários
}
```

---

## Quanto tempo demora?

O tempo total depende de quantos conselheiros você selecionou:

| Número de Conselheiros | Tempo Estimado |
|----------------------|----------------|
| 2 conselheiros | 3-4 minutos |
| 4 conselheiros | 6-8 minutos |
| 6 conselheiros | 9-12 minutos |

Esses tempos são aproximados e podem variar dependendo da complexidade do tema e da carga do sistema.

---

## Quanto custa?

O custo é calculado com base no número de "tokens" (unidades de texto) processados pela inteligência artificial. Cada conselheiro e cada etapa consome tokens:

| Etapa | Tokens aproximados | Custo estimado |
|-------|-------------------|----------------|
| Cada conselheiro elaborando parecer | 2.000-3.000 tokens | $0.02-0.04 |
| Cada avaliação do GennovAIs | 1.000-1.500 tokens | $0.01-0.02 |
| Consolidação pelo Max Weber | 5.000-8.000 tokens | $0.05-0.10 |

O custo total é mostrado ao final da análise e depende dos preços configurados no sistema.

### Detalhamento técnico do cálculo de custos

O sistema utiliza uma tabela de preços configurável para calcular os custos:

| Provedor | Modelo | Preço por 1M tokens (entrada) | Preço por 1M tokens (saída) |
|----------|--------|------------------------------|----------------------------|
| Google | Gemini 2.5 Pro | $1.25 | $5.00 |
| Google | Gemini 2.0 Flash | $0.10 | $0.40 |
| Anthropic | Claude 3.7 Sonnet | $3.00 | $15.00 |

A fórmula de cálculo é:

```
Custo = (tokens_entrada / 1.000.000) × preço_entrada + (tokens_saída / 1.000.000) × preço_saída
```

Por exemplo, para uma chamada com 4.000 tokens de entrada e 2.000 tokens de saída usando Gemini 2.5 Pro:

```
Custo = (4.000 / 1.000.000) × $1.25 + (2.000 / 1.000.000) × $5.00
Custo = $0.005 + $0.01
Custo = $0.015
```

---

## Resumo Visual do Processo

```
┌─────────────────────────────────────────────────────────────────┐
│                    PASSO 6 - SESSÃO DO CONSELHO                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. CONVOCAÇÃO                                                  │
│     GennovAIs abre a sessão e convoca os conselheiros           │
│     ⏱️ ~3 segundos                                               │
│     📊 Tokens: ~500 (Gemini Flash)                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. ELABORAÇÃO DOS PARECERES                                    │
│     Cada conselheiro escreve sua análise individual             │
│     ⏱️ ~60 segundos por conselheiro                              │
│     📊 Tokens: ~5.000 por parecer (Gemini/Claude)                │
│                                                                 │
│     ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│     │Mackinder │  │  Mahan   │  │Brzezinski│  │Kissinger │     │
│     │ Parecer  │  │ Parecer  │  │ Parecer  │  │ Parecer  │     │
│     └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
│          │             │             │             │           │
│          └─────────────┴──────┬──────┴─────────────┘           │
│                               │                                 │
└───────────────────────────────┼─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. AVALIAÇÃO PELO GENNOVAIS                                    │
│     Cada parecer é avaliado e aprovado (ou rejeitado)           │
│     ⏱️ ~15 segundos por parecer                                  │
│     📊 Tokens: ~2.500 por avaliação (Claude)                     │
│                                                                 │
│     ┌──────────────────────────────────────────────────────┐   │
│     │  GennovAIs avalia cada parecer                       │   │
│     │  ✅ Aprovado → Salva no banco                         │   │
│     │  ❌ Rejeitado → Conselheiro reescreve (até 2x)        │   │
│     └──────────────────────────────────────────────────────┘   │
│                               │                                 │
└───────────────────────────────┼─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. CONSOLIDAÇÃO FINAL                                          │
│     Max Weber unifica todos os pareceres                        │
│     ⏱️ ~50 segundos                                              │
│     📊 Tokens: ~20.000 (entrada) + ~8.000 (saída)                │
│                                                                 │
│     ┌──────────────────────────────────────────────────────┐   │
│     │  Pareceres aprovados → Max Weber → Relatório único   │   │
│     │  • Integra perspectivas                              │   │
│     │  • Remove menções aos conselheiros                   │   │
│     │  • Segue estrutura definida                          │   │
│     └──────────────────────────────────────────────────────┘   │
│                               │                                 │
└───────────────────────────────┼─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. CONCLUSÃO                                                   │
│     Relatório salvo e disponível para exportação                │
│     ⏱️ ~2 segundos                                               │
│                                                                 │
│     📄 PDF  |  📝 Word  |  📊 Estatísticas                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Glossário Técnico

| Termo | Definição |
|-------|-----------|
| **Token** | Unidade de texto processada pela IA (aproximadamente 4 caracteres ou 0.75 palavras) |
| **System Prompt** | Instruções que definem a personalidade e comportamento da IA |
| **Temperature** | Parâmetro que controla a criatividade da IA (0 = determinístico, 1 = criativo) |
| **API** | Interface de programação que permite comunicação entre sistemas |
| **Timeout** | Tempo máximo de espera por uma resposta |
| **Retry** | Tentativa automática de repetir uma operação que falhou |
| **Fallback** | Alternativa usada quando a opção principal falha |
| **SSE** | Server-Sent Events - tecnologia para enviar atualizações em tempo real |
| **JSON** | Formato de dados estruturados usado para comunicação entre sistemas |

---

*Documento gerado pelo Sistema de Análise Geopolítica da FGV*
*Versão expandida com detalhamento técnico dos bastidores*
