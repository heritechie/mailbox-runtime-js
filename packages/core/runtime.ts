import { ActorMessage } from "./message";
import { Actor } from "./actor";

/**
 * INTERNAL ONLY.
 *
 * ActorRegistry maps message types to actors.
 * It must never be exposed to user code.
 *
 * Bypassing the runtime and invoking actors directly
 * violates mailbox isolation guarantees.
 */
interface ActorRegistry {
  register(type: string, actor: Actor): void;
  get(type: string): Actor | undefined;
}

/**
 * Runtime is the single authority responsible for
 * message scheduling and actor execution.
 *
 * The runtime:
 * - receives messages via deliver()
 * - enqueues them into a mailbox
 * - routes messages to actors
 * - invokes actors sequentially
 *
 * The runtime does NOT:
 * - return business results
 * - expose actor instances
 * - provide persistence guarantees
 * - guarantee message ordering across restarts
 */
export interface Runtime {
  /**
   * Deliver a message into the runtime.
   *
   * This method:
   * - enqueues the message
   * - does not execute the actor immediately
   * - does not return execution results
   *
   * Delivery does not imply successful processing.
   */
  deliver(message: ActorMessage): void;

  /**
   * Start the runtime processing loop.
   *
   * Until start() is called,
   * delivered messages will not be processed.
   */
  start(): void;

  /**
   * Stop the runtime processing loop.
   *
   * This method:
   * - halts message processing
   * - makes no guarantees about in-flight messages
   * - does not perform graceful shutdown in v0.1
   */
  stop(): void;
}
