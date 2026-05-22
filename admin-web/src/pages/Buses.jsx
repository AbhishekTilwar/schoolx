import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Buses() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/transport/buses')
      .then(setRows)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <div className="page-header">
        <h2>Transport / Buses</h2>
        <p>Buses loaded from database (bus_routes table)</p>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Bus number</th>
              <th>Route</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Speed</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty">
                  No buses in database. Add records via seed or SQL.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.busNumber}</td>
                  <td>{r.routeName}</td>
                  <td>{r.latitude}</td>
                  <td>{r.longitude}</td>
                  <td>{r.speed}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
