import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('schoolx_user') || '{}');
  const orgName = user.organization?.name || 'your organization';

  useEffect(() => {
    api('/admin/dashboard')
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="error">{error}</div>;
  if (!stats) return <p>Loading…</p>;

  return (
    <>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of {orgName}</p>
      </div>
      <div className="grid-4">
        <div className="stat-card">
          <div className="label">Students</div>
          <div className="value">{stats.students}</div>
        </div>
        <div className="stat-card">
          <div className="label">Teachers</div>
          <div className="value">{stats.teachers}</div>
        </div>
        <div className="stat-card">
          <div className="label">Published content</div>
          <div className="value">{stats.contentCount}</div>
        </div>
        <div className="stat-card">
          <div className="label">Pending leave</div>
          <div className="value">{stats.leavePending}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link to="/content/new" className="btn btn-primary">Publish content</Link>
        <Link to="/students" className="btn btn-outline">View students</Link>
      </div>
    </>
  );
}
