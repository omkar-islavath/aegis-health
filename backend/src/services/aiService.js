const { GoogleGenerativeAI } = require('@google/generative-ai');
const { SymptomLog, Medicine, TriageResult, User } = require('../models');
const { Op } = require('sequelize');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

const generateHealthSummary = async (userId, daysCount = 5) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysCount);
  
  // Fetch logs
  const logs = await SymptomLog.findAll({
    where: {
      userId,
      loggedAt: {
        [Op.gte]: startDate
      }
    },
    include: [{ model: TriageResult, as: 'triageResult' }],
    order: [['loggedAt', 'ASC']]
  });

  const medicines = await Medicine.findAll({
    where: {
      userId,
      timeTaken: {
        [Op.gte]: startDate
      }
    },
    order: [['timeTaken', 'ASC']]
  });

  // Prepare data snapshot text
  let symptomSummaryText = logs.map(log => {
    return `- **${log.symptomName}** (${log.severity} severity) logged on ${new Date(log.loggedAt).toLocaleDateString()}. Duration: ${log.durationDays} day(s). General Feeling: ${log.generalFeeling}/5. Notes: ${log.notes || 'None'}. Triage Risk: ${log.triageResult ? log.triageResult.riskLevel : 'Low'}.`;
  }).join('\n');

  let medicineSummaryText = medicines.map(med => {
    return `- **${med.name}** (${med.dosage || 'No dosage'}) taken on ${new Date(med.timeTaken).toLocaleString()}. Notes: ${med.notes || 'None'}.`;
  }).join('\n');

  const userInfo = `Patient Name: ${user.firstName} ${user.lastName}\nDOB: ${user.dob}\nGender: ${user.gender}`;
  
  const systemPrompt = `You are a medical scribe and summarization tool for the "Health Monitoring & Triage Platform". 
Your task is to take a log of a patient's recent symptom data and medication history, and compile it into a clean, structured, and professional markdown document that the patient can share with their doctor during a consultation.

CRITICAL INSTRUCTIONS:
1. Do NOT diagnose the patient with any specific disease.
2. Do NOT prescribe, suggest, or recommend any medicines or dosages.
3. Keep the tone clinical, objective, and structured.
4. Structure the output into the following sections:
   - **Patient Summary Header** (Name, DOB, Age/Gender)
   - **Executive Health Overview** (Brief synthesis of symptoms logged in the past ${daysCount} days, noting any recovery or worsening trends)
   - **Chronological Symptom Timeline** (A clear day-by-day table showing how symptoms progressed in duration and severity)
   - **Medication Log** (What was taken, when, and matching patient observations)
   - **Triage Alerts & Recommendations** (Summarizing risk evaluations)
   - **Suggested Consultation Questions** (A few structured questions the patient might want to ask their general practitioner based on the logs)`;

  const userContent = `Here is the patient data:
  
[PATIENT PROFILE]
${userInfo}

[SYMPTOM LOGS (Past ${daysCount} Days)]
${logs.length > 0 ? symptomSummaryText : 'No symptoms logged in this period.'}

[MEDICINE TAKEN (Past ${daysCount} Days)]
${medicines.length > 0 ? medicineSummaryText : 'No medicines logged in this period.'}`;

  let summaryText = '';

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `${systemPrompt}\n\n${userContent}`;
      const result = await model.generateContent(prompt);
      summaryText = result.response.text();
    } catch (error) {
      console.error('Gemini API call failed, using clinical fallback template:', error);
      summaryText = generateFallbackMarkdown(user, logs, medicines, daysCount);
    }
  } else {
    console.log('No GEMINI_API_KEY found, generating default medical summary report.');
    summaryText = generateFallbackMarkdown(user, logs, medicines, daysCount);
  }

  return {
    summaryText,
    startDate: startDate.toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  };
};

