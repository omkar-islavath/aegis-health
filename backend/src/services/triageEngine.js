const { SymptomEpisode, SymptomLog, TriageRule, TriageResult, Notification } = require('../models');

const evaluateTriage = async (userId, logData) => {
  const { symptomName, severity, notes, generalFeeling, loggedAt } = logData;
  
  // 1. Resolve active episode or create one
  const logDate = loggedAt ? new Date(loggedAt) : new Date();
  
  let episode = await SymptomEpisode.findOne({
    where: {
      userId,
      symptomName,
      isActive: true
    }
  });
  
  let durationDays = 1;
  
  if (episode) {
    // Calculate duration in calendar days (inclusive)
    const startDate = new Date(episode.startDate);
    const startZero = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const currentZero = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());
    const diffTime = currentZero - startZero;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to make it inclusive
    durationDays = diffDays < 1 ? 1 : diffDays;
  } else {
    // Create new episode
    episode = await SymptomEpisode.create({
      userId,
      symptomName,
      startDate: logDate,
      isActive: true
    });
  }
  
  // 2. Save the log entry
  const symptomLog = await SymptomLog.create({
    userId,
    episodeId: episode.id,
    symptomName,
    severity,
    durationDays,
    notes,
    generalFeeling,
    loggedAt: logDate
  });

  // 3. Evaluate Triage Rules
  // Fetch active rules
  const rules = await TriageRule.findAll({ where: { isActive: true } });
  
  // Find candidates
  const candidates = rules.filter(rule => {
    const symptomMatches = rule.symptomName.toLowerCase() === symptomName.toLowerCase() || rule.symptomName === '*';
    const severityMatches = rule.severity.toLowerCase() === severity.toLowerCase() || rule.severity === '*';
    const durationMatches = durationDays >= rule.durationMinDays;
    
    return symptomMatches && severityMatches && durationMatches;
  });

  let riskLevel = 'Low';
  let recommendation = 'Continue self-care and monitoring. Get plenty of rest and stay hydrated.';
  let explanation = 'Your symptom has been logged. General wellness self-monitoring is advised.';
  let matchedRuleId = null;

  if (severity === 'High') {
    riskLevel = 'Medium';
    recommendation = 'Monitor closely. If symptoms persist for more than 24 hours or worsen, consider consulting a general physician.';
    explanation = 'High severity symptoms generally warrant caution and closer clinical observation.';
  } else if (severity === 'Medium') {
    riskLevel = 'Low';
    recommendation = 'Rest, monitor your symptoms, and avoid strenuous activity. Consult a doctor if condition worsens.';
    explanation = 'Moderate symptoms logged. Standard self-monitoring is recommended.';
  }

  if (candidates.length > 0) {
    // Sort rules:
    // 1. Specific symptom match beats wildcard '*'
    // 2. Specific severity match beats wildcard '*'
    // 3. High risk > Medium risk > Low risk
    // 4. Higher durationMinDays is more specific
    candidates.sort((a, b) => {
      const aSpecSymptom = a.symptomName !== '*' ? 1 : 0;
      const bSpecSymptom = b.symptomName !== '*' ? 1 : 0;
      if (aSpecSymptom !== bSpecSymptom) return bSpecSymptom - aSpecSymptom;

      const aSpecSev = a.severity !== '*' ? 1 : 0;
      const bSpecSev = b.severity !== '*' ? 1 : 0;
      if (aSpecSev !== bSpecSev) return bSpecSev - aSpecSev;

      const riskWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
      const aWeight = riskWeight[a.riskLevel] || 0;
      const bWeight = riskWeight[b.riskLevel] || 0;
      if (aWeight !== bWeight) return bWeight - aWeight;

      return b.durationMinDays - a.durationMinDays;
    });

    const topRule = candidates[0];
    riskLevel = topRule.riskLevel;
    recommendation = topRule.recommendation;
    explanation = topRule.explanation;
    matchedRuleId = topRule.id;
  }

  // 4. Save Triage Result
  const triageResult = await TriageResult.create({
    userId,
    symptomLogId: symptomLog.id,
    ruleId: matchedRuleId,
    riskLevel,
    recommendation,
    explanation,
    evaluatedAt: new Date()
  });

  // 5. Generate Notifications if Risk is Medium or High
  if (riskLevel === 'Medium' || riskLevel === 'High') {
    const alertTitle = `${riskLevel} Risk Alert: ${symptomName}`;
    const alertMsg = `Your logged symptom "${symptomName}" has been flagged as ${riskLevel} risk level. Recommendation: ${recommendation}`;
    
    await Notification.create({
      userId,
      type: 'triage_alert',
      title: alertTitle,
      message: alertMsg,
      isRead: false
    });
  }

  return {
    symptomLog,
    triageResult
  };
};

module.exports = {
  evaluateTriage
};
