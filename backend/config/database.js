const { Sequelize } = require('sequelize');
require('dotenv').config();

// SSL configuration for managed PostgreSQL services
const sslConfig = process.env.DB_SSL === 'true' || process.env.DB_HOST !== 'localhost' ? {
  require: true,
  rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true'
} : false;

const sequelize = new Sequelize(
  process.env.DB_NAME || 'crm_system',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: sslConfig
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = { sequelize };

