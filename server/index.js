const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test DB Connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error acquiring client", err.stack);
  }
  client.query("SELECT NOW()", (err, result) => {
    release();
    if (err) {
      return console.error("Error executing query", err.stack);
    }
    console.log("Connected to Database:", result.rows[0]);
  });
});

// Routes

// 1. Search Players
app.get("/api/players/search", async (req, res) => {
  try {
    const { name, league, club, position, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
            SELECT p.Player_id, p.Short_name, p.Player_position, p.Overall, 
                   c.Nationality_name, cl.Club_name, l.League_name
            FROM PLAYER p
            LEFT JOIN COUNTRY c ON p.Nationality_id = c.Nationality_id
            LEFT JOIN CLUB cl ON p.Club_team_id = cl.Club_team_id
            LEFT JOIN LEAGUE l ON cl.League_id = l.League_id
            WHERE 1=1
        `;

    const params = [];
    let paramCount = 1;

    if (name) {
      query += ` AND p.Short_name ILIKE $${paramCount}`;
      params.push(`%${name}%`);
      paramCount++;
    }

    if (league) {
      query += ` AND l.League_name ILIKE $${paramCount}`;
      params.push(`%${league}%`);
      paramCount++;
    }

    if (club) {
      query += ` AND cl.Club_name ILIKE $${paramCount}`;
      params.push(`%${club}%`);
      paramCount++;
    }

    if (position) {
      query += ` AND p.Player_position ILIKE $${paramCount}`;
      params.push(`%${position}%`);
      paramCount++;
    }

    // Add sorting and pagination
    query += ` ORDER BY p.Overall DESC LIMIT $${paramCount} OFFSET $${
      paramCount + 1
    }`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = `
            SELECT COUNT(*) 
            FROM PLAYER p
            LEFT JOIN CLUB cl ON p.Club_team_id = cl.Club_team_id
            LEFT JOIN LEAGUE l ON cl.League_id = l.League_id
            WHERE 1=1
        `;
    const countParams = params.slice(0, paramCount - 1); // Exclude limit and offset

    // Reconstruct where clause for count
    if (name) countQuery += ` AND p.Short_name ILIKE $1`;
    if (league) countQuery += ` AND l.League_name ILIKE $${name ? 2 : 1}`;
    // ... (simplified count logic for brevity, ideally reuse logic)
    // For now, let's just return the results, pagination metadata can be added if needed strictly

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 2. Get Player Details
app.get("/api/players/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch basic info, ratings, and additional info
    const query = `
            SELECT p.*, 
                   c.Nationality_name, 
                   cl.Club_name, 
                   l.League_name,
                   r.Passing, r.Defending, r.Dribbling, r.Pace, r.Shooting, r.Physic,
                   ai.Age, ai.DOB, ai.Height, ai.Weight, ai.Wages, ai.Release_clause, ai.Preferred_Position, ai.Weak_foot
            FROM PLAYER p
            LEFT JOIN COUNTRY c ON p.Nationality_id = c.Nationality_id
            LEFT JOIN CLUB cl ON p.Club_team_id = cl.Club_team_id
            LEFT JOIN LEAGUE l ON cl.League_id = l.League_id
            LEFT JOIN RATINGS r ON p.Player_id = r.Player_id
            LEFT JOIN ADDITIONAL_INFO ai ON p.Player_id = ai.Player_id
            WHERE p.Player_id = $1
        `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Player not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 3. Compare Players
app.get("/api/players/compare/data", async (req, res) => {
  try {
    const { ids } = req.query; // Expect comma-separated IDs: 123,456
    if (!ids) {
      return res.status(400).json({ error: "No IDs provided" });
    }

    const idArray = ids.split(",").map((id) => parseInt(id.trim()));

    const query = `
            SELECT p.Player_id, p.Short_name, p.Overall, p.Player_position,
                   c.Nationality_name, cl.Club_name,
                   r.Passing, r.Defending, r.Dribbling, r.Pace, r.Shooting, r.Physic,
                   ai.Age, ai.Height, ai.Weight, ai.Weak_foot
            FROM PLAYER p
            LEFT JOIN COUNTRY c ON p.Nationality_id = c.Nationality_id
            LEFT JOIN CLUB cl ON p.Club_team_id = cl.Club_team_id
            LEFT JOIN RATINGS r ON p.Player_id = r.Player_id
            LEFT JOIN ADDITIONAL_INFO ai ON p.Player_id = ai.Player_id
            WHERE p.Player_id = ANY($1)
        `;

    const result = await pool.query(query, [idArray]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 4. Delete Player
app.delete('/api/players/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;
        
        // Due to CASCADE constraints, deleting from PLAYER should delete from other tables
        // But let's be explicit if needed, or rely on CASCADE. 
        // The schema has ON DELETE CASCADE, so deleting from PLAYER is enough.
        
        const result = await client.query('DELETE FROM PLAYER WHERE Player_id = $1 RETURNING *', [id]);
        
        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Player not found' });
        }

        await client.query('COMMIT');
        res.json({ message: 'Player deleted successfully', id });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
});

// 5. Create Player
app.post('/api/players', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { 
            Short_name, Player_position, Nationality_id, Club_team_id, Overall,
            Age, Height, Weight, Preferred_Position, Weak_foot,
            Pace, Shooting, Passing, Dribbling, Defending, Physic
        } = req.body;

        // Generate a new ID (simplified: max + 1)
        // In production, use a sequence or UUID.
        const idRes = await client.query('SELECT MAX(Player_id) as max_id FROM PLAYER');
        const newId = (idRes.rows[0].max_id || 0) + 1;

        // Insert into PLAYER
        await client.query(
            'INSERT INTO PLAYER (Player_id, Short_name, Player_position, Nationality_id, Club_team_id, Overall) VALUES ($1, $2, $3, $4, $5, $6)',
            [newId, Short_name, Player_position, Nationality_id, Club_team_id, Overall]
        );

        // Insert into ADDITIONAL_INFO
        await client.query(
            'INSERT INTO ADDITIONAL_INFO (Player_id, Age, Height, Weight, Preferred_Position, Weak_foot) VALUES ($1, $2, $3, $4, $5, $6)',
            [newId, Age, Height, Weight, Preferred_Position, Weak_foot]
        );

        // Insert into RATINGS
        await client.query(
            'INSERT INTO RATINGS (Player_id, Pace, Shooting, Passing, Dribbling, Defending, Physic) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [newId, Pace, Shooting, Passing, Dribbling, Defending, Physic]
        );

        await client.query('COMMIT');
        res.status(201).json({ message: 'Player created', id: newId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
});

// 6. Update Player
app.put('/api/players/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;
        const { 
            Short_name, Player_position, Nationality_id, Club_team_id, Overall,
            Age, Height, Weight, Preferred_Position, Weak_foot,
            Pace, Shooting, Passing, Dribbling, Defending, Physic
        } = req.body;

        // Update PLAYER
        await client.query(
            'UPDATE PLAYER SET Short_name = $1, Player_position = $2, Nationality_id = $3, Club_team_id = $4, Overall = $5 WHERE Player_id = $6',
            [Short_name, Player_position, Nationality_id, Club_team_id, Overall, id]
        );

        // Update ADDITIONAL_INFO (Upsert logic would be better, but assuming existence for simplicity or using INSERT ON CONFLICT)
        await client.query(
            `INSERT INTO ADDITIONAL_INFO (Player_id, Age, Height, Weight, Preferred_Position, Weak_foot) 
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (Player_id) DO UPDATE SET 
             Age = EXCLUDED.Age, Height = EXCLUDED.Height, Weight = EXCLUDED.Weight, 
             Preferred_Position = EXCLUDED.Preferred_Position, Weak_foot = EXCLUDED.Weak_foot`,
            [id, Age, Height, Weight, Preferred_Position, Weak_foot]
        );

        // Update RATINGS
        await client.query(
            `INSERT INTO RATINGS (Player_id, Pace, Shooting, Passing, Dribbling, Defending, Physic) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (Player_id) DO UPDATE SET 
             Pace = EXCLUDED.Pace, Shooting = EXCLUDED.Shooting, Passing = EXCLUDED.Passing, 
             Dribbling = EXCLUDED.Dribbling, Defending = EXCLUDED.Defending, Physic = EXCLUDED.Physic`,
            [id, Pace, Shooting, Passing, Dribbling, Defending, Physic]
        );

        await client.query('COMMIT');
        res.json({ message: 'Player updated successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
