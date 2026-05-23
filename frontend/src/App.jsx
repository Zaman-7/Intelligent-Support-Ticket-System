import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Activity, LogOut, Ticket, LayoutDashboard } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPortal from './pages/LoginPortal';
import Login from './pages/Login';
import Profile from './pages/Profile';
import CustomerDashboard from './pages/CustomerDashboard';
import AgentDashboard from './pages/AgentDashboard';
import TicketDetail from './pages/TicketDetail';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse font-medium">Loading system...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const Header = () => {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 glass-panel !rounded-none !border-x-0 !border-t-0 px-8 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md">
      <Link to="/" className="flex items-center gap-2 text-slate-800 font-bold text-xl hover:text-blue-600 transition-colors">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
          <Activity size={20} />
        </div>
        IntelliDesk
      </Link>
      <div className="flex items-center gap-6">
        <Link to="/profile" className="flex items-center gap-3 bg-slate-50 py-1.5 px-3 rounded-full border border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-colors group">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-xs font-bold flex text-blue-700 items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            {user.username.substring(0, 1).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-slate-600 group-hover:text-blue-700 hidden sm:block transition-colors">
            {user.username} <span className="text-slate-400 font-normal group-hover:text-blue-400 transition-colors">({user.role})</span>
          </span>
        </Link>
        <button onClick={logout} className="text-slate-500 hover:text-red-500 transition-colors flex gap-2 items-center text-sm font-medium">
          <LogOut size={16} /> <span className="hidden sm:block">Sign out</span>
        </button>
      </div>
    </header>
  );
};

const RoleBasedDashboard = () => {
  const { user } = useAuth();
  if (user?.role === 'Customer') return <CustomerDashboard />;
  if (user?.role === 'Agent') return <AgentDashboard />;
  if (user?.role === 'Admin') return <AdminDashboard />;
  return <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col items-center w-full relative">
      <Header />
      <main className="flex-1 w-full relative z-10">
        <Routes>
          <Route path="/login" element={<LoginPortal />} />
          <Route path="/login/customer" element={<Login isStaff={false} />} />
          <Route path="/login/staff" element={<Login isStaff={true} />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/" element={<ProtectedRoute><RoleBasedDashboard /></ProtectedRoute>} />
          <Route path="/ticket/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
