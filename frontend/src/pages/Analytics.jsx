import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const Analytics = () => {
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTrends = async () => {
    try {
      const res = await axios.get('/api/dashboard/trends');
      setTrends(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch analytics trend data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading analytics trend metrics...</div>;
  if (error) return <div style={{ color: 'var(--color-risk-high)' }}>{error}</div>;

  const { symptomFrequency, severityDistribution, feelingTrend, medicineUsage } = trends;

  // Prepare Recharts formatted data
  const symptomData = Object.keys(symptomFrequency).map(key => ({
    name: key,
    Logs: symptomFrequency[key]
  })).sort((a, b) => b.Logs - a.Logs);

  const severityData = Object.keys(severityDistribution).map(key => ({
    name: key,
    value: severityDistribution[key]
  }));

  const medicineData = Object.keys(medicineUsage).map(key => ({
    name: key,
    Doses: medicineUsage[key]
  })).sort((a, b) => b.Doses - a.Doses);

  // Colors for charts
  const SEVERITY_COLORS = {
    'High': '#ef4444',
    'Medium': '#f59e0b',
    'Low': '#10b981'
  };

  const noData = symptomData.length === 0 && feelingTrend.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)' }} className="no-print">
        Visual insights and health trends aggregated from your daily symptom logs and medicine history.
      </p>

      {noData ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No health data logged yet. Please record symptoms and medicines to populate charts.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Recovery Trend Line Chart */}
          <div className="glass-panel" style={{ height: '360px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '20px' }}>Recovery Progress (General Feeling Over Time)</h3>
            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={feelingTrend}>
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
                  <Line type="monotone" dataKey="avgFeeling" stroke="var(--color-primary)" strokeWidth={3} name="Average Feeling" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grid for distributions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            
            {/* Symptom Frequency */}
            <div className="glass-panel" style={{ height: '340px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '20px' }}>Symptom Frequency</h3>
              <div style={{ width: '100%', height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={symptomData}>
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} />
                    <YAxis stroke="var(--text-muted)" fontSize={10} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
                    <Bar dataKey="Logs" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Severity Distribution */}
            <div className="glass-panel" style={{ height: '340px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '20px' }}>Severity Distribution</h3>
              <div style={{ width: '100%', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name] || '#64748b'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '12px', marginTop: '10px' }}>
                {severityData.map(entry => (
                  <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: SEVERITY_COLORS[entry.name] }}></div>
                    <span>{entry.name}: {entry.value} logs</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Medicine Usage Chart */}
          <div className="glass-panel" style={{ height: '340px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '20px' }}>Medication Count Summary</h3>
            {medicineData.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '40px 0', textAlign: 'center' }}>No medication logs recorded during this period.</p>
            ) : (
              <div style={{ width: '100%', height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={medicineData}>
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} />
                    <YAxis stroke="var(--text-muted)" fontSize={10} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
                    <Bar dataKey="Doses" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default Analytics;
