import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Upload, FileText, X, Sparkles, Briefcase } from 'lucide-react';

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(accepted => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 16 * 1024 * 1024,
    onDropRejected: () => toast.error('Please upload a PDF file under 16MB'),
  });

  const handleSubmit = async () => {
    if (!file) return toast.error('Please upload a resume PDF');
    setLoading(true);
    setProgress(10);

    const fd = new FormData();
    fd.append('resume', file);
    fd.append('job_description', jd);

    try {
      const interval = setInterval(() => setProgress(p => Math.min(p + 8, 85)), 400);
      const res = await api.post('/resume/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      clearInterval(interval);
      setProgress(100);
      toast.success('Analysis complete!');
      setTimeout(() => navigate(`/results/${res.data.resume.id}`), 400);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Clash Display,sans-serif' }}>
          Analyze Resume
        </h1>
        <p className="mt-1" style={{ color: 'var(--muted)' }}>
          Upload your PDF and optionally add a job description for tailored insights.
        </p>
      </div>

      {/* Dropzone */}
      <div {...getRootProps()} className="glass p-10 text-center cursor-pointer mb-5 transition-all duration-200"
        style={{
          borderColor: isDragActive ? 'var(--brand)' : file ? '#27a36d80' : 'var(--border)',
          background: isDragActive ? 'rgba(39,163,109,0.05)' : 'rgba(14,23,18,0.8)',
          borderWidth: '2px',
          borderStyle: 'dashed',
        }}>
        <input {...getInputProps()} />

        {file ? (
          <div>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'rgba(39,163,109,0.15)', border: '1px solid rgba(39,163,109,0.3)' }}>
              <FileText size={26} style={{ color: 'var(--brand)' }} />
            </div>
            <p className="font-semibold text-white mb-1">{file.name}</p>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
              {(file.size / 1024).toFixed(1)} KB · PDF
            </p>
            <button onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="flex items-center gap-1 mx-auto text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
              <X size={13} /> Remove
            </button>
          </div>
        ) : (
          <div>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              <Upload size={26} style={{ color: isDragActive ? 'var(--brand)' : 'var(--muted)' }} />
            </div>
            <p className="font-semibold text-white mb-1">
              {isDragActive ? 'Drop your PDF here' : 'Drag & drop your resume'}
            </p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>or click to browse · PDF only · Max 16MB</p>
          </div>
        )}
      </div>

      {/* Job Description */}
      <div className="glass p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Briefcase size={16} style={{ color: 'var(--brand)' }} />
          <label className="text-sm font-medium text-white">Job Description <span style={{ color: 'var(--muted)' }}>(optional but recommended)</span></label>
        </div>
        <textarea
          value={jd}
          onChange={e => setJd(e.target.value)}
          rows={6}
          placeholder="Paste the job description here to get a match score and skill gap analysis…"
          className="w-full p-3 rounded-xl text-sm outline-none resize-none transition-all"
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            fontFamily: 'DM Sans, sans-serif',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--brand)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
          {jd.length} characters
        </p>
      </div>

      {/* Progress bar */}
      {loading && (
        <div className="glass p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: 'var(--muted)' }}>Analysing your resume…</span>
            <span className="text-sm font-mono" style={{ color: 'var(--brand)' }}>{progress}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #27a36d, #a3e635)' }} />
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
            {progress < 30 ? 'Extracting text from PDF…'
              : progress < 60 ? 'Running NLP analysis…'
              : progress < 85 ? 'Computing match score…'
              : 'Finalizing results…'}
          </p>
        </div>
      )}

      <button onClick={handleSubmit} disabled={loading || !file} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
        <Sparkles size={18} />
        {loading ? 'Analysing…' : 'Analyze Resume'}
      </button>

      {/* Info cards */}
      <div className="grid sm:grid-cols-3 gap-3 mt-6">
        {[
          { label: 'Skill Extraction', desc: 'Automatically detects 100+ tech & soft skills' },
          { label: 'ATS Score', desc: 'See how well your resume passes applicant tracking systems' },
          { label: 'AI Suggestions', desc: 'Get personalised tips to improve your resume' },
        ].map(c => (
          <div key={c.label} className="p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-sm font-semibold text-white mb-1">{c.label}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
