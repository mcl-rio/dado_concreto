import { eq, and, desc, gte, lte, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { 
  InsertUser, users, 
  invitedUsers, InsertInvitedUser,
  analyses, InsertAnalysis,
  analysisSources, InsertAnalysisSource,
  analysisTemplates, InsertAnalysisTemplate,
  counselorLlmConfig, InsertCounselorLlmConfig,
  llmUsageCosts, InsertLlmUsageCost,
  emailConfig, InsertEmailConfig,
  temperatureConfig, InsertTemperatureConfig,
  systemPrompts, InsertSystemPrompt,
  counselorOpinions, InsertCounselorOpinion,
  counselors, InsertCounselor,
  llmPricing, InsertLlmPricing,
  systemParameters, InsertSystemParameter
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _client = postgres(process.env.DATABASE_URL);
      _db = drizzle(_client);
      console.log("[Database] Connected to PostgreSQL");
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER FUNCTIONS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'administrador';
      updateSet.role = 'administrador';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // Check if user email is in invited list and copy validity, quota, role, and name
    if (user.email) {
      const invited = await getInvitedUserByEmail(user.email);
      if (invited) {
        values.validUntil = invited.validUntil;
        values.isActive = invited.isActive;
        values.analysisQuota = invited.analysisQuota;
        values.role = invited.role;
        updateSet.validUntil = invited.validUntil;
        updateSet.isActive = invited.isActive;
        updateSet.analysisQuota = invited.analysisQuota;
        updateSet.role = invited.role;
        // Copy name from invite if user doesn't have one
        if (invited.name && !user.name) {
          values.name = invited.name;
          updateSet.name = invited.name;
        }
      }
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserValidity(
  userId: number, 
  validUntil: Date | null, 
  isActive: boolean, 
  analysisQuota?: number,
  name?: string | null,
  email?: string | null,
  role?: string
) {
  const db = await getDb();
  if (!db) return;
  const updateData: Record<string, unknown> = { validUntil, isActive };
  if (analysisQuota !== undefined) {
    updateData.analysisQuota = analysisQuota;
  }
  if (name !== undefined) {
    updateData.name = name;
  }
  if (email !== undefined) {
    updateData.email = email;
  }
  if (role !== undefined) {
    updateData.role = role;
  }
  await db.update(users).set(updateData).where(eq(users.id, userId));
}

export async function incrementUserAnalysisCount(userId: number, extraCost: number = 0) {
  const db = await getDb();
  if (!db) return;
  const user = await getUserById(userId);
  if (!user) return;
  
  const newUsed = (user.analysisUsed || 0) + 1;
  const newSpent = parseFloat(user.totalSpent?.toString() || '0') + extraCost;
  
  await db.update(users).set({ 
    analysisUsed: newUsed,
    totalSpent: newSpent.toFixed(2),
  }).where(eq(users.id, userId));
}

export async function checkUserAccess(userId: number): Promise<boolean> {
  const user = await getUserById(userId);
  if (!user) return false;
  if (!user.isActive) return false;
  if (user.role === 'administrador') return true;
  if (user.validUntil && new Date(user.validUntil) < new Date()) return false;
  return true;
}

// ============ INVITED USERS FUNCTIONS ============

export async function getInvitedUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(invitedUsers).where(eq(invitedUsers.email, email.toLowerCase())).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createInvitedUser(data: InsertInvitedUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(invitedUsers).values({ ...data, email: data.email.toLowerCase() });
}

export async function getAllInvitedUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invitedUsers).orderBy(desc(invitedUsers.createdAt));
}

export async function updateInvitedUser(id: number, data: Partial<InsertInvitedUser>) {
  const db = await getDb();
  if (!db) return;
  await db.update(invitedUsers).set(data).where(eq(invitedUsers.id, id));
}

export async function deleteInvitedUser(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(invitedUsers).where(eq(invitedUsers.id, id));
}

// ============ ANALYSIS FUNCTIONS ============

/**
 * Gera um código de sessão único no formato FGV-GEO-YYYY-NNNN
 */
export async function generateSessionCode(): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const year = new Date().getFullYear();
  const prefix = `FGV-GEO-${year}-`;
  
  // Buscar o maior número sequencial do ano atual
  const result = await db.select({ sessionCode: analyses.sessionCode })
    .from(analyses)
    .where(sql`${analyses.sessionCode} LIKE ${prefix + '%'}`)
    .orderBy(desc(analyses.sessionCode))
    .limit(1);
  
  let nextNumber = 1;
  if (result.length > 0 && result[0].sessionCode) {
    const lastCode = result[0].sessionCode;
    const lastNumber = parseInt(lastCode.split('-').pop() || '0', 10);
    nextNumber = lastNumber + 1;
  }
  
  // Formatar com 4 dígitos (0001, 0002, etc.)
  const paddedNumber = nextNumber.toString().padStart(4, '0');
  return `${prefix}${paddedNumber}`;
}

export async function createAnalysis(data: InsertAnalysis) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Gerar código de sessão automaticamente se não fornecido
  if (!data.sessionCode) {
    data.sessionCode = await generateSessionCode();
  }
  
  const result = await db.insert(analyses).values(data);
  return result[0].insertId;
}

export async function getAnalysisById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(analyses).where(eq(analyses.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAnalysesByUserId(userId: number, savedOnly = false, includeArchived = false) {
  const db = await getDb();
  if (!db) return [];
  
  if (savedOnly) {
    if (includeArchived) {
      return db.select().from(analyses)
        .where(and(eq(analyses.userId, userId), eq(analyses.savedToHistory, true)))
        .orderBy(desc(analyses.createdAt));
    }
    return db.select().from(analyses)
      .where(and(eq(analyses.userId, userId), eq(analyses.savedToHistory, true), eq(analyses.isArchived, false)))
      .orderBy(desc(analyses.createdAt));
  }
  
  if (includeArchived) {
    return db.select().from(analyses)
      .where(eq(analyses.userId, userId))
      .orderBy(desc(analyses.createdAt));
  }
  
  return db.select().from(analyses)
    .where(and(eq(analyses.userId, userId), eq(analyses.isArchived, false)))
    .orderBy(desc(analyses.createdAt));
}

export async function getArchivedAnalysesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(analyses)
    .where(and(eq(analyses.userId, userId), eq(analyses.isArchived, true)))
    .orderBy(desc(analyses.createdAt));
}

export async function archiveAnalysis(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(analyses).set({ isArchived: true }).where(eq(analyses.id, id));
}

export async function archiveMultipleAnalyses(ids: number[]) {
  const db = await getDb();
  if (!db) return;
  for (const id of ids) {
    await db.update(analyses).set({ isArchived: true }).where(eq(analyses.id, id));
  }
}

export async function restoreAnalysis(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(analyses).set({ isArchived: false }).where(eq(analyses.id, id));
}

export async function restoreMultipleAnalyses(ids: number[]) {
  const db = await getDb();
  if (!db) return;
  for (const id of ids) {
    await db.update(analyses).set({ isArchived: false }).where(eq(analyses.id, id));
  }
}

export async function updateAnalysis(id: number, data: Partial<InsertAnalysis>) {
  const db = await getDb();
  if (!db) return;
  await db.update(analyses).set(data).where(eq(analyses.id, id));
}

export async function deleteAnalysis(id: number) {
  const db = await getDb();
  if (!db) return;
  // Delete sources first
  await db.delete(analysisSources).where(eq(analysisSources.analysisId, id));
  await db.delete(analyses).where(eq(analyses.id, id));
}

// ============ ANALYSIS SOURCES FUNCTIONS ============

export async function addAnalysisSource(data: InsertAnalysisSource) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(analysisSources).values(data);
  return result[0].insertId;
}

export async function getSourcesByAnalysisId(analysisId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(analysisSources).where(eq(analysisSources.analysisId, analysisId));
}

export async function deleteAnalysisSource(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(analysisSources).where(eq(analysisSources.id, id));
}

export async function updateAnalysisSource(id: number, data: Partial<InsertAnalysisSource>) {
  const db = await getDb();
  if (!db) return;
  await db.update(analysisSources).set(data).where(eq(analysisSources.id, id));
}

// ============ TEMPLATE FUNCTIONS ============

export async function createTemplate(data: InsertAnalysisTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(analysisTemplates).values(data);
  return result[0].insertId;
}

export async function getTemplatesByUserId(userId: number, templateType?: "analysis" | "report") {
  const db = await getDb();
  if (!db) return [];
  
  if (templateType) {
    return db.select().from(analysisTemplates)
      .where(and(eq(analysisTemplates.userId, userId), eq(analysisTemplates.templateType, templateType)))
      .orderBy(desc(analysisTemplates.createdAt));
  }
  
  return db.select().from(analysisTemplates)
    .where(eq(analysisTemplates.userId, userId))
    .orderBy(desc(analysisTemplates.createdAt));
}

export async function deleteTemplate(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(analysisTemplates).where(eq(analysisTemplates.id, id));
}

// ============ COUNSELOR LLM CONFIG FUNCTIONS ============

// Categorias de agentes para organização na interface
export type AgentCategory = 'counselor' | 'coordinator' | 'task';

interface AgentConfig {
  counselorId: string;
  counselorName: string;
  category: AgentCategory;
  description?: string;
}

const DEFAULT_COUNSELORS: AgentConfig[] = [
  // Conselheiros são cadastrados pelo usuário via painel administrativo
  // Coordenadores (GennovAIs e Max Weber)
  { counselorId: 'gennovais', counselorName: 'GennovAIs (Coordenador)', category: 'coordinator', description: 'Coordenador do Conselho - Avalia propostas e coordena sessões' },
  { counselorId: 'editor', counselorName: 'Max Weber (Editor)', category: 'coordinator', description: 'Consolidador final - Unifica pareceres em relatório' },
  // Tarefas específicas
  { counselorId: 'proposal_evaluator', counselorName: 'Avaliador de Propostas', category: 'task', description: 'Avalia viabilidade das propostas de pesquisa' },
  { counselorId: 'structure_generator', counselorName: 'Gerador de Estrutura', category: 'task', description: 'Gera estrutura do projeto de pesquisa' },
  { counselorId: 'web_searcher', counselorName: 'Pesquisador Web', category: 'task', description: 'Busca e analisa conteúdo da web' },
  { counselorId: 'price_updater', counselorName: 'Atualizador de Preços', category: 'task', description: 'Busca e atualiza preços de APIs de LLMs' },
  { counselorId: 'counselor_autofill', counselorName: 'Preenchimento Automático', category: 'task', description: 'Gera perfis de conselheiros automaticamente via IA' },
];

