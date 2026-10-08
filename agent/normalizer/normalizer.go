// Package normalizer transforms diverse log line formats (JSON, Winston, Pino, DevLab) into canonical schemas.
package normalizer

import (
	"encoding/json"
	"regexp"
	"strings"
	"time"
)

// LogEvent represents the standard normalized telemetry event across all DevLab applications.
type LogEvent struct {
	Service   string                 `json:"service"`
	Stream    string                 `json:"stream"`
	Level     string                 `json:"level"`
	TraceID   string                 `json:"traceId,omitempty"`
	TenantID  string                 `json:"tenantId,omitempty"`
	Message   string                 `json:"message"`
	Metadata  map[string]interface{} `json:"metadata,omitempty"`
	Timestamp time.Time              `json:"timestamp"`
}

// Regex matching standard DevLab text format: [ISO_TIMESTAMP] LEVEL [CONTEXT]: MESSAGE
var textLogRegex = regexp.MustCompile(`^\[(.*?)\]\s+([A-Z]+)\s+\[(.*?)\]:\s*(.*)$`)

// NormalizeLine parses and sanitizes a raw log string into a canonical LogEvent structure.
func NormalizeLine(raw string, defaultService string) *LogEvent {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return nil
	}

	// 1. Attempt JSON parsing (standard Winston / Pino output)
	if strings.HasPrefix(trimmed, "{") && strings.HasSuffix(trimmed, "}") {
		var rawMap map[string]interface{}
		if err := json.Unmarshal([]byte(trimmed), &rawMap); err == nil {
			event := &LogEvent{
				Service:   defaultService,
				Stream:    "stdout",
				Level:     "info",
				Timestamp: time.Now().UTC(),
				Metadata:  rawMap,
			}

			// Extract message
			if msg, ok := rawMap["message"].(string); ok {
				event.Message = msg
			} else if msg, ok := rawMap["msg"].(string); ok {
				event.Message = msg
			} else {
				event.Message = trimmed
			}

			// Extract level
			if lvl, ok := rawMap["level"].(string); ok {
				event.Level = strings.ToLower(lvl)
			}

			// Extract trace id if present
			if tid, ok := rawMap["traceId"].(string); ok {
				event.TraceID = tid
			} else if tid, ok := rawMap["trace_id"].(string); ok {
				event.TraceID = tid
			}

			// Extract service override if present
			if svc, ok := rawMap["service"].(string); ok {
				event.Service = svc
			}

			return event
		}
	}

	// 2. Attempt DevLab text log format matching
	if matches := textLogRegex.FindStringSubmatch(trimmed); len(matches) == 5 {
		tsStr, levelStr, contextStr, messageStr := matches[1], matches[2], matches[3], matches[4]
		ts, err := time.Parse(time.RFC3339Nano, tsStr)
		if err != nil {
			ts, err = time.Parse("2006-01-02T15:04:05.000Z", tsStr)
			if err != nil {
				ts = time.Now().UTC()
			}
		}

		return &LogEvent{
			Service:   defaultService,
			Stream:    "stdout",
			Level:     strings.ToLower(levelStr),
			Message:   messageStr,
			Metadata:  map[string]interface{}{"context": contextStr},
			Timestamp: ts,
		}
	}

	// 3. Fallback generic text line
	return &LogEvent{
		Service:   defaultService,
		Stream:    "stdout",
		Level:     "info",
		Message:   trimmed,
		Timestamp: time.Now().UTC(),
	}
}
