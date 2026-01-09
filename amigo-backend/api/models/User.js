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
      unique: true, // No duplicate emails allowed
      validate: {
        isEmail: true
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    // The Unique Personal Meeting ID (Instruction Followed)
    pmi: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    avatar: {
      type: Sequelize.STRING,
      defaultValue: "" // URL to image
    }
  });

  return User;
};