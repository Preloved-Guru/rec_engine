#!/bin/bash

# Exit on any error
set -e

echo "🎲 Populating PreLoved Guru Database"
echo "==================================="

# Get the root directory of the project
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if Conda is installed
if ! command -v conda &> /dev/null; then
    echo "❌ Conda is required but not installed."
    exit 1
fi

# Activate Conda environment
CONDA_ENV_NAME="preloved_guru"
source "$(conda info --base)/etc/profile.d/conda.sh"

if ! conda activate $CONDA_ENV_NAME 2>/dev/null; then
    echo "❌ Conda environment '$CONDA_ENV_NAME' not found."
    echo "   Please run the installation script first: ./install.sh"
    exit 1
fi

echo "✅ Using Conda environment: $CONDA_ENV_NAME"

# Generate synthetic data
echo "🏭 Generating synthetic data..."

echo "👤 Generating products..."
python "$SCRIPT_DIR/generate_products.py"

echo "✨ Database populated with synthetic products!"
echo "You can now start using the recommendation engine." 