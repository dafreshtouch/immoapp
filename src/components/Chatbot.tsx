import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import './Chatbot.css';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatbotResponse {
  keywords: string[];
  response: string;
}

const CHATBOT_RESPONSES: ChatbotResponse[] = [
  {
    keywords: ['bonjour', 'salut', 'hello', 'bonsoir'],
    response: 'Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd\'hui ?'
  },
  {
    keywords: ['aide', 'help', 'assistance'],
    response: 'Je peux vous aider avec les fonctionnalités de l\'application : analytics, budget, calendrier, devis, home staging, médias et gestion de projets. Que souhaitez-vous savoir ?'
  },
  {
    keywords: ['analytics', 'analyse', 'statistiques'],
    response: 'La section Analytics vous permet de visualiser les performances de vos projets avec des graphiques et des métriques détaillées.'
  },
  {
    keywords: ['budget', 'coût', 'prix', 'finance'],
    response: 'Dans la section Budget, vous pouvez gérer vos finances, suivre les dépenses et planifier les coûts de vos projets immobiliers.'
  },
  {
    keywords: ['calendrier', 'planning', 'rendez-vous'],
    response: 'Le calendrier vous permet de planifier vos rendez-vous, visites et échéances importantes pour vos projets.'
  },
  {
    keywords: ['devis', 'quote', 'estimation'],
    response: 'La section Devis vous aide à créer et gérer des estimations pour vos clients et projets.'
  },
  {
    keywords: ['home staging', 'staging', 'décoration'],
    response: 'Home Staging vous offre des outils pour planifier et visualiser l\'aménagement et la décoration de vos biens immobiliers.'
  },
  {
    keywords: ['média', 'media', 'photo', 'image'],
    response: 'La section Médias vous permet de gérer toutes vos photos, vidéos et documents liés à vos projets immobiliers.'
  },
  {
    keywords: ['projet', 'gestion', 'management'],
    response: 'La gestion de projets vous aide à organiser, suivre et coordonner tous vos projets immobiliers en cours.'
  },
  {
    keywords: ['merci', 'thanks', 'thank you'],
    response: 'De rien ! N\'hésitez pas si vous avez d\'autres questions.'
  },
  {
    keywords: ['au revoir', 'bye', 'goodbye', 'à bientôt'],
    response: 'Au revoir ! À bientôt pour de nouveaux projets !'
  }
];

const DEFAULT_RESPONSE = 'Je ne suis pas sûr de comprendre votre question. Pouvez-vous me demander des informations sur les analytics, le budget, le calendrier, les devis, le home staging, les médias ou la gestion de projets ?';

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider ?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const response of CHATBOT_RESPONSES) {
      if (response.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return response.response;
      }
    }
    
    return DEFAULT_RESPONSE;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: Date.now() + 1,
        text: findResponse(inputValue),
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Ouvrir le chatbot"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Assistant virtuel</h3>
            <button
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer le chatbot"
            >
              <X size={20} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.isUser ? 'user' : 'bot'}`}
              >
                <div className="message-content">
                  <p>{message.text}</p>
                  <span className="message-time">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message..."
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              aria-label="Envoyer le message"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
