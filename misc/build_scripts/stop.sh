#!/bin/bash

echo "🛑 Stopping PreLoved Guru"
echo "========================"

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Function to stop a process by PID file
stop_process() {
   local pid_file=$1
   local name=$2
   if [ -f "$pid_file" ]; then
       pid=$(cat "$pid_file")
       if ps -p $pid > /dev/null; then
           echo "🔄 Stopping $name (PID: $pid)..."
           kill $pid
           rm "$pid_file"
       else
           echo "⚠️  $name process not found"
           rm "$pid_file"
       fi
   fi
}

# Stop web application
stop_process "$SCRIPT_DIR/.webapp.pid" "Web application"

# Stop Gorse
stop_process "$SCRIPT_DIR/.gorse.pid" "Gorse"

# Stop Docker services
echo "🐳 Stopping Docker services..."
docker compose -f "$SCRIPT_DIR/docker-compose.yml" down

# Clean up log files
echo "🧹 Cleaning up log files..."
rm -f "$ROOT_DIR"/logs/*.log

echo "✨ All components stopped!"