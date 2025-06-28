import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { ToastProvider } from './components/ui/Toast';
import LandingPage from './components/pages/LandingPage';
import HomeFeed from './components/pages/HomeFeed';
import UpgradePage from './components/pages/UpgradePage';
import SettingsPage from './components/pages/Settings/SettingsPage'; // ✅ NEW IMPORT

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="connectify-theme">
      <ToastProvider> {/* ✅ NEW WRAPPER */}
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/home" element={<HomeFeed />} />
              <Route path="/upgrade" element={<UpgradePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </Router>
      </ToastProvider> {/* ✅ NEW WRAPPER */}
    </ThemeProvider>
  );
}

export default App;