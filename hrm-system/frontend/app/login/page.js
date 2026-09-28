'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Users, Lock, Mail, Eye, EyeOff } from 'lucide-react';

const DEMO_CREDS = [
  { role: 'Admin', email: 'admin@hrm.com', password: 'admin123' },
  { role: 'HR', email: 'hr@hrm.com', password: 'hr123' },
  { role: 'Manager', email: 'manager@hrm.com', password: 'manager123' },
  { role: 'Employee', email: 'employee@hrm.com', password: 'employee123' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      router.replace(`/dashboard/${user.role}`);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillCreds = (cred) => { setEmail(cred.email); setPassword(cred.password); setError(''); };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <Users size={22} color="white" />
          </div>
          <h1>HRM System</h1>
        </div>
        <p className="login-tagline">Sign in to access your HR dashboard</p>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label required">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--color-text-muted)' }} />
              <input
                type="email"
                className="form-control"
                style={{ paddingLeft: 34 }}
                placeholder="you@hrm.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--color-text-muted)' }} />
              <input
                type={showPass ? 'text' : 'password'}
                className="form-control"
                style={{ paddingLeft: 34, paddingRight: 40 }}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--color-text-muted)', display:'flex' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width:'100%', padding:'10px', marginTop: 4 }} disabled={loading}>
            {loading ? <><span className="spinner" style={{width:16,height:16,borderWidth:2}} /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        {/* Demo credentials */}
        <div style={{ marginTop: 24, borderTop: '1px solid var(--color-border)', paddingTop: 18 }}>
          <p style={{ fontSize:'0.75rem', color:'var(--color-text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom: 10 }}>
            Demo Accounts
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
            {DEMO_CREDS.map(c => (
              <button
                key={c.role}
                type="button"
                onClick={() => fillCreds(c)}
                style={{
                  padding: '7px 10px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  background: 'var(--color-surface-2)',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--color-primary-light)'}
                onMouseOut={e => e.currentTarget.style.background = 'var(--color-surface-2)'}
              >
                <div style={{ fontWeight:600, color:'var(--color-primary)' }}>{c.role}</div>
                <div style={{ color:'var(--color-text-muted)', fontSize:'0.72rem' }}>{c.email}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
