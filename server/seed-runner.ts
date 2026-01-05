/**
 * Seed Runner - Importa dados do Manus para o Supabase
 * Chamado pelo endpoint /api/seed-database
 */

import { getDb } from "./db";
import * as schema from "../drizzle/schema";
import * as db from "./db";

export async function seedDatabase() {
  console.log("🚀 Iniciando importação de dados do Manus...\n");

  const database = await getDb();
  if (!database) {
    throw new Error("Database not available");
  }

  // =====================================================
  // 1. USUÁRIOS CONVIDADOS
  // =====================================================
  console.log("📧 Importando usuários convidados...");

  const invitedUsersData = [
    { name: "Marlos Lima", email: "marlos@marlos.com.br", role: "administrador" as const, analysisQuota: 100, invitedBy: 1 },
    { name: "André Novaes", email: "andre.novaes63@gmail.com", role: "administrador" as const, analysisQuota: 100, invitedBy: 1 },
    { name: "Rivail Cerqueira", email: "rivail.cerqueira@gmail.com", role: "administrador" as const, analysisQuota: 100, invitedBy: 1 },
    { name: "Carlos Ivan Simonsen Leal", email: "civan@civan.com.br", role: "administrador" as const, analysisQuota: 100, invitedBy: 1 },
    { name: "Marlos Lima (FGV)", email: "marlos.lima@fgv.br", role: "pesquisador" as const, analysisQuota: 20, invitedBy: 1 },
    { name: "André Novaes (FGV)", email: "andre.novaes@fgv.br", role: "pesquisador" as const, analysisQuota: 20, invitedBy: 1 },
  ];

  for (const user of invitedUsersData) {
    await database.insert(schema.invitedUsers)
      .values(user)
      .onConflictDoUpdate({
        target: schema.invitedUsers.email,
        set: { name: user.name, role: user.role, analysisQuota: user.analysisQuota }
      });
  }
  console.log(`   ✅ ${invitedUsersData.length} usuários convidados importados`);

  // =====================================================
  // 2. CONSELHEIROS
  // =====================================================
  console.log("👔 Importando conselheiros...");

  const counselorsData = [
    {
      counselorId: "mackinder",
      name: "Sir Halford John Mackinder",
      shortName: "Mackinder",
      nationality: "Britânico",
      birthYear: 1861,
      deathYear: 1947,
      photoUrl: "/analysts/mackinder.jpg",
      homePhotoUrl: "/analysts/mackinder.jpg",
      bioPhotoUrl: "/analysts/mackinder.jpg",
      shortBio: "Geógrafo e geopolítico britânico, criador da Teoria do Heartland que influenciou profundamente o pensamento estratégico do século XX.",
      fullBio: "Sir Halford John Mackinder (1861-1947) foi um geógrafo e geopolítico britânico, considerado um dos fundadores da geopolítica moderna. Sua Teoria do Heartland, apresentada em 1904, argumenta que quem controlar o 'coração da terra' (Heartland) controlará o mundo.",
      mainTheory: "Teoria do Heartland - Quem domina o coração da terra domina o mundo",
      keyContributions: ["Teoria do Heartland", "Geopolítica moderna", "Pivot geográfico da história"],
      areasOfExpertise: ["Geografia política", "Poder terrestre", "Estratégia continental", "Domínio eurasiano"],
      mainBooks: [
        { title: "The Geographical Pivot of History", year: 1904 },
        { title: "Democratic Ideals and Reality", year: 1919 },
        { title: "Britain and the British Seas", year: 1902 }
      ],
      personalityTraits: ["Acadêmico rigoroso", "Visionário geográfico", "Analista de poder terrestre"],
      writingStyle: "Acadêmico e analítico, com forte fundamentação geográfica e histórica",
      analysisApproach: "Análise centrada no controle territorial e rotas terrestres da Eurásia",
      keyPhrases: ["Quem domina a Europa Oriental comanda o Heartland", "Quem domina o Heartland comanda a Ilha-Mundo"],
      llmProvider: "gemini",
      llmModel: "gemini-2.0-flash-exp",
      isActive: true,
      isBuiltIn: true,
      displayOrder: 0,
    },
    {
      counselorId: "mahan",
      name: "Alfred Thayer Mahan",
      shortName: "Mahan",
      nationality: "Americano",
      birthYear: 1840,
      deathYear: 1914,
      photoUrl: "/analysts/mahan.jpg",
      homePhotoUrl: "/analysts/mahan.jpg",
      bioPhotoUrl: "/analysts/mahan.jpg",
      shortBio: "Almirante e estrategista naval americano, teórico do poder marítimo.",
      fullBio: "Alfred Thayer Mahan (1840-1914) foi um oficial da Marinha dos Estados Unidos e historiador naval. Sua obra 'A Influência do Poder Marítimo na História' revolucionou o pensamento estratégico naval e influenciou políticas navais de várias nações.",
      mainTheory: "Teoria do Poder Marítimo - Domínio dos mares como chave para hegemonia global",
      keyContributions: ["Teoria do Poder Marítimo", "Estratégia naval moderna", "Importância das linhas de comunicação marítimas"],
      areasOfExpertise: ["Poder naval", "Rotas marítimas", "Projeção de força", "Comércio internacional"],
      mainBooks: [
        { title: "The Influence of Sea Power upon History", year: 1890 },
        { title: "The Interest of America in Sea Power", year: 1897 },
        { title: "Naval Strategy", year: 1911 }
      ],
      personalityTraits: ["Estrategista naval", "Focado em comércio marítimo", "Valoriza bases navais"],
      writingStyle: "Histórico-estratégico, com ênfase em lições do passado para o presente",
      analysisApproach: "Análise focada em rotas marítimas, bases navais e controle dos mares",
      keyPhrases: ["O domínio do mar é a chave para o poder mundial", "Quem controla o mar, controla o comércio"],
      llmProvider: "anthropic",
      llmModel: "claude-sonnet-4-20250514",
      isActive: true,
      isBuiltIn: true,
      displayOrder: 1,
    },
    {
      counselorId: "spykman",
      name: "Nicholas John Spykman",
      shortName: "Spykman",
      nationality: "Americano (nascido na Holanda)",
      birthYear: 1893,
      deathYear: 1943,
      photoUrl: "/analysts/spykman.jpg",
      homePhotoUrl: "/analysts/spykman.jpg",
      bioPhotoUrl: "/analysts/spykman.jpg",
      shortBio: "Cientista político e geoestrategista, criador da teoria do Rimland.",
      fullBio: "Nicholas John Spykman (1893-1943) foi um cientista político americano de origem holandesa. Desenvolveu a teoria do Rimland, argumentando que a periferia costeira da Eurásia é mais importante estrategicamente que o Heartland.",
      mainTheory: "Teoria do Rimland - Controle das bordas costeiras da Eurásia",
      keyContributions: ["Teoria do Rimland", "Crítica à teoria do Heartland", "Realismo geopolítico americano"],
      areasOfExpertise: ["Realismo geopolítico", "Contenção", "Zonas costeiras", "Política de equilíbrio"],
      mainBooks: [
        { title: "America's Strategy in World Politics", year: 1942 },
        { title: "The Geography of the Peace", year: 1944 }
      ],
      personalityTraits: ["Realista pragmático", "Focado em equilíbrio de poder", "Crítico do idealismo"],
      writingStyle: "Direto e analítico, com forte base em relações internacionais",
      analysisApproach: "Análise focada no equilíbrio de poder e controle das zonas costeiras",
      keyPhrases: ["Quem controla o Rimland domina a Eurásia", "A geografia é o fator mais fundamental na política externa"],
      llmProvider: "anthropic",
      llmModel: "claude-sonnet-4-20250514",
      isActive: true,
      isBuiltIn: true,
      displayOrder: 2,
    },
    {
      counselorId: "golbery",
      name: "General Golbery do Couto e Silva",
      shortName: "Golbery",
      nationality: "Brasileiro",
      birthYear: 1911,
      deathYear: 1987,
      photoUrl: "/analysts/golbery.jpg",
      homePhotoUrl: "/analysts/golbery.jpg",
      bioPhotoUrl: "/analysts/golbery.jpg",
      shortBio: "General e geopolítico brasileiro, principal teórico da geopolítica brasileira.",
      fullBio: "General Golbery do Couto e Silva (1911-1987) foi um militar e geopolítico brasileiro, considerado o principal teórico da geopolítica brasileira. Fundador do SNI e ideólogo do regime militar.",
      mainTheory: "Geopolítica Brasileira - Projeção continental e integração nacional",
      keyContributions: ["Geopolítica brasileira", "Conceito de Brasil-Potência", "Integração nacional"],
      areasOfExpertise: ["Integração nacional", "Projeção sul-americana", "Desenvolvimento como segurança"],
      mainBooks: [
        { title: "Geopolítica do Brasil", year: 1967 },
        { title: "Conjuntura Política Nacional", year: 1981 },
        { title: "Planejamento Estratégico", year: 1955 }
      ],
      personalityTraits: ["Estrategista de longo prazo", "Nacionalista", "Focado em desenvolvimento"],
      writingStyle: "Técnico-militar, com visão estratégica do desenvolvimento nacional",
      analysisApproach: "Análise focada na integração territorial e projeção de poder regional",
      keyPhrases: ["O Brasil é uma nação continental", "Desenvolvimento e segurança são indissociáveis"],
      llmProvider: "google",
      llmModel: "gemini-2.5-pro-preview-06-05",
      isActive: true,
      isBuiltIn: true,
      displayOrder: 3,
    },
    {
      counselorId: "kissinger",
      name: "Henry Alfred Kissinger",
      shortName: "Kissinger",
      nationality: "Americano (nascido na Alemanha)",
      birthYear: 1923,
      deathYear: 2023,
      photoUrl: "/analysts/kissinger.jpg",
      homePhotoUrl: "/analysts/kissinger.jpg",
      bioPhotoUrl: "/analysts/kissinger.jpg",
      shortBio: "Diplomata e cientista político, mestre da realpolitik.",
      fullBio: "Henry Kissinger (1923-2023) foi um diplomata e cientista político americano, Secretário de Estado sob Nixon e Ford. Conhecido por sua realpolitik e pela abertura diplomática com a China.",
      mainTheory: "Realpolitik e Equilíbrio de Poder - Diplomacia pragmática baseada em interesses nacionais",
      keyContributions: ["Realpolitik moderna", "Abertura para a China", "Détente com a URSS"],
      areasOfExpertise: ["Realismo clássico", "Equilíbrio de poder", "Diplomacia de grandes potências"],
      mainBooks: [
        { title: "Diplomacy", year: 1994 },
        { title: "World Order", year: 2014 },
        { title: "On China", year: 2011 },
        { title: "A World Restored", year: 1957 }
      ],
      personalityTraits: ["Pragmático", "Calculista", "Mestre em negociação"],
      writingStyle: "Sofisticado, histórico, com análises de longo prazo sobre ordem mundial",
      analysisApproach: "Análise baseada em interesses nacionais, equilíbrio de poder e diplomacia pragmática",
      keyPhrases: ["Diplomacia é a arte do possível", "Não há aliados permanentes, apenas interesses permanentes"],
      llmProvider: "anthropic",
      llmModel: "claude-sonnet-4-20250514",
      isActive: true,
      isBuiltIn: true,
      displayOrder: 4,
    },
    {
      counselorId: "meira-mattos",
      name: "General Carlos de Meira Mattos",
      shortName: "Meira Mattos",
      nationality: "Brasileiro",
      birthYear: 1913,
      deathYear: 2007,
      photoUrl: "/analysts/meira-mattos.jpg",
      homePhotoUrl: "/analysts/meira-mattos.jpg",
      bioPhotoUrl: "/analysts/meira-mattos.jpg",
      shortBio: "General e geopolítico brasileiro, desenvolveu teorias sobre o potencial geopolítico brasileiro e a projeção de poder na América do Sul.",
      fullBio: "General Carlos de Meira Mattos (1913-2007) foi um militar e geopolítico brasileiro, um dos principais pensadores sobre a projeção geopolítica do Brasil. Desenvolveu teorias sobre o 'Brasil Potência' e a importância estratégica da Amazônia.",
      mainTheory: "Brasil Potência - Projeção geopolítica brasileira na América do Sul",
      keyContributions: ["Teoria Brasil Potência", "Geopolítica da Amazônia", "Projeção continental brasileira"],
      areasOfExpertise: ["Geopolítica brasileira", "Defesa nacional", "Amazônia estratégica", "Integração sul-americana"],
      mainBooks: [
        { title: "Brasil - Geopolítica e Destino", year: 1975 },
        { title: "A Geopolítica e as Projeções do Poder", year: 1977 },
        { title: "Geopolítica e Trópicos", year: 1984 }
      ],
      personalityTraits: ["Patriota otimista", "Homem de ação", "Defensor do Brasil Grande"],
      writingStyle: "Direto e patriótico, com visão otimista sobre o potencial brasileiro",
      analysisApproach: "Análise focada no desenvolvimento nacional e projeção de poder do Brasil",
      keyPhrases: ["O Brasil é um país continental com vocação para a grandeza", "A Amazônia é o futuro do Brasil"],
      llmProvider: "gemini",
      llmModel: "gemini-2.0-flash-exp",
      isActive: true,
      isBuiltIn: true,
      displayOrder: 5,
    },
  ];

  for (const counselor of counselorsData) {
    await database.insert(schema.counselors)
      .values(counselor)
      .onConflictDoUpdate({
        target: schema.counselors.counselorId,
        set: {
          name: counselor.name,
          shortName: counselor.shortName,
          nationality: counselor.nationality,
          birthYear: counselor.birthYear,
          deathYear: counselor.deathYear,
          shortBio: counselor.shortBio,
          fullBio: counselor.fullBio,
          mainTheory: counselor.mainTheory,
          keyContributions: counselor.keyContributions,
          areasOfExpertise: counselor.areasOfExpertise,
          mainBooks: counselor.mainBooks,
          personalityTraits: counselor.personalityTraits,
          writingStyle: counselor.writingStyle,
          analysisApproach: counselor.analysisApproach,
          keyPhrases: counselor.keyPhrases,
          llmProvider: counselor.llmProvider,
          llmModel: counselor.llmModel,
          isBuiltIn: counselor.isBuiltIn,
        }
      });
  }
  console.log(`   ✅ ${counselorsData.length} conselheiros importados`);

  // =====================================================
  // 3. CONFIGURAÇÃO LLM DOS CONSELHEIROS
  // =====================================================
  console.log("⚙️  Importando configurações LLM...");

  const llmConfigData = [
    { counselorId: "mackinder", counselorName: "Sir Halford John Mackinder", llmProvider: "gemini", llmModel: "gemini-2.0-flash-exp", displayOrder: 0 },
    { counselorId: "mahan", counselorName: "Alfred Thayer Mahan", llmProvider: "anthropic", llmModel: "claude-sonnet-4-20250514", displayOrder: 1 },
    { counselorId: "spykman", counselorName: "Nicholas John Spykman", llmProvider: "anthropic", llmModel: "claude-sonnet-4-20250514", displayOrder: 2 },
    { counselorId: "golbery", counselorName: "General Golbery do Couto e Silva", llmProvider: "google", llmModel: "gemini-2.5-pro-preview-06-05", displayOrder: 3 },
    { counselorId: "kissinger", counselorName: "Henry Alfred Kissinger", llmProvider: "anthropic", llmModel: "claude-sonnet-4-20250514", displayOrder: 4 },
    { counselorId: "meira-mattos", counselorName: "General Carlos de Meira Mattos", llmProvider: "gemini", llmModel: "gemini-2.0-flash-exp", displayOrder: 5 },
    { counselorId: "gennovais", counselorName: "GennovAIs (Coordenador)", llmProvider: "anthropic", llmModel: "claude-sonnet-4-20250514", displayOrder: 100 },
    { counselorId: "editor", counselorName: "Max Weber (Editor)", llmProvider: "gemini", llmModel: "gemini-2.0-flash-exp", displayOrder: 101 },
  ];

  for (const config of llmConfigData) {
    await database.insert(schema.counselorLlmConfig)
      .values(config)
      .onConflictDoUpdate({
        target: schema.counselorLlmConfig.counselorId,
        set: { counselorName: config.counselorName, llmProvider: config.llmProvider, llmModel: config.llmModel, displayOrder: config.displayOrder }
      });
  }
  console.log(`   ✅ ${llmConfigData.length} configurações LLM importadas`);

  // =====================================================
  // 4. TEMPERATURAS
  // =====================================================
  console.log("🌡️  Importando configurações de temperatura...");

  const temperatureData = [
    { agentType: "counselor", temperature: "0.70", description: "Temperatura para os Conselheiros (mais criatividade)" },
    { agentType: "gennovais", temperature: "0.50", description: "Temperatura para o GennovAIs (equilibrado)" },
    { agentType: "editor", temperature: "0.30", description: "Temperatura para o Max Weber (mais preciso)" },
    { agentType: "default", temperature: "0.50", description: "Temperatura padrão do sistema" },
  ];

  for (const temp of temperatureData) {
    await database.insert(schema.temperatureConfig)
      .values(temp)
      .onConflictDoUpdate({
        target: schema.temperatureConfig.agentType,
        set: { temperature: temp.temperature, description: temp.description }
      });
  }
  console.log(`   ✅ ${temperatureData.length} configurações de temperatura importadas`);

  // =====================================================
  // 5. PREÇOS LLM (com upsert correto)
  // =====================================================
  console.log("💰 Importando preços dos modelos LLM...");

  const pricingData = [
    { provider: "google", modelName: "gemini-2.0-flash-exp", displayName: "Gemini 2.0 Flash (Experimental)", inputPricePerMillion: "0.075", outputPricePerMillion: "0.30", isActive: true },
    { provider: "google", modelName: "gemini-2.5-pro-preview-06-05", displayName: "Gemini 2.5 Pro (Preview)", inputPricePerMillion: "1.25", outputPricePerMillion: "10.00", isActive: true },
    { provider: "anthropic", modelName: "claude-sonnet-4-20250514", displayName: "Claude Sonnet 4", inputPricePerMillion: "3.00", outputPricePerMillion: "15.00", isActive: true },
    { provider: "anthropic", modelName: "claude-3-5-sonnet-20241022", displayName: "Claude 3.5 Sonnet", inputPricePerMillion: "3.00", outputPricePerMillion: "15.00", isActive: true },
    { provider: "deepseek", modelName: "deepseek-chat", displayName: "DeepSeek Chat", inputPricePerMillion: "0.14", outputPricePerMillion: "0.28", isActive: true },
    { provider: "openai", modelName: "gpt-4o", displayName: "GPT-4o", inputPricePerMillion: "2.50", outputPricePerMillion: "10.00", isActive: true },
    { provider: "openai", modelName: "gpt-4o-mini", displayName: "GPT-4o Mini", inputPricePerMillion: "0.15", outputPricePerMillion: "0.60", isActive: true },
  ];

  // Usar função do db.ts que lida com upsert corretamente
  for (const price of pricingData) {
    await db.createLlmPricing(price);
  }
  console.log(`   ✅ ${pricingData.length} preços de modelos importados`);

  // =====================================================
  // 6. SYSTEM PROMPTS (usar função existente do app)
  // =====================================================
  console.log("📝 Inicializando prompts do sistema...");

  // Usar a função existente que cria TODOS os prompts necessários
  await db.initializeDefaultSystemPrompts();
  console.log("   ✅ Prompts do sistema inicializados");

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("✅ IMPORTAÇÃO CONCLUÍDA COM SUCESSO!");
  console.log("═══════════════════════════════════════════════════════");
  console.log("\nDados importados:");
  console.log("  • 6 usuários convidados");
  console.log("  • 6 conselheiros geopolíticos");
  console.log("  • 8 configurações LLM");
  console.log("  • 4 configurações de temperatura");
  console.log("  • 7 preços de modelos LLM");
  console.log("  • Todos os prompts do sistema");
}
