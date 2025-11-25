import React from 'react';
import { Link } from 'react-router-dom';

const PlayerCard = ({ player, onCompare, isSelected }) => {
  const getRatingColor = (rating) => {
    if (rating >= 90) return '#00f2ea';
    if (rating >= 80) return '#00c2bb';
    if (rating >= 70) return '#eab308';
    return '#94a3b8';
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{player.short_name}</h3>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {player.player_position}
          </div>
        </div>
        <div style={{ 
          background: 'rgba(0,0,0,0.3)', 
          padding: '0.5rem', 
          borderRadius: '8px',
          textAlign: 'center',
          minWidth: '40px'
        }}>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: getRatingColor(player.overall) 
          }}>
            {player.overall}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>OVR</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Club:</span>
          <span>{player.club_name || 'Free Agent'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Nation:</span>
          <span>{player.nationality_name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>League:</span>
          <span>{player.league_name || 'N/A'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to={`/player/${player.player_id}`} className="btn btn-primary" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>
          View
        </Link>
        <button 
          className={`btn ${isSelected ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => onCompare(player)}
          style={{ padding: '0.75rem' }}
          title="Add to Compare"
        >
          {isSelected ? '✓' : '+'}
        </button>
      </div>
    </div>
  );
};

export default PlayerCard;
