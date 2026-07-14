const { Medicine } = require('../models');

const createLog = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, dosage, timeTaken, notes } = req.body;

    const med = await Medicine.create({
      userId,
      name,
      dosage,
      timeTaken: timeTaken || new Date(),
      notes
    });

    res.status(201).json(med);
  } catch (error) {
    next(error);
  }
};

const getLogs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const meds = await Medicine.findAll({
      where: { userId },
      order: [['timeTaken', 'DESC']]
    });
    res.json(meds);
  } catch (error) {
    next(error);
  }
};

const deleteLog = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const med = await Medicine.findOne({ where: { id, userId } });
    if (!med) {
      return res.status(404).json({ error: 'Medicine log not found.' });
    }

    await med.destroy();
    res.json({ message: 'Medicine log deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLog,
  getLogs,
  deleteLog
};
