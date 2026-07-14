import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Activity, 
  Plus, 
  X, 
  CheckCircle, 
  Pills, 
  Trash2,
  AlertTriangle,
  Info
} from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [symptomModal, setSymptomModal] = useState(false);
  const [medicineModal, setMedicineModal] = useState(false);

  // Form states
  const [symptomName, setSymptomName] = useState('');
  const [customSymptom, setCustomSymptom] = useState('');
  const [severity, setSeverity] = useState('Low');
  const [notes, setNotes] = useState('');
  const [generalFeeling, setGeneralFeeling] = useState(3);
  const [loggedAt, setLoggedAt] = useState(new Date().toISOString().split('T')[0]);

  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medNotes, setMedNotes] = useState('');
  const [medTimeTaken, setMedTimeTaken] = useState(new Date().toISOString().slice(0, 16));

  const commonSymptoms = [
    'Fever', 'Headache', 'Body pain', 'Cold', 'Cough', 
    'Sore throat', 'Fatigue', 'Skin irritation', 'Stomach pain'
  ];

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('/api/dashboard/status');
      setData(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch dashboard data. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogSymptom = async (e) => {
    e.preventDefault();
    const finalSymptomName = symptomName === 'Other' ? customSymptom : symptomName;
    if (!finalSymptomName) return;

    try {
      await axios.post('/api/symptoms/logs', {
        symptomName: finalSymptomName,
        severity,
        notes,
        generalFeeling,
        loggedAt
      });
      // Reset form
      setSymptomName('');
      setCustomSymptom('');
      setSeverity('Low');
      setNotes('');
      setGeneralFeeling(3);
      setSymptomModal(false);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to record symptom log.');
    }
  };

  const handleLogMedicine = async (e) => {
    e.preventDefault();
    if (!medName) return;

    try {
      await axios.post('/api/medicines', {
        name: medName,
        dosage: medDosage,
        timeTaken: medTimeTaken,
        notes: medNotes
      });
      setMedName('');
      setMedDosage('');
      setMedNotes('');
      setMedicineModal(false);
      fetchDashboardData();
    } catch (err) {
      alert('Failed to record medicine log.');
    }
  };

  const handleResolveEpisode = async (id) => {
    if (!window.confirm('Mark this symptom track as resolved/ended?')) return;
    try {
      await axios.put(`/api/symptoms/episodes/${id}/resolve`);
      fetchDashboardData();
    } catch (err) {
      alert('Failed to resolve symptom track.');
    }
  };

  const handleDeleteMedicine = async (id) => {
    if (!window.confirm('Delete this medicine entry?')) return;
    try {
      await axios.delete(`/api/medicines/${id}`);
      fetchDashboardData();
    } catch (err) {
      alert('Failed to delete medicine entry.');
    }
  };

  if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading dashboard telemetry...</div>;
  if (error) return <div style={{ color: 'var(--color-risk-high)' }}>{error}</div>;

  const { activeEpisodes, latestLogs, recentMedicines, currentRiskLevel } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Top Section - Risk Assessment Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        
        {/* Risk Level Banner */}
        <div className="glass-panel" style={{
          borderLeft: `6px solid ${
            currentRiskLevel === 'High' ? 'var(--color-risk-high)' : 
            currentRiskLevel === 'Medium' ? 'var(--color-risk-medium)' : 
            'var(--color-risk-low)'
          }`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Overall Condition Assessment</h3>
              <span className={`risk-badge risk-${currentRiskLevel.toLowerCase()}`}>
                {currentRiskLevel} Risk
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {currentRiskLevel === 'High' && 'Immediate medical attention is recommended. High risk symptoms have been logged. Please review recommendations and contact emergency service or your primary care provider.'}
              {currentRiskLevel === 'Medium' && 'Consultation with a general physician is recommended. Active symptoms have persisted or carry moderate severity.'}
              {currentRiskLevel === 'Low' && 'Your symptoms are currently classified as low risk. Continue general self-monitoring, stay hydrated, and rest.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => setSymptomModal(true)} className="btn-primary">
              <Plus size={16} />
              <span>Log Symptom</span>
            </button>
            <button onClick={() => setMedicineModal(true)} className="btn-secondary">
              <Plus size={16} />
              <span>Record Medicine</span>
            </button>
          </div>
        </div>

        {/* Quick Summary Counts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="glass-panel" style={{ flex: 1, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'rgba(20, 184, 166, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary-light)'
            }}><Activity size={20} /></div>
            <div>
              <h4 style={{ fontSize: '20px', fontWeight: '800' }}>{activeEpisodes.length}</h4>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>ACTIVE SYMPTOM TRACKS</p>
            </div>
          </div>

          <div className="glass-panel" style={{ flex: 1, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-accent)'
            }}><Pills size={20} /></div>
            <div>
              <h4 style={{ fontSize: '20px', fontWeight: '800' }}>{recentMedicines.length}</h4>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>MEDICINES LOGGED</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Symptom Episodes Tracks */}
      <div className="glass-panel">
        <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px' }}>Active Symptom Tracks</h3>
        {activeEpisodes.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No active symptoms currently being tracked. Log a symptom to start tracking.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {activeEpisodes.map(ep => {
              const daysTracked = ep.logs.length;
              const latestLog = ep.logs[ep.logs.length - 1];
              return (
                <div key={ep.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border-color)', gap: '15px' }}>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>{ep.symptomName}</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      Started on {new Date(ep.startDate).toLocaleDateString()} ({daysTracked} logs)
                    </p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span className="risk-badge" style={{
                        fontSize: '10px', 
                        padding: '4px 8px',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)'
                      }}>
                        Last Severity: {latestLog?.severity || 'Low'}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => handleResolveEpisode(ep.id)} className="btn-secondary" style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '8px',
                    fontSize: '12px',
                    color: 'var(--color-accent)',
                    borderColor: 'var(--color-risk-low-border)'
                  }}>
                    <CheckCircle size={14} />
                    <span>Mark Resolved</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Logs & Medicines Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '30px' }}>
        
        {/* Recent logs with Triage explaining why */}
        <div className="glass-panel">
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px' }}>Recent Symptom Logs & Explanations</h3>
          {latestLogs.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No symptom logs recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {latestLogs.map(log => (
                <div key={log.id} style={{
                  padding: '20px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  backgroundColor: 'rgba(255,255,255,0.01)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: '700' }}>{log.symptomName}</h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Logged on {new Date(log.loggedAt).toLocaleString()} | Day {log.durationDays}
                      </p>
                    </div>
                    <span className={`risk-badge risk-${log.triageResult?.riskLevel?.toLowerCase() || 'low'}`}>
                      {log.triageResult?.riskLevel || 'Low'} Risk
                    </span>
                  </div>

                  {log.notes && (
                    <p style={{ fontSize: '13px', color: 'var(--text-main)', borderLeft: '3px solid var(--border-color)', paddingLeft: '10px', margin: '4px 0' }}>
                      "{log.notes}"
                    </p>
                  )}

                  {/* Decision Explanation Block */}
                  {log.triageResult && (
                    <div style={{
                      padding: '12px 16px',
                      backgroundColor: 'rgba(0,0,0,0.15)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      fontSize: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', fontSize: '10px' }}>
                        <Info size={12} />
                        <span>Explainable Triage Recommendation</span>
                      </div>
                      <p style={{ color: 'var(--text-main)', fontWeight: '600', marginBottom: '4px' }}>
                        👉 {log.triageResult.recommendation}
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '11px', lineHeight: '1.4' }}>
                        *Reasoning:* {log.triageResult.explanation} (Matched Rule #{log.triageResult.ruleId || 'Default'})
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Medicines Administered logs */}
        <div className="glass-panel">
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px' }}>Medicine Log History</h3>
          {recentMedicines.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No medicine logs recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {recentMedicines.map(med => (
                <div key={med.id} style={{
                  padding: '16px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.01)'
                }}>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700' }}>{med.name}</h4>
                      {med.dosage && (
                        <span style={{ fontSize: '11px', color: 'var(--color-primary-light)', padding: '2px 6px', backgroundColor: 'var(--color-primary-glow)', borderRadius: '4px', fontWeight: '600' }}>
                          {med.dosage}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Taken: {new Date(med.timeTaken).toLocaleString()}
                    </p>
                    {med.notes && (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                        "{med.notes}"
                      </p>
                    )}
                  </div>
                  <button onClick={() => handleDeleteMedicine(med.id)} style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '8px'
                  }} className="hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      
      {/* 1. Log Symptom Modal Overlay */}
      {symptomModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '500px',
            backgroundColor: 'var(--bg-main)',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button onClick={() => setSymptomModal(false)} style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}><X size={20} /></button>

            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} />
              <span>Log Daily Symptom</span>
            </h3>

            <form onSubmit={handleLogSymptom} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Symptom</label>
                <select 
                  value={symptomName}
                  onChange={(e) => setSymptomName(e.target.value)}
                  required
                  className="input-field"
                  style={{ background: 'rgba(0, 0, 0, 0.2)' }}
                >
                  <option value="" disabled>-- Select Symptom --</option>
                  {commonSymptoms.map(sym => (
                    <option key={sym} value={sym} style={{ background: 'var(--bg-main)' }}>{sym}</option>
                  ))}
                  <option value="Other" style={{ background: 'var(--bg-main)' }}>Other / Not Listed</option>
                </select>
              </div>

              {symptomName === 'Other' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Custom Symptom Name</label>
                  <input 
                    type="text" 
                    value={customSymptom}
                    onChange={(e) => setCustomSymptom(e.target.value)}
                    required
                    className="input-field"
                    placeholder="e.g. Ear Pain"
                  />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Severity</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  {['Low', 'Medium', 'High'].map(level => (
                    <button 
                      key={level} 
                      type="button"
                      onClick={() => setSeverity(level)}
                      style={{
                        padding: '10px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        background: severity === level ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' : 'transparent',
                        color: severity === level ? 'var(--text-inverse)' : 'var(--text-main)',
                        fontWeight: '700',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>General Feeling ({generalFeeling}/5)</label>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={generalFeeling}
                  onChange={(e) => setGeneralFeeling(parseInt(e.target.value))}
                  style={{ accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                  <span>1 - Terrible</span>
                  <span>3 - Okay</span>
                  <span>5 - Excellent</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Log Date</label>
                <input 
                  type="date" 
                  value={loggedAt}
                  onChange={(e) => setLoggedAt(e.target.value)}
                  required
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Notes / Observations</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Pain mostly in the evening, feel slightly dizzy"
                  rows="3"
                  style={{ resize: 'none' }}
                ></textarea>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                Save Log & Evaluate Risk
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Log Medicine Modal Overlay */}
      {medicineModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '500px',
            backgroundColor: 'var(--bg-main)',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button onClick={() => setMedicineModal(false)} style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}><X size={20} /></button>

            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Pills size={18} style={{ color: 'var(--color-accent)' }} />
              <span>Record Self-Medicated Dose</span>
            </h3>

            <div className="glass-panel" style={{
              padding: '12px',
              fontSize: '11px',
              border: '1px dashed var(--color-risk-medium-border)',
              backgroundColor: 'var(--color-risk-medium-bg)',
              color: 'var(--text-muted)',
              marginBottom: '20px',
              lineHeight: '1.4'
            }}>
              <AlertTriangle size={14} style={{ color: 'var(--color-risk-medium)', marginRight: '4px', verticalAlign: 'middle' }} />
              Aegis Health does **not** prescribe or recommend dosages. Record only medications you have already taken to compile an accurate log for your physician.
            </div>

            <form onSubmit={handleLogMedicine} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Medicine Name</label>
                <input 
                  type="text" 
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  required
                  className="input-field"
                  placeholder="e.g. Paracetamol"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dosage (Optional)</label>
                <input 
                  type="text" 
                  value={medDosage}
                  onChange={(e) => setMedDosage(e.target.value)}
                  className="input-field"
                  placeholder="e.g. 500mg, 1 Tablet"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Time Taken</label>
                <input 
                  type="datetime-local" 
                  value={medTimeTaken}
                  onChange={(e) => setMedTimeTaken(e.target.value)}
                  required
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Observations / Notes</label>
                <textarea 
                  value={medNotes}
                  onChange={(e) => setMedNotes(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Headache reduced after 1 hour, felt sweaty"
                  rows="3"
                  style={{ resize: 'none' }}
                ></textarea>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                Save Medication Entry
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