export async function getAllCounselorLlmConfigs() {
  const db = await getDb();
  if (!db) return [];
  // Retornar todos os agentes ordenados por displayOrder e depois por nome
  const result = await db.select().from(counselorLlmConfig).orderBy(counselorLlmConfig.displayOrder, counselorLlmConfig.counselorName);
  return result;
}

// Função para obter apenas conselheiros (sem coordenadores e tarefas)
export async function getCounselorOnlyConfigs() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(counselorLlmConfig).orderBy(counselorLlmConfig.counselorName);
  const counselorIds = DEFAULT_COUNSELORS.filter(c => c.category === 'counselor').map(c => c.counselorId);
  return result.filter(c => counselorIds.includes(c.counselorId));
}

// Função para obter a categoria de um agente
export function getAgentCategory(counselorId: string): AgentCategory {
  const agent = DEFAULT_COUNSELORS.find(c => c.counselorId === counselorId);
  return agent?.category || 'counselor';
}

// Função para obter a descrição de um agente
export function getAgentDescription(counselorId: string): string | undefined {
  const agent = DEFAULT_COUNSELORS.find(c => c.counselorId === counselorId);
  return agent?.description;
}

// Exportar lista de agentes padrão para uso na interface
export function getDefaultAgents() {
  return DEFAULT_COUNSELORS;
}

export async function getCounselorLlmConfig(counselorId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(counselorLlmConfig).where(eq(counselorLlmConfig.counselorId, counselorId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertCounselorLlmConfig(data: InsertCounselorLlmConfig) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(counselorLlmConfig).values(data).onConflictDoUpdate({
    target: counselorLlmConfig.counselorId,
    set: {
      counselorName: data.counselorName,
      llmProvider: data.llmProvider,
      llmModel: data.llmModel,
      endpoint: data.endpoint,
      apiKey: data.apiKey,
      personality: data.personality,
      isActive: data.isActive,
    },
  });
}

export async function updateCounselorPersonality(counselorId: string, personality: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(counselorLlmConfig)
    .set({ personality })
    .where(eq(counselorLlmConfig.counselorId, counselorId));
}

export async function deleteCounselorLlmConfig(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(counselorLlmConfig).where(eq(counselorLlmConfig.id, id));
}

// Reordenar configs de LLM dos conselheiros
export async function reorderCounselorLlmConfigs(items: { counselorId: string; displayOrder: number }[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  for (const item of items) {
    await db.update(counselorLlmConfig)
      .set({ displayOrder: item.displayOrder })
      .where(eq(counselorLlmConfig.counselorId, item.counselorId));
  }
  return { success: true };
}

export async function initializeDefaultCounselorConfigs() {
  const db = await getDb();
  if (!db) return;
  
  // 1. Inicializar coordenadores e tarefas padrão
  for (const counselor of DEFAULT_COUNSELORS) {
    const existing = await getCounselorLlmConfig(counselor.counselorId);
    if (!existing) {
      // Definir LLM padrão baseado na categoria
      let llmProvider = 'google';
      let llmModel = 'gemini-2.5-pro';
      
      if (counselor.category === 'coordinator') {
        // Coordenadores (GennovAIs e Max Weber) usam Google Gemini Pro
        llmProvider = 'google';
        llmModel = 'gemini-2.5-pro';
      } else if (counselor.category === 'task') {
        // Tarefas usam Google Gemini Flash para velocidade
        llmProvider = 'google';
        llmModel = 'gemini-2.0-flash-exp';
      }
      // Conselheiros usam Google Gemini Pro por padrão
      
      await upsertCounselorLlmConfig({
        counselorId: counselor.counselorId,
        counselorName: counselor.counselorName,
        llmProvider,
        llmModel,
        isActive: true,
      });
    }
  }
  
  // 2. Sincronizar automaticamente conselheiros cadastrados na tabela counselors
  await syncCounselorsToLlmConfig();
}

// Sincroniza todos os conselheiros cadastrados na tabela counselors com a tabela counselorLlmConfig
// Sincronização completa bidirecional entre conselheiros e LLM configs
export async function syncCounselorsToLlmConfig(): Promise<{
  added: string[];
  updated: string[];
  removed: string[];
  errors: string[];
}> {
  const db = await getDb();
  const result = {
    added: [] as string[],
    updated: [] as string[],
    removed: [] as string[],
    errors: [] as string[],
  };
  
  if (!db) {
    result.errors.push('Database not available');
    return result;
  }
  
  try {
    // 1. Buscar todos os conselheiros cadastrados
    const allCounselors = await db.select().from(counselors);
    
    // 2. Buscar todos os LLM configs existentes (exceto coordenadores e tarefas)
    const allLlmConfigs = await db.select().from(counselorLlmConfig);
    const counselorLlmConfigIds = new Set(allLlmConfigs.map(c => c.counselorId));
    const counselorIds = new Set(allCounselors.map(c => c.counselorId));
    
    // IDs dos coordenadores e tarefas padrão (não devem ser removidos)
    const defaultAgentIds = new Set(DEFAULT_COUNSELORS.map(c => c.counselorId));
    
    // 3. Adicionar/Atualizar conselheiros que não estão na tabela de LLM configs
    for (const counselor of allCounselors) {
      const existing = allLlmConfigs.find(c => c.counselorId === counselor.counselorId);
      
      if (!existing) {
        // Adicionar novo
        const llmProvider = counselor.llmProvider || 'google';
        const llmModel = counselor.llmModel || 'gemini-2.5-pro';
        
        await upsertCounselorLlmConfig({
          counselorId: counselor.counselorId,
          counselorName: counselor.name,
          llmProvider,
          llmModel,
          isActive: counselor.isActive ?? true,
        });
        result.added.push(counselor.name);
        console.log(`[Sync] Conselheiro ${counselor.name} ADICIONADO à tabela de LLM configs`);
      } else {
        // Atualizar se nome ou status mudou
        if (existing.counselorName !== counselor.name || existing.isActive !== counselor.isActive) {
          await db.update(counselorLlmConfig)
            .set({
              counselorName: counselor.name,
              isActive: counselor.isActive,
            })
            .where(eq(counselorLlmConfig.counselorId, counselor.counselorId));
          result.updated.push(counselor.name);
          console.log(`[Sync] Conselheiro ${counselor.name} ATUALIZADO na tabela de LLM configs`);
        }
      }
    }
    
    // 4. Remover LLM configs de conselheiros que não existem mais (exceto coordenadores/tarefas)
    for (const llmConfig of allLlmConfigs) {
      // Pular coordenadores e tarefas padrão
      if (defaultAgentIds.has(llmConfig.counselorId)) continue;
      
      // Se o conselheiro não existe mais na tabela de conselheiros, remover
      if (!counselorIds.has(llmConfig.counselorId)) {
        await db.delete(counselorLlmConfig).where(eq(counselorLlmConfig.counselorId, llmConfig.counselorId));
        result.removed.push(llmConfig.counselorName);
        console.log(`[Sync] Conselheiro ${llmConfig.counselorName} REMOVIDO da tabela de LLM configs (não existe mais)`);
      }
    }
    
    console.log(`[Sync] Sincronização concluída: ${result.added.length} adicionados, ${result.updated.length} atualizados, ${result.removed.length} removidos`);
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(errorMsg);
    console.error('[Sync] Erro na sincronização:', error);
  }
  
  return result;
}

// Função para forçar sincronização completa (chamada manual pelo admin)
export async function forceSyncAllCounselors(): Promise<{
  counselorsCount: number;
  llmConfigsCount: number;
  syncResult: Awaited<ReturnType<typeof syncCounselorsToLlmConfig>>;
}> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  // Executar sincronização
  const syncResult = await syncCounselorsToLlmConfig();
  
  // Contar registros
  const counselorsCount = (await db.select().from(counselors)).length;
  const llmConfigsCount = (await db.select().from(counselorLlmConfig)).length;
  
  return {
    counselorsCount,
    llmConfigsCount,
    syncResult,
  };
}


// ============ LLM USAGE COSTS FUNCTIONS ============

export async function recordLlmUsage(data: InsertLlmUsageCost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(llmUsageCosts).values(data);
  return result;
}

export async function getLlmUsageCostsByProvider() {
  const db = await getDb();
  if (!db) return [];
  
  // Get all usage records and aggregate in JS (MySQL doesn't support window functions easily)
  const records = await db.select().from(llmUsageCosts);
  
  // Aggregate by provider
  const providerCosts: Record<string, {
    provider: string;
    totalCost: number;
    totalTokens: number;
    requestCount: number;
    models: Record<string, { model: string; cost: number; tokens: number; count: number }>;
  }> = {};
  
  for (const record of records) {
    const provider = record.llmProvider;
    const model = record.llmModel;
    const cost = parseFloat(record.costUsd?.toString() || '0');
    const tokens = record.totalTokens || 0;
    
    if (!providerCosts[provider]) {
      providerCosts[provider] = {
        provider,
        totalCost: 0,
        totalTokens: 0,
        requestCount: 0,
        models: {},
      };
    }
    
    providerCosts[provider].totalCost += cost;
    providerCosts[provider].totalTokens += tokens;
    providerCosts[provider].requestCount += 1;
    
    if (!providerCosts[provider].models[model]) {
      providerCosts[provider].models[model] = { model, cost: 0, tokens: 0, count: 0 };
    }
    providerCosts[provider].models[model].cost += cost;
    providerCosts[provider].models[model].tokens += tokens;
    providerCosts[provider].models[model].count += 1;
  }
  
  return Object.values(providerCosts).map(p => ({
    ...p,
    models: Object.values(p.models),
  }));
}

export async function getLlmUsageCostsByPeriod(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const records = await db.select().from(llmUsageCosts)
    .where(and(
      gte(llmUsageCosts.createdAt, startDate),
    ));
  
  // Filter by end date in JS (simpler than complex SQL)
  const filtered = records.filter(r => r.createdAt <= endDate);
  
  // Group by date
  const dailyCosts: Record<string, {
    date: string;
    totalCost: number;
    totalTokens: number;
    requestCount: number;
    byProvider: Record<string, number>;
  }> = {};
  
  for (const record of filtered) {
    const dateStr = record.createdAt.toISOString().split('T')[0];
    const cost = parseFloat(record.costUsd?.toString() || '0');
    const tokens = record.totalTokens || 0;
    
    if (!dailyCosts[dateStr]) {
      dailyCosts[dateStr] = {
        date: dateStr,
        totalCost: 0,
        totalTokens: 0,
        requestCount: 0,
        byProvider: {},
      };
    }
    
    dailyCosts[dateStr].totalCost += cost;
    dailyCosts[dateStr].totalTokens += tokens;
    dailyCosts[dateStr].requestCount += 1;
    
    if (!dailyCosts[dateStr].byProvider[record.llmProvider]) {
      dailyCosts[dateStr].byProvider[record.llmProvider] = 0;
    }
    dailyCosts[dateStr].byProvider[record.llmProvider] += cost;
  }
  
  return Object.values(dailyCosts).sort((a, b) => a.date.localeCompare(b.date));
}

export async function getLlmUsageSummary() {
  const db = await getDb();
  if (!db) return { totalCost: 0, totalTokens: 0, totalRequests: 0, byProvider: [] };
  
  const records = await db.select().from(llmUsageCosts);
  
  let totalCost = 0;
  let totalTokens = 0;
  const providerTotals: Record<string, { provider: string; cost: number; tokens: number; requests: number }> = {};
  
  for (const record of records) {
    const cost = parseFloat(record.costUsd?.toString() || '0');
    const tokens = record.totalTokens || 0;
    
    totalCost += cost;
    totalTokens += tokens;
    
    if (!providerTotals[record.llmProvider]) {
      providerTotals[record.llmProvider] = { provider: record.llmProvider, cost: 0, tokens: 0, requests: 0 };
    }
    providerTotals[record.llmProvider].cost += cost;
    providerTotals[record.llmProvider].tokens += tokens;
    providerTotals[record.llmProvider].requests += 1;
  }
  
  return {
    totalCost,
    totalTokens,
    totalRequests: records.length,
    byProvider: Object.values(providerTotals),
  };
}

export async function getRecentLlmUsage(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(llmUsageCosts)
    .orderBy(desc(llmUsageCosts.createdAt))
    .limit(limit);
}


// ============ EMAIL CONFIG FUNCTIONS ============

export async function getEmailConfigs() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(emailConfig).orderBy(emailConfig.configKey);
}

export async function getEmailConfig(configKey: string) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db.select().from(emailConfig).where(eq(emailConfig.configKey, configKey));
  return results[0] || null;
}

