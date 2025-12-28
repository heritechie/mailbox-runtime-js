// packages/core/message.ts

export type MessageId = string;
export type ActorType = string;
export type ServiceName = string;
export type ISO8601 = string;

/**
 * ActorMessage is the only unit of work in mailbox-runtime-js.
 *
 * A message represents intent, not execution.
 * It is immutable and must be safe to serialize across transports
 * such as HTTP, queues, or future pub/sub systems.
 *
 * Message delivery does not imply execution, completion, or success.
 * Business outcomes must be communicated via follow-up messages,
 * never via synchronous return values.
 */
export interface ActorMessage<T = unknown> {
  /**
   * Globally unique identifier for this message.
   * Used for idempotency and deduplication.
   */
  message_id: MessageId;

  /**
   * Logical message type.
   * Used by the runtime to route the message to an actor.
   */
  type: ActorType;

  /**
   * Logical sender of the message.
   * Typically a service name or system boundary.
   */
  source: ServiceName;

  /**
   * Intended logical recipient of the message.
   * Used for intent clarity and observability.
   */
  target: ServiceName;

  /**
   * Message creation timestamp in ISO-8601 format.
   */
  timestamp: ISO8601;

  /**
   * Domain-specific payload.
   * Must be JSON-serializable and treated as immutable.
   */
  payload: T;
}
