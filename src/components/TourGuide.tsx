import React, { useEffect, useState } from 'react';
import { useTour } from '../contexts/TourContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './TourGuide.css';

export function TourGuide() {
  const { isActive, currentStep, steps, nextStep, prevStep, skipTour, completeTour } = useTour();
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const currentStepData = steps[currentStep];

  useEffect(() => {
    if (!isActive || !currentStepData) return;

    // Naviguer vers la page requise si nécessaire
    if (currentStepData.page && location.pathname !== currentStepData.page) {
      navigate(currentStepData.page);
      return;
    }

    // Chercher l'élément et maintenir la position
    const updateElement = () => {
      const element = document.querySelector(currentStepData.target) as HTMLElement;
      if (element) {
        setTargetElement(element);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    // Chercher immédiatement puis avec un délai
    updateElement();
    const timer = setTimeout(updateElement, 500);

    // Mettre à jour lors du scroll pour maintenir la position
    const handleScroll = () => {
      if (targetElement) {
        setTargetElement(targetElement); // Force re-render
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isActive, currentStep, currentStepData, location.pathname, navigate, targetElement]);




  const handleNext = () => {
    if (currentStepData.action) {
      currentStepData.action();
    }
    nextStep();
  };

  const handleSkip = () => {
    // Nettoyer les highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
    });
    skipTour();
  };

  const handleComplete = () => {
    // Nettoyer les highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
    });
    completeTour();
  };

  if (!isActive || !currentStepData) return null;

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <>
      {/* Spotlight précis */}
      {targetElement && (() => {
        const rect = targetElement.getBoundingClientRect();
        return (
          <div 
            className="tour-spotlight"
            style={{
              position: 'fixed',
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              pointerEvents: 'none',
              zIndex: 9999
            }}
          />
        );
      })()}
      
      {/* Tooltip simple */}
      <div
        className="tour-tooltip"
        data-placement={currentStepData.placement || 'bottom'}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10000
        }}
      >
        {/* Flèche du tooltip */}
        <div className="tour-arrow" />
        
        {/* Contenu */}
        <div className="tour-content">
          <div className="tour-header">
            <h3 className="tour-title">{currentStepData.title}</h3>
            <button 
              className="tour-close"
              onClick={handleSkip}
              aria-label="Fermer le tour"
            >
              ×
            </button>
          </div>
          
          <div className="tour-body">
            <p className="tour-description">{currentStepData.content}</p>
          </div>
          
          <div className="tour-footer">
            <div className="tour-progress">
              <span className="tour-step-counter">
                {currentStep + 1} / {steps.length}
              </span>
              <div className="tour-progress-bar">
                <div 
                  className="tour-progress-fill"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="tour-actions">
              {!isFirstStep && (
                <button 
                  className="tour-btn tour-btn-secondary"
                  onClick={prevStep}
                >
                  Précédent
                </button>
              )}
              
              <button 
                className="tour-btn tour-btn-secondary"
                onClick={handleSkip}
              >
                Passer
              </button>
              
              {isLastStep ? (
                <button 
                  className="tour-btn tour-btn-primary"
                  onClick={handleComplete}
                >
                  Terminer
                </button>
              ) : (
                <button 
                  className="tour-btn tour-btn-primary"
                  onClick={handleNext}
                >
                  Suivant
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
