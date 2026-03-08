import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  FileText, TrendingUp, Target, Lightbulb, Upload,
  ChevronRight, Clock, Star, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="glass p-5 flex items-center gap-4 hover:scale-[1.01] transition-transform duration-200">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Clash Display,sans-serif' }}>{value}</p>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--muted)', opacity: 0.7 }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/resume/list')
      .then(r => setResumes(r.data.resumes))
      .catch(() => toast.error('Failed to load resumes'))
      .finally(() => setLoading(false));
  }, []);

  const deleteResume = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this resume?')) return;
    try {
      await api.delete(`/resume/${id}`);
      setResumes(r => r.filter(x => x.id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const avg = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
  const avgMatch = avg(resumes.map(r => r.match_score || 0));
  const avgAts = avg(resumes.map(r => r.ats_score || 0));

  const scoreColor = s => s >= 75 ? '#27a36d' : s >= 50 ? '#eab308' : '#ef4444';

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Clash Display,sans-serif' }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="mt-1" style={{ color: 'var(--muted)' }}>Here's your resume analysis overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Resumes Analyzed" value={resumes.length} icon={FileText} color="#27a36d" />
        <StatCard label="Avg Match Score" value={`${avgMatch}%`} icon={Target} color="#3b82f6" />
        <StatCard label="Avg ATS Score" value={`${avgAts}%`} icon={TrendingUp} color="#a855f7" />
        <StatCard label="Total Skills" value={resumes.reduce((a, r) => a + (r.extracted_skills?.length || 0), 0)}
          icon={Star} color="#f59e0b" />
      </div>

      {/* CTA */}
      {resumes.length === 0 && !loading && (
        <div className="glass p-10 text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(39,163,109,0.1)', border: '1px solid rgba(39,163,109,0.2)' }}>
            <Upload size={28} style={{ color: 'var(--brand)' }} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'Clash Display,sans-serif' }}>
            Analyze your first resume
          </h3>
          <p className="mb-6 text-sm" style={{ color: 'var(--muted)' }}>
            Upload a PDF and get instant AI-powered feedback.
          </p>
          <button className="btn-primary" onClick={() => navigate('/upload')}>
            Upload Resume
          </button>
        </div>
      )}

      {/* Resume list */}
      {resumes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'Clash Display,sans-serif' }}>
              Your Resumes
            </h2>
            <button className="btn-ghost text-sm py-2 px-4" onClick={() => navigate('/upload')}>
              + New
            </button>
          </div>

          <div className="space-y-3">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="glass p-5 animate-pulse">
                  <div className="h-4 rounded w-1/3 mb-2" style={{ background: 'var(--surface2)' }} />
                  <div className="h-3 rounded w-1/4" style={{ background: 'var(--surface2)' }} />
                </div>
              ))
            ) : resumes.map(r => (
              <div key={r.id}
                className="glass p-5 flex items-center gap-4 cursor-pointer hover:border-brand-500/40 transition-all duration-200 group"
                onClick={() => navigate(`/results/${r.id}`)}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(39,163,109,0.1)' }}>
                  <FileText size={18} style={{ color: 'var(--brand)' }} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{r.filename}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      <Clock size={11} className="inline mr-1" />
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      {r.extracted_skills?.length || 0} skills
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>Match</p>
                    <p className="text-sm font-bold" style={{ color: scoreColor(r.match_score) }}>
                      {r.match_score ? `${r.match_score}%` : '—'}
                    </p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>ATS</p>
                    <p className="text-sm font-bold" style={{ color: scoreColor(r.ats_score) }}>
                      {r.ats_score ? `${r.ats_score}%` : '—'}
                    </p>
                  </div>
                  <button onClick={(e) => deleteResume(r.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all hover:bg-red-500/10"
                    style={{ color: 'rgba(239,68,68,0.6)' }}>
                    <Trash2 size={15} />
                  </button>
                  <ChevronRight size={16} style={{ color: 'var(--muted)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="glass p-5 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={16} style={{ color: '#f59e0b' }} />
          <h3 className="text-sm font-semibold text-white">Quick Tips</h3>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            'Tailor keywords to each job description for a higher match score.',
            'A strong ATS score (70%+) helps your resume pass automated filters.',
            'Close skill gaps by highlighting relevant coursework or projects.',
          ].map((t, i) => (
            <p key={i} className="text-xs p-3 rounded-lg" style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>
              {t}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
