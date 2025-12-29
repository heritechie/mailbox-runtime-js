import { Request, Response } from "express";
import { Runtime } from "../core/runtime";
import { ActorMessage } from "../core/message";
import crypto from "crypto";

export interface ExpressIngressOptions {
  runtime: Runtime;
  sourceName?: string;
}

/**
 * Create an Express handler that delivers HTTP requests
 * into the mailbox runtime.
 *
 * This handler:
 * - does NOT execute actors
 * - does NOT await results
 * - returns immediate acknowledgement
 */
export function createExpressIngress(opts: ExpressIngressOptions) {
  const source = opts.sourceName ?? "http";

  return function handler(req: Request, res: Response) {
    const type = req.params.type;

    if (!type) {
      res.status(400).json({ error: "Missing message type" });
      return;
    }

    const message: ActorMessage = {
      message_id: crypto.randomUUID(),
      type,
      source,
      target: "runtime",
      timestamp: new Date().toISOString(),
      payload: req.body?.payload,
    };

    try {
      opts.runtime.deliver(message);
    } catch (err) {
      // runtime deliver SHOULD NOT throw,
      // but guard just in case
      res.status(500).json({ error: "Failed to deliver message" });
      return;
    }

    res.status(202).json({
      accepted: true,
      message_id: message.message_id,
    });
  };
}
