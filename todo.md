# Conselho de Geopolítica da FGV - TODO

## Sistema de Autenticação e Gestão de Usuários
- [x] Schema de usuários com controle de validade (validUntil)
- [x] Painel administrativo para cadastro de usuários por email
- [x] Verificação de validade de acesso no login
- [x] Roles: admin e user

## Interface Principal e Fluxo de Análise
- [x] Landing page com identidade visual profissional
- [x] Dashboard do usuário com análises recentes
- [x] Wizard de criação de análise (etapas guiadas)
- [x] Etapa 1: Definição do objetivo da análise
- [x] Etapa 2: Seleção de fontes (internet, notícias, uploads)
- [x] Etapa 3: Revisão/edição da estrutura da análise
- [x] Etapa 4: Revisão/edição da estrutura do relatório
- [x] Etapa 5: Execução da análise
- [x] Etapa 6: Visualização e exportação do relatório

## Integração com APIs de Notícias
- [x] Integração com NewsAPI
- [x] Integração com GDELT
- [x] Interface de busca de notícias por tema/país/período
- [x] Seleção de notícias relevantes para análise

## Sistema de Upload de Arquivos
- [x] Upload de arquivos PDF
- [x] Upload de arquivos DOCX
- [x] Upload de arquivos TXT
- [x] Extração de texto dos arquivos
- [x] Armazenamento no S3
- [x] Listagem de arquivos por análise

## Integração com Gemini AI
- [x] Configuração da API Gemini
- [x] Geração de sugestões de estrutura de análise
- [x] Processamento de fontes e geração de análise
- [ ] Streaming de resposta para feedback em tempo real

## Editores Interativos
- [x] Editor de estrutura de análise (visualização de seções)
- [x] Editor de estrutura de relatório (personalização de formato)
- [ ] Templates de estrutura pré-definidos
- [ ] Salvamento de estruturas personalizadas

## Exportação de Relatórios
- [x] Geração de HTML com identidade FGV
- [x] Cores FGV aplicadas
- [x] Fonte Gotham
- [x] Cabeçalho e rodapé profissionais
- [ ] Sumário automático

## Sistema de Histórico
- [x] Opção de salvar análise no histórico
- [x] Listagem de análises salvas por usuário
- [x] Visualização de análises anteriores
- [x] Exclusão de análises do histórico

## Painel Administrativo
- [x] Lista de usuários cadastrados
- [x] Cadastro de novos usuários por email
- [x] Definição de validade de acesso
- [x] Ativação/desativação de usuários
- [ ] Visualização de estatísticas de uso

## Sistema Multi-Agentes (ATUALIZAÇÃO)

### Novo Fluxo de Análise
- [x] Etapa 1: Definir objetivo
- [x] Etapa 2: Explicar contexto (opcional)
- [x] Etapa 3: Selecionar fontes
- [x] Etapa 4: Definir equipe de analistas
- [x] Etapa 5: Personalizar análise
- [x] Etapa 6: Exportar

### Sistema Multi-Agentes (6 Personalidades)
- [x] Halford J. Mackinder (Gemini) - Teoria do Heartland
- [x] Alfred Thayer Mahan (GPT) - Poder Marítimo
- [x] Nicholas J. Spykman (DeepSeek) - Teoria do Rimland
- [x] Henry Kissinger (Claude) - Realpolitik
- [x] Golbery do Couto e Silva (Claude) - Brasil Potência
- [x] Meira Mattos (Gemini) - Brasil Geopolítico
- [x] Agente Orquestrador
- [x] Revisor de Texto Final

### Sistema de Cobrança
- [x] Limite de análises por usuário (definido pelo admin)
- [x] Cobrança de $1 por análise adicional
- [x] Estimativa de custos das APIs
- [x] Estimativa de custo total do relatório

### Nova Identidade Visual
- [x] Fonte Gotham (e variações)
- [x] Paleta primária: #002D4D, #003A79, #008BC9, #73BFE8
- [x] Paleta secundária: #5C5B5F, #88868B, #AFAEB4, #D7D9DD, #FFFFFF
- [x] Paleta auxiliar: cores de destaque
- [x] Logo FGV Diretoria Internacional
- [x] Título: Conselho de Geopolítica da FGV
- [x] Subtítulo: plataforma de análise geopolítica

### Interface de Progresso
- [x] Mostrar passos do sistema em tempo real
- [x] Mostrar tempo de execução
- [x] Não mencionar LLMs usados
- [x] Exibir estimativa de custos

## Testes Passando
- [x] auth.logout.test.ts (1 teste)
- [x] gemini.test.ts (1 teste)
- [x] multiAgents.test.ts (20 testes)
- [x] analysis.test.ts (6 testes)
- [x] llm-keys.test.ts (4 testes)
Total: 32 testes passando

## Próximas Melhorias Sugeridas
- [x] Exportação direta em formato Word (DOCX)
- [ ] Templates de análise pré-definidos
- [ ] Estatísticas de uso no painel admin
- [ ] Streaming de resposta para feedback em tempo real


## Exportação Word (DOCX) - Concluído
- [x] Instalar biblioteca docx para geração de arquivos Word
- [x] Criar serviço de geração DOCX com identidade FGV
- [x] Adicionar rota de API para exportação DOCX
- [x] Atualizar interface com botão de download Word
- [x] Testar exportação com relatórios reais (5 testes passando)


## Bug Report - Gerenciamento de Usuários - Corrigido
- [x] Adicionar campo de quota de análises no formulário de convite
- [x] Verificar botão de cadastrar no formulário (funcionando)
- [x] Enviar convite para marlos.lima@fgv.br
- [x] Testar funcionalidades de admin


## Melhorias Solicitadas - Sistema de Usuários e Perfis - Concluído
- [x] Criar dois tipos de usuários: administrador e usuário comum
- [x] Atualizar formulário de convite com seleção de tipo de usuário
- [x] Remover todas as menções ao Manus do código (menções internas de login mantidas)
- [x] Substituir "Powered by Multi-Agent AI" por "Sistema de IA multiagente"
- [x] Criar página de perfil para Halford J. Mackinder
- [x] Criar página de perfil para Alfred Thayer Mahan
- [x] Criar página de perfil para Nicholas J. Spykman
- [x] Criar página de perfil para Henry Kissinger
- [x] Criar página de perfil para Golbery do Couto e Silva
- [x] Criar página de perfil para Meira Mattos


## Página de Coordenação do Conselho - Concluído
- [x] Copiar fotos dos coordenadores para o projeto
- [x] Criar página de Coordenação com perfis
- [x] Adicionar rota no App.tsx
- [x] Adicionar link de navegação na landing page
- [x] Testar a nova página


## Página de Metodologia - Concluído
- [x] Criar página de Metodologia com detalhes do sistema multi-agentes
- [x] Explicar o papel de cada analista geopolítico
- [x] Detalhar o funcionamento do agente orquestrador e revisor
- [x] Adicionar rota no App.tsx
- [x] Adicionar link de navegação na landing page
- [x] Testar a nova página


## Ajustes Solicitados - Concluído
- [x] Substituir "Metodologia" por "Método" em toda a plataforma
- [x] Remover menções aos nomes dos LLMs na página de Método
- [x] Criar botão "Conhecer os Coordenadores do Conselho"
- [x] Cadastrar andre.novaes@fgv.br como administrador
- [ ] Configurar domínio conselho.marlos.com.br (instruções fornecidas)


## Ajustes Finais - Concluído
- [x] Adicionar marlos@marlos.com.br como administrador (já estava cadastrado)
- [x] Adicionar andre.novaes63@gmail.com.br como administrador
- [x] Atualizar texto da landing page
- [ ] Configurar domínio conselho.marlos.com.br (instruções fornecidas)


## Novas Funcionalidades Solicitadas - Concluído
- [ ] Gerar fotos estilizadas dos 6 analistas (Mackinder, Mahan, Spykman, Kissinger, Golbery, Meira Mattos) - Pendente: requer geração de imagens
- [x] Criar página de FAQ com perguntas frequentes
- [x] Criar página de Contato com formulário
- [x] Configurar envio de mensagens para marlos@marlos.com.br e andre.novaes63@gmail.com (via notifyOwner)
- [x] Implementar notificações por email quando análises forem concluídas
- [x] Adicionar links para FAQ e Contato no footer da landing page


## Animação de Envio com Sucesso - Formulário de Contato - Concluído
- [x] Criar animação de checkmark animado para feedback de sucesso
- [x] Adicionar transições suaves entre estados do formulário
- [x] Implementar confetti ou partículas para celebração visual
- [x] Adicionar sparkles animados ao redor do checkmark
- [x] Animação de scale-in para o ícone de sucesso
- [x] Transição fade-in-up para o texto de confirmação


## Melhorias Solicitadas - 20/12/2025 - Concluído
- [x] Implementar animação de carregamento para uploads de materiais
- [x] Adicionar botão "Conhecer os Coordenadores" ao lado de "Conhecer os Analistas" na Home
- [x] Permitir URLs nas fontes e acessar conteúdo das páginas
- [x] Aumentar logomarca da FGV em todas as páginas (h-10 para h-14 no header, h-8 para h-12 no footer)
- [x] Atualizar copyright para "© 2026 Diretoria Internacional da Fundação Getulio Vargas"

## Alterações de Nomenclatura e Logo - 20/12/2025 - Concluído
- [x] Substituir "Analistas" por "Conselheiros" em toda a aplicação (Home, NewAnalysis, FAQ, Method)
- [x] Adicionar hiperlink na logo FGV para https://dint.fgv.br/ (todas as páginas)

## Renomear Rota - 20/12/2025 - Concluído
- [x] Renomear rota '/analyst' para '/conselheiro' no App.tsx
- [x] Atualizar referências em Home.tsx, AnalystProfile.tsx e Method.tsx

## Melhorias de UX e Conteúdo - 20/12/2025 - Concluído
- [x] Substituir "Iniciar Análise" por "Inicie análise"
- [x] Substituir "Conhecer os Conselheiros" por "Conheça os Conselheiros"
- [x] Substituir "Conhecer os Coordenadores" por "Conheça os Coordenadores"
- [x] Criar página "Sobre o Conselho" com missão e objetivos (/about)
- [x] Adicionar breadcrumbs de navegação em todas as páginas internas (Method, Coordination, FAQ, Contact, AnalystProfile, About)
- [x] Gerar retratos artísticos para cada conselheiro (Mackinder, Mahan, Spykman, Kissinger, Golbery, Meira Mattos)

## Configuração de LLM e Galeria - 20/12/2025 - Concluído
- [x] Criar tabela no banco para configuração de LLM por conselheiro (counselor_llm_config)
- [x] Criar rotas CRUD para gerenciar configurações de LLM (getCounselorLlmConfigs, updateCounselorLlmConfig, bulkUpdateCounselorLlm)
- [x] Criar interface de tabela editável no painel admin (nova tab "Configuração LLM")
- [x] Configurar todos os conselheiros para usar Gemini 2.0 Flash por padrão
- [x] Adicionar galeria estilizada na Home com retratos em cinza FGV (grayscale com hover)
- [x] Manter retratos coloridos apenas nas páginas de perfil

## Painel de Custos por LLM - 20/12/2025 - Concluído
- [x] Criar tabela para rastrear custos de uso de LLM por provedor (llm_usage_costs)
- [x] Criar rotas para consultar custos acumulados (getLlmUsageSummary, getLlmCostsByProvider, getLlmCostsByPeriod, getRecentLlmUsage)
- [x] Criar interface de visualização de custos no painel admin (nova tab "Custos LLM")
- [x] Adicionar cards de resumo (custo total, tokens, requisições, provedores ativos)
- [x] Adicionar detalhamento por provedor e modelo
- [x] Adicionar tabela de uso recente

## Registro Automático de Custos LLM - 20/12/2025 - Concluído
- [x] Identificar todos os pontos de chamada LLM no código (multiAgents.ts)
- [x] Modificar função callLLM para registrar custos automaticamente
- [x] Calcular custos baseado em tokens de entrada/saída por modelo
- [x] Integrar registro em todas as chamadas de análise (orquestrador, analistas, revisor)
- [x] Passar userId e analysisId para rastreamento completo

## Melhorias de Fontes e Limpeza - 20/12/2025 - Concluído
- [x] Adicionar opção "Use os conhecimentos dos Conselheiros" nas fontes
- [x] Adicionar opção "Consulte a web" nas fontes
- [x] Tornar todas as opções de fontes selecionáveis (checkboxes visuais)
- [x] Remover botão "Acessar Plataforma" da página principal
- [x] Eliminar menções ao Manus no código (storage.ts, map.ts, notification.ts, sdk.ts, ManusDialog removido)

## Integração de Busca Web - 20/12/2025 - Concluído
- [x] Criar serviço de busca web no backend (webSearch.ts)
- [x] Adicionar rotas tRPC para busca web (search, fetchContent, searchAndFetch)
- [x] Integrar resultados da busca no sistema multiagente
- [x] Atualizar frontend para passar opções de busca web
- [x] Conectar opção "Consulte a web" ao sistema de análise

## Unificação de Enquadramento das Imagens - 20/12/2025 - Concluído
- [x] Unificar enquadramento das imagens na galeria da página principal (aspect-square, object-[center_20%])
- [x] Aumentar tamanho das imagens nas páginas de perfil dos conselheiros (w-64 h-64 para w-72 h-72)
- [x] Unificar enquadramento nas páginas de perfil (object-[center_20%] scale-110)

## Correção de Texto - 20/12/2025 - Concluído
- [x] Substituir "O Conselho de Conselheiros" por "Os Conselheiros"

## Animação de Transição de Páginas - 20/12/2025 - Concluído
- [x] Criar componente PageTransition com fade-in suave (300ms)
- [x] Aplicar animação em todas as rotas do App.tsx

## Correção de Enquadramento das Fotos - 20/12/2025 - Concluído
- [x] Unificar enquadramento das fotos dos conselheiros na galeria (objectPosition específico para cada imagem)
- [x] Garantir que todas as imagens tenham o mesmo tamanho e posição
- [x] Atualizar enquadramento nas páginas de perfil individuais

## Atualização de Imagens Mackinder e Scroll - 20/12/2025 - Concluído
- [x] Substituir foto de Mackinder na página inicial (preto e branco) - mackinder-pb.png
- [x] Substituir foto de Mackinder na página do conselheiro (colorida) - mackinder-color.png
- [x] Fazer páginas dos conselheiros abrirem no topo da página (useEffect com scrollTo)

## Substituição de Imagens dos Conselheiros - 20/12/2025 - Concluído
- [x] Extrair os 6 retratos faciais da imagem composta
- [x] Substituir imagens na página inicial com enquadramento uniforme
- [x] Mackinder, Mahan, Spykman, Kissinger, Golbery, Meira Mattos

## Retratos Coloridos dos Conselheiros - 20/12/2025 - Concluído
- [x] Extrair os 6 retratos coloridos da imagem composta (500x500px)
- [x] Substituir imagens nas páginas de perfil dos conselheiros
- [x] Manter imagens PB na página inicial inalteradas

## Efeito Hover na Galeria - 20/12/2025 - Concluído
- [x] Implementar transição suave de PB para colorido no hover
- [x] Usar imagens coloridas existentes (_profile.png)
- [x] Aplicar efeito de foco suave na transição (500ms, scale-105)

## Atualização de Retratos de Alta Resolução - 20/12/2025 - Concluído
- [x] Extrair os 6 retratos coloridos de alta resolução da nova imagem (600x600px)
- [x] Substituir imagens nas páginas de perfil dos conselheiros
- [x] Atualizar imagens no efeito hover da galeria
- [x] Manter imagens PB na página inicial inalteradas

## Animação Staggered nos Cards - 20/12/2025 - Concluído
- [x] Implementar animação de entrada escalonada (staggered) nos cards dos conselheiros
- [x] Usar Intersection Observer para detectar quando a seção entra na viewport (threshold 20%)
- [x] Aplicar efeito fade-in e slide-up com delay progressivo (150ms entre cards)

## Reorganização dos Botões do Hero - 20/12/2025 - Concluído
- [x] Reorganizar botões na ordem: Como funciona a Plataforma, Os recursos da Plataforma, Nossos Conselheiros, A Coordenação, Inicie sua análise
- [x] Adicionar IDs às seções para navegação por âncora (features, how-it-works)

## Reorganização das Seções da Página - 20/12/2025 - Concluído
- [x] Reorganizar seções na ordem: Como funciona, Os recursos, Nossos Conselheiros, A Coordenação, Inicie sua análise
- [x] Criar seção dedicada para A Coordenação com link para página de coordenadores

## Configuração de Modelo e Painel Admin - 20/12/2025 - Concluído
- [x] Alterar modelo padrão para gemini-3-pro-preview (Conselheiros, Maestro, Editor)
- [x] Renomear Orquestrador para Maestro
- [x] Adicionar gemini-3-pro-preview à lista de modelos disponíveis
- [x] Incluir Maestro e Editor no painel de controle do Administrador
- [x] Atualizar testes para refletir as mudanças

## Atualização de Fotos dos Coordenadores - 20/12/2025 - Concluído
- [x] Substituir foto do coordenador Novaes pela nova imagem (pintura a óleo)
- [x] Substituir foto do coordenador Marlos pela nova imagem (pintura a óleo)
- [x] Unificar enquadramento de ambas as imagens (600x600px quadrado)

## Correção de Legibilidade do Título - 20/12/2025 - Concluído
- [x] Corrigir cor do subtítulo "Plataforma de análise geopolítica" (azul sobre azul escuro)
- [x] Alterado para cor amarela (--fgv-primary-4) para melhor contraste

