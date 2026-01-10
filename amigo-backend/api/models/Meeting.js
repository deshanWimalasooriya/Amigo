module.exports = (sequelize, Sequelize) => {
    const Meeting = sequelize.define("meeting", {
      topic: {
        type: Sequelize.STRING,
        allowNull: false
      },
      date: {
        type: Sequelize.DATEONLY, // Stores just YYYY-MM-DD
        allowNull: false
      },
      time: {
        type: Sequelize.STRING, // Stores "14:30"
        allowNull: false
      },
      duration: {
        type: Sequelize.STRING,
        defaultValue: "30"
      },
      meetingCode: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      passcode: {
        type: Sequelize.STRING,
        defaultValue: ""
      },
      hostVideo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      participantVideo: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    });
  
    return Meeting;
  };