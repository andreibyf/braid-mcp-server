import {
  BraidRequestEnvelope,
  BraidResponseEnvelope,
  Action,
  ActionResult,
} from "./braid-types";
import { AdapterRegistry, AdapterContext } from "./adapter-registry";

export class BraidExecutor {
  constructor(
    private readonly registry: AdapterRegistry,
    private readonly log: AdapterContext
  ) {}

  private createContext(): AdapterContext {
    return this.log;
  }

  async execute(envelope: BraidRequestEnvelope): Promise<BraidResponseEnvelope> {
    const startedAt = new Date().toISOString();
    const ctx = this.createContext();

    ctx.info("Executing Braid envelope", {
      requestId: envelope.requestId,
      actionCount: envelope.actions.length,
    });

    const results: ActionResult[] = [];
    for (const action of envelope.actions) {
      results.push(await this.executeAction(action, ctx));
    }

    const finishedAt = new Date().toISOString();

    return {
      requestId: envelope.requestId,
      results,
      startedAt,
      finishedAt,
      metadata: {
        actorId: envelope.actor.id,
        client: envelope.client,
        channel: envelope.channel,
      },
    };
  }

  private async executeAction(
    action: Action,
    ctx: AdapterContext
  ): Promise<ActionResult> {
    const adapter = this.registry.get(action.resource.system);
    if (!adapter) {
      ctx.error("No adapter registered for system", { system: action.resource.system });
      return {
        actionId: action.id,
        status: "error",
        resource: action.resource,
        errorCode: "NO_ADAPTER",
        errorMessage: `No adapter registered for system '${action.resource.system}'`,
      };
    }

    try {
      return await adapter.handle(action, ctx);
    } catch (err: any) {
      ctx.error("Error executing action", { error: err?.message ?? String(err) });
      return {
        actionId: action.id,
        status: "error",
        resource: action.resource,
        errorCode: "EXECUTION_ERROR",
        errorMessage: err?.message ?? String(err),
      };
    }
  }
}
