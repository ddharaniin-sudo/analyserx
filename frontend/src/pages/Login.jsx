import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a1810 0%, #0e2318 50%, #061209 100%)' }}>
        {/* Glow orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #27a36d, transparent)' }} />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #27a36d, #1a8459)', boxShadow: '0 0 24px rgba(39,163,109,0.5)' }}>
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Clash Display, sans-serif' }}>AnalyserX</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: 'Clash Display, sans-serif' }}>
            AI-Powered<br />Resume Analysis
          </h1>
          <p className="text-lg mb-8" style={{ color: 'var(--muted)' }}>
            Extract skills, match jobs, and get actionable suggestions to land your dream role.
          </p>
          {[
            'ATS Score & Optimization',
            'Skill Gap Analysis',
            'AI-Powered Suggestions',
            'Multi-Resume Comparison',
          ].map(f => (
            <div key={f} className="flex items-center gap-3 mb-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(39,163,109,0.2)', border: '1px solid rgba(39,163,109,0.5)' }}>
                <div className="w-2 h-2 rounded-full" style={{ background: '#27a36d' }} />
              </div>
              <span className="text-sm" style={{ color: 'var(--muted)' }}>{f}</span>
            </div>
          ))}
        </div>

        <p className="text-xs relative z-10" style={{ color: 'rgba(122,170,144,0.5)' }}>
          © 2024 AnalyserX · Final Year Project
        </p>
      </div>

      {/* Right panel (form) */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Zap size={20} style={{ color: 'var(--brand)' }} />
            <span className="text-xl font-bold text-white" style={{ fontFamily: 'Clash Display,sans-serif' }}>AnalyserX</span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Clash Display, sans-serif' }}>
            Sign In
          </h2>
          <p className="mb-8 text-sm" style={{ color: 'var(--muted)' }}>
            New here? <Link to="/register" className="hover:text-white transition-colors" style={{ color: 'var(--brand)' }}>Create an account</Link>
          </p>

          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
                <input type="email" required value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
                <input type={showPw ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 py-3 text-sm">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
