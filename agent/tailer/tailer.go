// Package tailer continuously watches log directories and follows active file streams using inotify.
package tailer

import (
	"bufio"
	"context"
	"io"
	"log/slog"
	"os"
	"path/filepath"
	"sync"

	"github.com/fsnotify/fsnotify"
	"github.com/yuva-devlab/devlab-log-agent/normalizer"
)

// FileTailer tracks an open log file and its current read offset.
type FileTailer struct {
	path    string
	service string
	offset  int64
	mu      sync.Mutex
}

// LogTailer monitors directory trees for file append and rotation events.
type LogTailer struct {
	watcher *fsnotify.Watcher
	files   map[string]*FileTailer
	out     chan *normalizer.LogEvent
	mu      sync.Mutex
}

// NewLogTailer initializes the fsnotify watcher and internal state maps.
func NewLogTailer(bufferSize int) (*LogTailer, error) {
	w, err := fsnotify.NewWatcher()
	if err != nil {
		return nil, err
	}
	return &LogTailer{
		watcher: w,
		files:   make(map[string]*FileTailer),
		out:     make(chan *normalizer.LogEvent, bufferSize),
	}, nil
}

// Events returns the read-only channel delivering normalized log events.
func (lt *LogTailer) Events() <-chan *normalizer.LogEvent {
	return lt.out
}

// Watch registers a target directory or file with the inotify watcher.
func (lt *LogTailer) Watch(path string, defaultService string) error {
	lt.mu.Lock()
	defer lt.mu.Unlock()

	// If directory, watch all existing .log files
	info, err := os.Stat(path)
	if err != nil {
		return err
	}

	if info.IsDir() {
		entries, _ := os.ReadDir(path)
		for _, e := range entries {
			if !e.IsDir() && filepath.Ext(e.Name()) == ".log" {
				fullPath := filepath.Join(path, e.Name())
				lt.files[fullPath] = &FileTailer{path: fullPath, service: defaultService}
			}
		}
	} else {
		lt.files[path] = &FileTailer{path: path, service: defaultService}
	}

	return lt.watcher.Add(path)
}

// Run executes the event loop dispatching inotify file write triggers.
func (lt *LogTailer) Run(ctx context.Context) error {
	defer close(lt.out)
	defer lt.watcher.Close()

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case event, ok := <-lt.watcher.Events:
			if !ok {
				return nil
			}
			// Only process write events (appends)
			if event.Has(fsnotify.Write) {
				lt.readAppendedLines(event.Name)
			}
		case err, ok := <-lt.watcher.Errors:
			if !ok {
				return nil
			}
			slog.Error("File watcher encountered error", "err", err)
		}
	}
}

func (lt *LogTailer) readAppendedLines(filePath string) {
	lt.mu.Lock()
	ft, exists := lt.files[filePath]
	if !exists {
		// New file discovered in watched directory
		ft = &FileTailer{path: filePath, service: "unknown"}
		lt.files[filePath] = ft
	}
	lt.mu.Unlock()

	file, err := os.Open(filePath)
	if err != nil {
		return
	}
	defer file.Close()

	// Seek to last known offset
	stat, err := file.Stat()
	if err != nil {
		return
	}

	// Handle log rotation or truncation
	if stat.Size() < ft.offset {
		ft.offset = 0
	}

	_, _ = file.Seek(ft.offset, io.SeekStart)
	scanner := bufio.NewScanner(file)

	for scanner.Scan() {
		line := scanner.Text()
		event := normalizer.NormalizeLine(line, ft.service)
		if event != nil {
			select {
			case lt.out <- event:
			default:
				// Backpressure: drop or log warning if channel full
				slog.Warn("Tailer buffer backpressure: event dropped")
			}
		}
	}

	// Update offset
	ft.offset, _ = file.Seek(0, io.SeekCurrent)
}
