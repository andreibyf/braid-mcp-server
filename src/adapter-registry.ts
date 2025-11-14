import { Action, ActionResult } from "./braid-types";

export interface AdapterContext {
  debug: (msg: string, meta?: unknown) => void;
  info: (msg: string, meta?: unknown) => void;
  warn: (msg: string, meta?: unknown) => void;
  error: (msg: string, meta?: unknown) => void;
}

export interface Adapter {
  system: string;
  handle(action: Action, ctx: AdapterContext): Promise<ActionResult>;
}

export class AdapterRegistry {
  private readonly adapters = new Map<string, Adapter>();

  register(adapter: Adapter): void {
    if (!adapter.system) {
      throw new Error("Adapter.system must be defined");
    }
    if (this.adapters.has(adapter.system)) {
      throw new Error(`Adapter for system '${adapter.system}' already registered`);
    }
    this.adapters.set(adapter.system, adapter);
  }

  get(system: string): Adapter | undefined {
    return this.adapters.get(system);
  }
}
