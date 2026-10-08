# DevLab Logs Agent Guidelines

Master guidelines for AI agents developing on **DevLab Logs (Centralized Telemetry & Log-RAG Platform)**.

All agents must adhere to:

1. **Hard 250-Line Maximum Rule**: No file in `agent/` (Go), `ingest/` (TS), `web/` (TS), or `storage/` may exceed 250 lines. Decompose early at 200 lines.
2. **Detailed JSDoc & Go Doc**: Every exported symbol must have exhaustive documentation.
3. **Strict Database Casing**: All tables, partitions, columns, and DB enums must strictly use lowercase `snake_case`.
4. **Zero Magic Strings & Clean Types**: Use canonical enums and strict Zod validation.
5. **Quality Gates & Conventional Commits**: All commits must pass husky commitlint (`feat(scope): ...`).