const generateFallbackMarkdown = (user, logs, medicines, daysCount) => {
  const today = new Date().toLocaleDateString();
  const startDay = new Date();
  startDay.setDate(startDay.getDate() - daysCount);
  
  let logsTable = '| Date | Symptom | Severity | Duration | Feeling | Notes |\n|---|---|---|---|---|---|\n';
  if (logs.length > 0) {
    logs.forEach(log => {
      logsTable += `| ${new Date(log.loggedAt).toLocaleDateString()} | ${log.symptomName} | ${log.severity} | ${log.durationDays} days | ${log.generalFeeling}/5 | ${log.notes || 'N/A'} |\n`;
    });
  } else {
    logsTable += '| - | No symptoms logged | - | - | - | - |\n';
  }

  let medsList = '';
  if (medicines.length > 0) {
    medicines.forEach(med => {
      medsList += `- **${med.name}** (${med.dosage || 'Unspecified dosage'}) - Taken on ${new Date(med.timeTaken).toLocaleDateString()} at ${new Date(med.timeTaken).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}.${med.notes ? ` Notes: *${med.notes}*` : ''}\n`;
    });
  } else {
    medsList = '*No medications logged during this period.*\n';
  }

  // Calculate highest risk level seen
  const riskLevels = logs.map(l => l.triageResult?.riskLevel).filter(Boolean);
  let overallRisk = 'Low';
  if (riskLevels.includes('High')) overallRisk = 'High';
  else if (riskLevels.includes('Medium')) overallRisk = 'Medium';

  return `
# Doctor Consultation Preparation Report
*Generated on ${today} | Health Monitoring & Triage Platform*

---

## 📋 Patient Profile
- **Name:** ${user.firstName} ${user.lastName}
- **DOB:** ${user.dob}
- **Gender:** ${user.gender}
- **Reporting Period:** ${startDay.toLocaleDateString()} to ${today} (${daysCount} Days)

---

## 🔍 Executive Health Overview
Over the past ${daysCount} days, the patient has maintained active health logs.
- **Total Logs recorded:** ${logs.length} entries.
- **Reported Symptoms:** ${[...new Set(logs.map(l => l.symptomName))].join(', ') || 'None'}.
- **Peak Risk Evaluation:** **${overallRisk} Risk**.
- **Overall Recovery Status:** ${logs.length > 0 ? `General feeling average is ${(logs.reduce((acc, curr) => acc + curr.generalFeeling, 0) / logs.length).toFixed(1)}/5.` : 'No logs recorded.'}

---

## 📅 Chronological Symptom Timeline

${logsTable}

---

## 💊 Medication Log
The following medications were self-recorded by the patient during this period. Note: This is an audit log of patient self-administration and not a medical prescription.

${medsList}

---

## ⚠️ Triage Warnings & Recommendations
- **Overall Triage Classification:** **${overallRisk} Risk**
- **Actionable Guidelines:**
  ${overallRisk === 'High' ? '- **Urgent Consultation Advised:** Please contact your doctor or visit emergency care immediately. High risk symptoms have been logged.\n- Keep all logged history open on your device to share with the physician.' : ''}
  ${overallRisk === 'Medium' ? '- **Consultation Recommended:** Schedule an appointment with a general practitioner to address persisting symptoms.\n- Rest and avoid strenuous activity.' : ''}
  ${overallRisk === 'Low' ? '- **Standard Self-Care:** Continue logging symptoms daily. Stay hydrated, rest, and check temperature. If symptoms worsen, consult a doctor.' : ''}

---

## ❓ Suggested Questions for Your Doctor
1. Based on the symptom duration of **${logs.length > 0 ? Math.max(...logs.map(l => l.durationDays)) : 0} days**, do you recommend any clinical tests?
2. Are the symptoms logged above matching the typical clinical course for minor infections, or should we investigate further?
3. Should I adjust or follow any specific lifestyle or hydration practices to support recovery?

*Disclaimer: This report is an automated synthesis of self-reported data. It does not replace a clinical examination, professional diagnosis, or prescription by a certified medical provider.*
`;
};

module.exports = {
  generateHealthSummary
};
