const dbConfig = require('../config/db.config.js');
const Sequelize = require("sequelize");

// 1. Initialize the Connection FIRST
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: 0,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  },
  dialectOptions: {           // <--- ADD THIS BLOCK
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      }
    },
  logging: false 
});

// 2. Initialize the db object NEXT
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// 3. Load Models AFTER db and sequelize exist
db.users = require("./User.js")(sequelize, Sequelize);
db.meetings = require("./Meeting.js")(sequelize, Sequelize);

// 4. Create Relationships
db.users.hasMany(db.meetings, { as: "meetings" });
db.meetings.belongsTo(db.users, {
  foreignKey: "userId",
  as: "user",
});

module.exports = db;