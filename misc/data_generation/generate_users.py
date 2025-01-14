#!/usr/bin/env python3
"""
Generate synthetic user data with realistic preferences and characteristics.
Users are created with varying tendencies towards different recommendation approaches
(CF vs. image-based) to help test the multi-armed bandit system.
"""

import numpy as np
import pandas as pd
import random
import json
from pathlib import Path
import requests

from config import (
    NUM_USERS,
    USER_ATTRIBUTES,
    STYLE_ATTRIBUTES,
    USERS_FILE,
    GORSE_API
)

def generate_style_preferences():
    """Generate weighted style preferences for a user."""
    preferences = {
        'colors': random.sample(STYLE_ATTRIBUTES['colors'], k=random.randint(2, 5)),
        'patterns': random.sample(STYLE_ATTRIBUTES['patterns'], k=random.randint(1, 3)),
        'materials': random.sample(STYLE_ATTRIBUTES['materials'], k=random.randint(2, 4)),
        'brands': random.sample(STYLE_ATTRIBUTES['brands'], k=random.randint(2, 4))
    }
    return preferences

def generate_recommendation_preferences():
    """
    Generate user's inherent preference between CF and image-based recommendations.
    This will help test if the MAB system can learn these preferences.
    """
    # Generate a random preference between 0 (pure CF) and 1 (pure image-based)
    # We'll use a beta distribution to create more realistic variation
    cf_weight = np.random.beta(2, 2)  # This creates a bell curve centered at 0.5
    
    # Also generate some noise in their behavior
    consistency = np.random.uniform(0.7, 1.0)  # How consistent are they in this preference
    
    return {
        'cf_preference': cf_weight,
        'consistency': consistency
    }

def send_users_to_gorse(users_df):
    """Send generated users to Gorse API."""
    print("Sending users to Gorse...")
    
    base_url = GORSE_API['base_url']
    headers = {}
    if GORSE_API['api_key']:
        headers['X-API-Key'] = GORSE_API['api_key']
    
    for _, user in users_df.iterrows():
        user_data = {
            'UserId': user['user_id'],
            'Labels': [
                user['age_group'],
                user['primary_style'],
                f"price_{user['price_sensitivity'].lower()}",
                f"sustainability_{user['sustainability_focus'].lower()}"
            ],
            'Comment': json.dumps({
                'style_preferences': json.loads(user['style_preferences']),
                'cf_preference': user['cf_preference'],
                'preference_consistency': user['preference_consistency']
            })
        }
        
        try:
            response = requests.post(f"{base_url}/api/user", json=user_data, headers=headers)
            response.raise_for_status()
        except Exception as e:
            print(f"Failed to send user {user['user_id']} to Gorse: {str(e)}")

def generate_users():
    """Generate synthetic user data."""
    users = []
    
    for idx in range(NUM_USERS):
        user_id = f"U{idx:06d}"
        
        # Basic attributes
        age_group = random.choice(USER_ATTRIBUTES['age_groups'])
        style_preference = random.choice(USER_ATTRIBUTES['style_preferences'])
        price_sensitivity = random.choice(USER_ATTRIBUTES['price_sensitivity'])
        sustainability_focus = random.choice(USER_ATTRIBUTES['sustainability_focus'])
        
        # Generate detailed style preferences
        style_preferences = generate_style_preferences()
        
        # Generate recommendation preferences (for MAB testing)
        rec_preferences = generate_recommendation_preferences()
        
        # Create user record
        user = {
            'user_id': user_id,
            'age_group': age_group,
            'primary_style': style_preference,
            'price_sensitivity': price_sensitivity,
            'sustainability_focus': sustainability_focus,
            'style_preferences': json.dumps(style_preferences),
            'cf_preference': rec_preferences['cf_preference'],
            'preference_consistency': rec_preferences['consistency']
        }
        
        users.append(user)
    
    # Convert to DataFrame
    df = pd.DataFrame(users)
    
    # Save to file
    df.to_csv(USERS_FILE, index=False)
    
    print(f"Generated {NUM_USERS} users:")
    print(f"- User data saved to: {USERS_FILE}")
    print("\nUser Statistics:")
    print("-" * 40)
    print("\nAge Groups:")
    print(df['age_group'].value_counts())
    print("\nStyle Preferences:")
    print(df['primary_style'].value_counts())
    print("\nCF Preference Distribution:")
    print(df['cf_preference'].describe())
    
    # Send users to Gorse
    send_users_to_gorse(df)

if __name__ == "__main__":
    generate_users() 