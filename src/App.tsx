import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Analytics } from './pages/Analytics';
import { Budget } from './pages/Budget';
import { Calendar } from './pages/Calendar';
import { Campaigns } from './pages/Campaigns';
import { Supports } from './pages/Supports';
import { GlobalTrade } from './pages/GlobalTrade';
import { Quotes } from './pages/Quotes';
import { HomeStaging } from './pages/HomeStaging';
import { Media } from './pages/Media';
import { SocialMedia } from './pages/SocialMedia';
import { Settings } from './pages/Settings';
import Gestion from './pages/Gestion';
import ProjectsNew from './pages/ProjectsNew';
import ProjectDetail from './pages/ProjectDetail';
import UnitDetail from './pages/UnitDetail';
import { Navigation } from './components/Navigation';
import { Chatbot } from './components/Chatbot';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import { TourProvider } from './contexts/TourContext';
import { TourGuide } from './components/TourGuide';
import { TourButton } from './components/TourButton';
import './App.css';
import './styles/themes.css';
import './styles/global-dark.css';

function App() {
  return (
    <ThemeProvider>
      <TourProvider>
        <div className="App">
          <Navigation />
          <div className="app-layout">
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/quotes" element={<Quotes />} />
                <Route path="/homestaging" element={<HomeStaging />} />
                <Route path="/media" element={<Media />} />
                <Route path="/social" element={<SocialMedia />} />
                <Route path="/projets" element={<ProjectsNew />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/units/:id" element={<UnitDetail />} />
                <Route path="/gestion" element={<Gestion />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/supports" element={<Supports />} />
          <Route path="/globaltrade" element={<GlobalTrade />} />
              </Routes>
            </main>
          </div>
          <ThemeToggle />
          <Chatbot />
          <TourGuide />
          <TourButton />
        </div>
      </TourProvider>
    </ThemeProvider>
  );
}

export default App;
