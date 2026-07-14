const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TriageRule = sequelize.define('TriageRule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  symptomName: {
    type: DataTypes.STRING,
    allowNull: false // e.g. 'Fever', '*' for catch-all
  },
  severity: {
    type: DataTypes.STRING, // 'Low' | 'Medium' | 'High' | '*' for catch-all
    allowNull: false
  },
  durationMinDays: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
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
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
});

module.exports = TriageRule;