export async function upsertEmailConfig(config: InsertEmailConfig) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await getEmailConfig(config.configKey);
  
  if (existing) {
    await db.update(emailConfig)
      .set({
        configValue: config.configValue,
        description: config.description,
        sendEmails: config.sendEmails,
        emailSubject: config.emailSubject,
        emailBody: config.emailBody,
        senderEmail: config.senderEmail || 'marlos@marlos.com.br',
      })
      .where(eq(emailConfig.configKey, config.configKey));
  } else {
    await db.insert(emailConfig).values({
      ...config,
      senderEmail: config.senderEmail || 'marlos@marlos.com.br',
    });
  }
}

export async function updateEmailConfigSendStatus(configKey: string, sendEmails: boolean) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(emailConfig)
    .set({ sendEmails })
    .where(eq(emailConfig.configKey, configKey));
}

export async function deleteEmailConfig(configKey: string) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(emailConfig).where(eq(emailConfig.configKey, configKey));
}

// Initialize default email configs
export async function initializeDefaultEmailConfigs() {
  const db = await getDb();
  if (!db) return;
  
  const defaults = [
    { 
      configKey: 'admin_notification', 
      configValue: 'marlos@marlos.com.br', 
      description: 'Email para notificações administrativas', 
      sendEmails: true,
      senderEmail: 'marlos@marlos.com.br',
      emailSubject: '[Conselho IA Geopolítica FGV] Nova Notificação Administrativa',
      emailBody: `<html>
<body style="font-family: Arial, sans-serif; color: #333;">
<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
<img src="https://dint.fgv.br/sites/default/files/logo-fgv.png" alt="FGV" style="height: 50px; margin-bottom: 20px;">
<h2 style="color: #003A79;">Notificação Administrativa</h2>
<p>{{content}}</p>
<hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
<p style="font-size: 12px; color: #666;">Conselho IA de Geopolítica da FGV<br>Este é um email automático, não responda.</p>
</div>
</body>
</html>`
    },
    { 
      configKey: 'analysis_complete', 
      configValue: '', 
      description: 'Email para notificação de análises concluídas', 
      sendEmails: true,
      senderEmail: 'marlos@marlos.com.br',
      emailSubject: '[Conselho IA Geopolítica FGV] Sua análise foi concluída: {{title}}',
      emailBody: `<html>
<body style="font-family: Arial, sans-serif; color: #333;">
<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
<img src="https://dint.fgv.br/sites/default/files/logo-fgv.png" alt="FGV" style="height: 50px; margin-bottom: 20px;">
<h2 style="color: #003A79;">Análise Concluída</h2>
<p>Olá <strong>{{userName}}</strong>,</p>
<p>Sua análise <strong>"{{title}}"</strong> foi concluída com sucesso!</p>
<p>Acesse o sistema para visualizar o relatório completo e fazer o download em PDF ou DOCX.</p>
<p><a href="{{dashboardUrl}}" style="display: inline-block; background-color: #003A79; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Acessar Meu Dashboard</a></p>
<hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
<p style="font-size: 12px; color: #666;">Conselho IA de Geopolítica da FGV<br>Este é um email automático, não responda.</p>
</div>
</body>
</html>`
    },
    { 
      configKey: 'new_user_welcome', 
      configValue: '', 
      description: 'Email de boas-vindas para novos usuários', 
      sendEmails: true,
      senderEmail: 'marlos@marlos.com.br',
      emailSubject: '[Conselho IA Geopolítica FGV] Bem-vindo ao Conselho IA de Geopolítica',
      emailBody: `<html>
<body style="font-family: Arial, sans-serif; color: #333;">
<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
<img src="https://dint.fgv.br/sites/default/files/logo-fgv.png" alt="FGV" style="height: 50px; margin-bottom: 20px;">
<h2 style="color: #003A79;">Bem-vindo ao Conselho IA de Geopolítica!</h2>
<p>Olá <strong>{{userName}}</strong>,</p>
<p>Seu acesso ao Conselho IA de Geopolítica da FGV foi aprovado!</p>
<p>Você agora pode submeter propostas de análise e contar com o suporte de nossos conselheiros especializados em geopolítica.</p>
<p><strong>Sua cota de análises:</strong> {{analysisQuota}} análises</p>
<p><a href="{{systemUrl}}" style="display: inline-block; background-color: #003A79; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Acessar o Sistema</a></p>
<hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
<p style="font-size: 12px; color: #666;">Conselho IA de Geopolítica da FGV<br>Este é um email automático, não responda.</p>
</div>
</body>
</html>`
    },
    { 
      configKey: 'contact_form', 
      configValue: 'marlos@marlos.com.br', 
      description: 'Email para receber mensagens do formulário de contato', 
      sendEmails: true,
      senderEmail: 'marlos@marlos.com.br',
      emailSubject: '[Conselho IA Geopolítica FGV] Nova mensagem de contato: {{subject}}',
      emailBody: `<html>
<body style="font-family: Arial, sans-serif; color: #333;">
<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
<img src="https://dint.fgv.br/sites/default/files/logo-fgv.png" alt="FGV" style="height: 50px; margin-bottom: 20px;">
<h2 style="color: #003A79;">Nova Mensagem de Contato</h2>
<p><strong>De:</strong> {{senderName}} ({{senderEmail}})</p>
<p><strong>Assunto:</strong> {{subject}}</p>
<hr style="border: none; border-top: 1px solid #ccc; margin: 10px 0;">
<p><strong>Mensagem:</strong></p>
<p>{{message}}</p>
<hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
<p style="font-size: 12px; color: #666;">Conselho IA de Geopolítica da FGV<br>Mensagem enviada através do formulário de contato.</p>
</div>
</body>
</html>`
    },
  ];
  
  for (const config of defaults) {
    const existing = await getEmailConfig(config.configKey);
    if (!existing) {
      await db.insert(emailConfig).values(config);
    }
  }
}


// ============ TEMPERATURE CONFIG FUNCTIONS ============

export async function getTemperatureConfigs() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(temperatureConfig).orderBy(temperatureConfig.agentType);
}

export async function getTemperatureConfig(agentType: string) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db.select().from(temperatureConfig).where(eq(temperatureConfig.agentType, agentType));
  return results[0] || null;
}

export async function upsertTemperatureConfig(config: InsertTemperatureConfig) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await getTemperatureConfig(config.agentType);
  
  if (existing) {
    await db.update(temperatureConfig)
      .set({
        temperature: config.temperature,
        description: config.description,
        updatedBy: config.updatedBy,
      })
      .where(eq(temperatureConfig.agentType, config.agentType));
  } else {
    await db.insert(temperatureConfig).values(config);
  }
}

export async function deleteTemperatureConfig(agentType: string) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(temperatureConfig).where(eq(temperatureConfig.agentType, agentType));
}

// Initialize default temperature configs
export async function initializeDefaultTemperatureConfigs() {
  const db = await getDb();
  if (!db) return;
  
  const defaults = [
    { agentType: 'counselor', temperature: '0.85', description: 'Alta criatividade para análises diversificadas dos conselheiros' },
    { agentType: 'gennovais', temperature: '0.60', description: 'Equilíbrio entre criatividade e estrutura para coordenação' },
    { agentType: 'editor', temperature: '0.30', description: 'Alta precisão para revisão final consistente' },
    { agentType: 'default', temperature: '0.70', description: 'Temperatura padrão para chamadas não categorizadas' },
  ];
  
  for (const config of defaults) {
    const existing = await getTemperatureConfig(config.agentType);
    if (!existing) {
      await db.insert(temperatureConfig).values(config);
    }
  }
}

