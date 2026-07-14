const { AISummary } = require('../models');
const { generateHealthSummary } = require('../services/aiService');

const generateSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.body.days) || 5;

    const summaryResult = await generateHealthSummary(userId, days);
    
    // Save to database
    const savedSummary = await AISummary.create({
      userId,
      summaryText: summaryResult.summaryText,
      startDate: summaryResult.startDate,
      endDate: summaryResult.endDate
    });

    res.json(savedSummary);
  } catch (error) {
    next(error);
  }
};

const getSummaries = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const summaries = await AISummary.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(summaries);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateSummary,
  getSummaries
};
