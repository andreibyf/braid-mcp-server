import express, { Request, Response, NextFunction } from "express";
import { AdapterRegistry, AdapterContext } from "./adapter-registry";
import { BraidExecutor } from "./braid-executor";
import { mockAdapter } from "./adapters/mockAdapter";
import { businessAdapter } from "./adapters/businessAdapter";
import { BraidRequestEnvelope } from "./braid-types";

const app = express();
app.use(express.json({ limit: "1mb" }));

const logger: AdapterContext = {
  debug: (msg, meta) => console.debug(msg, meta ?? {}),
  info: (msg, meta) => console.info(msg, meta ?? {}),
  warn: (msg, meta) => console.warn(msg, meta ?? {}),
  error: (msg, meta) => console.error(msg, meta ?? {}),
};

const registry = new AdapterRegistry();
registry.register(mockAdapter);
registry.register(businessAdapter);

const executor = new BraidExecutor(registry, logger);

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "braid-mcp-server" });
});

app.post("/mcp/run", async (req: Request, res: Response) => {
  const body = req.body as Partial<BraidRequestEnvelope>;

  if (!body || !body.requestId || !body.actor || !Array.isArray(body.actions)) {
    return res.status(400).json({
      error: "INVALID_ENVELOPE",
      message:
        "Body must be a valid BraidRequestEnvelope with requestId, actor, and actions[]",
    });
  }

  const envelope: BraidRequestEnvelope = {
    requestId: body.requestId,
    actor: body.actor,
    actions: body.actions,
    createdAt: body.createdAt ?? new Date().toISOString(),
    client: body.client,
    channel: body.channel,
    metadata: body.metadata ?? {},
  };

  try {
    const responseEnvelope = await executor.execute(envelope);
    res.json(responseEnvelope);
  } catch (err: any) {
    logger.error("Unhandled /mcp/run error", {
      error: err?.message ?? String(err),
    });
    res.status(500).json({
      error: "MCP_EXECUTION_ERROR",
      message: err?.message ?? String(err),
    });
  }
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error("Unhandled error middleware", { error: err?.message ?? String(err) });
  res.status(500).json({
    error: "UNHANDLED_ERROR",
    message: err?.message ?? String(err),
  });
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Braid MCP Server listening on port ${port}`);
});
