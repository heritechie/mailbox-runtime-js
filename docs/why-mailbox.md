# Why Mailbox?

This document explains why `mailbox-runtime-js` exists,
and why it is built around the concept of a mailbox.

This is not a theoretical argument.
It is a response to recurring problems seen in real-world systems.

---

## The Problem This Project Addresses

Many teams build microservices using HTTP and REST.

At first, this works well:

- services are separated
- APIs are clear
- deployments are independent

Over time, a pattern emerges:

- services call each other synchronously
- business logic spans multiple services
- failures propagate across boundaries
- retries and timeouts multiply
- workflows become fragile

The system is “distributed” in deployment,
but still **synchronous in behavior**.

---

## Why Not Just Use REST Properly?

REST is not the problem.

The problem is **how REST is used**.

When HTTP is used to:

- request work
- wait for a result
- decide what to do next

it becomes a form of RPC,
regardless of how RESTful the API looks.

This creates:

- temporal coupling
- tight availability dependencies
- hidden orchestration logic

The issue is not HTTP.
The issue is synchronous business interaction.

---

## Why Not Jump Straight to Pub/Sub?

Many teams know the problems above
and immediately consider Kafka, NATS, or similar systems.

This jump often fails for different reasons:

- operational complexity increases sharply
- teams are not yet comfortable with asynchronous thinking
- RPC semantics are reintroduced on top of pub/sub
- events are used as delayed RPC calls

Infrastructure alone does not fix mental models.

Without discipline,
pub/sub systems amplify existing design problems.

---

## The Missing Middle Layer

There is a missing step between:

- synchronous HTTP RPC
- fully event-native systems

That missing step is **message discipline**.

Before introducing heavy infrastructure,
teams need to learn how to:

- stop waiting for results
- model workflows as message graphs
- accept eventual consistency
- localize state ownership

`mailbox-runtime-js` exists to fill this gap.

---

## Why a Mailbox?

A mailbox provides a concrete execution boundary.

It enforces that:

- work enters the system as messages
- processing is decoupled from delivery
- state changes happen in response to messages
- concurrency is explicit and controlled

Without a mailbox,
“actors” often degrade into:

- async functions
- background jobs
- or disguised RPC handlers

The mailbox makes message-driven execution unavoidable.

---

## Why In-Memory First?

In-memory mailboxes are intentional.

They force teams to focus on:

- correctness of message flows
- ownership of state
- failure handling semantics

They do not allow teams to hide behind:

- durability guarantees
- replay mechanisms
- infrastructure complexity

Losing messages during early stages is acceptable.
Losing clarity is not.

Durability can be added later.
Discipline cannot be retrofitted easily.

---

## Why This Is Not a Queue Library

Queues solve a different problem.

Queues optimize for:

- throughput
- durability
- fan-out

Mailboxes optimize for:

- isolation
- reasoning
- ownership
- sequential processing

Treating a mailbox as a generic queue
misses the point of this runtime.

---

## Why This Is Not an Actor Framework

Traditional actor frameworks often include:

- schedulers
- supervision trees
- remoting
- persistence
- clustering

Those features are powerful,
but they also impose heavy abstractions.

`mailbox-runtime-js` deliberately avoids this.

It provides:

- a minimal execution model
- explicit boundaries
- no hidden magic

The goal is not to replace actor frameworks,
but to introduce actor-style discipline
in environments that already use HTTP.

---

## When You Should Use This Runtime

This runtime is a good fit if:

- your system uses HTTP-based services
- synchronous calls are becoming fragile
- you want to move toward event-driven design
- you are not ready for pub/sub infrastructure yet

---

## When You Should Not Use This Runtime

This runtime is NOT a good fit if:

- you need high availability guarantees today
- you require durable message storage
- you need exactly-once semantics
- you are already fully event-native

In those cases,
a proper pub/sub system is a better choice.

---

## Summary

`mailbox-runtime-js` exists to enforce a missing discipline.

It does not solve distribution.
It does not solve durability.
It does not solve scaling.

It solves one thing:

> **How to stop thinking synchronously in a distributed system.**

Everything else can come later.
