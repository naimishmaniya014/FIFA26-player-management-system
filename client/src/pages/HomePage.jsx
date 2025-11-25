import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PlayerCard from '../components/PlayerCard';

const HomePage = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    league: '',
    club: '',
    position: ''
  });
  const [compareList, setCompareList] = useState([]);

  // Load compare list from local storage
  useEffect(() => {
    const saved = localStorage.getItem('compareList');
    if (saved) {
      setCompareList(JSON.parse(saved));
    }
  }, []);

  const searchPlayers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.name) params.append('name', filters.name);
      if (filters.league) params.append('league', filters.league);
      if (filters.club) params.append('club', filters.club);
      if (filters.position) params.append('position', filters.position);
      
      const response = await axios.get(`http://localhost:3000/api/players/search?${params.toString()}`);
      setPlayers(response.data);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    searchPlayers();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchPlayers();
  };

  const toggleCompare = (player) => {
    let newList;
    if (compareList.find(p => p.player_id === player.player_id)) {
      newList = compareList.filter(p => p.player_id !== player.player_id);
    } else {
      if (compareList.length >= 4) {
        alert('You can compare up to 4 players');
        return;
      }
      newList = [...compareList, player];
    }
    setCompareList(newList);
    localStorage.setItem('compareList', JSON.stringify(newList));
  };

  return (
    <div>
      <div className="glass" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
        <h1 className="text-gradient" style={{ marginBottom: '2rem', textAlign: 'center' }}>Find Players</h1>
        
        <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <input 
            name="name" 
            placeholder="Player Name" 
            value={filters.name}
            onChange={handleFilterChange}
          />
          <input 
            name="position" 
            placeholder="Position (e.g. ST, CM)" 
            value={filters.position}
            onChange={handleFilterChange}
          />
          <input 
            name="club" 
            placeholder="Club" 
            value={filters.club}
            onChange={handleFilterChange}
          />
          <input 
            name="league" 
            placeholder="League" 
            value={filters.league}
            onChange={handleFilterChange}
          />
          <button type="submit" className="btn btn-primary" style={{ height: '100%' }}>
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <div className="grid">
          {[...players].sort((a, b) => {
            const aSelected = !!compareList.find(p => p.player_id === a.player_id);
            const bSelected = !!compareList.find(p => p.player_id === b.player_id);
            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;
            return 0;
          }).map(player => (
            <PlayerCard 
              key={player.player_id} 
              player={player} 
              onCompare={toggleCompare}
              isSelected={!!compareList.find(p => p.player_id === player.player_id)}
            />
          ))}
        </div>
      )}
      
      {players.length === 0 && !loading && (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
          No players found. Try adjusting your filters.
        </div>
      )}
    </div>
  );
};

export default HomePage;
