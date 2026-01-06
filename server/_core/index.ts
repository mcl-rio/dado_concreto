import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Health check endpoint for Railway/container orchestrators
  app.get("/health", (_req, res) => {
    console.log("[Health] /health endpoint called");
    res.status(200).send("OK");
  });

  // Seed database endpoint - importa dados do Manus
  app.get("/api/seed-database", async (req, res) => {
    const secret = req.query.secret;
    if (secret !== "fgv2026") {
      return res.status(403).send("Acesso negado. Use: /api/seed-database?secret=fgv2026");
    }

    try {
      console.log("[Seed] Iniciando importação de dados...");
      const { seedDatabase } = await import("../seed-runner");
      const results = await seedDatabase();

      const totalSuccess = results.invitedUsers.success + results.counselors.success +
                          results.llmConfig.success + results.temperature.success +
                          results.llmPricing.success + results.prompts.success;
      const totalFailed = results.invitedUsers.failed + results.counselors.failed +
                         results.llmConfig.failed + results.temperature.failed +
                         results.llmPricing.failed + results.prompts.failed;

      res.send(`
        <html>
        <head><title>Importação Concluída</title></head>
        <body style="font-family: Arial; padding: 40px; background: #1a1a2e; color: #eee;">
          <h1 style="color: #4ade80;">✅ Dados importados com sucesso!</h1>
          <p>Resultados da importação:</p>
          <ul>
            <li>📧 Usuários convidados: ${results.invitedUsers.success} OK, ${results.invitedUsers.failed} falhas</li>
            <li>👔 Conselheiros: ${results.counselors.success} OK, ${results.counselors.failed} falhas</li>
            <li>⚙️ Configurações LLM: ${results.llmConfig.success} OK, ${results.llmConfig.failed} falhas</li>
            <li>🌡️ Temperaturas: ${results.temperature.success} OK, ${results.temperature.failed} falhas</li>
            <li>💰 Preços LLM: ${results.llmPricing.success} OK, ${results.llmPricing.failed} falhas</li>
            <li>📝 Prompts: ${results.prompts.success} OK, ${results.prompts.failed} falhas</li>
          </ul>
          <p><strong>Total: ${totalSuccess} registros importados, ${totalFailed} falhas</strong></p>
          <p><a href="/" style="color: #60a5fa;">Voltar para o app</a></p>
        </body>
        </html>
      `);
    } catch (error) {
      console.error("[Seed] Erro:", error);
      res.status(500).send(`
        <html>
        <head><title>Erro na Importação</title></head>
        <body style="font-family: Arial; padding: 40px; background: #1a1a2e; color: #eee;">
          <h1 style="color: #ef4444;">❌ Erro ao importar dados</h1>
          <pre style="background: #2d2d3d; padding: 20px; overflow-x: auto;">${error}</pre>
          <p><a href="/" style="color: #60a5fa;">Voltar para o app</a></p>
        </body>
        </html>
      `);
    }
  });

  // Log all incoming requests for debugging
  app.use((req, _res, next) => {
    console.log(`[Request] ${req.method} ${req.url}`);
    next();
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "3000");
  const host = "0.0.0.0"; // Bind to all interfaces for container environments

  server.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}/`);
  });
}

startServer().catch(console.error);
