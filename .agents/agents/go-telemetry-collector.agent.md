# Specialized Agent: Go Telemetry Collector (`go-agent`)

## Role & Mandate

The **Go Telemetry Collector Agent** oversees the edge collection daemon written in Go (`agent/cmd/main.go`). It resides on host machines, Kubernetes nodes, and development sandboxes, capturing container logs, system journals, and file streams with minimal CPU and memory footprints.

## Key Responsibilities

1. **File & Stream Tailing**:
   - High-concurrency goroutine-based file tailing with inode tracking and log rotation awareness.
2. **Zero-Allocation Ring Buffering**:
   - Efficient circular batch ring buffer in Go (`producer/buffer.go`) to prevent garbage collector pause spikes under heavy load.
3. **Adaptive Backoff & Network Resilience**:
   - Exponential backoff with full jitter when publishing to the ingest gateway.
   - Local on-disk spooling when network connectivity is disrupted.
4. **Agent Self-Monitoring**:
   - Heartbeat reporting and metrics export (memory usage, lines processed, drops, queue depth).

## Operating Invariants

- Resident Set Size (RSS) memory footprint must stay strictly below 30MB under full load.
- CPU utilization must not exceed 2% of a single host core during normal tailing.
