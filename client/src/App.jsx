import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PlayerDetailsPage from './pages/PlayerDetailsPage';
import ComparePage from './pages/ComparePage';
import AdminPage from './pages/AdminPage';
import PlayerFormPage from './pages/PlayerFormPage';
import WelcomePage from './pages/WelcomePage';
import './styles/index.css';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar glass">
      <Link to="/" className="nav-brand">FIFA 26 MANAGER</Link>
      <div className="nav-links">
        <Link to="/search" className={location.pathname === '/search' ? 'active' : ''}>Search</Link>
        <Link to="/compare" className={location.pathname === '/compare' ? 'active' : ''}>Compare</Link>
        <Link to="/admin" className={location.pathname.startsWith('/admin') ? 'active' : ''}>Admin</Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/search" element={<HomePage />} />
          <Route path="/player/:id" element={<PlayerDetailsPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/new" element={<PlayerFormPage />} />
          <Route path="/admin/edit/:id" element={<PlayerFormPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
