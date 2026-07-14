const { SymptomLog, SymptomEpisode, TriageResult, Medicine, TriageRule, sequelize } = require('../models');
const { Op } = require('sequelize');

const getStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Fetch active episodes
    const activeEpisodes = await SymptomEpisode.findAll({
      where: { userId, isActive: true },
      include: [{ model: SymptomLog, as: 'logs' }],
      order: [['startDate', 'DESC']]
    });

    // 2. Fetch latest logs
    const latestLogs = await SymptomLog.findAll({
      where: { userId },
      limit: 5,
      include: [{ model: TriageResult, as: 'triageResult' }],
      order: [['loggedAt', 'DESC']]
    });

    // 3. Fetch recent medicines
    const recentMedicines = await Medicine.findAll({
      where: { userId },
      limit: 5,
      order: [['timeTaken', 'DESC']]
    });

    // 4. Calculate Current Risk Level
    let currentRiskLevel = 'Low';
    
    // Look through latest triage results for active logs
    const activeLogIds = activeEpisodes.flatMap(ep => ep.logs.map(l => l.id));
    if (activeLogIds.length > 0) {
      const activeTriageResults = await TriageResult.findAll({
        where: {
          symptomLogId: { [Op.in]: activeLogIds }
        }
      });
      const risks = activeTriageResults.map(r => r.riskLevel);
      if (risks.includes('High')) {
        currentRiskLevel = 'High';
      } else if (risks.includes('Medium')) {
        currentRiskLevel = 'Medium';
      }
    }

    res.json({
      activeEpisodes,
      latestLogs,
      recentMedicines,
      currentRiskLevel
    });
  } catch (error) {
    next(error);
  }
};

const getTrends = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Symptom Frequency count
    const symptomFrequency = await SymptomLog.findAll({
      where: { userId },
      attributes: [
        'symptomName',
        [sequelize.fn('count', sequelize.col('id')), 'count']
      ],
      group: ['symptomName'],
      raw: true
    });

    // 2. Severity distribution
    const severityDistribution = await SymptomLog.findAll({
      where: { userId },
      attributes: [
        'severity',
        [sequelize.fn('count', sequelize.col('id')), 'count']
      ],
      group: ['severity'],
      raw: true
    });

    // 3. General feeling trend (grouped by date)
    const feelingTrend = await SymptomLog.findAll({
      where: { userId },
      attributes: [
        [sequelize.fn('date_trunc', 'day', sequelize.col('loggedAt')), 'day'],
        [sequelize.fn('avg', sequelize.col('generalFeeling')), 'avgFeeling']
      ],
      group: [sequelize.fn('date_trunc', 'day', sequelize.col('loggedAt'))],
      order: [[sequelize.fn('date_trunc', 'day', sequelize.col('loggedAt')), 'ASC']],
      raw: true
    });

    // 4. Medicine usage count
    const medicineUsage = await Medicine.findAll({
      where: { userId },
      attributes: [
        'name',
        [sequelize.fn('count', sequelize.col('id')), 'count']
      ],
      group: ['name'],
      raw: true
    });

    res.json({
      symptomFrequency: symptomFrequency.reduce((acc, curr) => {
        acc[curr.symptomName] = parseInt(curr.count);
        return acc;
      }, {}),
      severityDistribution: severityDistribution.reduce((acc, curr) => {
        acc[curr.severity] = parseInt(curr.count);
        return acc;
      }, {}),
      feelingTrend: feelingTrend.map(f => ({
        date: new Date(f.day).toISOString().split('T')[0],
        avgFeeling: parseFloat(f.avgFeeling).toFixed(1)
      })),
      medicineUsage: medicineUsage.reduce((acc, curr) => {
        acc[curr.name] = parseInt(curr.count);
        return acc;
      }, {})
    });
  } catch (error) {
    next(error);
  }
};

// Admin Rule Editor Endpoints
const getRules = async (req, res, next) => {
  try {
    const rules = await TriageRule.findAll({
      order: [['symptomName', 'ASC'], ['durationMinDays', 'ASC']]
    });
    res.json(rules);
  } catch (error) {
    next(error);
  }
};

const createRule = async (req, res, next) => {
  try {
    const { symptomName, severity, durationMinDays, riskLevel, recommendation, explanation } = req.body;
    const rule = await TriageRule.create({
      symptomName,
      severity,
      durationMinDays: parseInt(durationMinDays) || 0,
      riskLevel,
      recommendation,
      explanation,
      isActive: true
    });
    res.status(201).json(rule);
  } catch (error) {
    next(error);
  }
};

const toggleRule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rule = await TriageRule.findByPk(id);
    if (!rule) {
      return res.status(404).json({ error: 'Triage rule not found.' });
    }
    rule.isActive = !rule.isActive;
    await rule.save();
    res.json(rule);
  } catch (error) {
    next(error);
  }
};

const deleteRule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rule = await TriageRule.findByPk(id);
    if (!rule) {
      return res.status(404).json({ error: 'Triage rule not found.' });
    }
    await rule.destroy();
    res.json({ message: 'Triage rule deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStatus,
  getTrends,
  getRules,
  createRule,
  toggleRule,
  deleteRule
};
