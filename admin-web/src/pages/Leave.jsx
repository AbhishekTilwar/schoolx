import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Leave() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api('/admin/leave').then(setRows);
  }, []);

  return (
    <>
      <div className="page-header">
        <h2>Leave requests</h2>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>From</th><th>To</th><th>Reason</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.fromDate?.slice?.(0, 10) || r.fromDate}</td>
                <td>{r.toDate?.slice?.(0, 10) || r.toDate}</td>
                <td>{r.reason}</td>
                <td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
