# Anti-Patterns

This document lists common anti-patterns that violate the design principles
of `mailbox-runtime-js`.

These patterns often look reasonable, familiar, or convenient.
They are explicitly discouraged.

If you find yourself implementing any of these,
you are likely reintroducing RPC semantics into a message-driven system.

---

## 1. Async RPC Disguised as Messaging

### What it looks like

```ts
await sendMessage("payment-service", message);
const result = await waitForResult(message.message_id);

if (result.success) {
  continueWorkflow();
}
```

### Why this is wrong

This is still RPC.

- the caller waits
- the caller blocks its control flow
- the business decision depends on a remote result

The fact that the transport is asynchronous
does not change the semantics.

### Correct approach

- send the message
- return immediately
- react when (and if) a follow-up message arrives

---

## 2. Returning Business Results Over HTTP

What it looks like

```http
POST /messages
```

```json
{
  "status": "payment_successful",
  "transaction_id": "tx-123"
}
```

### Why this is wrong

HTTP responses are being used to communicate domain outcomes.
This couples the caller to the callee’s availability and timing.

## Correct approach

Return:

```http
202 Accepted
```

Then send a message such as PaymentSucceeded or PaymentFailed.

---

## 3. Orchestrating Workflows in HTTP Handlers

### What it looks like

```ts
app.post("/messages", async (req, res) => {
  await validateOrder();
  await callPayment();
  await reserveInventory();
  res.status(202).end();
});
```

### Why this is wrong

HTTP handlers must not contain business workflows.

- failures propagate immediately
- retries become implicit
- ordering becomes accidental

### Correct approach

- validate message
- enqueue message
- return 202

Workflow logic belongs inside actors, not HTTP request lifecycles.

---

## 4. Shared Databases Between Services

### What it looks like

- multiple services reading/writing the same tables
- services checking each other’s state via SQL

### Why this is wrong

Shared databases violate actor isolation.

- state ownership becomes unclear
- invariants leak across boundaries
- actors can no longer reason locally

### Correct approach

- each service owns its data
- cross-service knowledge is communicated via messages
- queries use read models, not shared writes

---

## 5. Retrying in the Caller

### What it looks like

```ts
for (let i = 0; i < 3; i++) {
  try {
    await sendMessage(msg);
    break;
  } catch {
    await delay(1000);
  }
}
```

### Why this is wrong

Retry logic in the caller creates:

- retry storms
- cascading failures
- unpredictable load

### Correct approach

- ingress should be idempotent
- retries belong to the mailbox or runtime
- callers should assume uncertainty is normal

---

### 6. Expecting Ordering Without Modeling It

### What it looks like

```ts
sendMessage("CreateOrder");
sendMessage("ChargePayment");
sendMessage("ShipOrder");
```

Assuming messages will be processed in that order.

### Why this is wrong

In distributed systems, ordering is not guaranteed by default.

Assuming implicit ordering leads to subtle bugs.

### Correct approach

- encode ordering explicitly (e.g. sequence numbers)
- or design actors to handle out-of-order messages safely

---

## 7. Using the Mailbox as a Generic Queue

### What it looks like

- pushing arbitrary jobs into the mailbox
- treating actors as background workers
- mixing unrelated workloads

### Why this is wrong

The mailbox is not a job queue.
It is an execution boundary for domain messages.

Using it as a generic queue dilutes:

- intent
- ownership
- reasoning

### Correct approach

messages represent domain intent

actors represent domain responsibilities

background jobs belong elsewhere

---

## 8. Modeling Everything as a Single Actor

### What it looks like

- one actor handling all message types
- giant switch statements
- shared mutable state

### Why this is wrong

This recreates a monolith inside an actor shell.

- state grows uncontrollably
- reasoning becomes harder
- concurrency benefits disappear

### Correct approach

- small actors with clear responsibilities
- state scoped to a single concern
- composition through messaging

---

## 9. Treating Fire-and-Forget as “Best Effort”

### What it looks like

- assuming messages will always arrive
- ignoring failure paths
- no follow-up handling

### Why this is wrong

Fire-and-forget does not mean “forget forever”.

It means:

- no immediate coupling
- delayed reaction
- explicit modeling of outcomes

### Correct approach

- model success and failure explicitly
- handle missing messages as valid states
- design for eventual consistency

## 10. Adding Persistence Too Early

### What it looks like

- adding a database-backed queue immediately
- introducing durability before discipline
- optimizing for safety before correctness

### Why this is wrong

Persistence does not fix architectural mistakes.
It makes them harder to change.

### Correct approach

- enforce message-driven discipline first
- accept loss during early phases
- introduce durability only when semantics are clear

## Summary

If you encounter bugs, complexity, or confusion,
check whether one of these anti-patterns has crept in.

Most failures in message-driven systems
are not caused by missing infrastructure,
but by leaking synchronous thinking
into asynchronous designs.

Avoid these patterns,
and the system remains understandable.
