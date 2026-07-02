module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define('user', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fullName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    pmi: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    },
    avatar: {
      type: Sequelize.STRING,
      defaultValue: '',
    },
    // Extended profile fields (nullable — filled in via Edit Profile)
    phone: {
      type: Sequelize.STRING,
      defaultValue: '',
    },
    location: {
      type: Sequelize.STRING,
      defaultValue: '',
    },
    timezone: {
      type: Sequelize.STRING,
      defaultValue: '(GMT+05:30) India Standard Time',
    },
    company: {
      type: Sequelize.STRING,
      defaultValue: '',
    },
    jobTitle: {
      type: Sequelize.STRING,
      defaultValue: '',
    },
    bio: {
      type: Sequelize.TEXT,
      defaultValue: '',
    },
  });

  return User;
};
