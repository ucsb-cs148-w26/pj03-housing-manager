import { Link, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  const handleNavClick = (e, targetId) => {
    if (!isHome) return; // Let the <a href> navigate to /#section
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
        <button className="header-login-btn">Login</button>
      </nav>
    </header>
  );
}

export default Header;
