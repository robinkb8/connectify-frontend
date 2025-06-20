import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/pages/LandingPage';
import HomeFeed from './components/pages/HomeFeed';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomeFeed />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;