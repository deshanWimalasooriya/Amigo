module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fullName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    pmi: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    avatar: {
      type: Sequelize.STRING,
      defaultValue: ""
    },
    // --- NEW COLUMNS ---
    company: {
      type: Sequelize.STRING,
      defaultValue: ""
    },
    jobTitle: {
      type: Sequelize.STRING,
      defaultValue: ""
    },
    bio: {
      type: Sequelize.TEXT, // Use TEXT for long bio
      defaultValue: ""
    },
    phone: {
      type: Sequelize.STRING,
      defaultValue: ""
    },
    location: {
      type: Sequelize.STRING,
      defaultValue: ""
    },
    timezone: {
      type: Sequelize.STRING,
      defaultValue: ""
    }
  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return User;
};