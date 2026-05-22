import { Routes, Route, Navigate } from 'react-router-dom';
import { getToken } from './api';
import Login from './pages/Login';
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import ContentHub from './pages/ContentHub';
import ContentCreate from './pages/ContentCreate';
import Leave from './pages/Leave';
import Fees from './pages/Fees';
import Buses from './pages/Buses';

function PrivateRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="content" element={<ContentHub />} />
        <Route path="content/new" element={<ContentCreate />} />
        <Route path="leave" element={<Leave />} />
        <Route path="fees" element={<Fees />} />
        <Route path="buses" element={<Buses />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
