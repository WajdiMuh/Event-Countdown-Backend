const express = require('express');
const { Pool } = require('pg');
const app = express();

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.get('/db', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM events');
      res.send(result);
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

app.listen(process.env.PORT || 5000,() => {
    console.log('server running');
});
