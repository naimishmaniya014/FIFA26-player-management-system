import React from 'react';
import { Link } from 'react-router-dom';

const WelcomePage = () => {
    return (
        <div className="glass" style={{
            padding: '4rem 2rem',
            borderRadius: '16px',
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto',
            marginTop: '4rem'
        }}>
            <h1 className="text-gradient" style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>
                FIFA 26 MANAGER
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '3rem', lineHeight: '1.6' }}>
                The ultimate tool for managing your dream team. Scout players, compare stats, and build your legacy.
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                <Link to="/search" className="btn btn-primary" style={{
                    padding: '1rem 2.5rem',
                    fontSize: '1.2rem',
                    textDecoration: 'none'
                }}>
                    Start Searching
                </Link>
            </div>
        </div>
    );
};

export default WelcomePage;
