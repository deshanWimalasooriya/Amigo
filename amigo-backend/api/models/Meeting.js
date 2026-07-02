module.exports = (sequelize, Sequelize) => {
<<<<<<< HEAD
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
=======
  const Meeting = sequelize.define('meeting', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    roomId: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Instant Meeting',
    },
    hostId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    passcode: {
      type: Sequelize.STRING,
      defaultValue: '',
    },
    scheduledAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    duration: {
      type: Sequelize.INTEGER,
      defaultValue: 60,
    },
    status: {
      type: Sequelize.ENUM('scheduled', 'ongoing', 'ended'),
      defaultValue: 'scheduled',
    },
    hostVideoOn: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    participantVideoOn: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    usePMI: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    startedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    endedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  });

  return Meeting;
};
>>>>>>> ravindu/master
