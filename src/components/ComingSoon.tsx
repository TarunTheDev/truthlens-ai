import React, { useState } from 'react';
import { useToast } from '../lib/context';
import { playClick } from '../lib/audio';

export function ComingSoon() {
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const handleJoin = () => {
    if (!email.includes('@') || !email.includes('.')) {
      showToast('INVALID EMAIL FORMAT!', 'error');
      playClick();
      return;
    }
    setEmail('');
    showToast('ADDED TO BETA LIST! \u2764', 'success');
    playClick();
  };

  return (
    <section className="max-w-4xl mx-auto px-4 mb-16">
      <div
        style={{
          background: '#1a1a2a',
          border: '3px solid #000',
          boxShadow: 'inset 3px 3px 0 rgba(77,217,224,0.12), inset -3px -3px 0 rgba(0,0,0,0.6)',
          padding: '32px 24px',
          textAlign: 'center',
        }}
      >
        {/* Blinking announcement bar */}
        <div style={{
          background: '#111',
          border: '2px solid #4dd9e0',
          padding: '6px 16px',
          display: 'inline-block',
          marginBottom: '16px',
          fontFamily: '"Press Start 2P", cursive',
          fontSize: '8px',
          color: '#4dd9e0',
          letterSpacing: '0.1em',
          animation: 'flicker 2s infinite',
        }}>
          ✨ NEW MOD ANNOUNCEMENT ✨
        </div>

        <h3 style={{
          fontFamily: '"Press Start 2P", cursive',
          fontSize: 'clamp(12px, 2.5vw, 18px)',
          color: '#fff',
          marginBottom: '10px',
          textShadow: '3px 3px 0 #000',
          lineHeight: 1.5,
        }}>
          COMING SOON:
          <br />
          <span style={{ color: '#4dd9e0' }}>TRUTHLENS CHROME MOD</span>
        </h3>

        <p style={{
          fontFamily: '"Press Start 2P", cursive',
          fontSize: '9px',
          color: '#555',
          marginBottom: '24px',
          lineHeight: 2,
          maxWidth: '480px',
          margin: '0 auto 24px',
        }}>
          AUDIT AI TEXT ANYWHERE ON THE WEB.
          <br />
          HIGHLIGHT &amp; FACT-CHECK DIRECTLY IN YOUR BROWSER.
          <br />
          BADGES ON EVERY WEBPAGE.
        </p>

        {/* Features list */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {['GMAIL', 'GOOGLE DOCS', 'TWITTER', 'REDDIT', 'NEWS SITES'].map(item => (
            <div key={item} style={{
              background: '#111',
              border: '2px solid #333',
              padding: '4px 8px',
              fontFamily: '"Press Start 2P", cursive',
              fontSize: '8px',
              color: '#4dd9e0',
            }}>✔ {item}</div>
          ))}
        </div>

        {/* Email signup */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', maxWidth: '480px', margin: '0 auto' }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
            placeholder="ENTER EMAIL..."
            className="mc-input"
            style={{
              flex: 1,
              minWidth: '200px',
              textAlign: 'center',
              fontSize: '10px',
              padding: '10px 14px',
            }}
            aria-label="Email for beta signup"
          />
          <button
            className="mc-button-green"
            onClick={handleJoin}
            style={{ padding: '10px 16px', fontSize: '10px', whiteSpace: 'nowrap' }}
          >
            [ JOIN BETA ]
          </button>
        </div>
      </div>
    </section>
  );
}