// Get temperature for a specific agent type (with fallback to default)
export async function getTemperatureForAgent(agentType: string): Promise<number> {
  const config = await getTemperatureConfig(agentType);
  if (config) {
    return parseFloat(config.temperature?.toString() || '0.7');
  }
  
  // Fallback to default
  const defaultConfig = await getTemperatureConfig('default');
  if (defaultConfig) {
    return parseFloat(defaultConfig.temperature?.toString() || '0.7');
  }
  
  // Hardcoded fallback
  return 0.7;
}


// ============ SYSTEM PROMPTS FUNCTIONS ============

export async function getSystemPrompts() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(systemPrompts).orderBy(systemPrompts.category, systemPrompts.promptKey);
}

export async function getSystemPrompt(promptKey: string) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db.select().from(systemPrompts).where(eq(systemPrompts.promptKey, promptKey));
  return results[0] || null;
}

export async function upsertSystemPrompt(prompt: InsertSystemPrompt) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await getSystemPrompt(prompt.promptKey);
  
  if (existing) {
    await db.update(systemPrompts)
      .set({
        promptName: prompt.promptName,
        description: prompt.description,
        promptContent: prompt.promptContent,
        category: prompt.category,
        updatedBy: prompt.updatedBy,
      })
      .where(eq(systemPrompts.promptKey, prompt.promptKey));
  } else {
    await db.insert(systemPrompts).values(prompt);
  }
}

export async function updateSystemPromptContent(promptKey: string, content: string, updatedBy?: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(systemPrompts)
    .set({
      promptContent: content,
      updatedBy,
    })
    .where(eq(systemPrompts.promptKey, promptKey));
}

export async function resetSystemPromptToDefault(promptKey: string, updatedBy?: number) {
  const db = await getDb();
  if (!db) return;
  
  const prompt = await getSystemPrompt(promptKey);
  if (prompt) {
    await db.update(systemPrompts)
      .set({
        promptContent: prompt.defaultContent,
        updatedBy,
      })
      .where(eq(systemPrompts.promptKey, promptKey));
  }
}

export async function deleteSystemPrompt(promptKey: string) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(systemPrompts).where(eq(systemPrompts.promptKey, promptKey));
}