## Melhorias Admin e Relatório - 20/12/2025 - Concluído
- [x] Corrigir cor do título da análise (text-fgv-blue para branco)
- [x] Configurar Maestro e Editor para usar claude-sonnet-4-5-20250929
- [x] Adicionar nova chave API Anthropic para Maestro e Editor
- [x] Adicionar modelo claude-sonnet-4-5-20250929 à lista de modelos
- [x] Criar seção de edição de emails no admin (nova aba)
- [x] Adicionar checkbox para enviar/não enviar emails em cada configuração
- [x] Atualizar testes para refletir as mudanças

## Atualização de Fotos dos Coordenadores v2 - 20/12/2025 - Concluído
- [x] Processar nova foto de André Novaes (pintura a óleo, 600x600px)
- [x] Processar nova foto de Marlos Lima (pintura a óleo, 600x600px)
- [x] Unificar enquadramento de ambas as imagens (quadrado)
- [x] Substituir imagens no projeto

## Melhorias UX/UI v2 - 20/12/2025
- [ ] R1: Hierarquia visual do Hero - eyebrow text menor, título mais curto e impactante
- [ ] R1: CTA destacado com cor de contraste
- [ ] R2: Renomear etapas do fluxo (Pergunta de Pesquisa, Contextualização, Upload e Seleção de Fontes)
- [ ] R2: Adicionar link "Ver exemplo de relatório" na etapa 5
- [ ] R3: Cards interativos com citação chave no hover
- [ ] R3: Agrupamento por escola (Americana, Brasileira, Clássica/Britânica)
- [ ] R4: Trust signal sobre privacidade de dados
- [ ] R4: Mencionar LLMs usados na página de método
- [ ] R5: Revisar textos do Hero conforme sugestão


## Melhorias de UX/UI - 20/12/2025 - Concluído
- [x] R1: Hierarquia visual - Simplificar título, adicionar eyebrow text, melhorar descrição
- [x] R2: Seção Como Funciona - Adicionar linha conectora, subtítulo, link para exemplo
- [x] R3: Cards dos Conselheiros - Adicionar badge de escola, citação no hover
- [x] R4: Trust Signals - Adicionar indicadores de confiança
- [x] R5: Revisão de textos - Tornar mais envolventes e diretos


## Correção de Legibilidade - Títulos Azuis sobre Fundo Azul - 20/12/2025
- [x] Identificar todas as páginas com títulos ilegíveis (azul sobre azul)
- [x] Corrigir cores dos títulos para branco ou amarelo em fundos azuis
- [x] Testar todas as páginas após correções


## Alteração de Cor dos Títulos sobre Fundo Azul - 20/12/2025
- [x] Identificar todos os títulos sobre fundos azuis (--fgv-primary-1, --fgv-primary-2)
- [x] Alterar cores dos títulos para #D7D9DD
- [x] Testar todas as páginas após correções


## Padronização do Nome do Conselho - 20/12/2025
- [x] Identificar todas as referências ao nome do Conselho
- [x] Atualizar para "Conselho IA de Geopolítica da FGV" em todas as páginas
- [x] Testar todas as páginas após correções


## Configuração de Modelos LLM - 20/12/2025
- [x] Identificar arquivos de configuração de LLM
- [x] Configurar Gemini 3 Pro Preview para os 6 conselheiros
- [x] Configurar Claude Opus 4.5 para Maestro (Orquestrador) e Editor (Revisor)
- [x] Testar as configurações


## Ajuste de Temperatura dos Modelos LLM - 20/12/2025
- [x] Identificar funções de chamada de LLM
- [x] Configurar temperatura alta (0.85) para conselheiros (criatividade)
- [x] Configurar temperatura baixa (0.3) para Editor (precisão)
- [x] Configurar temperatura média (0.6) para Maestro (equilíbrio)
- [x] Testar as configurações


## Logging e Painel de Configuração de Temperatura - 20/12/2025
- [x] Adicionar logging de temperatura nas chamadas de LLM
- [x] Atualizar schema do banco para armazenar configurações de temperatura
- [x] Criar funções de banco para gerenciar configurações de temperatura
- [x] Criar endpoints tRPC para gerenciar configurações
- [x] Criar painel de configuração na interface admin
- [x] Testar as funcionalidades


## Fotos dos Coordenadores - 20/12/2025
- [x] Processar e unificar enquadramentos das fotos (André Novaes e Marlos Lima)
- [x] Copiar fotos para o projeto (client/public)
- [x] Atualizar referências nas páginas (já estavam corretas)
- [x] Testar exibição das fotos


## Alteração do Título do Site - 20/12/2025
- [x] Alterar título de "Analista Geopolítico FGV" para "Conselho IA Geopolítica FGV"
- [x] Atualizar em index.html
- [ ] Atualizar em configurações do app (VITE_APP_TITLE) - requer atualização via Settings > General
- [x] Testar alterações


## Favicon Personalizado - 20/12/2025
- [x] Gerar favicon com identidade visual do Conselho IA
- [x] Processar e otimizar para diferentes tamanhos (16x16, 32x32, 48x48, 180x180, 192x192, 512x512)
- [x] Integrar favicon ao projeto (index.html com meta tags)
- [x] Testar exibição do favicon


## Correção de Upload de Arquivos - 21/12/2025
- [x] Identificar o código de upload e o erro com PDF
- [x] Corrigir o erro de upload de PDF (instalado pdf-parse v2)
- [x] Verificar se o problema ocorre com outros tipos de arquivo (TXT e DOCX funcionando)
- [x] Testar upload de diferentes formatos (74 testes passando)


## Redesign das Áreas de Input - 21/12/2025
- [x] Analisar layout atual das áreas de input (objetivo, tema, contexto, estrutura)
- [x] Redesenhar com mais destaque visual e espaço
- [x] Melhorar hierarquia visual e impacto
- [x] Testar responsividade do novo layout


## Bugs Reportados - 21/12/2025
- [x] BUG: Favicon não aparece no site (verificado - está funcionando, pode ser cache do navegador)
- [x] BUG: Nome do site ainda mostra "Analista Geopolítico FGV" - corrigido em DashboardLayout.tsx e Dashboard.tsx
- [x] BUG: Fotos dos coordenadores não aparecem (verificado - estão funcionando corretamente)


## Bug Upload PDF - 21/12/2025
- [x] BUG: Só permite enviar 1 PDF e dá erro - TESTADO: Upload funcionando corretamente
- [x] Investigar logs do servidor - Sem erros nos logs
- [x] Corrigir o problema - Corrigido import do pdf-parse v2


## Bug Favicon e Título - 21/12/2025
- [ ] BUG: Favicon não aparece na aba do navegador
- [ ] BUG: Título mostra "Analista Geopolítico FGV" em vez de "Conselho IA Geopolítica FGV"
- [ ] Investigar VITE_APP_TITLE e configurações de favicon
- [ ] Corrigir o problema


## Correções Solicitadas - 21/12/2025
- [ ] Eliminar fotos dos coordenadores da página de Coordenação
- [ ] Adicionar link para página inicial no dashboard
- [ ] Aumentar campo do objetivo na página de nova análise
- [ ] Investigar por que o app desabilita alguns conselheiros ao sugerir análise


## Correções Solicitadas - 21/12/2025
- [x] Remover fotos dos coordenadores da página de Coordenação
- [x] Adicionar link "Página Inicial" no menu lateral do dashboard
- [x] Aumentar campo de objetivo (de 6 para 12 linhas, min-height 200px)
- [x] Habilitar todos os 6 conselheiros por padrão
- [x] Adicionar feedback ao desabilitar conselheiro (informar o que está perdendo)

## Correções Solicitadas - 21/12/2025 (Parte 2)
- [x] Verificar favicon (existe e está configurado corretamente - pode ser cache do navegador)
- [ ] Corrigir título da aba do navegador (requer alteração via Settings > General no painel)
- [x] Remover todas as menções a custo para usuários comuns (mantido apenas no painel admin)

## Bug Crítico - 21/12/2025
- [ ] Aumentar limite de upload de arquivos (atualmente 512KB, muito baixo para PDFs e DOCXs)

## Identidade Visual - 21/12/2025
- [x] Adicionar título e logomarca FGV em TODAS as telas do dashboard
- [x] Manter consistência visual com a página inicial

## Bug Upload PDF - 21/12/2025
- [ ] PDF processado mas não incorporado às fontes (conteúdo aparece na lateral mas não é adicionado à lista)

## Correções Visuais e Upload - 21/12/2025
- [x] Corrigir cores do header do dashboard (logo com fundo branco, título em cores claras)
- [x] Implementar upload de PDF robusto que não seja interceptado pela extensão Adobe

## Implementação das Sugestões - 21/12/2025
- [ ] Alterar título da aba do navegador (requer alteração manual via Settings > General)
- [x] PDF de teste criado para validação
- [x] Melhorar mensagens de erro no upload com instruções claras e duração estendida

## Favicon - 21/12/2025
- [x] Dobrar tamanho do favicon de 32x32 para 64x64 pixels

## Melhorias na Análise - 21/12/2025
- [x] Gerar estrutura do relatório por IA baseada em título, tema, objetivo e contexto
- [x] Tornar a estrutura gerada editável pelo usuário
- [x] Adicionar previsão de tempo em cada etapa da execução

## Formatação do Relatório - 21/12/2025
- [x] Adicionar seção de referências bibliográficas no padrão APA 7 ao final do relatório
- [x] Adicionar rodapé em cada página: "Texto gerado pelo Conselho IA de Geopolítica da FGV" com data

## Reformulação da Fase Estruturar - 21/12/2025
- [x] Renomear fase "Personalizar" para "Estruturar"
- [x] Implementar geração de estrutura por Golbery (Gemini Pro 3) baseada em título, tema, objetivo, contexto e fontes
- [x] Implementar revisão de estrutura por Kissinger (Claude Opus 4.5)
- [x] Botão "Sugira a estrutura do relatório de análise"
- [x] Permitir edição da estrutura pelo usuário
- [x] Botão "Revisar Novamente" para regenerar estrutura
- [x] Botão "Prosseguir" para avançar
- [x] Garantir que referências APA apareçam ao final

## Reformulação da Etapa de Execução - 21/12/2025
- [ ] Atualizar prompts do Maestro para convocar Conselheiros individualmente
- [ ] Cada Conselheiro elabora relatório completo seguindo a estrutura
- [ ] Maestro consolida todos os relatórios em documento único
- [ ] Editor-Chefe revisa documento final
- [ ] Mostrar em tempo real o que o Maestro está solicitando
- [ ] Exibir tempos previstos e de execução para cada etapa
- [ ] Linguagem acadêmica de alto nível (sem adjetivos em excesso, neologismos ou expressões de IA)
- [ ] Manter usuário informado do progresso


## Reformulação da Etapa de Execução - 21/12/2025 - Concluído
- [x] Maestro convoca cada Conselheiro para elaborar relatório individual seguindo estrutura definida
- [x] Cada Conselheiro produz seu próprio relatório completo
- [x] Maestro consolida todos os relatórios em um único documento
- [x] Editor-Chefe revisa o documento final
- [x] Mostrar em tempo real: o que o Maestro está solicitando
- [x] Mostrar tempos previstos e de execução
- [x] Linguagem acadêmica de alto nível (sem adjetivos em excesso, neologismos ou expressões de IA)


## Bug Geração de Estrutura - 21/12/2025
- [x] Investigar e corrigir erro na geração de estrutura (Gemini 3 Pro Preview funcionando)
- [x] Remover menções a Golbery, Kissinger e modelos da interface de estruturação


## Grandes Alterações - 21/12/2025
- [ ] Eliminar campo "Tema" da análise
- [ ] Renomear "Objetivo" para "Objetivos da Análise"
- [ ] Reordenar campos: Contexto antes dos Objetivos
- [ ] Implementar estrutura editável com drag-and-drop (mover seções)
- [ ] Permitir deletar e adicionar novas seções na estrutura
- [ ] Eliminar DeepSeek e GPT dos provedores
- [ ] Migrar todos os conselheiros para Gemini 3 Pro ou Claude Opus 4.5
- [ ] Integrar função deep research para busca de informações
- [ ] Manter revisão por Opus 4.5 transparente ao usuário


## Grandes Alterações - 21/12/2025 - Concluído
- [x] Eliminar campo "Tema" da análise
- [x] Renomear "Objetivo" para "Objetivos da Análise"
- [x] Reordenar campos: Contexto antes dos Objetivos
- [x] Implementar estrutura editável com mover, deletar e adicionar seções
- [x] Eliminar DeepSeek e GPT - migrar todos os conselheiros para Gemini 3 Pro ou Claude Opus 4.5
- [x] Integrar função deep research (já existente via searchAndFetchContent)


## Exportação de Relatório - 21/12/2025
- [x] Adicionar botão para exportar relatório em PDF (já existia)
- [x] Adicionar botão para exportar relatório em DOCX


## Bug Geração de Estrutura - 21/12/2025 (Parte 2)
- [x] Investigar e corrigir erro na geração de estrutura (adicionado fallback Gemini 2.5 Pro)


## Bug Geração de Estrutura - 21/12/2025 (Parte 3)
- [x] Investigar erro persistente na geração de estrutura (modelo Claude corrigido de opus-4-5 para sonnet-4)


## Alterações Solicitadas - 21/12/2025 (Parte 4)
- [x] Atualizar textos da fase Estruturar: título, descrição e botão
- [x] Alterar modelo para Gemini 2.5 Pro
- [x] Testar APIs com as chaves do ambiente (Gemini e Claude OK)


## Alterações Solicitadas - 21/12/2025 (Parte 5)
- [x] Substituir "Orquestrador" por "Maestro" em todo o código
- [x] Substituir "Revisor" por "Editor-Chefe" em todo o código
- [x] Melhorar fase Executar com tempos estimados visíveis
- [x] Adicionar barra de progresso por etapa na execução
- [ ] Investigar e corrigir erro na geração do relatório


## Unificação da Identidade Visual - 21/12/2025
- [x] Analisar diferenças visuais entre landing page e páginas internas
- [x] Unificar cores de fundo e gradientes em todas as páginas
- [x] Aplicar tipografia consistente (Gotham) em todas as páginas
- [x] Unificar espaçamentos e paddings
- [x] Aplicar identidade visual na página Nova Análise
- [x] Aplicar identidade visual na página Dashboard
- [x] Aplicar identidade visual na página Histórico
- [x] Aplicar identidade visual na página Administração
- [x] Garantir transições suaves entre páginas


## Correção de Erro na Geração e Melhorias de UX - 21/12/2025
- [x] Adicionar logs detalhados para identificar erro na geração do relatório
- [x] Atualizar nomes das etapas de execução (Maestro convoca, Conselheiros elaboram, etc.)
- [x] Implementar feedback visual do Maestro conduzindo o processo
- [x] Mostrar Maestro examinando respostas e devolvendo se necessário
- [x] Remover highlights das bios dos coordenadores


## Atualização em Tempo Real e Retry Automático - 21/12/2025 - Concluído
- [x] Criar endpoint SSE no backend para streaming de progresso da análise
- [x] Modificar runMultiAgentAnalysis para emitir eventos de progresso
- [x] Conectar frontend ao SSE para receber atualizações
- [x] Atualizar steps dinamicamente conforme a análise progride
- [x] Implementar lógica de retry automático quando Conselheiro falhar (até 2 tentativas)
- [x] Adicionar mensagem do Maestro solicitando nova tentativa
- [x] Feedback visual de retry no frontend (ícone amarelo, mensagem, contador de tentativas)

## Correções e Intervenção do General Novaes - 21/12/2025
- [x] Investigar e corrigir erro na primeira análise dos Conselheiros
- [x] Substituir "relatório" por "parecer" para os Conselheiros
- [x] Manter "relatório" apenas para Maestro (consolidação final)
- [x] Garantir barra de execução visível em TODAS as etapas
- [x] Implementar intervenção do General Novaes após consolidação do Maestro
- [x] Novaes rejeita na primeira tentativa e solicita melhorias
- [x] Novaes aprova na segunda tentativa e encaminha ao Editor-Chefe
- [x] Adicionar feedback visual da intervenção do Novaes


## Intervenção Surpresa do General Novaes - 21/12/2025 - Concluído
- [x] Investigar e corrigir erro na execução da análise (SSE reconexão melhorada, heartbeat 15s)
- [x] Implementar mensagem surpresa "Opa! O General Novaes..." após consolidação
- [x] Não mostrar etapa do Novaes nos steps iniciais (deve ser surpresa)
- [x] Texto volta ao Maestro para melhorias
- [x] Antes da publicação final, Novaes aprova de surpresa o texto
- [x] Adicionar feedback visual da intervenção surpresa
- [x] Steps do Novaes são inseridos dinamicamente via SSE durante a execução


## Bug: Erro após Maestro convocar Conselheiros - 21/12/2025
- [ ] Investigar erro que ocorre após Maestro convocar Conselheiros
- [ ] Verificar logs do servidor para identificar a causa
- [ ] Corrigir o erro que faz o app voltar para a página anterior
- [ ] Testar fluxo completo de análise


## Correção de Erro na Execução da Análise - 21/12/2025 - Concluído
- [x] Investigar logs do servidor para identificar o erro (SSE desconectando durante consolidação)
- [x] Reduzir intervalo do heartbeat SSE para 5 segundos
- [x] Melhorar lógica de reconexão SSE no frontend
- [x] Adicionar status "rejected" para intervenção do General Novaes
- [x] Atualizar interface visual para status rejected (cor laranja)
- [x] Corrigir configuração de LLM no banco (Maestro e Editor com Anthropic)
- [x] Todos os 74 testes passando


## Correções no Painel Admin - 21/12/2025 - Concluído
- [x] Aumentar espaçamento entre abas do menu para evitar sobreposição (flex-wrap + gap)
- [x] Corrigir formulário de convite de usuário (botão "Confirmar Convite" com borda superior)
- [x] Permitir digitação livre no campo de modelo LLM na aba de configuração


