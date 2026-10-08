# Core Invariants — DevLab Logs

1. **250-Line Limit**: Every single file must stay strictly under 250 lines of code.
2. **Go & TypeScript Quality**:
   - Go: Standard `slog` structured logging, handle all errors (`if err != nil`), standard Go doc comments.
   - TypeScript: Zero `any`, comprehensive JSDoc comments, strict type safety.
3. **Database Standards**:
   - PostgreSQL 16 range partitioning by timestamp.
   - Lowercase `snake_case` column and table names.
   - Vector operations using 768-dimensional `nomic-embed-text` embeddings with HNSW cosine distance indexing.
