import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { useBudgetData } from '../hooks/useBudgetData';
import { useBudgetCategories } from '../hooks/useBudgetCategories';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import './Analytics.css';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  category: string;
  cost?: number;
}

interface MarketingCost {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

export function Analytics() {
  const { user } = useAuth();
  const { transactions } = useBudgetData();
  const { categories } = useBudgetCategories();
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [marketingCosts, setMarketingCosts] = useState<MarketingCost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalendarData = async () => {
      if (!user) return;

      try {
        // Récupérer les événements du calendrier
        const eventsQuery = query(
          collection(db, 'calendar'),
          where('userId', '==', user.uid)
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        const events = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CalendarEvent[];

        // Récupérer les coûts marketing
        const costsQuery = query(
          collection(db, 'marketingCosts'),
          where('userId', '==', user.uid)
        );
        const costsSnapshot = await getDocs(costsQuery);
        const costs = costsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MarketingCost[];

        setCalendarEvents(events);
        setMarketingCosts(costs);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, [user]);

  // Données pour le graphique des dépenses par catégorie
  const expensesByCategory = categories.map(category => {
    const categoryTransactions = transactions.filter(t => t.category === category.name);
    const totalExpenses = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalBudget = category.allocated;
    
    return {
      name: category.name,
      dépensé: totalExpenses,
      budget: totalBudget,
      restant: Math.max(0, totalBudget - totalExpenses),
      color: category.color
    };
  });

  // Données pour le graphique temporel
  const monthlyData = () => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const monthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === index && date.getFullYear() === currentYear;
      });
      
      const monthEvents = calendarEvents.filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === index && date.getFullYear() === currentYear;
      });

      const monthCosts = marketingCosts.filter(c => {
        const date = new Date(c.date);
        return date.getMonth() === index && date.getFullYear() === currentYear;
      });

      const expenses = monthTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const marketingExpenses = monthCosts.reduce((sum, c) => sum + c.amount, 0);
      const eventsCount = monthEvents.length;

      return {
        mois: month,
        dépenses: expenses,
        marketing: marketingExpenses,
        événements: eventsCount
      };
    });
  };

  // Données pour le graphique en secteurs des catégories
  const categoryPieData = expensesByCategory.filter(cat => cat.dépensé > 0).map(cat => ({
    name: cat.name,
    value: cat.dépensé,
    color: cat.color
  }));

  // Analyse croisée budget/événements
  const budgetEventAnalysis = categories.map(category => {
    const categoryEvents = calendarEvents.filter(e => e.category === category.name);
    const categoryTransactions = transactions.filter(t => t.category === category.name);
    const avgCostPerEvent = categoryEvents.length > 0 
      ? categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / categoryEvents.length 
      : 0;

    return {
      catégorie: category.name,
      événements: categoryEvents.length,
      coûtMoyen: avgCostPerEvent,
      budgetUtilisé: (categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / category.allocated) * 100
    };
  });

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

  if (loading) {
    return (
      <div className="page-container">
        <h1 className="page-title">Analytics</h1>
        <div className="loading">Chargement des données...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Analytics</h1>
      
      <div className="analytics-grid">
        {/* Vue d'ensemble */}
        <div className="analytics-card overview">
          <h2>Vue d'ensemble</h2>
          <div className="overview-stats">
            <div className="stat">
              <span className="stat-value">{transactions.length}</span>
              <span className="stat-label">Transactions</span>
            </div>
            <div className="stat">
              <span className="stat-value">{calendarEvents.length}</span>
              <span className="stat-label">Événements</span>
            </div>
            <div className="stat">
              <span className="stat-value">{categories.length}</span>
              <span className="stat-label">Catégories</span>
            </div>
            <div className="stat">
              <span className="stat-value">{marketingCosts.length}</span>
              <span className="stat-label">Coûts Marketing</span>
            </div>
          </div>
        </div>

        {/* Graphique des dépenses par catégorie */}
        <div className="analytics-card">
          <h3>Dépenses vs Budget par Catégorie</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expensesByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}€`, '']} />
              <Legend />
              <Bar dataKey="budget" fill="#3B82F6" name="Budget alloué" />
              <Bar dataKey="dépensé" fill="#82ca9d" name="Dépensé" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique temporel */}
        <div className="analytics-card">
          <h3>Évolution Mensuelle</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="dépenses" stroke="#3B82F6" name="Dépenses (€)" />
              <Line type="monotone" dataKey="marketing" stroke="#82ca9d" name="Marketing (€)" />
              <Line type="monotone" dataKey="événements" stroke="#ffc658" name="Événements" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique en secteurs */}
        <div className="analytics-card">
          <h3>Répartition des Dépenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#3B82F6"
                dataKey="value"
              >
                {categoryPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}€`, 'Montant']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Analyse croisée budget/événements */}
        <div className="analytics-card">
          <h3>Analyse Budget/Événements</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={budgetEventAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="catégorie" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="budgetUtilisé" stackId="1" stroke="#3B82F6" fill="rgba(59, 130, 246, 0.3)" name="Budget utilisé (%)" />
              <Bar dataKey="événements" fill="#10B981" name="Nombre d'événements" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Efficacité par catégorie */}
        <div className="analytics-card efficiency-card">
          <h3>🎯 Performance par Catégorie</h3>
          <div className="efficiency-explanation">
            <p>Analyse de l'efficacité de vos investissements par catégorie d'événements</p>
          </div>
          <div className="efficiency-grid">
            {budgetEventAnalysis.filter(item => item.événements > 0 || categories.find(cat => cat.name === item.catégorie)).map((item, index) => {
              // Calcul du ROI simplifié : plus d'événements avec moins de budget = meilleur ROI
              const roi = item.événements > 0 && item.budgetUtilisé > 0 
                ? (item.événements / (item.budgetUtilisé / 100)) * 10 
                : 0;
              
              const getPerformanceColor = (roiValue: number) => {
                if (roiValue >= 50) return '#10B981'; // Excellent
                if (roiValue >= 20) return '#3B82F6'; // Bon
                if (roiValue >= 10) return '#F59E0B'; // Moyen
                return '#EF4444'; // Faible
              };
              
              const getPerformanceLabel = (roiValue: number) => {
                if (roiValue >= 50) return 'Excellent ROI';
                if (roiValue >= 20) return 'Bon ROI';
                if (roiValue >= 10) return 'ROI Moyen';
                if (roiValue > 0) return 'ROI Faible';
                return 'Pas d\'activité';
              };
              
              const categoryInfo = categories.find(cat => cat.name === item.catégorie);
              const budgetAlloue = categoryInfo?.allocated || 0;
              const budgetRestant = budgetAlloue - (budgetAlloue * (item.budgetUtilisé / 100));
              
              return (
                <div key={index} className="efficiency-card-item" style={{['--efficiency-color' as any]: getPerformanceColor(roi)}}>
                  <div className="efficiency-header">
                    <div className="efficiency-category">{item.catégorie}</div>
                    <div className="efficiency-badge" style={{backgroundColor: getPerformanceColor(roi)}}>
                      {getPerformanceLabel(roi)}
                    </div>
                  </div>
                  
                  <div className="efficiency-summary">
                    <div className="roi-score">
                      <span className="roi-value">{roi.toFixed(0)}</span>
                      <span className="roi-label">Score ROI</span>
                    </div>
                  </div>
                  
                  <div className="efficiency-stats">
                    <div className="efficiency-stat">
                      <div className="stat-icon">📅</div>
                      <div className="stat-info">
                        <span className="stat-number">{item.événements}</span>
                        <span className="stat-text">Événements réalisés</span>
                      </div>
                    </div>
                    
                    <div className="efficiency-stat">
                      <div className="stat-icon">💰</div>
                      <div className="stat-info">
                        <span className="stat-number">{budgetAlloue.toFixed(0)}€</span>
                        <span className="stat-text">Budget alloué</span>
                      </div>
                    </div>
                    
                    <div className="efficiency-stat">
                      <div className="stat-icon">💸</div>
                      <div className="stat-info">
                        <span className="stat-number">{(budgetAlloue * (item.budgetUtilisé / 100)).toFixed(0)}€</span>
                        <span className="stat-text">Dépensé</span>
                      </div>
                    </div>
                    
                    <div className="efficiency-stat">
                      <div className="stat-icon">💳</div>
                      <div className="stat-info">
                        <span className="stat-number">{budgetRestant.toFixed(0)}€</span>
                        <span className="stat-text">Restant</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="efficiency-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{
                          width: `${Math.min(item.budgetUtilisé, 100)}%`,
                          backgroundColor: getPerformanceColor(roi)
                        }}
                      ></div>
                    </div>
                    <div className="progress-info">
                      <span className="progress-label">Utilisation: {item.budgetUtilisé.toFixed(1)}%</span>
                      <span className="progress-cost">Coût/événement: {item.événements > 0 ? (item.coûtMoyen.toFixed(0)) : '0'}€</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
