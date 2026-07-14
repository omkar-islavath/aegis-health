const { Client } = require('pg');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

const initDatabase = async () => {
  if (!databaseUrl) {
    console.error('DATABASE_URL is not defined in the environment variables.');
    return;
  }

  // Parse database name from URL (e.g. postgres://user:pass@host:port/database_name)
  const urlParts = databaseUrl.split('/');
  const dbName = urlParts[urlParts.length - 1].split('?')[0];

  // Create connection string targeting default 'postgres' database
  const rootUrl = databaseUrl.substring(0, databaseUrl.lastIndexOf('/')) + '/postgres';

  console.log(`Verifying if database "${dbName}" exists...`);
  const client = new Client({ connectionString: rootUrl });

  try {
    await client.connect();
    const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (res.rowCount === 0) {
      console.log(`Database "${dbName}" does not exist. Creating database now...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully!`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (error) {
    console.error('Error verifying/creating database:', error.message);
  } finally {
    try {
      await client.end();
    } catch (e) {}
  }
};

module.exports = initDatabase;
