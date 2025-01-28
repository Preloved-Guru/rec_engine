#!/usr/bin/env python3

import os
import requests
import random
from datetime import datetime, timedelta
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Constants
USER_ID = "U000001"  # Using the same format as generate_users.py and the webapp
FEEDBACK_TYPE = "like"
NUM_INITIAL_LIKES = 10  # Number of random products to like

# Database connection parameters
DATABASE_URL = "postgresql://preloved_guru:preloved_guru@preloved_postgres:5432/preloved_guru"
GORSE_URL = "http://gorse:8088"  # Using Docker container name

def get_random_products(conn, n=NUM_INITIAL_LIKES):
    """Get n random products from the database"""
    with conn.cursor() as cur:
        cur.execute("SELECT item_id FROM items ORDER BY RANDOM() LIMIT %s", (n,))
        return [row[0] for row in cur.fetchall()]

def insert_feedback(conn, user_id, item_id):
    """Insert a feedback record into both PostgreSQL and Gorse"""
    timestamp = datetime.now() - timedelta(days=random.randint(0, 7))
    
    # Insert into PostgreSQL
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO feedbacks (feedback_type, user_id, item_id, timestamp)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (feedback_type, user_id, item_id) DO NOTHING
        """, (FEEDBACK_TYPE, user_id, item_id, timestamp))
    
    # Send to Gorse
    try:
        feedback_data = {
            'FeedbackType': FEEDBACK_TYPE,
            'UserId': user_id,
            'ItemId': item_id,
            'Timestamp': timestamp.isoformat()
        }
        response = requests.post(f"{GORSE_URL}/api/feedback", json=feedback_data)
        response.raise_for_status()
    except Exception as e:
        print(f"Warning: Failed to send feedback to Gorse: {str(e)}")

def main():
    print(f"🎯 Generating initial likes for user {USER_ID}...")
    
    # Connect to database
    conn = psycopg2.connect(DATABASE_URL)
    
    try:
        # Get random products
        products = get_random_products(conn)
        
        # Insert feedback for each product
        for item_id in products:
            insert_feedback(conn, USER_ID, item_id)
        
        # Commit the transaction
        conn.commit()
        print(f"✅ Generated {len(products)} initial likes for {USER_ID}")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error generating likes: {str(e)}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    main() 