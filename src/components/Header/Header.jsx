import './Header.css';

function Header() {
  const handleNavClick = (e, targetId) => {
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
        <div className="header-brand">Housing Manager</div>
        <ul className="header-links">
          <li>
            <a href="#about" onClick={(e) => handleNavClick(e, 'about')}>
              About
            </a>
          </li>
          <li>
            <a href="#listings" onClick={(e) => handleNavClick(e, 'listings')}>
              Listings
            </a>
          </li>
          <li>
            <a href="#sublease" onClick={(e) => handleNavClick(e, 'sublease')}>
              Sublease
            </a>
          </li>
          <li>
            <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')}>
              Contact
            </a>
          </li>
        </ul>
        <button className="header-login-btn">Login</button>
      </nav>
    </header>
  );
}

export default Header;
