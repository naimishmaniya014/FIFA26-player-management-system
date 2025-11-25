import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import sys

# Database connection settings
DB_CONFIG = {
    'host': 'localhost',
    'port': 5433,
    'database': 'fifa26pm',
    'user': 'postgres',
    'password': 'Impex55233'
}

def connect_db():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("Connected to database")
        return conn
    except Exception as e:
        print(f"Connection failed: {e}")
        sys.exit(1)

def load_csv(filepath):
    try:
        df = pd.read_csv(filepath, low_memory=False)
        print(f"Loaded {len(df)} players from CSV")
        return df
    except Exception as e:
        print(f"Error loading CSV: {e}")
        sys.exit(1)

def clean_value(value):
    if pd.isna(value) or value == '' or value == 'NULL':
        return None
    return value

def import_countries(conn, df):
    print("\nImporting countries...")
    countries = df[['nationality_id', 'nationality_name']].dropna()
    countries = countries.drop_duplicates(subset=['nationality_id'])
    
    cursor = conn.cursor()
    data = [(int(row['nationality_id']), clean_value(row['nationality_name'])) 
            for _, row in countries.iterrows()]
    
    query = "INSERT INTO COUNTRY (Nationality_id, Nationality_name) VALUES %s ON CONFLICT (Nationality_id) DO NOTHING"
    execute_values(cursor, query, data)
    conn.commit()
    print(f"Inserted {len(data)} countries")
    cursor.close()

def import_leagues(conn, df):
    print("\nImporting leagues...")
    leagues = df[['league_id', 'league_name', 'league_level']].dropna(subset=['league_id'])
    leagues = leagues.drop_duplicates(subset=['league_id'])
    
    cursor = conn.cursor()
    data = [(int(row['league_id']), 
             clean_value(row['league_name']),
             int(row['league_level']) if pd.notna(row['league_level']) else None,
             None) for _, row in leagues.iterrows()]
    
    query = "INSERT INTO LEAGUE (League_id, League_name, League_level, Country_id) VALUES %s ON CONFLICT (League_id) DO NOTHING"
    execute_values(cursor, query, data)
    conn.commit()
    print(f"Inserted {len(data)} leagues")
    cursor.close()

def import_clubs(conn, df):
    print("\nImporting clubs...")
    clubs = df[['club_team_id', 'league_id', 'club_name']].dropna(subset=['club_team_id'])
    clubs = clubs.drop_duplicates(subset=['club_team_id'])
    
    cursor = conn.cursor()
    data = [(int(row['club_team_id']),
             int(row['league_id']) if pd.notna(row['league_id']) else None,
             clean_value(row['club_name'])) for _, row in clubs.iterrows()]
    
    query = "INSERT INTO CLUB (Club_team_id, League_id, Club_name) VALUES %s ON CONFLICT (Club_team_id) DO NOTHING"
    execute_values(cursor, query, data)
    conn.commit()
    print(f"Inserted {len(data)} clubs")
    cursor.close()

def import_players(conn, df):
    print("\nImporting players...")
    cursor = conn.cursor()
    
    data = []
    for _, row in df.iterrows():
        data.append((
            int(row['player_id']),
            clean_value(row['short_name']),
            clean_value(row['player_positions']),
            int(row['nationality_id']) if pd.notna(row['nationality_id']) else None,
            int(row['club_team_id']) if pd.notna(row['club_team_id']) else None,
            int(row['overall']) if pd.notna(row['overall']) else None
        ))
    
    query = "INSERT INTO PLAYER (Player_id, Short_name, Player_position, Nationality_id, Club_team_id, Overall) VALUES %s ON CONFLICT (Player_id) DO NOTHING"
    execute_values(cursor, query, data)
    conn.commit()
    print(f"Inserted {len(data)} players")
    cursor.close()

