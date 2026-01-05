import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router, diretorProcedure, pesquisadorProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { invokeGemini, generateAnalysisStructure, generateReportStructure, generateFullAnalysis, suggestAnalysisObjectives } from "./services/gemini";
import { searchNewsAPI, searchGDELT, searchAllNews, fetchArticleContent } from "./services/news";
import { processUploadedFile, validateFileType } from "./services/fileProcessor";
import { generateReport, generatePrintableHTML } from "./services/reportGenerator";
import { generateDocx, ReportData } from "./services/docxGenerator";
import { storagePut } from "./storage";
import { notifyOwner } from "./_core/notification";
import { ANALYSTS, runMultiAgentAnalysis, estimateAnalysisCost, callLLM, generateStructureWithReview, evaluateProposalOnly, generateStructureOnly } from "./services/multiAgents";
import { searchWeb, fetchWebContent, searchAndFetchContent } from "./services/webSearch";
// SSE e Council Session removidos - fluxo simplificado sem tempo real

// Admin procedure - only allows admin users (full access)
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'administrador') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito a administradores' });
  }
  return next({ ctx });
});

// Owner procedure - allows owners and admins (limited access)
const ownerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'administrador' && ctx.user.role !== 'diretor') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito a proprietários e administradores' });
  }
  return next({ ctx });
});

