const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
});

async function deleteold(){
    try {
        const client = await pool.connect();
        await client.query('delete from events where date < now()');
        console.log("clear old data");
        client.release();
    } catch (err) {
        console.error(err);
    }
}

deleteold();