// Initialize default system prompts
export async function initializeDefaultSystemPrompts() {
  const db = await getDb();
  if (!db) return;
  
  const defaults: InsertSystemPrompt[] = [

    {
      promptKey: 'editor_consolidator',
      promptName: 'Max Weber - Consolidador',
      description: 'Prompt do Max Weber que trabalha em conjunto com o GennovAIs para unificar os pareceres aprovados dos Conselheiros em um único relatório final coeso e bem estruturado.',
      category: 'agent',
      promptContent: `Você é o Max Weber do Conselho de Geopolítica da FGV. Você trabalha em conjunto com o GennovAIs para consolidar os pareceres aprovados dos Conselheiros em um único relatório final.

CONTEXTO DA SESSÃO DO CONSELHO:
O GennovAIs convocou a Sessão do Conselho e cada Conselheiro apresentou seu parecer individual. Após avaliação rigorosa do GennovAIs, todos os pareceres foram aprovados. Agora, você e o GennovAIs devem unificar essas perspectivas em um relatório coeso.

REGRAS OBRIGATÓRIAS:
1. O relatório final NÃO DEVE mencionar os nomes dos Conselheiros
2. O relatório DEVE seguir a estrutura aprovada pelo usuário
3. Integre as diferentes perspectivas de forma coesa e fluida
4. Mantenha o estilo discursivo (texto corrido, sem bullet points)
5. Elimine redundâncias e contradições
6. Garanta qualidade acadêmica compatível com publicações da FGV

O documento final deve:
- Apresentar argumentação rigorosa e bem estruturada
- Integrar as diferentes perspectivas teóricas de forma equilibrada
- Oferecer conclusões fundamentadas em evidências
- Manter tom acadêmico formal e objetivo
- Estar pronto para publicação ou apresentação institucional

IMPORTANTE: Não mencione "Conselheiro" ou qualquer referência aos nomes dos analistas no texto final. As ideias devem ser apresentadas como análise integrada do Conselho.

Responda sempre em português brasileiro, com excelência acadêmica.`,
      defaultContent: `Você é o Max Weber do Conselho de Geopolítica da FGV. Sua função é consolidar os pareceres aprovados dos Conselheiros em um único relatório final.

REGRAS OBRIGATÓRIAS:
1. O relatório final NÃO DEVE mencionar os nomes dos Conselheiros
2. O relatório DEVE seguir a estrutura aprovada pelo usuário
3. Integre as diferentes perspectivas de forma coesa e fluida
4. Mantenha o estilo discursivo (texto corrido, sem bullet points)
5. Elimine redundâncias e contradições
6. Garanta qualidade acadêmica compatível com publicações da FGV

O documento final deve:
- Apresentar argumentação rigorosa e bem estruturada
- Integrar as diferentes perspectivas teóricas de forma equilibrada
- Oferecer conclusões fundamentadas em evidências
- Manter tom acadêmico formal e objetivo
- Estar pronto para publicação ou apresentação institucional

IMPORTANTE: Não mencione "Conselheiro" ou qualquer referência aos nomes dos analistas no texto final. As ideias devem ser apresentadas como análise integrada do Conselho.

Responda sempre em português brasileiro, com excelência acadêmica.`,
    },
    {
      promptKey: 'counselor_task',
      promptName: 'Tarefa do Conselheiro',
      description: 'Template de tarefa enviado para cada Conselheiro elaborar seu parecer. Contém as instruções de formato e conteúdo esperado.',
      category: 'task',
      promptContent: `Como {COUNSELOR_NAME}, especialista em {KEY_THEORY}, elabore seu parecer sobre o tema proposto.

INSTRUÇÕES:
1. Leia TODAS as fontes fornecidas cuidadosamente
2. Considere o título, contexto e objetivos da análise
3. Aplique sua perspectiva teórica específica ({KEY_THEORY})
4. Escreva em TEXTO CORRIDO, DISCURSIVO, em parágrafos bem desenvolvidos
5. NUNCA use bullet points, listas numeradas ou marcadores
6. Seja OBJETIVO e DIRETO na redação
7. Fundamente todas as afirmações em evidências ou teoria
8. Siga a estrutura do relatório definida (se houver)

Seu parecer deve ser denso, profundo e revelar seu conhecimento e experiência como um dos maiores pensadores geopolíticos da história.`,
      defaultContent: `Como {COUNSELOR_NAME}, especialista em {KEY_THEORY}, elabore seu parecer sobre o tema proposto.

INSTRUÇÕES:
1. Leia TODAS as fontes fornecidas cuidadosamente
2. Considere o título, contexto e objetivos da análise
3. Aplique sua perspectiva teórica específica ({KEY_THEORY})
4. Escreva em TEXTO CORRIDO, DISCURSIVO, em parágrafos bem desenvolvidos
5. NUNCA use bullet points, listas numeradas ou marcadores
6. Seja OBJETIVO e DIRETO na redação
7. Fundamente todas as afirmações em evidências ou teoria
8. Siga a estrutura do relatório definida (se houver)

Seu parecer deve ser denso, profundo e revelar seu conhecimento e experiência como um dos maiores pensadores geopolíticos da história.`,
    },
    {
      promptKey: 'novaes_approval_messages',
      promptName: 'GennovAIs - Mensagens de Aprovação',
      description: 'Mensagens criativas de aprovação do GennovAIs no estilo militar elogioso. Cada mensagem em uma linha separada.',
      category: 'evaluation',
      promptContent: `Aprovado com louvor! Parecer digno de um estratégico de primeira linha. Parabéns, Conselheiro!
Excelência comprovada! O General reconhece análise de alto nível. Autorizado para consolidação!
Missão cumprida com distinção! Este parecer honra a tradição acadêmica da FGV!
Aprovado! Análise sólida, fundamentada e estratégica. Exatamente o que o Conselho espera!
Parecer autorizado! O General reconhece trabalho de qualidade quando vê. Prossiga!
Aprovação concedida! Profundidade analítica e rigor teórico exemplares. Muito bem!
Positivo! Este parecer demonstra domínio da matéria e visão estratégica. Aprovado!
Autorizado para integração! O Conselheiro demonstrou excelência acadêmica. Parabéns!`,
      defaultContent: `Aprovado com louvor! Parecer digno de um estratégico de primeira linha. Parabéns, Conselheiro!
Excelência comprovada! O General reconhece análise de alto nível. Autorizado para consolidação!
Missão cumprida com distinção! Este parecer honra a tradição acadêmica da FGV!
Aprovado! Análise sólida, fundamentada e estratégica. Exatamente o que o Conselho espera!
Parecer autorizado! O General reconhece trabalho de qualidade quando vê. Prossiga!
Aprovação concedida! Profundidade analítica e rigor teórico exemplares. Muito bem!
Positivo! Este parecer demonstra domínio da matéria e visão estratégica. Aprovado!
Autorizado para integração! O Conselheiro demonstrou excelência acadêmica. Parabéns!`,
    },
    {
      promptKey: 'novaes_rejection_messages',
      promptName: 'GennovAIs - Mensagens de Rejeição',
      description: 'Mensagens criativas de rejeição do GennovAIs no estilo militar bem-humorado. Cada mensagem em uma linha separada.',
      category: 'evaluation',
      promptContent: `Negativo, Conselheiro! Isso aqui parece relatório de recruta em primeiro dia de quartel. Refazer com mais rigor!
Permissão negada! O General não aceita análise rasa. Quero profundidade estratégica, não superfície de lago!
Reprovação sumária! Esse parecer não passaria nem em inspeção de rotina. Volte ao trabalho!
Inaceitável! O Conselho da FGV não é clube de debates de colégio. Quero análise de nível superior!
Ordem do dia: refazer este parecer! Falta fundamentação teórica e sobra achismo. Dispensado para reelaborar!
Negativo, soldado! Esse texto não sobreviveria a um briefing de cinco minutos. Mais substância!
Rejeitado! O General esperava análise geopolítica, não redação de vestibular. Tente novamente!
Missão não cumprida! Esse parecer precisa de mais munição teórica. Volte ao arsenal acadêmico!
Reprovação tática! Falta visão estratégica neste documento. O General exige excelência!
Ordem de retrabalho! Conselheiro, o senhor pode fazer melhor que isso. A FGV merece!`,
      defaultContent: `Negativo, Conselheiro! Isso aqui parece relatório de recruta em primeiro dia de quartel. Refazer com mais rigor!
Permissão negada! O General não aceita análise rasa. Quero profundidade estratégica, não superfície de lago!
Reprovação sumária! Esse parecer não passaria nem em inspeção de rotina. Volte ao trabalho!
Inaceitável! O Conselho da FGV não é clube de debates de colégio. Quero análise de nível superior!
Ordem do dia: refazer este parecer! Falta fundamentação teórica e sobra achismo. Dispensado para reelaborar!
Negativo, soldado! Esse texto não sobreviveria a um briefing de cinco minutos. Mais substância!
Rejeitado! O General esperava análise geopolítica, não redação de vestibular. Tente novamente!
Missão não cumprida! Esse parecer precisa de mais munição teórica. Volte ao arsenal acadêmico!
Reprovação tática! Falta visão estratégica neste documento. O General exige excelência!
Ordem de retrabalho! Conselheiro, o senhor pode fazer melhor que isso. A FGV merece!`,
    },
    {
      promptKey: 'novaes_proposal_evaluator',
      promptName: 'GennovAIs - Avaliador de Proposta',
      description: 'Prompt usado pelo GennovAIs para avaliar propostas de análise e dar parecer (verde/amarelo/vermelho) sobre viabilidade.',
      category: 'evaluation',
      promptContent: `Você é o GennovAIs, Coordenador do Conselho de Geopolítica da FGV. Com décadas de experiência em planejamento estratégico militar e análise de cenários complexos, você é o guardião da excelência analítica do Conselho. Sua postura é firme, direta e sem concessões à mediocridade. Você usa linguagem militar característica e não hesita em rejeitar propostas vagas, mal fundamentadas ou que não agreguem valor estratégico.

Sua missão neste momento é avaliar se uma proposta de análise é viável e adequada aos padrões do Conselho.

Você tem três tipos de parecer:
- **SINAL VERDE 🟢**: A análise é viável, relevante e pode ser executada. Aprovar para estruturação.
- **SINAL AMARELO 🟡**: A análise tem potencial mas precisa de ajustes. Sugerir melhorias específicas.
- **SINAL VERMELHO 🔴**: A análise é inadequada, fora do escopo ou inviável. Recomendar abandono com justificativa clara e firme.

Sua avaliação deve considerar:
1. Relevância geopolítica do tema
2. Viabilidade da análise com as fontes disponíveis
3. Clareza e precisão do objetivo
4. Adequação ao escopo do Conselho (geopolítica, relações internacionais, estratégia)

Seja rigoroso mas construtivo. Use linguagem militar direta. Seu parecer deve orientar o usuário sobre como proceder, sem rodeios.`,
      defaultContent: `Você é o GennovAIs, Coordenador do Conselho de Geopolítica da FGV. Sua missão é avaliar se uma proposta de análise é viável e adequada.

Você tem três tipos de parecer:
- **SINAL VERDE**: A análise é viável, relevante e pode ser executada. Aprovar para estruturação.
- **SINAL AMARELO**: A análise tem potencial mas precisa de ajustes. Sugerir melhorias específicas.
- **SINAL VERMELHO**: A análise é inadequada, fora do escopo ou inviável. Recomendar abandono com justificativa clara.

Sua avaliação deve considerar:
1. Relevância geopolítica do tema
2. Viabilidade da análise com as fontes disponíveis
3. Clareza e precisão do objetivo
4. Adequação ao escopo do Conselho (geopolítica, relações internacionais, estratégia)

Seja rigoroso mas construtivo. Seu parecer deve orientar o usuário sobre como proceder.`,
    },
    {
      promptKey: 'novaes_structure_generator',
      promptName: 'GennovAIs - Gerador de Estrutura',
      description: 'Prompt usado pelo GennovAIs para propor estruturas de relatório após aprovação da proposta.',
      category: 'task',
      promptContent: `Você é o GennovAIs, Coordenador do Conselho de Geopolítica da FGV. Com décadas de experiência em planejamento estratégico militar e análise de cenários complexos, você é o guardião da excelência analítica do Conselho. Sua postura é firme, direta e pragmática.

A proposta de análise foi aprovada com SINAL VERDE. Agora sua missão é propor uma estrutura detalhada de relatório que será enviada antecipadamente aos Conselheiros especialistas cadastrados no sistema para que preparem seus pareceres fundamentados.

Ao propor a estrutura:
1. Leia TODAS as fontes fornecidas com atenção crítica
2. Considere o título, objetivo e contexto da análise
3. Proponha entre 4 e 8 seções principais
4. Cada seção deve ter título claro e descrição precisa do conteúdo esperado
5. A estrutura deve fluir logicamente do contexto para as conclusões
6. Inclua o método e os resultados esperados
7. Seja específico sobre quais aspectos cada Conselheiro deve abordar

Sua estrutura deve ser fundamentada no conteúdo real das fontes, não em suposições. Use linguagem militar direta e objetiva. Esta estrutura orientará todo o trabalho dos Conselheiros, portanto seja preciso e estratégico.`,
      defaultContent: `Você é o GennovAIs, Coordenador do Conselho de Geopolítica da FGV. A proposta de análise foi aprovada. Agora sua missão é propor uma estrutura detalhada de relatório.

Ao propor a estrutura:
1. Leia TODAS as fontes fornecidas com atenção
2. Considere o título, objetivo e contexto da análise
3. Proponha entre 4 e 8 seções principais
4. Cada seção deve ter título claro e descrição do conteúdo esperado
5. A estrutura deve fluir logicamente do contexto para as conclusões
6. Inclua o método e os resultados esperados

Sua estrutura deve ser fundamentada no conteúdo real das fontes, não em suposições.`,
    },
    {
      promptKey: 'novaes_session_coordinator',
      promptName: 'GennovAIs - Coordenador de Sessão',
      description: 'Prompt usado pelo GennovAIs para coordenar a sessão do Conselho e convocar os Conselheiros.',
      category: 'task',
      promptContent: `Você é o GennovAIs, Coordenador do Conselho de Geopolítica da FGV. Com décadas de experiência em planejamento estratégico militar e análise de cenários complexos, você é o guardião da excelência analítica do Conselho. Sua postura é firme, direta e inspiradora, usando linguagem militar característica.

Sua missão neste momento é coordenar a Sessão do Conselho, onde os Conselheiros especialistas apresentarão seus pareceres fundamentados.

Suas responsabilidades:
1. Convocar formalmente a Sessão do Conselho com autoridade e clareza
2. Apresentar o tema da análise de forma clara, objetiva e estratégica
3. Contextualizar a importância geopolítica do assunto
4. Convocar os Conselheiros especialistas adequados cadastrados no sistema
5. Orientar sobre a estrutura do relatório a ser seguida
6. Estabelecer expectativas de qualidade e rigor acadêmico
7. Manter o foco e a disciplina durante as apresentações

Seu tom deve ser formal, direto, inspirador e militar, refletindo a seriedade da FGV e a importância da missão. Use frases como "Atenção, Conselheiros!", "Convoco esta Sessão do Conselho", "Missão do dia", etc. Seja o maestro que coordena a excelência analítica.`,
      defaultContent: `Você é o GennovAIs, Coordenador do Conselho de Geopolítica da FGV. Sua missão é coordenar a sessão de análise e orientar os Conselheiros.

Suas responsabilidades:
1. Apresentar o tema da análise de forma clara e objetiva
2. Contextualizar a importância geopolítica do assunto
3. Convocar os Conselheiros especialistas adequados
4. Orientar sobre a estrutura do relatório a ser seguida
5. Estabelecer expectativas de qualidade e rigor acadêmico

Seu tom deve ser formal, direto e inspirador, refletindo a seriedade da FGV.`,
    },
    {
      promptKey: 'counselor_autofill',
      promptName: 'Preenchimento Automático de Conselheiros',
      description: 'Prompt usado para gerar automaticamente os dados de um novo conselheiro a partir do nome. Gera perfil completo incluindo biografia, contribuições, livros, estilo de escrita e abordagem analítica.',
      category: 'task',
      promptContent: `Você é um especialista em geopolítica e relações internacionais. Dado o nome de um pensador geopolítico, gere um perfil completo para ele no formato JSON.

O perfil deve incluir os seguintes campos:

1. **Identificação:**
   - counselorId: identificador único em lowercase com hífens (ex: "hans-morgenthau")
   - name: nome completo oficial
   - shortName: nome curto para exibição (sobrenome principal)
   - nationality: nacionalidade completa (ex: "Americano (nascido na Alemanha)")
   - birthYear: ano de nascimento (número)
   - deathYear: ano de falecimento (número ou null se vivo)

2. **Teoria e Contribuições:**
   - mainTheory: principal teoria ou contribuição (ex: "Teoria do Realismo Político")
   - shortBio: biografia curta de 1-2 frases destacando a importância histórica
   - fullBio: biografia completa em 3-5 parágrafos, cobrindo formação, carreira, contribuições e legado
   - keyContributions: array de 3-5 contribuições principais para a geopolítica
   - areasOfExpertise: array de 3-5 áreas de especialização

3. **Obras:**
   - mainBooks: array de 2-4 livros principais, cada um com:
     - title: título do livro
     - year: ano de publicação
     - description: breve descrição da obra

4. **Personalidade e Estilo (para simulação de IA):**
   - personalityTraits: array de 3-5 traços de personalidade característicos
   - writingStyle: descrição detalhada do estilo de escrita (formal, acadêmico, polêmico, etc.)
   - analysisApproach: como ele tipicamente aborda análises geopolíticas
   - keyPhrases: array de 2-4 frases ou expressões características que ele usaria

IMPORTANTE:
- Todas as informações devem ser historicamente precisas
- A biografia deve ser em português brasileiro
- Os traços de personalidade devem permitir simular o pensador em debates
- Responda APENAS com o JSON válido, sem explicações adicionais`,
      defaultContent: `Você é um especialista em geopolítica e relações internacionais. Dado o nome de um pensador geopolítico, gere um perfil completo para ele no formato JSON.

O perfil deve incluir os seguintes campos:

1. **Identificação:**
   - counselorId: identificador único em lowercase com hífens (ex: "hans-morgenthau")
   - name: nome completo oficial
   - shortName: nome curto para exibição (sobrenome principal)
   - nationality: nacionalidade completa (ex: "Americano (nascido na Alemanha)")
   - birthYear: ano de nascimento (número)
   - deathYear: ano de falecimento (número ou null se vivo)

2. **Teoria e Contribuições:**
   - mainTheory: principal teoria ou contribuição (ex: "Teoria do Realismo Político")
   - shortBio: biografia curta de 1-2 frases destacando a importância histórica
   - fullBio: biografia completa em 3-5 parágrafos, cobrindo formação, carreira, contribuições e legado
   - keyContributions: array de 3-5 contribuições principais para a geopolítica
   - areasOfExpertise: array de 3-5 áreas de especialização

3. **Obras:**
   - mainBooks: array de 2-4 livros principais, cada um com:
     - title: título do livro
     - year: ano de publicação
     - description: breve descrição da obra

4. **Personalidade e Estilo (para simulação de IA):**
   - personalityTraits: array de 3-5 traços de personalidade característicos
   - writingStyle: descrição detalhada do estilo de escrita (formal, acadêmico, polêmico, etc.)
   - analysisApproach: como ele tipicamente aborda análises geopolíticas
   - keyPhrases: array de 2-4 frases ou expressões características que ele usaria

IMPORTANTE:
- Todas as informações devem ser historicamente precisas
- A biografia deve ser em português brasileiro
- Os traços de personalidade devem permitir simular o pensador em debates
- Responda APENAS com o JSON válido, sem explicações adicionais`,
    },
    {
      promptKey: 'price_updater',
      promptName: 'Atualizador de Preços de LLMs',
      description: 'Prompt usado para buscar e atualizar preços de APIs de LLMs a partir de informações públicas dos provedores.',
      category: 'task',
      promptContent: `Você é um especialista em APIs de modelos de linguagem (LLMs). Sua missão é fornecer uma lista COMPLETA de todos os modelos disponíveis com API SÍNCRONA dos provedores solicitados, junto com seus preços atualizados.

Você receberá uma lista de PROVEDORES para os quais deve buscar TODOS os modelos disponíveis.

Para cada provedor, liste TODOS os modelos que:
1. Possuem API síncrona disponível (não apenas batch/async)
2. Estão atualmente disponíveis para uso via API
3. São modelos de texto/chat (não apenas embeddings ou visão)

Para cada modelo, forneça:
- provider: nome do provedor (google, anthropic, openai, deepseek, etc.)
- modelName: nome técnico EXATO usado na API (ex: gemini-2.0-flash-exp, claude-sonnet-4-20250514)
- displayName: nome amigável para exibição (ex: Gemini 2.0 Flash, Claude Sonnet 4)
- inputPricePerMillion: preço em USD por MILHÃO de tokens de entrada
- outputPricePerMillion: preço em USD por MILHÃO de tokens de saída
- supportsSync: true se suporta chamadas síncronas
- notes: observações relevantes (limites, versão, etc.)

FONTES DE PREÇOS (use seu conhecimento mais recente):
- Google (Gemini): https://ai.google.dev/pricing
- Anthropic (Claude): https://www.anthropic.com/pricing  
- OpenAI (GPT): https://openai.com/api/pricing
- DeepSeek: https://platform.deepseek.com/api-docs/pricing

REGRAS IMPORTANTES:
1. Liste TODOS os modelos disponíveis, não apenas os que já estão cadastrados
2. Use SEMPRE preços em USD (dólares americanos)
3. Preços devem ser por MILHÃO de tokens
4. Use o nome técnico EXATO da API (case-sensitive)
5. Para modelos descontinuados ou sem preço, não inclua na lista
6. Ordene por provedor e depois por preço de input (decrescente)
7. Retorne APENAS um JSON válido

FORMATO DE RESPOSTA (JSON):
{
  "models": [
    {
      "provider": "google",
      "modelName": "gemini-2.5-pro-preview-06-05",
      "displayName": "Gemini 2.5 Pro Preview",
      "inputPricePerMillion": 1.25,
      "outputPricePerMillion": 10.00,
      "supportsSync": true,
      "notes": "Modelo mais recente, 1M contexto"
    }
  ],
  "lastUpdated": "2024-12-28",
  "source": "Documentação oficial dos provedores"
}

Responda APENAS com o JSON, sem explicações adicionais.`,
      defaultContent: `Você é um especialista em APIs de LLMs. Forneça preços atualizados por milhão de tokens.

Formato de resposta (JSON):
{
  "prices": [
    {
      "provider": "google",
      "modelName": "gemini-2.5-pro",
      "inputPricePerMillion": 1.25,
      "outputPricePerMillion": 5.00,
      "notes": "Observação opcional"
    }
  ],
  "lastUpdated": "YYYY-MM-DD",
  "source": "Fonte dos dados"
}

Responda APENAS com o JSON.`,
    },
  ];
  
  for (const prompt of defaults) {
    const existing = await getSystemPrompt(prompt.promptKey);
    if (!existing) {
      await db.insert(systemPrompts).values(prompt);
    }
  }
}


