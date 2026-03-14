module.exports = (sequelize, Sequelize) => {
  const Notification = sequelize.define('notification', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    // 'invitation' | 'reminder' | 'meeting' | 'info'
    type: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'info',
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    message: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    isRead: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    // JSON string, e.g. { roomId, meetingTitle }
    meta: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
  });

  return Notification;
};
