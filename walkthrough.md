# FIFA-26 Player Management System Walkthrough

## Setup Instructions

### 1. Database Setup (Supabase)

1. Create a new project on [Supabase](https://supabase.com/).
2. Go to the **SQL Editor** in Supabase and copy-paste the content of `database/schema.sql` to create the tables. Run the query.
3. Get your database connection string from **Project Settings > Database > Connection string > URI**.
   - It should look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`
4. Update `server/.env` with this connection string.
   ```
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

### 2. Import Data

1. Open `database/import_to_supabase.py`.
2. Update the `DB_CONFIG` dictionary at the top of the file with your Supabase credentials (host, password, etc.).
3. Run the script:
   ```bash
   python3 database/import_to_supabase.py
   ```
   _Note: Ensure you have `pandas` and `psycopg2` installed (`pip install pandas psycopg2-binary`)._

### 3. Start the Backend

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Start the server:
   ```bash
   node index.js
   ```
   The server will run on `http://localhost:3000`.

### 4. Start the Frontend

1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your browser at `http://localhost:5173`.

## Features

- **Search**: Filter players by name, league, club, or position.
- **Player Details**: Click "View" on any player card to see detailed stats, including a visual breakdown of their ratings.
- **Comparison**: Click the "+" button on up to 4 players to add them to the comparison list. Click "Compare" in the navbar to see them side-by-side.

## Tech Stack

- **Frontend**: React, Vite, Vanilla CSS (Glassmorphism design)
- **Backend**: Node.js, Express, PostgreSQL (pg)
- **Database**: Supabase (PostgreSQL)
