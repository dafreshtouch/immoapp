import React from 'react';
import { CategoryManager } from '../components/CategoryManager';
import { BudgetCategoryManager } from '../components/BudgetCategoryManager';
import { CollapsibleSection } from '../components/CollapsibleSection';

export function Settings() {
  return (
    <div className="page-container">
      <h1 className="page-title">Paramètres</h1>
      
      <CollapsibleSection title="Catégories d'événements" defaultExpanded={true}>
        <CategoryManager />
      </CollapsibleSection>
      
      <CollapsibleSection title="Catégories de budget" defaultExpanded={false}>
        <BudgetCategoryManager />
      </CollapsibleSection>
      
      <CollapsibleSection title="Autres paramètres">
        <p>Autres options de configuration à venir...</p>
      </CollapsibleSection>
    </div>
  );
}
