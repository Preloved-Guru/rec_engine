#!/bin/bash

# Exit on any error
set -e

echo "🚀 PreLoved Guru Installation Script"
echo "====================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if Docker Compose exists (supports both V1 and V2)
docker_compose_exists() {
    # Check for Docker Compose V2 (docker compose)
    if docker compose version >/dev/null 2>&1; then
        return 0
    fi
    # Check for Docker Compose V1 (docker-compose)
    if command -v docker-compose >/dev/null 2>&1; then
        return 0
    fi
    return 1
}

# Check for required tools
echo "🔍 Checking prerequisites..."

if ! command_exists docker; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! docker_compose_exists; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

if ! command_exists go; then
    echo "❌ Go is not installed. Please install Go first."
    echo "   Visit: https://golang.org/doc/install"
    exit 1
fi

if ! command_exists conda; then
    echo "❌ Conda is not installed. Please install Conda first."
    echo "   Visit: https://docs.conda.io/projects/conda/en/latest/user-guide/install/"
    exit 1
fi

echo "✅ All prerequisites are installed!"

# Get the root directory of the project
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
echo "📂 Project root: $ROOT_DIR"

# Install web application dependencies
echo "📦 Installing web application dependencies..."
cd "$ROOT_DIR/preloved-swipe"
npm install

# Set up Conda environment
echo "🐍 Setting up Conda environment..."
CONDA_ENV_NAME="preloved_guru"

# Remove existing environment if it exists
conda env remove -n $CONDA_ENV_NAME -y 2>/dev/null || true

# Create new environment with Python 3.10
echo "   Creating Conda environment: $CONDA_ENV_NAME"
conda create -n $CONDA_ENV_NAME python=3.10 numpy pandas -y

# Activate environment and install dependencies
echo "   Installing Python dependencies..."
source "$(conda info --base)/etc/profile.d/conda.sh"
conda activate $CONDA_ENV_NAME
cd "$ROOT_DIR/misc/data_generation"
pip install -r requirements.txt

# Build Gorse from source
echo "🔨 Building Gorse recommendation engine..."
cd "$ROOT_DIR/gorse"

# Build Gorse binaries
echo "   Building Gorse binaries..."
mkdir -p bin
go build -o ./bin/gorse-server ./cmd/gorse-server
go build -o ./bin/gorse-worker ./cmd/gorse-worker
go build -o ./bin/gorse-master ./cmd/gorse-master
go build -o ./bin/gorse-in-one ./cmd/gorse-in-one

# Pull required Docker images
echo "🐳 Pulling Docker images..."
docker pull postgres:latest
docker pull redis/redis-stack:latest

# Create logs directory
mkdir -p "$ROOT_DIR/logs"

echo "✨ Installation complete!"
echo "The Conda environment '$CONDA_ENV_NAME' has been created."
echo "Run './build.sh' to start the system." 