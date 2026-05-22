import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function ContentCreate() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [sections, setSections] = useState([]);
  const [form, setForm] = useState({
    branchId: '',
    type: 'BROADCAST',
    tag: 'ANNOUNCEMENT',
    title: '',
    body: '',
    status: 'published',
    subjectName: '',
    dueAt: '',
    examDate: '',
    sectionId: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api('/admin/branches').then((b) => {
      setBranches(b);
      if (b[0]) setForm((f) => ({ ...f, branchId: b[0].id }));
    });
    api('/admin/sections').then(setSections);
  }, []);

  const tagOptions = {
    ASSIGNMENT: ['HOMEWORK', 'CLASSWORK', 'WORKSHEET'],
    BROADCAST: ['NOTICE', 'ANNOUNCEMENT', 'URGENT'],
    ASSESSMENT: ['UNIT_TEST', 'EXAM'],
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.branchId) {
      setError('Select a branch (wait for branches to load, or run database seed).');
      return;
    }
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }

    setSubmitting(true);
    try {
      const audiences = form.sectionId
        ? [{ audienceType: 'section', audienceId: form.sectionId }]
        : [{ audienceType: 'branch', audienceId: form.branchId }];

      await api('/content', {
        method: 'POST',
        body: JSON.stringify({
          branchId: form.branchId,
          type: form.type,
          tags: [form.tag],
          title: form.title.trim(),
          body: form.body,
          status: form.status,
          subjectName: form.subjectName || undefined,
          dueAt: form.dueAt || undefined,
          examDate: form.examDate || undefined,
          audiences,
        }),
      });
      navigate('/content');
    } catch (err) {
      setError(err.message || 'Failed to publish. Check API is running and you are logged in.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <h2>Create content</h2>
        <p>Unified form for all content types</p>
      </div>
      <form className="form-card" onSubmit={handleSubmit}>
        {error && <div className="error">{error}</div>}
        <label>Type</label>
        <select
          value={form.type}
          onChange={(e) =>
            setForm({ ...form, type: e.target.value, tag: tagOptions[e.target.value][0] })
          }
        >
          <option value="ASSIGNMENT">Assignment</option>
          <option value="BROADCAST">Broadcast</option>
          <option value="ASSESSMENT">Assessment</option>
        </select>
        <label>Tag</label>
        <select value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })}>
          {tagOptions[form.type].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <label>Branch</label>
        <select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <label>Section (optional)</label>
        <select value={form.sectionId} onChange={(e) => setForm({ ...form, sectionId: e.target.value })}>
          <option value="">Whole branch</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        <label>Title</label>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <label>Body</label>
        <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        {form.type === 'ASSIGNMENT' && (
          <>
            <label>Subject</label>
            <input value={form.subjectName} onChange={(e) => setForm({ ...form, subjectName: e.target.value })} />
            <label>Due at</label>
            <input type="datetime-local" value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })} />
          </>
        )}
        {form.type === 'ASSESSMENT' && (
          <>
            <label>Exam date</label>
            <input type="date" value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} />
          </>
        )}
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="btn btn-primary" disabled={submitting || !form.branchId}>
            {submitting ? 'Publishing…' : 'Publish'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/content')}>Cancel</button>
        </div>
      </form>
    </>
  );
}
