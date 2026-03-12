import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppStore } from './store';
import DashboardView from './features/dashboard/DashboardView';
import Popup from './pages/Popup';
import { Toaster } from 'react-hot-toast';

function App() {
  const settings = useAppStore(state => state.settings);

  useEffect(() => {
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
        <Route path="/" element={<DashboardView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
