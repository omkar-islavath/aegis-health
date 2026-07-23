import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Activity, 
  History, 
  LineChart, 
  Stethoscope, 
  Settings, 
  LogOut, 
  Bell, 
  Sun, 
  Moon,
  User as UserIcon,
  Check,
  BookOpen,
  Menu,
  X
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track window resize for responsive layout adjustments
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 900) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Apply Theme
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close notifications dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifDropdown && !event.target.closest('.notif-container')) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifDropdown]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const markRead = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.post('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Activity },
    { name: 'Timeline', path: '/timeline', icon: History },
    { name: 'Analytics', path: '/analytics', icon: LineChart },
    { name: 'Doctor Prep', path: '/doctor-prep', icon: Stethoscope },
    { name: 'Triage Guidelines', path: '/triage-guidelines', icon: BookOpen },
    { name: 'Rules Engine (Admin)', path: '/rules-editor', icon: Settings },
  ];

  const isMobile = windowWidth <= 900;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      
      {/* Mobile Backdrop Overlay */}
      {isMobile && isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 90
          }}
          className="no-print"
        />
      )}

      {/* Sidebar Navigation */}
      <aside style={{
        width: '280px',
        backgroundColor: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--border-color)',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 100,
        transform: isMobile ? (isMobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isMobile && isMobileOpen ? 'var(--shadow-lg)' : 'none'
      }} className="no-print">
        <div>
          {/* Sidebar Header & Close Icon for Mobile */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
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
                <h2 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-display)' }}>AEGIS HEALTH</h2>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>TRIAGE & MONITORING</p>
              </div>
            </div>
            {isMobile && (
              <button 
                onClick={() => setIsMobileOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={22} />
              </button>
            )}
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.name} to={item.path} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                  color: isActive ? 'var(--text-inverse)' : 'var(--text-main)',
                  background: isActive ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' : 'transparent',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'background 0.2s ease'
                }} className={!isActive ? 'hover-nav-item' : ''}>
                  <Icon size={18} style={{ opacity: isActive ? 1 : 0.8 }} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: 'rgba(0,0,0,0.15)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '15px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              flexShrink: 0
            }}><UserIcon size={16} /></div>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: '600' }}>{user?.firstName} {user?.lastName}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Patient Account</p>
            </div>
          </div>

          <button onClick={logout} style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            background: 'transparent',
            color: '#ef4444',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'background 0.2s, border-color 0.2s'
          }} className="btn-logout">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div style={{
        flex: 1,
        marginLeft: isMobile ? 0 : '280px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        width: isMobile ? '100%' : 'calc(100% - 280px)'
      }}>
        {/* Header Bar */}
        <header style={{
          height: '70px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-card)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '0 16px' : '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }} className="no-print">
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobile && (
              <button 
                onClick={() => setIsMobileOpen(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px'
                }}
              >
                <Menu size={22} />
              </button>
            )}
            <h1 style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: '800' }}>
              {menuItems.find(item => item.path === location.pathname)?.name || 'Health Portal'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '16px' }}>
            {/* Theme Toggle */}
            <button onClick={toggleTheme} style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.04)'
            }} className="theme-toggle">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }} className="notif-container">
              <button onClick={() => setShowNotifDropdown(!showNotifDropdown)} style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.04)',
                position: 'relative'
              }} className="notif-toggle">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-risk-high)',
                    color: 'white',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>{unreadCount}</span>
                )}
              </button>

              {showNotifDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  width: isMobile ? '280px' : '320px',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 100,
                  maxHeight: '380px',
                  overflowY: 'auto'
                }}>
                  <div style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <h4 style={{ fontWeight: '700', fontSize: '13px' }}>Notifications</h4>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-primary)',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}>Mark all read</button>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {notifications.length === 0 ? (
                      <p style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>No notifications yet.</p>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid var(--border-color)',
                          backgroundColor: notif.isRead ? 'transparent' : 'rgba(13,148,136,0.04)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          position: 'relative'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h5 style={{
                              fontWeight: notif.isRead ? '600' : '800',
                              fontSize: '13px',
                              color: notif.type === 'triage_alert' ? 'var(--color-risk-high)' : 'var(--text-main)'
                            }}>{notif.title}</h5>
                            {!notif.isRead && (
                              <button onClick={(e) => markRead(notif.id, e)} style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer'
                              }}>
                                <Check size={14} />
                              </button>
                            )}
                          </div>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{notif.message}</p>
                          <span style={{ fontSize: '9px', color: 'var(--text-muted)', alignSelf: 'flex-end', marginTop: '4px' }}>
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main style={{
          flex: 1,
          padding: isMobile ? '20px 16px' : '32px 40px',
          overflowY: 'auto',
          maxWidth: '100%'
        }} className="print-page">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
