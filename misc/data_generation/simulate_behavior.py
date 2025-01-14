#!/usr/bin/env python3
"""
Simulate user interactions with products, taking into account:
1. User preferences (style, price sensitivity, etc.)
2. Product attributes
3. User's tendency towards CF vs. image-based recommendations
4. Time-based patterns

This simulation will help test both the recommendation quality
and the multi-armed bandit's ability to learn user preferences.
"""

import numpy as np
import pandas as pd
import random
from datetime import datetime, timedelta
import json
import requests
from pathlib import Path

from config import (
    FEEDBACK_TYPES,
    SIMULATION_START_DATE,
    SIMULATION_END_DATE,
    PRODUCTS_FILE,
    USERS_FILE,
    INTERACTIONS_FILE,
    EMBEDDINGS_FILE,
    GORSE_API
)

class UserBehaviorSimulator:
    def __init__(self):
        """Load user and product data."""
        print("Loading data...")
        self.users_df = pd.read_csv(USERS_FILE)
        
        # Read products and parse JSON columns
        self.products_df = pd.read_csv(PRODUCTS_FILE)
        
        # Parse JSON columns when loading
        def parse_json_safely(x):
            try:
                if isinstance(x, str):
                    return json.loads(x)
                return x
            except:
                return {}
            
        self.products_df['labels'] = self.products_df['labels'].apply(parse_json_safely)
        self.products_df['categories'] = self.products_df['categories'].apply(parse_json_safely)
        
        # Convert timestamps to datetime
        self.start_date = pd.to_datetime(SIMULATION_START_DATE)
        self.end_date = pd.to_datetime(SIMULATION_END_DATE)
        
        # Initialize results storage
        self.interactions = []
        
        print(f"Loaded {len(self.users_df)} users and {len(self.products_df)} products")
        print(f"Simulating interactions from {self.start_date} to {self.end_date}")
    
    def calculate_user_interest(self, user_row, product_row):
        """Calculate base interest level based on user preferences and product attributes."""
        # Get user preferences
        user_preferences = json.loads(user_row['style_preferences'])
        
        try:
            # Product attributes are already parsed as dict
            product_attributes = product_row['labels']
            
            # Calculate match scores for each preference type
            color_match = len(set(user_preferences['colors']).intersection([product_attributes['color']])) > 0
            brand_match = len(set(user_preferences['brands']).intersection([product_attributes['brand']])) > 0
            
            # Calculate base interest (0-1)
            matches = sum([color_match, brand_match])
            base_interest = matches / 2  # Normalize to 0-1
            
            # Adjust for price sensitivity
            price = float(product_attributes['price'])
            price_sensitivity = user_row['price_sensitivity']
            
            if price_sensitivity == 'High' and price > 100:
                base_interest *= 0.5
            elif price_sensitivity == 'Medium' and price > 200:
                base_interest *= 0.7
            elif price_sensitivity == 'Low' and price > 300:
                base_interest *= 0.9
            
            return base_interest
        except (KeyError, ValueError) as e:
            print(f"Warning: Error processing product {product_row['item_id']}: {str(e)}")
            return 0.1  # Return low base interest for problematic products
    
    def generate_timestamp(self):
        """Generate a random timestamp between start and end dates."""
        time_range = (self.end_date - self.start_date).total_seconds()
        random_seconds = random.randint(0, int(time_range))
        return self.start_date + timedelta(seconds=random_seconds)
    
    def simulate_recommendation_response(self, user_row, product_row, rec_type='cf'):
        """
        Simulate how likely a user is to interact with a recommendation
        based on their preference for CF vs. image-based recommendations.
        """
        # Get user's preference between CF and image-based
        cf_preference = float(user_row['cf_preference'])
        consistency = float(user_row['preference_consistency'])
        
        # Calculate base interest in the product
        base_interest = self.calculate_user_interest(user_row, product_row)
        
        # Adjust based on recommendation type and user's preference
        if rec_type == 'cf':
            rec_multiplier = cf_preference
        else:  # image-based
            rec_multiplier = 1 - cf_preference
            
        # Apply consistency factor
        rec_multiplier = (rec_multiplier * consistency + 
                         random.random() * (1 - consistency))
        
        # Final probability
        final_prob = base_interest * rec_multiplier
        
        return min(final_prob, 1.0)
    
    def generate_interaction(self, user_id, item_id, user_row, product_row, rec_type):
        """Generate a single interaction between a user and product."""
        # Calculate probability of interaction
        prob = self.simulate_recommendation_response(user_row, product_row, rec_type)
        
        # Determine if interaction happens
        if random.random() > prob:
            return None
        
        # Pick feedback type based on configured probabilities
        feedback_type = random.choices(
            list(FEEDBACK_TYPES.keys()),
            weights=list(FEEDBACK_TYPES.values())
        )[0]
        
        # Generate timestamp
        timestamp = self.generate_timestamp()
        
        return {
            'FeedbackType': feedback_type,
            'UserId': user_id,
            'ItemId': item_id,
            'Timestamp': timestamp.isoformat(),
            'Comment': ''
        }
    
    def simulate_interactions(self):
        """Generate synthetic interactions between users and products."""
        total_interactions = len(self.users_df) * 5  # Each user interacts with ~5 products
        
        for _ in range(total_interactions):
            # Pick a random user
            user_row = self.users_df.sample(n=1).iloc[0]
            
            # Pick a random product
            product_row = self.products_df.sample(n=1).iloc[0]
            
            # Randomly choose recommendation type (CF vs image-based)
            rec_type = 'cf' if random.random() < user_row['cf_preference'] else 'image'
            
            # Generate interaction
            interaction = self.generate_interaction(
                user_row['user_id'],
                product_row['item_id'],
                user_row,
                product_row,
                rec_type
            )
            
            if interaction:
                self.interactions.append(interaction)
                
                # Send to Gorse API if configured
                if GORSE_API['base_url']:
                    self.send_to_gorse(interaction)
        
        print(f"Generated {len(self.interactions)} interactions")
        
        # Save interactions
        interactions_df = pd.DataFrame(self.interactions)
        interactions_df.to_csv(INTERACTIONS_FILE, index=False)
        print(f"Saved interactions to {INTERACTIONS_FILE}")
    
    def send_to_gorse(self, interaction):
        """Send an interaction to the Gorse API."""
        url = f"{GORSE_API['base_url']}/api/feedback"
        headers = {}
        if GORSE_API['api_key']:
            headers['X-API-Key'] = GORSE_API['api_key']
        
        try:
            response = requests.post(url, json=interaction, headers=headers)
            response.raise_for_status()
        except Exception as e:
            print(f"Failed to send interaction to Gorse: {str(e)}")

if __name__ == "__main__":
    simulator = UserBehaviorSimulator()
    simulator.simulate_interactions() 