# Changelog

All notable changes to this project
will be documented in this file.

The format is based on Keep a Changelog,
and this project adheres to Semantic Versioning
for its public contracts.

---

## [0.1.0] - 2025-12-29

### Added

- Mailbox contract (FIFO, non-blocking, in-memory reference)
- Runtime contract (single-threaded, actor execution authority)
- HTTP ingress contract (actor-safe, non-RPC)
- In-memory mailbox reference implementation
- Mailbox runtime loop
- Express HTTP ingress adapter
- Unit tests for mailbox, runtime, and ingress
- CI pipeline with test gate and conditional docs publish

### Notes

- This release freezes all core contracts.
- No persistence, retries, or durability guarantees are provided.
- This release is not intended for production workloads.
