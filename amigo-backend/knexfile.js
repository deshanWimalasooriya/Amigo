require('dotenv').config();

module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
<<<<<<< HEAD
      port: process.env.DB_PORT || 4000, // TiDB uses port 4000
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      }
    },
    migrations: {
      directory: './DB/migrations'
    },
    seeds: {
      directory: './DB/seeders'
=======
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    migrations: {
      directory: './DB/migrations' // Pointing to your new folder
    },
    seeds: {
      directory: './DB/seeders'    // Pointing to your new folder
>>>>>>> ravindu/master
    }
  },
  
  production: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
<<<<<<< HEAD
      port: process.env.DB_PORT || 4000,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      }
=======
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
>>>>>>> ravindu/master
    },
    migrations: {
      directory: './DB/migrations'
    },
    seeds: {
      directory: './DB/seeders'
    }
  }
};