# FIFA-26 Player Management System Walkthrough

## Setup Instructions

### 1. Database Setup (Local PostgreSQL / pgAdmin)

1. Ensure you have **PostgreSQL** and **pgAdmin** installed.
2. Create a new database (e.g., `fifa26`) in pgAdmin.
3. Open the **Query Tool** for your new database.
4. Open `database/schema.sql`, copy its content, paste it into the Query Tool, and run it to create the tables.

### 2. Import Data

1. Locate the `datafiles` folder containing the CSV files on your computer.
2. Open `database/Import_data_for_tables.sql` in a text editor.
3. **CRITICAL STEP**: You must update the file paths in this script.
   - Find all occurrences of `D:/CSE412-project/`
   - Replace them with the **absolute path** to the `datafiles` folder on your machine.
   - *Example*: If your CSVs are in `C:/Users/Downloads/datafiles/`, update the paths to match.
4. Copy the updated SQL content.
5. Paste it into the **Query Tool** in pgAdmin and run it.

### 3. Server Configuration

1. Create a `.env` file in the `server/` directory.
2. Add your database connection string:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/fifa26
   PORT=3000
   ```
   *Replace `password` and `fifa26` with your actual postgres password and database name.*

### 4. Start the Backend

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Start the server:
   ```bash
   node index.js
   ```
   The server will run on `http://localhost:3000`.

### 5. Start the Frontend

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

- **Frontend**: React, Vite, Vanilla CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
