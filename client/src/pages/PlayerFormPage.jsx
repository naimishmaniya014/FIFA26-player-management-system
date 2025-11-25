import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';

const PlayerFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    Short_name: '',
    Player_position: '',
    Nationality_id: '',
    Club_team_id: '',
    Overall: '',
    Age: '',
    Height: '',
    Weight: '',
    Preferred_Position: '',
    Weak_foot: '',
    Pace: '',
    Shooting: '',
    Passing: '',
    Dribbling: '',
    Defending: '',
    Physic: ''
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchPlayer = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/api/players/${id}`);
          const p = response.data;
          setFormData({
            Short_name: p.short_name || '',
            Player_position: p.player_position || '',
            Nationality_id: p.nationality_id || '',
            Club_team_id: p.club_team_id || '',
            Overall: p.overall || '',
            Age: p.age || '',
            Height: p.height || '',
            Weight: p.weight || '',
            Preferred_Position: p.preferred_position || '',
            Weak_foot: p.weak_foot || '',
            Pace: p.pace || '',
            Shooting: p.shooting || '',
            Passing: p.passing || '',
            Dribbling: p.dribbling || '',
            Defending: p.defending || '',
            Physic: p.physic || ''
          });
        } catch (error) {
          console.error('Error fetching player:', error);
          alert('Error loading player data');
        } finally {
          setLoading(false);
        }
      };
      fetchPlayer();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        Nationality_id: parseInt(formData.Nationality_id) || null,
        Club_team_id: parseInt(formData.Club_team_id) || null,
        Overall: parseInt(formData.Overall) || 0,
        Age: parseInt(formData.Age) || 0,
        Height: parseFloat(formData.Height) || 0,
        Weight: parseFloat(formData.Weight) || 0,
        Weak_foot: parseInt(formData.Weak_foot) || 1,
        Pace: parseInt(formData.Pace) || 0,
        Shooting: parseInt(formData.Shooting) || 0,
        Passing: parseInt(formData.Passing) || 0,
        Dribbling: parseInt(formData.Dribbling) || 0,
        Defending: parseInt(formData.Defending) || 0,
        Physic: parseInt(formData.Physic) || 0,
      };

      if (isEditMode) {
        await axios.put(`http://localhost:3000/api/players/${id}`, payload);
        alert('Player updated successfully');
      } else {
        await axios.post('http://localhost:3000/api/players', payload);
        alert('Player created successfully');
      }
      navigate('/admin');
    } catch (error) {
      console.error('Error saving player:', error);
      alert('Failed to save player');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div className="glass" style={{ padding: '2rem', borderRadius: '16px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="text-gradient" style={{ margin: 0 }}>{isEditMode ? 'Edit Player' : 'New Player'}</h1>
        <Link to="/admin" className="btn btn-outline" style={{ textDecoration: 'none' }}>Cancel</Link>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Basic Info</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Name</label>
              <input name="Short_name" value={formData.Short_name} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Position</label>
              <input name="Player_position" value={formData.Player_position} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Overall Rating</label>
              <input type="number" name="Overall" value={formData.Overall} onChange={handleChange} required min="0" max="99" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Club ID</label>
              <input type="number" name="Club_team_id" value={formData.Club_team_id} onChange={handleChange} placeholder="e.g. 10" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nationality ID</label>
              <input type="number" name="Nationality_id" value={formData.Nationality_id} onChange={handleChange} placeholder="e.g. 50" />
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Age</label>
              <input type="number" name="Age" value={formData.Age} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Height (cm)</label>
              <input type="number" name="Height" value={formData.Height} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Weight (kg)</label>
              <input type="number" name="Weight" value={formData.Weight} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Preferred Foot</label>
              <select name="Preferred_Position" value={formData.Preferred_Position} onChange={handleChange} style={{ width: '100%' }}>
                <option value="">Select...</option>
                <option value="Right">Right</option>
                <option value="Left">Left</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Weak Foot (1-5)</label>
              <input type="number" name="Weak_foot" value={formData.Weak_foot} onChange={handleChange} min="1" max="5" />
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Pace</label>
              <input type="number" name="Pace" value={formData.Pace} onChange={handleChange} min="0" max="99" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Shooting</label>
              <input type="number" name="Shooting" value={formData.Shooting} onChange={handleChange} min="0" max="99" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Passing</label>
              <input type="number" name="Passing" value={formData.Passing} onChange={handleChange} min="0" max="99" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Dribbling</label>
              <input type="number" name="Dribbling" value={formData.Dribbling} onChange={handleChange} min="0" max="99" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Defending</label>
              <input type="number" name="Defending" value={formData.Defending} onChange={handleChange} min="0" max="99" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Physical</label>
              <input type="number" name="Physic" value={formData.Physic} onChange={handleChange} min="0" max="99" />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%', padding: '1rem' }}>
          {saving ? 'Saving...' : (isEditMode ? 'Update Player' : 'Create Player')}
        </button>
      </form>
    </div>
  );
};

export default PlayerFormPage;