## Bug: Erro "Unexpected token '<'" ao Executar Análise - 21/12/2025
- [ ] Investigar logs do servidor para identificar o erro
- [ ] Corrigir servidor retornando HTML em vez de JSON
- [ ] Testar fluxo completo de análise
- [ ] Bug: Modal de convidar novo usuário sem botão de confirmação

## Correção de Bug - Modal de Convite - 21/12/2025 - Concluído
- [x] Corrigir botão "Confirmar Convite" invisível no modal de convite de usuário
- [x] Adicionar classe .bg-fgv-blue que estava faltando no CSS
- [x] Adicionar max-height e overflow-y ao DialogContent para modais grandes

## Bug Crítico - Erro na Execução de Análise - 21/12/2025
- [ ] Corrigir erro "Unexpected token '<'" durante execução de análise
- [ ] Servidor retornando HTML em vez de JSON
- [ ] Investigar endpoint de execução e SSE
- [ ] Bug: Erro 'Unexpected token <' ao adicionar arquivos .doc nas fontes ou ativar pesquisa na web

## Correção do Erro 'Unexpected token <' - 21/12/2025 - Concluído
- [x] Identificar causa do erro: timeout HTTP durante execução longa da análise
- [x] Modificar endpoint executeMultiAgent para executar em background
- [x] Retornar imediatamente após iniciar a análise
- [x] Usar SSE para acompanhar progresso e receber resultado final
- [x] Testar com arquivos DOCX e busca web habilitados


## Reformulação do Sistema de Análise - 21/12/2024

- [x] Novos prompts dos Conselheiros: texto discursivo, sem bullet points, objetivo
- [x] Aprovação individual pelo General Novaes após cada parecer de conselheiro
- [x] Editor-Chefe consolida pareceres sem mencionar nomes dos Conselheiros
- [x] Relatório final segue a estrutura aprovada pelo usuário
- [x] Barras de progresso visuais com campo progress (0-100) para cada tarefa
- [ ] Testar o novo fluxo completo com análise real

## Reformulação do Sistema de Análise - 21/12/2024
- [x] Novos prompts dos Conselheiros - texto discursivo, sem bullet points, objetivo
- [x] Cada conselheiro lê todas as fontes, título, contexto, objetivos e estrutura
- [x] Aprovação individual pelo General Novaes após cada parecer de conselheiro
- [x] Editor-Chefe consolida todos os relatórios sem mencionar nomes dos Conselheiros
- [x] Relatório final segue a estrutura aprovada pelo usuário
- [x] Barras de progresso visuais para cada tarefa
- [x] Correção da geração de estrutura para exibir seções corretamente

## Personalidade dos Conselheiros e Timer - 21/12/2024
- [ ] Criar tabela de personalidade dos conselheiros no banco de dados
- [ ] Adicionar interface de edição de personalidade no painel de administração (apenas admin)
- [ ] Integrar personalidade nos prompts dos conselheiros (LLM lê antes de executar)
- [ ] Corrigir timer da página de análise que está zerado


## Funcionalidade de Personalidade dos Conselheiros - 21/12/2025 - Concluído
- [x] Campo de personalidade já existia na tabela counselorLlmConfig
- [x] Endpoint updateCounselorPersonality já existia no routers.ts
- [x] Aba "Personalidade" já existia no painel admin (AdminPanel.tsx)
- [x] Integrar personalidade nos prompts dos conselheiros (multiAgents.ts)
- [x] Adicionar log para confirmar uso da personalidade
- [x] Testar integração (74 testes passando)

## Correção do Timer na Página de Análise - 21/12/2025 - Concluído
- [x] Identificar problema: useMemo não atualiza em tempo real
- [x] Substituir useMemo por useState + useEffect com setInterval
- [x] Timer agora atualiza a cada segundo durante execução
- [x] Testar correção (74 testes passando)


## Bug: Análise Travada na Convocação - 21/12/2025
- [ ] Investigar por que a análise fica presa na "Convocação do Conselho"
- [ ] Verificar logs do servidor durante execução
- [ ] Corrigir fluxo de execução para avançar pelos conselheiros
- [ ] Testar execução completa da análise

## Interface de Edição de Prompts no Admin - 21/12/2025
- [ ] Criar nova aba "Prompts" no painel admin
- [ ] Listar todos os prompts do sistema (conselheiros, Maestro, Editor, Novaes)
- [ ] Adicionar descrição do objetivo de cada prompt
- [ ] Criar campo editável para cada prompt
- [ ] Salvar prompts editados no banco de dados
- [ ] Carregar prompts do banco ao executar análise


## Bug: Análise Travada na Convocação - 21/12/2025 - Concluído
- [x] Investigar por que a análise trava na "Convocação do Conselho"
- [x] Adicionar emissão do step de convocação no backend
- [x] Corrigir correspondência de nomes dos steps (frontend/backend)
- [x] Corrigir campo analyst para usar ID em vez de name

## Interface de Edição de Prompts - 21/12/2025 - Concluído
- [x] Criar tabela system_prompts no banco de dados
- [x] Adicionar funções de acesso aos prompts no db.ts
- [x] Criar endpoints de admin para gerenciar prompts
- [x] Adicionar aba "Prompts do Sistema" no painel admin
- [x] Implementar edição inline de cada prompt
- [x] Adicionar descrição do objetivo de cada prompt
- [x] Implementar reset individual e em massa
- [x] Agrupar prompts por categoria (Agentes, Tarefas, Avaliação)


## Substituição Maestro → General Novaes e Tipo Owner - 21/12/2025
- [ ] Substituir "Maestro" por "General Novaes" em todo o código
- [ ] Atualizar prompts para refletir o papel do General Novaes
- [ ] Criar tipo de usuário "Owner" no schema
- [ ] Definir permissões do Owner (gerenciar usuários, sem acesso a LLM/prompts/personalidade)
- [ ] Atualizar painel admin para restringir abas por role
- [ ] Atualizar Novaes e Rivail para Owner
- [ ] Manter Marlos como Admin


## Substituição Maestro → General Novaes (CONCLUÍDO)
- [x] Substituir Maestro por General Novaes em todo o app
- [x] Atualizar db.ts (DEFAULT_COUNSELORS, initializeDefaultCounselorConfigs)
- [x] Atualizar routers.ts (temperatura, prompts)
- [x] Atualizar multiAgents.ts (mensagens, steps, temperatura)
- [x] Atualizar analysisProgress.ts (novaesMessage)
- [x] Atualizar NewAnalysis.tsx (mensagens, steps)
- [x] Atualizar AdminPanel.tsx (labels, ícones)
- [x] Atualizar testes (counselor-llm.test.ts)
- [x] Atualizar banco de dados (remover maestro, manter general_novaes)

## Tipo de Usuário Owner (CONCLUÍDO)
- [x] Criar role 'owner' no schema (users e invited_users)
- [x] Criar ownerProcedure no routers.ts
- [x] Atualizar endpoints de usuários para ownerProcedure
- [x] Atualizar AdminPanel.tsx para verificar isAdmin e isOwner
- [x] Esconder abas restritas (LLM, Custos, Temperatura, Personalidade, Prompts) para owners
- [x] Adicionar opção Owner no select de convite
- [x] Atualizar roles no banco: Novaes e Rivail → owner, Marlos → admin


## Melhorias Solicitadas - 21/12/2025 (CONCLUÍDO)
- [x] Aumentar limite de upload de 20MB para 50MB
- [x] Criar validação de email ao iniciar análise (substituir autenticação Manus)
- [x] Cancelar envio de emails para todos exceto Admin
- [x] Corrigir página em branco no início do relatório
- [x] Aumentar margem inferior para evitar sobreposição com rodapé
- [x] Incluir fontes do usuário na bibliografia do relatório


## Redesign Interface de Progresso e Estrutura - 21/12/2025
- [ ] Corrigir bug da tela travada na Convocação do Conselho
- [ ] Substituir múltiplas caixas de progresso por uma única
- [ ] Implementar mensagens dinâmicas e criativas sobre o progresso
- [ ] Zerar barra de progresso a cada nova tarefa
- [ ] Alterar botão de estrutura para "Clique aqui para um Conselheiro redigir uma proposta..."
- [ ] Implementar escolha aleatória de Conselheiro para gerar estrutura
- [ ] Fazer Conselheiro seguir sua personalidade ao gerar estrutura


## Redesign Interface de Progresso e Estrutura - 21/12/2025 (CONCLUÍDO)
- [x] Corrigir bug da tela travada na Convocação do Conselho (campo progress não atualizado no SSE)
- [x] Redesenhar interface com caixa única de progresso
- [x] Adicionar mensagens criativas e dinâmicas sobre o que está acontecendo
- [x] Zerar barra de progresso a cada nova tarefa
- [x] Mostrar mini indicadores de etapas concluídas
- [x] Alterar botão para "Clique aqui para um Conselheiro redigir uma proposta de estrutura"
- [x] Implementar seleção aleatória de Conselheiro para estrutura
- [x] Integrar personalidade do Conselheiro na geração de estrutura
- [x] Mostrar nome do Conselheiro que elaborou a estrutura
- [x] Revisor também é selecionado aleatoriamente (diferente do propositor)


## Preservação de Configurações e Personalidades - 21/12/2025 (CONCLUÍDO)
- [x] Verificar se configurações do Admin são preservadas entre versões de código (initializeDefaultCounselorConfigs já verifica `if (!existing)`)
- [x] Verificar se personalidades são lidas do banco antes de cada análise
- [x] Adicionar leitura de personalidade para General Novaes antes de avaliar pareceres
- [x] Adicionar leitura de personalidade para Editor-Chefe antes de consolidar relatório
- [x] Garantir que initializeDefaultCounselorConfigs não sobrescreve configurações existentes
- [x] Testar fluxo completo de análise com personalidade configurada


## Interface de Revisão do General Novaes - 21/12/2025
- [ ] Criar tabela para armazenar pareceres pendentes de revisão
- [ ] Criar endpoints para listar, aprovar, rejeitar e solicitar reescrita de pareceres
- [ ] Implementar interface de revisão com visualização de cada parecer
- [ ] Adicionar botões de aprovar/rejeitar com campo de feedback
- [ ] Integrar fluxo de aprovação manual com consolidação
- [ ] Permitir que consolidação só aconteça após aprovação dos pareceres


## Interface de Revisão do General Novaes - 21/12/2025 (CONCLUÍDO)
- [x] Criar tabela counselor_opinions para armazenar pareceres
- [x] Adicionar funções de acesso aos pareceres no db.ts
- [x] Criar endpoints de API para revisão (aprovar, rejeitar, solicitar revisão)
- [x] Implementar interface de revisão no frontend (ReviewOpinions.tsx)
- [x] Integrar fluxo de aprovação com consolidação do relatório
- [x] Adicionar botão de acesso à revisão após análise concluída
- [x] Salvar pareceres aprovados automaticamente no banco durante análise


## Mensagens Criativas Durante Pareceres - 21/12/2025
- [ ] Criar banco de mensagens personalizadas por Conselheiro (baseadas em personalidade)
- [ ] Implementar timer mínimo de 30 segundos por mensagem
- [ ] Garantir que mensagens não se repitam durante a análise
- [ ] Explorar estilo de pensamento e comportamento de cada Conselheiro
- [ ] Atualizar frontend para exibir mensagens criativas durante elaboração


## Mensagens Criativas Durante Análise - 21/12/2025 (CONCLUÍDO)
- [x] Criar sistema de mensagens personalizadas por Conselheiro (COUNSELOR_MESSAGES)
- [x] Implementar timer mínimo de 30 segundos para cada mensagem (atualização a cada 10s)
- [x] Garantir que mensagens não se repitam durante a análise (usedMessages tracking)
- [x] Explorar personalidade do Conselheiro nas mensagens (6+ mensagens por conselheiro)
- [x] Atualizar frontend para exibir mensagens criativas (creativeMessage no SSE)
- [x] Adicionar mensagens para General Novaes e Editor-Chefe
- [x] Limpar mensagens usadas ao final da análise


## Bug Crítico: Barra de Progresso Travada - 21/12/2025 (CORRIGIDO)
- [x] Investigar por que a barra de progresso está travada em 0%
- [x] Corrigir atualização do progresso durante elaboração de parecer (fallback para tempo estimado)
- [x] Substituir "Atualização do Conselho" por "Bastidores da Sessão do Conselho"
- [x] Adicionar progress: 0 aos initialSteps
- [x] Aumentar estimatedDuration para refletir tempo real (45s para parecer)


## Melhorias de UX e Rejeição do General Novaes - 21/12/2025
- [x] Adicionar animação de pulso na barra de progresso durante espera do LLM
- [x] Mostrar tempo restante estimado ao lado da porcentagem
- [x] Criar sistema de rejeição criativa do General Novaes para propostas inadequadas
- [x] Implementar mensagens ríspidas e bem-humoradas no estilo militar
- [x] Adicionar mensagens de aprovação elogiosas no estilo militar


## Prompts e Modo Espectador - 21/12/2025
- [x] Adicionar prompts de aprovação do General Novaes à base de dados (seção Administração)
- [x] Adicionar prompts de rejeição do General Novaes à base de dados (seção Administração)
- [x] Criar interface de edição dos prompts de aprovação/rejeição no painel admin (usa interface existente de System Prompts)
- [x] Implementar modo espectador no backend (SSE para debate em tempo real)
- [x] Criar interface do modo espectador no frontend
- [x] Mostrar argumentos e contra-argumentos dos Conselheiros
- [x] Exibir reações e avaliações do General Novaes em tempo real


## Bug Crítico - Análise Travada - 21/12/2025
- [x] Investigar análise travada na fase de convocação (25+ minutos)
- [x] Verificar logs do servidor para identificar erro (Gemini 2.5 Pro não retorna texto devido a thinking tokens)
- [x] Corrigir problema e testar (alterado para Gemini 2.0 Flash)


## Timeout de Análises - 21/12/2025
- [x] Implementar monitoramento de progresso no backend
- [x] Criar sistema de timeout de 10 minutos sem progresso
- [x] Atualizar status da análise para "timeout" quando expirar
- [x] Mostrar mensagem de timeout no frontend
- [x] Testar funcionamento do timeout (93 testes passando)


## Botão Cancelar Análise - 21/12/2025
- [x] Adicionar status "cancelled" ao enum de status da análise
- [x] Criar endpoint tRPC para cancelar análise
- [x] Implementar sistema de sinalização para interromper análise em execução
- [x] Adicionar botão "Cancelar análise" na interface de execução
- [x] Mostrar confirmação antes de cancelar
- [x] Testar funcionamento do cancelamento (101 testes passando)


## Bug - Análise Travando - 21/12/2025
- [x] Verificar logs do servidor para identificar causa do travamento
- [x] Analisar chamadas à API Gemini e possíveis timeouts
- [x] Verificar se há problema com o modelo Gemini 2.0 Flash
- [x] Corrigir problema identificado (timeout de 60s + fallback + logs detalhados)
- [ ] Testar correção com análise real


## Remover Página Executar Análise - 21/12/2025
- [ ] Remover arquivo AnalysisExecution.tsx
- [ ] Remover rota /analysis/:id/execute do App.tsx
- [ ] Verificar se há links para essa página e removê-los


## General Novaes Propõe Estrutura - 21/12/2025
- [x] Modificar backend para General Novaes propor estrutura (substituir Golbery)
- [x] Adicionar sistema de parecer: verde (aprovar), amarelo (melhorar), vermelho (abandonar)
- [x] Atualizar frontend para mostrar parecer do General Novaes
- [x] Botões já existentes: Cancelar (voltar), Reescrever (revisar novamente), Executar (avançar)
- [x] Testar fluxo completo


## Valores Padrão para Teste - 21/12/2025
- [x] Criar constante com título e contexto padrão no backend
- [x] Adicionar endpoint para retornar valores padrão
- [x] Criar botão "Carregar Exemplo" no frontend
- [x] Testar preenchimento automático (101 testes passando)


## Atualizar Objetivo Padrão - 21/12/2025
- [x] Adicionar objetivo detalhado com 6 questões específicas ao endpoint
- [x] Atualizar frontend para preencher também o objetivo
- [x] Testar preenchimento completo (101 testes passando)


## Auditoria de Prompts - 21/12/2025
- [x] Listar todos os prompts definidos no banco de dados (6 prompts)
- [x] Verificar uso de cada prompt no código
- [x] Identificar prompts não utilizados (structure_generator NÃO é usado)
- [x] Remover prompt structure_generator obsoleto


## General Novaes Lê Fontes para Estrutura - 21/12/2025
- [x] Modificar generateStructureWithReview para processar todas as fontes anexadas
- [x] Incluir conteúdo completo das fontes no prompt do General Novaes (até 10k chars por fonte)
- [x] Atualizar para usar Claude Opus 4.5 via 'anthropic' (modelo mais avançado)
- [x] Testar geração de estrutura com fontes reais (101 testes passando)


## Mover Prompt de Estrutura para BD - 21/12/2025
- [x] Adicionar prompt 'novaes_structure_generator' à base de dados
- [x] Atualizar generateStructureWithReview para buscar prompt do banco
- [x] Testar geração de estrutura com prompt editável (101 testes passando)


## Separar 3 Papéis do General Novaes - 21/12/2025
- [x] Criar prompt 'novaes_proposal_evaluator' (avalia proposta e dá parecer verde/amarelo/vermelho)
- [x] Renomear/ajustar 'novaes_structure_generator' (apenas gera estrutura após aprovação)
- [x] Criar prompt 'novaes_session_coordinator' (coordena sessão do conselho)
- [x] Refatorar generateStructureWithReview para separar avaliação de estruturação (2 chamadas LLM distintas)
- [x] Refatorar runMultiAgentAnalysis para usar prompt de coordenação
- [x] Testar os 3 papéis separadamente (101 testes passando)


