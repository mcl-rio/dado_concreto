import { pgTable, pgEnum, serial, text, varchar, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";

// Enums for PostgreSQL
export const userRoleEnum = pgEnum("user_role", ["pesquisador", "diretor", "administrador"]);
export const analysisStatusEnum = pgEnum("analysis_status", ["draft", "processing", "completed", "failed", "timeout", "cancelled"]);
export const sourceTypeEnum = pgEnum("source_type", ["file", "news", "web"]);
export const templateTypeEnum = pgEnum("template_type", ["analysis", "report"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "completed", "failed", "refunded"]);
export const promptCategoryEnum = pgEnum("prompt_category", ["agent", "task", "evaluation"]);
export const opinionStatusEnum = pgEnum("opinion_status", ["pending", "approved", "rejected", "revision_requested"]);
export const parameterTypeEnum = pgEnum("parameter_type", ["number", "boolean", "string"]);

/**
 * Users table - Extended with validity control and analysis quota
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("pesquisador").notNull(),
  validUntil: timestamp("validUntil"),
  isActive: boolean("isActive").default(true).notNull(),
  // Quota system
  analysisQuota: integer("analysisQuota").default(5).notNull(), // Free analyses allowed
  analysisUsed: integer("analysisUsed").default(0).notNull(), // Analyses used
  totalSpent: numeric("totalSpent", { precision: 10, scale: 2 }).default("0.00").notNull(), // Total spent on extra analyses
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Invited users - Pre-registered emails by admin before they sign up
 */
export const invitedUsers = pgTable("invited_users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }).notNull().unique(),
  validUntil: timestamp("validUntil"),
  isActive: boolean("isActive").default(true).notNull(),
  analysisQuota: integer("analysisQuota").default(5).notNull(), // Quota assigned by admin
  role: userRoleEnum("role").default("pesquisador").notNull(), // User type
  invitedBy: integer("invitedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type InvitedUser = typeof invitedUsers.$inferSelect;
export type InsertInvitedUser = typeof invitedUsers.$inferInsert;

/**
 * Analyses - Main analysis records with multi-agent support
 */
export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  sessionCode: varchar("sessionCode", { length: 50 }).unique(), // Código único da sessão (ex: FGV-GEO-2025-0042)
  title: varchar("title", { length: 500 }).notNull(),
  objective: text("objective").notNull(),
  context: text("context"), // Optional context
  status: analysisStatusEnum("status").default("draft").notNull(),
  // Multi-agent fields
  selectedAnalysts: jsonb("selectedAnalysts"), // Array of analyst IDs
  analysisSteps: jsonb("analysisSteps"), // Progress steps with timing
  // Structure fields
  analysisStructure: jsonb("analysisStructure"),
  reportStructure: jsonb("reportStructure"),
  generatedContent: text("generatedContent"),
  // Cost tracking
  estimatedCost: numeric("estimatedCost", { precision: 10, scale: 4 }),
  actualCost: numeric("actualCost", { precision: 10, scale: 4 }),
  totalTokensUsed: integer("totalTokensUsed"),
  executionTime: integer("executionTime"), // in milliseconds
  // History
  savedToHistory: boolean("savedToHistory").default(false).notNull(),
  isPaid: boolean("isPaid").default(false).notNull(), // If user paid for extra analysis
  isArchived: boolean("isArchived").default(false).notNull(), // Archived analyses
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = typeof analyses.$inferInsert;

/**
 * Analysis sources - Files, news, and web sources for each analysis
 */
export const analysisSources = pgTable("analysis_sources", {
  id: serial("id").primaryKey(),
  analysisId: integer("analysisId").notNull(),
  sourceType: sourceTypeEnum("sourceType").notNull(),
  title: varchar("title", { length: 500 }),
  url: text("url"),
  fileKey: varchar("fileKey", { length: 500 }),
  fileName: varchar("fileName", { length: 255 }),
  mimeType: varchar("mimeType", { length: 100 }),
  extractedText: text("extractedText"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalysisSource = typeof analysisSources.$inferSelect;
export type InsertAnalysisSource = typeof analysisSources.$inferInsert;

/**
 * Analysis templates - Saved structure templates for reuse
 */
export const analysisTemplates = pgTable("analysis_templates", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  templateType: templateTypeEnum("templateType").notNull(),
  structure: jsonb("structure").notNull(),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AnalysisTemplate = typeof analysisTemplates.$inferSelect;
export type InsertAnalysisTemplate = typeof analysisTemplates.$inferInsert;

/**
 * Payment records - Track payments for extra analyses
 */
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  analysisId: integer("analysisId"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  transactionId: varchar("transactionId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Counselor LLM Configuration - Configure LLM settings per counselor
 */
export const counselorLlmConfig = pgTable("counselor_llm_config", {
  id: serial("id").primaryKey(),
  counselorId: varchar("counselorId", { length: 50 }).notNull().unique(), // ID único do conselheiro (cadastrado pelo usuário)
  counselorName: varchar("counselorName", { length: 100 }).notNull(),
  llmProvider: varchar("llmProvider", { length: 50 }).notNull().default("gemini"), // openai, anthropic, gemini, deepseek
  llmModel: varchar("llmModel", { length: 100 }).notNull().default("gemini-2.0-flash-exp"), // gpt-4, claude-3, gemini-pro, etc.
  personality: text("personality"), // Personality description for the counselor (used in prompts)
  endpoint: text("endpoint"), // Custom endpoint URL (optional)
  apiKey: text("apiKey"), // Custom API key (optional, encrypted)
  isActive: boolean("isActive").default(true).notNull(),
  displayOrder: integer("displayOrder").default(0).notNull(), // Order for display in admin panel
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CounselorLlmConfig = typeof counselorLlmConfig.$inferSelect;
export type InsertCounselorLlmConfig = typeof counselorLlmConfig.$inferInsert;

/**
 * LLM Usage Costs - Track costs per LLM provider and model
 */
export const llmUsageCosts = pgTable("llm_usage_costs", {
  id: serial("id").primaryKey(),
  analysisId: integer("analysisId"), // Optional, can be null for aggregated records
  userId: integer("userId").notNull(),
  counselorId: varchar("counselorId", { length: 50 }), // Which counselor made the call
  llmProvider: varchar("llmProvider", { length: 50 }).notNull(), // openai, anthropic, gemini, deepseek
  llmModel: varchar("llmModel", { length: 100 }).notNull(),
  inputTokens: integer("inputTokens").default(0).notNull(),
  outputTokens: integer("outputTokens").default(0).notNull(),
  totalTokens: integer("totalTokens").default(0).notNull(),
  costUsd: numeric("costUsd", { precision: 10, scale: 6 }).default("0.000000").notNull(), // Cost in USD
  temperature: numeric("temperature", { precision: 3, scale: 2 }), // Temperature used in the LLM call
  requestType: varchar("requestType", { length: 50 }), // analysis, structure, report, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LlmUsageCost = typeof llmUsageCosts.$inferSelect;
export type InsertLlmUsageCost = typeof llmUsageCosts.$inferInsert;


/**
 * Email Configuration - Admin settings for notification emails
 */
export const emailConfig = pgTable("email_config", {
  id: serial("id").primaryKey(),
  configKey: varchar("configKey", { length: 100 }).notNull().unique(), // e.g., 'admin_email', 'notification_email'
  configValue: text("configValue").notNull(), // Email address or JSON config
  description: varchar("description", { length: 255 }),
  sendEmails: boolean("sendEmails").default(true).notNull(), // Toggle to enable/disable sending
  emailSubject: text("emailSubject"), // Template for email subject
  emailBody: text("emailBody"), // Template for email body (supports HTML)
  senderEmail: varchar("senderEmail", { length: 320 }).default("marlos@marlos.com.br"), // Sender email address
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type EmailConfig = typeof emailConfig.$inferSelect;
export type InsertEmailConfig = typeof emailConfig.$inferInsert;


/**
 * Temperature Configuration - Admin settings for LLM temperature per agent type
 */
export const temperatureConfig = pgTable("temperature_config", {
  id: serial("id").primaryKey(),
  agentType: varchar("agentType", { length: 50 }).notNull().unique(), // counselor, gennovais, editor, default
  temperature: numeric("temperature", { precision: 3, scale: 2 }).notNull(), // 0.00 to 1.00
  description: varchar("description", { length: 255 }),
  updatedBy: integer("updatedBy"), // Admin user who last updated
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type TemperatureConfig = typeof temperatureConfig.$inferSelect;
export type InsertTemperatureConfig = typeof temperatureConfig.$inferInsert;

/**
 * System Prompts - Editable prompts for the multi-agent system
 */
export const systemPrompts = pgTable("system_prompts", {
  id: serial("id").primaryKey(),
  promptKey: varchar("promptKey", { length: 100 }).notNull().unique(), // novaes, editor, counselor_base, structure_generator, etc.
  promptName: varchar("promptName", { length: 255 }).notNull(), // Human-readable name
  description: text("description"), // Description of what this prompt does
  promptContent: text("promptContent").notNull(), // The actual prompt text
  defaultContent: text("defaultContent").notNull(), // Original default content for reset
  category: promptCategoryEnum("category").default("agent").notNull(),
  updatedBy: integer("updatedBy"), // Admin user who last updated
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SystemPrompt = typeof systemPrompts.$inferSelect;
export type InsertSystemPrompt = typeof systemPrompts.$inferInsert;

/**
 * Counselor Opinions - Store individual opinions for manual review
 */
export const counselorOpinions = pgTable("counselor_opinions", {
  id: serial("id").primaryKey(),
  analysisId: integer("analysisId").notNull(),
  counselorId: varchar("counselorId", { length: 50 }).notNull(), // ID do conselheiro
  counselorName: varchar("counselorName", { length: 100 }).notNull(),
  opinionContent: text("opinionContent").notNull(), // The actual opinion text
  status: opinionStatusEnum("status").default("pending").notNull(),
  reviewerFeedback: text("reviewerFeedback"), // Feedback from the reviewer (GennovAIs)
  revisionCount: integer("revisionCount").default(0).notNull(), // Number of revision requests
  tokensUsed: integer("tokensUsed"),
  estimatedCost: numeric("estimatedCost", { precision: 10, scale: 4 }),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CounselorOpinion = typeof counselorOpinions.$inferSelect;
export type InsertCounselorOpinion = typeof counselorOpinions.$inferInsert;


/**
 * Counselors - Full profile data for each counselor
 */
export const counselors = pgTable("counselors", {
  id: serial("id").primaryKey(),
  counselorId: varchar("counselorId", { length: 50 }).notNull().unique(), // ID único do conselheiro
  name: varchar("name", { length: 200 }).notNull(), // Full name
  shortName: varchar("shortName", { length: 100 }), // Short display name
  nationality: varchar("nationality", { length: 100 }), // e.g., "Britânico"
  birthYear: integer("birthYear"), // e.g., 1861
  deathYear: integer("deathYear"), // e.g., 1947 (null if alive)
  photoUrl: text("photoUrl"), // URL to counselor photo (legacy - use homePhotoUrl)
  homePhotoUrl: text("homePhotoUrl"), // Photo displayed on home page gallery
  bioPhotoUrl: text("bioPhotoUrl"), // Photo displayed on biography/profile page
  shortBio: text("shortBio"), // Brief description (1-2 sentences)
  fullBio: text("fullBio"), // Full biography
  mainTheory: varchar("mainTheory", { length: 200 }), // e.g., "Teoria do Heartland"
  keyContributions: jsonb("keyContributions"), // Array of key contributions
  areasOfExpertise: jsonb("areasOfExpertise"), // Array of expertise areas
  mainBooks: jsonb("mainBooks"), // Array of { title, year, description }
  articles: jsonb("articles"), // Array of { title, year, publication }
  otherMaterials: jsonb("otherMaterials"), // Array of { type, title, description, url }
  personalityTraits: jsonb("personalityTraits"), // Array of personality traits
  writingStyle: text("writingStyle"), // Description of writing style
  analysisApproach: text("analysisApproach"), // How they approach analysis
  keyPhrases: jsonb("keyPhrases"), // Array of characteristic phrases
  llmProvider: varchar("llmProvider", { length: 50 }).default("gemini"), // openai, anthropic, gemini
  llmModel: varchar("llmModel", { length: 100 }).default("gemini-2.0-flash-exp"),
  isActive: boolean("isActive").default(true).notNull(),
  unavailabilityText: varchar("unavailabilityText", { length: 100 }), // Custom text for inactive badge (e.g., "EM BREVE", "MANUTENÇÃO")
  isBuiltIn: boolean("isBuiltIn").default(false).notNull(), // System default counselors
  displayOrder: integer("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Counselor = typeof counselors.$inferSelect;
export type InsertCounselor = typeof counselors.$inferInsert;


/**
 * LLM Pricing - Pricing table for LLM models by provider
 * All LLM configurations must reference a valid entry in this table
 */
export const llmPricing = pgTable("llm_pricing", {
  id: serial("id").primaryKey(),
  provider: varchar("provider", { length: 50 }).notNull(), // google, anthropic, openai, deepseek
  modelName: varchar("modelName", { length: 100 }).notNull(), // gemini-2.5-pro, claude-sonnet-4, gpt-4o, etc.
  displayName: varchar("displayName", { length: 150 }), // Human-readable name for UI
  inputPricePerMillion: numeric("inputPricePerMillion", { precision: 10, scale: 6 }).notNull(), // Price per 1M input tokens in USD
  outputPricePerMillion: numeric("outputPricePerMillion", { precision: 10, scale: 6 }).notNull(), // Price per 1M output tokens in USD
  description: text("description"), // Optional description or notes
  isActive: boolean("isActive").default(true).notNull(), // Can be used in configurations
  supportsSync: boolean("supportsSync").default(true).notNull(), // Supports synchronous API calls
  priceUpdatedAt: timestamp("priceUpdatedAt"), // When the price was last updated from provider
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type LlmPricing = typeof llmPricing.$inferSelect;
export type InsertLlmPricing = typeof llmPricing.$inferInsert;

/**
 * System Parameters - Global configuration parameters for the application
 */
export const systemParameters = pgTable("system_parameters", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  type: parameterTypeEnum("type").default("string").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SystemParameter = typeof systemParameters.$inferSelect;
export type InsertSystemParameter = typeof systemParameters.$inferInsert;
