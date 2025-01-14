# PreLoved Guru Build Scripts

This directory contains scripts to install, build, and run the entire PreLoved Guru system.

## Scripts

- `install.sh`: Installs all necessary dependencies for both the recommendation engine and web application
- `build.sh`: Builds and starts all components of the system
- `stop.sh`: Gracefully stops all running components

## Usage

1. First time setup:
```bash
chmod +x *.sh  # Make scripts executable
./install.sh   # Install all dependencies
```

2. Regular usage:
```bash
./build.sh     # Build and start everything
./stop.sh      # Stop all components
```

## Components Started

The build script will start:
1. PostgreSQL database (Docker)
2. Redis cache (Docker)
3. Gorse recommendation engine
4. PreLoved Guru web application

## Requirements

- Linux/WSL2
- Docker and Docker Compose
- Node.js 18+
- Go 1.20+ 