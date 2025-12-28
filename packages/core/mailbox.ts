import { ActorMessage } from "./message";

/**
 * Mailbox is an execution boundary between message delivery
 * and message processing.
 *
 * The mailbox:
 * - buffers incoming messages
 * - decouples producers from consumers
 * - limits concurrency by design
 *
 * A mailbox is NOT:
 * - a generic job queue
 * - a persistence mechanism
 * - a workflow engine
 *
 * In v0.1, mailboxes are expected to be in-memory.
 * Persistence is an extension concern.
 */
export interface Mailbox {
  /**
   * Enqueue a message for future processing.
   *
   * This method MUST NOT execute the message.
   * It only records intent for later handling.
   */
  enqueue(message: ActorMessage): void;

  /**
   * Dequeue the next message for processing.
   *
   * Ordering guarantees depend on the mailbox implementation.
   */
  dequeue(): ActorMessage | undefined;

  /**
   * Return the current number of queued messages.
   *
   * Used for observability and backpressure decisions.
   */
  size(): number;
}
