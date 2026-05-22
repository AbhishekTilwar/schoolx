import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Fees() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api('/admin/fees').then(setRows);
  }, []);

  return (
    <>
      <div className="page-header">
        <h2>Fee invoices</h2>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Title</th><th>Amount</th><th>Due</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.title}</td>
                <td>₹{r.amount}</td>
                <td>{r.dueDate?.slice?.(0, 10) || r.dueDate}</td>
                <td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
