const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TriageResult = sequelize.define('TriageResult', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  symptomLogId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  ruleId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  riskLevel: {
    type: DataTypes.STRING, // 'Low' | 'Medium' | 'High'
    allowNull: false
  },
  recommendation: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  evaluatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
});

module.exports = TriageResult;
