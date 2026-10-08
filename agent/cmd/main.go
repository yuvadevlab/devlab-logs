// Package main is the entrypoint for the high-performance devlab-log-agent daemon.
package main

import (
	"context"
	"flag"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/yuva-devlab/devlab-log-agent/producer"
	"github.com/yuva-devlab/devlab-log-agent/tailer"
)

func main() {
	logDir := flag.String("dir", getEnv("LOG_DIR", "./logs"), "Target directory to watch for .log files")
	ingestURL := flag.String("ingest-url", getEnv("INGEST_URL", "http://localhost:3020/api/v1/logs/batch"), "DevLab Ingest HTTP Endpoint")
	service := flag.String("service", getEnv("SERVICE_NAME", "finai"), "Default service identifier")
	batchSize := flag.Int("batch-size", 500, "Maximum records accumulated before bulk flush")
	flag.Parse()

	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	slog.Info("Starting devlab-log-agent telemetry daemon",
		"dir", *logDir,
		"ingestURL", *ingestURL,
		"service", *service,
		"batchSize", *batchSize,
	)

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	logTailer, err := tailer.NewLogTailer(10000)
	if err != nil {
		slog.Error("Failed to initialize file watcher", "err", err)
		os.Exit(1)
	}

	if err := os.MkdirAll(*logDir, 0755); err != nil {
		slog.Error("Failed to create watch directory", "err", err)
		os.Exit(1)
	}

	if err := logTailer.Watch(*logDir, *service); err != nil {
		slog.Error("Failed to register watch directory", "err", err)
		os.Exit(1)
	}

	batchProducer := producer.NewBatchProducer(*ingestURL, *batchSize, 200*time.Millisecond)

	// Launch consumer goroutine bridging tailer events to producer
	go func() {
		for event := range logTailer.Events() {
			batchProducer.Push(event)
		}
	}()

	// Launch producer background timer
	go batchProducer.Start(ctx)

	// Run tailer event loop
	if err := logTailer.Run(ctx); err != nil && err != context.Canceled {
		slog.Error("Tailer halted with error", "err", err)
	}

	slog.Info("Flushing remaining in-memory telemetry buffer...")
	batchProducer.Flush()
	slog.Info("devlab-log-agent daemon shutdown complete.")
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
