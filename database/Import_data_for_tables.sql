-- IMPORTANT INSTRUCTION FOR RUNNING THIS SCRIPT:
-- The PostgreSQL 'COPY' command requires ABSOLUTE file paths to the CSV files.
-- MUST replace 'D:/CSE412-project/' in the commands below with the actual absolute path where the CSV files are located on your machine.
-- Example: If your CSVs are in 'C:/Users/Name/Project/csv/', change the paths accordingly.

-- 1. COUNTRY
COPY COUNTRY (Nationality_id, Nationality_name)
FROM 'D:/CSE412-project/01_COUNTRY.csv' DELIMITER ',' CSV HEADER;

-- 2. POSITION
COPY POSITION (Position_Code, Position_Name)
FROM 'D:/CSE412-project/02_POSITION.csv' DELIMITER ',' CSV HEADER;

-- 3. LEAGUE
COPY LEAGUE (League_id, League_name, League_level, Country_id)
FROM 'D:/CSE412-project/03_LEAGUE.csv' DELIMITER ',' CSV HEADER;

-- 4. CLUB
COPY CLUB (Club_team_id, League_id, Club_name)
FROM 'D:/CSE412-project/04_CLUB.csv' DELIMITER ',' CSV HEADER;

-- 5. PLAYER
COPY PLAYER (Player_id, Short_name, Player_position, Nationality_id, Club_team_id, Overall)
FROM 'D:/CSE412-project/05_PLAYER.csv' DELIMITER ',' CSV HEADER;

-- 6. ADDITIONAL_INFO
COPY ADDITIONAL_INFO (Player_id, Age, DOB, Release_clause, Preferred_Position, Height, Weight, Wages, Weak_foot)
FROM 'D:/CSE412-project/06_ADDITIONAL_INFO.csv' DELIMITER ',' CSV HEADER;

-- 7. RATINGS
COPY RATINGS (Player_id, Passing, Defending, Dribbling, Pace, Shooting, Physic)
FROM 'D:/CSE412-project/07_RATINGS.csv' DELIMITER ',' CSV HEADER;

-- 8. player_club
COPY player_club (Player_id, Club_team_id, Club_position, jersey_number, contract_until, joined_date)
FROM 'D:/CSE412-project/08_player_club.csv' DELIMITER ',' CSV HEADER;

-- 9. player_country
COPY player_country (Player_id, Nationality_id, nation_position, nation_jersey)
FROM 'D:/CSE412-project/09_player_country.csv' DELIMITER ',' CSV HEADER;

-- 10. player_position
COPY player_position (Player_id, Position_Code)
FROM 'D:/CSE412-project/10_player_position.csv' DELIMITER ',' CSV HEADER;
