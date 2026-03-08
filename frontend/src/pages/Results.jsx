import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Target, Shield, AlertTriangle, Lightbulb,
  CheckCircle, XCircle, Tag
} from 'lucide-react';

function ScoreRing({ score, label, color, size = 120 }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ / 4}
          style={{ transition: 'stroke-dasharray 1s ease', filter: `drop-shadow(0 0 6px ${color})` }}
        />
        <text x="50" y="50" textAnchor="middle" dominantBaseline="middle"
          fill="white" fontSize="16" fontWeight="bold" fontFamily="Clash Display, sans-serif">
          {Math.round(score)}%
        </text>
      </svg>
      <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{label}</span>
    </div>
  );
}

function SkillBadge({ skill, variant = 'found' }) {
  const colors = {
    found: { bg: 'rgba(39,163,109,0.12)', border: 'rgba(39,163,109,0.3)', text: '#27a36d' },
    gap: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#ef4444' },
    jd: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', text: '#60a5fa' },
  };
  const c = colors[variant];
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      {skill}
    </span>
  );
}

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/resume/${id}`)
      .then(r => setResume(r.data.resume))
      .catch(() => { toast.error('Resume not found'); navigate('/dashboard'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!resume) return null;

  const analysis = resume.analysis_data || {};
  const matchScore = resume.match_score || 0;
  const atsScore = resume.ats_score || 0;
  const overallColor = s => s >= 75 ? '#27a36d' : s >= 50 ? '#eab308' : '#ef4444';

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 mb-6 text-sm transition-colors hover:text-white"
        style={{ color: 'var(--muted)' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="glass p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Clash Display,sans-serif' }}>
              {resume.filename}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              Analyzed {new Date(resume.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Score rings */}
        <div className="flex flex-wrap gap-8 justify-center sm:justify-start">
          <ScoreRing score={atsScore} label="ATS Score" color={overallColor(atsScore)} />
          {matchScore > 0 && (
            <ScoreRing score={matchScore} label="Job Match" color={overallColor(matchScore)} />
          )}
          <div className="flex flex-col items-center gap-2">
            <div className="w-[120px] h-[120px] flex items-center justify-center flex-col"
              style={{ border: '1px solid var(--border)', borderRadius: '50%' }}>
              <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Clash Display,sans-serif' }}>
                {resume.extracted_skills?.length || 0}
              </span>
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Skills Found</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Extracted Skills */}
        <div className="glass p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={16} style={{ color: '#27a36d' }} />
            <h2 className="font-semibold text-white">Extracted Skills</h2>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(39,163,109,0.15)', color: '#27a36d' }}>
              {resume.extracted_skills?.length || 0}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
            {(resume.extracted_skills || []).length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--muted)' }}>No skills detected</p>
            ) : resume.extracted_skills.map(s => <SkillBadge key={s} skill={s} variant="found" />)}
          </div>
        </div>

        {/* Skill Gaps */}
        <div className="glass p-5">
          <div className="flex items-center gap-2 mb-4">
            <XCircle size={16} style={{ color: '#ef4444' }} />
            <h2 className="font-semibold text-white">Skill Gaps</h2>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
              {resume.skill_gaps?.length || 0}
            </span>
          </div>
          {(resume.skill_gaps || []).length === 0 ? (
            resume.job_description
              ? <p className="text-sm" style={{ color: 'var(--muted)' }}>No skill gaps detected — great match!</p>
              : <p className="text-sm" style={{ color: 'var(--muted)' }}>Add a job description to see skill gaps.</p>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {resume.skill_gaps.map(s => <SkillBadge key={s} skill={s} variant="gap" />)}
            </div>
          )}
        </div>

        {/* ATS Penalties */}
        {(analysis.ats_penalties || []).length > 0 && (
          <div className="glass p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={16} style={{ color: '#eab308' }} />
              <h2 className="font-semibold text-white">ATS Issues</h2>
            </div>
            <div className="space-y-2">
              {analysis.ats_penalties.map((p, i) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-lg"
                  style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
                  <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#eab308' }} />
                  <p className="text-xs" style={{ color: '#fde68a' }}>{p}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Keywords */}
        {(analysis.keywords || []).length > 0 && (
          <div className="glass p-5">
            <div className="flex items-center gap-2 mb-4">
              <Tag size={16} style={{ color: '#a855f7' }} />
              <h2 className="font-semibold text-white">Top Keywords</h2>
            </div>
            <div className="space-y-2">
              {analysis.keywords.slice(0, 8).map(({ word, count }) => (
                <div key={word} className="flex items-center gap-3">
                  <span className="text-sm w-28 truncate" style={{ color: 'var(--muted)' }}>{word}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
                    <div className="h-full rounded-full" style={{
                      width: `${Math.min((count / (analysis.keywords[0]?.count || 1)) * 100, 100)}%`,
                      background: 'linear-gradient(90deg, #a855f7, #7c3aed)',
                    }} />
                  </div>
                  <span className="text-xs font-mono w-4 text-right" style={{ color: 'var(--muted)' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {(resume.suggestions || []).length > 0 && (
        <div className="glass p-6 mt-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={16} style={{ color: '#f59e0b' }} />
            <h2 className="font-semibold text-white">AI Suggestions</h2>
          </div>
          <div className="space-y-3">
            {resume.suggestions.map((s, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                  style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}>
                  {i + 1}
                </div>
                <p className="text-sm" style={{ color: '#fde68a' }}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Word count */}
      {analysis.word_count && (
        <div className="glass p-4 mt-5 flex items-center gap-3">
          <Target size={16} style={{ color: 'var(--muted)' }} />
          <span className="text-sm" style={{ color: 'var(--muted)' }}>
            Word count: <span className="text-white font-medium">{analysis.word_count}</span>
            &nbsp;·&nbsp;Recommended: <span className="text-white font-medium">300–700 words</span>
          </span>
        </div>
      )}
    </div>
  );
}
