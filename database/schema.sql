-- DROP EXISTING TABLES (Order matters due to foreign keys)
DROP TABLE IF EXISTS player_position CASCADE;
DROP TABLE IF EXISTS player_country CASCADE;
DROP TABLE IF EXISTS player_club CASCADE;
DROP TABLE IF EXISTS RATINGS CASCADE;
DROP TABLE IF EXISTS ADDITIONAL_INFO CASCADE;
DROP TABLE IF EXISTS PLAYER CASCADE;
DROP TABLE IF EXISTS CLUB CASCADE;
DROP TABLE IF EXISTS LEAGUE CASCADE;
DROP TABLE IF EXISTS POSITION CASCADE;
DROP TABLE IF EXISTS COUNTRY CASCADE;

-- 1. COUNTRY Table
CREATE TABLE COUNTRY (
    Nationality_id INTEGER PRIMARY KEY,
    Nationality_name VARCHAR(100) NOT NULL
);

COMMENT ON TABLE COUNTRY IS 'Country represents a players nationality';

-- 2. POSITION Table 
CREATE TABLE POSITION (
    Position_Code VARCHAR(10) PRIMARY KEY,
    Position_Name VARCHAR(50) NOT NULL
);

COMMENT ON TABLE POSITION IS 'Position represents player positions on the field (GK, CB, etc.)';

-- 3. LEAGUE Table
CREATE TABLE LEAGUE (
    League_id INTEGER PRIMARY KEY,
    League_name VARCHAR(150) NOT NULL,
    League_level INTEGER,
    Country_id INTEGER,
    CONSTRAINT fk_league_country FOREIGN KEY (Country_id) 
        REFERENCES COUNTRY(Nationality_id) 
        ON DELETE SET NULL
);

COMMENT ON TABLE LEAGUE IS 'League is an organization of clubs that arrange matches';

-- 4. CLUB Table
CREATE TABLE CLUB (
    Club_team_id INTEGER PRIMARY KEY,
    League_id INTEGER,
    Club_name VARCHAR(150) NOT NULL,
    CONSTRAINT fk_club_league FOREIGN KEY (League_id) 
        REFERENCES LEAGUE(League_id) 
        ON DELETE SET NULL
);

COMMENT ON TABLE CLUB IS 'Each club belongs to a specific league';

-- 5. PLAYER Table (Main Entity)
CREATE TABLE PLAYER (
    Player_id INTEGER PRIMARY KEY,
    Short_name VARCHAR(100) NOT NULL,
    Player_position VARCHAR(50),
    Nationality_id INTEGER,
    Club_team_id INTEGER,
    Overall SMALLINT CHECK (Overall >= 0 AND Overall <= 100),
    CONSTRAINT fk_player_nationality FOREIGN KEY (Nationality_id) 
        REFERENCES COUNTRY(Nationality_id) 
        ON DELETE SET NULL,
    CONSTRAINT fk_player_club_team FOREIGN KEY (Club_team_id) 
        REFERENCES CLUB(Club_team_id) 
        ON DELETE SET NULL
);

COMMENT ON TABLE PLAYER IS 'Each player uniquely identified by Player_id';

-- 6. ADDITIONAL_INFO Table (Weak Entity)
CREATE TABLE ADDITIONAL_INFO (
    Player_id INTEGER PRIMARY KEY,
    Age SMALLINT CHECK (Age >= 15 AND Age <= 50),
    DOB DATE,
    Release_clause BIGINT,
    Preferred_Position VARCHAR(100),
    Height DECIMAL(5,2),
    Weight DECIMAL(5,2),
    Wages DECIMAL(12,2),
    Weak_foot SMALLINT CHECK (Weak_foot >= 1 AND Weak_foot <= 5),
    CONSTRAINT fk_additional_info_player FOREIGN KEY (Player_id) 
        REFERENCES PLAYER(Player_id) 
        ON DELETE CASCADE
);

COMMENT ON TABLE ADDITIONAL_INFO IS 'Stores player details - each player can have at most one detailed record';

-- 7. RATINGS Table (Weak Entity)
CREATE TABLE RATINGS (
    Player_id INTEGER PRIMARY KEY,
    Passing SMALLINT CHECK (Passing >= 0 AND Passing <= 100),
    Defending SMALLINT CHECK (Defending >= 0 AND Defending <= 100),
    Dribbling SMALLINT CHECK (Dribbling >= 0 AND Dribbling <= 100),
    Pace SMALLINT CHECK (Pace >= 0 AND Pace <= 100),
    Shooting SMALLINT CHECK (Shooting >= 0 AND Shooting <= 100),
    Physic SMALLINT CHECK (Physic >= 0 AND Physic <= 100),
    CONSTRAINT fk_ratings_player FOREIGN KEY (Player_id) 
        REFERENCES PLAYER(Player_id) 
        ON DELETE CASCADE
);

COMMENT ON TABLE RATINGS IS 'Ratings include FIFAs six core ability values';

-- 8. player_club Relationship Table
CREATE TABLE player_club (
    Player_id INTEGER PRIMARY KEY,
    Club_team_id INTEGER,
    club_position VARCHAR(10),
    jersey_number SMALLINT CHECK (jersey_number >= 1 AND jersey_number <= 99),
    contract_until INTEGER,
    joined_date DATE,
    CONSTRAINT fk_player_club_player FOREIGN KEY (Player_id) 
        REFERENCES PLAYER(Player_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_player_club_club FOREIGN KEY (Club_team_id) 
        REFERENCES CLUB(Club_team_id) 
        ON DELETE CASCADE
);

COMMENT ON TABLE player_club IS 'Many-to-one: Each player belongs to one club';

-- 9. player_country Relationship Table
CREATE TABLE player_country (
    Player_id INTEGER PRIMARY KEY,
    Nationality_id INTEGER,
    nation_position VARCHAR(10),
    nation_jersey SMALLINT CHECK (nation_jersey >= 1 AND nation_jersey <= 99),
    CONSTRAINT fk_player_country_player FOREIGN KEY (Player_id) 
        REFERENCES PLAYER(Player_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_player_country_country FOREIGN KEY (Nationality_id) 
        REFERENCES COUNTRY(Nationality_id) 
        ON DELETE CASCADE
);

COMMENT ON TABLE player_country IS 'Many-to-one: Each player represents one country';

-- 10. player_position Relationship Table (Many-to-Many)
CREATE TABLE player_position (
    Player_id INTEGER,
    Position_Code VARCHAR(10),
    PRIMARY KEY (Player_id, Position_Code),
    CONSTRAINT fk_player_position_player FOREIGN KEY (Player_id) 
        REFERENCES PLAYER(Player_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_player_position_position FOREIGN KEY (Position_Code) 
        REFERENCES POSITION(Position_Code) 
        ON DELETE CASCADE
);

COMMENT ON TABLE player_position IS 'Many-to-many: A player can play multiple positions';

-- CREATE INDEXES FOR PERFORMANCE
CREATE INDEX idx_player_overall ON PLAYER(Overall DESC);
CREATE INDEX idx_player_nationality ON PLAYER(Nationality_id);
CREATE INDEX idx_player_club ON PLAYER(Club_team_id);
CREATE INDEX idx_player_name ON PLAYER(Short_name);
CREATE INDEX idx_club_league ON CLUB(League_id);
CREATE INDEX idx_league_country ON LEAGUE(Country_id);
