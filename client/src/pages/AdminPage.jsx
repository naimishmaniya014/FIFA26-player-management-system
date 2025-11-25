import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminPage = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPlayers = async (search = '') => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/api/players/search?name=${search}&limit=50`);
      setPlayers(response.data);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this player? This action cannot be undone.')) return;
    
    try {
      await axios.delete(`http://localhost:3000/api/players/${id}`);
      setPlayers(players.filter(p => p.player_id !== id));
      alert('Player deleted successfully');
    } catch (error) {
      console.error('Error deleting player:', error);
      alert('Failed to delete player');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPlayers(searchTerm);
  };

  return (
    <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="text-gradient" style={{ margin: 0 }}>Admin Dashboard</h1>
        <Link to="/admin/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          + Add New Player
        </Link>
      </div>

      <form onSubmit={handleSearch} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <input 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name..."
          style={{ maxWidth: '300px' }}
        />
        <button type="submit" className="btn btn-outline">Search</button>
      </form>

      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Position</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Club</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Overall</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.map(player => (
                <tr key={player.player_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>{player.player_id}</td>
                  <td style={{ padding: '1rem' }}>{player.short_name}</td>
                  <td style={{ padding: '1rem' }}>{player.player_position}</td>
                  <td style={{ padding: '1rem' }}>{player.club_name}</td>
                  <td style={{ padding: '1rem' }}>{player.overall}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <Link to={`/admin/edit/${player.player_id}`} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', textDecoration: 'none' }}>
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(player.player_id)}
                      className="btn"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.5)' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
