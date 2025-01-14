#!/usr/bin/env python3

import os
import json
import random
import numpy as np
from faker import Faker
import psycopg2
from dotenv import load_dotenv
import datetime

from config import STYLE_ATTRIBUTES  # Import color list from config

# Load environment variables
load_dotenv()

# Constants
NUM_PRODUCTS = 1000
CATEGORIES = [
    "Clothing", "Shoes", "Accessories", "Bags", "Jewelry",
    "Sportswear", "Vintage", "Luxury", "Streetwear", "Formal"
]

# Placeholder images for different categories
CATEGORY_IMAGES = {
    "Clothing": [
        "https://picsum.photos/400/600?category=clothing&id=1",
        "https://picsum.photos/400/600?category=clothing&id=2",
        "https://picsum.photos/400/600?category=clothing&id=3",
    ],
    "Shoes": [
        "https://picsum.photos/400/600?category=shoes&id=1",
        "https://picsum.photos/400/600?category=shoes&id=2",
    ],
    "Accessories": [
        "https://picsum.photos/400/600?category=accessories&id=1",
        "https://picsum.photos/400/600?category=accessories&id=2",
    ],
    "Bags": [
        "https://picsum.photos/400/600?category=bags&id=1",
        "https://picsum.photos/400/600?category=bags&id=2",
    ],
    "Jewelry": [
        "https://picsum.photos/400/600?category=jewelry&id=1",
        "https://picsum.photos/400/600?category=jewelry&id=2",
    ],
    "Sportswear": [
        "https://picsum.photos/400/600?category=sportswear&id=1",
        "https://picsum.photos/400/600?category=sportswear&id=2",
    ],
    "Vintage": [
        "https://picsum.photos/400/600?category=vintage&id=1",
        "https://picsum.photos/400/600?category=vintage&id=2",
    ],
    "Luxury": [
        "https://picsum.photos/400/600?category=luxury&id=1",
        "https://picsum.photos/400/600?category=luxury&id=2",
    ],
    "Streetwear": [
        "https://picsum.photos/400/600?category=streetwear&id=1",
        "https://picsum.photos/400/600?category=streetwear&id=2",
    ],
    "Formal": [
        "https://picsum.photos/400/600?category=formal&id=1",
        "https://picsum.photos/400/600?category=formal&id=2",
    ],
}

# Database connection parameters
DATABASE_URL = "postgresql://preloved_guru:preloved_guru@localhost:5432/preloved_guru"

fake = Faker()

def generate_product():
    """Generate a single product with realistic attributes"""
    num_categories = random.randint(1, 3)
    categories = random.sample(CATEGORIES, num_categories)
    
    condition = random.choice(STYLE_ATTRIBUTES['conditions'])
    brand = random.choice(STYLE_ATTRIBUTES['brands'])
    size = random.choice(["XS", "S", "M", "L", "XL"])
    color = random.choice(STYLE_ATTRIBUTES['colors'])  # Use colors from config
    
    # Get a random image URL based on the first category
    image_url = random.choice(CATEGORY_IMAGES[categories[0]])
    
    # Create labels as a proper JSON object with quoted keys
    labels = json.dumps({
        "condition": condition,
        "brand": brand,
        "size": size,
        "color": color,
        "price": round(random.uniform(10, 500), 2),
        "imageUrl": image_url  # Add image URL to labels
    })
    
    description = f"{condition} {color} {brand} {categories[0]} (Size {size})"
    
    return {
        "item_id": str(fake.uuid4()),
        "is_hidden": False,
        "categories": json.dumps(categories),  # Store as JSON array
        "time_stamp": datetime.datetime.now(),
        "labels": labels,  # Already JSON string
        "comment": description,
        "image_url": image_url  # Add image URL as a separate column
    }

def main():
    print(f"🏭 Generating {NUM_PRODUCTS} products...")
    
    # Connect to database
    conn = psycopg2.connect(DATABASE_URL)
    
    try:
        # Generate and insert products
        with conn.cursor() as cur:
            for _ in range(NUM_PRODUCTS):
                product = generate_product()
                cur.execute("""
                    INSERT INTO items (item_id, is_hidden, categories, time_stamp, labels, comment, image_url)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    product["item_id"],
                    product["is_hidden"],
                    product["categories"],  # PostgreSQL will handle array conversion
                    product["time_stamp"],
                    product["labels"],
                    product["comment"],
                    product["image_url"]
                ))
        
        # Commit the transaction
        conn.commit()
        print(f"✅ Successfully generated and inserted {NUM_PRODUCTS} products")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error generating products: {str(e)}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    main() 