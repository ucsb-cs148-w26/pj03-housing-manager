import { useState, useEffect, useRef } from 'react';
import './AboutSection.css';
import backgroundImage from '../../assets/james_gelb_iv_properties.webp';

function AboutSection() {
  const [typedText, setTypedText] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const titleText = 'About Housing Manager';

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= titleText.length) {
        setTypedText(titleText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setShowDescription(true);
      }
    }, 40);

    return () => clearInterval(typingInterval);
  }, [isVisible]);

  useEffect(() => {
    if (showDescription) {
      const timer = setTimeout(() => {
        setShowFeatures(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [showDescription]);

  return (
    <section className="about-section" ref={sectionRef} style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="about-content">
        <h2 className="about-title">
          {typedText}
          {!showDescription && <span className="typing-cursor">|</span>}
        </h2>
        <p className={`about-description ${showDescription ? 'waterfall-visible' : ''}`}>
          Housing Manager is a centralized platform designed to help students and community
          members find their perfect housing. Browse listings from multiple leasing companies,
          connect with potential roommates, and manage your housing search all in one place.
        </p>
        <div className="about-features">
          <div className={`about-feature ${showFeatures ? 'slide-in' : ''}`} style={{ animationDelay: '0s' }}>
            <h3>Search & Filter</h3>
            <p>Find housing that fits your needs with powerful search and filtering options.</p>
          </div>
          <div className={`about-feature ${showFeatures ? 'slide-in' : ''}`} style={{ animationDelay: '0.15s' }}>
            <h3>Connect</h3>
            <p>Chat with others about rooming together or subleasing opportunities.</p>
          </div>
          <div className={`about-feature ${showFeatures ? 'slide-in' : ''}`} style={{ animationDelay: '0.3s' }}>
            <h3>Stay Organized</h3>
            <p>Save listings and manage your housing applications in one convenient location.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
