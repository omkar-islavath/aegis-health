import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Smile, AlertCircle } from 'lucide-react';

const Timeline = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/api/symptoms/logs');
      setLogs(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch symptom timeline.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Group logs by date (YYYY-MM-DD)
  const groupLogsByDate = () => {
    const grouped = {};
    logs.forEach(log => {
      const dateKey = new Date(log.loggedAt).toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(log);
    });
    // Sort dates descending
    return Object.keys(grouped)
      .sort((a, b) => new Date(b) - new Date(a))
      .map(date => ({
        date,
        items: grouped[date]
      }));
  };

  if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading timeline records...</div>;
  if (error) return <div style={{ color: 'var(--color-risk-high)' }}>{error}</div>;

  const timelineDays = groupLogsByDate();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '30px' }}>
        Chronological tracking of symptom logs. Grouped day-by-day to monitor your recovery progression.
      </p>

      {timelineDays.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No symptom logs recorded yet. Go to the dashboard to log your first symptom.</p>
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '30px', borderLeft: '2px dashed var(--border-color)' }}>
          {timelineDays.map((day, idx) => {
            const formattedDate = new Date(day.date).toLocaleDateString(undefined, {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });

            // Calculate average feeling for this day
            const avgFeeling = (day.items.reduce((acc, curr) => acc + curr.generalFeeling, 0) / day.items.length).toFixed(0);

            return (
              <div key={day.date} style={{ marginBottom: '40px', position: 'relative' }}>
                {/* Timeline Dot */}
                <div style={{
                  position: 'absolute',
                  left: '-41px',
                  top: '4px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-main)',
                  border: '3px solid var(--color-primary)',
                  boxShadow: '0 0 0 4px var(--bg-main)'
                }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-primary-light)' }}>
                    {formattedDate}
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Smile size={14} />
                    <span>Avg Feeling: {avgFeeling}/5</span>
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {day.items.map(log => (
                    <div key={log.id} className="glass-panel" style={{
                      padding: '16px 20px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '700' }}>{log.symptomName}</h4>
                          <span style={{
                            fontSize: '10px',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: log.severity === 'High' ? 'var(--color-risk-high-bg)' : log.severity === 'Medium' ? 'var(--color-risk-medium-bg)' : 'var(--color-risk-low-bg)',
                            color: log.severity === 'High' ? 'var(--color-risk-high)' : log.severity === 'Medium' ? 'var(--color-risk-medium)' : 'var(--color-risk-low)',
                            fontWeight: '700'
                          }}>{log.severity} Severity</span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Day {log.durationDays}
                        </span>
                      </div>

                      {log.notes && (
                        <p style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '10px', fontStyle: 'italic' }}>
                          "{log.notes}"
                        </p>
                      )}

                      {log.triageResult && (
                        <div style={{
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          borderTop: '1px solid var(--border-color)',
                          paddingTop: '10px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '6px'
                        }}>
                          <AlertCircle size={14} style={{ color: log.triageResult.riskLevel === 'High' ? 'var(--color-risk-high)' : log.triageResult.riskLevel === 'Medium' ? 'var(--color-risk-medium)' : 'var(--color-risk-low)', flexShrink: 0, marginTop: '1px' }} />
                          <div>
                            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Recommendation:</span>{' '}
                            {log.triageResult.recommendation}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Timeline;
