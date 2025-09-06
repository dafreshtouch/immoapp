import React, { createContext, useContext, useState, useEffect } from 'react';

export interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  page?: string;
  action?: () => void;
}

interface TourContextType {
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  isFirstVisit: boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    target: 'nav',
    title: 'Bienvenue dans ImmoApp ! 🏠',
    content: 'Découvrons ensemble les fonctionnalités principales de votre application immobilière.',
    placement: 'bottom'
  },
  {
    id: 'navigation',
    target: 'nav',
    title: 'Navigation principale',
    content: 'Accédez facilement à toutes les sections : Accueil, Analytics, Budget, Calendrier et plus encore.',
    placement: 'right'
  },
  {
    id: 'dashboard',
    target: '.home-stats',
    title: 'Tableau de bord',
    content: 'Visualisez vos métriques clés : revenus, dépenses, projets actifs et performances.',
    placement: 'bottom',
    page: '/'
  },
  {
    id: 'projects',
    target: '.projects-container',
    title: 'Gestion des projets',
    content: 'Créez et gérez vos projets immobiliers avec un suivi détaillé.',
    placement: 'top',
    page: '/projets'
  },
  {
    id: 'budget',
    target: '.budget-overview',
    title: 'Suivi budgétaire',
    content: 'Contrôlez vos finances avec des graphiques et analyses détaillées.',
    placement: 'bottom',
    page: '/budget'
  },
  {
    id: 'theme-toggle',
    target: '.theme-toggle',
    title: 'Mode sombre/clair',
    content: 'Basculez entre le thème clair et sombre selon vos préférences.',
    placement: 'top'
  },
  {
    id: 'complete',
    target: 'main',
    title: 'Félicitations ! 🎉',
    content: 'Vous êtes maintenant prêt à utiliser ImmoApp. Explorez les fonctionnalités à votre rythme !',
    placement: 'bottom'
  }
];

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    // Vérifier si c'est la première visite
    const hasVisited = localStorage.getItem('immoapp-tour-completed');
    const tourSkipped = localStorage.getItem('immoapp-tour-skipped');
    
    if (!hasVisited && !tourSkipped) {
      setIsFirstVisit(true);
      // Démarrer le tour après un délai minimal
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipTour = () => {
    setIsActive(false);
    localStorage.setItem('immoapp-tour-skipped', 'true');
  };

  const completeTour = () => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem('immoapp-tour-completed', 'true');
  };

  return (
    <TourContext.Provider
      value={{
        isActive,
        currentStep,
        steps: TOUR_STEPS,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        completeTour,
        isFirstVisit
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}
