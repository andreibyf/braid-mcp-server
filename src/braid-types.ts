export type ActorType = "user" | "agent" | "system";

export interface Actor {
  id: string;
  type: ActorType;
  roles?: string[];
}

export type Verb =
  | "read"
  | "search"
  | "create"
  | "update"
  | "delete"
  | "run";

export interface ResourceRef {
  system: string;
  kind: string;
}

export interface Filter {
  field: string;
  op: "eq" | "contains" | "lt" | "gt" | "in";
  value: unknown;
}

export interface Sort {
  field: string;
  direction: "asc" | "desc";
}

export interface ExecutionOptions {
  timeoutMs?: number;
  dryRun?: boolean;
  maxItems?: number;
  strict?: boolean;
  traceId?: string;
}

export interface Action {
  id: string;
  verb: Verb;
  actor: Actor;
  resource: ResourceRef;
  targetId?: string;
  filters?: Filter[];
  sort?: Sort[];
  payload?: Record<string, unknown>;
  options?: ExecutionOptions;
  metadata?: Record<string, unknown>;
}

export type ResultStatus = "success" | "partial" | "error";

export interface ActionResult {
  actionId: string;
  status: ResultStatus;
  resource: ResourceRef;
  data?: unknown;
  errorCode?: string;
  errorMessage?: string;
  details?: Record<string, unknown>;
}

export interface BraidRequestEnvelope {
  requestId: string;
  actor: Actor;
  actions: Action[];
  createdAt: string;
  client?: string;
  channel?: string;
  metadata?: Record<string, unknown>;
}

export interface BraidResponseEnvelope {
  requestId: string;
  results: ActionResult[];
  startedAt: string;
  finishedAt: string;
  metadata?: Record<string, unknown>;
}
