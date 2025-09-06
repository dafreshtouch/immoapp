import React from 'react';
import { useTour } from '../contexts/TourContext';
import './TourButton.css';

export function TourButton() {
  const { startTour, isActive } = useTour();

  if (isActive) return null;

  return (
    <button 
      className="tour-start-button"
      onClick={startTour}
      title="Démarrer le tour guidé"
    >
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" 
          fill="currentColor"
        />
      </svg>
      <span>Tour guidé</span>
    </button>
  );
}
