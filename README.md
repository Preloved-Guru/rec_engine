# PreLoved Guru Recommendation Engine

This project extends [Gorse](https://github.com/gorse-io/gorse) - an open-source recommendation system engine - to create a specialized recommendation system for secondhand fashion marketplaces. Our implementation adds visual similarity matching and automated recommendation strategy optimization through multi-armed bandits.

## Project Overview

PreLoved Guru's recommendation engine combines multiple recommendation strategies to provide personalized suggestions for secondhand fashion items:

1. **Collaborative Filtering** (via Gorse)
   - User-based recommendations
   - Item-based recommendations
   - Matrix factorization

2. **Visual Similarity** (Our Extension)
   - Image embedding-based similarity matching
   - Category-aware recommendations
   - Visual style matching

3. **Automated Strategy Optimization** (Our Extension)
   - Multi-armed bandit system for dynamic strategy selection
   - Automated learning of user preferences between CF and visual recommendations
   - Real-time adaptation to user behavior

## Architecture

The system is built as an extension to Gorse's monorepo architecture, adding new components while maintaining compatibility with Gorse's core functionality:

```
gorse/
├── storage/
│   └── embeddings/           # Image embedding storage implementation
│       ├── types.go
│       ├── sql_embeddings.go
│       └── sql_embeddings_test.go
├── worker/
│   ├── image_recommender.go  # Image-based recommendation logic
│   └── image_recommender_test.go
└── misc/
    └── data_generation/      # Test data generation tools
        ├── config.py
        ├── generate_products.py
        ├── generate_users.py
        └── simulate_behavior.py
```

## Features

### 1. Image-Based Recommendations
- Store and retrieve image embeddings for fashion items
- Calculate visual similarity between items
- Combine visual similarity with collaborative filtering
- Category-aware recommendations

### 2. Multi-Armed Bandit Optimization
- Automated learning of user preferences
- Dynamic weighting between recommendation strategies
- Real-time adaptation to user behavior

### 3. Test Data Generation
- Synthetic product data generation
- User profile simulation
- Realistic interaction patterns
- Support for testing and validation

## Attribution

This project is built upon [Gorse](https://github.com/gorse-io/gorse), an open-source recommendation system engine licensed under the Apache License 2.0. We extend our gratitude to the Gorse team and contributors for providing the foundation for this work.

### Gorse Components Used
- Core recommendation engine
- Data storage and caching infrastructure
- REST API framework
- Worker node architecture
- Base recommendation algorithms

### Our Extensions
- Image embedding storage and retrieval system
- Visual similarity-based recommendation logic
- Multi-armed bandit optimization
- Test data generation tools
- Integration of visual and collaborative filtering approaches

## Development Status

Current development focuses on:
1. ✅ Image embedding storage implementation
2. ✅ Basic image-based recommendation system
3. ✅ Test data generation framework
4. 🔄 Multi-armed bandit implementation (In Progress)
5. 🔄 Performance optimization (In Progress)
6. 📅 Production deployment (Planned)

## Setup and Testing

### Prerequisites
- Linux/WSL2
- Docker and Docker Compose
- Node.js 18+
- Go 1.20+
- Conda (Miniconda or Anaconda)

### Quick Start
We provide a set of scripts to make setup and running the system easy:

```bash
# 1. Make scripts executable
cd misc/build_scripts
chmod +x *.sh

# 2. Install all dependencies and build components
./install.sh

# 3. Start all services (including database population)
./build.sh

# 4. To stop all services
./stop.sh
```

The build script will start:
1. PostgreSQL database (Docker)
2. Redis cache (Docker)
3. Gorse recommendation engine
4. PreLoved Guru web application
5. Automatically populate the database with synthetic data

You can then access:
- Web Application: http://localhost:3000
- Gorse API: http://localhost:8087

### Logs
All component logs are available in the `logs` directory:
- `gorse-server.log`: Logs from the Gorse recommendation engine server
- `gorse-worker.log`: Logs from the Gorse recommendation engine worker
- `webapp.log`: Logs from the Next.js web application

### Manual Testing
If you want to run individual components or tests:

```bash
# Run Go tests
go test ./...

# Generate synthetic data manually
cd misc/data_generation
./populate_db.sh
```

### Environment Management
The system uses a Conda environment named `preloved_guru` for Python dependencies. This is handled automatically by the build scripts, but if needed:

```bash
# Activate environment manually
conda activate preloved_guru

# Deactivate environment when done
conda deactivate
```

## License

This project is licensed under the Apache License 2.0, maintaining compatibility with Gorse's licensing terms. See the LICENSE file for details.

## Acknowledgments

- [Gorse](https://github.com/gorse-io/gorse) - The open-source recommendation engine this project builds upon
- [zhenghaoz](https://github.com/zhenghaoz) - Creator and maintainer of Gorse
- Gorse community contributors
