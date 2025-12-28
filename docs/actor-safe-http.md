# Actor-Safe HTTP

This document defines how HTTP is used in `mailbox-runtime-js`.

HTTP is treated strictly as a **message transport**.
It is not used for business interaction, orchestration, or decision making.

If you expect HTTP to return business outcomes,
you are not using this runtime correctly.

---

## The One and Only Endpoint

All commands enter the system through a single endpoint:

```http
POST /messages
```

There are no command-specific endpoints such as:

- `/charge`
- `/reserve-stock`
- `/confirm-payment`

Those endpoints imply RPC semantics and are explicitly discouraged.

---

### Message Delivery Semantics

An HTTP request represents message delivery, nothing more.

When a request is accepted:

```http
HTTP/1.1 202 Accepted
```

This response means:

> “The message has been accepted into the mailbox.”

It does NOT mean:

- the work has started
- the work has completed
- the work has succeeded

Business outcomes are communicated via messages,
not HTTP responses.

---

### Message Envelope

Every HTTP request body MUST conform to the message envelope.

```ts
export interface ActorMessage<T = unknown> {
  message_id: string;
  type: string;
  source: string;
  target: string;
  timestamp: string;
  payload: T;
}
```

### Rules

- Messages are immutable
- Messages must be idempotent
- Messages carry intent, not behavior
- Message validation happens at ingress

If a message is malformed,
the server may reject it with 400 Bad Request.

---

HTTP Response Rules

Allowed Responses

| Status                      | Meaning                       |
| --------------------------- | ----------------------------- |
| `202 Accepted`              | Message accepted into mailbox |
| `400 Bad Request`           | Invalid message format        |
| `413 Payload Too Large`     | Message exceeds limits        |
| `429 Too Many Requests`     | Mailbox backpressure          |
| `500 Internal Server Error` | Infrastructure failure        |

### Forbidden Responses

The following are explicitly forbidden:

- Returning business status
- Returning domain data
- Returning workflow results

Examples of invalid responses:

```json
{ "status": "paid" }
```

```json
{ "order_state": "confirmed" }
```

```json
{ "error": "insufficient balance" }
```

Business errors are not HTTP errors.

They are messages.

---

### Business Results Are Messages

If an operation succeeds or fails,

the result MUST be communicated via a follow-up message.

Example:

```json
{
  "message_id": "msg-002",
  "type": "PaymentFailed",
  "source": "payment-service",
  "target": "order-service",
  "timestamp": "2025-01-01T10:00:00Z",
  "payload": {
    "order_id": "ORD-123",
    "reason": "INSUFFICIENT_FUNDS"
  }
}
```

The caller does not wait.

The caller reacts when (and if) the message arrives.

---

### No Synchronous Cross-Service Calls

An HTTP handler MUST NOT:

- call another service synchronously
- await a business result
- branch logic based on remote responses
- orchestrate workflows

The handler’s responsibility ends when the message is enqueued.

All business logic happens after the message enters the mailbox.

---

### Idempotency

Ingress MUST be idempotent.

If the same message_id is received multiple times:

- it must not be processed multiple times
- the server should still return 202 Accepted

Idempotency is required to support:

- retries
- network failures
- client uncertainty

---

### Error Handling Philosophy

HTTP errors indicate transport or infrastructure issues, not business outcomes.

Examples:

- Invalid JSON → 400
- Message too large → 413
- Mailbox overloaded → 429
- Runtime crash → 500

Business failures:

- insufficient balance
- invalid state transition
- domain validation failures

These are messages, not HTTP errors.

---

### Queries Are a Separate Concern

This document applies to commands only.

Read operations may:

- use synchronous HTTP
- return data
- use REST or GraphQL

However:

- queries MUST NOT cause side effects
- commands MUST NOT return data

This separation is intentional.

---

Why This Is Strict

These rules exist to prevent:

- RPC disguised as messaging
- failure propagation across services
- tight temporal coupling
- hidden orchestration logic

Breaking these rules may appear convenient,
but it undermines the entire runtime model.

---

### Summary

- HTTP delivers messages, nothing more
- /messages is the only command endpoint
- 202 Accepted has no business meaning
- Business results are messages
- No synchronous service-to-service calls

If these rules are followed, HTTP becomes a safe transport layer for actor-style, message-driven systems.
