import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Planner from './pages/Planner';
import Heritage from './pages/Heritage';
import Safety from './pages/Safety';
import MapPage from './pages/Map';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import InstallPrompt from './components/InstallPrompt';   

function PrivateRoute({ children }) {
  if (!localStorage.getItem('token')) {
    return <Navigate to="/login" state={{ message: 'Please sign in first to access this page.' }} />;
  }
  return children;
}

function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!localStorage.getItem('token') || !user.isAdmin) {
    return <Navigate to="/login" />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#fff8f4', color: '#1f1b17', border: '1px solid #e0c0b1', fontFamily: 'Manrope' }
      }} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
        <Route path="/planner" element={<PrivateRoute><Planner /></PrivateRoute>} />
        <Route path="/heritage" element={<PrivateRoute><Heritage /></PrivateRoute>} />
        <Route path="/safety" element={<PrivateRoute><Safety /></PrivateRoute>} />
        <Route path="/map" element={<PrivateRoute><MapPage /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>
      <InstallPrompt />  
    </BrowserRouter>
  );
}