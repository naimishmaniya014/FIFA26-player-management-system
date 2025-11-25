import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const StatBar = ({ label, value, color = 'var(--primary)' }) => (
  <div style={{ marginBottom: '1rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontWeight: 'bold' }}>{value}</span>
    </div>
    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
      <div style={{ 
        width: `${value}%`, 
        height: '100%', 
        background: color, 
        borderRadius: '3px',
        transition: 'width 1s ease-out'
      }}></div>
    </div>
  </div>
);

const PlayerDetailsPage = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/players/${id}`);
        setPlayer(response.data);
      } catch (error) {
        console.error('Error fetching player details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [id]);

  if (loading) return <div className="loading-spinner"></div>;
  if (!player) return <div>Player not found</div>;

  return (
    <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
      <Link to="/" className="btn btn-outline" style={{ display: 'inline-block', marginBottom: '2rem', textDecoration: 'none' }}>
        ← Back to Search
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
        {/* Left Column: Basic Info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#0f172a'
            }}>
              {player.overall}
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '2.5rem' }}>{player.short_name}</h1>
              <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                {player.player_position} • {player.club_name}
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Personal Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nationality</div>
                <div>{player.nationality_name}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Age</div>
                <div>{player.age}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Height</div>
                <div>{player.height} cm</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Weight</div>
                <div>{player.weight} kg</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Preferred Foot</div>
                <div>{player.preferred_position}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Weak Foot</div>
                <div>{'★'.repeat(player.weak_foot)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stats */}
        <div>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Performance Stats</h3>
            <StatBar label="Pace" value={player.pace} color="#3b82f6" />
            <StatBar label="Shooting" value={player.shooting} color="#ef4444" />
            <StatBar label="Passing" value={player.passing} color="#22c55e" />
            <StatBar label="Dribbling" value={player.dribbling} color="#eab308" />
            <StatBar label="Defending" value={player.defending} color="#a855f7" />
            <StatBar label="Physical" value={player.physic} color="#f97316" />
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Contract Info</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Wage</div>
                <div style={{ fontSize: '1.2rem', color: '#22c55e' }}>€{player.wages?.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Release Clause</div>
                <div style={{ fontSize: '1.2rem', color: '#ef4444' }}>€{player.release_clause?.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetailsPage;
