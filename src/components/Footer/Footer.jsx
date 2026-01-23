import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-title">Contact Us</h3>
          <p className="footer-text">Have questions or feedback?</p>
          <p className="footer-text">Email: contact@housingmanager.com</p>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Housing Manager</h3>
          <p className="footer-text">
            Your centralized platform for finding and managing housing options.
          </p>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Quick Links</h3>
          <ul className="footer-links">
            <li><a href="#about">About</a></li>
            <li><a href="#listings">Listings</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 Housing Manager. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
