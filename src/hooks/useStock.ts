import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

export interface Stock {
  id: string;
  name: string;
  type: 'brochure' | 'flyer' | 'carte_visite' | 'panneau' | 'autre';
  quantity: number;
  quantityUsed: number;
  cost: number;
  supplier: string;
  dateAdded: string;
  description?: string;
  imageUrl?: string;
  userId?: string;
}

export function useStock() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Données d'exemple par défaut
  const getDefaultStocks = (): Stock[] => [
    {
      id: 'sample-1',
      name: 'Brochure Villa Moderne',
      type: 'brochure',
      quantity: 500,
      quantityUsed: 120,
      cost: 250,
      supplier: 'Imprimerie Dupont',
      dateAdded: '2024-01-15',
      description: 'Brochure haute qualité pour présentation villas'
    },
    {
      id: 'sample-2',
      name: 'Flyer Appartements Centre-ville',
      type: 'flyer',
      quantity: 1000,
      quantityUsed: 450,
      cost: 180,
      supplier: 'Print Express',
      dateAdded: '2024-02-10',
      description: 'Flyers A5 pour promotion appartements'
    },
    {
      id: 'sample-3',
      name: 'Cartes de Visite Agent',
      type: 'carte_visite',
      quantity: 250,
      quantityUsed: 80,
      cost: 45,
      supplier: 'Vistaprint',
      dateAdded: '2024-01-20',
      description: 'Cartes de visite premium avec logo'
    },
    {
      id: 'sample-4',
      name: 'Panneau À Vendre Grand Format',
      type: 'panneau',
      quantity: 20,
      quantityUsed: 12,
      cost: 400,
      supplier: 'Signaletique Pro',
      dateAdded: '2024-03-05',
      description: 'Panneaux 80x60cm résistants aux intempéries'
    },
    {
      id: 'sample-5',
      name: 'Roll-up Salon Immobilier',
      type: 'panneau',
      quantity: 5,
      quantityUsed: 3,
      cost: 150,
      supplier: 'Display Pro',
      dateAdded: '2024-02-20',
      description: 'Roll-up portable pour salons et événements'
    }
  ];

  useEffect(() => {
    // Utiliser localStorage pour persistance locale
    const loadLocalStocks = () => {
      try {
        const savedStocks = localStorage.getItem(`stocks_${user?.uid || 'guest'}`);
        if (savedStocks) {
          const parsedStocks = JSON.parse(savedStocks);
          setStocks(parsedStocks);
        } else {
          // Première visite, utiliser les données par défaut
          const defaultStocks = getDefaultStocks();
          setStocks(defaultStocks);
          localStorage.setItem(`stocks_${user?.uid || 'guest'}`, JSON.stringify(defaultStocks));
        }
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des stocks locaux:', err);
        setStocks(getDefaultStocks());
        setLoading(false);
        setError('Utilisation des données par défaut');
      }
    };

    loadLocalStocks();
  }, [user]);

  const saveToLocalStorage = (updatedStocks: Stock[]) => {
    try {
      localStorage.setItem(`stocks_${user?.uid || 'guest'}`, JSON.stringify(updatedStocks));
    } catch (err) {
      console.error('Erreur lors de la sauvegarde locale:', err);
    }
  };

  const addStock = async (stockData: Omit<Stock, 'id'>) => {
    try {
      const newStock: Stock = {
        ...stockData,
        id: `stock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user?.uid,
        dateAdded: stockData.dateAdded || new Date().toISOString().split('T')[0]
      };

      const updatedStocks = [newStock, ...stocks];
      setStocks(updatedStocks);
      saveToLocalStorage(updatedStocks);
    } catch (err) {
      console.error('Erreur lors de l\'ajout du stock:', err);
      throw new Error('Erreur lors de l\'ajout du stock');
    }
  };

  const updateStock = async (id: string, stockData: Partial<Stock>) => {
    try {
      const updatedStocks = stocks.map(stock => 
        stock.id === id ? { ...stock, ...stockData } : stock
      );
      setStocks(updatedStocks);
      saveToLocalStorage(updatedStocks);
    } catch (err) {
      console.error('Erreur lors de la modification du stock:', err);
      throw new Error('Erreur lors de la modification du stock');
    }
  };

  const deleteStock = async (id: string) => {
    try {
      const updatedStocks = stocks.filter(stock => stock.id !== id);
      setStocks(updatedStocks);
      saveToLocalStorage(updatedStocks);
    } catch (err) {
      console.error('Erreur lors de la suppression du stock:', err);
      throw new Error('Erreur lors de la suppression du stock');
    }
  };

  return {
    stocks,
    loading,
    error,
    addStock,
    updateStock,
    deleteStock
  };
}
