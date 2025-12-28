# Mental Model

This document defines the mental model behind `mailbox-runtime-js`.

If you disagree with the ideas in this document,
you should not use this runtime.

This project is opinionated by design.

---

## The Core Idea

**All work happens by sending messages into a mailbox.**

There are:

- no synchronous calls between services
- no business decisions made over HTTP responses
- no shared state between actors

A service does not _call_ another service.
A service _sends a message_.

Messages enter a mailbox.
Actors process messages one at a time.
State is private and never shared.

If you expect a return value,
you are not using this runtime correctly.

---

## What We Mean by “Actor”

In this project, an actor is:

- a unit that owns its own state
- processes one message at a time
- reacts to messages, not function calls
- never exposes its internal state
- never returns business results to the caller

An actor may:

- update its own state
- send messages to other actors
- emit follow-up messages

An actor must NOT:

- call another service synchronously
- wait for another actor’s response
- read or mutate another actor’s state

---

## Mailbox as an Execution Boundary

The mailbox is the most important concept in this runtime.

A mailbox is:

- the only entry point for work
- a buffer between producers and consumers
- an isolation boundary for failures
- a natural concurrency limiter

There is no execution outside the mailbox.

HTTP handlers do not execute business logic.
They only deliver messages into the mailbox.

If code runs before a message enters the mailbox,
that code is considered infrastructure, not business logic.

---

## HTTP Is Transport, Not RPC

This runtime does not reject HTTP.
It rejects **RPC semantics**.

RPC is not defined by protocol.
RPC is defined by expectation.

If a service:

- sends a request
- waits for a response
- and decides what to do next based on that response

then it is doing RPC,
regardless of whether the API is RESTful.

In `mailbox-runtime-js`:

- HTTP is used only to deliver messages
- HTTP responses do not carry business meaning
- `202 Accepted` means “message received”, not “work completed”

Business success or failure is communicated via messages,
not HTTP responses.

---

## Fire-and-Forget Is Not a Shortcut

Fire-and-forget is not an optimization.
It is a **design constraint**.

By removing the ability to wait for results,
the system gains:

- failure isolation
- temporal decoupling
- simpler retry semantics
- clearer ownership boundaries

If a service crashes,
other services do not block waiting for it.

If a message fails,
it fails in isolation.

---

## State Ownership and Isolation

All state belongs to an actor.

State:

- is private
- is not shared
- is not queried directly by other services

If another service needs to know something,
it must:

- receive a message
- or query a read model

Shared databases between services
violate this model and are explicitly discouraged.

---

## Determinism Over Throughput

This runtime prioritizes:

- clarity over performance
- determinism over parallelism
- boring behavior over clever tricks

Actors process messages sequentially by design.
This is not a limitation.
It is a feature.

Concurrency is achieved by:

- having many actors
- not by parallelizing a single actor’s logic

---

## Failure Is Normal

Failures are expected.

In v0.1:

- messages may be lost
- state may be lost on crash
- retries are manual or external

This is intentional.

The goal is to enforce message-driven discipline,
not to provide durability guarantees.

Durability belongs to later stages
or to dedicated pub/sub systems.

---

## If This Feels Uncomfortable

That is expected.

This runtime intentionally removes:

- synchronous guarantees
- immediate feedback
- cross-service control flow

If your design depends on those,
this runtime is not a good fit.

`mailbox-runtime-js` is for systems that are ready to:

- think asynchronously
- accept eventual consistency
- model workflows as message graphs

---

## Summary

- Messages are the unit of work
- Mailboxes are execution boundaries
- Actors own their state
- HTTP delivers messages, nothing more
- No synchronous business decisions across services

If you keep these rules,
the system remains predictable.

If you break them,
you are no longer using this runtime as intended.
