import React, { useState, useEffect } from 'react';
import { Globe, TrendingUp, TrendingDown, DollarSign, Building, BarChart3, RefreshCw, Activity, ArrowUpRight, ArrowDownRight, Newspaper, Clock, ExternalLink } from 'lucide-react';
import './GlobalTrade.css';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
}

interface RealEstateIndex {
  name: string;
  region: string;
  value: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

interface GlobalRealEstate {
  name: string;
  region: string;
  marketValue: string;
  growth: number;
  trend: 'up' | 'down' | 'stable';
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: 'finance' | 'real-estate' | 'market' | 'economy';
  timestamp: Date;
  source: string;
  impact: 'positive' | 'negative' | 'neutral';
  url?: string;
  relevanceScore?: number;
}

interface AlphaVantageNewsItem {
  title: string;
  url: string;
  time_published: string;
  authors: string[];
  summary: string;
  source: string;
  category_within_source: string;
  source_domain: string;
  topics: Array<{
    topic: string;
    relevance_score: string;
  }>;
  overall_sentiment_score: number;
  overall_sentiment_label: string;
  ticker_sentiment: Array<{
    ticker: string;
    relevance_score: string;
    ticker_sentiment_score: string;
    ticker_sentiment_label: string;
  }>;
}

export function GlobalTrade() {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [realEstateData, setRealEstateData] = useState<RealEstateIndex[]>([]);
  const [globalRealEstateData, setGlobalRealEstateData] = useState<GlobalRealEstate[]>([]);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Configuration API Finnhub
  const FINNHUB_API_KEY = 'd2t8n39r01qkuv3jq71gd2t8n39r01qkuv3jq720'; // Clé API Finnhub
  const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

  // Real-time data fetching
  useEffect(() => {
    loadRealTimeData();
    const interval = setInterval(() => {
      loadRealTimeData();
    }, 300000); // Update every 5 minutes pour tester l'activation de l'API

    return () => clearInterval(interval);
  }, []);

  const generateFallbackQuote = (symbol: string) => {
    // Générer des données de fallback réalistes basées sur le symbole
    const basePrice = getEstimatedPrice(symbol);
    const changePercent = (Math.random() - 0.5) * 4; // -2% à +2%
    const change = basePrice * (changePercent / 100);
    
    return {
      price: Math.round((basePrice + change) * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      volume: Math.floor(Math.random() * 50000000) + 10000000 // 10M à 60M
    };
  };

  const getEstimatedPrice = (symbol: string): number => {
    const prices: { [key: string]: number } = {
      'AAPL': 175,
      'MSFT': 340,
      'GOOGL': 135,
      'TSLA': 250,
      'NVDA': 450,
      'AMZN': 145,
      'META': 320,
      'NFLX': 420
    };
    return prices[symbol] || 100;
  };

  const fetchStockQuote = async (symbol: string) => {
    try {
      // Délai optimisé pour Finnhub (60 requêtes/minute)
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Utiliser l'API Finnhub pour les cotations
      const response = await fetch(
        `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
      );
      
      if (!response.ok) {
        console.warn(`Finnhub API not available for ${symbol}: ${response.status} - Using fallback data`);
        // Retourner des données de fallback si l'API n'est pas disponible
        return generateFallbackQuote(symbol);
      }
      
      const data = await response.json();
      
      if (!data || data.c === undefined) {
        console.warn(`No data for ${symbol}:`, data);
        return generateFallbackQuote(symbol);
      }
      
      // Structure des données Finnhub: c=current, d=change, dp=changePercent
      return {
        price: data.c || 0,
        change: data.d || 0,
        changePercent: data.dp || 0,
        volume: data.v || 0
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return generateFallbackQuote(symbol);
    }
  };

  const fetchCompanyOverview = async (symbol: string) => {
    try {
      // Utiliser l'API Finnhub pour les profils d'entreprise
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const response = await fetch(
        `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
      );
      
      if (!response.ok) {
        console.warn(`Finnhub API not available for company profile ${symbol}: ${response.status} - Using fallback data`);
        return null;
      }
      
      const data = await response.json();
      
      if (!data || !data.name) {
        console.warn(`No company data for ${symbol}:`, data);
        return null;
      }
      
      return {
        name: data.name || getCompanyName(symbol),
        marketCap: data.marketCapitalization || getEstimatedMarketCap(symbol),
        sector: data.finnhubIndustry || 'Technology',
        industry: data.finnhubIndustry || 'Software'
      };
    } catch (error) {
      console.error(`Error fetching overview for ${symbol}:`, error);
      return null;
    }
  };

  const fetchGlobalRealEstateData = async (): Promise<GlobalRealEstate[]> => {
    try {
      // Simuler des données immobilières mondiales réalistes
      // En réalité, cela viendrait d'une API spécialisée comme Global Property Guide
      const globalMarkets = [
        { name: 'Immobilier Résidentiel Mondial', region: 'Global', baseGrowth: 2.1 },
        { name: 'Marché Immobilier Européen', region: 'Europe', baseGrowth: 1.8 },
        { name: 'Immobilier Américain', region: 'USA', baseGrowth: 3.2 },
        { name: 'Marché Asie-Pacifique', region: 'APAC', baseGrowth: 2.7 },
        { name: 'Immobilier Commercial', region: 'Global', baseGrowth: 1.5 },
        { name: 'REITs Mondiaux', region: 'Global', baseGrowth: 4.1 }
      ];
      
      return globalMarkets.map(market => {
        // Ajouter une variation aléatoire de -1% à +1%
        const variation = (Math.random() - 0.5) * 2;
        const growth = market.baseGrowth + variation;
        
        return {
          name: market.name,
          region: market.region,
          marketValue: getMarketValue(market.name),
          growth: Math.round(growth * 10) / 10,
          trend: growth > 0 ? 'up' : growth < 0 ? 'down' : 'stable'
        };
      });
    } catch (error) {
      console.error('Error fetching global real estate data:', error);
      return [];
    }
  };

  const getMarketValue = (marketName: string): string => {
    const values: { [key: string]: string } = {
      'Immobilier Résidentiel Mondial': '280T€',
      'Marché Immobilier Européen': '75T€',
      'Immobilier Américain': '45T€',
      'Marché Asie-Pacifique': '85T€',
      'Immobilier Commercial': '32T€',
      'REITs Mondiaux': '2.8T€'
    };
    return values[marketName] || '1T€';
  };

  const fetchNewsData = async (): Promise<NewsItem[]> => {
    try {
      // Utiliser l'API Finnhub pour les actualités générales
      const response = await fetch(
        `${FINNHUB_BASE_URL}/news?category=general&token=${FINNHUB_API_KEY}`
      );
      
      if (!response.ok) {
        console.warn(`Finnhub News API not available: ${response.status} - Using fallback news`);
        return [];
      }
      
      const data = await response.json();
      
      if (!data || !Array.isArray(data)) {
        console.warn('Invalid news data format:', data);
        return [];
      }
      
      return data.slice(0, 10).map((article: any, index: number) => ({
        id: `finnhub_${index}`,
        title: article.headline || 'No title',
        summary: article.summary || 'No description',
        description: article.summary || 'No description',
        url: article.url || '#',
        publishedAt: new Date(article.datetime * 1000).toISOString(),
        timestamp: new Date(article.datetime * 1000),
        source: article.source || 'Finnhub',
        category: categorizeNews(article.headline + ' ' + (article.summary || '')),
        impact: 'neutral' as const,
        relevanceScore: 0.5
      }));
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  };

  const categorizeNews = (text: string): 'finance' | 'real-estate' | 'market' | 'economy' => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('real estate') || lowerText.includes('property') || lowerText.includes('housing') || lowerText.includes('mortgage')) {
      return 'real-estate';
    }
    if (lowerText.includes('market') || lowerText.includes('trading') || lowerText.includes('stock') || lowerText.includes('investment')) {
      return 'market';
    }
    if (lowerText.includes('economy') || lowerText.includes('economic') || lowerText.includes('gdp') || lowerText.includes('inflation')) {
      return 'economy';
    }
    return 'finance';
  };

  const loadRealTimeData = async () => {
    setIsLoading(true);
    setApiError(null);
    
    // Optimiser le nombre de symboles avec Finnhub (100 requests/day)
    const symbols = [
      'AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'AMZN', 'META', 'NFLX'
    ];
    // Traitement avec délais optimisés pour Finnhub
    const stockResults = [];
    for (const symbol of symbols) {
      try {
        const [quote, overview] = await Promise.all([
          fetchStockQuote(symbol),
          fetchCompanyOverview(symbol)
        ]);
        
        if (quote) {
          stockResults.push({
            symbol,
            name: overview?.name || getCompanyName(symbol),
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            volume: quote.volume,
            marketCap: overview?.marketCap || getEstimatedMarketCap(symbol)
          });
        }
      } catch (error) {
        console.error(`Error processing ${symbol}:`, error);
      }
    }

    try {
      if (stockResults.length > 0) {
        setStockData(stockResults);
        setApiError(null); // Réinitialiser l'erreur si on reçoit des données
      } else {
        setApiError('Clé API Finnhub en cours d\'activation - Utilisation des données de démonstration');
        loadFallbackData();
      }
      
      // Réactiver les news avec Finnhub
      const newsResults = await fetchNewsData();
      if (newsResults.length > 0) {
        setNewsData(newsResults);
      } else {
        loadFallbackNews();
      }
      
      // Charger les données immobilières mondiales
      const globalResults = await fetchGlobalRealEstateData();
      if (globalResults.length > 0) {
        setGlobalRealEstateData(globalResults);
      } else {
        loadStaticGlobalRealEstateData();
      }
    } catch (error) {
      console.error('Error loading real-time data:', error);
      setApiError('Erreur de connexion Finnhub - Données de démonstration');
      loadFallbackData();
      loadFallbackNews();
      loadStaticGlobalRealEstateData();
    }
    
    loadStaticData();
    setIsLoading(false);
  };

  const getCompanyName = (symbol: string): string => {
    const names: { [key: string]: string } = {
      // US Tech Giants
      'AAPL': 'Apple Inc.',
      'MSFT': 'Microsoft Corp.',
      'GOOGL': 'Alphabet Inc.',
      'TSLA': 'Tesla Inc.',
      'NVDA': 'NVIDIA Corp.',
      'AMZN': 'Amazon.com Inc.',
      'META': 'Meta Platforms Inc.',
      'NFLX': 'Netflix Inc.',
      'ADBE': 'Adobe Inc.',
      'CRM': 'Salesforce Inc.',
      // Marketing & Media
      'TTD': 'The Trade Desk Inc.',
      'ROKU': 'Roku Inc.',
      'SNAP': 'Snap Inc.',
      'PINS': 'Pinterest Inc.',
      'TWTR': 'Twitter Inc.',
      'DIS': 'The Walt Disney Company',
      // Real Estate & REITs
      'AMT': 'American Tower Corp.',
      'PLD': 'Prologis Inc.',
      'EXR': 'Extended Stay America Inc.',
      'SPG': 'Simon Property Group',
      'O': 'Realty Income Corp.',
      'VTR': 'Ventas Inc.',
      // European Stocks
      'ASML': 'ASML Holding N.V.',
      'SAP': 'SAP SE',
      'LVMH.PA': 'LVMH Moët Hennessy',
      'MC.PA': 'LVMH',
      'OR.PA': "L'Oréal S.A.",
      'SAN.PA': 'Sanofi',
      // Asian Stocks
      'TSM': 'Taiwan Semiconductor',
      'BABA': 'Alibaba Group',
      'TCEHY': 'Tencent Holdings',
      'NIO': 'NIO Inc.',
      'JD': 'JD.com Inc.',
      'PDD': 'PDD Holdings',
      // Banking & Finance
      'JPM': 'JPMorgan Chase & Co.',
      'BAC': 'Bank of America Corp.',
      'WFC': 'Wells Fargo & Company',
      'GS': 'The Goldman Sachs Group',
      'MS': 'Morgan Stanley',
      'C': 'Citigroup Inc.',
      // Energy & Commodities
      'XOM': 'Exxon Mobil Corp.',
      'CVX': 'Chevron Corp.',
      'COP': 'ConocoPhillips',
      'SLB': 'Schlumberger Limited',
      'HAL': 'Halliburton Company',
      'OXY': 'Occidental Petroleum'
    };
    return names[symbol] || symbol;
  };

  const getEstimatedMarketCap = (symbol: string): number => {
    const marketCaps: { [key: string]: number } = {
      // US Tech Giants
      'AAPL': 3400000000000,
      'MSFT': 3200000000000,
      'GOOGL': 2100000000000,
      'TSLA': 775000000000,
      'NVDA': 2900000000000,
      'AMZN': 1950000000000,
      'META': 1300000000000,
      'NFLX': 190000000000,
      'ADBE': 220000000000,
      'CRM': 250000000000,
      // Marketing & Media
      'TTD': 35000000000,
      'ROKU': 3500000000,
      'SNAP': 15000000000,
      'PINS': 18000000000,
      'TWTR': 35000000000,
      'DIS': 180000000000,
      // Real Estate & REITs
      'AMT': 95000000000,
      'PLD': 120000000000,
      'EXR': 8000000000,
      'SPG': 35000000000,
      'O': 45000000000,
      'VTR': 25000000000,
      // European Stocks
      'ASML': 280000000000,
      'SAP': 150000000000,
      'LVMH.PA': 380000000000,
      'MC.PA': 380000000000,
      'OR.PA': 220000000000,
      'SAN.PA': 120000000000,
      // Asian Stocks
      'TSM': 520000000000,
      'BABA': 200000000000,
      'TCEHY': 350000000000,
      'NIO': 12000000000,
      'JD': 45000000000,
      'PDD': 150000000000,
      // Banking & Finance
      'JPM': 480000000000,
      'BAC': 280000000000,
      'WFC': 180000000000,
      'GS': 120000000000,
      'MS': 150000000000,
      'C': 95000000000,
      // Energy & Commodities
      'XOM': 420000000000,
      'CVX': 320000000000,
      'COP': 140000000000,
      'SLB': 65000000000,
      'HAL': 28000000000,
      'OXY': 55000000000
    };
    return marketCaps[symbol] || 1000000000000;
  };

  const loadFallbackData = () => {
    // Fallback data in case API fails
    const stocks: StockData[] = [
      // US Tech Giants
      { symbol: 'AAPL', name: 'Apple Inc.', price: 220.85, change: 2.15, changePercent: 0.98, volume: 45234567, marketCap: 3400000000000 },
      { symbol: 'MSFT', name: 'Microsoft Corp.', price: 428.50, change: -1.45, changePercent: -0.34, volume: 23456789, marketCap: 3200000000000 },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 165.40, change: 3.22, changePercent: 1.99, volume: 18765432, marketCap: 2100000000000 },
      { symbol: 'TSLA', name: 'Tesla Inc.', price: 242.80, change: -5.75, changePercent: -2.31, volume: 67890123, marketCap: 775000000000 },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 118.75, change: 2.45, changePercent: 2.10, volume: 34567890, marketCap: 2900000000000 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 188.90, change: 1.85, changePercent: 0.99, volume: 29876543, marketCap: 1950000000000 },
      { symbol: 'META', name: 'Meta Platforms Inc.', price: 485.20, change: 8.45, changePercent: 1.77, volume: 18234567, marketCap: 1300000000000 },
      { symbol: 'NFLX', name: 'Netflix Inc.', price: 445.30, change: -3.20, changePercent: -0.71, volume: 4567890, marketCap: 190000000000 },
      { symbol: 'ADBE', name: 'Adobe Inc.', price: 520.75, change: 12.85, changePercent: 2.53, volume: 2345678, marketCap: 220000000000 },
      { symbol: 'CRM', name: 'Salesforce Inc.', price: 285.40, change: 5.60, changePercent: 2.00, volume: 3456789, marketCap: 250000000000 },
      // Marketing & Media
      { symbol: 'TTD', name: 'The Trade Desk Inc.', price: 95.80, change: 2.15, changePercent: 2.29, volume: 1234567, marketCap: 35000000000 },
      { symbol: 'ROKU', name: 'Roku Inc.', price: 65.25, change: -1.85, changePercent: -2.76, volume: 5678901, marketCap: 3500000000 },
      { symbol: 'SNAP', name: 'Snap Inc.', price: 12.45, change: 0.35, changePercent: 2.89, volume: 12345678, marketCap: 15000000000 },
      { symbol: 'PINS', name: 'Pinterest Inc.', price: 28.75, change: 1.25, changePercent: 4.55, volume: 8765432, marketCap: 18000000000 },
      { symbol: 'DIS', name: 'The Walt Disney Company', price: 92.40, change: -0.85, changePercent: -0.91, volume: 12345678, marketCap: 180000000000 },
      // Real Estate & REITs
      { symbol: 'AMT', name: 'American Tower Corp.', price: 195.60, change: 1.25, changePercent: 0.64, volume: 1876543, marketCap: 95000000000 },
      { symbol: 'PLD', name: 'Prologis Inc.', price: 125.80, change: 0.95, changePercent: 0.76, volume: 2987654, marketCap: 120000000000 },
      { symbol: 'EXR', name: 'Extended Stay America Inc.', price: 145.30, change: -0.75, changePercent: -0.51, volume: 987654, marketCap: 8000000000 },
      { symbol: 'SPG', name: 'Simon Property Group', price: 115.25, change: 2.10, changePercent: 1.86, volume: 2345678, marketCap: 35000000000 },
      { symbol: 'O', name: 'Realty Income Corp.', price: 58.90, change: 0.45, changePercent: 0.77, volume: 3456789, marketCap: 45000000000 },
      // European Stocks
      { symbol: 'ASML', name: 'ASML Holding N.V.', price: 685.40, change: 12.50, changePercent: 1.86, volume: 876543, marketCap: 280000000000 },
      { symbol: 'SAP', name: 'SAP SE', price: 145.75, change: -2.25, changePercent: -1.52, volume: 1234567, marketCap: 150000000000 },
      // Asian Stocks
      { symbol: 'TSM', name: 'Taiwan Semiconductor', price: 105.80, change: 3.45, changePercent: 3.37, volume: 15678901, marketCap: 520000000000 },
      { symbol: 'BABA', name: 'Alibaba Group', price: 78.25, change: -1.85, changePercent: -2.31, volume: 23456789, marketCap: 200000000000 },
      // Banking & Finance
      { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 185.40, change: 2.75, changePercent: 1.51, volume: 8765432, marketCap: 480000000000 },
      { symbol: 'BAC', name: 'Bank of America Corp.', price: 38.90, change: 0.65, changePercent: 1.70, volume: 45678901, marketCap: 280000000000 },
      // Energy & Commodities
      { symbol: 'XOM', name: 'Exxon Mobil Corp.', price: 115.75, change: 1.85, changePercent: 1.62, volume: 12345678, marketCap: 420000000000 },
      { symbol: 'CVX', name: 'Chevron Corp.', price: 158.20, change: -0.95, changePercent: -0.60, volume: 6789012, marketCap: 320000000000 }
    ];
    setStockData(stocks);
  };

  const loadFallbackNews = () => {
    // Fallback news data
    const fallbackNews: NewsItem[] = [
      {
        id: '1',
        title: 'Les taux d\'intérêt européens en baisse stimulent l\'immobilier',
        summary: 'La BCE maintient sa politique accommodante, favorisant les investissements immobiliers dans la zone euro.',
        category: 'real-estate',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        source: 'Reuters Finance',
        impact: 'positive'
      },
      {
        id: '2',
        title: 'Tech stocks rebondissent après les résultats trimestriels',
        summary: 'Apple, Microsoft et Google dépassent les attentes avec des revenus en forte croissance.',
        category: 'finance',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        source: 'Bloomberg',
        impact: 'positive'
      },
      {
        id: '3',
        title: 'Inflation française stable à 2.1% en septembre',
        summary: 'L\'INSEE confirme une inflation maîtrisée, rassurant les marchés financiers.',
        category: 'economy',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        source: 'Les Échos',
        impact: 'neutral'
      },
      {
        id: '4',
        title: 'Nexity annonce un plan de restructuration',
        summary: 'Le promoteur immobilier français prévoit de céder plusieurs filiales pour optimiser sa structure.',
        category: 'real-estate',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        source: 'Le Figaro Économie',
        impact: 'negative'
      }
    ];
    setNewsData(fallbackNews);
  };

  const loadStaticData = () => {
    // Real estate indices (static data)
    const realEstate: RealEstateIndex[] = [
      { name: 'Paris Immobilier Index', region: 'France', value: 2847.5, change: 15.2, changePercent: 0.54, trend: 'up' },
      { name: 'London Property Index', region: 'UK', value: 1923.8, change: -8.7, changePercent: -0.45, trend: 'down' },
      { name: 'NYC Real Estate Index', region: 'USA', value: 3456.2, change: 22.1, changePercent: 0.64, trend: 'up' },
      { name: 'Tokyo Housing Index', region: 'Japan', value: 1678.9, change: 5.3, changePercent: 0.32, trend: 'up' },
      { name: 'Berlin Property Index', region: 'Germany', value: 2134.7, change: -3.2, changePercent: -0.15, trend: 'down' },
      { name: 'Sydney Real Estate Index', region: 'Australia', value: 2789.4, change: 18.6, changePercent: 0.67, trend: 'up' }
    ];

    setRealEstateData(realEstate);
    setLastUpdate(new Date());
  };

  const loadStaticGlobalRealEstateData = () => {
    // Global real estate data (static fallback)
    const globalMarkets: GlobalRealEstate[] = [
      { name: 'Immobilier Résidentiel Mondial', region: 'Global', marketValue: '280T€', growth: 2.3, trend: 'up' },
      { name: 'Marché Immobilier Européen', region: 'Europe', marketValue: '75T€', growth: 1.7, trend: 'up' },
      { name: 'Immobilier Américain', region: 'USA', marketValue: '45T€', growth: 3.4, trend: 'up' },
      { name: 'Marché Asie-Pacifique', region: 'APAC', marketValue: '85T€', growth: 2.9, trend: 'up' },
      { name: 'Immobilier Commercial', region: 'Global', marketValue: '32T€', growth: 1.2, trend: 'up' },
      { name: 'REITs Mondiaux', region: 'Global', marketValue: '2.8T€', growth: 4.3, trend: 'up' }
    ];

    setGlobalRealEstateData(globalMarkets);
  };


  const refreshData = async () => {
    await loadRealTimeData();
  };

  const formatCurrency = (value: number, currency = '€') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency === '€' ? 'EUR' : 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatLargeNumber = (value: number) => {
    if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T€`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}Md€`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M€`;
    return `${value.toFixed(0)}€`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'1h';
    if (diffInHours === 1) return 'Il y a 1h';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Il y a 1 jour';
    return `Il y a ${diffInDays} jours`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'finance': return '#3B82F6';
      case 'real-estate': return '#10B981';
      case 'market': return '#8B5CF6';
      case 'economy': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'finance': return 'Finance';
      case 'real-estate': return 'Immobilier';
      case 'market': return 'Marchés';
      case 'economy': return 'Économie';
      default: return 'Actualités';
    }
  };

  const handleNewsClick = (newsItem: NewsItem) => {
    if (newsItem.url && newsItem.url !== '#') {
      window.open(newsItem.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="page-container">
      <div className="globaltrade-header">
        <div className="header-content">
          <h1 className="page-title">
            <Globe size={28} />
            Global Trade
          </h1>
          <p className="page-subtitle">Marchés financiers, valorisations d'entreprises et indices immobiliers</p>
        </div>
        <div className="header-actions">
          <div className="last-update">
            Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
            {apiError && (
              <div className="api-error">
                <Activity size={12} />
                {apiError}
              </div>
            )}
          </div>
          <button 
            className={`btn-refresh ${isLoading ? 'loading' : ''}`}
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
            {apiError ? 'Réessayer' : 'Actualiser'}
          </button>
        </div>
      </div>

      {/* Market Overview */}
      <div className="market-overview">
        <div className="overview-card">
          <div className="overview-icon">
            <TrendingUp size={24} />
          </div>
          <div className="overview-content">
            <span className="overview-value">+2.4%</span>
            <span className="overview-label">Marchés Globaux</span>
          </div>
        </div>
        <div className="overview-card">
          <div className="overview-icon">
            <Building size={24} />
          </div>
          <div className="overview-content">
            <span className="overview-value">+0.8%</span>
            <span className="overview-label">Immobilier</span>
          </div>
        </div>
        <div className="overview-card">
          <div className="overview-icon">
            <BarChart3 size={24} />
          </div>
          <div className="overview-content">
            <span className="overview-value">+1.2%</span>
            <span className="overview-label">Tech Stocks</span>
          </div>
        </div>
        <div className="overview-card">
          <div className="overview-icon">
            <Activity size={24} />
          </div>
          <div className="overview-content">
            <span className="overview-value">High</span>
            <span className="overview-label">Volatilité</span>
          </div>
        </div>
      </div>

      <div className="trade-grid">
        {/* Left Column */}
        <div className="left-column">
          {/* News Section */}
          <div className="trade-section news-section">
            <div className="section-header">
              <h2>
                <Newspaper size={24} />
                Actualités Financières
              </h2>
              <span className="section-subtitle">Dernières nouvelles des marchés</span>
            </div>
            <div className="news-grid">
              {newsData.slice(0, 4).map((news) => (
                <div 
                  key={news.id} 
                  className="news-card"
                  onClick={() => handleNewsClick(news)}
                  style={{ cursor: news.url && news.url !== '#' ? 'pointer' : 'default' }}
                >
                  <div className="news-card-header">
                    <div 
                      className="news-category"
                      style={{ backgroundColor: `${getCategoryColor(news.category)}20`, color: getCategoryColor(news.category) }}
                    >
                      {getCategoryLabel(news.category)}
                    </div>
                    <div className={`news-impact ${news.impact}`}>
                      {news.impact === 'positive' && <TrendingUp size={12} />}
                      {news.impact === 'negative' && <TrendingDown size={12} />}
                      {news.impact === 'neutral' && <Activity size={12} />}
                    </div>
                  </div>
                  <h3 className="news-card-title">{news.title}</h3>
                  <p className="news-card-summary">{news.summary}</p>
                  <div className="news-card-footer">
                    <div className="news-meta">
                      <Clock size={12} />
                      <span>{formatTimeAgo(news.timestamp)}</span>
                      <span className="news-source">{news.source}</span>
                    </div>
                    {news.url && news.url !== '#' && (
                      <ExternalLink size={12} className="news-link" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Real Estate Markets */}
          <div className="trade-section company-section">
            <div className="section-header">
              <h2>
                <Building size={24} />
                Marchés Immobiliers Mondiaux
              </h2>
              <span className="section-subtitle">Données globales du secteur immobilier</span>
            </div>
            <div className="company-grid">
              {globalRealEstateData.map((market, i) => (
                <div key={i} className="company-card">
                  <div className="company-header">
                    <div className="company-name">{market.name}</div>
                    <div className={`market-trend ${market.trend}`}>
                      {market.trend === 'up' ? <TrendingUp size={12} /> : market.trend === 'down' ? <TrendingDown size={12} /> : <Activity size={12} />}
                    </div>
                  </div>
                  <div className="company-sector">{market.region}</div>
                  <div className="company-metrics">
                    <div className="metric">
                      <span className="metric-label">Valeur Marché</span>
                      <span className="metric-value">{market.marketValue}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Croissance</span>
                      <span className={`metric-value ${market.growth >= 0 ? 'positive' : 'negative'}`}>
                        {market.growth >= 0 ? '+' : ''}{market.growth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column Container */}
        <div className="right-column">
          {/* Stock Market Section */}
          <div className="trade-section compact stock-section">
            <div className="section-header">
              <h2>
                <BarChart3 size={20} />
                Bourse & Actions
              </h2>
            </div>
            <div className="stock-grid">
              {stockData.slice(0, 8).map((stock) => (
                <div key={stock.symbol} className="stock-card">
                  <div className="stock-header">
                    <span className="stock-symbol">{stock.symbol}</span>
                    <span className="stock-price">${stock.price.toFixed(2)}</span>
                  </div>
                  <div className={`stock-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                    {stock.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {stock.changePercent.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real Estate Indices */}
          <div className="trade-section compact realestate-section">
            <div className="section-header">
              <h2>
                <Building size={20} />
                Indices Immobiliers
              </h2>
            </div>
            <div className="realestate-grid">
              {realEstateData.slice(0, 6).map((index, i) => (
                <div key={i} className="realestate-card">
                  <div className="realestate-header">
                    <span className="realestate-city">{index.name.split(' ')[0]}</span>
                    <span className="realestate-value">{index.value.toFixed(0)}</span>
                  </div>
                  <div className={`realestate-change ${index.change >= 0 ? 'positive' : 'negative'}`}>
                    {index.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {index.changePercent.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
