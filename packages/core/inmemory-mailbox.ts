import { Mailbox } from "./mailbox";
import { ActorMessage } from "./message";

/**
 * InMemoryMailbox is a minimal FIFO mailbox implementation.
 *
 * This mailbox:
 * - stores messages in memory
 * - preserves enqueue order (FIFO)
 * - does not block
 * - does not perform scheduling
 * - does not provide durability guarantees
 *
 * It is intended as a reference implementation
 * for mailbox behavior, not as a production queue.
 */
export class InMemoryMailbox implements Mailbox {
  private queue: ActorMessage[] = [];

  /**
   * Enqueue a message for future processing.
   *
   * This method does not execute the message
   * and does not perform validation.
   */
  enqueue(message: ActorMessage): void {
    this.queue.push(message);
  }

  /**
   * Dequeue the next message in FIFO order.
   *
   * Returns undefined if the mailbox is empty.
   * This method never blocks.
   */
  dequeue(): ActorMessage | undefined {
    if (this.queue.length === 0) {
      return undefined;
    }

    return this.queue.shift();
  }

  /**
   * Return the number of queued messages.
   *
   * This value is intended for observability only.
   */
  size(): number {
    return this.queue.length;
  }
}
