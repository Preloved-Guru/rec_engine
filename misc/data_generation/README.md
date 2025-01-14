# Data Generation Scripts for Testing Gorse

This directory contains scripts to generate synthetic data for testing Gorse's recommendation engine, particularly focusing on testing hybrid recommendations (CF + image-based) and multi-armed bandit optimization.

## Overview

The scripts generate three types of data:
1. Products with realistic attributes and image embeddings
2. Users with varying preferences and recommendation type affinities
3. Simulated user interactions that reflect real-world behavior patterns

## Setup

### Using Conda (Recommended)
```bash
# Create a new conda environment
conda create -n gorse-test python=3.9
conda activate gorse-test

# Install required packages
conda install numpy pandas
pip install requests  # requests is better installed via pip
```

### Using Pip
```bash
pip install numpy pandas requests
```

## Scripts

- `config.py`: Configuration settings and shared constants
- `generate_products.py`: Creates product data with realistic embeddings
- `generate_users.py`: Creates user profiles with varying preferences
- `simulate_behavior.py`: Simulates user interactions over time

## Usage

1. Create and activate the conda environment:
```bash
conda create -n gorse-test python=3.9
conda activate gorse-test
conda install numpy pandas
pip install requests
```

2. Review and adjust settings in `config.py` if needed:
   - Number of products/users to generate
   - Embedding dimensions
   - Simulation timeframe
   - Gorse API settings

3. Generate all test data:
```bash
# Make sure you're in the data_generation directory
cd misc/data_generation

# Run the generation scripts in sequence
python generate_products.py
python generate_users.py
python simulate_behavior.py
```

## Data Storage

All generated data is saved in the `misc/data_generation/generated_data/` directory:
- `products.csv`: Product metadata (categories, attributes, prices)
- `embeddings.npy`: Product image embeddings (512-dimensional vectors)
- `users.csv`: User profiles and preferences
- `interactions.csv`: Simulated user interactions

The directory structure will look like this:
```
misc/
└── data_generation/
    ├── config.py
    ├── generate_products.py
    ├── generate_users.py
    ├── simulate_behavior.py
    └── generated_data/
        ├── products.csv
        ├── embeddings.npy
        ├── users.csv
        └── interactions.csv
```

## Data Characteristics

### Products
- Each product has realistic attributes (category, color, brand, etc.)
- Image embeddings are 512-dimensional vectors
- Similar products (same category/color) have similar embeddings

### Users
- Varying style preferences and price sensitivity
- Each user has an inherent preference between CF and image-based recommendations
- Preference consistency varies by user

### Interactions
- Timestamped views, likes, and purchases
- Interaction probability based on user preferences
- Records which recommendation type (CF or image) led to the interaction

## Integration with Gorse

The behavior simulator can optionally send interactions directly to a running Gorse instance:
1. Set `base_url` in `config.py` to your Gorse API endpoint (default: http://127.0.0.1:8088)
2. Set `api_key` if your Gorse instance requires authentication
3. Run the simulation

## Testing Multi-Armed Bandit

The generated data is specifically designed to test MAB optimization:
- Users have varying preferences between CF and image-based recommendations
- Their interaction patterns reflect these preferences
- The MAB system should learn to serve the right blend of recommendations to each user

## Customization

You can modify various aspects of the data generation:
- Adjust product categories and attributes in `config.py`
- Change user preference distributions in `generate_users.py`
- Modify interaction patterns in `simulate_behavior.py`

## Troubleshooting

If you encounter any issues:
1. Make sure you're in the correct directory (`misc/data_generation/`)
2. Verify the conda environment is activated (`conda activate gorse-test`)
3. Check that all required packages are installed
4. Ensure you have write permissions in the directory 