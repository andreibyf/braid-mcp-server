import { Adapter, AdapterContext } from "../adapter-registry";
import { Action, ActionResult } from "../braid-types";

export const mockAdapter: Adapter = {
  system: "mock",

  async handle(action: Action, ctx: AdapterContext): Promise<ActionResult> {
    ctx.debug("Mock adapter handling action", {
      actionId: action.id,
      verb: action.verb,
      resource: action.resource,
    });

    return {
      actionId: action.id,
      status: "success",
      resource: action.resource,
      data: {
        echo: true,
        action,
        note: "Mock adapter – replace with a real business adapter.",
      },
    };
  },
};
