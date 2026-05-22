import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/students', label: 'Students' },
  { to: '/teachers', label: 'Teachers' },
  { to: '/content', label: 'Content Hub' },
  { to: '/leave', label: 'Leave' },
  { to: '/fees', label: 'Fees' },
  { to: '/buses', label: 'Buses' },
];

export default function Layout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('schoolx_user') || '{}');

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">SchoolX</div>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <span style={{ fontWeight: 600 }}>{user.organization?.name || 'Admin'}</span>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: 'var(--muted)' }}>{user.fullName || user.email}</span>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                localStorage.removeItem('schoolx_token');
                localStorage.removeItem('schoolx_user');
                navigate('/login');
              }}
            >
              Logout
            </button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