## Atualizar Textos para Novo Fluxo - 21/12/2025
- [x] Atualizar página inicial com descrição do novo fluxo
- [x] Atualizar página "Como funciona" com etapas detalhadas
- [ ] Atualizar textos da página de nova análise
- [ ] Atualizar mensagens durante geração de estrutura
- [ ] Atualizar mensagens durante execução da análise (Sessão do Conselho)
- [ ] Atualizar mensagens de consolidação final
- [ ] Revisar todos os textos para consistência


## Atualização de Textos para Refletir Novo Fluxo - 21/12/2025
- [x] Atualizar descrição principal da Home
- [x] Atualizar 5 passos da seção "Como funciona"
- [ ] Atualizar textos da página de Nova Análise
- [ ] Atualizar mensagens durante execução da análise
- [ ] Testar e salvar checkpoint


## Página de Perfil do General Novaes - 21/12/2025
- [x] Criar página de perfil do General Novaes (Coordenador do Conselho)
- [x] Descrever seus 3 papéis: avaliador, estruturador, coordenador
- [x] Atualizar prompt novaes_proposal_evaluator com personalidade (guardião da excelência, linguagem militar)
- [x] Atualizar prompt novaes_structure_generator com personalidade (firme, direto, pragmático)
- [x] Atualizar prompt novaes_session_coordinator com personalidade (maestro, inspirador, militar)
- [x] Adicionar rota /coordenador/novaes
- [ ] Adicionar link de navegação na página de Coordenação
- [x] Testar página e prompts (101 testes passando)


## Fluxo Real da Sessão do Conselho - 22/12/2025
- [ ] Criar prompt 'session_coordinator' para General Novaes convocar Conselheiros
- [ ] Criar prompt 'final_unifier' para General Novaes + Editor-Chefe unificarem pareceres
- [ ] Modificar geração de pareceres para carregar personalidade do Conselheiro antes
- [ ] Implementar geração de pareceres durante a Sessão (não antecipadamente)
- [ ] Implementar unificação final usando Claude Opus 4.5
- [ ] Atualizar frontend para mostrar "Conselheiro X apresentando parecer..."
- [ ] Adicionar efeito de "leitura" gradual dos pareceres
- [ ] Testar fluxo completo da Sessão

- [x] Investigar e corrigir barra de progresso travando em 95% na Convocação
- [x] Revisar prompt da fase de Convocação (mensagem "Aguardando a IA")

- [x] Implementar progresso granular (25%, 50%, 75%) durante chamadas LLM
- [x] Melhorar estimativas de tempo baseadas em dados reais de execução
- [x] Remover seção "Agentes de Coordenação" da página de Método

- [x] Remover texto explicativo em "Estruturar relatório"
- [x] Substituir "Monte sua equipe" por "Selecione os Conselheiros que serão convocados"
- [x] Eliminar botão "Revisar novamente"
- [x] Adicionar carimbo visual de status (verde/amarelo/vermelho) na proposta

- [x] URGENTE: Corrigir travamento da execução na fase de Convocação (0% por 5+ minutos)
- [x] Corrigir tempo estimado incorreto (mostrando tempo negativo)
- [x] Garantir que SSE está enviando atualizações corretamente

- [x] Adicionar barra de status durante "Gerando estrutura"
- [x] Manter texto de aprovação do General Novaes visível (abaixo da Justificativa)
- [x] Substituir carimbos por imagens fornecidas (verde, vermelho, amarelo)
- [x] Posicionar carimbos em cima dos textos
- [x] Eliminar mensagem "Você excedeu sua cota de análises"

- [ ] CRÍTICO: Corrigir travamento da execução (0% por 6+ minutos, SSE não funcionando)
- [ ] Substituir "Envie sua análise" por "Envie sua proposta de análise"
- [ ] Melhorar legibilidade do botão
- [ ] Remover palavra "restantes" da tela Executar Análise


## Correção Crítica de Travamento SSE - 22/12/2025 - Concluído
- [x] CRÍTICO: Corrigir travamento da execução (tela parada em 0% por 6+ minutos)
- [x] Corrigir race condition: aguardar conexão SSE antes de iniciar análise
- [x] Remover palavra "restantes" da tela Executar Análise
- [x] Botões já estavam corretos como "Envie sua proposta de análise"


## Correções de UX - 22/12/2025
- [x] Verificar previsões de tempo (75s está correto: 60s elaboração + 15s revisão Novaes)
- [x] Eliminar link "Ver exemplo de relatório"
- [x] Mensagem de cota excedida não existe no código atual


## Correções Visuais - 22/12/2025
- [x] Tornar fundos dos carimbos transparentes (remover fundo quadriculado)
- [x] Mover mensagens toast para canto superior direito (position="top-right")
- [x] Remover estimativa de tempo da tela Estruturar Relatório
- [ ] Investigar prompt e modelo da etapa de Convocação


## Correções Críticas de UX - 22/12/2025 (Sessão 2)
- [x] Implementar heartbeat no backend durante chamadas LLM (emitir progresso a cada 5s)
- [x] Eliminar tela "Pronto para Executar" e auto-iniciar execução
- [x] Atualizar frontend para receber eventos de heartbeat


## Correções Urgentes de UX - 22/12/2025 (Sessão 3)
- [ ] Restaurar previsão de tempo por etapa na tela de execução
- [ ] Restaurar contador de tempo decorrido
- [ ] Adicionar indicador visual de pulso/animação durante processamento
- [ ] Corrigir mensagens contraditórias na tela de execução
- [ ] Manter auto-execução mas com todos os elementos visuais


## Arquitetura Gemini Flash para Coordenação - 22/12/2025
- [x] Criar prompt de coordenação para Gemini Flash (diálogo Novaes-Conselheiros)
- [x] Configurar chamada ao Gemini 2.0 Flash no backend (callGeminiFlash)
- [x] Modificar fluxo multiagentes para usar Flash como coordenador (generateNovaesCoordinationMessage)
- [x] Manter pareceres dos Conselheiros em paralelo (outros modelos)
- [x] Implementar emissão de eventos SSE em tempo real durante coordenação
- [ ] Testar fluxo completo com feedback visual contínuo


## Correção de Travamento da Interface - 22/12/2025 (Sessão 4)
- [x] Corrigir timer (elapsedTime) que não está incrementando - Timer agora inicia quando entra na etapa execute
- [x] Corrigir lógica de auto-execução que não está iniciando - Botão Prosseguir agora chama handleProceedToExecute
- [x] Garantir que isExecuting seja setado como true
- [x] Testar fluxo completo após correções - Backend processando, SSE emitindo eventos
- [ ] Implementar reconexão SSE após reload da página (pendente)


## Substituição de Carimbos - 22/12/2025
- [x] Substituir carimbo amarelo (revisar) pelo novo design
- [x] Substituir carimbo verde (aprovada) pelo novo design
- [x] Substituir carimbo vermelho (rejeitada) pelo novo design


## Sistema de Gerenciamento de Conselheiros - 22/12/2025
- [x] Criar tabela counselors no schema (já existia no banco)
- [x] Criar funções CRUD para Conselheiros no db.ts (getAllCounselors, getActiveCounselors, getCounselorById, getCounselorByKey, createCounselor, updateCounselor, deleteCounselor, toggleCounselorActive, initializeDefaultCounselors)
- [x] Criar rotas CRUD para Conselheiros no backend (list, listActive, get, getByKey, create, update, delete, toggleActive, reorder)
- [x] Criar interface de gerenciamento no painel admin (nova tab "Conselheiros")
- [x] Implementar formulário completo com abas: Básico, Biografia, Personalidade, Configuração
- [x] Cadastro de bio dos Conselheiros (shortBio, fullBio)
- [x] Cadastro de livros e materiais escritos (mainBooks, articles, otherMaterials)
- [x] Cadastro de personalidade (personalityTraits, writingStyle, analysisApproach, keyPhrases)
- [x] Permitir inclusão de novos Conselheiros
- [x] Permitir exclusão de Conselheiros (exceto padrão do sistema)
- [x] Permitir ativar/desativar Conselheiros
- [x] Criar testes para funções de Conselheiros (6 testes passando)


## Atualizações de Nomenclatura e LLM - 22/12/2025
- [ ] Substituir "Novaes" por "NovaAIs" no código (exceto aba Coordenação)
- [ ] Atualizar Gemini: gemini-3-pro-preview → gemini-2.5-pro
- [ ] Atualizar Claude: Opus 4.5 → Claude Sonnet 3.7
- [ ] Adicionar type: "service_account" e project_id: "dint-477213" nas configurações
- [ ] Atualizar chaves de API para ambos os LLMs
- [ ] Testar resposta do Gemini
- [ ] Testar resposta do Claude


## Atualização de Nomenclatura e LLMs - 22/12/2025 - Concluído
- [x] Substituir "Novaes" por "NovaAIs" em todo o código (exceto aba Coordenação)
- [x] Renomear arquivo NovaesProfile.tsx para NovaAIsProfile.tsx
- [x] Atualizar rotas de /novaes para /novaais
- [x] Configurar Gemini via Google Cloud Vertex AI (Service Account)
- [x] Implementar autenticação OAuth2 com JWT para Vertex AI
- [x] Atualizar modelo Gemini para gemini-2.5-pro-preview-06-05 via Vertex AI
- [x] Manter Claude via API direta Anthropic (claude-3-5-sonnet-20241022)
- [x] Criar serviço googleAuth.ts para gerenciar autenticação Google Cloud
- [x] Implementar fallback de Vertex AI para API direta do Gemini
- [x] Atualizar testes para validar integração Vertex AI (112 testes passando)


## Correções de Nomenclatura e Carimbos - 22/12/2025
- [x] Substituir "NovaAIs" por "NovAIs" em todo o código (exceto bio na página Coordenação)
- [x] Substituir "Estrutura da Análise" por "Proposta de Estrutura da Análise"
- [x] Substituir "Justificativa da Estrutura" por "Avaliação da Estrutura"
- [x] Substituir "Metodologia" por "Método"
- [x] Substituir carimbos pelas novas imagens (verde, vermelho, amarelo)
- [x] Posicionar carimbos fora do texto para melhor legibilidade


## Sistema de Custos por Relatório - 22/12/2025
- [x] Criar tabela report_costs no banco de dados (usando tabela existente llm_usage_costs)
- [x] Implementar rastreamento de tokens durante chamadas LLM (já existente)
- [x] Calcular custo total por relatório (tokens in + tokens out)
- [x] Registrar data, hora e usuário de cada relatório
- [x] Criar interface de visualização de custos no painel admin
- [x] Exibir histórico de custos com filtros por data e usuário


## Bugs Críticos - 23/12/2025
- [ ] Corrigir erro ao gerar estrutura da análise
- [ ] Resolver tela travada na convocação do conselho
- [ ] Exibir diálogos e progresso do Conselho durante a análise
- [ ] Garantir que o fluxo completo de análise funcione sem travamentos


## Correções de Bugs Críticos - 23/12/2025 - Concluído
- [x] Erro ao gerar estrutura - corrigido fallback para general_novaais/general_novaes
- [x] Tela travada na convocação do conselho - adicionado Log do Conselho com histórico de etapas
- [x] Adicionados logs detalhados para diagnóstico do evento complete SSE


## Correções de Nomenclatura - 23/12/2025
- [x] Corrigir "General NovaAIs" para "General NovAIs" em todo o código (já estava correto)
- [x] Substituir "Editor-Chefe" por "Max Weber" em todo o código


## Correção de Texto - 23/12/2025
- [x] Corrigir "uma projeto" para "um projeto" na página inicial
- [x] Atualizar descrição da Sessão do Conselho com Max Weber


## Correção de Bug Crítico - 23/12/2025
- [x] Erro na geração da estrutura - corrigido modelo Claude descontinuado (claude-3-5-sonnet-20241022 → claude-3-7-sonnet-20250219)
- [x] Todos os 120 testes passando

## Substituição de Carimbo Verde - 23/12/2025
- [x] Substituir carimbo verde de Proposta Aprovada pela nova imagem fornecida pelo usuário

## Correção do Log da Sessão do Conselho - 23/12/2025
- [x] Corrigir log travado na primeira fase durante sessão do conselho
- [x] Sincronizar fase 'novaes_review' entre frontend e backend
- [x] Melhorar lógica de matching de steps para analyst NovAIs
- [x] Corrigir busca de etapas de consolidação
- [x] Substituir carimbo vermelho de Proposta Rejeitada pela nova imagem
- [x] Dobrar tamanho da imagem do carimbo (w-48 para w-96)
- [x] Substituir carimbo verde de Proposta Aprovada pela nova imagem
- [x] Substituir carimbo amarelo de Proposta a Revisar pela nova imagem
- [x] Substituir General NovAIs por GenNovAIs em todo o projeto (120 ocorrências)
- [x] Remover \n do placeholder do campo Objetivos da Análise

## Melhorias Solicitadas - 28/12/2025
- [x] Ampliar fundo azul na home para toda a tela com logo FGV branca
- [x] Padronizar gennovAIs em todo o projeto (121 ocorrências)
- [x] Revisar e eliminar \n de placeholders
- [x] Implementar efeito parallax e fade-in no scroll do hero

## Unificação Seções Admin - Conselheiros - 28/12/2025
- [ ] Analisar estrutura atual das seções Conselheiros e Personalidades
- [ ] Criar nova seção unificada de Conselheiros
- [x] Implementar ordenação drag-and-drop dos conselheiros
- [x] Implementar upload de imagens (home e bio)
- [ ] Permitir edição de todos os campos dos conselheiros

## Migração de Imagens e Configuração
- [x] Migrar imagens existentes para homePhotoUrl e bioPhotoUrl
- [ ] Testar ordenação drag-and-drop dos conselheiros
- [ ] Verificar e configurar personalidades dos conselheiros

## Correções e atualizações da home
- [x] Corrigir 'resssuscitará' para 'ressuscitará'
- [x] Completar 'Se o parecer do lhe for favorável' com 'gennovAIs'
- [x] Atualizar seção Como funciona com novos nomes dos 5 passos
- [x] Renomear páginas dos 5 passos para refletir novo fluxo

## Novas funcionalidades
- [x] Adicionar botão Preços desabilitado na home
- [x] Adicionar ícones aos passos da seção Como funciona
- [ ] Atualizar schema com novos tipos de usuário (Pesquisador, Diretor, Administrador)
- [x] Unificar seções Usuários e Convites no painel admin com novos tipos de usuário

## Permissões e Carrossel de Apoiadores
- [x] Configurar permissões por tipo de usuário nas rotas do sistema
- [ ] Habilitar emails específicos como Administrador
- [ ] Buscar e baixar logos dos apoiadores (FGV, ABIN, CIA, FSB, Mossad)
- [ ] Implementar carrossel de logos na home


## Correções Admin Panel - 28/12/2025 - Concluído
- [x] Aumentar largura do formulário de conselheiros (max-w-4xl para max-w-6xl)
- [x] Botão de incluir novos conselheiros funcionando corretamente



## Melhorias Formulário e Home - 28/12/2025 - Concluído
- [x] Adicionar campo de texto para tarja de desabilitado no formulário de conselheiros
- [x] Implementar preview de imagens no formulário de upload (tamanho maior, dimensões recomendadas)
- [x] Na home, aumentar largura do campo de texto e adicionar imagem do globo no canto direito
- [x] Testar e salvar checkpoint


## Ajuste Seção Como Funciona - 28/12/2025 - Concluído
- [x] Atualizar de 5 para 6 passos incluindo etapa de pagamento
- [x] Testar e salvar checkpoint


## Melhorias Visuais e Padronização - 28/12/2025 - Concluído
- [x] Padronizar "GenNovAIs" em todo o sistema (substituir gennovAIs)
- [x] Adicionar badge "Gratuito" no passo de Pagamento
- [x] Reposicionar globo na home (maior, cortado na margem direita, opacidade 20%)
- [x] Adicionar globo em todas as páginas (About, Method, Coordination, FAQ, Contact, NovAIsProfile)
- [x] Criar componente reutilizável GlobeBackground
- [x] Testar e salvar checkpoint


## Animação do Globo - 28/12/2025 - Concluído
- [x] Implementar rotação lenta e contínua no globo (60s por rotação completa)
- [x] Adicionar prop 'rotate' ao componente GlobeBackground
- [x] Testar e salvar checkpoint


## Paleta de Cores FGV e Favicon - 28/12/2025 - Concluído
- [x] Documentar paleta de cores FGV oficial no código (index.css) com comentários detalhados
- [x] Adicionar cores vibrantes à paleta (roxos, cianos, verdes vibrantes)
- [x] Auditar cores usadas no app e corrigir as que estão fora da paleta
- [x] Criar favicon a partir do globo (16x16, 32x32, 192x192, 512x512)
- [x] Criar apple-touch-icon e android-chrome icons
- [x] Atualizar index.html com novos favicons
- [x] Testar e salvar checkpoint


