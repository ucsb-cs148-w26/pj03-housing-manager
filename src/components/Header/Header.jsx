import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { handleCredentialResponse, signOut, getCurrentUser } from '../../utils/auth';
import './Header.css';

function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [user, setUser] = useState(getCurrentUser);
  const googleBtnRef = useRef(null);

  const onCredentialResponse = useCallback((response) => {
    const loggedInUser = handleCredentialResponse(response);
    if (loggedInUser) {
      setUser(loggedInUser);
    }
  }, []);

  useEffect(() => {
    if (user || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: onCredentialResponse,
    });

    if (googleBtnRef.current) {
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'medium',
      });
    }
  }, [user, onCredentialResponse]);

  const handleLogout = () => {
    signOut();
    setUser(null);
  };

  const handleNavClick = (e, targetId) => {
    if (!isHome) return;
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 70;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header className="header">
      <nav className="header-nav">
        <Link to="/" className="header-brand">Housing Manager</Link>
        <ul className="header-links">
          <li>
            <a href={isHome ? '#about' : '/#about'} onClick={(e) => handleNavClick(e, 'about')}>
              About
            </a>
          </li>
          <li>
            <a href={isHome ? '#listings' : '/#listings'} onClick={(e) => handleNavClick(e, 'listings')}>
              Listings
            </a>
          </li>
          <li>
            <a href={isHome ? '#all-listings' : '/#all-listings'} onClick={(e) => handleNavClick(e, 'all-listings')}>
              Browse All
            </a>
          </li>
          <li>
            <a href={isHome ? '#sublease' : '/#sublease'} onClick={(e) => handleNavClick(e, 'sublease')}>
              Sublease
            </a>
          </li>
          <li>
            <a href={isHome ? '#contact' : '/#contact'} onClick={(e) => handleNavClick(e, 'contact')}>
              Contact
            </a>
          </li>
          <li>
            <Link
              to="/admin/users"
              className={location.pathname.startsWith('/admin') ? 'active' : ''}
            >
              Admin
            </Link>
          </li>
        </ul>
        <div className="header-actions">
          <ThemeToggle />
          {user ? (
            <div className="header-user">
              {user.picture && (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="header-user-avatar"
                  referrerPolicy="no-referrer"
                />
              )}
              <span className="header-user-name">{user.name}</span>
              <button className="header-login-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div ref={googleBtnRef}></div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
