import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, ToggleLeft, ToggleRight, Trash2, X, ShieldAlert } from 'lucide-react';

const RulesEditor = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

  const filteredRules = rules.filter(r => 
    r.symptomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.recommendation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.explanation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayRules = showAll ? filteredRules : filteredRules.slice(0, 10);
  
  // Modal for adding a rule
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [symptomName, setSymptomName] = useState('Fever');
  const [customSymptom, setCustomSymptom] = useState('');
  const [severity, setSeverity] = useState('High');
  const [durationMinDays, setDurationMinDays] = useState(3);
  const [riskLevel, setRiskLevel] = useState('Medium');
  const [recommendation, setRecommendation] = useState('');
  const [explanation, setExplanation] = useState('');

  const fetchRules = async () => {
    try {
      const res = await axios.get('/api/dashboard/rules');
      setRules(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch triage rules.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggle = async (id) => {
    try {
      await axios.put(`/api/dashboard/rules/${id}/toggle`);
      setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
    } catch (err) {
      alert('Failed to toggle rule state.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this triage rule?')) return;
    try {
      await axios.delete(`/api/dashboard/rules/${id}`);
      setRules(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert('Failed to delete rule.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalSymptomName = symptomName === 'Other' ? customSymptom : symptomName;
    if (!finalSymptomName) return;

    try {
      const res = await axios.post('/api/dashboard/rules', {
        symptomName: finalSymptomName,
        severity,
        durationMinDays,
        riskLevel,
        recommendation,
        explanation
      });
      setRules(prev => [...prev, res.data]);
      setShowModal(false);
      // Reset form
      setSymptomName('Fever');
      setCustomSymptom('');
      setSeverity('High');
      setDurationMinDays(3);
      setRiskLevel('Medium');
      setRecommendation('');
      setExplanation('');
    } catch (err) {
      alert('Failed to create triage rule.');
    }
  };

  if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading rules configuration...</div>;
  if (error) return <div style={{ color: 'var(--color-risk-high)' }}>{error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Admin Panel Descriptor Alert */}
      <div className="glass-panel" style={{
        borderLeft: '4px solid var(--color-primary)',
        backgroundColor: 'rgba(13, 148, 136, 0.04)',
        padding: '16px 20px',
        fontSize: '13px',
        lineHeight: '1.5'
      }}>
        <strong style={{ color: 'var(--color-primary-light)' }}>🔐 Developer Admin Panel:</strong> This section simulates the healthcare administrator console. Adding, toggling, or deleting rules here directly modifies the guidelines stored in the PostgreSQL database, dynamically changing the risk evaluations and GP recommendations for all patient logs in real-time.
      </div>

      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', flex: 1 }}>
          Manage diagnostic triage rules directly in the database. Active rules guide automated patient risk assessments.
        </p>
        <input 
          type="text" 
          placeholder="Search rules..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
          style={{ width: '220px', padding: '10px 14px', background: 'rgba(0,0,0,0.2)', margin: 0 }}
        />
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} />
          <span>Add Triage Rule</span>
        </button>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
              <th style={{ padding: '15px 20px', textAlign: 'left', fontWeight: '700', color: 'var(--text-muted)' }}>Symptom</th>
              <th style={{ padding: '15px 20px', textAlign: 'left', fontWeight: '700', color: 'var(--text-muted)' }}>Severity</th>
              <th style={{ padding: '15px 20px', textAlign: 'left', fontWeight: '700', color: 'var(--text-muted)' }}>Min Duration</th>
              <th style={{ padding: '15px 20px', textAlign: 'left', fontWeight: '700', color: 'var(--text-muted)' }}>Risk Output</th>
              <th style={{ padding: '15px 20px', textAlign: 'left', fontWeight: '700', color: 'var(--text-muted)' }}>Recommendation</th>
              <th style={{ padding: '15px 20px', textAlign: 'center', fontWeight: '700', color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '15px 20px', textAlign: 'center', fontWeight: '700', color: 'var(--text-muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayRules.map(rule => (
              <tr key={rule.id} style={{ borderBottom: '1px solid var(--border-color)', opacity: rule.isActive ? 1 : 0.6 }}>
                <td style={{ padding: '15px 20px', fontWeight: '700' }}>
                  {rule.symptomName === '*' ? 'Any Symptom (*)' : rule.symptomName}
                </td>
                <td style={{ padding: '15px 20px' }}>
                  {rule.severity === '*' ? 'Any Severity (*)' : rule.severity}
                </td>
                <td style={{ padding: '15px 20px' }}>
                  {rule.durationMinDays} day(s)
                </td>
                <td style={{ padding: '15px 20px' }}>
                  <span className={`risk-badge risk-${rule.riskLevel.toLowerCase()}`} style={{ fontSize: '10px', padding: '3px 8px' }}>
                    {rule.riskLevel}
                  </span>
                </td>
                <td style={{ padding: '15px 20px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {rule.recommendation}
                </td>
                <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                  <button 
                    onClick={() => handleToggle(rule.id)}
                    style={{ background: 'transparent', border: 'none', color: rule.isActive ? 'var(--color-accent)' : 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {rule.isActive ? <ToggleRight size={28} style={{ color: 'var(--color-accent)' }} /> : <ToggleLeft size={28} />}
                  </button>
                </td>
                <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                  <button 
                    onClick={() => handleDelete(rule.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    className="hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRules.length > 10 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }} className="no-print">
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
            Showing {displayRules.length} of {filteredRules.length} rules
          </span>
          <button 
            onClick={() => setShowAll(!showAll)} 
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '12px' }}
          >
            {showAll ? 'Show Less (10 Rules)' : `Show All ${filteredRules.length} Rules`}
          </button>
        </div>
      )}

      {/* Add Rule Modal Overlay */}
      {showModal && (
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
            maxWidth: '520px',
            backgroundColor: 'var(--bg-main)',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button onClick={() => setShowModal(false)} style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}><X size={20} /></button>

            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} style={{ color: 'var(--color-primary-light)' }} />
              <span>Create New Triage Rule</span>
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Symptom Trigger</label>
                  <select 
                    value={symptomName}
                    onChange={(e) => setSymptomName(e.target.value)}
                    required
                    className="input-field"
                    style={{ background: 'rgba(0,0,0,0.2)' }}
                  >
                    <option value="Fever">Fever</option>
                    <option value="Headache">Headache</option>
                    <option value="Cough">Cough</option>
                    <option value="Sore throat">Sore throat</option>
                    <option value="Cold">Cold</option>
                    <option value="Stomach pain">Stomach pain</option>
                    <option value="*">Wildcard (*)</option>
                    <option value="Other">Other Custom</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Severity Trigger</label>
                  <select 
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    required
                    className="input-field"
                    style={{ background: 'rgba(0,0,0,0.2)' }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="*">Wildcard (*)</option>
                  </select>
                </div>
              </div>

              {symptomName === 'Other' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Custom Symptom Name</label>
                  <input 
                    type="text" 
                    value={customSymptom}
                    onChange={(e) => setCustomSymptom(e.target.value)}
                    required
                    className="input-field"
                    placeholder="e.g. Back Pain"
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Min Duration (Days)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={durationMinDays}
                    onChange={(e) => setDurationMinDays(parseInt(e.target.value))}
                    required
                    className="input-field"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Risk Result Level</label>
                  <select 
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value)}
                    required
                    className="input-field"
                    style={{ background: 'rgba(0,0,0,0.2)' }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recommendation Text</label>
                <textarea 
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  required
                  className="input-field"
                  placeholder="e.g. Visit a General Physician immediately."
                  rows="2"
                  style={{ resize: 'none' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Explainable Reasoning Template</label>
                <textarea 
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  required
                  className="input-field"
                  placeholder="e.g. High severity fever recorded persisting for 3+ days."
                  rows="2"
                  style={{ resize: 'none' }}
                ></textarea>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                Save Triage Rule
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default RulesEditor;
