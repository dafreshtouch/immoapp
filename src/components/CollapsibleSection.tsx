import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import './CollapsibleSection.css';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  headerAction?: React.ReactNode;
}

export function CollapsibleSection({ title, children, defaultExpanded = false, headerAction }: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="collapsible-section">
      <div className="collapsible-header-container">
        <button 
          className="collapsible-header"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="collapsible-title">
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            <h3>{title}</h3>
          </div>
        </button>
        {headerAction && (
          <div className="collapsible-header-action">
            {headerAction}
          </div>
        )}
      </div>
      
      <div className="collapsible-content" style={{ display: isExpanded ? 'block' : 'none' }}>
        {children}
      </div>
    </div>
  );
}