def import_additional_info(conn, df):
    print("\nImporting additional info...")
    cursor = conn.cursor()
    
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
            clean_value(row['player_positions']),
            float(row['height_cm']) if pd.notna(row['height_cm']) else None,
            float(row['weight_kg']) if pd.notna(row['weight_kg']) else None,
            float(row['wage_eur']) if pd.notna(row['wage_eur']) else None,
            int(row['weak_foot']) if pd.notna(row['weak_foot']) else None
        ))
    
    query = "INSERT INTO ADDITIONAL_INFO (Player_id, Age, DOB, Release_clause, Preferred_Position, Height, Weight, Wages, Weak_foot) VALUES %s ON CONFLICT (Player_id) DO NOTHING"
    execute_values(cursor, query, data)
    conn.commit()
    print(f"Inserted {len(data)} records")
    cursor.close()

def import_ratings(conn, df):
    print("\nImporting ratings...")
    cursor = conn.cursor()
    
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
    
    query = "INSERT INTO RATINGS (Player_id, Passing, Defending, Dribbling, Pace, Shooting, Physic) VALUES %s ON CONFLICT (Player_id) DO NOTHING"
    execute_values(cursor, query, data)
    conn.commit()
    print(f"Inserted {len(data)} ratings")
    cursor.close()

def import_player_club(conn, df):
    print("\nImporting player-club relationships...")
    player_clubs = df[df['club_team_id'].notna()].copy()
    cursor = conn.cursor()
    
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
    
    query = "INSERT INTO player_club (Player_id, Club_team_id, club_position, jersey_number, contract_until, joined_date) VALUES %s ON CONFLICT (Player_id) DO NOTHING"
    execute_values(cursor, query, data)
    conn.commit()
    print(f"Inserted {len(data)} relationships")
    cursor.close()

def import_player_country(conn, df):
    print("\nImporting player-country relationships...")
    player_countries = df[df['nationality_id'].notna()].copy()
    cursor = conn.cursor()
    
    data = []
    for _, row in player_countries.iterrows():
        data.append((
            int(row['player_id']),
            int(row['nationality_id']),
            clean_value(row['nation_position']),
            int(row['nation_jersey_number']) if pd.notna(row['nation_jersey_number']) else None
        ))
    
    query = "INSERT INTO player_country (Player_id, Nationality_id, nation_position, nation_jersey) VALUES %s ON CONFLICT (Player_id) DO NOTHING"
    execute_values(cursor, query, data)
    conn.commit()
    print(f"Inserted {len(data)} relationships")
    cursor.close()

def import_player_positions(conn, df):
    print("\nImporting player positions...")
    cursor = conn.cursor()
    
    data = []
    for _, row in df.iterrows():
        if pd.notna(row['player_positions']):
            positions = str(row['player_positions']).split(',')
            for pos in positions:
                pos = pos.strip()
                if pos:
                    data.append((int(row['player_id']), pos))
    
    query = "INSERT INTO player_position (Player_id, Position_Code) VALUES %s ON CONFLICT (Player_id, Position_Code) DO NOTHING"
    execute_values(cursor, query, data)
    conn.commit()
    print(f"Inserted {len(data)} position mappings")
    cursor.close()

def show_summary(conn):
    print("\n" + "="*50)
    print("Import Summary")
    print("="*50)
    
    cursor = conn.cursor()
    tables = ['COUNTRY', 'LEAGUE', 'CLUB', 'POSITION', 'PLAYER',
              'ADDITIONAL_INFO', 'RATINGS', 'player_club', 
              'player_country', 'player_position']
    
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        print(f"{table}: {count:,} rows")
    
    cursor.close()
    print("="*50)

def main():
    print("FIFA 26 Player Database Import")
    print("Group 12: Yichen Li, Bhavya Patel, Naimish Maniya, Juhil Sojitra\n")
    
    csv_file = '/Users/naimishmaniya/Downloads/CSE 412 F26/FC26_20250921.csv'
    
    df = load_csv(csv_file)
    conn = connect_db()
    
    try:
        import_countries(conn, df)
        import_leagues(conn, df)
        import_clubs(conn, df)
        import_players(conn, df)
        import_additional_info(conn, df)
        import_ratings(conn, df)
        import_player_club(conn, df)
        import_player_country(conn, df)
        import_player_positions(conn, df)
        
        show_summary(conn)
        print("\nImport completed successfully!")
        
    except Exception as e:
        print(f"\nError: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    main()
