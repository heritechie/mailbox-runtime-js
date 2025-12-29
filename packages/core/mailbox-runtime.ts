import { Runtime } from "./runtime";
import { Mailbox } from "./mailbox";
import { Actor } from "./actor";
import { ActorMessage } from "./message";

/**
 * MailboxRuntime is a minimal single-threaded runtime loop.
 *
 * Responsibilities:
 * - pull messages from mailbox
 * - route messages to actors
 * - invoke actors sequentially
 *
 * It provides no retries, persistence, or concurrency.
 */
export class MailboxRuntime implements Runtime {
  private running = false;

  private readonly mailbox: Mailbox;
  private readonly registry: Map<string, Actor>;
  private readonly idleDelayMs: number;

  constructor(opts: { mailbox: Mailbox; idleDelayMs?: number }) {
    this.mailbox = opts.mailbox;
    this.idleDelayMs = opts.idleDelayMs ?? 10;
    this.registry = new Map();
  }

  /**
   * Register an actor for a given message type.
   *
   * This is runtime setup, not a dynamic operation.
   */
  register(type: string, actor: Actor): void {
    this.registry.set(type, actor);
  }

  /**
   * Deliver a message into the runtime.
   *
   * This enqueues the message only.
   */
  deliver(message: ActorMessage): void {
    this.mailbox.enqueue(message);
  }

  /**
   * Start the runtime processing loop.
   */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.loop();
  }

  /**
   * Stop the runtime processing loop.
   */
  stop(): void {
    this.running = false;
  }

  /**
   * Internal processing loop.
   */
  private async loop(): Promise<void> {
    while (this.running) {
      const message = this.mailbox.dequeue();

      if (!message) {
        await this.sleep(this.idleDelayMs);
        continue;
      }

      const actor = this.registry.get(message.type);

      if (!actor) {
        // Unknown message type: drop silently (v0.1)
        continue;
      }

      try {
        await actor.handle(message);
      } catch (err) {
        // v0.1: log & continue
        // No retries, no crash
        console.error("Actor execution failed", {
          type: message.type,
          message_id: message.message_id,
          error: err,
        });
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
