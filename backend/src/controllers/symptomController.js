const { SymptomLog, SymptomEpisode, TriageResult } = require('../models');
const { evaluateTriage } = require('../services/triageEngine');

const createLog = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { symptomLog, triageResult } = await evaluateTriage(userId, req.body);
    res.status(201).json({
      log: symptomLog,
      triageResult
    });
  } catch (error) {
    next(error);
  }
};

const getLogs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const logs = await SymptomLog.findAll({
      where: { userId },
      limit,
      offset,
      include: [{ model: TriageResult, as: 'triageResult' }],
      order: [['loggedAt', 'DESC']]
    });

    res.json(logs);
  } catch (error) {
    next(error);
  }
};

const getEpisodes = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const episodes = await SymptomEpisode.findAll({
      where: { userId },
      include: [{ model: SymptomLog, as: 'logs' }],
      order: [['isActive', 'DESC'], ['startDate', 'DESC']]
    });
    res.json(episodes);
  } catch (error) {
    next(error);
  }
};

const resolveEpisode = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const episode = await SymptomEpisode.findOne({ where: { id, userId } });
    if (!episode) {
      return res.status(404).json({ error: 'Symptom episode not found.' });
    }

    episode.isActive = false;
    episode.endDate = new Date().toISOString().split('T')[0];
    await episode.save();

    res.json({ message: 'Symptom track/episode resolved successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLog,
  getLogs,
  getEpisodes,
  resolveEpisode
};
