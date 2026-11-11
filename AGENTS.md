# DevLab Logs Agent Guidelines

Master guidelines for AI agents developing on **DevLab Logs (Centralized Telemetry & Log-RAG Platform)**.

All agents must adhere to:

0. **Zero Commits Without Explicit Confirmation (CRITICAL)**:
   - NEVER execute `git commit`, `git push`, or open pull requests in ANY repository unless the user explicitly commands it in the current turn (e.g. "commit these changes", "commit and push").
   - Directives like "start", "proceed", "fix this", "implement", "build", or "test" authorize implementation, building, and running tests ONLY.
   - Always leave changes staged or in the working tree, present verification results, and wait for confirmation.
1. **Organization Standards & `.github` Inheritance**:
   - Standardize all author and committer attribution to `yuva.devlab@gmail.com`.
   - Branch naming must strictly follow: `^(feat|fix|refactor|perf|chore|docs|test|ci|hotfix)/[a-z0-9-]+$`.
   - PR descriptions must adhere to the 5-section high-signal standard defined in `yuvadevlab/.github` (Summary, Changes, How to Test, Proof of Verification, Risks).
   - Commits must conform to Conventional Commits: `<type>(<optional-scope>): <imperative summary>`.
2. **Pure Platform CSS & Design Tokens**:
   - Utility-first CSS frameworks are prohibited. All styling is implemented using pure platform CSS, W3C Cascade Layers (`@layer dl-*`), and design tokens from `@yuva-devlab/tokens`.
3. **Hard 250-Line Maximum Rule**: No file in `apps/agent/` (Go), `apps/ingest/` (TS), `apps/web/` (TS), or `packages/storage/` may exceed 250 lines. Decompose early at 200 lines.
4. **Detailed JSDoc & Go Doc**: Every exported symbol must have exhaustive documentation.
5. **Strict Database Casing**: All tables, partitions, columns, and DB enums must strictly use lowercase `snake_case`.
6. **Zero Magic Strings & Clean Types**: Use canonical enums and strict Zod validation.
7. **Quality Gates & Conventional Commits**: All commits must pass husky commitlint (`feat(scope): ...`).
8. **Strict `UI_COPY` Centralization Invariant (Zero Exceptions)**:
   - ALL user-facing text (labels, headers, button text, placeholders, empty states, error messages, toast copy, and dialog descriptions) MUST be centralized in `@/lib/ui-copy/` dictionaries.
   - Direct raw hardcoded strings in JSX/TSX components are strictly prohibited.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