// Access-controlled procedure - checks user validity
const accessProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const hasAccess = await db.checkUserAccess(ctx.user.id);
  if (!hasAccess) {
    throw new TRPCError({ 
      code: 'FORBIDDEN', 
      message: 'Seu acesso expirou ou foi desativado. Entre em contato com o administrador.' 
    });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    // Email-based login (no Google OAuth required)
    loginWithEmail: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input, ctx }) => {
        const email = input.email.toLowerCase();

        // ADMIN OVERRIDE: Always allow admin email
        const ADMIN_EMAIL = 'marlos@marlos.com.br';
        let user = await db.getUserByEmail(email);

        if (email === ADMIN_EMAIL && !user) {
          // Create admin user automatically
          await db.upsertUser({
            openId: `email-admin-${Date.now()}`,
            email: ADMIN_EMAIL,
            name: 'Marlos Novaes',
            role: 'administrador',
            isActive: true,
            lastSignedIn: new Date(),
          });
          user = await db.getUserByEmail(email);
        }

        // Check if user exists
        if (user) {
          if (!user.isActive) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'Sua conta foi desativada.' });
          }
          if (user.validUntil && new Date(user.validUntil) < new Date()) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'Seu acesso expirou.' });
          }

          // Create session token
          const sessionToken = await sdk.createSessionToken(user.openId, {
            name: user.name || '',
            expiresInMs: ONE_YEAR_MS,
          });

          // Set cookie
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

          // Update last sign in
          await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });

          return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
        }

        // Check if email is invited (first-time login)
        const invitedUser = await db.getInvitedUserByEmail(email);
        if (invitedUser) {
          if (!invitedUser.isActive) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'Seu convite foi cancelado.' });
          }
          if (invitedUser.validUntil && new Date(invitedUser.validUntil) < new Date()) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'Seu convite expirou.' });
          }

          // Create user from invitation
          const openId = `email-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          await db.upsertUser({
            openId,
            email: invitedUser.email,
            name: invitedUser.name,
            role: invitedUser.role,
            isActive: true,
            analysisQuota: invitedUser.analysisQuota,
            validUntil: invitedUser.validUntil,
            lastSignedIn: new Date(),
          });

          const newUser = await db.getUserByEmail(email);
          if (!newUser) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao criar usuário.' });
          }

          // Create session token
          const sessionToken = await sdk.createSessionToken(newUser.openId, {
            name: newUser.name || '',
            expiresInMs: ONE_YEAR_MS,
          });

          // Set cookie
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

          return { success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } };
        }

        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Email não cadastrado. Solicite acesso à coordenação do Conselho.'
        });
      }),
  }),

  // ============ USER ROUTES ============
  users: router({
    // Validate email for login (replaces Manus auth)
    validateEmail: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const email = input.email.toLowerCase();
        
        // ADMIN OVERRIDE: Always allow marlos@marlos.com.br as admin
        const ADMIN_EMAIL = 'marlos@marlos.com.br';
        if (email === ADMIN_EMAIL) {
          // Check if admin user exists, if not create it
          let adminUser = await db.getUserByEmail(email);
          if (!adminUser) {
            // Create admin user automatically
            await db.upsertUser({
              openId: `admin-${Date.now()}`,
              email: ADMIN_EMAIL,
              name: 'Marlos Novaes',
              role: 'administrador',
              isActive: true,
              lastSignedIn: new Date(),
            });
            adminUser = await db.getUserByEmail(email);
          }
          if (adminUser) {
            return { 
              valid: true, 
              message: 'Acesso autorizado (Administrador)',
              user: {
                id: adminUser.id,
                name: adminUser.name,
                email: adminUser.email,
                role: 'administrador',
                analysisQuota: adminUser.analysisQuota || 999,
                analysisUsed: adminUser.analysisUsed || 0,
              }
            };
          }
        }
        
        // Check if user exists
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
          // Check if user is active
          if (!existingUser.isActive) {
            return { 
              valid: false, 
              message: 'Sua conta foi desativada. Entre em contato com a coordenação.',
              user: null
            };
          }
          // Check validity date
          if (existingUser.validUntil && new Date(existingUser.validUntil) < new Date()) {
            return { 
              valid: false, 
              message: 'Seu acesso expirou. Entre em contato com a coordenação para renovação.',
              user: null
            };
          }
          return { 
            valid: true, 
            message: 'Acesso autorizado',
            user: {
              id: existingUser.id,
              name: existingUser.name,
              email: existingUser.email,
              role: existingUser.role,
              analysisQuota: existingUser.analysisQuota,
              analysisUsed: existingUser.analysisUsed,
            }
          };
        }
        
        // Check if email is invited
        const invitedUser = await db.getInvitedUserByEmail(email);
        if (invitedUser) {
          if (!invitedUser.isActive) {
            return { 
              valid: false, 
              message: 'Seu convite foi cancelado. Entre em contato com a coordenação.',
              user: null
            };
          }
          if (invitedUser.validUntil && new Date(invitedUser.validUntil) < new Date()) {
            return { 
              valid: false, 
              message: 'Seu convite expirou. Solicite um novo convite à coordenação.',
              user: null
            };
          }
          return { 
            valid: true, 
            message: 'Email autorizado. Primeiro acesso detectado.',
            isFirstAccess: true,
            user: null
          };
        }
        
        return { 
          valid: false, 
          message: 'Email não cadastrado. Solicite acesso à coordenação do Conselho.',
          user: null
        };
      }),

    // Get quota info for current user
    getQuotaInfo: accessProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuário não encontrado' });
      }
      return {
        quota: user.analysisQuota || 5,
        used: user.analysisUsed || 0,
        remaining: Math.max(0, (user.analysisQuota || 5) - (user.analysisUsed || 0)),
        totalSpent: parseFloat(user.totalSpent?.toString() || '0'),
      };
    }),
  }),

  // ============ ADMIN ROUTES ============
  admin: router({
    // Get all users (owners and admins can view)
    getUsers: ownerProcedure.query(async () => {
      return db.getAllUsers();
    }),

    // Get all invited users (owners and admins can view)
    getInvitedUsers: ownerProcedure.query(async () => {
      return db.getAllInvitedUsers();
    }),

    // Invite new user by email (owners and admins can invite)
    inviteUser: ownerProcedure
      .input(z.object({
        name: z.string().optional(),
        email: z.string().email(),
        validUntil: z.string().datetime().optional(),
        analysisQuota: z.number().min(0).optional(),
        role: z.enum(['pesquisador', 'diretor', 'administrador']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const existing = await db.getInvitedUserByEmail(input.email);
        if (existing) {
          throw new TRPCError({ code: 'CONFLICT', message: 'Este email já foi convidado' });
        }
        
        await db.createInvitedUser({
          name: input.name || null,
          email: input.email,
          validUntil: input.validUntil ? new Date(input.validUntil) : null,
          analysisQuota: input.analysisQuota ?? 5,
          invitedBy: ctx.user.id,
          role: input.role ?? 'pesquisador',
        });
        
        return { success: true };
      }),

    // Update invited user (owners and admins can update)
    updateInvitedUser: ownerProcedure
      .input(z.object({
        id: z.number(),
        validUntil: z.string().datetime().nullable(),
        isActive: z.boolean(),
        analysisQuota: z.number().min(0).optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updateInvitedUser(input.id, {
          validUntil: input.validUntil ? new Date(input.validUntil) : null,
          isActive: input.isActive,
          analysisQuota: input.analysisQuota,
        });
        return { success: true };
      }),

    // Delete invited user (owners and admins can delete)
    deleteInvitedUser: ownerProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteInvitedUser(input.id);
        return { success: true };
      }),

    // Delete registered user (admins can delete anyone except marlos@marlos.com.br)
    deleteUser: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Prevent self-deletion
        if (ctx.user.id === input.userId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Você não pode deletar sua própria conta' });
        }
        
        // Get the user to be deleted
        const userToDelete = await db.getUserById(input.userId);
        if (!userToDelete) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuário não encontrado' });
        }
        
        // Protect marlos@marlos.com.br from deletion
        if (userToDelete.email?.toLowerCase() === 'marlos@marlos.com.br') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Este usuário não pode ser deletado' });
        }
        
        await db.deleteUser(input.userId);
        return { success: true };
      }),

    // Update user validity, quota, name, email and role (owners and admins can update)
    updateUserAccess: ownerProcedure
      .input(z.object({
        userId: z.number(),
        validUntil: z.string().datetime().nullable(),
        isActive: z.boolean(),
        analysisQuota: z.number().min(0).optional(),
        name: z.string().nullable().optional(),
        email: z.string().email().nullable().optional(),
        role: z.enum(['pesquisador', 'diretor', 'administrador']).optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updateUserValidity(
          input.userId,
          input.validUntil ? new Date(input.validUntil) : null,
          input.isActive,
          input.analysisQuota,
          input.name,
          input.email,
          input.role
        );
        return { success: true };
      }),

    // ============ COUNSELOR LLM CONFIG ROUTES ============
    
    // Get all counselor LLM configs
    getCounselorLlmConfigs: adminProcedure.query(async () => {
      // Initialize default configs if needed
      await db.initializeDefaultCounselorConfigs();
      return db.getAllCounselorLlmConfigs();
    }),
    
    // Get coordinator LLM configs (public - for display during analysis)
    getCoordinatorLlmConfigs: publicProcedure.query(async () => {
      await db.initializeDefaultCounselorConfigs();
      const allConfigs = await db.getAllCounselorLlmConfigs();
      // Retornar apenas GennovAIs e Editor
      return allConfigs.filter(c => ['gennovais', 'editor'].includes(c.counselorId));
    }),

    // Get default agents list with categories
    getDefaultAgents: adminProcedure.query(async () => {
      return db.getDefaultAgents();
    }),

    // Update counselor LLM config
    updateCounselorLlmConfig: adminProcedure
      .input(z.object({
        counselorId: z.string(),
        counselorName: z.string(),
        llmProvider: z.string(),
        llmModel: z.string(),
        endpoint: z.string().nullable().optional(),
        apiKey: z.string().nullable().optional(),
        personality: z.string().nullable().optional(),
        isActive: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        // Validar se o modelo existe na tabela de preços
        const isValidModel = await db.isValidLlmModel(input.llmProvider, input.llmModel);
        if (!isValidModel) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Modelo "${input.llmModel}" não está cadastrado na tabela de preços para o provedor "${input.llmProvider}". Cadastre o modelo primeiro em Configurações → Preços LLM.`,
          });
        }
        
        await db.upsertCounselorLlmConfig({
          counselorId: input.counselorId,
          counselorName: input.counselorName,
          llmProvider: input.llmProvider,
          llmModel: input.llmModel,
          endpoint: input.endpoint ?? null,
          apiKey: input.apiKey ?? null,
          personality: input.personality ?? null,
          isActive: input.isActive,
        });
        return { success: true };
      }),

    // Update counselor personality only
    updateCounselorPersonality: adminProcedure
      .input(z.object({
        counselorId: z.string(),
        personality: z.string().nullable(),
      }))
      .mutation(async ({ input }) => {
        await db.updateCounselorPersonality(input.counselorId, input.personality);
        return { success: true };
      }),

    // Reorder counselor LLM configs
    reorderCounselorLlmConfigs: adminProcedure
      .input(z.array(z.object({
        counselorId: z.string(),
        displayOrder: z.number(),
      })))
      .mutation(async ({ input }) => {
        return db.reorderCounselorLlmConfigs(input);
      }),

    // Bulk update all counselors to same LLM
    bulkUpdateCounselorLlm: adminProcedure
      .input(z.object({
        llmProvider: z.string(),
        llmModel: z.string(),
        endpoint: z.string().nullable().optional(),
        apiKey: z.string().nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        // Validar se o modelo existe na tabela de preços
        const isValidModel = await db.isValidLlmModel(input.llmProvider, input.llmModel);
        if (!isValidModel) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Modelo "${input.llmModel}" não está cadastrado na tabela de preços para o provedor "${input.llmProvider}". Cadastre o modelo primeiro em Configurações → Preços LLM.`,
          });
        }
        
        const configs = await db.getAllCounselorLlmConfigs();
        for (const config of configs) {
          await db.upsertCounselorLlmConfig({
            counselorId: config.counselorId,
            counselorName: config.counselorName,
            llmProvider: input.llmProvider,
            llmModel: input.llmModel,
            endpoint: input.endpoint ?? null,
            apiKey: input.apiKey ?? null,
            isActive: config.isActive,
          });
        }
        return { success: true };
      }),

    // Force sync all counselors with LLM configs (manual trigger)
    forceSyncCounselors: adminProcedure.mutation(async () => {
      const result = await db.forceSyncAllCounselors();
      return {
        success: true,
        counselorsCount: result.counselorsCount,
        llmConfigsCount: result.llmConfigsCount,
        added: result.syncResult.added,
        updated: result.syncResult.updated,
        removed: result.syncResult.removed,
        errors: result.syncResult.errors,
      };
    }),

    // ============ LLM USAGE COSTS ROUTES ============
    
    // Get LLM usage summary
    getLlmUsageSummary: adminProcedure.query(async () => {
      return db.getLlmUsageSummary();
    }),

    // Get LLM usage costs by provider
    getLlmCostsByProvider: adminProcedure.query(async () => {
      return db.getLlmUsageCostsByProvider();
    }),

    // Get LLM usage costs by period
    getLlmCostsByPeriod: adminProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ input }) => {
        return db.getLlmUsageCostsByPeriod(
          new Date(input.startDate),
          new Date(input.endDate)
        );
      }),

    // Get recent LLM usage
    getRecentLlmUsage: adminProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getRecentLlmUsage(input?.limit ?? 50);
      }),

    // ============ REPORT COSTS ROUTES ============
    
    // Get costs per report (analysis)
    getReportCosts: adminProcedure
      .input(z.object({
        limit: z.number().min(1).max(500).optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getReportCosts(input?.limit ?? 100);
      }),

    // Get report costs summary
    getReportCostsSummary: adminProcedure.query(async () => {
      return db.getReportCostsSummary();
    }),

    // ============ EMAIL CONFIG ROUTES ============
    
    // Get all email configs
    getEmailConfigs: adminProcedure.query(async () => {
      await db.initializeDefaultEmailConfigs();
      return db.getEmailConfigs();
    }),

    // Update email config
    updateEmailConfig: adminProcedure
      .input(z.object({
        configKey: z.string(),
        configValue: z.string(),
        description: z.string().optional(),
        sendEmails: z.boolean(),
        emailSubject: z.string().optional(),
        emailBody: z.string().optional(),
        senderEmail: z.string().email().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.upsertEmailConfig({
          configKey: input.configKey,
          configValue: input.configValue,
          description: input.description,
          sendEmails: input.sendEmails,
          emailSubject: input.emailSubject,
          emailBody: input.emailBody,
          senderEmail: input.senderEmail || 'marlos@marlos.com.br',
        });
        return { success: true };
      }),

    // Toggle email sending for a config
    toggleEmailSending: adminProcedure
      .input(z.object({
        configKey: z.string(),
        sendEmails: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        await db.updateEmailConfigSendStatus(input.configKey, input.sendEmails);
        return { success: true };
      }),

    // Add new email config
    addEmailConfig: adminProcedure
      .input(z.object({
        configKey: z.string(),
        configValue: z.string(),
        description: z.string().optional(),
        sendEmails: z.boolean().default(true),
        emailSubject: z.string().optional(),
        emailBody: z.string().optional(),
        senderEmail: z.string().email().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.upsertEmailConfig({
          ...input,
          senderEmail: input.senderEmail || 'marlos@marlos.com.br',
        });
        return { success: true };
      }),

    // Delete email config
    deleteEmailConfig: adminProcedure
      .input(z.object({
        configKey: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.deleteEmailConfig(input.configKey);
        return { success: true };
      }),

    // ============ TEMPERATURE CONFIG ============
    
    // Get all temperature configs
    getTemperatureConfigs: adminProcedure.query(async () => {
      await db.initializeDefaultTemperatureConfigs();
      return db.getTemperatureConfigs();
    }),

    // Update temperature config
    updateTemperatureConfig: adminProcedure
      .input(z.object({
        agentType: z.string(),
        temperature: z.number().min(0).max(1),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.upsertTemperatureConfig({
          agentType: input.agentType,
          temperature: input.temperature.toFixed(2),
          description: input.description,
          updatedBy: ctx.user.id,
        });
        return { success: true };
      }),

    // Bulk update all temperatures
    bulkUpdateTemperatures: adminProcedure
      .input(z.object({
        counselor: z.number().min(0).max(1),
        gennovais: z.number().min(0).max(1),
        editor: z.number().min(0).max(1),
        default: z.number().min(0).max(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const configs = [
          { agentType: 'counselor', temperature: input.counselor.toFixed(2), description: 'Alta criatividade para análises diversificadas dos conselheiros' },
          { agentType: 'gennovais', temperature: input.gennovais.toFixed(2), description: 'Equilíbrio entre criatividade e estrutura para coordenação' },
          { agentType: 'editor', temperature: input.editor.toFixed(2), description: 'Alta precisão para revisão final consistente' },
          { agentType: 'default', temperature: input.default.toFixed(2), description: 'Temperatura padrão para chamadas não categorizadas' },
        ];
        
        for (const config of configs) {
          await db.upsertTemperatureConfig({
            ...config,
            updatedBy: ctx.user.id,
          });
        }
        return { success: true };
      }),

    // Reset temperatures to defaults
    resetTemperatures: adminProcedure.mutation(async ({ ctx }) => {
      const defaults = [
        { agentType: 'counselor', temperature: '0.85', description: 'Alta criatividade para análises diversificadas dos conselheiros' },
        { agentType: 'gennovais', temperature: '0.60', description: 'Equilíbrio entre criatividade e estrutura para coordenação' },
        { agentType: 'editor', temperature: '0.30', description: 'Alta precisão para revisão final consistente' },
        { agentType: 'default', temperature: '0.70', description: 'Temperatura padrão para chamadas não categorizadas' },
      ];
      
      for (const config of defaults) {
        await db.upsertTemperatureConfig({
          ...config,
          updatedBy: ctx.user.id,
        });
      }
      return { success: true };
    }),

    // ============ SYSTEM PROMPTS ROUTES ============
    
    // Get all system prompts
    getSystemPrompts: adminProcedure.query(async () => {
      await db.initializeDefaultSystemPrompts();
      return db.getSystemPrompts();
    }),

    // Get single system prompt
    getSystemPrompt: adminProcedure
      .input(z.object({ promptKey: z.string() }))
      .query(async ({ input }) => {
        return db.getSystemPrompt(input.promptKey);
      }),

    // Update system prompt content
    updateSystemPrompt: adminProcedure
      .input(z.object({
        promptKey: z.string(),
        promptContent: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateSystemPromptContent(input.promptKey, input.promptContent, ctx.user.id);
        return { success: true };
      }),

    // Reset system prompt to default
    resetSystemPrompt: adminProcedure
      .input(z.object({ promptKey: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db.resetSystemPromptToDefault(input.promptKey, ctx.user.id);
        return { success: true };
      }),

    // Reset all system prompts to defaults
    resetAllSystemPrompts: adminProcedure.mutation(async ({ ctx }) => {
      const prompts = await db.getSystemPrompts();
      for (const prompt of prompts) {
        await db.resetSystemPromptToDefault(prompt.promptKey, ctx.user.id);
      }
      return { success: true };
    }),

    // Create new system prompt
    createSystemPrompt: adminProcedure
      .input(z.object({
        promptKey: z.string().min(1),
        promptName: z.string().min(1),
        description: z.string().optional(),
        promptContent: z.string().min(1),
        category: z.enum(['agent', 'task', 'evaluation']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertSystemPrompt({
          promptKey: input.promptKey,
          promptName: input.promptName,
          description: input.description || '',
          promptContent: input.promptContent,
          defaultContent: input.promptContent,
          category: input.category || 'agent',
          updatedBy: ctx.user.id,
        });
        return { success: true };
      }),

    // Delete system prompt
    deleteSystemPrompt: adminProcedure
      .input(z.object({ promptKey: z.string() }))
      .mutation(async ({ input }) => {
        await db.deleteSystemPrompt(input.promptKey);
        return { success: true };
      }),

    // ============ LLM PRICING ROUTES ============
    
    // Get all LLM pricing
    getLlmPricing: adminProcedure.query(async () => {
      return db.getAllLlmPricing();
    }),

    // Get active LLM pricing (for dropdowns)
    getActiveLlmPricing: adminProcedure.query(async () => {
      return db.getActiveLlmPricing();
    }),

    // Get available LLM models (provider + model + displayName)
    getAvailableLlmModels: adminProcedure.query(async () => {
      return db.getAvailableLlmModels();
    }),

    // Create LLM pricing
    createLlmPricing: adminProcedure
      .input(z.object({
        provider: z.string().min(1),
        modelName: z.string().min(1),
        displayName: z.string().optional(),
        inputPricePerMillion: z.string(),
        outputPricePerMillion: z.string(),
        description: z.string().optional(),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        await db.createLlmPricing(input);
        return { success: true };
      }),

    // Update LLM pricing
    updateLlmPricing: adminProcedure
      .input(z.object({
        id: z.number(),
        provider: z.string().min(1).optional(),
        modelName: z.string().min(1).optional(),
        displayName: z.string().nullable().optional(),
        inputPricePerMillion: z.string().optional(),
        outputPricePerMillion: z.string().optional(),
        description: z.string().nullable().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateLlmPricing(id, data);
        return { success: true };
      }),

    // Delete LLM pricing
    deleteLlmPricing: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteLlmPricing(input.id);
        return { success: true };
      }),

    // Validate if LLM model exists in pricing table
    validateLlmModel: adminProcedure
      .input(z.object({
        provider: z.string(),
        modelName: z.string(),
      }))
      .query(async ({ input }) => {
        const isValid = await db.isValidLlmModel(input.provider, input.modelName);
        return { isValid };
      }),

    // Update LLM prices via AI - busca todos os modelos disponíveis dos provedores cadastrados
    updateLlmPricesViaAI: adminProcedure
      .mutation(async ({ ctx }) => {
        // Buscar todos os modelos cadastrados para obter a lista de provedores
        const allPricing = await db.getAllLlmPricing();
        
        // Extrair provedores únicos
        const providers = Array.from(new Set(allPricing.map(p => p.provider)));
        if (providers.length === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Nenhum provedor cadastrado. Adicione pelo menos um modelo primeiro.' });
        }

        // Buscar o prompt do price_updater
        const systemPromptData = await db.getSystemPrompt('price_updater');
        if (!systemPromptData) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Prompt do price_updater não encontrado' });
        }

        // Buscar configuração do LLM para price_updater
        const llmConfig = await db.getCounselorLlmConfig('price_updater');
        const llmProvider = llmConfig?.llmProvider || 'gemini';

        // Preparar lista de modelos cadastrados para atualização
        const existingModels = allPricing.map(p => ({
          provider: p.provider,
          modelName: p.modelName,
          displayName: p.displayName
        }));
        
        // Preparar prompt pedindo atualização dos modelos existentes E novos modelos
        const userPrompt = `Por favor, atualize os preços dos modelos de LLM listados abaixo E adicione novos modelos disponíveis.

PROVEDORES: ${providers.join(', ')}

MODELOS JÁ CADASTRADOS (use EXATAMENTE o mesmo modelName para atualizar):
${JSON.stringify(existingModels, null, 2)}

INSTRUÇÕES:
1. Para cada modelo já cadastrado, retorne com o MESMO modelName exato e os preços atualizados
2. Adicione também NOVOS modelos que não estão na lista acima
3. Use o nome técnico EXATO da API (case-sensitive) no campo modelName
4. Ordene por provedor e depois por preço de input (decrescente)

Retorne no formato JSON especificado no prompt de sistema.`;

        try {
          // Chamar o LLM
          const result = await callLLM(
            llmProvider as 'gemini' | 'google' | 'claude' | 'anthropic',
            userPrompt,
            systemPromptData.promptContent,
            {
              userId: ctx.user.id,
              counselorId: 'price_updater',
              requestType: 'price_update',
            }
          );

          // Extrair JSON da resposta
          let modelsData;
          try {
            const jsonMatch = result.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              modelsData = JSON.parse(jsonMatch[0]);
            } else {
              throw new Error('JSON não encontrado na resposta');
            }
          } catch (parseError) {
            throw new TRPCError({ 
              code: 'INTERNAL_SERVER_ERROR', 
              message: `Erro ao processar resposta do LLM: ${parseError}` 
            });
          }

          const now = new Date();
          const updates: { action: 'created' | 'updated'; provider: string; modelName: string; displayName: string; inputPrice: string; outputPrice: string }[] = [];
          
          // Função para encontrar modelo existente pelo nome técnico exato (modelName)
          const findExistingModel = (provider: string, modelName: string) => {
            // Busca exata pelo nome técnico (case-insensitive para provider)
            return allPricing.find(p => 
              p.provider.toLowerCase() === provider.toLowerCase() && 
              p.modelName === modelName
            );
          };
          
          // Processar modelos retornados (suporta tanto "models" quanto "prices" para compatibilidade)
          const models = modelsData.models || modelsData.prices || [];
          
          for (const model of models) {
            if (model.inputPricePerMillion > 0 && model.outputPricePerMillion > 0) {
              // Verificar se o modelo já existe (com correspondência flexível)
              const existing = findExistingModel(model.provider, model.modelName);
              
              if (existing) {
                // Atualizar modelo existente
                await db.updateLlmPricing(existing.id, {
                  inputPricePerMillion: model.inputPricePerMillion.toString(),
                  outputPricePerMillion: model.outputPricePerMillion.toString(),
                  displayName: model.displayName || existing.displayName,
                  description: model.notes || existing.description,
                  priceUpdatedAt: now,
                });
                updates.push({
                  action: 'updated',
                  provider: model.provider,
                  modelName: model.modelName,
                  displayName: model.displayName || existing.displayName || model.modelName,
                  inputPrice: model.inputPricePerMillion.toString(),
                  outputPrice: model.outputPricePerMillion.toString(),
                });
              } else {
                // Criar novo modelo
                await db.createLlmPricing({
                  provider: model.provider,
                  modelName: model.modelName,
                  displayName: model.displayName || model.modelName,
                  inputPricePerMillion: model.inputPricePerMillion.toString(),
                  outputPricePerMillion: model.outputPricePerMillion.toString(),
                  description: model.notes || null,
                  isActive: true,
                  priceUpdatedAt: now,
                });
                updates.push({
                  action: 'created',
                  provider: model.provider,
                  modelName: model.modelName,
                  displayName: model.displayName || model.modelName,
                  inputPrice: model.inputPricePerMillion.toString(),
                  outputPrice: model.outputPricePerMillion.toString(),
                });
              }
            }
          }

          const createdCount = updates.filter(u => u.action === 'created').length;
          const updatedCount = updates.filter(u => u.action === 'updated').length;

          return {
            success: true,
            createdCount,
            updatedCount,
            totalCount: updates.length,
            updates,
            providers,
            source: modelsData.source || 'LLM',
            lastUpdated: modelsData.lastUpdated || now.toISOString().split('T')[0],
            tokensUsed: result.tokens,
            cost: result.cost,
          };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: `Erro ao atualizar preços: ${error}` 
          });
        }
      }),

    // ============ ANALYSIS HISTORY ROUTES ============
    
    // Get all analyses with user info (for history tab)
    getAnalysisHistory: adminProcedure
      .input(z.object({
        userId: z.number().optional(),
        status: z.string().optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getAllAnalysesWithUsers({
          userId: input?.userId,
          status: input?.status,
          startDate: input?.startDate ? new Date(input.startDate) : undefined,
          endDate: input?.endDate ? new Date(input.endDate) : undefined,
          limit: input?.limit ?? 50,
          offset: input?.offset ?? 0,
        });
      }),

    // Get analysis history statistics
    getAnalysisHistoryStats: adminProcedure.query(async () => {
      return db.getAnalysisHistoryStats();
    }),

    // Delete analysis (admin only - can delete any analysis)
    deleteAnalysisAdmin: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAnalysis(input.id);
        return { success: true };
      }),

    // Delete multiple analyses (admin only - can delete any analyses)
    deleteMultipleAnalysesAdmin: adminProcedure
      .input(z.object({ ids: z.array(z.number()) }))
      .mutation(async ({ input }) => {
        let deletedCount = 0;
        for (const id of input.ids) {
          await db.deleteAnalysis(id);
          deletedCount++;
        }
        return { success: true, deletedCount };
      }),

    // Get public analysis count (for social proof on home page)
    getPublicCount: publicProcedure.query(async () => {
      return db.getPublicAnalysisCount();
    }),

    // ============ SYSTEM PARAMETERS ============
    // Get all system parameters (admin only)
    getSystemParameters: adminProcedure.query(async () => {
      return db.getSystemParameters();
    }),

    // Get public system parameters (for frontend use - globe, stamp, etc.)
    getPublicParameters: publicProcedure.query(async () => {
      const params = await db.getSystemParameters();
      // Return only the parameters needed for the frontend
      const publicKeys = ['globe_rotation_speed', 'globe_opacity', 'globe_intensity', 'globe_size', 'globe_center_x', 'globe_center_y', 'logo_height', 'logo_position_x', 'logo_position_y', 'title_font_size', 'stamp_size', 'stamp_sound_enabled', 'carousel_image_size', 'carousel_speed', 'hero_left_offset_x', 'hero_left_offset_y'];
      return params.filter(p => publicKeys.includes(p.key));
    }),

    // Get system image URLs (stamps, coordinators) from S3
    getSystemImageUrls: publicProcedure.query(async () => {
      return db.getSystemImageUrls();
    }),

    // Update a system parameter
    updateSystemParameter: adminProcedure
      .input(z.object({
        key: z.string(),
        value: z.string(),
      }))
      .mutation(async ({ input }) => {
        return db.updateSystemParameter(input.key, input.value);
      }),

    // Reset proposals submitted count
    resetProposalsSubmitted: adminProcedure.mutation(async () => {
      return db.resetProposalsSubmitted();
    }),

    // Reset proposals completed count
    resetProposalsCompleted: adminProcedure.mutation(async () => {
      return db.resetProposalsCompleted();
    }),

    // Upload system image (stamps, coordinators)
    uploadSystemImage: adminProcedure
      .input(z.object({
        imageKey: z.string(),
        fileName: z.string(),
        mimeType: z.string(),
        base64Content: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { imageKey, fileName, mimeType, base64Content } = input;
        
        // Validate image type
        if (!mimeType.startsWith('image/')) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tipo de arquivo inválido. Use uma imagem.' });
        }
        
        // Determine destination path based on imageKey
        let destPath: string;
        if (imageKey.startsWith('stamp_')) {
          const stampType = imageKey.replace('stamp_', '');
          const stampMap: Record<string, string> = {
            'approved': 'aprovada',
            'review': 'revisar',
            'rejected': 'rejeitada',
          };
          destPath = `stamps/${stampMap[stampType] || stampType}.png`;
        } else if (imageKey.startsWith('coordinator_')) {
          const coordName = imageKey.replace('coordinator_', '');
          const ext = mimeType.split('/')[1] || 'png';
          destPath = `coordinators/${coordName}.${ext === 'jpeg' ? 'jpg' : ext}`;
        } else {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Chave de imagem inválida' });
        }
        
        try {
          const buffer = Buffer.from(base64Content, 'base64');
          
          // Add timestamp to S3 path to avoid CDN cache issues
          const timestamp = Date.now();
          const s3Path = `system-images/${destPath.replace(/\.(png|jpg|jpeg|gif|webp)$/i, `-${timestamp}.$1`)}`;
          
          // Upload to S3 with unique path
          const { url } = await storagePut(
            s3Path,
            buffer,
            mimeType
          );
          
          // Also save locally for immediate use
          const fs = await import('fs/promises');
          const path = await import('path');
          const localPath = path.join(process.cwd(), 'client', 'public', destPath);
          
          // Ensure directory exists
          await fs.mkdir(path.dirname(localPath), { recursive: true });
          await fs.writeFile(localPath, buffer);
          
          console.log(`[Upload] System image saved: ${destPath}`);
          
          // Save S3 URL to database for dynamic retrieval
          await db.upsertSystemImageUrl(input.imageKey, url);
          console.log(`[Upload] S3 URL saved to database: ${input.imageKey} -> ${url}`);
          
          return { 
            success: true, 
            path: `/${destPath}`,
            s3Url: url,
          };
        } catch (error) {
          console.error(`[Upload] Error saving system image:`, error);
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: `Erro ao salvar imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
          });
        }
      }),
  }),

  // ============ ANALYSTS ROUTES ============
  analysts: router({
    // Get all available analysts
    list: publicProcedure.query(() => {
      return ANALYSTS.map(a => ({
        id: a.id,
        name: a.name,
        fullName: a.fullName,
        nationality: a.nationality,
        era: a.era,
        specialty: a.specialty,
        keyTheory: a.keyTheory,
        perspective: a.perspective,
      }));
    }),

    // Estimate cost for analysis
    estimateCost: publicProcedure
      .input(z.object({
        analystIds: z.array(z.string()),
      }))
      .query(({ input }) => {
        const cost = estimateAnalysisCost(input.analystIds);
        return { estimatedCost: cost };
      }),
  }),

  // ============ ANALYSIS ROUTES ============
  analysis: router({
    // Create new analysis with multi-agent support
    create: accessProcedure
      .input(z.object({
        title: z.string().min(1),
        objective: z.string().min(1),
        context: z.string().optional(),
        selectedAnalysts: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createAnalysis({
          userId: ctx.user.id,
          title: input.title,
          objective: input.objective,
          context: input.context,
          selectedAnalysts: input.selectedAnalysts,
          status: 'draft',
        });
        
        // Buscar a análise recém-criada para obter o sessionCode
        const analysis = await db.getAnalysisById(id);
        return { id, sessionCode: analysis?.sessionCode };
      }),

    // Get user's analyses
    list: accessProcedure
      .input(z.object({ savedOnly: z.boolean().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getAnalysesByUserId(ctx.user.id, input?.savedOnly);
      }),

    // Get single analysis
    get: accessProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const analysis = await db.getAnalysisById(input.id);
        if (!analysis || analysis.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Análise não encontrada' });
        }
        const sources = await db.getSourcesByAnalysisId(input.id);
        return { ...analysis, sources };
      }),

    // Update analysis
    update: accessProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        objective: z.string().optional(),
        context: z.string().optional(),
        selectedAnalysts: z.array(z.string()).optional(),
        analysisStructure: z.any().optional(),
        reportStructure: z.any().optional(),
        generatedContent: z.string().optional(),
        savedToHistory: z.boolean().optional(),
        status: z.enum(['draft', 'processing', 'completed', 'failed']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const analysis = await db.getAnalysisById(input.id);
        if (!analysis || analysis.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Análise não encontrada' });
        }
        
        const { id, ...updateData } = input;
        await db.updateAnalysis(id, updateData);
        return { success: true };
      }),

    // Delete analysis
    delete: accessProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const analysis = await db.getAnalysisById(input.id);
        if (!analysis || analysis.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Análise não encontrada' });
        }
        await db.deleteAnalysis(input.id);
        return { success: true };
      }),

    // Delete multiple analyses
    deleteMany: accessProcedure
      .input(z.object({ ids: z.array(z.number()) }))
      .mutation(async ({ ctx, input }) => {
        let deletedCount = 0;
        for (const id of input.ids) {
          const analysis = await db.getAnalysisById(id);
          if (analysis && analysis.userId === ctx.user.id) {
            await db.deleteAnalysis(id);
            deletedCount++;
          }
        }
        return { success: true, deletedCount };
      }),

    // Archive analysis
    archive: accessProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const analysis = await db.getAnalysisById(input.id);
        if (!analysis || analysis.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Análise não encontrada' });
        }
        await db.archiveAnalysis(input.id);
        return { success: true };
      }),

    // Archive multiple analyses
    archiveMany: accessProcedure
      .input(z.object({ ids: z.array(z.number()) }))
      .mutation(async ({ ctx, input }) => {
        let archivedCount = 0;
        for (const id of input.ids) {
          const analysis = await db.getAnalysisById(id);
          if (analysis && analysis.userId === ctx.user.id) {
            await db.archiveAnalysis(id);
            archivedCount++;
          }
        }
        return { success: true, archivedCount };
      }),

    // List archived analyses
    listArchived: accessProcedure
      .query(async ({ ctx }) => {
        return db.getArchivedAnalysesByUserId(ctx.user.id);
      }),

    // Restore analysis from archive
    restore: accessProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const analysis = await db.getAnalysisById(input.id);
        if (!analysis || analysis.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Análise não encontrada' });
        }
        await db.restoreAnalysis(input.id);
        return { success: true };
      }),

    // Restore multiple analyses
    restoreMany: accessProcedure
      .input(z.object({ ids: z.array(z.number()) }))
      .mutation(async ({ ctx, input }) => {
        let restoredCount = 0;
        for (const id of input.ids) {
          const analysis = await db.getAnalysisById(id);
          if (analysis && analysis.userId === ctx.user.id) {
            await db.restoreAnalysis(id);
            restoredCount++;
          }
        }
        return { success: true, restoredCount };
      }),

    // Add source to analysis
    addSource: accessProcedure
      .input(z.object({
        analysisId: z.number(),
        sourceType: z.enum(['file', 'news', 'web']),
        title: z.string().optional(),
        url: z.string().optional(),
        content: z.string().optional(),
        metadata: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const analysis = await db.getAnalysisById(input.analysisId);
        if (!analysis || analysis.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Análise não encontrada' });
        }
        
        const id = await db.addAnalysisSource({
          analysisId: input.analysisId,
          sourceType: input.sourceType,
          title: input.title,
          url: input.url,
          extractedText: input.content,
          metadata: input.metadata,
        });
        
        return { id };
      }),

    // Remove source from analysis
    removeSource: accessProcedure
      .input(z.object({ sourceId: z.number(), analysisId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const analysis = await db.getAnalysisById(input.analysisId);
        if (!analysis || analysis.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Análise não encontrada' });
        }
        await db.deleteAnalysisSource(input.sourceId);
        return { success: true };
      }),

    // Execute multi-agent analysis
    executeMultiAgent: accessProcedure
      .input(z.object({
        analysisId: z.number(),
        sources: z.array(z.string()).optional(),
        useWebSearch: z.boolean().optional(),
        useCounselorKnowledge: z.boolean().optional(),
        structure: z.string().optional(), // Estrutura aprovada do Passo 3 (JSON stringificado ou texto)
      }))
      .mutation(async ({ ctx, input }) => {
        const analysis = await db.getAnalysisById(input.analysisId);
        if (!analysis || analysis.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Análise não encontrada' });
        }

        // Check and update quota
        const user = await db.getUserById(ctx.user.id);
        if (!user) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuário não encontrado' });
        }

        const quota = user.analysisQuota || 5;
        const used = user.analysisUsed || 0;
        const isPaid = used >= quota;

        // Update analysis status
        await db.updateAnalysis(input.analysisId, { 
          status: 'processing',
          isPaid,
        });

        // Preparar dados para execução em background
        const selectedAnalysts = (analysis.selectedAnalysts as string[]) || [];
        const dbSources = await db.getSourcesByAnalysisId(input.analysisId);
        const allSources = [
          ...dbSources.map(s => s.extractedText || s.title || ''),
          ...(input.sources || [])
        ].filter(Boolean);

        // Executar análise em background (não aguardar)
        // Isso evita timeout na requisição HTTP
        const executeInBackground = async () => {
          const startTime = Date.now();
          const analysisIdForTimeout = input.analysisId;
          
          // Timeout tracking removido - fluxo simplificado
          
          try {
            console.log(`[Background] Iniciando análise ${input.analysisId} em background...`);
            
            // Obter estrutura aprovada do Passo 3
            // Prioridade: input.structure > analysis.reportStructure > analysis.analysisStructure
            let approvedStructure = input.structure || '';
            if (!approvedStructure && analysis.reportStructure) {
              // Se reportStructure é um objeto JSON, converter para texto legível
              try {
                const structObj = typeof analysis.reportStructure === 'string' 
                  ? JSON.parse(analysis.reportStructure) 
                  : analysis.reportStructure;
                if (structObj.sections && Array.isArray(structObj.sections)) {
                  approvedStructure = structObj.sections
                    .map((s: any, i: number) => `${i + 1}. ${s.title}${s.description ? ': ' + s.description : ''}`)
                    .join('\n');
                  if (structObj.title) {
                    approvedStructure = `TÍTULO: ${structObj.title}\n\nSEÇÕES:\n${approvedStructure}`;
                  }
                } else {
                  approvedStructure = JSON.stringify(structObj, null, 2);
                }
              } catch {
                approvedStructure = String(analysis.reportStructure);
              }
            }
            
            console.log(`[Background] Estrutura aprovada: ${approvedStructure ? 'Sim (' + approvedStructure.length + ' chars)' : 'Não'}`);
            
            // Run multi-agent analysis
            const result = await runMultiAgentAnalysis(
              analysis.objective,
              analysis.context || undefined,
              allSources,
              selectedAnalysts,
              undefined, // onProgress callback
              {
                userId: ctx.user.id,
                dbAnalysisId: input.analysisId,
                useWebSearch: input.useWebSearch,
                useCounselorKnowledge: input.useCounselorKnowledge,
                structure: approvedStructure, // Passar estrutura aprovada para os conselheiros e Max Weber
                requesterName: ctx.user.name || ctx.user.email?.split('@')[0] || 'Usuário', // Nome do solicitante
                requesterEmail: ctx.user.email || 'Não informado', // E-mail do solicitante
              }
            );

            const executionTime = Date.now() - startTime;

            console.log(`[Background DEBUG] ========== RESULTADO DA ANÁLISE ==========`);
            console.log(`[Background DEBUG] Análise: ${input.analysisId}`);
            console.log(`[Background DEBUG] Status: ${result.status}`);
            console.log(`[Background DEBUG] FinalReport existe: ${!!result.finalReport}`);
            console.log(`[Background DEBUG] FinalReport tamanho: ${result.finalReport?.length || 0}`);
            console.log(`[Background DEBUG] Custo total: $${result.totalCost?.toFixed(4) || '0'}`);
            console.log(`[Background DEBUG] Tempo de execução: ${executionTime}ms`);
            console.log(`[Background DEBUG] Steps: ${result.steps?.length || 0}`);
            console.log(`[Background DEBUG] Timestamp: ${new Date().toISOString()}`);

            // Update analysis with results
            console.log(`[Background DEBUG] Atualizando banco de dados...`);
            await db.updateAnalysis(input.analysisId, {
              generatedContent: result.finalReport,
              analysisSteps: result.steps,
              actualCost: result.totalCost.toString(),
              executionTime,
              status: result.status === 'completed' ? 'completed' : 'failed',
              completedAt: new Date(),
              savedToHistory: result.status === 'completed', // Salvar no histórico se concluída com sucesso
            });
            console.log(`[Background DEBUG] Banco de dados atualizado com sucesso!`);

            // Update user quota
            await db.incrementUserAnalysisCount(ctx.user.id, isPaid ? 1 : 0);

            // Send notification only to admin (not to regular users)
            if (ctx.user.role === 'administrador') {
              try {
                await notifyOwner({
                  title: `[Análise Concluída] ${analysis.title}`,
                  content: `
**Análise geopolitica concluída com sucesso!**

**Título:** ${analysis.title}
**Objetivo:** ${analysis.objective}
**Usuário:** ${ctx.user.name || ctx.user.email}
**Analistas:** ${selectedAnalysts.join(', ')}
**Tempo de execução:** ${Math.round(executionTime / 1000)}s
**Custo:** $${result.totalCost.toFixed(4)}

---
*O usuário pode acessar o relatório completo no sistema.*
                  `.trim()
                });
              } catch (notifyError) {
                console.warn('Failed to send analysis completion notification:', notifyError);
              }
            }
            
            console.log(`[Background DEBUG] ========== ANÁLISE CONCLUÍDA COM SUCESSO ==========`);
            console.log(`[Background DEBUG] Análise ${input.analysisId} finalizada!`);
            console.log(`[Background DEBUG] Timestamp: ${new Date().toISOString()}`);
          } catch (error) {
            console.error(`[Background DEBUG] ========== ERRO NA ANÁLISE ==========`);
            console.error(`[Background DEBUG] Análise: ${input.analysisId}`);
            console.error(`[Background DEBUG] Erro:`, error);
            if (error instanceof Error) {
              console.error(`[Background DEBUG] Mensagem: ${error.message}`);
              console.error(`[Background DEBUG] Stack: ${error.stack}`);
              if ('cause' in error) {
                console.error(`[Background DEBUG] Causa:`, error.cause);
              }
            }
            console.error(`[Background DEBUG] Timestamp: ${new Date().toISOString()}`);
            
            await db.updateAnalysis(input.analysisId, { status: 'failed' });
            console.log(`[Background DEBUG] Status atualizado para 'failed' no banco`);
          }
        };

        // Iniciar execução em background sem aguardar
        executeInBackground().catch(err => {
          console.error('[Background] Erro não tratado:', err);
        });

        // Retornar imediatamente para evitar timeout
        return {
          success: true,
          started: true,
          message: 'Análise iniciada em background. Acompanhe o progresso via SSE.',
        };
      }),

    // Resumir análise pausada (modo debug step-by-step)
    resumeFromStep: accessProcedure
      .input(z.object({ analysisId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const analysis = await db.getAnalysisById(input.analysisId);
        if (!analysis) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Análise não encontrada' });
        }
        
        // Verificar se o usuário tem permissão
        if (analysis.userId !== ctx.user.id && ctx.user.role !== 'administrador') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Sem permissão para resumir esta análise' });
        }
        
        // Tentar resumir a sessão
        const resumed = false;
        
        if (!resumed) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: 'A análise não está pausada ou não existe sessão ativa.' 
          });
        }
        
        console.log(`[Resume] Análise ${input.analysisId} resumida pelo usuário ${ctx.user.id}`);
        
        return {
          success: true,
          message: 'Análise resumida com sucesso.',
        };
      }),

    // Obter status da sessão do Conselho
    getSessionStatus: accessProcedure
      .input(z.object({ analysisId: z.number() }))
      .query(async ({ ctx, input }) => {
        const analysis = await db.getAnalysisById(input.analysisId);
        if (!analysis) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Análise não encontrada' });
        }
        
        // Verificar se o usuário tem permissão
        if (analysis.userId !== ctx.user.id && ctx.user.role !== 'administrador') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Sem permissão para ver esta análise' });
        }
        
        // Sessão SSE removida - fluxo simplificado
        return {
          hasActiveSession: false,
          status: analysis.status,
          generatedContent: analysis.generatedContent,
        };
      }),

    // Obter logs de debug dos blocos
    getBlocksDebugLogs: accessProcedure
      .input(z.object({ analysisId: z.number() }))
      .query(async ({ ctx, input }) => {
        const analysis = await db.getAnalysisById(input.analysisId);
        if (!analysis) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Análise não encontrada' });
        }
        
        // Verificar se o usuário tem permissão
        if (analysis.userId !== ctx.user.id && ctx.user.role !== 'administrador') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Sem permissão para ver esta análise' });
        }
        
        const logs: { timestamp: number; type: string; message: string }[] = [];
        const blocksSummary: Record<string, unknown> = {};
        
        return {
          logs,
          blocksSummary,
        };
      }),

    // Ativar/desativar modo debug para uma análise
    setDebugMode: adminProcedure
      .input(z.object({ 
        analysisId: z.number(),
        enabled: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
console.log(`[Debug] Modo debug ${input.enabled ? 'ativado' : 'desativado'} para análise ${input.analysisId} por ${ctx.user.id}`);
        
        return {
          success: true,
          message: `Modo debug ${input.enabled ? 'ativado' : 'desativado'}.`,
        };
      }),

    // Cancelar análise em andamento
    cancelAnalysis: accessProcedure
      .input(z.object({ analysisId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const analysis = await db.getAnalysisById(input.analysisId);
        if (!analysis) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Análise não encontrada' });
        }
        
        // Verificar se o usuário tem permissão
        if (analysis.userId !== ctx.user.id && ctx.user.role !== 'administrador') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Sem permissão para cancelar esta análise' });
        }
        
        // Verificar se a análise está em processamento
        if (analysis.status !== 'processing') {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: `Não é possível cancelar uma análise com status "${analysis.status}". Apenas análises em processamento podem ser canceladas.` 
          });
        }
        
        // Sinalizar cancelamento via progressEmitter
