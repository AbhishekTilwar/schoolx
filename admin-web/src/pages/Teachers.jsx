import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Teachers() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api('/admin/teachers').then(setRows);
  }, []);

  return (
    <>
      <div className="page-header">
        <h2>Teachers</h2>
        <p>Teaching staff</p>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={3} className="empty">No teachers in database.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id}>
                <td>{r.employeeCode || '—'}</td>
                <td>{r.name}</td>
                <td>{r.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
