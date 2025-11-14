# Braid MCP Server (Generic Business Gateway)

A lightweight Node.js + TypeScript server that exposes a **Braid-style action envelope** over HTTP in an **MCP-friendly** way, and routes those actions into one or more **business systems** (CRM, ERP, billing, etc.) via pluggable adapters.

---

## Problem

Modern AI assistants need to perform structured operations against existing business systems:

- Read single entities (customers, orders, invoices, accounts).
- Search and filter lists of records.
- Create, update, or delete entities.
- Do this safely across multiple systems (CRM, ERP, billing, custom).

Typical issues:

- Each AI use case speaks directly to different REST APIs with ad-hoc JSON shapes.
- There is no single, stable contract for “AI-triggered business actions”.
- Adding or changing a back-end system breaks prompts, tools, and glue code.
- Security and policy enforcement are scattered across many endpoints.

**Result:** fragile integrations, duplicated logic, and poor observability.

---

## Root Cause

The underlying causes usually look like this:

- **Tight coupling** of AI code to specific endpoints or database schemas.
- **No common envelope** for actions and results: every tool defines its own JSON format.
- **No central executor**: each service makes its own policy decisions.
- **Difficult multi-system orchestration**: AI must understand CRM, ERP, billing, etc. individually.

Without a shared protocol, it’s hard to evolve systems safely while keeping AI tools stable.

---

## Solution

Introduce a **Braid MCP Server**:

- A single HTTP endpoint, `POST /mcp/run`, that:
  - Accepts a **`BraidRequestEnvelope`** (batch of actions).
  - Returns a **`BraidResponseEnvelope`** (batch of results).
- An internal **executor** that:
  - Validates the envelope.
  - Routes each `Action` to an **Adapter** based on `resource.system`
    (e.g. `"crm"`, `"erp"`, `"billing"`, `"custom"`).
  - Normalizes all outcomes into `ActionResult` objects.
- A set of **adapters** that translate generic actions into:
  - HTTP calls to existing APIs,
  - SDK or DB operations,
  - or any internal integration mechanism.
- A **Dockerized** Node/TypeScript service, so your AI stack can treat it as an **MCP-style remote tool**.

This provides:

- One stable MCP endpoint for AI tools.
- A pluggable adapter model for multiple business systems.
- A central place to add logging, tracing, and policy enforcement.

---

## Implementation

### Project Layout

```text
braid-mcp-server/
  README.md
  package.json
  tsconfig.json
  Dockerfile
  docker-compose.yml
  src/
    braid-types.ts
    adapter-registry.ts
    braid-executor.ts
    server.ts
    adapters/
      mockAdapter.ts
      businessAdapter.ts
```

See source files for detailed implementation.

---

## Testing

```bash
npm install
npm run build
npm start
# Server listens on http://localhost:8000

curl http://localhost:8000/health

curl -X POST http://localhost:8000/mcp/run \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "demo-1",
    "actor": { "id": "agent:test", "type": "agent" },
    "createdAt": "2025-01-01T00:00:00.000Z",
    "client": "demo-client",
    "channel": "agent",
    "actions": [{
      "id": "a1",
      "verb": "read",
      "actor": { "id": "agent:test", "type": "agent" },
      "resource": { "system": "mock", "kind": "example-entity" }
    }]
  }'
```

You should receive a `BraidResponseEnvelope` with a single successful `ActionResult` echoing the request from the mock adapter.

---

## Result & Conclusion

This project provides a generic, MCP-style Braid server that can front any business system:

- AI clients send `BraidRequestEnvelope` objects to a single `/mcp/run` endpoint.
- Adapters encapsulate system-specific logic (REST, SDK, database, etc.).
- The executor and HTTP server offer a single, auditable entry point for all AI-triggered business actions.

To adopt it:

1. Implement your real adapter(s) in `src/adapters/businessAdapter.ts` or additional files.
2. Point them at your existing business systems.
3. Wire your LLM/tooling to call this server instead of individual business APIs.
