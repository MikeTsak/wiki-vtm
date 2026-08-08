import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  
  // Logic to clear service workers and cache storage
  const handleClearCache = async () => {
    if (window.confirm('This will refresh the app and clear local caches to fix loading issues. Continue?')) {
      try {
        // 1. Unregister Service Workers
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }
        }
        
        // 2. Clear Cache Storage API
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map(key => caches.delete(key)));
        }

        // 3. Force Reload
        window.location.reload();
      } catch (e) {
        console.error("Cache clear failed", e);
        window.location.reload();
      }
    }
  };

  return (
    <footer id="wiki-footer" className="wiki-footer">
      <ul id="footer-info">
        <li id="footer-info-brand">
          Erebus Wiki by <a href="https://miketsak.gr" target="_blank" rel="noreferrer">MikeTsak</a> for Athens Through-Time — powered by <a href="https://cerebralproductions.eu/" target="_blank" rel="noreferrer">Cerebral Prod.</a>
        </li>
        <li id="footer-info-legal">
          Portions of the materials are copyrights and trademarks of Paradox Interactive AB, used with permission. All rights reserved. Visit <a href="https://www.worldofdarkness.com" target="_blank" rel="noreferrer">worldofdarkness.com</a>. 
          This is <b>unofficial fan content</b>, not approved or endorsed by Paradox Interactive. 
          Vampire: The Masquerade and World of Darkness are trademarks of Paradox Interactive AB.
        </li>
      </ul>

      <ul id="footer-places">
        <li><Link to="/terms">Terms</Link></li>
        <li><Link to="/privacy">Privacy</Link></li>
        <li>
          <button type="button" onClick={() => { localStorage.removeItem('cookie_consent'); window.location.reload(); }}>
            Cookies
          </button>
        </li>
        <li><Link to="/legal">Legal</Link></li>
        <li><a href="https://www.paradoxinteractive.com/games/world-of-darkness/community/dark-pack-agreement" target="_blank" rel="noreferrer">Dark Pack</a></li>
        <li><button type="button" onClick={handleClearCache} className="cache-btn">Clear Cache</button></li>
      </ul>

      <ul id="footer-icons">
        <li>
          <img src="/erebus-wiki-logo.png" alt="Erebus Wiki" className="footer-icon-img footer-logo" draggable="false" />
        </li>
        <li>
          <a href="https://cerebralproductions.eu/" target="_blank" rel="noreferrer">
            <img src="/img/cerebralproductions.png" alt="Cerebral Productions" className="footer-icon-img" draggable="false" />
          </a>
        </li>
        <li>
          <a href="https://www.paradoxinteractive.com/games/world-of-darkness/community/dark-pack-agreement" target="_blank" rel="noreferrer">
            <img src="/img/DarkPack_Logo2.png" alt="Dark Pack" className="footer-icon-img" draggable="false" />
          </a>
        </li>
      </ul>
      
      <div style={{ clear: 'both' }}></div>
    </footer>
  );
}
