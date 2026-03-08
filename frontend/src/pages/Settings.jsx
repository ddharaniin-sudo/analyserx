import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function Settings() {
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (password && password !== confirm) return toast.error('Passwords do not match');
    if (password && password.length < 6) return toast.error('Password must be 6+ characters');
    setLoading(true);
    try {
      const payload = { name };
      if (password) payload.password = password;
      await updateProfile(payload);
      toast.success('Profile updated');
      setPassword(''); setConfirm('');
    } catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Delete ALL your resumes? This cannot be undone.')) return;
    try {
      const res = await api.get('/resume/list');
      await Promise.all(res.data.resumes.map(r => api.delete(`/resume/${r.id}`)));
      toast.success('All resumes deleted');
    } catch { toast.error('Failed to delete resumes'); }
  };

  const Input = ({ label, type = 'text', value, onChange, placeholder }) => (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--muted)' }}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
        style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
        onFocus={e => e.target.style.borderColor = 'var(--brand)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Clash Display,sans-serif' }}>Settings</h1>
        <p className="mt-1" style={{ color: 'var(--muted)' }}>Manage your account preferences.</p>
      </div>

      {/* Profile */}
      <div className="glass p-6 mb-5">
        <div className="flex items-center gap-2 mb-5">
          <User size={16} style={{ color: 'var(--brand)' }} />
          <h2 className="font-semibold text-white">Profile</h2>
        </div>
        <div className="space-y-4">
          <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Email</label>
            <input value={user?.email || ''} disabled
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)', opacity: 0.6 }}
            />
          </div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
          </div>
        </div>
      </div>

      {/* Password */}
      <div className="glass p-6 mb-5">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={16} style={{ color: 'var(--brand)' }} />
          <h2 className="font-semibold text-white">Change Password</h2>
        </div>
        <div className="space-y-4">
          <Input label="New Password" type="password" value={password}
            onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" />
          <Input label="Confirm Password" type="password" value={confirm}
            onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" />
        </div>
      </div>

      <button onClick={handleSave} disabled={loading}
        className="btn-primary flex items-center gap-2 mb-8">
        <Save size={16} />
        {loading ? 'Saving…' : 'Save Changes'}
      </button>

      {/* Danger zone */}
      <div className="p-5 rounded-xl" style={{ border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.04)' }}>
        <h2 className="font-semibold mb-1" style={{ color: '#ef4444' }}>Danger Zone</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>These actions are irreversible. Please proceed with caution.</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleDeleteAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all"
            style={{ border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Trash2 size={15} /> Delete All Resumes
          </button>
          <button onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all"
            style={{ border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
