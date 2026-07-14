const { Sequelize } = require('sequelize');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not defined in the environment variables.');
  process.exit(1);
}

const isCloudDb = databaseUrl.includes('render.com') || databaseUrl.includes('supabase') || databaseUrl.includes('dpg-');

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false, // Set to console.log for SQL query debugging
  dialectOptions: (process.env.NODE_ENV === 'production' || isCloudDb) ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {}
});

module.exports = sequelize;
