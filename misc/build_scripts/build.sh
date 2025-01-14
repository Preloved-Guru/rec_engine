#!/bin/bash

# Exit on any error
set -e

echo "🚀 PreLoved Guru Build Script"
echo "============================="

# Get the root directory of the project
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to wait for service health
wait_for_service() {
   local service=$1
   local max_attempts=30
   local attempt=1

   echo "⏳ Waiting for $service to be healthy..."
   while [ $attempt -le $max_attempts ]; do
       if docker compose -f "$SCRIPT_DIR/docker-compose.yml" ps "$service" | grep -q "healthy"; then
           echo "✅ $service is healthy!"
           return 0
       fi
       echo "   Attempt $attempt/$max_attempts..."
       sleep 2
       attempt=$((attempt + 1))
   done
   echo "❌ $service failed to become healthy"
   exit 1
}

# Activate conda environment
source "$(conda info --base)/etc/profile.d/conda.sh"
if ! conda activate preloved_guru 2>/dev/null; then
    echo "❌ Conda environment 'preloved_guru' not found."
    echo "   Please run the installation script first: ./install.sh"
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p "$ROOT_DIR/logs"

# Start infrastructure services
echo "🐳 Starting Docker services..."
docker compose -f "$SCRIPT_DIR/docker-compose.yml" up -d

# Wait for services to be healthy
wait_for_service "postgres"
wait_for_service "redis"

# Wait for postgres to be ready to accept commands
echo "⏳ Waiting for database initialization..."
sleep 10

# Generate products if needed
echo "🔍 Checking if products exist..."
PRODUCT_COUNT=$(docker exec preloved_postgres psql "postgresql://preloved_guru:preloved_guru@localhost:5432/preloved_guru" -t -c "SELECT COUNT(*) FROM items;" || echo "0")
PRODUCT_COUNT=$(echo $PRODUCT_COUNT | tr -d '[:space:]')  # Clean up whitespace
if [ "$PRODUCT_COUNT" = "" ] || [ "$PRODUCT_COUNT" = "0" ]; then
    echo "🎲 No products found. Generating synthetic products..."
    python "$ROOT_DIR/misc/data_generation/generate_products.py"
else
    echo "✅ Products already exist in the database (count: $PRODUCT_COUNT)"
fi

# Start Gorse
echo "🔄 Starting Gorse recommendation engine..."
cd "$ROOT_DIR/gorse"

# Set environment variables for Gorse
export GORSE_CACHE_STORE="redis://localhost:6379/0"
export GORSE_DATA_STORE="postgres://preloved_guru:preloved_guru@localhost:5432/preloved_guru?sslmode=disable"

# Start Gorse in one
echo "   Starting Gorse..."
./bin/gorse-in-one -c config/config.toml &> "$ROOT_DIR/logs/gorse-master.log" &
GORSE_PID=$!

# Wait for Gorse to be ready with timeout
echo "⏳ Waiting for Gorse to be ready..."
TIMEOUT=30
COUNTER=0
while ! curl -s http://localhost:8088/api/health > /dev/null && [ $COUNTER -lt $TIMEOUT ]; do
   sleep 1
   let COUNTER=COUNTER+1
done

if [ $COUNTER -eq $TIMEOUT ]; then
    echo "❌ Gorse failed to start within $TIMEOUT seconds"
    cat "$ROOT_DIR/logs/gorse-master.log"
    exit 1
fi

echo "✅ Gorse is ready"

# Save PID for stop script
echo $GORSE_PID > "$SCRIPT_DIR/.gorse.pid"

# Start web application
echo "🌐 Starting web application..."
cd "$ROOT_DIR/preloved-swipe"
npm run dev &> "$ROOT_DIR/logs/webapp.log" &
WEBAPP_PID=$!
echo $WEBAPP_PID > "$SCRIPT_DIR/.webapp.pid"

echo "✨ All components started!"
echo "   Web app: http://localhost:3000"
echo "   Gorse API: http://localhost:8088"
echo "   Gorse Dashboard: http://localhost:8088"
echo ""
echo "📝 Logs are available in the logs directory"
echo "Run './stop.sh' to stop all components"

# Keep script running to maintain child processes
wait