import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

/**
 * AuthRoute — lightweight guard that reads the token directly from localStorage
 * so it can be used both in the app and in tests with MemoryRouter.
 */
export function AuthRoute({ children, requireAuth }: { children: React.ReactNode; requireAuth: boolean }) {
  const token = localStorage.getItem('auth_token');
  const isAuthenticated = !!token;
  if (requireAuth && !isAuthenticated) return <Navigate to="/login" replace />;
  if (!requireAuth && isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

/** The route table used by both App (BrowserRouter) and tests (MemoryRouter). */
export function AppRoutes() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground">
      <Routes>
        <Route path="/login" element={<AuthRoute requireAuth={false}><Login /></AuthRoute>} />
        <Route path="/dashboard" element={<AuthRoute requireAuth={true}><Dashboard /></AuthRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
