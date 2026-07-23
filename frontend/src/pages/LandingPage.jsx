import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, ShieldCheck, ClipboardCheck, ArrowRight, UserCheck, AlertTriangle } from 'lucide-react';

const LandingPage = () => {
  const { token } = useAuth();
  if (token) return <Navigate to="/dashboard" replace />;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-main)',
      color: 'var(--text-main)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      {/* Navbar */}
      <header style={{
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-color)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-inverse)',
            fontWeight: 'bold',
            fontSize: '20px'
          }}>🩺</div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>AEGIS HEALTH</h2>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>TRIAGE & CLINICAL DECISION ENGINE</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '13px' }}>Log In</Link>
          <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '13px' }}>Register</Link>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '9999px',
          backgroundColor: 'rgba(13, 148, 136, 0.08)',
          border: '1px solid rgba(13, 148, 136, 0.2)',
          color: 'var(--color-primary-light)',
          fontSize: '12px',
          fontWeight: '700',
          marginBottom: '24px'
        }}>
          <ShieldCheck size={14} />
          <span>RESPONSIBLE HEALTH TRACKING & TRIAGE DECISIONS</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(28px, 6vw, 54px)',
          lineHeight: '1.15',
          marginBottom: '20px',
          background: 'linear-gradient(to right, #ffffff, var(--color-primary-light))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: 'var(--font-display)',
          fontWeight: '900'
        }}>
          Intelligent Health Monitoring & Early Triage Decisions
        </h1>
        
        <p style={{
          fontSize: '17px',
          color: 'var(--text-muted)',
          lineHeight: '1.6',
          marginBottom: '35px',
          maxWidth: '700px'
        }}>
          Track symptoms, record medication effects, and evaluate health risks using a configurable database-driven explainable rules engine. Prepare detailed clinical summaries for doctor visits.
        </p>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '60px' }}>
          <Link to="/register" className="btn-primary" style={{ padding: '14px 28px', fontSize: '15px', textDecoration: 'none' }}>
            <span>Get Started</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary" style={{ padding: '14px 28px', fontSize: '15px', textDecoration: 'none' }}>
            <span>Portal Login</span>
          </Link>
        </div>

        {/* Disclaimer Alert */}
        <div className="glass-panel" style={{
          maxWidth: '650px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          textAlign: 'left',
          border: '1px dashed var(--color-risk-medium-border)',
          backgroundColor: 'var(--color-risk-medium-bg)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          marginBottom: '60px'
        }}>
          <AlertTriangle size={36} style={{ color: 'var(--color-risk-medium)', flexShrink: 0 }} />
          <div>
            <h4 style={{ color: 'var(--color-risk-medium)', fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>Medical Disclaimer & Core Principle</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Aegis Health **does not diagnose diseases**, **does not prescribe medicines**, and **does not replace certified healthcare professionals**. It acts as an early decision-support system to guide monitoring and facilitate structured consultations.
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '30px',
          width: '100%',
          marginTop: '20px'
        }}>
          <div className="glass-panel" style={{ textAlign: 'left', padding: '24px' }}>
            <ClipboardCheck size={28} style={{ color: 'var(--color-primary)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Configurable Rules Engine</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Determines risk levels (Low, Medium, High) based on active database-driven rules, matching severity and symptom duration.
            </p>
          </div>
          <div className="glass-panel" style={{ textAlign: 'left', padding: '24px' }}>
            <UserCheck size={28} style={{ color: 'var(--color-accent)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Explainable Decisions</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Every triage recommendation lists the precise matched database rules and duration logic, avoiding "black box" decisions.
            </p>
          </div>
          <div className="glass-panel" style={{ textAlign: 'left', padding: '24px' }}>
            <Heart size={28} style={{ color: '#10b981', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>AI Doctor Visit Prep</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Synthesizes symptom duration, medication logs, and risk history into structured clinical reports utilizing Gemini AI.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '30px 80px',
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center',
        fontSize: '12px',
        color: 'var(--text-muted)'
      }}>
        <p>&copy; {new Date().getFullYear()} Aegis Health. All rights reserved. Designed for portfolios and responsible decision support.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
