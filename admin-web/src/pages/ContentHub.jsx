import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

function tagChips(tags) {
  return tags.map((t) => (
    <span key={t} className={`chip ${t === 'NOTICE' ? 'notice' : ''} ${t === 'URGENT' ? 'urgent' : ''} ${t === 'HOMEWORK' ? 'homework' : ''}`}>
      {t}
    </span>
  ));
}

export default function ContentHub() {
  const [items, setItems] = useState([]);
  const [type, setType] = useState('');

  useEffect(() => {
    const q = new URLSearchParams();
    if (type) q.set('type', type);
    api(`/content?${q}`).then((r) => setItems(r.data));
  }, [type]);

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Content Hub</h2>
          <p>Homework, notices, announcements, and exams in one place</p>
        </div>
        <Link to="/content/new" className="btn btn-primary">+ Create</Link>
      </div>
      <div className="filters">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          <option value="ASSIGNMENT">Assignment</option>
          <option value="BROADCAST">Broadcast</option>
          <option value="ASSESSMENT">Assessment</option>
        </select>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Tags</th>
              <th>Status</th>
              <th>Author</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={5} className="empty">No content yet</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.type}</td>
                  <td>{tagChips(item.tags)}</td>
                  <td>{item.status}</td>
                  <td>{item.authorName}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
