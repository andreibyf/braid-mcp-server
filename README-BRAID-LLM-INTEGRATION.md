# Integrating `braid-llm-sdk` with a Braid MCP Server

This guide explains how to combine the [`braid-llm-sdk`](https://github.com/andreibyf/braid-llm-sdk) package with a generic Braid MCP server (like [`braid-mcp-server`](https://github.com/andreibyf/braid-mcp-server)) to enable AI-driven actions, including LLM-powered business automations.

---

## 1. Prerequisites

- A working Node.js environment.
- A Braid MCP Server project (see [`braid-mcp-server`](https://github.com/andreibyf/braid-mcp-server) for a reference implementation).
- The [`braid-llm-sdk`](https://github.com/andreibyf/braid-llm-sdk) package (either local clone or from npm if available).

---

## 2. Installation

1. **Clone your MCP server:**
   ```bash
   git clone https://github.com/example/braid-mcp-server.git
   cd braid-mcp-server
   ```

2. **Install the SDK:**
   - If from local path:
     ```bash
     npm install ../braid-llm-sdk
     ```
   - Or, if published:
     ```bash
     npm install @andreibyf/braid-llm-sdk
     ```

---

## 3. Create an Adapter Using the SDK

Add a new adapter—for example, in `src/adapters/llmAdapter.js`:

```javascript
// src/adapters/llmAdapter.js
const { runBraidLLMTool } = require("braid-llm-sdk");

module.exports = {
  system: "llm",
  async handle(action, ctx) {
    ctx.info("LLM Adapter received action", { verb: action.verb, resource: action.resource });
    if (!action.payload?.prompt) {
      return {
        actionId: action.id,
        status: "error",
        resource: action.resource,
        errorCode: "NO_PROMPT",
        errorMessage: "No prompt found in payload."
      };
    }

    try {
      const result = await runBraidLLMTool({ prompt: action.payload.prompt, ...action.payload.options });
      return {
        actionId: action.id,
        status: "success",
        resource: action.resource,
        data: result,
      };
    } catch (err) {
      ctx.error("LLM error", { error: err.message });
      return {
        actionId: action.id,
        status: "error",
        resource: action.resource,
        errorCode: "LLM_ERROR",
        errorMessage: err.message,
      };
    }
  },
};
```

---

## 4. Register Your Adapter

In your main server file (e.g. `src/server.js` or `src/server.ts`):

```javascript
const { AdapterRegistry } = require("./adapter-registry");
const llmAdapter = require("./adapters/llmAdapter");

const registry = new AdapterRegistry();
registry.register(llmAdapter);
// ... register other adapters as well
```

---

## 5. Example Braid Envelope for AI Actions

Send a POST request to your server’s `/mcp/run` endpoint, for example, using `curl` or Postman:

```json
{
  "requestId": "example-llm-1",
  "actor": { "id": "agent:dev", "type": "agent" },
  "createdAt": "2025-12-01T00:00:00Z",
  "client": "example-client",
  "channel": "dev",
  "actions": [
    {
      "id": "a1",
      "verb": "run",
      "actor": { "id": "agent:dev", "type": "agent" },
      "resource": { "system": "llm", "kind": "chat-completion" },
      "payload": {
        "prompt": "Summarize the Q4 CRM sales activities in 3 bullet points.",
        "options": {
          "temperature": 0.7,
          "max_tokens": 256
        }
      }
    }
  ]
}
```

This will invoke the LLM tooling behind-the-scenes and return the completed result in the ActionResult.

---

## 6. References and Further Customization

- Explore the [`braid-llm-sdk` usage docs](https://github.com/andreibyf/braid-llm-sdk#usage-examples) for more advanced features (tool calling, prompt templating, chaining, etc.).
- Extend the adapter or envelope types to support additional parameters, security, or streaming responses as needed.

---

## 7. Troubleshooting

- Ensure your server’s dependencies are up to date: `npm install`.
- Check logs for adapter errors if LLM calls fail.
- Make sure your LLM or API keys (if needed) are set in your environment.

---

**Enjoy creating AI-powered orchestration with Braid!**