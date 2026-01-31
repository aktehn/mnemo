import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { JSX, useEffect } from 'react';
import { useAppStore } from './store';
import { Loader2 } from 'lucide-react';
import DashboardView from './features/dashboard/DashboardView';
import AuthView from './features/auth/components/AuthView';
import Popup from './pages/Popup';
import { Toaster } from 'react-hot-toast';

const AuthGuard = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isAuthChecking } = useAppStore();

  if (isAuthChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F3F6F8]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAppStore();

  if (isLoading) {
    // Show spinner instead of nothing to prevent white flash
    return (
      <div className="flex h-screen items-center justify-center bg-[#F3F6F8]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}



function App() {
  const actions = useAppStore(state => state.actions);

  const settings = useAppStore(state => state.settings);

  useEffect(() => {
    actions.initializeAuthListener();
    actions.checkAuth();

    // Sync settings to Electron on startup
    if (window.electron?.updateSettings) {
      window.electron.updateSettings(settings);
    }
  }, []);

  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/popup" element={<Popup />} />
        <Route path="/auth" element={
          <PublicRoute>
            <AuthView />
          </PublicRoute>
        } />
        <Route path="/" element={
          <AuthGuard>
            <DashboardView />
          </AuthGuard>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
