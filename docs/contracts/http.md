# HTTP Ingress Contract

Status: **Stable (v0.1)**  
Audience: **API consumers & service integrators**  
Scope: **HTTP → Mailbox Runtime**  
Last updated: 2025-12-29

This document defines the **normative HTTP contract**
for `mailbox-runtime-js`.

All HTTP ingress implementations **MUST** conform to this specification.

---

## 1. Purpose

The HTTP ingress exists **only as an entry point** to the mailbox runtime.

It is a **transport adapter**, not an execution layer.

HTTP ingress **does not**:

- execute actors
- wait for actor results
- return business outcomes
- guarantee message processing success

---

## 2. Core Principle

> **HTTP accepts messages.  
> Actors process messages independently.**

There is **no request–response coupling**
between HTTP requests and actor execution.

---

## 3. Endpoint Contract

### Canonical Endpoint

```http
POST /messages/:type
```

### Optional Alias (Non-Canonical)

```http
POST /inbox/:type
```

Notes:

- /messages/:type is the public and stable contract
- /inbox/:type MAY exist as an alias
- External consumers MUST NOT rely on /inbox/:type

---

## 4. Request Contract

### Headers

```http
Content-Type: application/json
```

No additional headers are required by this contract.

---

### Body

```json
{
  "payload": <any valid JSON value>
}
```

Rules:

- payload MAY be omitted
- payload MAY be any valid JSON value
- HTTP ingress MUST NOT validate payload semantics
