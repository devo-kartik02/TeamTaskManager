import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import Sidebar from './components/Sidebar';
import KanbanBoard from './pages/KanbanBoard';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Protect routes
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const AppLayout = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="flex h-screen text-slate-100 overflow-hidden">
      {!isAuthPage && <Sidebar />}
      
      <main className={`flex-1 p-4 ${!isAuthPage ? 'overflow-y-auto' : ''}`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/board" 
            element={
              <PrivateRoute>
                <KanbanBoard />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/projects" 
            element={
              <PrivateRoute>
                <Projects />
              </PrivateRoute>
            } 
          />

          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" theme="dark" richColors />
      <AppLayout />
    </Router>
  );
}

export default App;
