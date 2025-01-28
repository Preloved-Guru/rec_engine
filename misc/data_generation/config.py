"""
Configuration and shared utilities for data generation scripts.
"""

import os
from pathlib import Path

# Directory Configuration
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "generated_data"
os.makedirs(DATA_DIR, exist_ok=True)

# Product Configuration
NUM_PRODUCTS = 1000
EMBEDDING_DIM = 512  # Dimension of our image embeddings

# Categories with subcategories for more realistic data
PRODUCT_CATEGORIES = {
    "Tops": ["T-Shirt", "Blouse", "Sweater", "Tank Top", "Shirt"],
    "Bottoms": ["Jeans", "Skirt", "Shorts", "Trousers", "Leggings"],
    "Dresses": ["Mini Dress", "Maxi Dress", "Midi Dress", "Evening Dress"],
    "Outerwear": ["Jacket", "Coat", "Blazer", "Cardigan"],
    "Shoes": ["Sneakers", "Boots", "Heels", "Flats", "Sandals"],
    "Accessories": ["Bags", "Jewelry", "Scarves", "Hats", "Belts"]
}

# Style attributes for more realistic embedding generation
STYLE_ATTRIBUTES = {
    "colors": ["Black", "White", "Red", "Blue", "Green", "Yellow", "Pink", "Purple", "Brown", "Gray"],
    "patterns": ["Solid", "Striped", "Floral", "Plaid", "Polka Dot", "Animal Print"],
    "materials": ["Cotton", "Denim", "Leather", "Silk", "Wool", "Polyester", "Linen"],
    "brands": ["Zara", "H&M", "Nike", "Adidas", "Levi's", "Uniqlo", "Gucci", "Prada", "Local Brand"],
    "conditions": ["Like New", "Gently Used", "Well Used", "Vintage"]
}

# User Configuration
NUM_USERS = 11  # 10 synthetic users + 1 local user
USER_ATTRIBUTES = {
    "age_groups": ["18-24", "25-34", "35-44", "45-54", "55+"],
    "style_preferences": ["Casual", "Formal", "Streetwear", "Vintage", "Minimalist", "Bohemian"],
    "price_sensitivity": ["Low", "Medium", "High"],
    "sustainability_focus": ["Low", "Medium", "High"]
}

# Simulation Configuration
FEEDBACK_TYPES = {
    "view": 0.6,      # 60% probability
    "like": 0.3,      # 30% probability
    "purchase": 0.1   # 10% probability
}

# Time simulation settings
SIMULATION_START_DATE = "2023-01-01"
SIMULATION_END_DATE = "2024-01-01"

# Gorse API Configuration
GORSE_API = {
    "base_url": "http://gorse:8088",  # Using Docker container name
    "api_key": None  # Set this if you have authentication enabled
}

# File paths
PRODUCTS_FILE = DATA_DIR / "products.csv"
USERS_FILE = DATA_DIR / "users.csv"
INTERACTIONS_FILE = DATA_DIR / "interactions.csv"
EMBEDDINGS_FILE = DATA_DIR / "embeddings.npy"  # For storing embeddings in binary format 