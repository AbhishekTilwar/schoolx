import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Students() {
  const [rows, setRows] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState('');

  useEffect(() => {
    api('/admin/branches').then(setBranches);
  }, []);

  useEffect(() => {
    const q = branchId ? `?branchId=${branchId}` : '';
    api(`/admin/students${q}`).then(setRows);
  }, [branchId]);

  return (
    <>
      <div className="page-header">
        <h2>Students</h2>
        <p>All enrolled students</p>
      </div>
      <div className="filters">
        <select value={branchId} onChange={(e) => setBranchId(e.target.value)}>
          <option value="">All branches</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Admission</th>
              <th>Name</th>
              <th>Branch</th>
              <th>Section</th>
              <th>Bus</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="empty">No students in database.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id}>
                <td>{r.admissionNo}</td>
                <td>{r.name}</td>
                <td>{r.branch}</td>
                <td>{r.section}</td>
                <td>{r.busNumber || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
