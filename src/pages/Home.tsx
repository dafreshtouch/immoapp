import React, { useState, useEffect } from 'react';
import { MarketingDashboard } from '../components/MarketingDashboard';
import { ImmobilierDashboard } from '../components/ImmobilierDashboard';
import { useAuth } from '../hooks/useAuth';
import './Home.css';

export function Home() {
  const [activeSection, setActiveSection] = useState<'marketing' | 'immobilier'>('marketing');

  // Determine active section based on current navigation state
  useEffect(() => {
    // Get the active section from localStorage or URL params if needed
    const savedSection = localStorage.getItem('activeSection') as 'marketing' | 'immobilier';
    if (savedSection) {
      setActiveSection(savedSection);
    }
  }, []);

  // Listen for section changes from Navigation component
  useEffect(() => {
    const handleSectionChange = (event: CustomEvent) => {
      setActiveSection(event.detail);
    };

    window.addEventListener('sectionChanged', handleSectionChange as EventListener);
    return () => {
      window.removeEventListener('sectionChanged', handleSectionChange as EventListener);
    };
  }, []);

  return (
    <div className="home-container">
      {activeSection === 'marketing' ? <MarketingDashboard /> : <ImmobilierDashboard />}
    </div>
  );
}
