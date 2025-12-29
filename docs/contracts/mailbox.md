# Mailbox Contract

Status: **Stable (v0.1)**  
Audience: **Runtime implementers & infrastructure integrators**  
Scope: **Message buffering and ordering**  
Last updated: 2025-XX-XX

This document defines the **normative mailbox contract**
for `mailbox-runtime-js`.

All mailbox implementations **MUST** conform to this specification.

---

## 1. Purpose

The mailbox is a **buffer between message delivery and execution**.

It exists to:

- decouple message ingress from execution
- preserve execution order
- prevent direct execution by external components

The mailbox **does not execute messages**.

---

## 2. Core Principle

> **Mailbox stores intent.  
> Runtime executes intent.**

The mailbox is **passive** and **authority-free**.

---

## 3. Responsibilities

A mailbox implementation **MUST**:

1. Accept messages via `enqueue`
2. Provide messages via `dequeue`
3. Preserve message ordering
4. Expose queue size for observability

A mailbox implementation **MUST NOT**:

- execute actors
- schedule execution
- retry messages
- inspect message semantics
- know about actors or runtime internals

---

## 4. Interface Contract

The mailbox interface is conceptually defined as:

```ts
interface Mailbox {
  enqueue(message: ActorMessage): void;
  dequeue(): ActorMessage | undefined;
  size(): number;
}
```
