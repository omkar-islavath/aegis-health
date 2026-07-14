const { TriageRule, TriageResult } = require('../models');
const sequelize = require('../config/db');
const initDatabase = require('../config/initDb');

const rules = [
  // ==========================================
  // 1. FEVER RULES (12 Rules)
  // ==========================================
  { symptomName: 'Fever', severity: 'Low', durationMinDays: 0, riskLevel: 'Low', recommendation: 'Rest, drink plenty of fluids, and monitor temperature twice daily.', explanation: 'Mild body temperature rise. Standard monitoring is sufficient.', isActive: true },
  { symptomName: 'Fever', severity: 'Low', durationMinDays: 2, riskLevel: 'Low', recommendation: 'Fever remains mild but has lasted 2 days. Continue fluids, take paracetamol if needed, and observe.', explanation: 'Mild fever persisting for 2 days.', isActive: true },
  { symptomName: 'Fever', severity: 'Low', durationMinDays: 3, riskLevel: 'Medium', recommendation: 'Fever has persisted for 3 days. We recommend consulting a general physician to rule out infection.', explanation: 'Mild fever persisting for 3 or more days.', isActive: true },
  { symptomName: 'Fever', severity: 'Low', durationMinDays: 5, riskLevel: 'Medium', recommendation: 'Fever is persisting for 5 days. Schedule a doctor appointment for diagnostic blood tests.', explanation: 'Mild fever persisting for 5 or more days.', isActive: true },
  
  { symptomName: 'Fever', severity: 'Medium', durationMinDays: 0, riskLevel: 'Low', recommendation: 'Fever is moderate (e.g. 100-101.5 F). Keep cool compress, rest, and stay hydrated.', explanation: 'Moderate body temperature logged.', isActive: true },
  { symptomName: 'Fever', severity: 'Medium', durationMinDays: 1, riskLevel: 'Medium', recommendation: 'Moderate fever has persisted. Take antipyretics and schedule a GP visit if it does not subside.', explanation: 'Moderate fever persisting for 24 hours.', isActive: true },
  { symptomName: 'Fever', severity: 'Medium', durationMinDays: 2, riskLevel: 'Medium', recommendation: 'Fever running for 2 days. Consult a physician to check for bacterial or viral infections.', explanation: 'Moderate fever persisting for 2 days.', isActive: true },
  { symptomName: 'Fever', severity: 'Medium', durationMinDays: 3, riskLevel: 'High', recommendation: 'Moderate fever for 3 days requires active medical diagnosis. Visit a general physician promptly.', explanation: 'Moderate fever persisting for 3 or more days.', isActive: true },
  
  { symptomName: 'Fever', severity: 'High', durationMinDays: 0, riskLevel: 'Medium', recommendation: 'High temperature recorded (e.g. >102 F). Take antipyretics, keep hydrated, and monitor hourly.', explanation: 'High body temperature logged in early stage.', isActive: true },
  { symptomName: 'Fever', severity: 'High', durationMinDays: 1, riskLevel: 'Medium', recommendation: 'High fever persisting for 24 hours. We advise booking a physician checkup today.', explanation: 'High fever persisting for 1 day.', isActive: true },
  { symptomName: 'Fever', severity: 'High', durationMinDays: 2, riskLevel: 'High', recommendation: 'High fever for 2 days. Consult a doctor immediately to prevent febrile complications.', explanation: 'High fever persisting for 2 days.', isActive: true },
  { symptomName: 'Fever', severity: 'High', durationMinDays: 3, riskLevel: 'High', recommendation: 'Seek urgent medical attention. High fever persisting for 3 or more days requires hospital triage.', explanation: 'High fever persisting for 3 or more days.', isActive: true },

  // ==========================================
  // 2. HEADACHE RULES (12 Rules)
  // ==========================================
  { symptomName: 'Headache', severity: 'Low', durationMinDays: 0, riskLevel: 'Low', recommendation: 'Rest in a quiet, dark room. Keep hydrated and practice stress-relief exercises.', explanation: 'Mild headache recorded.', isActive: true },
  { symptomName: 'Headache', severity: 'Low', durationMinDays: 2, riskLevel: 'Low', recommendation: 'Headache is mild but persisting. Take a mild painkiller if needed, and check hydration.', explanation: 'Mild headache persisting for 2 days.', isActive: true },
  { symptomName: 'Headache', severity: 'Low', durationMinDays: 3, riskLevel: 'Medium', recommendation: 'Headache has lasted 3 days. Consult a doctor to rule out tension or sinus causes.', explanation: 'Mild headache persisting for 3 days.', isActive: true },
  { symptomName: 'Headache', severity: 'Low', durationMinDays: 5, riskLevel: 'Medium', recommendation: 'Headache persisting for 5 days. Schedule a medical consult for detailed evaluation.', explanation: 'Mild headache persisting for 5 days.', isActive: true },
  
  { symptomName: 'Headache', severity: 'Medium', durationMinDays: 0, riskLevel: 'Low', recommendation: 'Moderate headache. Rest, limit screen time, and stay hydrated. Monitor pain triggers.', explanation: 'Moderate headache recorded.', isActive: true },
  { symptomName: 'Headache', severity: 'Medium', durationMinDays: 1, riskLevel: 'Medium', recommendation: 'Moderate headache has lasted 24 hours. Consider an OTC pain relief medication.', explanation: 'Moderate headache persisting for 1 day.', isActive: true },
  { symptomName: 'Headache', severity: 'Medium', durationMinDays: 2, riskLevel: 'Medium', recommendation: 'Headache persisting for 2 days. Schedule a routine doctor checkup if pain does not diminish.', explanation: 'Moderate headache persisting for 2 days.', isActive: true },
  { symptomName: 'Headache', severity: 'Medium', durationMinDays: 3, riskLevel: 'High', recommendation: 'Moderate headache running for 3 days requires clinical check. Book a physician visit.', explanation: 'Moderate headache persisting for 3 days.', isActive: true },
  
  { symptomName: 'Headache', severity: 'High', durationMinDays: 0, riskLevel: 'Medium', recommendation: 'Severe headache recorded. Rest in a dark room. Seek doctor consultation if accompanied by light sensitivity.', explanation: 'Severe headache logged.', isActive: true },
  { symptomName: 'Headache', severity: 'High', durationMinDays: 1, riskLevel: 'Medium', recommendation: 'Severe headache persisting for 24 hours. We advise booking a physician consult today.', explanation: 'Severe headache persisting for 1 day.', isActive: true },
  { symptomName: 'Headache', severity: 'High', durationMinDays: 2, riskLevel: 'High', recommendation: 'Severe headache for 2 days. Consult a doctor immediately to rule out serious neurological causes.', explanation: 'Severe headache persisting for 2 days.', isActive: true },
  { symptomName: 'Headache', severity: 'High', durationMinDays: 3, riskLevel: 'High', recommendation: 'Seek emergency care. Prolonged severe headache requires immediate neurological evaluation.', explanation: 'Severe headache persisting for 3 or more days.', isActive: true },

  // ==========================================
  // 3. COUGH RULES (12 Rules)
  // ==========================================
  { symptomName: 'Cough', severity: 'Low', durationMinDays: 0, riskLevel: 'Low', recommendation: 'Stay hydrated with warm water, herbal teas, or honey. Rest your throat.', explanation: 'Mild cough recorded.', isActive: true },
  { symptomName: 'Cough', severity: 'Low', durationMinDays: 3, riskLevel: 'Low', recommendation: 'Cough is mild but has lasted 3 days. Keep hydrated and use throat lozenges.', explanation: 'Mild cough persisting for 3 days.', isActive: true },
  { symptomName: 'Cough', severity: 'Low', durationMinDays: 5, riskLevel: 'Medium', recommendation: 'Cough persisting for 5 days. Consult a doctor to rule out bronchitis or respiratory allergies.', explanation: 'Mild cough persisting for 5 days.', isActive: true },
  { symptomName: 'Cough', severity: 'Low', durationMinDays: 7, riskLevel: 'Medium', recommendation: 'Mild cough persisting for a week. Schedule a physician checkup for chest clear inspection.', explanation: 'Mild cough persisting for 7 or more days.', isActive: true },
  
  { symptomName: 'Cough', severity: 'Medium', durationMinDays: 0, riskLevel: 'Low', recommendation: 'Moderate cough. Take steam inhalation, stay hydrated, and rest.', explanation: 'Moderate cough recorded.', isActive: true },
  { symptomName: 'Cough', severity: 'Medium', durationMinDays: 2, riskLevel: 'Medium', recommendation: 'Moderate cough has lasted 2 days. Consult a GP if you experience slight wheezing or phlegm.', explanation: 'Moderate cough persisting for 2 days.', isActive: true },
  { symptomName: 'Cough', severity: 'Medium', durationMinDays: 4, riskLevel: 'Medium', recommendation: 'Cough running for 4 days. Book a GP appointment for chest auscultation.', explanation: 'Moderate cough persisting for 4 days.', isActive: true },
  { symptomName: 'Cough', severity: 'Medium', durationMinDays: 7, riskLevel: 'High', recommendation: 'Cough has persisted for a week. Schedule an immediate physician visit for diagnostic bloods or chest X-ray.', explanation: 'Moderate cough persisting for 7 days.', isActive: true },
  
  { symptomName: 'Cough', severity: 'High', durationMinDays: 0, riskLevel: 'Medium', recommendation: 'Severe cough recorded. Take warm fluids, monitor breathing, and schedule a physician visit.', explanation: 'Severe cough logged.', isActive: true },
  { symptomName: 'Cough', severity: 'High', durationMinDays: 2, riskLevel: 'Medium', recommendation: 'Severe cough persisting for 2 days. Seek clinical advice for potential respiratory infection.', explanation: 'Severe cough persisting for 2 days.', isActive: true },
  { symptomName: 'Cough', severity: 'High', durationMinDays: 3, riskLevel: 'High', recommendation: 'Severe cough for 3 days. Consult a doctor immediately to rule out pneumonia or severe bronchitis.', explanation: 'Severe cough persisting for 3 days.', isActive: true },
  { symptomName: 'Cough', severity: 'High', durationMinDays: 5, riskLevel: 'High', recommendation: 'Seek urgent hospital evaluation. Severe, chronic cough can indicate critical airway restriction.', explanation: 'Severe cough persisting for 5 or more days.', isActive: true },

  // ==========================================
  // 4. COLD RULES (10 Rules)
  // ==========================================
  { symptomName: 'Cold', severity: 'Low', durationMinDays: 0, riskLevel: 'Low', recommendation: 'Rest, stay warm, and consume hot soups. Use saline nasal drops for congestion.', explanation: 'Mild cold symptoms logged.', isActive: true },
  { symptomName: 'Cold', severity: 'Low', durationMinDays: 3, riskLevel: 'Low', recommendation: 'Cold symptoms have lasted 3 days. Continue rest and self-care.', explanation: 'Mild cold persisting for 3 days.', isActive: true },
  { symptomName: 'Cold', severity: 'Low', durationMinDays: 5, riskLevel: 'Low', recommendation: 'Mild cold persisting for 5 days. Monitor for any chest tightness.', explanation: 'Mild cold persisting for 5 days.', isActive: true },
  { symptomName: 'Cold', severity: 'Low', durationMinDays: 7, riskLevel: 'Medium', recommendation: 'Cold has lasted a week. Consult a physician to check for sinus congestion or ear infection.', explanation: 'Mild cold persisting for 7 days.', isActive: true },
  
  { symptomName: 'Cold', severity: 'Medium', durationMinDays: 0, riskLevel: 'Low', recommendation: 'Moderate cold. Use steam inhalation, saline rinses, and take plenty of rest.', explanation: 'Moderate cold symptoms logged.', isActive: true },
  { symptomName: 'Cold', severity: 'Medium', durationMinDays: 3, riskLevel: 'Medium', recommendation: 'Moderate cold has lasted 3 days. Take decongestants and consult a GP if phlegm color changes.', explanation: 'Moderate cold persisting for 3 days.', isActive: true },
  { symptomName: 'Cold', severity: 'Medium', durationMinDays: 5, riskLevel: 'Medium', recommendation: 'Cold running for 5 days. Book a doctor checkup to prevent secondary infections.', explanation: 'Moderate cold persisting for 5 days.', isActive: true },
  { symptomName: 'Cold', severity: 'Medium', durationMinDays: 7, riskLevel: 'Medium', recommendation: 'Cold has persisted for a week. Schedule a physician consult to evaluate throat/lungs.', explanation: 'Moderate cold persisting for 7 days.', isActive: true },
  
  { symptomName: 'Cold', severity: 'High', durationMinDays: 0, riskLevel: 'Medium', recommendation: 'High severity cold logged. Rest strictly, use steam, and seek GP advice if fever is present.', explanation: 'Severe cold symptoms logged.', isActive: true },
  { symptomName: 'Cold', severity: 'High', durationMinDays: 3, riskLevel: 'High', recommendation: 'Severe cold running for 3 days. Consult a physician immediately to evaluate bronchial state.', explanation: 'Severe cold persisting for 3 days.', isActive: true },

  // ==========================================
  // 5. SORE THROAT RULES (8 Rules)
  // ==========================================
  { symptomName: 'Sore throat', severity: 'Low', durationMinDays: 0, riskLevel: 'Low', recommendation: 'Gargle with warm salt water. Drink warm fluids and rest your voice.', explanation: 'Mild sore throat recorded.', isActive: true },
  { symptomName: 'Sore throat', severity: 'Low', durationMinDays: 3, riskLevel: 'Low', recommendation: 'Sore throat has persisted for 3 days. Continue salt water gargles.', explanation: 'Mild sore throat persisting for 3 days.', isActive: true },
  { symptomName: 'Sore throat', severity: 'Low', durationMinDays: 5, riskLevel: 'Medium', recommendation: 'Sore throat lasting 5 days. Consult a GP to check for pharyngitis.', explanation: 'Mild sore throat persisting for 5 days.', isActive: true },
  
  { symptomName: 'Sore throat', severity: 'Medium', durationMinDays: 0, riskLevel: 'Low', recommendation: 'Moderate sore throat. Gargle with warm fluids, take throat lozenges, and rest.', explanation: 'Moderate sore throat recorded.', isActive: true },
  { symptomName: 'Sore throat', severity: 'Medium', durationMinDays: 2, riskLevel: 'Medium', recommendation: 'Sore throat has lasted 2 days. Consult a physician if swallowing becomes painful.', explanation: 'Moderate sore throat persisting for 2 days.', isActive: true },
  { symptomName: 'Sore throat', severity: 'Medium', durationMinDays: 4, riskLevel: 'Medium', recommendation: 'Moderate sore throat running for 4 days. Book a GP consult to check for tonsillitis.', explanation: 'Moderate sore throat persisting for 4 days.', isActive: true },
  
  { symptomName: 'Sore throat', severity: 'High', durationMinDays: 0, riskLevel: 'Medium', recommendation: 'Severe sore throat logged. Gargle, take rest, and monitor for difficulties breathing or swallowing.', explanation: 'Severe sore throat logged.', isActive: true },
  { symptomName: 'Sore throat', severity: 'High', durationMinDays: 2, riskLevel: 'High', recommendation: 'Severe sore throat for 2 days. Consult a physician immediately to rule out strep throat.', explanation: 'Severe sore throat persisting for 2 days.', isActive: true },

  // ==========================================
  // 6. STOMACH PAIN RULES (10 Rules)
  // ==========================================
  { symptomName: 'Stomach pain', severity: 'Low', durationMinDays: 0, riskLevel: 'Low', recommendation: 'Avoid heavy/spicy foods. Drink warm water or peppermint tea. Rest.', explanation: 'Mild abdominal discomfort logged.', isActive: true },
  { symptomName: 'Stomach pain', severity: 'Low', durationMinDays: 2, riskLevel: 'Low', recommendation: 'Mild stomach discomfort persisting for 2 days. Stick to a bland diet (BRAT).', explanation: 'Mild stomach pain persisting for 2 days.', isActive: true },
  { symptomName: 'Stomach pain', severity: 'Low', durationMinDays: 3, riskLevel: 'Medium', recommendation: 'Abdominal pain has persisted for 3 days. Consult a GP to check for gastroduodenal issues.', explanation: 'Mild stomach pain persisting for 3 days.', isActive: true },
  
  { symptomName: 'Stomach pain', severity: 'Medium', durationMinDays: 0, riskLevel: 'Low', recommendation: 'Moderate abdominal pain. Rest, stay hydrated, and avoid dairy/caffeine.', explanation: 'Moderate stomach pain logged.', isActive: true },
  { symptomName: 'Stomach pain', severity: 'Medium', durationMinDays: 1, riskLevel: 'Medium', recommendation: 'Moderate stomach pain has lasted 24 hours. Consult a doctor if accompanied by nausea.', explanation: 'Moderate stomach pain persisting for 1 day.', isActive: true },
  { symptomName: 'Stomach pain', severity: 'Medium', durationMinDays: 2, riskLevel: 'Medium', recommendation: 'Stomach pain running for 2 days. Book a GP appointment to check for gastritis or food poisoning.', explanation: 'Moderate stomach pain persisting for 2 days.', isActive: true },
  { symptomName: 'Stomach pain', severity: 'Medium', durationMinDays: 3, riskLevel: 'High', recommendation: 'Stomach pain persisting for 3 days. Consult a doctor immediately for diagnostic checks.', explanation: 'Moderate stomach pain persisting for 3 days.', isActive: true },
  
  { symptomName: 'Stomach pain', severity: 'High', durationMinDays: 0, riskLevel: 'Medium', recommendation: 'Severe stomach pain. Rest strictly. Seek GP consult if pain is sharp, localized, or constant.', explanation: 'Severe stomach pain logged.', isActive: true },
  { symptomName: 'Stomach pain', severity: 'High', durationMinDays: 1, riskLevel: 'High', recommendation: 'Severe stomach pain persisting for 24 hours. Seek immediate clinical assessment.', explanation: 'Severe stomach pain persisting for 1 day.', isActive: true },
  { symptomName: 'Stomach pain', severity: 'High', durationMinDays: 2, riskLevel: 'High', recommendation: 'Seek emergency care. Severe localized abdominal pain can indicate appendicitis or gallstones.', explanation: 'Severe stomach pain persisting for 2 or more days.', isActive: true },

  // ==========================================
  // 7. FATIGUE RULES (8 Rules)
  // ==========================================
  { symptomName: 'Fatigue', severity: 'Low', durationMinDays: 0, riskLevel: 'Low', recommendation: 'Ensure 7-8 hours of sleep. Stay hydrated and avoid screen time before bed.', explanation: 'Mild fatigue recorded.', isActive: true },
  { symptomName: 'Fatigue', severity: 'Low', durationMinDays: 3, riskLevel: 'Low', recommendation: 'Mild fatigue has lasted 3 days. Focus on balanced meals and gentle stretching.', explanation: 'Mild fatigue persisting for 3 days.', isActive: true },
  { symptomName: 'Fatigue', severity: 'Low', durationMinDays: 5, riskLevel: 'Medium', recommendation: 'Fatigue persisting for 5 days. Consult a GP to check for vitamin deficiencies.', explanation: 'Mild fatigue persisting for 5 days.', isActive: true },
  
  { symptomName: 'Fatigue', severity: 'Medium', durationMinDays: 0, riskLevel: 'Low', recommendation: 'Moderate fatigue. Rest, avoid caffeine crash, and track your sleep pattern.', explanation: 'Moderate fatigue recorded.', isActive: true },
  { symptomName: 'Fatigue', severity: 'Medium', durationMinDays: 3, riskLevel: 'Medium', recommendation: 'Moderate fatigue running for 3 days. Consult a GP if you experience brain fog.', explanation: 'Moderate fatigue persisting for 3 days.', isActive: true },
  { symptomName: 'Fatigue', severity: 'Medium', durationMinDays: 5, riskLevel: 'Medium', recommendation: 'Fatigue has persisted for 5 days. Book a doctor checkup to rule out anemia or thyroid imbalance.', explanation: 'Moderate fatigue persisting for 5 days.', isActive: true },
  
  { symptomName: 'Fatigue', severity: 'High', durationMinDays: 0, riskLevel: 'Medium', recommendation: 'High severity exhaustion logged. Rest strictly and schedule a physician appointment.', explanation: 'Severe exhaustion logged.', isActive: true },
  { symptomName: 'Fatigue', severity: 'High', durationMinDays: 3, riskLevel: 'High', recommendation: 'Severe fatigue for 3 days. Consult a physician immediately to evaluate systemic causes.', explanation: 'Severe exhaustion persisting for 3 or more days.', isActive: true },

  // ==========================================
  // 8. SKIN IRRITATION RULES (8 Rules)
  // ==========================================
  { symptomName: 'Skin irritation', severity: 'Low', durationMinDays: 0, riskLevel: 'Low', recommendation: 'Keep skin clean and dry. Apply mild aloe vera or calamine lotion.', explanation: 'Mild skin irritation/itching logged.', isActive: true },
  { symptomName: 'Skin irritation', severity: 'Low', durationMinDays: 3, riskLevel: 'Low', recommendation: 'Skin irritation has lasted 3 days. Avoid scratching or harsh soaps.', explanation: 'Mild skin irritation persisting for 3 days.', isActive: true },
  { symptomName: 'Skin irritation', severity: 'Low', durationMinDays: 5, riskLevel: 'Medium', recommendation: 'Skin irritation persisting for 5 days. Consult a doctor to check for contact dermatitis.', explanation: 'Mild skin irritation persisting for 5 days.', isActive: true },
  
  { symptomName: 'Skin irritation', severity: 'Medium', durationMinDays: 0, riskLevel: 'Low', recommendation: 'Moderate skin irritation. Apply a cold compress and keep the area ventilated.', explanation: 'Moderate skin irritation recorded.', isActive: true },
  { symptomName: 'Skin irritation', severity: 'Medium', durationMinDays: 2, riskLevel: 'Medium', recommendation: 'Irritation has lasted 2 days. Consult a physician if rash spreads or develops small blisters.', explanation: 'Moderate skin irritation persisting for 2 days.', isActive: true },
  { symptomName: 'Skin irritation', severity: 'Medium', durationMinDays: 5, riskLevel: 'Medium', recommendation: 'Rash running for 5 days. Book a GP consult for allergy assessment.', explanation: 'Moderate skin irritation persisting for 5 days.', isActive: true },
  
  { symptomName: 'Skin irritation', severity: 'High', durationMinDays: 0, riskLevel: 'Medium', recommendation: 'Severe skin rash or hives logged. Monitor for swelling or shortness of breath.', explanation: 'Severe skin rash logged.', isActive: true },
  { symptomName: 'Skin irritation', severity: 'High', durationMinDays: 2, riskLevel: 'High', recommendation: 'Severe skin hives/itching for 2 days. Consult a physician immediately to check for systemic reactions.', explanation: 'Severe skin rash persisting for 2 or more days.', isActive: true },

  // ==========================================
  // 9. BODY PAIN RULES (8 Rules)
  // ==========================================
  { symptomName: 'Body pain', severity: 'Low', durationMinDays: 0, riskLevel: 'Low', recommendation: 'Take a warm bath, perform gentle stretching, and rest.', explanation: 'Mild muscle/body aches recorded.', isActive: true },
  { symptomName: 'Body pain', severity: 'Low', durationMinDays: 3, riskLevel: 'Low', recommendation: 'Aches have lasted 3 days. Focus on rest and hydration.', explanation: 'Mild body pain persisting for 3 days.', isActive: true },
  { symptomName: 'Body pain', severity: 'Low', durationMinDays: 5, riskLevel: 'Medium', recommendation: 'Body pain persisting for 5 days. Consult a GP to evaluate musculoskeletal health.', explanation: 'Mild body pain persisting for 5 days.', isActive: true },
  
  { symptomName: 'Body pain', severity: 'Medium', durationMinDays: 0, riskLevel: 'Low', recommendation: 'Moderate body aches. Rest and consider a warm compress or mild OTC painkiller.', explanation: 'Moderate body pain recorded.', isActive: true },
  { symptomName: 'Body pain', severity: 'Medium', durationMinDays: 2, riskLevel: 'Medium', recommendation: 'Pain has lasted 2 days. Consult a physician if accompanied by joint stiffness.', explanation: 'Moderate body pain persisting for 2 days.', isActive: true },
  { symptomName: 'Body pain', severity: 'Medium', durationMinDays: 4, riskLevel: 'Medium', recommendation: 'Body pain running for 4 days. Book a doctor checkup to rule out viral infections.', explanation: 'Moderate body pain persisting for 4 days.', isActive: true },
  
  { symptomName: 'Body pain', severity: 'High', durationMinDays: 0, riskLevel: 'Medium', recommendation: 'Severe body pain logged. Rest strictly. Book a GP consult if accompanied by fever.', explanation: 'Severe body pain logged.', isActive: true },
  { symptomName: 'Body pain', severity: 'High', durationMinDays: 2, riskLevel: 'High', recommendation: 'Severe body pain for 2 days. Consult a doctor immediately to check for severe viral/rheumatic conditions.', explanation: 'Severe body pain persisting for 2 or more days.', isActive: true },

  // ==========================================
  // 10. DIZZINESS RULES (8 Rules)
  // ==========================================
  { symptomName: 'Dizziness', severity: 'Low', durationMinDays: 0, riskLevel: 'Low', recommendation: 'Sit down immediately. Drink water, consume a light snack, and rest.', explanation: 'Mild dizziness/lightheadedness logged.', isActive: true },
  { symptomName: 'Dizziness', severity: 'Low', durationMinDays: 2, riskLevel: 'Low', recommendation: 'Dizziness is mild but recurring. Avoid sudden head movements and keep hydrated.', explanation: 'Mild dizziness persisting for 2 days.', isActive: true },
  { symptomName: 'Dizziness', severity: 'Low', durationMinDays: 3, riskLevel: 'Medium', recommendation: 'Dizziness has lasted 3 days. Consult a GP to check for inner ear or blood pressure causes.', explanation: 'Mild dizziness persisting for 3 days.', isActive: true },
  
  { symptomName: 'Dizziness', severity: 'Medium', durationMinDays: 0, riskLevel: 'Low', recommendation: 'Moderate dizziness. Rest, stay seated, and avoid driving or operating machinery.', explanation: 'Moderate dizziness recorded.', isActive: true },
  { symptomName: 'Dizziness', severity: 'Medium', durationMinDays: 1, riskLevel: 'Medium', recommendation: 'Moderate dizziness has lasted 24 hours. Schedule a routine doctor checkup.', explanation: 'Moderate dizziness persisting for 1 day.', isActive: true },
  { symptomName: 'Dizziness', severity: 'Medium', durationMinDays: 3, riskLevel: 'Medium', recommendation: 'Dizziness running for 3 days. Book a GP consult for blood pressure evaluation.', explanation: 'Moderate dizziness persisting for 3 days.', isActive: true },
  
  { symptomName: 'Dizziness', severity: 'High', durationMinDays: 0, riskLevel: 'Medium', recommendation: 'Severe vertigo or dizziness logged. Lie down and seek physician checkup immediately.', explanation: 'Severe dizziness logged.', isActive: true },
  { symptomName: 'Dizziness', severity: 'High', durationMinDays: 2, riskLevel: 'High', recommendation: 'Seek urgent clinical assessment. Persistent severe vertigo requires neurological check.', explanation: 'Severe dizziness persisting for 2 or more days.', isActive: true },

  // ==========================================
  // 11. NAUSEA & VOMITING RULES (8 Rules)
  // ==========================================
  { symptomName: 'Nausea', severity: 'Low', durationMinDays: 0, riskLevel: 'Low', recommendation: 'Sip ginger tea or clear fluids. Sit upright and avoid strong odors.', explanation: 'Mild nausea recorded.', isActive: true },
  { symptomName: 'Nausea', severity: 'Low', durationMinDays: 2, riskLevel: 'Low', recommendation: 'Mild nausea persisting for 2 days. Stick to a bland liquid diet.', explanation: 'Mild nausea persisting for 2 days.', isActive: true },
  { symptomName: 'Nausea', severity: 'Low', durationMinDays: 3, riskLevel: 'Medium', recommendation: 'Nausea has lasted 3 days. Consult a GP to check for gastric distress.', explanation: 'Mild nausea persisting for 3 days.', isActive: true },
  
  { symptomName: 'Nausea', severity: 'Medium', durationMinDays: 0, riskLevel: 'Low', recommendation: 'Moderate nausea. Rest, drink electrolyte fluids slowly, and avoid solid food.', explanation: 'Moderate nausea recorded.', isActive: true },
  { symptomName: 'Nausea', severity: 'Medium', durationMinDays: 2, riskLevel: 'Medium', recommendation: 'Nausea running for 2 days. Consult a GP if you experience mild vomiting.', explanation: 'Moderate nausea persisting for 2 days.', isActive: true },
  { symptomName: 'Nausea', severity: 'Medium', durationMinDays: 3, riskLevel: 'High', recommendation: 'Nausea and vomiting persisting for 3 days. Seek immediate GP consultation to avoid severe dehydration.', explanation: 'Moderate nausea persisting for 3 days.', isActive: true },
  
  { symptomName: 'Nausea', severity: 'High', durationMinDays: 0, riskLevel: 'Medium', recommendation: 'Severe nausea or vomiting logged. Seek GP consult if unable to keep liquids down.', explanation: 'Severe nausea logged.', isActive: true },
  { symptomName: 'Nausea', severity: 'High', durationMinDays: 1, riskLevel: 'High', recommendation: 'Severe vomiting for 24 hours. Consult a doctor immediately to prevent dehydration.', explanation: 'Severe nausea/vomiting persisting for 1 or more days.', isActive: true },

  // ==========================================
  // 12. DIARRHEA RULES (8 Rules)
  // ==========================================
  { symptomName: 'Diarrhea', severity: 'Low', durationMinDays: 0, riskLevel: 'Low', recommendation: 'Drink ORS or electrolyte solutions. Consume bananas, rice, or applesauce.', explanation: 'Mild diarrhea recorded.', isActive: true },
  { symptomName: 'Diarrhea', severity: 'Low', durationMinDays: 2, riskLevel: 'Low', recommendation: 'Diarrhea has lasted 2 days. Continue fluid replacement and bland food.', explanation: 'Mild diarrhea persisting for 2 days.', isActive: true },
  { symptomName: 'Diarrhea', severity: 'Low', durationMinDays: 3, riskLevel: 'Medium', recommendation: 'Diarrhea has persisted for 3 days. Consult a GP to check for intestinal infection.', explanation: 'Mild diarrhea persisting for 3 days.', isActive: true },
  
  { symptomName: 'Diarrhea', severity: 'Medium', durationMinDays: 0, riskLevel: 'Low', recommendation: 'Moderate diarrhea. Drink plenty of electrolyte fluids (ORS) and rest.', explanation: 'Moderate diarrhea recorded.', isActive: true },
  { symptomName: 'Diarrhea', severity: 'Medium', durationMinDays: 2, riskLevel: 'Medium', recommendation: 'Diarrhea running for 2 days. Book a GP checkup if accompanied by mild cramps.', explanation: 'Moderate diarrhea persisting for 2 days.', isActive: true },
  { symptomName: 'Diarrhea', severity: 'Medium', durationMinDays: 3, riskLevel: 'High', recommendation: 'Diarrhea persisting for 3 days. Consult a doctor immediately to prevent electrolyte collapse.', explanation: 'Moderate diarrhea persisting for 3 days.', isActive: true },
  
  { symptomName: 'Diarrhea', severity: 'High', durationMinDays: 0, riskLevel: 'Medium', recommendation: 'Severe diarrhea. Drink ORS, rest, and schedule a physician visit today.', explanation: 'Severe diarrhea logged.', isActive: true },
  { symptomName: 'Diarrhea', severity: 'High', durationMinDays: 2, riskLevel: 'High', recommendation: 'Seek urgent hospital care. Prolonged severe diarrhea requires IV rehydration.', explanation: 'Severe diarrhea persisting for 2 or more days.', isActive: true },

  // ==========================================
  // 13. CRITICAL / URGENT RULES (8 Rules)
  // ==========================================
  { symptomName: 'Shortness of breath', severity: 'Low', durationMinDays: 0, riskLevel: 'Medium', recommendation: 'Rest sitting upright. Avoid exertion. Book a physician visit if it does not clear.', explanation: 'Mild breathing difficulty recorded.', isActive: true },
  { symptomName: 'Shortness of breath', severity: 'Medium', durationMinDays: 0, riskLevel: 'High', recommendation: 'Consult a physician immediately. Avoid physical activity and use inhaler if prescribed.', explanation: 'Moderate breathing difficulty logged.', isActive: true },
  { symptomName: 'Shortness of breath', severity: 'High', durationMinDays: 0, riskLevel: 'High', recommendation: 'Seek emergency medical attention. Severe shortness of breath requires immediate oxygen therapy.', explanation: 'Severe breathing difficulty logged (urgent trigger).', isActive: true },
  
  { symptomName: 'Chest pain', severity: 'Low', durationMinDays: 0, riskLevel: 'Medium', recommendation: 'Rest quietly, stay calm, and monitor. Consult a physician if pain spreads or tightens.', explanation: 'Mild chest discomfort logged.', isActive: true },
  { symptomName: 'Chest pain', severity: 'Medium', durationMinDays: 0, riskLevel: 'High', recommendation: 'Seek prompt physician checkup. Localized chest pain warrants diagnostic electrocardiogram (ECG).', explanation: 'Moderate chest pain logged.', isActive: true },
  { symptomName: 'Chest pain', severity: 'High', durationMinDays: 0, riskLevel: 'High', recommendation: 'Call emergency services immediately. Severe chest pain/tightness is a potential cardiac emergency.', explanation: 'Severe chest pain logged (urgent emergency trigger).', isActive: true },

  // ==========================================
  // 14. GENERAL WILDCARD RULES (2 Rules)
  // ==========================================
  { symptomName: '*', severity: '*', durationMinDays: 5, riskLevel: 'Medium', recommendation: 'Your symptoms have persisted for 5 days. We recommend consulting a healthcare provider to review your condition.', explanation: 'Any active symptoms exceeding 5 days.', isActive: true },
  { symptomName: '*', severity: '*', durationMinDays: 7, riskLevel: 'High', recommendation: 'Your symptoms have persisted for a week. Please visit a clinical care clinic or schedule an immediate GP consultation for professional diagnostic evaluation.', explanation: 'Active symptoms persisting for 7 or more days (exceeding 1 week) require immediate clinical attention.', isActive: true },

  // ==========================================
  // 15. ADVANCED CLINICAL RULES (Symptom Bundles, Comorbidities, Demographics, Labs)
  // ==========================================
  { symptomName: 'Fever + Stiff Neck', severity: 'High', durationMinDays: 0, riskLevel: 'High', recommendation: 'Seek emergency care immediately. Potential meningitis warning signs.', explanation: 'Cross-symptom bundle: Fever combined with nuchal rigidity indicating potential meningeal inflammation.', isActive: true },
  { symptomName: 'Chest Pain + Dyspnea', severity: 'High', durationMinDays: 0, riskLevel: 'High', recommendation: 'Call emergency services immediately. Potential acute coronary event or pulmonary embolism.', explanation: 'Cross-symptom bundle: Angina paired with acute breathing distress indicating cardiovascular emergency.', isActive: true },
  { symptomName: 'Abdominal Pain + Rigid Abdomen', severity: 'High', durationMinDays: 0, riskLevel: 'High', recommendation: 'Seek emergency surgical triage immediately. Potential acute abdomen or perforation.', explanation: 'Cross-symptom bundle: Moderate-to-severe abdominal pain with peritoneal signs suggesting guarding or rupture.', isActive: true },
  { symptomName: 'Headache + Vision Loss', severity: 'High', durationMinDays: 0, riskLevel: 'High', recommendation: 'Consult an ophthalmologist or visit emergency room immediately. Potential acute angle-closure glaucoma or giant cell vasculitis.', explanation: 'Cross-symptom bundle: Cephalgia paired with sudden visual acuity drop signaling ocular or vasculitic emergency.', isActive: true },
  { symptomName: 'Sore Throat + Drooling', severity: 'High', durationMinDays: 0, riskLevel: 'High', recommendation: 'Seek emergency care immediately. Potential epiglottitis or severe upper airway obstruction.', explanation: 'Cross-symptom bundle: Pharyngeal inflammation with dysphagia and inability to clear oral secretions.', isActive: true },

  { symptomName: 'Fever (Diabetic Patient)', severity: 'Medium', durationMinDays: 0, riskLevel: 'Medium', recommendation: 'Schedule a physician clinic visit today. Diabetes impairs immune response and increases risk of rapid infection progression.', explanation: 'Comorbidity risk: Body temperature elevation in a patient with diagnosed Diabetes Mellitus.', isActive: true },
  { symptomName: 'Shortness of Breath (Asthma/COPD)', severity: 'High', durationMinDays: 0, riskLevel: 'High', recommendation: 'Administer rescue inhaler doses. Seek emergency care immediately if peak flow does not improve within 15 minutes.', explanation: 'Comorbidity risk: Acute bronchospasm flare-up in patients with chronic obstructive airway history.', isActive: true },
  { symptomName: 'Fever (Immunocompromised)', severity: 'High', durationMinDays: 0, riskLevel: 'High', recommendation: 'Seek immediate emergency room triage. Potential neutropenic sepsis risk requiring IV antibiotic protocol.', explanation: 'Comorbidity risk: Pyrexia in an oncology, post-transplant, or immunosuppressed patient.', isActive: true },
  { symptomName: 'Skin Irritation (Eczema History)', severity: 'Low', durationMinDays: 0, riskLevel: 'Low', recommendation: 'Apply prescribed emollient barrier creams and avoid potential contact allergens. Monitor for secondary bacterial crusting.', explanation: 'Comorbidity risk: Flare of atopic dermatitis without signs of systemic or secondary infection.', isActive: true },
  { symptomName: 'Fatigue (Heart Failure History)', severity: 'Medium', durationMinDays: 0, riskLevel: 'Medium', recommendation: 'Monitor daily weight changes. Consult your cardiologist to rule out fluid overload or worsening cardiac output.', explanation: 'Comorbidity risk: Systemic lethargy in a patient with chronic congestive heart failure.', isActive: true },

  { symptomName: 'Fever in Infants < 3 Months', severity: 'High', durationMinDays: 0, riskLevel: 'High', recommendation: 'Seek emergency pediatric evaluation immediately. Neonatal fever requires diagnostic blood/urine culture septic workup.', explanation: 'Demographic risk: Rectal temperature >100.4 F in a neonate under 90 days old.', isActive: true },
  { symptomName: 'Dizziness in Geriatric 65+', severity: 'Medium', durationMinDays: 0, riskLevel: 'Medium', recommendation: 'Avoid sudden posture shifts to prevent falls. Schedule a clinic visit for orthostatic blood pressure check.', explanation: 'Demographic risk: Vestibular disturbance in elderly patients raising orthopedic fracture or syncopal concerns.', isActive: true },
  { symptomName: 'Sore Throat in Children (3-15y)', severity: 'Medium', durationMinDays: 0, riskLevel: 'Medium', recommendation: 'Schedule a clinic visit for a rapid throat swab to screen for Group A Streptococcus pharyngitis.', explanation: 'Demographic risk: Pediatric pharyngitis with risk of developing post-streptococcal sequelae (rheumatic fever).', isActive: true },
  { symptomName: 'Headache in Pregnancy', severity: 'Medium', durationMinDays: 0, riskLevel: 'Medium', recommendation: 'Consult your obstetrician promptly. Measure blood pressure immediately to screen for preeclampsia indicators.', explanation: 'Demographic risk: New-onset gestational cephalgia requiring arterial pressure and proteinuria diagnostic checks.', isActive: true },

  { symptomName: 'Fatigue + Extreme Pallor', severity: 'Medium', durationMinDays: 0, riskLevel: 'Medium', recommendation: 'Book a general physician visit. Request a Complete Blood Count (CBC) and serum ferritin screen to evaluate for severe anemia.', explanation: 'Lab watch: Persistent fatigue accompanied by clinical pallor indicating low red blood cell count.', isActive: true },
  { symptomName: 'Diarrhea + Severe Dehydration', severity: 'High', durationMinDays: 0, riskLevel: 'High', recommendation: 'Seek immediate clinical care. Request serum electrolytes panel, renal function tests, and start intravenous fluid rehydration.', explanation: 'Lab watch: Gastrointestinal losses with hypovolemic signs (poor turgor, dry mucous membranes, oliguria).', isActive: true },
  { symptomName: 'Cough + Rusty Sputum', severity: 'High', durationMinDays: 0, riskLevel: 'High', recommendation: 'Consult your doctor today. Request chest radiography (X-ray) and sputum culture to rule out lobar pneumococcal pneumonia.', explanation: 'Lab watch: Productive cough with purulent, rusty-colored secretions indicating lower respiratory tract infection.', isActive: true },
  { symptomName: 'Sore Throat + Sandpaper Rash', severity: 'Medium', durationMinDays: 0, riskLevel: 'Medium', recommendation: 'Schedule a GP clinic evaluation today. Screen for scarlet fever (Streptococcus pyogenes) and request oral antibiotic therapy.', explanation: 'Lab watch: Pharyngitis presenting with characteristic sandpaper-texture exanthem.', isActive: true }
];

const seedRules = async () => {
  try {
    await initDatabase();
    await sequelize.authenticate();
    console.log('Database connected successfully for seeding.');
    
    // Sync table
    await TriageRule.sync({ force: false });
    
    // Truncate and replace with the fresh 100+ rules list
    console.log('Clearing existing triage results and rules...');
    await TriageResult.destroy({ where: {} });
    await TriageRule.destroy({ where: {} });

    console.log('Seeding 100+ default triage rules...');
    await TriageRule.bulkCreate(rules);
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database rules:', error);
    process.exit(1);
  }
};

seedRules();
