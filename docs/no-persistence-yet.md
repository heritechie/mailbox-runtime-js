# No Persistence (Yet)

This document explains why `mailbox-runtime-js` does not include
a persistence layer by default in its early versions.

This is a deliberate design decision,
not a missing feature.

---

## The Short Answer

Persistence is intentionally out of scope for v0.1.

The primary goal of `mailbox-runtime-js` is to enforce
**message-driven discipline**, not to provide durability guarantees.

---

## What Persistence Usually Solves

Persistence is commonly introduced to achieve:

- message durability
- crash recovery
- replay and auditing
- at-least-once or exactly-once semantics

These are important goals.
They are simply **not the first goals** of this runtime.

---

## The Actual Problem We Are Solving First

Most systems do not fail because they lack persistence.

They fail because:

- business logic is spread across services
- synchronous assumptions leak everywhere
- retries are implicit and uncontrolled
- failures cascade through call stacks

Adding persistence does not fix these problems.
It often hides them.

Before durability matters,
the system must first learn how to behave asynchronously.

---

## In-Memory as a Design Tool

An in-memory mailbox is not a compromise.
It is a design tool.

It forces teams to confront questions such as:

- What happens if a message is lost?
- How does the system react to partial failure?
- Which actor truly owns this state?
- What does eventual consistency mean here?

These questions must be answered
before durability can be meaningfully added.

---

## Acceptable Failures (v0.1)

In early versions, the following are explicitly acceptable:

- messages may be lost on crash
- in-flight work may disappear
- state may reset on restart
- retries may be manual or external

These are not bugs.
They are constraints that expose design flaws early.

---

## Why Adding Persistence Too Early Is Dangerous

Introducing persistence too early often leads to:

- treating the mailbox as a generic queue
- reintroducing RPC semantics with retries
- hiding unclear ownership behind durability
- premature optimization of failure modes

Once persistence is added,
changing message semantics becomes much harder.

Discipline should come first.
Durability should follow.

---

## Persistence as an Extension Point

While persistence is not included by default,
the design anticipates it as an **extension**, not a core feature.

The runtime is structured so that:

- the mailbox is an abstraction
- in-memory is a reference implementation
- persistent mailboxes can be added later

Examples of future extensions may include:

- Redis-backed mailbox
- database-backed mailbox
- integration with external message brokers

These will live in separate packages,
not in the core runtime.

---

## Relationship to Pub/Sub Systems

When a system is ready for pub/sub:

- the mailbox abstraction may be replaced
- or bypassed entirely
- by a dedicated message broker

At that stage,
durability and replay are handled by the broker,
not by this runtime.

This is intentional.

`mailbox-runtime-js` is a stepping stone,
not a destination.

---

## When Persistence Becomes Necessary

Persistence becomes necessary when:

- message loss is unacceptable
- recovery after crashes is required
- auditability is mandatory
- the system has stabilized semantically

By that point,
the team should already be comfortable with:

- asynchronous workflows
- eventual consistency
- message-based reasoning

Only then does persistence add value
instead of confusion.

---

## Summary

`mailbox-runtime-js` does not include persistence yet because:

- discipline comes before durability
- clarity comes before guarantees
- semantics come before infrastructure

Persistence will come later,
as an option,
when the system is ready for it.