## Reorganização Admin Panel - 28/12/2025 - Concluído
- [x] Unificar abas Configuração LLM + Temperatura LLM em "LLMs"
- [x] Unificar abas Custos por LLM + Custos por Relatório em "Custos"
- [x] Renomear "Configuração de email" para "E-mails"
- [x] Renomear "Prompts do Sistema" para "Prompts"
- [x] Validar cores dos conselheiros dinâmicos conforme paleta FGV (todas conformes: #5C5B5F, #008BC9, #2B8671)
- [x] Testar e salvar checkpoint


## Melhorias Hero e Correções - 28/12/2025 - Concluído
- [x] Diminuir transparência do globo na hero (de 20% para 10%)
- [x] Trazer apoiadores para o rodapé da hero
- [x] Adicionar nomes aos apoiadores (FGV, CIA, FSB, ABIN, Mossad)
- [x] Tornar fundo das logos transparente (ImageMagick)
- [x] Adicionar globo nas demais páginas (já estava em About, Method, Coordination, FAQ, Contact, NovAIsProfile - adicionado em AnalystProfile)
- [x] Corrigir formulário de novo conselheiro para vir em branco (resetForm + setEditingId(null))
- [x] Testar e salvar checkpoint


## Ajuste Logos Apoiadores - 28/12/2025 - Concluído
- [x] Ajustar tamanho dos logos para ficarem visualmente equilibrados (h-14, containers h-16, gap-16/20)
- [x] Adicionar efeito hover com scale e transição de cores
- [x] Testar e salvar checkpoint


## Melhorias Hero e Metodologia - 28/12/2025 - Em Progresso
- [ ] Criar carrossel de apoiadores com cores originais na hero
- [ ] Ajustar passo 3 da seção Como funciona (GenNovAIs avalia e propõe estrutura)
- [ ] Atualizar página de metodologia para alinhar com nova função do GenNovAIs
- [ ] Remover seção duplicada de apoiadores no final da página
- [ ] Aumentar visibilidade do globo (menos transparente)
- [ ] Testar e salvar checkpoint



## Melhorias Hero e Metodologia v2 - 28/12/2025 - Concluído
- [x] Criar carrossel de apoiadores com cores originais na hero (bg-white/90 para manter cores)
- [x] Ajustar passo 3 da seção Como funciona (GenNovAIs propõe estrutura)
- [x] Atualizar página de metodologia para alinhar com novo fluxo (6 passos atualizados)
- [x] Remover seção duplicada de apoiadores no final da home
- [x] Aumentar visibilidade do globo (opacity-10 para opacity-25, padrão 30%)
- [x] Testar e salvar checkpoint


## Preenchimento Automático de Conselheiros - 28/12/2025 - Em Progresso
- [ ] Criar prompt para preenchimento automático na seção Prompts do admin
- [ ] Criar rota tRPC para gerar dados do conselheiro via Gemini
- [ ] Adicionar botão "Preencher automaticamente" no formulário de conselheiros
- [ ] Permitir edição após preenchimento automático
- [ ] Testar e salvar checkpoint



## Preenchimento Automático de Conselheiros - 28/12/2025 - Concluído
- [x] Criar prompt para preenchimento automático na seção Prompts do admin (counselor_autofill)
- [x] Criar rota tRPC para gerar dados do conselheiro via Gemini (generateAutoFill)
- [x] Adicionar botão "Preencher com IA" no formulário de novo conselheiro
- [x] Gerar fotos usando IA (homePhotoUrl e bioPhotoUrl)
- [x] Criar testes unitários (counselorAutoFill.test.ts)
- [x] Testar e salvar checkpoint


## Ajustes Visuais na Hero - 28/12/2025 - Concluído
- [x] Reduzir transparência do globo na hero (opacity-25 para opacity-40) (torná-lo mais visível)
- [x] Reduzir o traço horizontal divisor da hero (removido border-t)
- [x] Descer a logo da FGV na hero (py-8 para pt-12 pb-6)
- [x] Padronizar cor do botão Preços (mesma cor dos demais, sem link funcional) (mesma cor dos demais, sem link)


## Melhorias Visuais e Metodologia - 28/12/2025 - Concluído
- [x] Adicionar tooltip "Gratuito durante o beta" ao botão Preços
- [x] Implementar efeito parallax no globo conforme scroll
- [x] Eliminar traço vertical que divide a tela na hero (não encontrado)
- [x] Manter logo FGV visível ao visualizar apoiadores (sticky header)
- [x] Atualizar Passo 1 para "Descreva sua proposta de pesquisa"
- [x] Atualizar página de Metodologia para incluir os 6 passos (com badge Gratuito no Passo 4)


## Correções Admin e Melhorias Home - 28/12/2025 - Concluído
- [x] Remover elementos duplicados no painel admin (cards de estatísticas)
- [x] Remover botão duplicado de convidar usuário no topo
- [x] Estender menu principal para ocupar tela toda
- [x] Reorganizar menu: Usuários, Conselheiros, E-mails, LLMs, Prompts, Custos, Histórico
- [x] Adicionar nova opção "Histórico" no menu admin
- [x] Implementar animação fade-in escalonado nos botões da hero
- [x] Melhorar responsividade mobile dos 6 passos em "Como funciona"


## Histórico e Indicadores de Passo - 28/12/2025 - Concluído
- [x] Criar endpoint tRPC para listar histórico de análises de todos os usuários
- [x] Implementar UI do Histórico no AdminPanel com filtros por data, usuário e status
- [x] Adicionar indicadores visuais de passo atual na Home
- [x] Adicionar indicadores visuais de passo atual na página de Metodologia
- [x] Adicionar indicadores visuais de passo atual no Dashboard


## Ajustes Visuais Hero - 28/12/2025 - Concluído
- [x] Deslocar globo para esquerda (2/3 visíveis)
- [x] Reduzir transparência do globo para maior visibilidade
- [x] Remover traço vertical que separa texto do globo (não encontrado no código)
- [x] Aumentar logo da FGV


## Melhorias Visuais - 28/12/2025 - Concluído
- [x] Melhorar contraste do menu do painel admin para facilitar leitura
- [x] Adicionar animação de rotação lenta ao globo na hero


## Ajustes Globo Hero - 28/12/2025 - Concluído
- [x] Reduzir velocidade de rotação do globo (mais lento)
- [x] Deslocar globo mais para a esquerda (mais visível)
- [x] Eliminar traço reto que acompanha o globo (nova imagem gerada)


## Correção de Formulários - 28/12/2025 - Concluído
- [x] Aumentar largura do formulário de inclusão de conselheiros
- [x] Rastrear e corrigir outros formulários com campos pequenos


## Ajustes Finais Globo - 28/12/2025 - Concluído
- [x] Rotação mais lenta (quase imperceptível) - 300s
- [x] Opacidade 70%
- [x] Deslocar para direita com 10% encoberto


## Reorganização Nomenclatura - 28/12/2025 - Em Progresso
- [x] Menu lateral: Nova Análise → Nova Proposta de Pesquisa
- [x] Título página: Passo 1 - Descreva sua proposta de pesquisa
- [x] Unificar subtítulos: análise → pesquisa
- [x] Remover elementos desnecessários (imagem anexa)
- [x] Organizar dados e fontes na primeira página


## Melhorias Globo e Formulário Usuários - 28/12/2025 - Em Progresso
- [x] Globo: velocidade ainda mais lenta (quase imperceptível)
- [x] Globo: aumentar opacidade
- [x] Usuários cadastrados: adicionar opção de deletar
- [x] Formulário: incluir campo nome (não obrigatório)
- [x] Formulário: corrigir posicionamento campo email
- [x] Formulário: aumentar tamanho
- [x] Fluxo: usuário entra direto após cadastro (sem aceite)


## URGENTE - Formulário Novo Conselheiro - 28/12/2025
- [x] Dobrar largura do formulário de Novo Conselheiro
- [x] Aumentar tamanho dos campos (nome só mostra 1 letra!)
- [x] Melhorar layout geral do formulário


## Ajuste Globo - 28/12/2025
- [x] Reduzir velocidade de rotação do globo (ainda mais lenta)
- [x] Aumentar opacidade do globo


## URGENTE - Correção Gerenciamento de Usuários - 28/12/2025
- [x] Corrigir exclusão de usuário cadastrado (não funciona)
- [x] Corrigir edição de usuário (não funciona)
- [x] Corrigir atualização de nome (sem efeito)
- [x] Revisar todo o fluxo de usuários com qualidade


## Efeito Globo - 28/12/2025
- [x] Adicionar efeito de brilho pulsante nos nós do globo
- [x] Ajustar opacidade do globo para 70%


## Reorganização dos 6 Passos - 28/12/2025
- [ ] Unificar título, contexto, objetivos e fontes no Passo 1
- [ ] Reorganizar steps para corresponder aos 6 passos do método
- [ ] Atualizar indicadores de progresso


## Reorganização dos Steps - 28/12/2024
- [x] Atualizar STEPS para corresponder aos 6 passos do método
- [x] Unificar Passo 1 com título, contexto, objetivos e fontes
- [x] Criar Passo 2 - Avaliação pelo GenNovAIs
- [x] Criar Passo 3 - Estruturação do Projeto
- [x] Criar Passo 4 - Pagamento (gratuito no beta)
- [x] Criar Passo 5 - Sessão do Conselho
- [x] Criar Passo 6 - Relatório Final
- [x] Atualizar menu lateral: Nova Análise → Nova Proposta de Pesquisa

## Ajustes Globo e IA Conselheiros - 28/12/2024
- [ ] Remover aura amarela do globo
- [ ] Aumentar velocidade de rotação em 10% (1200s → 1080s)
- [ ] Reduzir opacidade do globo para 40% (60% mais transparente)
- [ ] Mover globo para direita com 20% cortados pela margem
- [ ] Corrigir preenchimento automático por IA no formulário de Conselheiros


## Ajustes Globo e Preenchimento IA - 28/12/2025 - Concluído
- [x] Remover aura amarela do globo
- [x] Aumentar velocidade de rotação do globo em 10% (1200s → 1080s)
- [x] Aumentar transparência do globo em 60% (opacidade 40%)
- [x] Mover globo para direita com 20% cortados pela margem
- [x] Corrigir preenchimento automático por IA no formulário de Conselheiros (normalização de dados aninhados)


## Correções Urgentes - 28/12/2025
- [ ] Restaurar fontes de dados no passo 1 (notícias, URLs, uploads)
- [ ] Marcar "conhecimento dos conselheiros" como padrão
- [ ] Substituir "Administração" por "Configurações"
- [ ] Substituir "Painel Administrativo" por "Painel de Configurações"
- [ ] Remover "Gerencie usuários e acessos"
- [ ] Remover "Gerenciamento de usuários"


## Correções Urgentes - 28/12/2025 - Concluído
- [x] Restaurar fontes adicionais (Notícias, Arquivos, URLs) no Passo 1
- [x] Marcar "Conhecimentos dos Conselheiros" como padrão
- [x] Substituir "Administração" por "Configurações" no menu lateral
- [x] Substituir "Painel Administrativo" por "Painel de Configurações"
- [x] Remover "Gerencie usuários e acessos"
- [x] Simplificar título "Gerenciamento de Usuários" para "Usuários"


## Drag and Drop - Fontes de Dados - 28/12/2025 - Concluído
- [x] Instalar biblioteca de drag and drop (@dnd-kit/core)
- [x] Implementar reordenação de fontes na tela de nova pesquisa
- [x] Adicionar indicadores visuais de arrastar


## Ajustes Conselheiros e Globo - 28/12/2025 - Concluído
- [x] Eliminar conselheiro NovAIs do sistema (removido das listas, mantendo função de coordenação)
- [x] Eliminar conselheiro general_novaes do sistema (removido das listas, mantendo função de coordenação)
- [x] Adicionar tarja visual sobre imagem de conselheiros inativos
- [x] Garantir preenchimento por IA inclua personalidade e fotos
- [x] Reduzir tamanho do globo em 20%
- [x] Aumentar velocidade do globo em 5%
- [x] Mover globo para direita com 20% encoberto


## Novo Fluxo de 7 Passos - 28/12/2025
- [ ] Mapear todas as referências ao fluxo de 6 passos
- [ ] Atualizar Home - hero (texto "seis passos" para "sete passos")
- [ ] Atualizar Home - seção Como Funciona (adicionar passo 4)
- [ ] Atualizar página Method (Conheça o método completo)
- [ ] Atualizar página NewAnalysis (fluxo do app)
- [ ] Verificar outras páginas e componentes
- [ ] Testar todas as telas atualizadas


## Novo Fluxo de 7 Passos - 28/12/2025 - Concluído
- [x] Atualizar hero da Home para 7 passos
- [x] Atualizar seção Como Funciona na Home
- [x] Atualizar página Method (Conheça o método completo)
- [x] Atualizar página NewAnalysis (fluxo do app)
- [x] Adicionar novo passo 4: Escolha dos Conselheiros
- [x] Verificar outras páginas e componentes
- [x] Implementar interface de seleção de conselheiros no passo 4
- [x] Atualizar numeração de todos os passos (5-Pagamento, 6-Sessão, 7-Relatório)


## Melhorias Passo 4 e Globo - 28/12/2025
- [ ] Implementar pré-seleção automática de conselheiros baseada no tema
- [ ] Adicionar estimativa de tempo variável por número de conselheiros
- [ ] Adicionar estimativa de preço (zero por enquanto) variável por número de conselheiros
- [ ] Reduzir tamanho do globo em 20%
- [x] Aumentar velocidade de rotação do globo em 20%


## Melhorias Passo 4 e Globo - 28/12/2025 - Concluído
- [x] Pré-seleção automática de conselheiros por tema (marítimo→Mahan, terrestre→Mackinder, etc.)
- [x] Estimativa de tempo variável por número de conselheiros
- [x] Estimativa de preço (Gratuito R$ 0,00)
- [x] Reduzir globo em 20% (de 480/640/720px para 384/512/576px)
- [x] Aumentar velocidade do globo em 20% (de 1026s para 821s)


## Melhorias Hero - 28/12/2025
- [x] Adicionar contador de análises realizadas (prova social)
- [x] Adicionar selo Beta ao lado do título
- [x] Aumentar velocidade de rotação do globo em 20%


## Mosaico Conselheiros - 28/12/2025
- [x] Remover rótulos de escola (Brasileira, Americana, Clássica) do mosaico
- [x] Usar texto personalizado do campo de indisponibilidade na tarja


## Correções Passo 1 - 28/12/2025
- [x] Remover "opcional" das fontes
- [x] Corrigir upload de arquivos nas fontes
- [x] Remover "selecionados" da fonte conhecimentos dos Conselheiros
- [x] Alterar botão para "Enviar proposta à avaliação do GenNovAIs"


## Redesenho Passo 2 (Avaliação) - 28/12/2025
- [x] Criar seção "Parecer do GenNovAIs" com texto único
- [x] Adicionar carimbo visual (APROVADA, A REVISAR, REPROVADA)
- [x] Botão "Escolha os Conselheiros" se aprovado
- [x] Botão "Apresentar nova proposta" se a revisar/reprovado


## Coordenação do Conselho - 28/12/2025
- [x] Remover "acadêmica" do subtítulo
- [x] Unificar texto das bios (remover seções separadas)
- [x] Alterar texto da missão


## Organização de Prompts - 28/12/2025
- [x] Ordenar prompts por ordem de uso
- [ ] Eliminar prompts duplicados
- [ ] Remover prompts não utilizados


## Eliminação novaes_evaluator e Passo 2 - 28/12/2025
- [x] Eliminar prompt novaes_evaluator do banco de dados
- [x] Atualizar página Passo 2 para usar novaes_proposal_evaluator
- [x] Adicionar carimbo com animação
- [x] Adaptar botões conforme avaliação


## Melhorias Aba Prompts - 28/12/2025
- [x] Eliminar frase introdutória dos prompts
- [x] Adicionar botões para mover prompts (cima/baixo)
- [x] Adicionar opção de deletar prompt
- [x] Adicionar opção de criar novo prompt

## Melhorias na Aba de Prompts - 28/12/2025
- [x] Substituir 'General Novaes' por 'GenNovAIs' nos nomes dos prompts
- [x] Adicionar informação de quem chama cada prompt na interface
- [x] Adicionar informação de qual LLM cada prompt utiliza

## Ajustes de Layout no Hero - 28/12/2025
- [x] Aumentar margem direita dos containers de texto/botões em 20%
- [x] Reduzir distância entre logo FGV e conteúdo abaixo (subir conteúdo)

## Ajuste de Largura no Hero - 28/12/2025
- [x] Aumentar largura dos containers em ~3cm reduzindo margem direita

## Melhorias Completas no Hero - 28/12/2025
- [x] Aumentar espaço horizontal dos textos em mais 3cm (reduzir margem direita)
- [x] Ajustar tamanho do globo proporcionalmente ao novo layout
- [x] Criar animações de entrada suaves para textos do hero
- [x] Implementar breakpoints responsivos para tablets
- [x] Implementar breakpoints responsivos para celulares

## Substituição de Nomes - 28/12/2025
- [x] Substituir GenNovAIs por GennovAIs em todo o código
- [x] Substituir General Novaes por GennovAIs em todo o código

## Correção do Globo - 28/12/2025
- [x] Restaurar globo decorativo na hero com animação de rotação

## Correção Passo 2 - 28/12/2025
- [x] Remover fontes redundantes do Passo 2 e mostrar apenas Avaliação da Estrutura

## Correção Passo 2 - Parecer GennovAIs - 28/12/2025
- [x] Ajustar Passo 2 para mostrar parecer do GennovAIs com texto, conclusão, carimbo e botões adequados
- [x] Direcionar botão de aprovação para Passo 3 (Estruturação)

## Substituição na tela Prompts - 28/12/2025
- [x] Substituir General Novaes por GennovAIs na tela de Prompts do Sistema

## Substituição completa General Novaes/Novais - 28/12/2025
- [x] Buscar e substituir todas as referências a General Novaes/Novais por GennovAIs

## Ajustes no Globo - 28/12/2025
- [x] Aumentar diâmetro do globo em 20%
- [x] Deslocar globo 2cm para direita (parcialmente cortado)
- [x] Adicionar iluminação aleatória e discreta nos nós (sem aura amarela)

## Página de Coordenação - 28/12/2025
- [x] Substituir GennovAIs por General Novaes na página de Coordenação (já estava correto)

## Passo 2 - Avaliação da Proposta - 28/12/2025
- [x] Alterar título para 'Passo 2 - Avaliação da Proposta'
- [x] Adicionar mensagem de loading 'O GennovAIs está avaliando sua proposta...'
- [x] Exibir parecer gerado pelo prompt novaes_proposal_evaluator
- [x] Implementar carimbo verde (aprovado), amarelo (a revisar), vermelho (rejeitado) com animação
- [x] Manter botão Voltar para casos de revisão/rejeição
- [x] Adicionar botão 'Solicitar ao GennovAIs sugestão de estrutura da pesquisa' para Passo 3

## Sons de Carimbo - 28/12/2025
- [x] Adicionar sons de carimbo para feedback de avaliação (aprovado, a revisar, rejeitado)

## Correção Passo 2 - 28/12/2025
- [x] Exibir texto completo de avaliação do GennovAIs entre título e parecer
- [x] Remover texto 'por padrão' do parecer

## Ajustes Hero - 28/12/2025
- [x] Aumentar tamanho do globo em 50%
- [x] Aumentar margem direita dos textos em 5cm
- [x] Tornar globo mais transparente para legibilidade
- [x] Fazer nós da rede neural piscarem em amarelo/laranja da paleta

## Linhas de Conexão - 28/12/2025
- [x] Criar linhas de conexão animadas entre os nós da rede neural
- [x] Sincronizar animação das linhas com o piscar dos nós

## Melhorias no Passo 2 - Avaliação do GennovAIs - 28/12/2025
- [x] Atualizar prompt de avaliação do GennovAIs para gerar textos maiores (3-5 linhas)
- [x] Aumentar tamanho do carimbo em 50%
- [x] Alterar fundo do container do carimbo para cinza

## Ajustes na Hero Section - 28/12/2025
- [x] Aumentar globo em 20%
- [x] Mover globo 3cm para a direita
- [x] Reduzir ritmo das iluminações (animações mais lentas)
- [x] Tornar globo e iluminações 20% mais transparentes
- [x] Aumentar margem direita dos textos e botões em 5cm

## Expansão da Aba LLMs no Admin - 28/12/2025
- [x] Identificar todos os agentes e tarefas do sistema (GennovAIs, Maestro, Editor, etc.)
- [x] Atualizar schema/banco para suportar configuração de todos os agentes
- [x] Criar/atualizar rotas para CRUD de configurações de agentes
- [x] Atualizar interface admin com tabela editável para todos os agentes
- [x] Testar edição de LLMs para cada agente


## Correções Fluxo Passo 2/3 - 28/12/2025
- [x] Separar execução: rodar apenas avaliação ao clicar "Solicitar avaliação"
- [x] Rodar estrutura apenas após clicar "Solicitar estrutura"
- [x] Criar página de espera durante geração de estrutura
- [x] Eliminar todas as mensagens toast do canto superior direito

## Indicador de Progresso Detalhado - 28/12/2025
- [x] Adicionar indicador de progresso detalhado na tela de espera da geração de estrutura

## Ajustes Home e Apoiadores - 28/12/2025
- [x] Aumentar margem direita em mais 2cm nos containers de título, textos e botões
- [x] Tornar fundo das logos de apoiadores transparente
- [x] Incorporar carrossel à tela principal mantendo nomes
- [x] Adicionar MI6, Kroll, Eurasia, Control Risks, Exército, Marinha, Aeronáutica e Polícia Federal

## Ajustes BETA, LLMs e Histórico - 28/12/2025
- [x] Alinhar badge BETA ao container "Sistema Multiagente..."
- [x] Remover provedor Claude e renomear Gemini para Google
- [x] Adicionar funcionalidade de marcar e apagar análises no histórico (com opção Todos)

## Arquivamento e Bug Re-avaliação - 28/12/2025
- [x] Implementar arquivamento de análises ao invés de apagar
- [x] Adicionar página/seção de análises arquivadas com opção de restaurar
- [x] Corrigir bug: prompt de avaliação não roda novamente após adicionar fontes em proposta "a revisar"

## Ajustes Hero e Terminologia - 28/12/2025
- [ ] Retirar palavra "apoiadores"
- [ ] Logos em cores originais com fundo transparente
- [ ] Reduzir velocidade do carrossel pela metade
- [ ] Aumentar margens direitas em 4cm na hero
- [ ] Aumentar globo em 30%
- [ ] Corrigir contadores de propostas/análises
- [ ] Substituir "pesquisa" por "análise" ou "relatório" conforme contexto


## Ajustes Hero e Terminologia - 28/12/2025 - Concluído
- [x] Retirar palavra "apoiadores"
- [x] Logos em cores originais com fundo transparente
- [x] Reduzir velocidade do carrossel pela metade (25s para 50s)
- [x] Aumentar margens direitas em 4cm na hero
- [x] Aumentar globo em 30%
- [x] Corrigir contadores de propostas/análises (conectar ao banco)
- [x] Substituir "pesquisa" por "análise" em toda a aplicação

## Mensagens Criativas do GennovAIs - Concluído
- [x] Criar mensagens criativas e bem-humoradas do GennovAIs durante reasoning (pausas para café, sono, distrações)


## Melhorias Conselheiros e Logomarcas - Concluído
- [x] Atualizar lista de conselheiros ao clicar no botão Conselheiros (refetch adicionado)
- [x] Tornar fundos das logomarcas transparentes (Control Risks, Kroll, FGV, CIA, MI6)
- [x] Melhorar prompt de IA para gerar personalidades mais criativas e humanas para novos conselheiros


## Melhorias de Usuários, Autenticação e Nomenclatura - Concluído
- [x] Permitir deletar usuários (inclusive Administradores), exceto marlos@marlos.com.br
- [x] Simplificar autenticação para apenas email cadastrado (sem Manus/Google)
- [x] Substituir "Plataforma" por "Sistema" em todo o código
- [x] Adicionar provedor Anthropic na lista de LLMs


## Favicon e Limpeza do Painel Admin - Concluído
- [x] Criar favicon do globo com transparência 0 e diâmetro 1cm
- [x] Remover "Usuários" em azul claro quando se seleciona Usuários
- [x] Remover descrição de Conselheiros quando selecionado
- [x] Remover descrição de E-mails quando selecionado
- [x] Remover descrição de LLMs quando selecionado


## Logomarca FGV Branca no Carrossel - Concluído
- [x] Substituir logomarca FGV no carrossel pela versão branca


## Exclusão de Usuários Logados - Concluído
- [x] Adicionar botão de exclusão para usuários que já fizeram login
- [x] Proteger marlos@marlos.com.br de exclusão


## Refatoração de Agentes - Concluído
- [x] Substituir general_novaes por gennovais em todo o código
- [x] Eliminar duplicações na configuração de temperatura
- [x] Remover referências ao maestro


## Automatização de Conselheiros - Em Andamento
- [x] Investigar onde conselheiros estão hardcoded
- [x] Criar endpoint para listar conselheiros do banco (já existia)
- [x] Atualizar galeria da Home para usar dados do banco
- [x] Atualizar página Conheça nossos Conselheiros (Method.tsx)
- [x] Atualizar configuração de LLMs no AdminPanel (já usa banco)


## Perfil Dinâmico de Conselheiro - Em Andamento
- [x] Refatorar AnalystProfile.tsx para usar dados do banco


## Bug: Conselheiro não aparece - Em Andamento
- [x] Investigar por que novo conselheiro não aparece na lista
- [x] Corrigir todas as páginas para exibir conselheiros do banco


## Provedores LLM e Conselheiros Inativos - Em Andamento
- [x] Unificar lista de provedores LLM entre abas Conselheiros e LLMs
- [x] Alterar endpoints para retornar todos os conselheiros (ativos e inativos)
- [x] Adicionar faixa de inatividade nas páginas de exibição

- [x] Remover conselheiros "General NovAIs" (Google e Anthropic), manter coordenador GennovAIs

- [x] Unificar lista de provedores LLM entre abas Conselheiros e LLMs
- [x] Alterar endpoints para retornar todos os conselheiros (ativos e inativos)
- [x] Adicionar faixa de inatividade nas páginas de exibição (galeria, bio, LLMs, Conselheiros, Nossos Conselheiros)

- [x] Criar agente na seção Tarefas da aba LLMs para executar o prompt counselor_autofill

- [x] Remover cards de temperatura general_novaais, general_novaes e maestro

- [x] Criar imagem de globo terrestre com contraste máximo como favicon

- [x] Remover conselheiro "Preenchimento Automático" da seção Conselheiros (manter apenas a tarefa)

- [x] Dobrar o tamanho do favicon

- [x] Corrigir inconsistência entre LLMs exibidos na aba Prompts e os configurados na aba LLMs

- [x] Criar novo favicon usando imagem do globo azul fornecida pelo usuário (diâmetro ~38px para 1cm)

- [x] Eliminar Mackinder e Meira Mattos de todas as tabelas do banco de dados
- [x] Remover campos Provedor e LLM do formulário de Conselheiros (manter apenas em LLMs)

- [x] Aumentar favicon em 20%

- [x] BUG: Remover completamente Mackinder e Meira Mattos (tabelas LLM, galeria, código)

- [x] Limpar TODOS os conselheiros das tabelas do banco

- [x] Remover referências hardcoded a conselheiros (FAQ.tsx, Method.tsx, NewAnalysis.tsx)

- [x] Eliminar referências a Coordenador e Revisor - usar apenas GennovAIs e Max Weber

- [x] Definir personalidades padrão para GennovAIs e Max Weber no banco de dados

- [x] Dobrar altura do container de quota de análises em todas as páginas

- [x] Investigar e eliminar conselheiros padrão que ainda aparecem no sistema
- [ ] Corrigir botão adicionar conselheiro no formulário

## Limpeza de Dados - Análises e Custos
- [x] Apagar todas as análises do banco de dados
- [x] Zerar contadores de custos (llm_usage_costs)
- [x] Manter usuários cadastrados intactos

## Tabela de Preços de LLMs
- [ ] Criar tabela llm_pricing no schema (provedor, modelo, preço input, preço output)
- [ ] Criar rotas CRUD para gerenciar preços de LLMs
- [ ] Criar interface admin para gerenciar preços
- [ ] Vincular tabela de LLMs com tabela de preços (validação)
- [ ] Migrar preços hardcoded para o banco de dados
- [ ] Atualizar multiAgents.ts para usar preços do banco

## Atualização Automática de Preços LLM
- [x] Criar agente-tarefa price_updater no banco de dados
- [x] Criar prompt de sistema para busca de preços via LLM
- [x] Criar rota de atualização de preços via LLM
- [x] Adicionar botão de atualização na interface admin
- [x] Garantir restrição de acesso apenas para administradores (já usa adminProcedure)

## Vinculação LLMs com Tabela de Preços
- [x] Atualizar interface de LLMs para usar dropdown de modelos da tabela de preços
- [x] Adicionar validação no backend para garantir modelo válido

## Aprimoramento da Atualização de Preços LLM
- [x] Adicionar coluna updatedAt na tabela llm_pricing
- [x] Atualizar prompt para buscar todos os modelos disponíveis com API síncrona
- [x] Atualizar rota para inserir novos modelos encontrados
- [x] Ordenar tabela por provedor e preço decrescente
- [x] Exibir data de atualização na interface

## Exportação de Tabela de Preços
- [x] Instalar biblioteca xlsx para exportação
- [x] Adicionar botão de exportação XLSX na interface

## Correção do Formulário de Preços LLM
- [x] Corrigir botão de salvar novo preço
- [x] Permitir edição do provedor no formulário

## Correção do Botão Atualizar via IA - Concluído
- [x] Diagnosticar por que o botão não está atualizando os preços (provider 'google' não reconhecido)
- [x] Corrigir função de atualização de preços via IA (adicionado suporte a provider 'google')
- [x] Incluir data de atualização na exportação XLSX (já estava implementado)
- [x] Formulário já permite adicionar novo provedor (campo de texto livre com sugestões)

## Ajuste de Layout da Landing Page - Concluído
- [x] Reorganizar botões: Apresente sua proposta, Como funciona, Recursos, Conselheiros, Coordenação, Preços
- [x] Reduzir espaçamento para aproximar logos dos botões (py-8 para py-3)

## Ajuste do Menu do Painel de Configurações - Concluído
- [x] Inverter posições das opções Prompts e LLMs no menu

## Ajustes de Layout da Landing Page v2 - Concluído
- [x] Mover botão Preços para o lado direito de Coordenação
- [x] Diminuir tamanho dos botões (size sm, px e text menores)
- [x] Subir as logos (py-3 para py-1)

## Ajustes do Globo na Landing Page - Concluído
- [x] Destacar mais os nós acendendo (aumentar brilho, opacidade e box-shadow)
- [x] Reduzir tamanho do globo em 10%

## Sincronização Tabela de Preços e Dropdown de LLMs - Concluído
- [x] Atualizar automaticamente dropdown de LLMs quando tabela de preços for modificada (invalidateLlmQueries)

## Ajustes Finos de Layout v3 - Concluído
- [x] Mover globo 3cm para baixo (de -3rem para 0rem)
- [x] Aumentar velocidade de rotação do globo em 10% (de 852s para 767s)
- [x] Subir logos 1cm para cima (-mt-4)

## Correção da Atualização de Preços via IA - Concluído
- [x] Investigar por que alguns modelos não estão sendo atualizados (nomes diferentes)
- [x] Corrigir função de atualização para buscar pelo nome técnico exato

## Reorganização de Botões e API de Preços - Concluído
- [x] Mover botão "Apresente sua proposta" para direita de "Preços"
- [x] Realinhar "Como funciona" à margem esquerda
- [x] Corrigir API de preços para buscar pelo nome técnico exato (modelName)
- [x] Melhorar prompt para enviar lista de modelos cadastrados ao LLM

## Padronização de Nomes Técnicos de LLMs
- [ ] Consultar modelos cadastrados no banco de dados
- [ ] Pesquisar nomes técnicos oficiais das APIs (Google, Anthropic, OpenAI, DeepSeek)
- [ ] Atualizar tabela de preços com nomes corretos
- [ ] Marcar "not found" na data para modelos não encontrados


## Padronização de Nomes Técnicos dos Modelos LLM - 28/12/2025 - Concluído
- [x] Consultar modelos cadastrados na tabela llm_pricing (30 modelos)
- [x] Pesquisar nomes técnicos oficiais das APIs (Google, Anthropic, OpenAI, DeepSeek)
- [x] Criar relatório de comparação (model_comparison_report.md)
- [x] Aplicar correções nos nomes incorretos

### Correções Identificadas:
- [x] claude-opus-4-20250514 → displayName corrigido para 'Claude Opus 4.1'
- [x] gemini-2.0-flash-exp → gemini-2.0-flash (corrigido)
- [x] deepseek-coder → Desativado (modelo descontinuado)
- [x] claude-2.0 e claude-2.1 → Desativados (modelos descontinuados)
- [ ] groq-1 → Pendente verificação (Groq é outro provedor, não xAI)

### Modelos a Adicionar:
- [x] deepseek-reasoner (DeepSeek V3.2 Thinking Mode) - Adicionado
- [x] gemini-2.5-flash (Gemini 2.5 Flash) - Adicionado
- [ ] gemini-2.0-flash-lite (Gemini 2.0 Flash-Lite) - Pendente
- [ ] gpt-4o-mini (GPT-4o mini) - Pendente
- [ ] o3-mini (OpenAI reasoning model) - Pendente
- [ ] o4-mini (OpenAI reasoning model) - Pendente

### Modelos Claude Adicionados:
- [x] claude-sonnet-4-5-20250929 (Claude Sonnet 4.5) - Adicionado
- [x] claude-haiku-4-5-20251001 (Claude Haiku 4.5) - Adicionado
- [x] claude-opus-4-20241129 (Claude Opus 4) - Adicionado


## Ajuste de Layout - 28/12/2025
- [x] Reduzir tamanho do título principal para caber em uma linha


## Configuração LLM - Preenchimento Automático - 28/12/2025 - Concluído
- [x] Investigar estrutura atual da configuração LLM dos conselheiros
- [x] Adicionar configuração counselor_autofill na tabela counselor_llm_config
- [x] Adicionar counselor_autofill à lista DEFAULT_COUNSELORS em db.ts
- [x] Vincular preenchimento automático ao modelo gemini-2.5-pro


## Bug - Gerar com IA não busca todos os dados - 28/12/2025
- [ ] Investigar função generateAutoFill no backend
- [ ] Verificar mapeamento de campos no frontend
- [ ] Corrigir geração de dados incompletos
- [x] Remover carrossel de logos da página inicial
- [x] Ajustar espaçamento da hero section após remoção do carrossel
- [x] Permitir reordenação dos agentes (mover para cima/baixo) na aba LLMs do painel admin
- [x] Alinhar "propostas submetidas" à margem esquerda
- [x] Mover botão "Apresente sua proposta" para abaixo de "Como funciona", alinhado à esquerda
- [x] Mover globo 3cm para baixo
- [x] Verificar e ajustar responsividade da hero section para celulares

## Bug: Personalidade LLM se perde ao acessar perfil - Em investigação
- [x] Investigar por que a personalidade LLM gerada pela IA se perde ao acessar perfil do conselheiro pela segunda vez

- [x] Mover agente Atualizador de Preços de Conselheiros para Tarefas na aba LLMs
- [x] Deslocar globo 3cm para baixo na hero section
- [x] Ajustar opacidade do globo de 20% para 15% na hero section
- [x] Reverter deslocamento do globo (voltar translateY de 6rem para 3rem)
- [ ] Corrigir bug: ao alterar foto do conselheiro, perde-se os outros dados - implementar sincronização automática em todas as abas
- [x] Corrigir sincronização de dados ao alterar foto no cadastro de conselheiros
- [x] Corrigir sincronização dos campos da aba Personalidade (Personalidade para LLM, Estilo de Escrita, Abordagem da Análise)

## Regenerar Dados e Indicadores Visuais - 29/12/2025
- [ ] Regenerar dados dos conselheiros via IA (Estilo de Escrita, Abordagem de Análise)
- [ ] Adicionar indicadores visuais de campos preenchidos/vazios na lista de conselheiros

## Investigação e Correção da Perda de Dados dos Conselheiros - 29/12/2025
- [ ] Investigar causa raiz da perda de dados dos conselheiros
- [ ] Corrigir problema estrutural que causa perda de dados
- [x] Regenerar dados dos conselheiros via IA (Estilo de Escrita, Abordagem de Análise)
- [x] Adicionar indicadores visuais de campos preenchidos/vazios na lista de conselheiros


## Unificação do Passo 2 - 29/12/2025
- [x] Unificar as duas telas do Passo 2 em uma única tela (uma embaixo da outra)
- [x] Remover o fundo cinza sob o carimbo

## Unificação Completa do Passo 2 - 29/12/2025
- [x] Unificar as duas páginas do Passo 2 em uma única tela
- [x] Mostrar evolução da avaliação, parecer do GennovAIs e carimbo em sequência
- [x] Eliminar a segunda página separada do Passo 2

## Animações de Transição Passo 2 - 29/12/2025
- [x] Adicionar animação de transição suave entre as seções do Passo 2
- [x] Implementar fade-in e slide-up nas seções de parecer e carimbo
- [x] Adicionar delays escalonados para efeito sequencial

## Correção Flash Tela 2 Passo 3 - 29/12/2025
- [x] Corrigir flash da tela de fallback no Passo 3
- [x] Implementar tempo mínimo de loading para transição suave
- [x] Garantir que a tela de progresso seja sempre exibida durante geração

## Simplificação do Container Avaliação da Estrutura (Passo 3)
- [x] Remover título "Estrutura Proposta pelo GennovAIs" (manter texto)
- [x] Remover título "Parecer do GennovAIs" e seu texto
- [ ] Remover o carimbo visual

## Bug Crítico - Botão Passo 1
- [ ] Botão 'Enviar proposta à avaliação do GennovAIs' não funciona no Passo 1

## Correção de Parsing JSON - evaluateProposal
- [ ] Corrigir parsing de JSON na função evaluateProposal
- [ ] Melhorar prompt do GennovAIs para garantir resposta JSON
- [ ] Adicionar fallback robusto para parsing


## Correção de Parsing JSON - evaluateProposal - 29/12/2025 - Concluído
- [x] Corrigir parsing de JSON na função evaluateProposalOnly
- [x] Melhorar prompt do GennovAIs para garantir resposta JSON pura
- [x] Adicionar fallback robusto com múltiplas estratégias de parsing
- [x] Adicionar logs detalhados para debug
- [x] Testar correção com sucesso (JSON parseado corretamente)


## Bug: Arquivos anexados não considerados na avaliação - 29/12/2025 - Corrigido
- [x] Investigar fluxo de envio de fontes no frontend (NewAnalysis.tsx)
- [x] Verificar se fontes estão sendo passadas para evaluateProposal no backend
- [x] Incluir conteúdo das fontes no prompt de avaliação do GennovAIs
- [x] Testar com arquivos anexados


## Container de Debug no Passo 6 - 29/12/2025
- [ ] Analisar estrutura atual do Passo 6 no frontend (NewAnalysis.tsx)
- [ ] Modificar backend para emitir eventos SSE detalhados com logs de debug
- [ ] Criar componente DebugContainer para exibir funções, prompts, saídas e tempos
- [ ] Integrar container no Passo 6 da interface
- [ ] Testar visualização em tempo real


## Container de Debug e Correções Críticas - 29/12/2025 - Concluído
- [x] Criar container de Debug Console no Passo 6 para visualizar logs em tempo real
- [x] Adicionar estados para armazenar logs de debug no frontend
- [x] Modificar handler SSE para capturar eventos detalhados
- [x] Adicionar informações de debug nos eventos SSE do backend
- [x] Corrigir variável selectedAnalysts para selectedCounselors (conselheiros não eram passados)
- [x] Corrigir exibição de "0 selecionados" no resumo do Passo 5
- [x] Aumentar timeout do LLM de 60s para 180s (evitar timeout do Claude)
- [x] Adicionar savedToHistory: true quando análise é concluída
- [x] Análises concluídas agora aparecem corretamente no histórico
- [x] Testar fluxo completo do Passo 1 ao Passo 7
- [ ] Padronizar interface de acompanhamento de etapas nos passos 2, 3 e 6 (adotar modelo do passo 3)


## Padronização da Interface de Etapas - 29/12/2025 - Concluído
- [x] Padronizar interface de acompanhamento de etapas nos passos 2, 3 e 6 (adotar modelo do passo 3)
- [x] Atualizar passo 2 (Avaliação da Proposta) com ícones circulares maiores, status "Concluído"/"Em andamento..." e barra de progresso inferior
- [x] Atualizar passo 6 (Sessão do Conselho) com modelo padronizado no Log do Conselho
- [x] Manter log do conselho e painel de debug no passo 6


## Melhorias na Hero e Configurações - 29/12/2025
- [x] Criar botão "Seu dashboard" na hero, à esquerda de "Apresente sua proposta de análise"
- [x] Mover botão "Configurações do sistema" para a hero (renomear para "Configurações")
- [x] Exibir botão de Configurações apenas para Administradores
- [x] Criar seção "Parâmetros" nas configurações com:
  - [x] Velocidade de giro do globo na home
  - [x] Opacidade do globo em %
  - [x] Opção para zerar numero de propostas submetidas
  - [x] Opção para zerar numero de propostas concluídas
  - [x] Tamanho do carimbo
  - [x] Ativar/desativar som do carimbo


## Correções de Parâmetros - 29/12/2025 - Concluído
- [x] Remover botão "Configurações do sistema" do menu lateral do Dashboard
- [x] Vincular parâmetro de velocidade do globo ao código real
- [x] Vincular parâmetro de opacidade do globo ao código real
- [x] Vincular parâmetro de tamanho do carimbo ao código real
- [x] Vincular parâmetro de som do carimbo ao código real
- [x] Testar alterações em tempo real


## Novos Parâmetros do Globo e Correções - 29/12/2025
- [ ] Criar parâmetro de intensidade/brilho do globo no banco de dados
- [ ] Criar parâmetro de tamanho do globo no banco de dados
- [x] Atualizar interface de parâmetros no AdminPanel com novos campos
- [ ] Vincular parâmetro de intensidade ao globo na Home
- [ ] Vincular parâmetro de tamanho ao globo na Home
- [ ] Sincronizar animações das redes neurais (nós e linhas) com parâmetros do globo
- [ ] Corrigir botões de reset de propostas submetidas
- [ ] Corrigir botões de reset de análises concluídas
- [x] Testar todas as alterações


## Novos Parâmetros do Globo - 29/12/2025 - Concluído
- [x] Criar parâmetro de intensidade/brilho do globo
- [x] Criar parâmetro de tamanho do globo
- [x] Vincular animações das redes neurais aos parâmetros do globo
- [x] Corrigir botões de reset dos contadores de propostas
- [x] Testar todas as alterações

## Novos Parâmetros de Configuração - 29/12/2025
- [x] Criar parâmetro de coordenada X do centro do globo
- [x] Criar parâmetro de coordenada Y do centro do globo
- [x] Criar parâmetro de altura da logo FGV
- [x] Criar parâmetro de tamanho da fonte do título principal
- [x] Atualizar interface de parâmetros no AdminPanel
- [x] Vincular parâmetros ao código da Home
- [x] Ajustar demais parâmetros quando coordenadas forem alteradas
- [x] Testar todas as alterações

## Melhorias Solicitadas - 29/12/2025 (Parte 2)
- [x] Criar parâmetros de coordenadas X e Y da logo DINT
- [x] Vincular parâmetros de coordenadas da logo ao código da Home
- [x] Atualizar interface de parâmetros no AdminPanel para logo
- [x] Implementar funcionalidade de deletar registros no histórico de análises
- [x] Adicionar rota de deleção no backend
- [x] Adicionar botão de deletar na interface do histórico
- [x] Testar todas as alterações

## Seleção Múltipla para Deleção - 29/12/2025
- [x] Adicionar rota de deleção múltipla no backend (admin)
- [x] Adicionar checkboxes na tabela de histórico
- [x] Implementar seleção de todos os itens
- [x] Adicionar botão de deletar selecionados
- [x] Implementar confirmação antes de deletar múltiplos
- [x] Testar funcionalidade

## Bug Fix - Indicadores de Conselheiros - 29/12/2025
- [ ] Investigar lógica dos indicadores de status dos conselheiros
- [ ] Corrigir verificação de itens cadastrados (amarelo vs verde)
- [ ] Testar correções

## Sistema de Emails - 29/12/2025
- [x] Implementar edição de textos de emails no painel de configurações
- [x] Configurar envio de todos os emails a partir de marlos@marlos.com.br
- [x] Documentar requisitos para envio autônomo de emails


## Ajustes no Painel de Conselheiros - 29/12/2025
- [x] Inverter posição dos campos no formulário de novo conselheiro (Nome primeiro com botão IA, ID depois sem asterisco)
- [x] Adicionar indicador visual (cor amarelo/verde) para conexão LLM na lista de conselheiros
- [x] Corrigir exibição do texto de indisponibilidade no painel de configuração/conselheiros

## Alterações de Texto na Home - 29/12/2025
- [x] Alterar "Os sete passos" para "Como funciona" no botão da hero
- [x] Alterar "Apresente sua proposta de análise" para "Apresente uma proposta de análise"
- [x] Alterar título da seção "Os sete passos" para "Como funciona"
- [x] Alterar subtítulo para "Sete passos para obter uma análise geopolítica profissional"
- [x] Alterar "Nossos recursos" para "Recursos"
- [x] Remover "Acesse e" do texto do footer

## Correções e Carrossel - 29/12/2025
- [x] Corrigir indicador de conexão LLM (verde/amarelo) para verificar corretamente se há LLM configurado
- [x] Implementar carrossel de conselheiros na hero abaixo dos botões de ação

## Carrossel de Conselheiros na Hero - 29/12/2025
- [x] Carrossel: exibição de um conselheiro por vez
- [x] Carrossel: posicionar foto abaixo do botão "Seu dashboard"
- [x] Carrossel: nome curto completo sem cortes
- [x] Carrossel: efeito de transição (entrando/saindo)
- [x] Parâmetros: tamanho da imagem do carrossel
- [x] Parâmetros: velocidade de reprodução do carrossel
- [x] Vincular parâmetros ao carrossel na hero

## Setas de Navegação do Carrossel - 29/12/2025
- [x] Adicionar setas de navegação laterais ao carrossel de conselheiros

## Pausa no Hover do Carrossel - 29/12/2025
- [x] Pausar transição automática quando mouse estiver sobre a imagem do conselheiro

## Correção de Erro de API - 30/12/2025
- [ ] Corrigir erro "Unexpected token '<'" - API retornando HTML em vez de JSON

## Ajustes na Hero - 30/12/2025
- [x] Reescrever texto principal em dois parágrafos curtos e objetivos
- [x] Carrossel: posicionamento mais discreto (menos contraste, menor altura)
- [x] Carrossel: velocidade de 7 segundos por transição
- [x] Carrossel: inverter sentido do movimento (entrar pela esquerda, sair pela direita)
- [x] Carrossel: manter pausa no hover e controles discretos

## Ajustes de Posicionamento Hero - 30/12/2025
- [x] Mover elementos à esquerda 2cm para cima (exceto globo)
- [x] Remover cargo/teoria abaixo do nome dos conselheiros no carrossel


## Ajustes Hero e Carrossel - 30/12/2025 (v2)
- [x] Mover elementos à esquerda mais 1cm para cima
- [x] Reduzir carousel_image_size de 120px para 80px
- [x] Inverter sentido de movimento do carrossel
- [x] Adicionar tooltip com teoria/especialidade no hover do conselheiro


## Ajustes Hero e Carrossel - 30/12/2025 (v3)
- [x] Subir conteúdo mais 1cm (exceto globo)
- [x] Inverter sentido do carrossel: entrar pela esquerda, sair pela direita


## Ajustes Hero e Carrossel - 30/12/2025 (v4)
- [x] Reduzir espaçamentos em 10% nos elementos à esquerda
- [x] Implementar animação circular no carrossel (sai direita, volta por trás, entra esquerda)


## Ajustes Hero - 30/12/2025 (v5)
- [x] Mover elementos da esquerda 1cm para baixo (mantendo globo inalterado)


## Ajuste de Fotos dos Conselheiros - 30/12/2025 (v6)
- [x] Ajustar enquadramento da foto de Meira Mattos na página de Conselheiros
- [x] Ajustar enquadramento da foto de Kissinger na página de Conselheiros
- [x] Ajustar enquadramento da foto de Golbery na página de Conselheiros
- [x] Ajustar enquadramento das fotos no carrossel

## Parâmetros de Posição do Bloco Esquerdo - 30/12/2025
- [x] Adicionar parâmetro hero_left_offset_x para deslocamento horizontal do bloco esquerdo
- [x] Adicionar parâmetro hero_left_offset_y para deslocamento vertical do bloco esquerdo
- [x] Implementar controles no painel de configurações
- [x] Vincular parâmetros ao código da Home


## Refatoração Passo 6 - Sessão do Conselho - 30/12/2025
- [x] Passar estrutura aprovada do Passo 3 para executeMultiAgent
- [x] Corrigir trava SSE que não atualiza executionSteps (flush adicionado)
- [x] Simplificar interface: título, participantes, datas, debate, progresso
- [x] Garantir Max Weber respeite estrutura aprovada (via parâmetro structure)
- [x] Habilitar avanço para Passo 7 apenas após complete (generatedContent check)
- [x] Exibir aviso claro quando debate for concluído


## Correção SSE Sessão do Conselho - 31/12/2025
- [x] Investigar trava na fase 'GennovAIs convoca Conselheiros'
- [x] Analisar endpoint SSE /api/sse/analysis/[id]/progress
- [x] Analisar progressEmitter e emissão de eventos
- [x] Adicionar logs de debug detalhados no servidor (sse.ts, analysisProgress.ts, multiAgents.ts, routers.ts)
- [x] Garantir emissão de eventos progress e complete (já implementado corretamente)
- [x] Garantir atualização do banco ao final da consolidação (já implementado corretamente)
- [x] Testar fluxo completo

## Metadados da Sessão no Relatório Final - 31/12/2025
- [x] Adicionar bloco de metadados da sessão no relatório final (backend)
- [x] Atualizar exportação PDF com metadados da sessão
- [x] Atualizar exportação DOCX com metadados da sessão
- [x] Atualizar exportação HTML com metadados da sessão

## Correção de LLMs Dinâmicos - 31/12/2025
- [x] Corrigir Maestro (GennovAIs) para buscar LLM do Painel de Configuração
- [x] Corrigir Editor (Max Weber) para buscar LLM do Painel de Configuração
- [x] Corrigir Conselheiros para buscar LLM do Painel de Configuração
- [x] Garantir que todos os agentes usem configuração dinâmica antes de cada análise

## Melhorias de Interface e Relatórios - 31/12/2025
- [x] Mostrar indicador visual de qual LLM cada conselheiro está usando durante a análise
- [x] Adicionar logo FGV no cabeçalho dos relatórios PDF
- [x] Adicionar logo FGV no cabeçalho dos relatórios DOCX
- [x] Adicionar logo FGV no cabeçalho dos relatórios HTML
- [x] Gerar código de identificação único para cada sessão (ex: FGV-GEO-2025-0042)
- [x] Incluir código de identificação nos relatórios PDF/DOCX/HTML

## QR Code e Verificação Pública - 31/12/2025
- [x] Aplicar migração do banco de dados para coluna sessionCode
- [x] Criar página de verificação pública por código de sessão
- [x] Implementar QR Code nos relatórios PDF com link para verificação
- [x] Implementar QR Code nos relatórios DOCX com link para verificação
- [x] Testar fluxo completo de verificação

## QR Code com Logo FGV Centralizada - 31/12/2025
- [x] Analisar código atual de geração de QR Code (pdfGenerator.ts, docxGenerator.ts)
- [x] Implementar QR Code com logo FGV no centro (qrCodeWithLogo.ts)
- [x] Atualizar geração de PDF com novo QR Code (reportGenerator.ts)
- [x] Atualizar geração de DOCX com novo QR Code (docxGenerator.ts)
- [x] Testar relatórios com novo QR Code (7 testes passando)

## Substituição Metodologia por Método - 31/12/2025
- [x] Buscar todas as ocorrências de "metodologia" no código (8 ocorrências em 5 arquivos)
- [x] Substituir por "método" ajustando complementos nominais
- [x] Verificar alterações (nenhuma ocorrência restante)


## Reestruturação do Passo 6 - Sessão do Conselho - 31/12/2025
- [ ] Analisar código atual do backend (multiAgents.ts) e identificar pontos de travamento
- [ ] Decompor runMultiAgentAnalysis em 5 etapas explícitas:
  - [ ] Etapa 1: Convocação da sessão pelo GennovAIs
  - [ ] Etapa 2: Elaboração de parecer(es) pelos Conselheiros
  - [ ] Etapa 3: Avaliação dos pareceres pelo GennovAIs
  - [ ] Etapa 4: Consolidação pelo Max Weber (relatório final)
  - [ ] Etapa 5: Salvamento do relatório no banco e disparo do evento complete
- [ ] Implementar status tracking (pending, running, completed, error) por etapa
- [ ] Instrumentar progressEmitter com eventos detalhados por etapa
- [ ] Garantir emissão de evento complete após consolidação
- [ ] Adicionar logs de servidor para cada emissão SSE
- [ ] Implementar modo DEBUG_STEP_BY_STEP com pausas entre etapas
- [ ] Criar endpoint analysis.resumeFromStep para modo debug
- [ ] Atualizar UI do Passo 6 com 5 etapas visíveis
- [ ] Adicionar painel de debug com eventos SSE recebidos
- [ ] Implementar tratamento robusto de erros em cada etapa
- [ ] Garantir isExecuting=false em caso de erro
- [ ] Testar fluxo completo e documentar pontos de travamento


## Reestruturação do Passo 6 (Sessão do Conselho) - 31/12/2025 - Concluído
- [x] Criar módulo councilSession.ts com 5 etapas explícitas (Convocação, Pareceres, Avaliação, Consolidação, Salvamento)
- [x] Implementar status tracking por etapa (pending, running, completed, error, paused)
- [x] Instrumentar progressEmitter com eventos de etapa (stage_start, stage_complete, stage_error)
- [x] Atualizar endpoint SSE para emitir eventos de etapa
- [x] Adicionar modo debug opcional (DEBUG_COUNCIL_STEP_BY_STEP) com pausas entre etapas
- [x] Criar mutations resumeFromStep, getSessionStatus, setDebugMode no routers.ts
- [x] Criar componente CouncilStagesPanel para visualização das 5 etapas na UI
- [x] Atualizar NewAnalysis.tsx com painel de etapas e debug SSE
- [x] Implementar tratamento robusto de erros em cada etapa com fallback
- [x] Garantir emissão de evento complete ou error em todos os cenários
- [x] Escrever testes para councilSession (22 testes passando)


## Reorganização do Passo 6 - Reunião do Conselho - 31/12/2025
- [x] Bloco 6 - Consolidação do Relatório (Max Weber + MaxIA consolidam pareceres)
- [x] Bloco 7 - Leitura do Relatório Final (GennovAIs apresenta ao plenário)
- [x] Bloco 8 - Comentários dos Conselheiros ao Texto Final
- [x] Bloco 9 - Revisões Finais de Max Weber e GennovAIs
- [x] Bloco 10 - Relatório Aprovado e Exibição (botão "Exibir relatório final" + downloads)
- [x] Bloco 11 - Encerramento da Sessão
- [x] Interface com título do bloco, descrição objetiva e bastidores criativos
- [x] Logs de depuração estruturados no backend e painel de debug na UI
- [x] Transições de estado (sessionPhase) e eventos SSE para cada bloco

## Ajustes de Carimbos e Parâmetros - 31/12/2025
- [x] Remover fundo quadriculado do carimbo verde (aprovada.png)
- [x] Remover fundo quadriculado do carimbo amarelo (revisar.png)
- [x] Remover fundo quadriculado do carimbo vermelho (rejeitada.png)
- [x] Mover conteúdo do exemplo de proposta para área de Parâmetros no painel admin

## Correções de Carimbos e Som - 31/12/2025
- [x] Remover fundo quadriculado do carimbo verde (aprovada.png) - tornar transparente
- [x] Remover fundo quadriculado do carimbo amarelo (revisar.png) - tornar transparente
- [x] Remover fundo quadriculado do carimbo vermelho (rejeitada.png) - tornar transparente
- [x] Ajustar timing do som para tocar no momento em que o carimbo é apresentado (não antes)


- [x] Ajustar tamanho dos textos da hero section para mobile (título, subtítulo, descrição)
- [x] Ajustar tamanho e espaçamento dos botões da hero para mobile
- [x] Melhorar legibilidade geral da hero em dispositivos móveis

## Substituição de Imagens do Kissinger - 31/12/2025
- [x] Substituir imagem preto e branco de Kissinger (galeria da home)
- [x] Substituir imagem colorida de Kissinger (página de perfil)

## Substituição de Imagens do Golbery - 31/12/2025
- [x] Substituir imagem preto e branco de Golbery (galeria da home) - sem faixa branca
- [x] Substituir imagem colorida de Golbery (página de perfil)

## Substituição de Imagens do Meira Mattos - 31/12/2025
- [x] Substituir imagem preto e branco de Meira Mattos (galeria da home) - sem faixa branca
- [x] Substituir imagem colorida de Meira Mattos (página de perfil)

## Correção de Fotos - Traço Branco e Padronização Hitler - 31/12/2025
- [x] Remover traço branco superior da foto P&B de Meira Mattos
- [x] Remover traço branco superior da foto P&B de Kissinger
- [x] Adaptar foto de Hitler para seguir padrão das demais fotos

- [x] Substituir foto do Marlos Correia Lima na página de Coordenação
- [x] Adicionar fotos do Carlos Ivan ao perfil do conselheiro (P&B para galeria, colorida para bio)
- [x] Substituir foto do Marlos Correia Lima na página de Coordenação


## Reorganização Completa do Passo 6 - Reunião do Conselho - 31/12/2025
- [x] Criar tipos TypeScript para as 11 fases da sessão (sessionPhase)
- [x] Implementar constantes com títulos e descrições de cada bloco
- [x] Criar gerador de mensagens de bastidores baseado nas personalidades dos conselheiros
- [ ] Atualizar backend para emitir eventos SSE por fase
- [ ] Redesenhar UI do Passo 6 com exibição sequencial de blocos
- [ ] Implementar área separada de "Bastidores da Sessão do Conselho"
- [ ] Adicionar botão "Exibir relatório final" (habilitado apenas quando completed)
- [ ] Implementar painel de debug com logs de transição de fases
- [ ] Garantir que mensagens de bastidores não poluam prompts de LLM
- [ ] Testar fluxo completo das 11 fases

### Blocos da Sessão:
- [ ] Bloco 1 - Convocação da Sessão (GennovAIs convoca formalmente)
- [ ] Bloco 2 - Início dos Trabalhos (Conselheiros leem pareceres)
- [ ] Bloco 3 - Pausa para Café (intervalo estratégico)
- [ ] Bloco 4 - Debates (réplicas, tréplicas, clima esquenta)
- [ ] Bloco 5 - Pausa dos Debates (preparação para consolidação)
- [ ] Bloco 6 - Consolidação do Relatório (Max Weber + MaxIA)
- [ ] Bloco 7 - Leitura do Relatório Final (GennovAIs apresenta)
- [ ] Bloco 8 - Comentários dos Conselheiros ao Texto Final
- [ ] Bloco 9 - Revisões Finais (Max Weber ajusta, GennovAIs valida)
- [ ] Bloco 10 - Relatório Aprovado e Exibição (botão download)
- [ ] Bloco 11 - Encerramento da Sessão (despedida dos conselheiros)

## Reorganização do Passo 6 - Reunião do Conselho (11 blocos narrativos) - 31/12/2025

- [ ] Implementar estrutura sessionPhase com 11 valores: convocation, readings, coffee_break, debate, debate_pause, consolidation, report_reading, report_comments, report_revision, report_approved, session_end
- [ ] Cada bloco deve exibir: Título do bloco, O que está acontecendo (descrição objetiva), Bastidores (mensagens criativas)
- [ ] Bloco 1 (convocation): Convocação da Sessão - GennovAIs convoca formalmente os Conselheiros
- [ ] Bloco 2 (readings): Início dos Trabalhos - Cada Conselheiro lê sua análise em voz alta
- [ ] Bloco 3 (coffee_break): Pausa para Café - 10 minutos de intervalo
- [ ] Bloco 4 (debate): Debates - Conselheiros discutem pontos fortes e fracos
- [ ] Bloco 5 (debate_pause): Pausa dos Debates - Preparação para consolidação
- [ ] Bloco 6 (consolidation): Consolidação do Relatório - Max Weber consolida com apoio da MaxIA
- [ ] Bloco 7 (report_reading): Leitura do Relatório Final - GennovAIs apresenta o relatório
- [ ] Bloco 8 (report_comments): Comentários dos Conselheiros - Ajustes e refinamentos
- [ ] Bloco 9 (report_revision): Revisão Final - Max Weber faz ajustes finais
- [ ] Bloco 10 (report_approved): Relatório Aprovado - Botão "Exibir relatório final" habilitado
- [ ] Bloco 11 (session_end): Encerramento da Sessão - GennovAIs encerra oficialmente
- [ ] Apresentar um bloco de cada vez (usuário não vê blocos seguintes antecipadamente)
- [ ] Mensagens de bastidores alinhadas às personalidades dos conselheiros
- [ ] Logs de depuração para cada mudança de sessionPhase
- [ ] Manter intactos os prompts de conteúdo (counselor_task, novaes_proposal_evaluator, editor_consolidator)


## Reorganização do Passo 6 (11 Blocos Narrativos) - 31/12/2025 - Em Andamento
- [x] Criar estrutura de 11 blocos narrativos em shared/councilBlocks.ts
- [x] Implementar serviço de blocos no backend (server/services/councilBlocks.ts)
- [x] Atualizar CouncilBlocksPanel para exibir um bloco de cada vez
- [x] Integrar CouncilBlocksPanel no NewAnalysis.tsx
- [x] Adicionar processamento de eventos de bloco via SSE
- [x] Sincronizar timer de elapsed time com o painel de blocos
- [ ] Testar fluxo completo com análise real


## Detalhamento dos Blocos 1-4 do Passo 6 - 31/12/2025
- [x] Bloco 1 (convocation): Adicionar convocação nominal de todos os conselheiros selecionados
- [x] Bloco 1 (convocation): Adicionar bastidores de conselheiros "chegando" à sala
- [x] Bloco 2 (readings): Implementar leitura das análises pelos conselheiros
- [x] Bloco 2 (readings): Adicionar bastidores de reações (anotações, concordância, franzir de testa)
- [x] Bloco 3 (coffee_break): Implementar pausa de 10 minutos com mensagem do GennovAIs
- [x] Bloco 3 (coffee_break): Adicionar bastidores de emoções e expectativas
- [x] Bloco 4 (debate): Implementar abertura da palavra pelo GennovAIs
- [x] Bloco 4 (debate): Adicionar bastidores de tensões e convergências
- [x] Bloco 4 (debate): Destacar Max Weber anotando para a MaxIA
- [x] Adicionar log de depuração para cada mudança de sessionPhase

## Blocos 9-11 da Sessão do Conselho (Passo 6) - 31/12/2025
- [x] Atualizar councilBlocks.ts com conteúdo detalhado dos blocos 9, 10 e 11
- [x] Implementar botão "Exibir relatório final" no bloco 10 (report_approved)
- [x] Adicionar visualização do generatedContent e botões de download (PDF, DOCX)
- [x] Implementar logs de depuração estruturados para sessionPhase
- [x] Adicionar painel de debug com transições de sessionPhase e erros
- [x] Testar fluxo completo do Passo 6


## Correção do Travamento SSE no Passo 6 - 31/12/2025
- [x] Analisar código de emissão de eventos SSE em runMultiAgentAnalysis
- [x] Adicionar logs de servidor antes/depois de cada emissão de progress
- [x] Implementar try/catch amplo em runMultiAgentAnalysis
- [x] Garantir emissão de evento complete ou error ao final
- [x] Atualizar frontend para tratar erros e atualizar isExecuting
- [x] Testar fluxo completo e mostrar diff


## Remoção do SSE do Passo 6 - Fluxo Simplificado - 31/12/2025
### Backend
- [x] Remover progressEmitter e emissões de eventos SSE (progress, complete, error) do runMultiAgentAnalysis
- [x] Remover endpoint /api/sse/analysis/[analysisId]/progress
- [x] Remover funções auxiliares de SSE do Passo 6 (analysisProgress.ts, councilBlocks.ts relacionados a SSE)
- [x] Garantir que runMultiAgentAnalysis sempre atualize status (completed/failed), generatedContent e completedAt

### Frontend
- [x] Remover imports, estados e hooks de SSE (EventSource, listeners de progress, session_phase, etc.)
- [x] Remover componentes de UI de tempo real (barras de progresso SSE, logs de sessão ao vivo, CouncilBlocksPanel, CouncilStagesPanel)
- [x] Implementar nova UX com tela estática "Sessão em processamento"
- [x] Implementar polling simples (10-20s) para verificar status da análise
- [x] Adicionar botão "Ver relatório final" quando status = completed
- [x] Adicionar mensagem de erro amigável quando status = failed

### Limpeza
- [x] Remover código não utilizado relacionado a SSE
- [x] Testar fluxo completo
- [x] Gerar diff das alterações


## Limpeza Final do Código SSE - 31/12/2025
- [x] Verificar uso de analysisProgress.ts (não utilizado em código ativo)
- [x] Verificar uso de councilSession.ts (não utilizado em código ativo)
- [x] Verificar uso de councilBlocks.ts (não utilizado em código ativo)
- [x] Remover importação de sseRoutes do server/_core/index.ts
- [x] Excluir arquivos legados:
  - [x] server/services/analysisProgress.ts
  - [x] server/services/councilSession.ts
  - [x] server/services/councilBlocks.ts
  - [x] shared/councilBlocks.ts
  - [x] server/routes/sse.ts
  - [x] client/src/components/CouncilBlocksPanel.tsx
  - [x] client/src/components/CouncilBlocksDebugPanel.tsx
  - [x] server/cancelAnalysis.test.ts
  - [x] server/councilBlocks.test.ts
  - [x] server/services/councilSession.test.ts
  - [x] debug_sse_disconnect.md
  - [x] debug_sse_disconnect_v4.md
  - [x] docs/sse-debug-changes.md
- [x] Confirmar funcionamento do Passo 6 com polling (166 testes passando)


## Ajustes de Polling e UX do Passo 6 - 31/12/2025
- [x] Alterar intervalo de polling de 5s para 10s
- [x] Garantir que polling pare quando status for completed ou failed
- [x] Adicionar spinner discreto durante polling ativo
- [x] Adicionar mensagem "Verificando o status da Sessão do Conselho..."
- [x] Esconder spinner/mensagem quando status mudar para completed
- [x] Exibir relatório final e botões de download quando completed
- [x] Mostrar mensagem de erro amigável quando status for failed
- [x] Gerar diff do componente com as alterações


## Filtro Grayscale no Carrossel - 31/12/2025
- [x] Aplicar filtro grayscale nas imagens do carrossel de conselheiros na hero
- [x] Remover fundo quadriculado do carimbo vermelho, deixando transparente
- [x] Substituir carimbo verde pela nova imagem com fundo transparente
- [x] Substituir carimbo amarelo pela nova imagem com fundo transparente
- [x] Corrigir fundo do carimbo vermelho para transparente
- [x] Verificar fundo do carimbo verde
- [x] Verificar fundo do carimbo amarelo
- [x] Substituir carimbo verde pela nova imagem FGV com fundo transparente
- [x] Criar seção em Parâmetros para edição de imagens dos carimbos e coordenadores
- [x] Verificar e corrigir todos os botões de voltar para direcionar ao início da hero

- [x] Vincular fotos dos coordenadores (Novaes e Marlos) ao S3 nas páginas de Coordenação e perfis

- [ ] Corrigir upload de imagens dos carimbos que não está funcionando
- [ ] Corrigir sincronização das imagens do sistema com o painel de Parâmetros


## Correção de Imagens dos Carimbos - 01/01/2026 - Concluído
- [x] Corrigir upload de imagens dos carimbos que não estava funcionando (problema de cache do CDN)
- [x] Corrigir sincronização das imagens do sistema com o painel de Parâmetros
- [x] Adicionar timestamp ao nome do arquivo no S3 para evitar problemas de cache do CDN
- [x] Limpar URLs incorretas do banco de dados


## Correção de Upload de Fotos dos Coordenadores - 01/01/2026
- [ ] Corrigir upload das fotos dos coordenadores (Novaes e Marlos) no painel de administração


## Remoção de Menções aos LLMs - 01/01/2026
- [x] Remover menções aos LLMs ao lado dos participantes da reunião no passo 6

## Correção de Upload de Foto do Marlos - 01/01/2026
- [ ] Corrigir upload de foto do Marlos Lima no painel de administração (imagem selecionada mas não carrega)


## Correção de Upload de Foto do Marlos - 01/01/2026
- [x] Verificar upload de foto do Marlos Lima no painel de administração - VERIFICADO: upload funciona corretamente, problema era cache/rede temporário. Código de upload melhorado com logs e feedback visual.


## Relatório de Bastidores Detalhado - Janeiro/2026
- [x] Expandir seção "O que acontece nos bastidores" em cada momento do relatório
- [x] Detalhar os prompts enviados às IAs de forma acessível
- [x] Explicar o fluxo de dados entre componentes do sistema
- [x] Manter formato atual do relatório (estrutura geral)
- [x] Incluir detalhes técnicos explicados de forma didática

## Atualização de Cores para Dourado - Janeiro/2026
- [x] Substituir cor do subtítulo "Análises geopolíticas exclusivas" pela cor dourada dos nós do globo
- [x] Substituir cor dos ícones pela cor dourada dos nós do globo
- [x] Substituir cor dos botões de CTA pela cor dourada dos nós do globo
- [x] Atualizar badge BETA para cor dourada
- [x] Atualizar carrossel de conselheiros para cor dourada
- [x] Atualizar ícones na página de verificação para cor dourada

## Ajustes de Cor Dourada v2 - Janeiro/2026
- [x] Substituir cor dourada #BDA132 por #C59B2A em todo o site
- [x] Adicionar efeito hover mais suave nos botões dourados