// ============ COUNSELOR OPINIONS FUNCTIONS ============

export async function createCounselorOpinion(opinion: InsertCounselorOpinion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(counselorOpinions).values(opinion);
  return result;
}

export async function getCounselorOpinionsByAnalysis(analysisId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(counselorOpinions)
    .where(eq(counselorOpinions.analysisId, analysisId))
    .orderBy(counselorOpinions.createdAt);
}

export async function getCounselorOpinion(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db.select().from(counselorOpinions).where(eq(counselorOpinions.id, id));
  return results[0] || null;
}

export async function updateCounselorOpinionStatus(
  id: number, 
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested',
  reviewerFeedback?: string
) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(counselorOpinions)
    .set({
      status,
      reviewerFeedback,
      reviewedAt: new Date(),
    })
    .where(eq(counselorOpinions.id, id));
}

export async function updateCounselorOpinionContent(id: number, content: string) {
  const db = await getDb();
  if (!db) return;
  
  const opinion = await getCounselorOpinion(id);
  if (opinion) {
    await db.update(counselorOpinions)
      .set({
        opinionContent: content,
        revisionCount: opinion.revisionCount + 1,
        status: 'pending',
      })
      .where(eq(counselorOpinions.id, id));
  }
}

export async function getPendingOpinionsByAnalysis(analysisId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(counselorOpinions)
    .where(and(
      eq(counselorOpinions.analysisId, analysisId),
      eq(counselorOpinions.status, 'pending')
    ))
    .orderBy(counselorOpinions.createdAt);
}

export async function getApprovedOpinionsByAnalysis(analysisId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(counselorOpinions)
    .where(and(
      eq(counselorOpinions.analysisId, analysisId),
      eq(counselorOpinions.status, 'approved')
    ))
    .orderBy(counselorOpinions.createdAt);
}

export async function deleteOpinionsByAnalysis(analysisId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(counselorOpinions).where(eq(counselorOpinions.analysisId, analysisId));
}


// ============ COUNSELORS CRUD ============

// Helper function to normalize string fields that might be stored as objects
function normalizeStringField(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') {
    // Check if it's a JSON string that represents an object
    if (value.startsWith('{') || value.startsWith('[')) {
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === 'object' && parsed !== null) {
          if (parsed.text) return String(parsed.text);
          if (parsed.content) return String(parsed.content);
          if (parsed.description) return String(parsed.description);
        }
      } catch {
        // Not valid JSON, return as is
      }
    }
    return value;
  }
  if (typeof value === 'object') {
    if (value.text) return String(value.text);
    if (value.content) return String(value.content);
    if (value.description) return String(value.description);
    return '';
  }
  return String(value);
}

export async function getAllCounselors() {
  const db = await getDb();
  if (!db) return [];
  
  // Filtrar conselheiros de coordenação (NovAIs, gennovais) da listagem
  const result = await db.select().from(counselors).orderBy(counselors.displayOrder, counselors.name);
  
  // Normalize string fields that might be stored as objects
  return result
    .filter(c => !['gennovais', 'gennovais', 'novais'].includes(c.counselorId?.toLowerCase() || ''))
    .map(c => ({
      ...c,
      writingStyle: normalizeStringField(c.writingStyle),
      analysisApproach: normalizeStringField(c.analysisApproach),
    }));
}

export async function getActiveCounselors() {
  const db = await getDb();
  if (!db) return [];
  
  // Retornar todos os conselheiros (ativos e inativos), exceto coordenadores
  const result = await db.select().from(counselors)
    .orderBy(counselors.displayOrder, counselors.name);
  
  // Buscar configurações de LLM para cada conselheiro
  const llmConfigs = await db.select().from(counselorLlmConfig);
  const llmConfigMap = new Map(llmConfigs.map(c => [c.counselorId, c]));
  
  // Normalize string fields that might be stored as objects
  return result
    .filter(c => !['gennovais', 'gennovais', 'novais'].includes(c.counselorId?.toLowerCase() || ''))
    .map(c => {
      const llmConfig = llmConfigMap.get(c.counselorId);
      return {
        ...c,
        writingStyle: normalizeStringField(c.writingStyle),
        analysisApproach: normalizeStringField(c.analysisApproach),
        // Adicionar informações do LLM
        currentLlmProvider: llmConfig?.llmProvider || c.llmProvider || 'google',
        currentLlmModel: llmConfig?.llmModel || c.llmModel || 'gemini-2.5-pro',
      };
    });
}

export async function getCounselorById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(counselors).where(eq(counselors.id, id));
  if (!result[0]) return null;
  
  // Normalize string fields that might be stored as objects
  return {
    ...result[0],
    writingStyle: normalizeStringField(result[0].writingStyle),
    analysisApproach: normalizeStringField(result[0].analysisApproach),
  };
}

