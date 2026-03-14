module.exports = (sequelize, Sequelize) => {
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
    // Tracks whether the 10-minute pre-meeting reminder has been sent
    // so the cron job doesn’t fire twice for the same meeting.
    reminderSent: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });

  return Meeting;
};
