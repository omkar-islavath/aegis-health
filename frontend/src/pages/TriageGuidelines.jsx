import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Search, AlertCircle, Info, ChevronRight, Stethoscope } from 'lucide-react';

const TriageGuidelines = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

  const fetchRules = async () => {
    try {
      const res = await axios.get('/api/dashboard/rules');
      // Only expose active rules to regular patients
      const activeRules = res.data.filter(rule => rule.isActive);
      setRules(activeRules);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch clinical guidelines.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const filteredRules = rules.filter(rule => {
    const term = searchTerm.toLowerCase();
    return (
      rule.symptomName.toLowerCase().includes(term) ||
      rule.recommendation.toLowerCase().includes(term) ||
      rule.explanation.toLowerCase().includes(term)
    );
  });

  const displayRules = showAll ? filteredRules : filteredRules.slice(0, 12);

  if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading clinical guidelines...</div>;
  if (error) return <div style={{ color: 'var(--color-risk-high)' }}>{error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Educational Disclaimer Banner */}
      <div className="glass-panel" style={{
        borderLeft: '4px solid var(--color-primary)',
        backgroundColor: 'rgba(13, 148, 136, 0.04)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <AlertCircle size={20} style={{ color: 'var(--color-primary-light)', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--color-primary-light)' }}>🛡️ Medical Education & System Transparency Directory:</strong>
          <span style={{ marginLeft: '6px' }}>
            The following guidelines show the active medical rules used by Aegis Health to calculate triage risk levels and recommend doctor appointments. They are compiled for patient education and transparency. In case of acute or life-threatening symptoms, immediately contact emergency services.
          </span>
        </div>
      </div>

      {/* Header & Search Bar Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }} className="grid-responsive">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen style={{ color: 'var(--color-primary)' }} />
            <span>Triage Guidelines Library</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Browse and search active clinical rules powering the decision engine.
          </p>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '350px' }}>
          <input 
            type="text" 
            placeholder="Search symptoms, guidelines..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ 
              width: '100%', 
              padding: '10px 14px 10px 40px', 
              background: 'rgba(0,0,0,0.2)',
              margin: 0
            }}
          />
          <Search size={18} style={{ 
            position: 'absolute', 
            left: '14px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: 'var(--text-muted)' 
          }} />
        </div>
      </div>

      {/* Guidelines Grid */}
      {filteredRules.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
          <Stethoscope size={40} style={{ opacity: 0.5, marginBottom: '12px' }} />
          <h4 style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-main)' }}>No Matching Guidelines</h4>
          <p style={{ fontSize: '13px', marginTop: '6px' }}>Try searching another symptom like "Fever", "Cough", or "Asthma".</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {displayRules.map(rule => (
            <div key={rule.id} className="glass-panel" style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '15px',
              padding: '20px',
              backgroundColor: 'rgba(255,255,255,0.015)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
                    {rule.symptomName === '*' ? 'Any Symptom' : rule.symptomName}
                  </h4>
                  <span className={`risk-badge risk-${rule.riskLevel.toLowerCase()}`} style={{ fontSize: '10px', padding: '3px 8px' }}>
                    {rule.riskLevel} Risk
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '12px' }}>
                  <span>Min Severity: {rule.severity === '*' ? 'Any' : rule.severity}</span>
                  <ChevronRight size={12} />
                  <span>Duration: {rule.durationMinDays === 0 ? 'Day 1+' : `${rule.durationMinDays}+ Days`}</span>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-main)', display: 'flex', gap: '8px', alignItems: 'flex-start', background: 'rgba(0,0,0,0.15)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--color-primary-light)', marginBottom: '10px' }}>
                  <Info size={16} style={{ color: 'var(--color-primary-light)', flexShrink: 0, marginTop: '2px' }} />
                  <span>{rule.recommendation}</span>
                </p>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontStyle: 'italic' }}>
                Reasoning: {rule.explanation}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredRules.length > 12 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
            Showing {displayRules.length} of {filteredRules.length} guidelines
          </span>
          <button 
            onClick={() => setShowAll(!showAll)} 
            className="btn-secondary"
            style={{ padding: '10px 20px', fontSize: '13px' }}
          >
            {showAll ? 'Show Less (12 Rules)' : `Show All ${filteredRules.length} Guidelines`}
          </button>
        </div>
      )}

    </div>
  );
};

export default TriageGuidelines;
