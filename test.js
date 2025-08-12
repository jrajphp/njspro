import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgres://postgres:blaze.ws@localhost:5432/impronextdb'
});

await client.connect();

const res = await client.query('SELECT * FROM categories');
console.log(res.rows);

await client.end();