// Atualizar status no banco de dados
        await db.updateAnalysis(input.analysisId, {
          status: 'cancelled',
          completedAt: new Date(),
        });
        
        console.log(`[Cancel] Análise ${input.analysisId} cancelada pelo usuário ${ctx.user.id}`);
        
        return {
          success: true,
          message: 'Análise cancelada com sucesso.',
        };
      }),

    // Get opinions for review
    getOpinions: accessProcedure
      .input(z.object({ analysisId: z.number() }))
      .query(async ({ ctx, input }) => {
        const analysis = await db.getAnalysisById(input.analysisId);
        if (!analysis || analysis.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Análise não encontrada' });
        }
        
        const opinions = await db.getCounselorOpinionsByAnalysis(input.analysisId);
        return { opinions };
      }),

    // Approve opinion
    approveOpinion: accessProcedure
      .input(z.object({
        opinionId: z.number(),
        feedback: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const opinion = await db.getCounselorOpinion(input.opinionId);
        if (!opinion) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Parecer não encontrado' });
        }
        
        const analysis = await db.getAnalysisById(opinion.analysisId);
        if (!analysis || analysis.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Sem permissão para aprovar este parecer' });
        }
        
        await db.updateCounselorOpinionStatus(input.opinionId, 'approved', input.feedback);
        return { success: true };
      }),

    // Reject opinion
    rejectOpinion: accessProcedure
      .input(z.object({
        opinionId: z.number(),
        feedback: z.string().min(1, 'Feedback é obrigatório para rejeição'),
      }))
      .mutation(async ({ ctx, input }) => {
        const opinion = await db.getCounselorOpinion(input.opinionId);
        if (!opinion) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Parecer não encontrado' });
        }
        
        const analysis = await db.getAnalysisById(opinion.analysisId);
        if (!analysis || analysis.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Sem permissão para rejeitar este parecer' });
        }
        
        await db.updateCounselorOpinionStatus(input.opinionId, 'rejected', input.feedback);
        return { success: true };
      }),

    // Request revision of opinion
    requestRevision: accessProcedure
      .input(z.object({
        opinionId: z.number(),
        feedback: z.string().min(1, 'Feedback é obrigatório para solicitar revisão'),
      }))
      .mutation(async ({ ctx, input }) => {
        const opinion = await db.getCounselorOpinion(input.opinionId);
        if (!opinion) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Parecer não encontrado' });
        }
        
        const analysis = await db.getAnalysisById(opinion.analysisId);
        if (!analysis || analysis.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Sem permissão para solicitar revisão' });
        }
        
        await db.updateCounselorOpinionStatus(input.opinionId, 'revision_requested', input.feedback);
        return { success: true };
      }),

    // Approve all pending opinions
    approveAllOpinions: accessProcedure
      .input(z.object({ analysisId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const analysis = await db.getAnalysisById(input.analysisId);
        if (!analysis || analysis.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Análise não encontrada' });
        }
        
        const pendingOpinions = await db.getPendingOpinionsByAnalysis(input.analysisId);
        for (const opinion of pendingOpinions) {
          await db.updateCounselorOpinionStatus(opinion.id, 'approved');
        }
        
        return { success: true, approvedCount: pendingOpinions.length };
      }),
  }),

  // ============ AI ROUTES ============
  ai: router({
    // Get default example for testing - now fetches from system parameters
    getDefaultExample: publicProcedure
      .query(async () => {
        const params = await db.getSystemParameters();
        const titleParam = params.find(p => p.key === 'example_proposal_title');
        const objectiveParam = params.find(p => p.key === 'example_proposal_objective');
        const contextParam = params.find(p => p.key === 'example_proposal_context');
        
        return {
          title: titleParam?.value || 'Análise Comparada das Políticas dos EUA e da China para a América Latina',
          objective: objectiveParam?.value || '',
          context: contextParam?.value || ''
        };
      }),

    // Suggest analysis objectives
    suggestObjectives: accessProcedure
      .input(z.object({ topic: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const suggestions = await suggestAnalysisObjectives(input.topic);
        return { suggestions };
      }),

    // Avaliar proposta (apenas avaliação, sem gerar estrutura)
    evaluateProposal: accessProcedure
      .input(z.object({
        analysisId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const analysis = await db.getAnalysisById(input.analysisId);
        if (!analysis || analysis.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Análise não encontrada' });
        }
        
        const sources = await db.getSourcesByAnalysisId(input.analysisId);
        const sourcesWithContent = sources.map(s => ({
          title: s.title || s.fileName || 'Fonte sem título',
          content: s.extractedText || undefined,
        }));
        
        // Apenas avaliar proposta com GennovAIs
        const { verdict, justification, suggestions } = await evaluateProposalOnly({
          title: analysis.title || 'Análise Geopolítica',
          objective: analysis.objective || '',
          additionalContext: analysis.context || undefined,
          sources: sourcesWithContent,
          userId: ctx.user.id,
          analysisId: input.analysisId,
        });
        
        return { 
          novaesVerdict: verdict,
          novaesJustification: justification,
          novaesSuggestions: suggestions
        };
      }),

    // Gerar estrutura (após avaliação aprovada)
    generateStructureOnly: accessProcedure
      .input(z.object({
        analysisId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const analysis = await db.getAnalysisById(input.analysisId);
        if (!analysis || analysis.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Análise não encontrada' });
        }
        
        const sources = await db.getSourcesByAnalysisId(input.analysisId);
        const sourcesWithContent = sources.map(s => ({
          title: s.title || s.fileName || 'Fonte sem título',
          content: s.extractedText || undefined,
        }));
        
        // Gerar estrutura com GennovAIs
        const { structure } = await generateStructureOnly({
          title: analysis.title || 'Análise Geopolítica',
          objective: analysis.objective || '',
          additionalContext: analysis.context || undefined,
          sources: sourcesWithContent,
          userId: ctx.user.id,
          analysisId: input.analysisId,
        });
        
        await db.updateAnalysis(input.analysisId, { analysisStructure: structure });
        
        return { structure };
      }),

    // Generate analysis structure (legacy - mantém para compatibilidade)
    generateStructure: accessProcedure
      .input(z.object({
        analysisId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const analysis = await db.getAnalysisById(input.analysisId);
        if (!analysis || analysis.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Análise não encontrada' });
        }
        
        const sources = await db.getSourcesByAnalysisId(input.analysisId);
        const sourcesWithContent = sources.map(s => ({
          title: s.title || s.fileName || 'Fonte sem título',
          content: s.extractedText || undefined,
        }));
        
        // Generate structure with GennovAIs evaluation
        const { structure, novaesProposal, novaesVerdict, novaesJustification } = await generateStructureWithReview({
          title: analysis.title || 'Análise Geopolítica',
          objective: analysis.objective || '',
          additionalContext: analysis.context || undefined,
          sources: sourcesWithContent,
          userId: ctx.user.id,
          analysisId: input.analysisId,
        });
        
        await db.updateAnalysis(input.analysisId, { analysisStructure: structure });
        
        return { 
          structure,
          novaesProposal,
          novaesVerdict,
          novaesJustification
        };
      }),

    // Generate report structure
    generateReportStructure: accessProcedure
      .input(z.object({ analysisId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const analysis = await db.getAnalysisById(input.analysisId);
        if (!analysis || analysis.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Análise não encontrada' });
        }
        
        if (!analysis.analysisStructure) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Gere a estrutura da análise primeiro' });
        }
        
        const reportStructure = await generateReportStructure(analysis.analysisStructure);
        
        await db.updateAnalysis(input.analysisId, { reportStructure });
        
        return { reportStructure };
      }),

    // Execute full analysis (legacy - single agent)
    executeAnalysis: accessProcedure
      .input(z.object({ analysisId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const analysis = await db.getAnalysisById(input.analysisId);
        if (!analysis || analysis.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Análise não encontrada' });
        }
        
        await db.updateAnalysis(input.analysisId, { status: 'processing' });
        
        try {
          const sources = await db.getSourcesByAnalysisId(input.analysisId);
          
          const sourcesForAI = sources.map(s => ({
            type: s.sourceType,
            title: s.title || s.fileName || 'Fonte',
            content: s.extractedText || '',
          }));
          
          const content = await generateFullAnalysis(
            analysis.objective,
            analysis.analysisStructure || {},
            sourcesForAI
          );
          
          await db.updateAnalysis(input.analysisId, {
            generatedContent: content,
            status: 'completed',
            completedAt: new Date(),
          });
          
          return { content };
        } catch (error) {
          await db.updateAnalysis(input.analysisId, { status: 'failed' });
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: error instanceof Error ? error.message : 'Erro ao gerar análise' 
          });
        }
      }),
  }),

  // ============ NEWS ROUTES ============
  news: router({
    // Search news
    search: accessProcedure
      .input(z.object({
        query: z.string().min(1),
        source: z.enum(['all', 'newsapi', 'gdelt']).optional(),
        language: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
        pageSize: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const params = {
          query: input.query,
          language: input.language,
          from: input.from,
          to: input.to,
          pageSize: input.pageSize,
        };
        
        if (input.source === 'newsapi') {
          return { newsapi: await searchNewsAPI(params), gdelt: [] };
        } else if (input.source === 'gdelt') {
          return { newsapi: [], gdelt: await searchGDELT(params) };
        } else {
          return searchAllNews(params);
        }
      }),

    // Fetch article content
    fetchContent: accessProcedure
      .input(z.object({ url: z.string().url() }))
      .mutation(async ({ input }) => {
        const content = await fetchArticleContent(input.url);
        return { content };
      }),
  }),

  // ============ WEB SEARCH ROUTES ============
  webSearch: router({
    // Search the web
    search: accessProcedure
      .input(z.object({
        query: z.string().min(1),
        numResults: z.number().optional(),
        language: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const results = await searchWeb({
          query: input.query,
          numResults: input.numResults || 10,
          language: input.language || 'pt',
        });
        return { results };
      }),

    // Fetch content from a URL
    fetchContent: accessProcedure
      .input(z.object({ url: z.string().url() }))
      .mutation(async ({ input }) => {
        const content = await fetchWebContent(input.url);
        return { content };
      }),

    // Search and fetch content in one call
    searchAndFetch: accessProcedure
      .input(z.object({
        query: z.string().min(1),
        numResults: z.number().optional(),
        language: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return searchAndFetchContent({
          query: input.query,
          numResults: input.numResults || 5,
          language: input.language || 'pt',
        });
      }),
  }),

  // ============ FILE ROUTES ============
  files: router({
    // Upload file
    upload: accessProcedure
      .input(z.object({
        analysisId: z.number(),
        fileName: z.string(),
        mimeType: z.string(),
        base64Content: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        console.log(`[Upload] Starting upload: ${input.fileName}, type: ${input.mimeType}, base64 length: ${input.base64Content.length}`);
        
        const analysis = await db.getAnalysisById(input.analysisId);
        if (!analysis || analysis.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Análise não encontrada' });
        }
        
        if (!validateFileType(input.mimeType)) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: 'Tipo de arquivo não suportado. Use PDF, DOCX ou TXT.' 
          });
        }
        
        try {
          const buffer = Buffer.from(input.base64Content, 'base64');
          console.log(`[Upload] Buffer size: ${buffer.length} bytes (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
          
          const processed = await processUploadedFile(
            buffer,
            input.fileName,
            input.mimeType,
            ctx.user.id
          );
          console.log(`[Upload] File processed successfully: ${processed.fileKey}`);
          
          const sourceId = await db.addAnalysisSource({
            analysisId: input.analysisId,
            sourceType: 'file',
            fileName: processed.fileName,
            fileKey: processed.fileKey,
            mimeType: processed.mimeType,
            url: processed.url,
            extractedText: processed.extractedText,
          });
          
          console.log(`[Upload] Source added to DB: ${sourceId}`);
          
          return { 
            id: sourceId,
            ...processed,
          };
        } catch (error) {
          console.error(`[Upload] Error processing file:`, error);
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: `Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
          });
        }
      }),
  }),

  // ============ REPORT ROUTES ============
  report: router({
    // Generate report
    generate: accessProcedure
      .input(z.object({
        analysisId: z.number(),
        format: z.enum(['pdf', 'docx']),
      }))
      .mutation(async ({ ctx, input }) => {
        const analysis = await db.getAnalysisById(input.analysisId);
        if (!analysis || analysis.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Análise não encontrada' });
        }
        
        if (!analysis.generatedContent) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Execute a análise primeiro' });
        }
        
        const result = await generateReport({
          title: analysis.title,
          subtitle: analysis.objective,
          author: ctx.user.name || undefined,
          date: new Date().toLocaleDateString('pt-BR'),
          content: analysis.generatedContent,
          structure: analysis.reportStructure,
          format: input.format,
          sessionCode: analysis.sessionCode || undefined,
        }, ctx.user.id);
        
        return result;
      }),

    // Get printable HTML
    getPrintable: accessProcedure
      .input(z.object({ analysisId: z.number() }))
      .query(async ({ ctx, input }) => {
        const analysis = await db.getAnalysisById(input.analysisId);
        if (!analysis || analysis.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Análise não encontrada' });
        }
        
        if (!analysis.generatedContent) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Execute a análise primeiro' });
        }
        
        // Get user-provided sources for bibliography
        const sources = await db.getSourcesByAnalysisId(input.analysisId);
        const userSources = sources.map(s => ({
          title: s.title || 'Documento sem título',
          url: s.url || undefined,
          type: s.sourceType,
        }));
        
        // Obter URL base para geração do QR Code
        const baseUrl = ctx.req.headers.origin || `https://${ctx.req.headers.host}`;
        
        const html = await generatePrintableHTML({
          title: analysis.title,
          subtitle: analysis.objective,
          author: ctx.user.name || undefined,
          date: new Date().toLocaleDateString('pt-BR'),
          content: analysis.generatedContent,
          structure: analysis.reportStructure,
          format: 'pdf',
          userSources,
          sessionCode: analysis.sessionCode || undefined,
          baseUrl,
        });
        
        return { html };
      }),

    // Export to DOCX
    exportDocx: accessProcedure
      .input(z.object({ analysisId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const analysis = await db.getAnalysisById(input.analysisId);
        if (!analysis || analysis.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Análise não encontrada' });
        }
        
        if (!analysis.generatedContent) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Execute a análise primeiro' });
        }

        // Get sources for the analysis
        const sources = await db.getSourcesByAnalysisId(input.analysisId);
        
        // Parse the analysis structure to get sections
        let sections: { title: string; content: string }[] = [];
        try {
          const structure = analysis.analysisStructure as any;
          if (structure && Array.isArray(structure)) {
            sections = structure.map((s: any) => ({
              title: s.title || s.name || 'Seção',
              content: s.content || '',
            }));
          }
        } catch (e) {
          // If parsing fails, use the generated content as a single section
          sections = [{
            title: 'Análise',
            content: analysis.generatedContent,
          }];
        }

        // If sections are empty, use generated content
        if (sections.length === 0 || sections.every(s => !s.content)) {
          sections = [{
            title: 'Análise Geopolítica',
            content: analysis.generatedContent,
          }];
        }

        // Get analyst names
        const selectedAnalysts = (analysis.selectedAnalysts as string[]) || [];
        const analystNames = selectedAnalysts.map(id => {
          const analyst = ANALYSTS.find(a => a.id === id);
          return analyst ? analyst.fullName : id;
        });

        // Obter URL base para geração do QR Code
        const baseUrl = ctx.req.headers.origin || `https://${ctx.req.headers.host}`;
        
        // Prepare report data
        const reportData: ReportData = {
          title: analysis.title,
          objective: analysis.objective,
          context: analysis.context || undefined,
          analysts: analystNames,
          sections,
          sources: sources.map(s => s.title || s.url || s.fileName || 'Fonte'),
          generatedAt: new Date(),
          estimatedCost: parseFloat(analysis.estimatedCost?.toString() || '0'),
          sessionCode: analysis.sessionCode || undefined,
          baseUrl,
        };

        // Generate DOCX
        const docxBuffer = await generateDocx(reportData);
        
        // Upload to S3
        const fileName = `report-${input.analysisId}-${Date.now()}.docx`;
        const fileKey = `reports/${ctx.user.id}/${fileName}`;
        
        const { url } = await storagePut(
          fileKey,
          docxBuffer,
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );
        
        return { 
          url,
          fileName,
          size: docxBuffer.length,
        };
      }),
  }),

  // ============ COUNSELORS MANAGEMENT ROUTES ============
  counselors: router({
    // Get all counselors (admin)
    list: adminProcedure.query(async () => {
      await db.initializeDefaultCounselors();
      return db.getAllCounselors();
    }),

    // Get active counselors (public)
    listActive: publicProcedure.query(async () => {
      await db.initializeDefaultCounselors();
      return db.getActiveCounselors();
    }),

    // Get single counselor
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getCounselorById(input.id);
      }),

    // Get counselor by key (counselorId)
    getByKey: publicProcedure
      .input(z.object({ counselorId: z.string() }))
      .query(async ({ input }) => {
        return db.getCounselorByKey(input.counselorId);
      }),

    // Create new counselor (Diretores e Administradores)
    create: diretorProcedure
      .input(z.object({
        counselorId: z.string().min(1),
        name: z.string().min(1),
        shortName: z.string().optional(),
        nationality: z.string().optional(),
        birthYear: z.number().optional(),
        deathYear: z.number().optional(),
        photoUrl: z.string().optional(),
        homePhotoUrl: z.string().optional(),
        bioPhotoUrl: z.string().optional(),
        shortBio: z.string().optional(),
        fullBio: z.string().optional(),
        mainTheory: z.string().optional(),
        keyContributions: z.array(z.string()).optional(),
        areasOfExpertise: z.array(z.string()).optional(),
        mainBooks: z.array(z.object({
          title: z.string(),
          year: z.number().optional(),
          description: z.string().optional(),
        })).optional(),
        articles: z.array(z.object({
          title: z.string(),
          year: z.number().optional(),
          publication: z.string().optional(),
        })).optional(),
        otherMaterials: z.array(z.object({
          type: z.string(),
          title: z.string(),
          description: z.string().optional(),
          url: z.string().optional(),
        })).optional(),
        personalityTraits: z.array(z.string()).optional(),
        writingStyle: z.string().optional(),
        analysisApproach: z.string().optional(),
        keyPhrases: z.array(z.string()).optional(),
        llmProvider: z.string().optional(),
        llmModel: z.string().optional(),
        isActive: z.boolean().optional(),
        disabledBannerText: z.string().optional(),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        // Mapear disabledBannerText para unavailabilityText
        const { disabledBannerText, ...restInput } = input;
        const counselor = await db.createCounselor({
          ...restInput,
          unavailabilityText: disabledBannerText,
          keyContributions: input.keyContributions ? JSON.stringify(input.keyContributions) : undefined,
          areasOfExpertise: input.areasOfExpertise ? JSON.stringify(input.areasOfExpertise) : undefined,
          mainBooks: input.mainBooks ? JSON.stringify(input.mainBooks) : undefined,
          articles: input.articles ? JSON.stringify(input.articles) : undefined,
          otherMaterials: input.otherMaterials ? JSON.stringify(input.otherMaterials) : undefined,
          personalityTraits: input.personalityTraits ? JSON.stringify(input.personalityTraits) : undefined,
          keyPhrases: input.keyPhrases ? JSON.stringify(input.keyPhrases) : undefined,
        });
        return counselor;
      }),

    // Update counselor (Diretores e Administradores)
    update: diretorProcedure
      .input(z.object({
        id: z.number(),
        counselorId: z.string().optional(),
        name: z.string().optional(),
        shortName: z.string().optional(),
        nationality: z.string().optional(),
        birthYear: z.number().optional(),
        deathYear: z.number().optional(),
        photoUrl: z.string().optional(),
        homePhotoUrl: z.string().optional(),
        bioPhotoUrl: z.string().optional(),
        shortBio: z.string().optional(),
        fullBio: z.string().optional(),
        mainTheory: z.string().optional(),
        keyContributions: z.array(z.string()).optional(),
        areasOfExpertise: z.array(z.string()).optional(),
        mainBooks: z.array(z.object({
          title: z.string(),
          year: z.number().optional(),
          description: z.string().optional(),
        })).optional(),
        articles: z.array(z.object({
          title: z.string(),
          year: z.number().optional(),
          publication: z.string().optional(),
        })).optional(),
        otherMaterials: z.array(z.object({
          type: z.string(),
          title: z.string(),
          description: z.string().optional(),
          url: z.string().optional(),
        })).optional(),
        personalityTraits: z.array(z.string()).optional(),
        writingStyle: z.string().optional(),
        analysisApproach: z.string().optional(),
        keyPhrases: z.array(z.string()).optional(),
        llmProvider: z.string().optional(),
        llmModel: z.string().optional(),
        isActive: z.boolean().optional(),
        disabledBannerText: z.string().optional(),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: any = { ...data };
        
        // Mapear disabledBannerText para unavailabilityText (nome do campo no banco)
        if (data.disabledBannerText !== undefined) {
          updateData.unavailabilityText = data.disabledBannerText;
          delete updateData.disabledBannerText;
        }
        
        if (data.keyContributions) updateData.keyContributions = JSON.stringify(data.keyContributions);
        if (data.areasOfExpertise) updateData.areasOfExpertise = JSON.stringify(data.areasOfExpertise);
        if (data.mainBooks) updateData.mainBooks = JSON.stringify(data.mainBooks);
        if (data.articles) updateData.articles = JSON.stringify(data.articles);
        if (data.otherMaterials) updateData.otherMaterials = JSON.stringify(data.otherMaterials);
        if (data.personalityTraits) updateData.personalityTraits = JSON.stringify(data.personalityTraits);
        if (data.keyPhrases) updateData.keyPhrases = JSON.stringify(data.keyPhrases);
        
        return db.updateCounselor(id, updateData);
      }),

    // Delete counselor (Diretores e Administradores)
    delete: diretorProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const counselor = await db.getCounselorById(input.id);
        if (counselor?.isBuiltIn) {
          throw new TRPCError({ 
            code: 'FORBIDDEN', 
            message: 'Não é possível excluir conselheiros padrão do sistema' 
          });
        }
        await db.deleteCounselor(input.id);
        return { success: true };
      }),

    // Toggle counselor active status (Diretores e Administradores)
    toggleActive: diretorProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.toggleCounselorActive(input.id);
      }),

    // Reorder counselors (Diretores e Administradores)
    reorder: diretorProcedure
      .input(z.array(z.object({
        id: z.number(),
        displayOrder: z.number(),
      })))
      .mutation(async ({ input }) => {
        for (const item of input) {
          await db.updateCounselor(item.id, { displayOrder: item.displayOrder });
        }
        return { success: true };
      }),

    // Generate counselor data automatically using AI
    generateAutoFill: diretorProcedure
      .input(z.object({ name: z.string().min(1) }))
      .mutation(async ({ input }) => {
        console.log('[AutoFill] Iniciando geração para:', input.name);
        
        const { invokeLLM } = await import('./_core/llm');
        const { generateImage } = await import('./_core/imageGeneration');
        
        // Get the prompt from database
        const promptData = await db.getSystemPrompt('counselor_autofill');
        const systemPrompt = promptData?.promptContent || `Você é um especialista em geopolitica e relações internacionais. Dado o nome de um pensador geopolítico, gere um perfil completo para ele no formato JSON.

O perfil deve incluir:
- counselorId: identificador único em lowercase com hífens (ex: "hans-morgenthau")
- name: nome completo
- shortName: nome curto para exibição
- nationality: nacionalidade
- birthYear: ano de nascimento
- deathYear: ano de falecimento (null se vivo)
- mainTheory: principal teoria ou contribuição
- shortBio: biografia curta (1-2 frases)
- fullBio: biografia completa (3-5 parágrafos)
- keyContributions: array de 3-5 contribuições principais
- areasOfExpertise: array de 3-5 áreas de especialização
- mainBooks: array de 2-4 livros principais com {title, year, description}
- personalityTraits: array de 3-5 traços de personalidade
- writingStyle: descrição do estilo de escrita
- analysisApproach: como ele aborda análises geopolíticas
- keyPhrases: array de 2-4 frases características
- llmPersonality: texto detalhado descrevendo a personalidade para simulação por IA (3-5 parágrafos explicando como o pensador argumenta, seu tom, suas preferências de análise, e como ele responderia a questões geopolíticas)

Responda APENAS com o JSON válido, sem explicações adicionais.`;
        
        // Call LLM to generate counselor data
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Gere o perfil completo para: ${input.name}` }
          ],
          response_format: { type: 'json_object' }
        });
        
        console.log('[AutoFill] Resposta LLM recebida');
        const content = response.choices[0]?.message?.content;
        if (!content || typeof content !== 'string') {
          console.error('[AutoFill] Conteúdo inválido:', content);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Falha ao gerar dados do conselheiro' });
        }
        
        let rawData;
        try {
          rawData = JSON.parse(content);
          console.log('[AutoFill] Dados parseados com sucesso');
          console.log('[AutoFill] Estrutura bruta:', JSON.stringify(rawData, null, 2).substring(0, 1500));
        } catch (e) {
          console.error('[AutoFill] Erro ao parsear JSON:', e);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Resposta do LLM não é JSON válido' });
        }
        
        // Normalize the data structure - handle nested categories from LLM
        let counselorData: Record<string, unknown> = {};
        
        // Helper function to recursively find a value in nested objects
        const findValue = (obj: any, keys: string[]): any => {
          for (const key of keys) {
            if (obj[key] !== undefined) return obj[key];
          }
          // Search in nested objects
          for (const value of Object.values(obj)) {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
              for (const key of keys) {
                if ((value as any)[key] !== undefined) return (value as any)[key];
              }
            }
          }
          return undefined;
        };
        
        // If data is nested in categories, flatten it
        if (rawData['Identificação'] || rawData['Teoria e Contribuições'] || rawData['Obras'] || rawData['Personalidade e Estilo (para simulação de IA)']) {
          console.log('[AutoFill] Dados aninhados detectados (padrão PT), normalizando...');
          
          // Extract from Identificação
          if (rawData['Identificação']) {
            const id = rawData['Identificação'];
            counselorData.counselorId = id.counselorId;
            counselorData.name = id.name;
            counselorData.shortName = id.shortName;
            counselorData.nationality = id.nationality;
            counselorData.birthYear = id.birthYear;
            counselorData.deathYear = id.deathYear;
          }
          
          // Extract from Teoria e Contribuições
          if (rawData['Teoria e Contribuições']) {
            const teoria = rawData['Teoria e Contribuições'];
            counselorData.mainTheory = teoria.mainTheory;
            counselorData.shortBio = teoria.shortBio;
            counselorData.fullBio = teoria.fullBio;
            counselorData.keyContributions = teoria.keyContributions;
            counselorData.areasOfExpertise = teoria.areasOfExpertise;
          }
          
          // Extract from Obras
          if (rawData['Obras']) {
            counselorData.mainBooks = rawData['Obras'].mainBooks;
          }
          
          // Extract from Personalidade e Estilo
          const personalidade = rawData['Personalidade e Estilo (para simulação de IA)'] || rawData['Personalidade e Estilo'];
          if (personalidade) {
            counselorData.personalityTraits = personalidade.personalityTraits;
            counselorData.writingStyle = personalidade.writingStyle;
            counselorData.analysisApproach = personalidade.analysisApproach;
            counselorData.keyPhrases = personalidade.keyPhrases;
            counselorData.llmPersonality = personalidade.llmPersonality;
          }
          
          // Also check for llmPersonality at root level
          if (rawData.llmPersonality) counselorData.llmPersonality = rawData.llmPersonality;
        } else {
          // Data is flat or in a different structure - copy all fields
          console.log('[AutoFill] Dados em formato flat ou estrutura diferente');
          counselorData = { ...rawData };
        }
        
        // Ensure all required fields are present by searching recursively
        const requiredFields = [
          'counselorId', 'name', 'shortName', 'nationality', 'birthYear', 'deathYear',
          'mainTheory', 'shortBio', 'fullBio', 'keyContributions', 'areasOfExpertise',
          'mainBooks', 'personalityTraits', 'writingStyle', 'analysisApproach',
          'keyPhrases', 'llmPersonality'
        ];
        
        for (const field of requiredFields) {
          if (counselorData[field] === undefined) {
            const value = findValue(rawData, [field]);
            if (value !== undefined) {
              counselorData[field] = value;
              console.log(`[AutoFill] Campo '${field}' encontrado via busca recursiva`);
            }
          }
        }
        
        // Copy any image URLs that might already exist
        if (rawData.homePhotoUrl) counselorData.homePhotoUrl = rawData.homePhotoUrl;
        if (rawData.bioPhotoUrl) counselorData.bioPhotoUrl = rawData.bioPhotoUrl;
        
        console.log('[AutoFill] Dados normalizados:', Object.keys(counselorData));
        console.log('[AutoFill] Campos básicos:', {
          counselorId: counselorData.counselorId,
          name: counselorData.name,
          shortName: counselorData.shortName,
          nationality: counselorData.nationality,
          birthYear: counselorData.birthYear,
          deathYear: counselorData.deathYear
        });
        
        // Generate portrait images
        try {
          console.log('[AutoFill] Gerando imagens...');
          const homePhotoPrompt = `Professional portrait of ${input.name}, geopolitical thinker and strategist, formal attire, neutral background, high quality, realistic, suitable for academic profile, 400x500 aspect ratio`;
          const bioPhotoPrompt = `Full portrait of ${input.name}, geopolitical scholar, in a study or library setting, professional lighting, high quality, realistic, 600x800 aspect ratio`;
          
          const [homePhoto, bioPhoto] = await Promise.all([
            generateImage({ prompt: homePhotoPrompt }),
            generateImage({ prompt: bioPhotoPrompt })
          ]);
          
          counselorData.homePhotoUrl = homePhoto.url;
          counselorData.bioPhotoUrl = bioPhoto.url;
          console.log('[AutoFill] Imagens geradas com sucesso');
        } catch (imgError) {
          console.error('[AutoFill] Erro ao gerar imagens:', imgError);
          // Continue without images
        }
        
        // Normalize string fields that might be objects
        const normalizeToString = (value: any): string => {
          if (!value) return '';
          if (typeof value === 'string') return value;
          if (typeof value === 'object') {
            // If it's an object with a text or content property, use that
            if (value.text) return value.text;
            if (value.content) return value.content;
            if (value.description) return value.description;
            // Otherwise stringify it
            return JSON.stringify(value);
          }
          return String(value);
        };
        
        // Ensure these fields are strings, not objects
        if (counselorData.writingStyle) {
          counselorData.writingStyle = normalizeToString(counselorData.writingStyle);
        }
        if (counselorData.analysisApproach) {
          counselorData.analysisApproach = normalizeToString(counselorData.analysisApproach);
        }
        if (counselorData.llmPersonality) {
          counselorData.llmPersonality = normalizeToString(counselorData.llmPersonality);
        }
        
        console.log('[AutoFill] Retornando dados normalizados');
        console.log('[AutoFill] writingStyle tipo:', typeof counselorData.writingStyle);
        console.log('[AutoFill] analysisApproach tipo:', typeof counselorData.analysisApproach);
        console.log('[AutoFill] llmPersonality tipo:', typeof counselorData.llmPersonality);
        return counselorData;
      }),

    // Upload counselor image to S3
    uploadImage: diretorProcedure
      .input(z.object({
        type: z.enum(['home', 'bio']),
        base64Data: z.string(),
        mimeType: z.string(),
        counselorId: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { type, base64Data, mimeType, counselorId } = input;
        
        // Extract base64 content (remove data URL prefix if present)
        const base64Content = base64Data.includes(',') 
          ? base64Data.split(',')[1] 
          : base64Data;
        
        // Convert base64 to buffer
        const buffer = Buffer.from(base64Content, 'base64');
        
        // Generate unique filename
        const ext = mimeType.split('/')[1] || 'jpg';
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const fileName = `counselor-${type}-${counselorId || 'new'}-${timestamp}-${randomSuffix}.${ext}`;
        const fileKey = `counselors/${fileName}`;
        
        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, mimeType);
        
        return { url, fileKey };
      }),
  }),

  // ============ PUBLIC VERIFICATION ROUTES ============
  verification: router({
    verify: publicProcedure
      .input(z.object({ sessionCode: z.string().min(1) }))
      .query(async ({ input }) => {
        const result = await db.getPublicAnalysisVerification(input.sessionCode);
        if (!result) {
          return {
            isValid: false,
            message: 'Código de sessão não encontrado. Verifique se o código está correto.',
          };
        }
        return result;
      }),
  }),

  // ============ CONTACT ROUTES ============
  contact: router({
    send: publicProcedure
      .input(z.object({
        name: z.string().min(1, 'Nome é obrigatório'),
        email: z.string().email('Email inválido'),
        subject: z.string().min(1, 'Assunto é obrigatório'),
        message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
      }))
      .mutation(async ({ input }) => {
        const subjectLabels: Record<string, string> = {
          'access': 'Solicitar Acesso ao Sistema',
          'support': 'Suporte Técnico',
          'partnership': 'Parcerias e Colaborações',
          'feedback': 'Feedback e Sugestões',
          'press': 'Imprensa e Comunicação',
          'other': 'Outro Assunto',
        };

        const subjectLabel = subjectLabels[input.subject] || input.subject;
        
        const title = `[Contato] ${subjectLabel} - ${input.name}`;
        const content = `
**Nova mensagem de contato recebida**

**De:** ${input.name}
**Email:** ${input.email}
**Assunto:** ${subjectLabel}

**Mensagem:**
${input.message}

---
*Esta mensagem foi enviada através do formulário de contato do Conselho de Geopolítica da FGV.*
*Para responder, envie um email para: ${input.email}*
        `.trim();

        // Send notification to owner
        const sent = await notifyOwner({ title, content });
        
        if (!sent) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Erro ao enviar mensagem. Tente novamente mais tarde.',
          });
        }

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
