const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

// 1. Initialize the Connection
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: 0, // Hide warnings
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  },
  logging: false // Set to true if you want to see raw SQL queries in terminal
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Load the User Model
db.users = require("./User.js")(sequelize, Sequelize);

// We will import models here later (User, Meeting) like this:
// db.users = require("./User.js")(sequelize, Sequelize);

module.exports = db;