import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { Server } from "socket.io";
import helmet from "helmet";
import { assertProductionEnv } from "./config/env";
import { corsOriginDelegate } from "./config/cors";

// Central API Router
import apiRoutes from "./routes";

// Middlewares
import { errorHandler } from "./middlewares/errorMiddleware";
import { registerChatSocket } from "./websocket/chatSocket";
import { registerNotificationSocket } from "./websocket/notificationSocket";
import { startSlaScheduler } from "./services/slaSchedulerService";
import { generalRateLimiter } from "./middlewares/rateLimitMiddleware";

// Configurations
dotenv.config();
assertProductionEnv();

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: corsOriginDelegate,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(generalRateLimiter);

// Backward-compatible response adapter for legacy controllers
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = ((body: unknown) => {
    if (
      res.statusCode >= 400 &&
      body &&
      typeof body === "object" &&
      "error" in body &&
      typeof (body as { error?: unknown }).error === "string"
    ) {
      const legacy = body as { error: string; details?: unknown; [key: string]: unknown };
      const { error, details, ...rest } = legacy;
      return originalJson({
        ...rest,
        success: false,
        error: {
          code: res.statusCode === 401 ? "UNAUTHORIZED" : res.statusCode === 403 ? "FORBIDDEN" : res.statusCode === 404 ? "NOT_FOUND" : res.statusCode === 429 ? "RATE_LIMITED" : res.statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_FAILED",
          message: error,
          ...(details !== undefined ? { details } : {})
        }
      });
    }
    return originalJson(body);
  }) as typeof res.json;
  next();
});

// Enhanced Terminal Logger Middleware
const SENSITIVE_PATHS = ["/api/auth/login", "/api/auth/register", "/api/auth/verify-otp"];
app.use((req, res, next) => {
  const startTime = Date.now();
  const isSensitive = SENSITIVE_PATHS.some((path) => req.path.startsWith(path));
  const logPath = isSensitive ? "/api/auth/**" : req.originalUrl || req.path;

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const status = res.statusCode;
    const statusText = status === 200 || status === 201 ? "OK" : status === 401 ? "UNAUTHORIZED" : status === 403 ? "FORBIDDEN" : status === 404 ? "NOT_FOUND" : status >= 500 ? "SERVER_ERROR" : `STATUS_${status}`;
    const icon = status >= 500 ? "🔥" : status >= 400 ? "⚠️" : status >= 300 ? "🔀" : "✅";

    console.log(`[API ${req.method}] ${icon} ${status} ${statusText} | ${logPath} | ${duration}ms`);
  });

  next();
});

// ============================================
// Centralized API Routes - MahaCSR Framework
// ============================================

app.use("/api", apiRoutes);

// Base route & Health check
app.get("/", (req, res) => {
  res.json({ message: "Welcome to MahaCSR API Platform Gateway" });
});

app.get("/health", (req, res) => {
  res.json({ status: "UP", timestamp: new Date().toISOString() });
});

// WebSocket Registration
const io = new Server(server, {
  cors: corsOptions
});

registerChatSocket(io);
registerNotificationSocket(io);

// Background Services
startSlaScheduler();

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`MahaCSR Server is running on port ${PORT}`);
});

export default app;
