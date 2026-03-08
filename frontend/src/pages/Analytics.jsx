import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Award, Target, Layers } from 'lucide-react';

const COLORS = ['#27a36d', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444',
                 '#06b6d4', '#84cc16', '#ec4899', '#f97316', '#6366f1'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-xs" style={{
      background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)'
    }}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}{typeof p.value === 'number' && p.name.includes('score') ? '%' : ''}</p>
      ))}
    </div>
  );
};

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="glass p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-xl font-bold text-white" style={{ fontFamily: 'Clash Display,sans-serif' }}>{value}</p>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>{label}</p>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/summary')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const s = data?.summary || {};
  const charts = data?.charts || {};

  if (!s.total_resumes) return (
    <div className="max-w-2xl mx-auto text-center py-20 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
        style={{ background: 'rgba(39,163,109,0.1)', border: '1px solid rgba(39,163,109,0.2)' }}>
        <TrendingUp size={28} style={{ color: 'var(--brand)' }} />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Clash Display,sans-serif' }}>
        No data yet
      </h2>
      <p style={{ color: 'var(--muted)' }}>Analyze at least one resume to see analytics.</p>
    </div>
  );

  const axisStyle = { fill: 'var(--muted)', fontSize: 11, fontFamily: 'DM Sans' };
  const gridStyle = { stroke: 'rgba(255,255,255,0.04)' };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Clash Display,sans-serif' }}>Analytics</h1>
        <p className="mt-1" style={{ color: 'var(--muted)' }}>Performance trends across all your resumes.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Resumes" value={s.total_resumes} icon={Layers} color="#27a36d" />
        <StatCard label="Avg Match Score" value={`${s.avg_match_score}%`} icon={Target} color="#3b82f6" />
        <StatCard label="Avg ATS Score" value={`${s.avg_ats_score}%`} icon={Award} color="#a855f7" />
        <StatCard label="Total Skills" value={s.total_skills_extracted} icon={TrendingUp} color="#f59e0b" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Score trend */}
        {(charts.score_trend || []).length > 1 && (
          <div className="glass p-5 lg:col-span-2">
            <h2 className="font-semibold text-white mb-4">Score Trend</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={charts.score_trend}>
                <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
                <XAxis dataKey="date" tick={axisStyle} />
                <YAxis domain={[0, 100]} tick={axisStyle} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="match_score" name="Match Score" stroke="#27a36d"
                  strokeWidth={2} dot={{ r: 4, fill: '#27a36d' }} />
                <Line type="monotone" dataKey="ats_score" name="ATS Score" stroke="#3b82f6"
                  strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top skills */}
        {(charts.top_skills || []).length > 0 && (
          <div className="glass p-5">
            <h2 className="font-semibold text-white mb-4">Top Skills Across Resumes</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={charts.top_skills} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
                <XAxis type="number" tick={axisStyle} />
                <YAxis dataKey="skill" type="category" tick={axisStyle} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Count" radius={[0, 4, 4, 0]}>
                  {charts.top_skills.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Score distribution */}
        {(charts.score_distribution || []).some(d => d.count > 0) && (
          <div className="glass p-5">
            <h2 className="font-semibold text-white mb-4">Score Distribution</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={charts.score_distribution.filter(d => d.count > 0)}
                  dataKey="count" nameKey="range" cx="50%" cy="50%"
                  outerRadius={90} label={({ range, percent }) => `${range} (${Math.round(percent * 100)}%)`}
                  labelLine={{ stroke: 'var(--muted)' }}>
                  {charts.score_distribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
