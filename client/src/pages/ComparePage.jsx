import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ComparePage = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComparedPlayers = async () => {
      const saved = localStorage.getItem('compareList');
      if (!saved) {
        setLoading(false);
        return;
      }

      const savedList = JSON.parse(saved);
      if (savedList.length === 0) {
        setLoading(false);
        return;
      }

      const ids = savedList.map(p => p.player_id).join(',');
      try {
        const response = await axios.get(`http://localhost:3000/api/players/compare/data?ids=${ids}`);
        setPlayers(response.data);
      } catch (error) {
        console.error('Error fetching comparison data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComparedPlayers();
  }, []);

  const removeFromCompare = (id) => {
    const newList = players.filter(p => p.player_id !== id);
    setPlayers(newList);
    
    // Update local storage
    const saved = JSON.parse(localStorage.getItem('compareList') || '[]');
    const newSaved = saved.filter(p => p.player_id !== id);
    localStorage.setItem('compareList', JSON.stringify(newSaved));
  };

  if (loading) return <div className="loading-spinner"></div>;

  if (players.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2 className="text-gradient">No players to compare</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Go back to the search page and select players to compare.
        </p>
        <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          Find Players
        </Link>
      </div>
    );
  }

  const stats = [
    { key: 'overall', label: 'Overall Rating' },
    { key: 'pace', label: 'Pace' },
    { key: 'shooting', label: 'Shooting' },
    { key: 'passing', label: 'Passing' },
    { key: 'dribbling', label: 'Dribbling' },
    { key: 'defending', label: 'Defending' },
    { key: 'physic', label: 'Physical' },
    { key: 'age', label: 'Age' },
    { key: 'height', label: 'Height (cm)' },
    { key: 'weight', label: 'Weight (kg)' },
  ];

  const getBestValue = (key) => {
    return Math.max(...players.map(p => p[key] || 0));
  };

  return (
    <div className="glass" style={{ padding: '2rem', borderRadius: '16px', overflowX: 'auto' }}>
      <h1 className="text-gradient" style={{ marginBottom: '2rem', textAlign: 'center' }}>Player Comparison</h1>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>Attribute</th>
            {players.map(player => (
              <th key={player.player_id} style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', minWidth: '150px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ fontSize: '1.2rem' }}>{player.short_name}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                    {player.player_position}
                  </div>
                  <button 
                    onClick={() => removeFromCompare(player.player_id)}
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      color: '#ef4444', 
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Remove
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {stats.map(stat => {
            const best = getBestValue(stat.key);
            return (
              <tr key={stat.key}>
                <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                  {stat.label}
                </td>
                {players.map(player => (
                  <td key={player.player_id} style={{ 
                    padding: '1rem', 
                    textAlign: 'center', 
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    fontWeight: (player[stat.key] === best && best > 0) ? 'bold' : 'normal',
                    color: (player[stat.key] === best && best > 0) ? 'var(--primary)' : 'inherit'
                  }}>
                    {player[stat.key] || '-'}
                  </td>
                ))}
              </tr>
            );
          })}
          <tr>
            <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Club</td>
            {players.map(player => (
              <td key={player.player_id} style={{ padding: '1rem', textAlign: 'center' }}>
                {player.club_name}
              </td>
            ))}
          </tr>
          <tr>
            <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Nationality</td>
            {players.map(player => (
              <td key={player.player_id} style={{ padding: '1rem', textAlign: 'center' }}>
                {player.nationality_name}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ComparePage;
