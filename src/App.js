// ===== REPLACE src/App.js =====
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/providers/ThemeProvider';
import LandingPage from './components/pages/LandingPage';
import HomeFeed from './components/pages/HomeFeed';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="connectify-theme">
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<HomeFeed />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;