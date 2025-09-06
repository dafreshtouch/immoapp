import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BarChart3, DollarSign, Calendar, Image, Settings, LogIn, LogOut, User, Share2, FileText, Hammer, Building2, TrendingUp, Building, Menu, X, Package, Globe } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from './AuthModal';
import { ProfileModal } from './ProfileModal';
import './Navigation.css';

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'marketing' | 'immobilier' | 'stock' | 'market'>('marketing');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const marketingItems = [
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/budget', icon: DollarSign, label: 'Budget' },
    { path: '/campaigns', icon: TrendingUp, label: 'Campagnes' },
    { path: '/calendar', icon: Calendar, label: 'Calendrier' },
    { path: '/homestaging', icon: Hammer, label: 'Home Staging' },
    { path: '/media', icon: Image, label: 'Média' },
    { path: '/social', icon: Share2, label: 'Réseaux Sociaux' },
  ];

  const immobilierItems = [
    { path: '/projets', icon: Building, label: 'Projets' },
    { path: '/gestion', icon: Building2, label: 'Gestion' },
    { path: '/quotes', icon: FileText, label: 'Devis' },
    { path: '/settings', icon: Settings, label: 'Paramètres' },
  ];

  const stockItems = [
    { path: '/supports', icon: Package, label: 'Supports' },
  ];

  const marketItems = [
    { path: '/globaltrade', icon: Globe, label: 'Global Trade' },
  ];

  // Determine active section based on current path
  React.useEffect(() => {
    const marketingPaths = marketingItems.map(item => item.path);
    const immobilierPaths = immobilierItems.map(item => item.path);
    const stockPaths = stockItems.map(item => item.path);
    const marketPaths = marketItems.map(item => item.path);
    
    if (marketingPaths.includes(location.pathname)) {
      setActiveSection('marketing');
    } else if (immobilierPaths.includes(location.pathname)) {
      setActiveSection('immobilier');
    } else if (stockPaths.includes(location.pathname)) {
      setActiveSection('stock');
    } else if (marketPaths.includes(location.pathname)) {
      setActiveSection('market');
    }
  }, [location.pathname]);

  const getCurrentItems = () => {
    if (activeSection === 'marketing') return marketingItems;
    if (activeSection === 'immobilier') return immobilierItems;
    if (activeSection === 'stock') return stockItems;
    if (activeSection === 'market') return marketItems;
    return marketingItems;
  };

  const handleAuthClick = () => {
    if (user) {
      logout();
    } else {
      setAuthMode('login');
      setIsAuthModalOpen(true);
    }
  };

  const handleSectionChange = (section: 'marketing' | 'immobilier' | 'stock' | 'market') => {
    setActiveSection(section);
    localStorage.setItem('activeSection', section);
    
    // Redirect to appropriate dashboard
    if (section === 'marketing') {
      navigate('/');
    } else if (section === 'immobilier') {
      navigate('/');
    } else if (section === 'stock') {
      navigate('/supports');
    } else if (section === 'market') {
      navigate('/globaltrade');
    }
    
    // Dispatch custom event to notify Home component
    window.dispatchEvent(new CustomEvent('sectionChanged', { detail: section }));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      />
      
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <img src="/immoteplogo.png" alt="Immotep Logo" className="sidebar-logo" />
          <h1>Immotep</h1>
        </div>
        
        {/* Home Link */}
        <div className="sidebar-home">
          <Link
            to="/"
            className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <Home size={20} />
            <span>Accueil</span>
          </Link>
        </div>
        
        {/* Dynamic Navigation Links */}
        <div className="sidebar-links">
          {getCurrentItems().map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`sidebar-link ${location.pathname === path ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </div>

      </aside>

      {/* Top Header with Section Tabs */}
      <header className="top-header">
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        <div className="section-tabs">
          <button
            className={`section-tab ${activeSection === 'marketing' ? 'active' : ''}`}
            onClick={() => handleSectionChange('marketing')}
          >
            <TrendingUp size={18} />
            <span>Marketing</span>
          </button>
          <button
            className={`section-tab ${activeSection === 'immobilier' ? 'active' : ''}`}
            onClick={() => handleSectionChange('immobilier')}
          >
            <Building size={18} />
            <span>Immobilier</span>
          </button>
          <button
            className={`section-tab ${activeSection === 'stock' ? 'active' : ''}`}
            onClick={() => handleSectionChange('stock')}
          >
            <Package size={18} />
            <span>Stock</span>
          </button>
          <button
            className={`section-tab ${activeSection === 'market' ? 'active' : ''}`}
            onClick={() => handleSectionChange('market')}
          >
            <Globe size={18} />
            <span>Market</span>
          </button>
        </div>

        {/* User Profile in Top Right */}
        <div className="header-user">
          {user ? (
            <div className="header-user-menu">
              <div 
                className="header-user-info"
                onClick={() => setIsProfileModalOpen(true)}
              >
                <User size={18} />
                <span className="header-user-name">
                  {user.displayName ? user.displayName.split(' ')[0] : user.email?.split('@')[0]}
                </span>
              </div>
              <button className="header-logout-btn" onClick={handleAuthClick}>
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button className="header-auth-btn" onClick={handleAuthClick}>
              <LogIn size={18} />
              <span>Connexion</span>
            </button>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
      
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
}
