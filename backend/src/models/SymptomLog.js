const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SymptomLog = sequelize.define('SymptomLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  episodeId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  symptomName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  severity: {
    type: DataTypes.STRING, // 'Low' | 'Medium' | 'High'
    allowNull: false
  },
  durationDays: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  generalFeeling: {
    type: DataTypes.INTEGER,
    defaultValue: 3, // scale 1-5
    allowNull: false
  },
  loggedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
});

module.exports = SymptomLog;
