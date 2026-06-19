import type { IncomingMessage, ServerResponse } from "http";
import { applyCorsHeaders } from "../src/config/cors";

type ExpressHandler = (req: IncomingMessage, res: ServerResponse) => unknown;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  applyCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    const app = (await import("../src/app")).default as unknown as ExpressHandler;
    return app(req, res);
  } catch (error) {
    console.error("API startup failed:", error);
    applyCorsHeaders(req, res);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "API startup failed" }));
  }
}