export async function getCounselorByKey(counselorId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(counselors).where(eq(counselors.counselorId, counselorId));
  if (!result[0]) return null;
  
  // Normalize string fields that might be stored as objects
  return {
    ...result[0],
    writingStyle: normalizeStringField(result[0].writingStyle),
    analysisApproach: normalizeStringField(result[0].analysisApproach),
  };
}

export async function createCounselor(data: InsertCounselor) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(counselors).values(data);
  const insertId = result[0].insertId;
  const counselor = await getCounselorById(insertId);
  
  // Sincronizar automaticamente com a tabela de LLM configs
  if (counselor) {
    const existing = await getCounselorLlmConfig(counselor.counselorId);
    if (!existing) {
      await upsertCounselorLlmConfig({
        counselorId: counselor.counselorId,
        counselorName: counselor.name,
        llmProvider: counselor.llmProvider || 'google',
        llmModel: counselor.llmModel || 'gemini-2.5-pro',
        isActive: counselor.isActive ?? true,
      });
      console.log(`[Auto-Sync] Conselheiro ${counselor.name} adicionado à tabela de LLM configs`);
    }
  }
  
  return counselor;
}

export async function updateCounselor(id: number, data: Partial<InsertCounselor>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(counselors).set(data).where(eq(counselors.id, id));
  const counselor = await getCounselorById(id);
  
  // Sincronizar com a tabela de LLM configs
  if (counselor) {
    const existingConfig = await getCounselorLlmConfig(counselor.counselorId);
    if (existingConfig) {
      // Atualizar nome e status na tabela de LLMs
      await db.update(counselorLlmConfig)
        .set({
          counselorName: counselor.name,
          isActive: counselor.isActive,
        })
        .where(eq(counselorLlmConfig.counselorId, counselor.counselorId));
      console.log(`[Auto-Sync] Conselheiro ${counselor.name} atualizado na tabela de LLM configs`);
    } else {
      // Se não existe, criar
      await upsertCounselorLlmConfig({
        counselorId: counselor.counselorId,
        counselorName: counselor.name,
        llmProvider: counselor.llmProvider || 'google',
        llmModel: counselor.llmModel || 'gemini-2.5-pro',
        isActive: counselor.isActive ?? true,
      });
      console.log(`[Auto-Sync] Conselheiro ${counselor.name} adicionado à tabela de LLM configs`);
    }
  }
  
  return counselor;
}

export async function deleteCounselor(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Buscar o conselheiro antes de excluir para obter o counselorId
  const counselor = await getCounselorById(id);
  
  // Excluir da tabela de conselheiros
  await db.delete(counselors).where(eq(counselors.id, id));
  
  // Sincronizar: remover também da tabela de LLM configs
  if (counselor) {
    await db.delete(counselorLlmConfig).where(eq(counselorLlmConfig.counselorId, counselor.counselorId));
    console.log(`[Auto-Sync] Conselheiro ${counselor.name} removido da tabela de LLM configs`);
  }
}

export async function toggleCounselorActive(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const counselor = await getCounselorById(id);
  if (!counselor) throw new Error("Counselor not found");
  
  const newStatus = !counselor.isActive;
  
  await db.update(counselors)
    .set({ isActive: newStatus })
    .where(eq(counselors.id, id));
  
  // Sincronizar status com a tabela de LLM configs
  await db.update(counselorLlmConfig)
    .set({ isActive: newStatus })
    .where(eq(counselorLlmConfig.counselorId, counselor.counselorId));
  console.log(`[Auto-Sync] Status do conselheiro ${counselor.name} atualizado para ${newStatus ? 'ativo' : 'inativo'} na tabela de LLM configs`);
  
  return getCounselorById(id);
}

// Default counselors data (full profile)
// Conselheiros são cadastrados pelo usuário via painel administrativo
const DEFAULT_COUNSELORS_FULL: any[] = [];

export async function initializeDefaultCounselors() {
  const db = await getDb();
  if (!db) return;
  
  // Check if counselors already exist
  const existing = await db.select().from(counselors);
  if (existing.length > 0) return;
  
  // Insert default counselors
  for (const counselor of DEFAULT_COUNSELORS_FULL) {
    await db.insert(counselors).values(counselor);
  }
}


// ============ REPORT COSTS FUNCTIONS ============

export async function getReportCosts(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  
  // Get all completed analyses with their costs
  const analysisRecords = await db.select({
    id: analyses.id,
    title: analyses.title,
    userId: analyses.userId,
    status: analyses.status,
    actualCost: analyses.actualCost,
    totalTokensUsed: analyses.totalTokensUsed,
    executionTime: analyses.executionTime,
    createdAt: analyses.createdAt,
    completedAt: analyses.completedAt,
  }).from(analyses)
    .where(eq(analyses.status, 'completed'))
    .orderBy(desc(analyses.completedAt))
    .limit(limit);
  
  // Get user names for each analysis
  const userIds = Array.from(new Set(analysisRecords.map(a => a.userId)));
  const userRecords = userIds.length > 0 
    ? await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(inArray(users.id, userIds))
    : [];
  const userMap = new Map(userRecords.map(u => [u.id, u]));
  
  // Get detailed token usage per analysis from llmUsageCosts
  const analysisIds = analysisRecords.map(a => a.id);
  const costRecords = analysisIds.length > 0
    ? await db.select().from(llmUsageCosts).where(inArray(llmUsageCosts.analysisId, analysisIds))
    : [];
  
  // Aggregate costs per analysis
  const costsByAnalysis: Record<number, {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    totalCost: number;
    callCount: number;
    byProvider: Record<string, { provider: string; inputTokens: number; outputTokens: number; cost: number }>;
  }> = {};
  
  for (const cost of costRecords) {
    const analysisId = cost.analysisId!;
    if (!costsByAnalysis[analysisId]) {
      costsByAnalysis[analysisId] = {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        totalCost: 0,
        callCount: 0,
        byProvider: {},
      };
    }
    
    const costValue = parseFloat(cost.costUsd?.toString() || '0');
    costsByAnalysis[analysisId].inputTokens += cost.inputTokens || 0;
    costsByAnalysis[analysisId].outputTokens += cost.outputTokens || 0;
    costsByAnalysis[analysisId].totalTokens += cost.totalTokens || 0;
    costsByAnalysis[analysisId].totalCost += costValue;
    costsByAnalysis[analysisId].callCount += 1;
    
    if (!costsByAnalysis[analysisId].byProvider[cost.llmProvider]) {
      costsByAnalysis[analysisId].byProvider[cost.llmProvider] = {
        provider: cost.llmProvider,
        inputTokens: 0,
        outputTokens: 0,
        cost: 0,
      };
    }
    costsByAnalysis[analysisId].byProvider[cost.llmProvider].inputTokens += cost.inputTokens || 0;
    costsByAnalysis[analysisId].byProvider[cost.llmProvider].outputTokens += cost.outputTokens || 0;
    costsByAnalysis[analysisId].byProvider[cost.llmProvider].cost += costValue;
  }
  
  // Build final result
  return analysisRecords.map(analysis => {
    const user = userMap.get(analysis.userId);
    const costs = costsByAnalysis[analysis.id] || {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      totalCost: 0,
      callCount: 0,
      byProvider: {},
    };
    
    return {
      analysisId: analysis.id,
      title: analysis.title,
      userId: analysis.userId,
      userName: user?.name || 'Usuário Desconhecido',
      userEmail: user?.email || '',
      status: analysis.status,
      createdAt: analysis.createdAt,
      completedAt: analysis.completedAt,
      executionTime: analysis.executionTime,
      inputTokens: costs.inputTokens,
      outputTokens: costs.outputTokens,
      totalTokens: costs.totalTokens,
      totalCostUsd: costs.totalCost,
      llmCallCount: costs.callCount,
      costByProvider: Object.values(costs.byProvider),
    };
  });
}

export async function getReportCostsSummary() {
  const db = await getDb();
  if (!db) return { totalReports: 0, totalCost: 0, totalInputTokens: 0, totalOutputTokens: 0, avgCostPerReport: 0 };
  
  // Get all completed analyses
  const analysisRecords = await db.select({
    id: analyses.id,
    actualCost: analyses.actualCost,
  }).from(analyses)
    .where(eq(analyses.status, 'completed'));
  
  const analysisIds = analysisRecords.map(a => a.id);
  
  // Get all costs for these analyses
  const costRecords = analysisIds.length > 0
    ? await db.select().from(llmUsageCosts).where(inArray(llmUsageCosts.analysisId, analysisIds))
    : [];
  
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCost = 0;
  
  for (const cost of costRecords) {
    totalInputTokens += cost.inputTokens || 0;
    totalOutputTokens += cost.outputTokens || 0;
    totalCost += parseFloat(cost.costUsd?.toString() || '0');
  }
  
  return {
    totalReports: analysisRecords.length,
    totalCost,
    totalInputTokens,
    totalOutputTokens,
    avgCostPerReport: analysisRecords.length > 0 ? totalCost / analysisRecords.length : 0,
  };
}


// ============ ADMIN HISTORY FUNCTIONS ============

