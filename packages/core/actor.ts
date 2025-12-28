import { ActorMessage } from "./message";

/**
 * Actor represents a state-owning unit of behavior.
 *
 * An actor:
 * - owns its internal state
 * - processes one message at a time
 * - never exposes its state directly
 * - never returns business results to callers
 *
 * Actors MUST NOT:
 * - call other actors synchronously
 * - wait for remote responses
 * - access shared mutable state
 *
 * Actors MAY:
 * - update their own state
 * - emit follow-up messages
 *
 * Throwing an error signals execution failure to the runtime,
 * not a business-level rejection.
 */
export interface Actor {
  /**
   * Handle a single message.
   *
   * This method is invoked by the runtime,
   * never directly by user code.
   *
   * @param message - The message being processed.
   */
  handle(message: ActorMessage): Promise<void>;
}
