import { Adapter, AdapterContext } from "../adapter-registry";
import { Action, ActionResult } from "../braid-types";

/**
 * Generic adapter for a real business system.
 * Implement your own mapping from (verb, resource.kind) to real APIs / SDK calls.
 */
export const businessAdapter: Adapter = {
  system: "business",

  async handle(action: Action, ctx: AdapterContext): Promise<ActionResult> {
    ctx.info("Business adapter received action", {
      verb: action.verb,
      resource: action.resource,
    });

    // TODO: Implement:
    // - Map action.verb + action.resource.kind + payload to your business API.
    // - Call your REST/GraphQL/SDK.
    // - Wrap the response in an ActionResult.

    return {
      actionId: action.id,
      status: "error",
      resource: action.resource,
      errorCode: "NOT_IMPLEMENTED",
      errorMessage:
        "businessAdapter is a template. Implement business-specific logic here.",
    };
  },
};
