#!/usr/bin/env python3
"""
FIFA 26 Player Management System - Data Import Script
Phase 2 - Group 12
Matches EXACT Phase 1 Schema

Prerequisites:
    pip install pandas psycopg2-binary

Usage:
    python import_data_exact.py
"""

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
import sys

# =============================================
# DATABASE CONNECTION CONFIGURATION
# =============================================
DB_CONFIG = {
    'host': 'localhost',
    'port': 5433,
    'database': 'fifa26pm',
    'user': 'postgres',
    'password': 'Impex55233'  # ← CHANGE THIS
}

def connect_db():
    """Create database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("✓ Database connection successful!")
        return conn
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        sys.exit(1)

def load_csv(filepath):
    """Load CSV file into pandas DataFrame"""
    try:
        df = pd.read_csv(filepath, low_memory=False)
        print(f"✓ CSV loaded successfully: {len(df)} players")
        return df
    except Exception as e:
        print(f"✗ Failed to load CSV: {e}")
        sys.exit(1)

def clean_value(value):
    """Clean NULL/empty values"""
    if pd.isna(value) or value == '' or value == 'NULL':
        return None
    return value

def import_countries(conn, df):
    """Import unique countries - EXACT Phase 1 schema"""
    print("\n[1/9] Importing COUNTRY data...")
    
    countries = df[['nationality_id', 'nationality_name']].dropna()
    countries = countries.drop_duplicates(subset=['nationality_id'])
    
    cursor = conn.cursor()
    
    data = [
        (int(row['nationality_id']), clean_value(row['nationality_name']))
        for _, row in countries.iterrows()
    ]
    
    query = """
        INSERT INTO COUNTRY (Nationality_id, Nationality_name)
        VALUES %s
        ON CONFLICT (Nationality_id) DO NOTHING
    """
    
    execute_values(cursor, query, data)
    conn.commit()
    print(f"✓ Inserted {len(data)} countries")
    cursor.close()

def import_leagues(conn, df):
    """Import unique leagues - EXACT Phase 1 schema"""
    print("\n[2/9] Importing LEAGUE data...")
    
    # We need to map leagues to countries manually or leave Country_id NULL
    # For now, leave NULL as dataset doesn't have direct league-to-country mapping
    leagues = df[['league_id', 'league_name', 'league_level']].dropna(subset=['league_id'])
    leagues = leagues.drop_duplicates(subset=['league_id'])
    
    cursor = conn.cursor()
    
    data = [
        (
            int(row['league_id']), 
            clean_value(row['league_name']),
            int(row['league_level']) if pd.notna(row['league_level']) else None,
            None  # Country_id - not directly in dataset
        )
        for _, row in leagues.iterrows()
    ]
    
    query = """
        INSERT INTO LEAGUE (League_id, League_name, League_level, Country_id)
        VALUES %s
        ON CONFLICT (League_id) DO NOTHING
    """
    
    execute_values(cursor, query, data)
    conn.commit()
    print(f"✓ Inserted {len(data)} leagues")
    cursor.close()

def import_clubs(conn, df):
    """Import unique clubs - EXACT Phase 1 schema"""
    print("\n[3/9] Importing CLUB data...")
    
    clubs = df[['club_team_id', 'league_id', 'club_name']].dropna(subset=['club_team_id'])
    clubs = clubs.drop_duplicates(subset=['club_team_id'])
    
    cursor = conn.cursor()
    
    data = [
        (
            int(row['club_team_id']),
            int(row['league_id']) if pd.notna(row['league_id']) else None,
            clean_value(row['club_name'])
        )
        for _, row in clubs.iterrows()
    ]
    
    query = """
        INSERT INTO CLUB (Club_team_id, League_id, Club_name)
        VALUES %s
        ON CONFLICT (Club_team_id) DO NOTHING
    """
    
    execute_values(cursor, query, data)
    conn.commit()
    print(f"✓ Inserted {len(data)} clubs")
    cursor.close()

def import_players(conn, df):
    """Import player main data - EXACT Phase 1 schema"""
    print("\n[4/9] Importing PLAYER data...")
    
    cursor = conn.cursor()
    
    # Phase 1 schema: Player_id, Short_name, Player_position, 
    # Nationality_id, Club_team_id, Overall
    data = []
    for _, row in df.iterrows():
        data.append((
            int(row['player_id']),
            clean_value(row['short_name']),
            clean_value(row['player_positions']),  # player_positions from CSV
            int(row['nationality_id']) if pd.notna(row['nationality_id']) else None,
            int(row['club_team_id']) if pd.notna(row['club_team_id']) else None,
            int(row['overall']) if pd.notna(row['overall']) else None
        ))
    
    query = """
        INSERT INTO PLAYER (
            Player_id, Short_name, Player_position,
            Nationality_id, Club_team_id, Overall
        ) VALUES %s
        ON CONFLICT (Player_id) DO NOTHING
    """
    
    execute_values(cursor, query, data)
    conn.commit()
    print(f"✓ Inserted {len(data)} players")
    cursor.close()

def import_additional_info(conn, df):
    """Import additional player information - EXACT Phase 1 schema"""
    print("\n[5/9] Importing ADDITIONAL_INFO data...")
    
    cursor = conn.cursor()
    
    # Phase 1 schema: Player_id, Age, DOB, Release_clause, Preferred_Position,
    # Height, Weight, Wages, Weak_foot
    data = []
    for _, row in df.iterrows():
        dob = None
        if pd.notna(row['dob']):
            try:
                dob = pd.to_datetime(row['dob']).date()
            except:
                pass
        
        data.append((
            int(row['player_id']),
            int(row['age']) if pd.notna(row['age']) else None,
            dob,
            int(row['release_clause_eur']) if pd.notna(row['release_clause_eur']) else None,
            clean_value(row['player_positions']),  # Use as preferred position
            float(row['height_cm']) if pd.notna(row['height_cm']) else None,
            float(row['weight_kg']) if pd.notna(row['weight_kg']) else None,
            float(row['wage_eur']) if pd.notna(row['wage_eur']) else None,
            int(row['weak_foot']) if pd.notna(row['weak_foot']) else None
        ))
    
    query = """
        INSERT INTO ADDITIONAL_INFO (
            Player_id, Age, DOB, Release_clause, Preferred_Position,
            Height, Weight, Wages, Weak_foot
        ) VALUES %s
        ON CONFLICT (Player_id) DO NOTHING
    """
    
    execute_values(cursor, query, data)
    conn.commit()
    print(f"✓ Inserted {len(data)} additional info records")
    cursor.close()

def import_ratings(conn, df):
    """Import player ratings - EXACT Phase 1 schema (6 core ratings only)"""
    print("\n[6/9] Importing RATINGS data...")
    
    cursor = conn.cursor()
    
    # Phase 1 schema: Player_id, Passing, Defending, Dribbling, Pace, Shooting, Physic
    data = []
    for _, row in df.iterrows():
        data.append((
            int(row['player_id']),
            int(row['passing']) if pd.notna(row['passing']) else None,
            int(row['defending']) if pd.notna(row['defending']) else None,
            int(row['dribbling']) if pd.notna(row['dribbling']) else None,
            int(row['pace']) if pd.notna(row['pace']) else None,
            int(row['shooting']) if pd.notna(row['shooting']) else None,
            int(row['physic']) if pd.notna(row['physic']) else None
        ))
    
    query = """
        INSERT INTO RATINGS (
            Player_id, Passing, Defending, Dribbling, Pace, Shooting, Physic
        ) VALUES %s
        ON CONFLICT (Player_id) DO NOTHING
    """
    
    execute_values(cursor, query, data)
    conn.commit()
    print(f"✓ Inserted {len(data)} rating records")
    cursor.close()

def import_player_club(conn, df):
    """Import player-club relationships - EXACT Phase 1 schema"""
    print("\n[7/9] Importing player_club relationships...")
    
    player_clubs = df[df['club_team_id'].notna()].copy()
    
    cursor = conn.cursor()
    
    # Phase 1 schema: Player_id, Club_team_id, club_position, jersey_number,
    # contract_until, joined_date
    data = []
    for _, row in player_clubs.iterrows():
        joined_date = None
        if pd.notna(row['club_joined_date']):
            try:
                joined_date = pd.to_datetime(row['club_joined_date']).date()
            except:
                pass
        
        data.append((
            int(row['player_id']),
            int(row['club_team_id']),
            clean_value(row['club_position']),
            int(row['club_jersey_number']) if pd.notna(row['club_jersey_number']) else None,
            int(row['club_contract_valid_until_year']) if pd.notna(row['club_contract_valid_until_year']) else None,
            joined_date
        ))
    
    query = """
        INSERT INTO player_club (
            Player_id, Club_team_id, club_position, jersey_number,
            contract_until, joined_date
        ) VALUES %s
        ON CONFLICT (Player_id) DO NOTHING
    """
    
    execute_values(cursor, query, data)
    conn.commit()
    print(f"✓ Inserted {len(data)} player-club relationships")
    cursor.close()

def import_player_country(conn, df):
    """Import player-country relationships - EXACT Phase 1 schema"""
    print("\n[8/9] Importing player_country relationships...")
    
    player_countries = df[df['nationality_id'].notna()].copy()
    
    cursor = conn.cursor()
    
    # Phase 1 schema: Player_id, Nationality_id, nation_position, nation_jersey
    data = []
    for _, row in player_countries.iterrows():
        data.append((
            int(row['player_id']),
            int(row['nationality_id']),
            clean_value(row['nation_position']),
            int(row['nation_jersey_number']) if pd.notna(row['nation_jersey_number']) else None
        ))
    
    query = """
        INSERT INTO player_country (
            Player_id, Nationality_id, nation_position, nation_jersey
        ) VALUES %s
        ON CONFLICT (Player_id) DO NOTHING
    """
    
    execute_values(cursor, query, data)
    conn.commit()
    print(f"✓ Inserted {len(data)} player-country relationships")
    cursor.close()

def import_player_positions(conn, df):
    """Import player-position many-to-many relationships - EXACT Phase 1 schema"""
    print("\n[9/9] Importing player_position relationships...")
    
    cursor = conn.cursor()
    
    # Parse player_positions field (comma-separated)
    data = []
    for _, row in df.iterrows():
        if pd.notna(row['player_positions']):
            positions = str(row['player_positions']).split(',')
            for pos in positions:
                pos = pos.strip()
                if pos:
                    data.append((int(row['player_id']), pos))
    
    query = """
        INSERT INTO player_position (Player_id, Position_Code)
        VALUES %s
        ON CONFLICT (Player_id, Position_Code) DO NOTHING
    """
    
    execute_values(cursor, query, data)
    conn.commit()
    print(f"✓ Inserted {len(data)} player-position relationships")
    cursor.close()

def generate_summary(conn):
    """Generate summary statistics"""
    print("\n" + "="*60)
    print("DATABASE IMPORT SUMMARY")
    print("="*60)
    
    cursor = conn.cursor()
    
    tables = [
        'COUNTRY', 'LEAGUE', 'CLUB', 'POSITION', 'PLAYER',
        'ADDITIONAL_INFO', 'RATINGS', 'player_club', 
        'player_country', 'player_position'
    ]
    
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        print(f"{table:20s}: {count:,} rows")
    
    cursor.close()
    print("="*60)

def main():
    """Main execution function"""
    print("\n" + "="*60)
    print("FIFA 26 PLAYER MANAGEMENT SYSTEM - DATA IMPORT")
    print("Phase 2 - Group 12 - EXACT Phase 1 Schema")
    print("="*60)
    
    CSV_PATH = '/Users/naimishmaniya/Downloads/CSE 412 F26/FC26_20250921.csv'
    
    # Load data
    df = load_csv(CSV_PATH)
    
    # Connect to database
    conn = connect_db()
    
    try:
        # Import data in order (respecting foreign key constraints)
        import_countries(conn, df)
        import_leagues(conn, df)
        import_clubs(conn, df)
        import_players(conn, df)
        import_additional_info(conn, df)
        import_ratings(conn, df)
        import_player_club(conn, df)
        import_player_country(conn, df)
        import_player_positions(conn, df)
        
        # Generate summary
        generate_summary(conn)
        
        print("\n✓ All data imported successfully!")
        
    except Exception as e:
        print(f"\n✗ Error during import: {e}")
        conn.rollback()
    finally:
        conn.close()
        print("\n✓ Database connection closed")

if __name__ == "__main__":
    main()
