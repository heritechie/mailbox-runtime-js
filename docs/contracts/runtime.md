# Runtime Contract

Status: **Stable (v0.1)**  
Audience: **Runtime implementers & system integrators**  
Scope: **Mailbox Runtime Behavior**  
Last updated: 2025-XX-XX

This document defines the **normative runtime contract**
for `mailbox-runtime-js`.

All runtime implementations **MUST** conform to this specification.

---

## 1. Purpose

The runtime is the **single authority for message execution**.

It is responsible for:

- consuming messages from the mailbox
- resolving actors
- invoking actor handlers
- enforcing execution discipline

The runtime **owns execution**, not HTTP, not actors, not clients.

---

## 2. Core Principle

> **Messages are delivered to the runtime.  
> The runtime decides when and how they are executed.**

No external component may bypass or control runtime execution.

---

## 3. Runtime Responsibilities

A runtime implementation **MUST**:

1. Pull messages from the mailbox
2. Resolve an actor based on message type
3. Invoke the actor handler
4. Execute messages sequentially
5. Isolate failures between messages

A runtime implementation **MUST NOT**:

- expose execution results to callers
- allow concurrent execution of multiple messages
- delegate execution authority to ingress or actors

---

## 4. Execution Model

### Single-Threaded Authority

- Only **one message** may be executed at a time
- Message execution MUST be sequential
- Parallel execution is forbidden in v0.1

```text
dequeue → execute → dequeue → execute → ...
```

### Pull-Based Processing

- The runtime MUST pull messages from the mailbox
- The mailbox MUST NOT push messages into the runtime
- Idle behavior is runtime-defined

---

## 5. Actor Resolution

### Actor Registry

- Actors are registered by message type
- Each message type maps to at most one actor
- Registration is a setup-time operation

If no actor is registered for a message type:

- The message MUST be dropped silently in v0.1

---

## 6. Actor Execution Semantics

### Invocation

For each message:

```text
actor.handle(message)
```

Rules:

- The runtime MUST await completion of `handle`
- The runtime MUST NOT invoke multiple actors concurrently
- The runtime MUST NOT return execution results

### Failure Handling

If `actor.handle` throws an error:

- The runtime MUST catch the error
- The runtime MUST continue processing subsequent messages
- The runtime MUST NOT crash or halt
- The failed message is considered consumed

Retry, backoff, or dead-letter behavior is out of scope.

---

## 7. Delivery Semantics

### Runtime.deliver

- deliver(message) MUST enqueue the message
- deliver(message) MUST be synchronous
- deliver(message) MUST NOT execute actors
- deliver(message) MUST NOT block on execution
  Delivering a message does not imply execution.

---

## 8. Lifecycle Contract

### Start

- `start()` activates the runtime loop
- Calling `start()` multiple times MUST be idempotent

### Stop

- `stop()` halts the runtime loop
- No guarantee is made that all messages are drained
- Graceful shutdown is out of scope for v0.1

## 9. Ordering Guarantees

- Messages MUST be executed in mailbox order (FIFO)
- No reordering is permitted by the runtime
- Ordering guarantees apply only within a single runtime instance

---

## 10. Explicit Non-Guarantees

The runtime **does not guarantee**:

- message durability
- crash recovery
- retries or backoff
- exactly-once execution
- parallelism or throughput
- distributed coordination

These concerns belong to **infrastructure layers**, not the core runtime.

---

## 11. Forbidden Patterns

### ❌ Runtime as RPC Engine

The runtime MUST NOT:

- return values to ingress
- expose execution state
- support request–response semantics

### ❌ Actor-Controlled Execution

Actors MUST NOT:

- dequeue messages
- control scheduling
- trigger execution of other actors

## 12. Observability

- The runtime MAY:
- log execution errors
- expose metrics
- emit execution events

Such features MUST NOT alter execution semantics.

---

## 13. Versioning & Stability

- This contract is stable for v0.1
- Breaking changes require a new contract version
- Runtime extensions MUST preserve this contract

---

## 14. Summary

```text
Runtime owns execution.
Mailbox provides work.
Actors provide behavior.
```

Any violation of this separation
breaks the actor model guarantees.

---

### Status

This document is the authoritative runtime contract
for `mailbox-runtime-js`.

All runtime implementations MUST comply with this specification.
