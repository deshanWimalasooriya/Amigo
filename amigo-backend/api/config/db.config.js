require('dotenv').config();

module.exports = {
<<<<<<< HEAD
  HOST: process.env.DB_HOST,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_NAME,
  dialect: "mysql",
  pool: {
    max: 5,     // Maximum number of connections in pool
    min: 0,     // Minimum number of connections in pool
    acquire: 30000, // Maximum time, in ms, that pool will try to get connection before throwing error
    idle: 10000  // Maximum time, in ms, that a connection can be idle before being released
  },
  dialectOptions: {           // <--- ADD THIS BLOCK
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      }
    }
};

=======
  HOST:     process.env.DB_HOST     || process.env.MYSQLHOST,
  USER:     process.env.DB_USER     || process.env.MYSQLUSER,
  PASSWORD: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
  DB:       process.env.DB_NAME     || process.env.MYSQLDATABASE,
  PORT:     process.env.DB_PORT     || process.env.MYSQLPORT || 3306,
  dialect:  'mysql',
  pool: {
    max:     5,
    min:     0,
    acquire: 30000,
    idle:    10000,
  },
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
};
>>>>>>> ravindu/master
