import React from 'react';

const GRASS_STRIP = `repeating-linear-gradient(
  90deg,
  #4a7c59 0px, #4a7c59 16px,
  #3d6b4a 16px, #3d6b4a 32px
)`;
const DIRT_STRIP = `repeating-linear-gradient(
  90deg,
  #8b6914 0px, #8b6914 16px,
  #7a5c0f 16px, #7a5c0f 32px
)`;

export function Footer() {
  return (
    <footer style={{ background: '#0d0d0d', marginTop: 'auto', position: 'relative' }}>
      {/* Grass ground decoration */}
      <div style={{ height: '8px', background: GRASS_STRIP }} />
      <div style={{ height: '8px', background: DIRT_STRIP }} />
      <div style={{ height: '4px', background: '#5a3800' }} />

      {/* Top border */}
      <div style={{ height: '3px', background: '#000' }} />

      {/* Footer content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px 16px 24px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Left: Logo + credit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px', filter: 'drop-shadow(2px 2px 0 #000)' }}>⛏️</span>
          <div>
            <div style={{
              fontFamily: '"Press Start 2P", cursive',
              fontSize: '9px',
              color: '#555',
              lineHeight: 1.8,
              letterSpacing: '0.04em',
            }}>
              TRUTHLENS © 2026
            </div>
            <div style={{
              fontFamily: '"Press Start 2P", cursive',
              fontSize: '8px',
              color: '#333',
            }}>
              FORGED AT ACEHACK 5.0
            </div>
          </div>
        </div>

        {/* Center: Tech stack badges */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['REACT', 'TAILWIND', 'GEMINI 2.0 FLASH', 'VITE'].map(tech => (
            <div key={tech} style={{
              background: '#1a1a1a',
              border: '2px solid #333',
              boxShadow: 'inset 2px 2px 0 rgba(0,0,0,0.8)',
              padding: '3px 8px',
              fontFamily: '"Press Start 2P", cursive',
              fontSize: '7px',
              color: '#3a3a3a',
            }}>
              {tech}
            </div>
          ))}
        </div>

        {/* Right: Links */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a
            href="https://github.com/TarunTheDev/truthlens-ai"
            target="_blank"
            rel="noreferrer"
            style={{
              fontFamily: '"Press Start 2P", cursive',
              fontSize: '8px',
              color: '#333',
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#333')}
          >
            [ GITHUB ]
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            style={{
              fontFamily: '"Press Start 2P", cursive',
              fontSize: '8px',
              color: '#333',
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#333')}
          >
            [ TWITTER ]
          </a>
        </div>
      </div>

      {/* Bottom rainbow strip */}
      <div style={{
        height: '3px',
        background: 'repeating-linear-gradient(90deg, #4a7c59 0px, #4a7c59 32px, #8b6914 32px, #8b6914 64px, #7a7a7a 64px, #7a7a7a 96px, #4dd9e0 96px, #4dd9e0 128px)',
      }} />
    </footer>
  );
}
