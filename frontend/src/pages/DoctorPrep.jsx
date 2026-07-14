import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Stethoscope, Printer, FileText, Sparkles, ChevronRight } from 'lucide-react';

const DoctorPrep = () => {
  const [summaries, setSummaries] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [days, setDays] = useState(1);

  const fetchSummaries = async () => {
    try {
      const res = await axios.get('/api/ai/summaries');
      setSummaries(res.data);
      if (res.data.length > 0 && !selectedSummary) {
        setSelectedSummary(res.data[0]);
      }
      setListLoading(false);
    } catch (err) {
      console.error('Error fetching summaries:', err);
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/ai/summary', { days });
      setSelectedSummary(res.data);
      setSummaries(prev => [res.data, ...prev]);
    } catch (err) {
      alert('Failed to generate health summary. Please log some data first.');
    } finally {
      setLoading(false);
    }
  };

  const triggerPrint = () => {
    window.print();
  };

  // Simple Markdown to HTML Parser to avoid heavy dependency
  const parseMarkdown = (text) => {
    if (!text) return '';
    
    // Replace headers
    let html = text
      .replace(/^### (.*$)/gim, '<h4 style="font-size:15px;color:var(--color-primary-light);margin:16px 0 8px 0;font-weight:700;">$1</h4>')
      .replace(/^## (.*$)/gim, '<h3 style="font-size:18px;border-bottom:1px solid var(--border-color);padding-bottom:6px;margin:24px 0 12px 0;font-weight:800;color:var(--text-main);">$1</h3>')
      .replace(/^# (.*$)/gim, '<h2 style="font-size:22px;margin:20px 0 10px 0;font-weight:900;color:var(--text-main);">$1</h2>');

    // Replace bold text
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-main);font-weight:700;">$1</strong>');
    
    // Replace italic text
    html = html.replace(/\*(.*?)\*/g, '<em style="color:var(--text-muted);font-style:italic;">$1</em>');

    // Replace lists
    html = html.replace(/^\- (.*$)/gim, '<li style="margin-left:20px;margin-bottom:6px;font-size:13px;line-height:1.5;color:var(--text-muted);">$1</li>');

    // Replace tables
    const lines = html.split('\n');
    let inTable = false;
    let tableHtml = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('|') && line.endsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableHtml += '<table style="width:100%;border-collapse:collapse;margin:15px 0;font-size:13px;border:1px solid var(--border-color);">';
        }
        
        // Skip separator line |---|---|
        if (line.includes('---') || line.includes(':---')) {
          lines[i] = '';
          continue;
        }

        const cells = line.split('|').slice(1, -1);
        tableHtml += '<tr style="border-bottom:1px solid var(--border-color);">';
        
        cells.forEach(cell => {
          const style = 'padding:10px;text-align:left;color:var(--text-muted);';
          tableHtml += `<td style="${style}">${cell.trim()}</td>`;
        });
        
        tableHtml += '</tr>';
        lines[i] = ''; // Clear raw markdown table line
      } else {
        if (inTable) {
          inTable = false;
          tableHtml += '</table>';
          lines[i] = tableHtml + '\n' + lines[i];
          tableHtml = '';
        }
      }
    }

    if (inTable) {
      tableHtml += '</table>';
      lines.push(tableHtml);
    }
    
    // Filter out cleared raw table strings before joining
    html = lines.filter(l => l !== '').join('\n');
    html = html.replace(/\n/g, '<br/>');

    return <div dangerouslySetInnerHTML={{ __html: html }} style={{ color: 'var(--text-muted)' }} />;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '30px' }} className="grid-responsive">
      
      {/* Left Column: Generate Card & History */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }} className="no-print">
        
        {/* Generator panel */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} style={{ color: 'var(--color-primary-light)' }} />
            <span>Generate Doctor Prep Summary</span>
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Choose a tracking timeframe to compile your symptom timeline, medicine audit, and risk flags into a structured report using Gemini AI.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Timeframe (Days)</label>
            <select 
              value={days} 
              onChange={(e) => setDays(parseInt(e.target.value))} 
              className="input-field"
              style={{ background: 'rgba(0,0,0,0.2)' }}
            >
              <option value={1} style={{ background: 'var(--bg-main)' }}>Past 1 Day (Default)</option>
              <option value={2} style={{ background: 'var(--bg-main)' }}>Past 2 Days</option>
              <option value={3} style={{ background: 'var(--bg-main)' }}>Past 3 Days</option>
              <option value={4} style={{ background: 'var(--bg-main)' }}>Past 4 Days</option>
              <option value={5} style={{ background: 'var(--bg-main)' }}>Past 5 Days</option>
              <option value={7} style={{ background: 'var(--bg-main)' }}>Past 7 Days</option>
              <option value={10} style={{ background: 'var(--bg-main)' }}>Past 10 Days</option>
            </select>
          </div>

          <button onClick={handleGenerate} disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Synthesizing Data...' : 'Compile AI Summary'}
          </button>
        </div>

        {/* Historical List */}
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800' }}>Previous Summaries</h3>
          {listLoading ? (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Loading history...</p>
          ) : summaries.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No reports compiled yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '350px' }}>
              {summaries.map(sum => (
                <div 
                  key={sum.id} 
                  onClick={() => setSelectedSummary(sum)}
                  style={{
                    padding: '12px 16px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    backgroundColor: selectedSummary?.id === sum.id ? 'var(--color-primary-glow)' : 'transparent',
                    borderColor: selectedSummary?.id === sum.id ? 'var(--color-primary)' : 'var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'border-color 0.2s'
                  }}
                  className="hover-nav-item"
                >
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: '700' }}>Report Range</h4>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {new Date(sum.startDate).toLocaleDateString()} - {new Date(sum.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Active Summary Display */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '550px' }}>
        
        {/* Summary Header Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }} className="no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '14px', fontWeight: '700' }}>Active Prep Report</span>
          </div>
          {selectedSummary && (
            <button onClick={triggerPrint} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
              <Printer size={14} />
              <span>Print / PDF Export</span>
            </button>
          )}
        </div>

        {/* The report itself */}
        <div className="print-page" style={{ flex: 1, padding: '10px 0' }}>
          {selectedSummary ? (
            parseMarkdown(selectedSummary.summaryText)
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
              <Stethoscope size={44} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h4 style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-main)', marginBottom: '8px' }}>No Active Summary Selected</h4>
              <p style={{ fontSize: '13px', maxWidth: '300px' }}>Compile a new AI summary or select a previous report from the list on the left.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default DoctorPrep;
