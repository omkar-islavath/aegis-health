const sequelize = require('../config/db');
const User = require('./User');
const SymptomEpisode = require('./SymptomEpisode');
const SymptomLog = require('./SymptomLog');
const Medicine = require('./Medicine');
const TriageRule = require('./TriageRule');
const TriageResult = require('./TriageResult');
const Notification = require('./Notification');
const AISummary = require('./AISummary');

// User Associations
User.hasMany(SymptomEpisode, { foreignKey: 'userId', onDelete: 'CASCADE' });
SymptomEpisode.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(SymptomLog, { foreignKey: 'userId', onDelete: 'CASCADE' });
SymptomLog.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Medicine, { foreignKey: 'userId', onDelete: 'CASCADE' });
Medicine.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(TriageResult, { foreignKey: 'userId', onDelete: 'CASCADE' });
TriageResult.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(AISummary, { foreignKey: 'userId', onDelete: 'CASCADE' });
AISummary.belongsTo(User, { foreignKey: 'userId' });

// Episode & Log Associations
SymptomEpisode.hasMany(SymptomLog, { foreignKey: 'episodeId', as: 'logs', onDelete: 'CASCADE' });
SymptomLog.belongsTo(SymptomEpisode, { foreignKey: 'episodeId', as: 'episode' });

// Log & Triage Result Associations
SymptomLog.hasOne(TriageResult, { foreignKey: 'symptomLogId', as: 'triageResult', onDelete: 'CASCADE' });
TriageResult.belongsTo(SymptomLog, { foreignKey: 'symptomLogId', as: 'symptomLog' });

// Rule & Triage Result Associations
TriageRule.hasMany(TriageResult, { foreignKey: 'ruleId', onDelete: 'SET NULL' });
TriageResult.belongsTo(TriageRule, { foreignKey: 'ruleId', as: 'matchedRule' });

module.exports = {
  sequelize,
  User,
  SymptomEpisode,
  SymptomLog,
  Medicine,
  TriageRule,
  TriageResult,
  Notification,
  AISummary
};
