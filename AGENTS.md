# DevLab Logs Agent Guidelines

Master guidelines for AI agents developing on **DevLab Logs (Centralized Telemetry & Log-RAG Platform)**.

All agents must adhere to:

1. **Hard 250-Line Maximum Rule**: No file in `agent/` (Go), `ingest/` (TS), `web/` (TS), or `storage/` may exceed 250 lines. Decompose early at 200 lines.
2. **Detailed JSDoc & Go Doc**: Every exported symbol must have exhaustive documentation.
3. **Strict Database Casing**: All tables, partitions, columns, and DB enums must strictly use lowercase `snake_case`.
4. **Zero Magic Strings & Clean Types**: Use canonical enums and strict Zod validation.
5. **Quality Gates & Conventional Commits**: All commits must pass husky commitlint (`feat(scope): ...`).

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
