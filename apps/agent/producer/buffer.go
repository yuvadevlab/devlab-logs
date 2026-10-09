// Package producer manages backpressure-buffered batch transmissions to ingestion endpoints.
package producer

import (
	"bytes"
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"sync"
	"time"

	"github.com/yuva-devlab/devlab-log-agent/normalizer"
)

// BatchProducer accumulates telemetry events and executes bulk HTTP or message queue flushes.
type BatchProducer struct {
	ingestURL     string
	batchSize     int
	flushInterval time.Duration
	buffer        []*normalizer.LogEvent
	mu            sync.Mutex
	httpClient    *http.Client
}

// NewBatchProducer instantiates a new backpressure batcher.
func NewBatchProducer(ingestURL string, batchSize int, flushInterval time.Duration) *BatchProducer {
	return &BatchProducer{
		ingestURL:     ingestURL,
		batchSize:     batchSize,
		flushInterval: flushInterval,
		buffer:        make([]*normalizer.LogEvent, 0, batchSize),
		httpClient:    &http.Client{Timeout: 5 * time.Second},
	}
}

// Push adds an incoming LogEvent to the memory buffer, flushing immediately if capacity is reached.
func (bp *BatchProducer) Push(event *normalizer.LogEvent) {
	bp.mu.Lock()
	bp.buffer = append(bp.buffer, event)
	ready := len(bp.buffer) >= bp.batchSize
	bp.mu.Unlock()

	if ready {
		bp.Flush()
	}
}

// Flush dispatches the current buffer contents to the target ingestion endpoint.
func (bp *BatchProducer) Flush() {
	bp.mu.Lock()
	if len(bp.buffer) == 0 {
		bp.mu.Unlock()
		return
	}
	batch := bp.buffer
	bp.buffer = make([]*normalizer.LogEvent, 0, bp.batchSize)
	bp.mu.Unlock()

	data, err := json.Marshal(batch)
	if err != nil {
		slog.Error("Failed to serialize batch", "err", err)
		return
	}

	req, err := http.NewRequest("POST", bp.ingestURL, bytes.NewBuffer(data))
	if err != nil {
		slog.Error("Failed to build HTTP request", "err", err)
		return
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := bp.httpClient.Do(req)
	if err != nil {
		slog.Error("Failed to transmit batch to ingest endpoint", "count", len(batch), "err", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		slog.Warn("Ingest endpoint responded with non-2xx status", "status", resp.StatusCode)
	} else {
		slog.Info("Successfully transmitted telemetry batch", "records", len(batch))
	}
}

// Start runs the periodic background timer loop triggering flushes at flushInterval cadences.
func (bp *BatchProducer) Start(ctx context.Context) {
	ticker := time.NewTicker(bp.flushInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			bp.Flush()
			return
		case <-ticker.C:
			bp.Flush()
		}
	}
}