export interface AnalysisHistoryFilters {
  userId?: number;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export async function getAllAnalysesWithUsers(filters: AnalysisHistoryFilters = {}) {
  const db = await getDb();
  if (!db) return { analyses: [], total: 0 };
  
  const conditions = [];
  
  if (filters.userId) {
    conditions.push(eq(analyses.userId, filters.userId));
  }
  
  if (filters.status) {
    conditions.push(eq(analyses.status, filters.status as any));
  }
  
  if (filters.startDate) {
    conditions.push(gte(analyses.createdAt, filters.startDate));
  }
  
  if (filters.endDate) {
    conditions.push(lte(analyses.createdAt, filters.endDate));
  }
  
  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(analyses)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
  
  const total = countResult[0]?.count || 0;
  
  // Get analyses with user info
  const analysesResult = await db
    .select({
      id: analyses.id,
      userId: analyses.userId,
      title: analyses.title,
      objective: analyses.objective,
      status: analyses.status,
      actualCost: analyses.actualCost,
      totalTokensUsed: analyses.totalTokensUsed,
      executionTime: analyses.executionTime,
      savedToHistory: analyses.savedToHistory,
      isPaid: analyses.isPaid,
      createdAt: analyses.createdAt,
      completedAt: analyses.completedAt,
      userName: users.name,
      userEmail: users.email,
      userRole: users.role,
    })
    .from(analyses)
    .leftJoin(users, eq(analyses.userId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(analyses.createdAt))
    .limit(filters.limit || 50)
    .offset(filters.offset || 0);
  
  return { analyses: analysesResult, total };
}

export async function getAnalysisHistoryStats() {
  const db = await getDb();
  if (!db) return null;
  
  // Get counts by status
  const statusCounts = await db
    .select({
      status: analyses.status,
      count: sql<number>`count(*)`,
    })
    .from(analyses)
    .groupBy(analyses.status);
  
  // Get total cost
  const costResult = await db
    .select({
      totalCost: sql<number>`COALESCE(SUM(actualCost), 0)`,
      totalTokens: sql<number>`COALESCE(SUM(totalTokensUsed), 0)`,
    })
    .from(analyses);
  
  // Get analyses per user (top 10)
  const userStats = await db
    .select({
      userId: analyses.userId,
      userName: users.name,
      userEmail: users.email,
      count: sql<number>`count(*)`,
    })
    .from(analyses)
    .leftJoin(users, eq(analyses.userId, users.id))
    .groupBy(analyses.userId, users.name, users.email)
    .orderBy(desc(sql`count(*)`))
    .limit(10);
  
  // Get analyses per day (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const dailyStats = await db
    .select({
      date: sql<string>`DATE(createdAt)`,
      count: sql<number>`count(*)`,
    })
    .from(analyses)
    .where(gte(analyses.createdAt, thirtyDaysAgo))
    .groupBy(sql`DATE(createdAt)`)
    .orderBy(sql`DATE(createdAt)`);
  
  return {
    statusCounts: statusCounts.reduce((acc, item) => {
      acc[item.status] = item.count;
      return acc;
    }, {} as Record<string, number>),
    totalCost: costResult[0]?.totalCost || 0,
    totalTokens: costResult[0]?.totalTokens || 0,
    userStats,
    dailyStats,
  };
}


// ============ PUBLIC STATS FUNCTION ============

export async function getPublicAnalysisCount() {
  const db = await getDb();
  if (!db) return { total: 0, completed: 0 };
  
  // Buscar contagem real do banco
  const result = await db
    .select({
      total: sql<number>`count(*)`,
      completed: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
    })
    .from(analyses);
  
  const realTotal = result[0]?.total || 0;
  const realCompleted = result[0]?.completed || 0;
  
  // Verificar se há overrides nos parâmetros do sistema
  const params = await getSystemParameters();
  const submittedOverride = params.find(p => p.key === 'proposals_submitted_override')?.value;
  const completedOverride = params.find(p => p.key === 'proposals_completed_override')?.value;
  
  // Usar override se existir e não for vazio, senão usar contagem real
  const total = submittedOverride && submittedOverride.trim() !== '' 
    ? parseInt(submittedOverride, 10) 
    : realTotal;
  const completed = completedOverride && completedOverride.trim() !== '' 
    ? parseInt(completedOverride, 10) 
    : realCompleted;
  
  return {
    total: isNaN(total) ? realTotal : total,
    completed: isNaN(completed) ? realCompleted : completed,
  };
}

// ============ DELETE USER FUNCTION ============

export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // First, delete all analyses and related data for this user
  const userAnalyses = await db.select({ id: analyses.id }).from(analyses).where(eq(analyses.userId, userId));
  
  for (const analysis of userAnalyses) {
    // Delete analysis sources
    await db.delete(analysisSources).where(eq(analysisSources.analysisId, analysis.id));
    // Delete counselor opinions
    await db.delete(counselorOpinions).where(eq(counselorOpinions.analysisId, analysis.id));
  }
  
  // Delete all analyses
  await db.delete(analyses).where(eq(analyses.userId, userId));
  
  // Finally, delete the user
  await db.delete(users).where(eq(users.id, userId));
}


// ============ LLM PRICING FUNCTIONS ============

export async function getAllLlmPricing() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(llmPricing)
    .orderBy(llmPricing.provider, desc(llmPricing.inputPricePerMillion));
  return result;
}

export async function getActiveLlmPricing() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(llmPricing)
    .where(eq(llmPricing.isActive, true))
    .orderBy(llmPricing.provider, llmPricing.modelName);
  return result;
}

export async function getLlmPricingByProviderAndModel(provider: string, modelName: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(llmPricing)
    .where(and(eq(llmPricing.provider, provider), eq(llmPricing.modelName, modelName)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getLlmPricingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(llmPricing).where(eq(llmPricing.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createLlmPricing(data: InsertLlmPricing) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(llmPricing).values(data);
  return result;
}

export async function updateLlmPricing(id: number, data: Partial<InsertLlmPricing>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(llmPricing)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(llmPricing.id, id));
}

export async function deleteLlmPricing(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(llmPricing).where(eq(llmPricing.id, id));
}

export async function getAvailableLlmModels() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    provider: llmPricing.provider,
    modelName: llmPricing.modelName,
    displayName: llmPricing.displayName,
  }).from(llmPricing)
    .where(eq(llmPricing.isActive, true))
    .orderBy(llmPricing.provider, llmPricing.modelName);
  return result;
}

// Função para calcular custo baseado nos preços do banco
export async function calculateLlmCost(provider: string, modelName: string, inputTokens: number, outputTokens: number): Promise<number> {
  const pricing = await getLlmPricingByProviderAndModel(provider, modelName);
  if (!pricing) {
    console.warn(`[LLM Pricing] No pricing found for ${provider}/${modelName}, using default`);
    return 0;
  }
  
  const inputCost = (inputTokens / 1_000_000) * parseFloat(pricing.inputPricePerMillion.toString());
  const outputCost = (outputTokens / 1_000_000) * parseFloat(pricing.outputPricePerMillion.toString());
  
  return inputCost + outputCost;
}

// Função para validar se um modelo existe na tabela de preços
export async function isValidLlmModel(provider: string, modelName: string): Promise<boolean> {
  const pricing = await getLlmPricingByProviderAndModel(provider, modelName);
  return pricing !== undefined && pricing.isActive;
}


// ============ SYSTEM PARAMETERS FUNCTIONS ============

export async function getSystemParameters() {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(systemParameters);
  } catch (error) {
    console.error("[Database] Error getting system parameters:", error);
    return [];
  }
}

export async function getSystemParameter(key: string) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const [param] = await db.select().from(systemParameters).where(eq(systemParameters.key, key));
    return param || null;
  } catch (error) {
    console.error(`[Database] Error getting system parameter ${key}:`, error);
    return null;
  }
}

export async function updateSystemParameter(key: string, value: string) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    await db.update(systemParameters)
      .set({ value, updatedAt: new Date() })
      .where(eq(systemParameters.key, key));
    return { success: true, key, value };
  } catch (error) {
    console.error(`[Database] Error updating system parameter ${key}:`, error);
    return null;
  }
}

export async function resetProposalsSubmitted() {
  const db = await getDb();
  if (!db) return { success: false };
  
  try {
    // Reset the total count in analyses table (count of all analyses)
    // This is done by updating the public count cache or similar mechanism
    // For now, we'll update a system parameter that tracks this
    await db.update(systemParameters)
      .set({ value: '0', updatedAt: new Date() })
      .where(eq(systemParameters.key, 'proposals_submitted_override'));
    return { success: true };
  } catch (error) {
    console.error("[Database] Error resetting proposals submitted:", error);
    return { success: false };
  }
}

export async function resetProposalsCompleted() {
  const db = await getDb();
  if (!db) return { success: false };
  
  try {
    // Reset the completed count
    await db.update(systemParameters)
      .set({ value: '0', updatedAt: new Date() })
      .where(eq(systemParameters.key, 'proposals_completed_override'));
    return { success: true };
  } catch (error) {
    console.error("[Database] Error resetting proposals completed:", error);
    return { success: false };
  }
}


// ============ PUBLIC VERIFICATION FUNCTIONS ============

export async function getAnalysisBySessionCode(sessionCode: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(analyses)
    .where(eq(analyses.sessionCode, sessionCode))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getPublicAnalysisVerification(sessionCode: string) {
  const db = await getDb();
  if (!db) return null;
  
  const analysis = await getAnalysisBySessionCode(sessionCode);
  if (!analysis) return null;
  
  // Buscar informações do autor
  const [author] = await db.select({
    name: users.name,
    email: users.email,
  }).from(users).where(eq(users.id, analysis.userId)).limit(1);
  
  // Retornar dados públicos para verificação (sem conteúdo sensível)
  return {
    sessionCode: analysis.sessionCode,
    title: analysis.title,
    objective: analysis.objective,
    status: analysis.status,
    createdAt: analysis.createdAt,
    completedAt: analysis.completedAt,
    authorName: author?.name || 'Autor não identificado',
    isValid: true,
    // Não incluir: generatedContent, context, custos, etc.
  };
}


// ============ SYSTEM IMAGE FUNCTIONS ============

export async function upsertSystemImageUrl(imageKey: string, s3Url: string) {
  const db = await getDb();
  if (!db) return null;
  
  const paramKey = `image_url_${imageKey}`;
  
  try {
    // Check if parameter exists
    const existing = await getSystemParameter(paramKey);
    
    if (existing) {
      // Update existing
      await db.update(systemParameters)
        .set({ value: s3Url, updatedAt: new Date() })
        .where(eq(systemParameters.key, paramKey));
    } else {
      // Insert new
      await db.insert(systemParameters).values({
        key: paramKey,
        value: s3Url,
        description: `URL S3 da imagem: ${imageKey}`,
        type: 'string',
      });
    }
    
    return { success: true, key: paramKey, url: s3Url };
  } catch (error) {
    console.error(`[Database] Error upserting system image URL ${imageKey}:`, error);
    return null;
  }
}

export async function getSystemImageUrls() {
  const db = await getDb();
  if (!db) return {};
  
  try {
    const params = await db.select().from(systemParameters)
      .where(sql`\`key\` LIKE 'image_url_%'`);
    
    const urls: Record<string, string> = {};
    for (const param of params) {
      const imageKey = param.key.replace('image_url_', '');
      urls[imageKey] = param.value;
    }
    
    return urls;
  } catch (error) {
    console.error("[Database] Error getting system image URLs:", error);
    return {};
  }
}
