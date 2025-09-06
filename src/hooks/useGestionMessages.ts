import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

export interface GestionMessage {
  id: string;
  subject: string;
  content: string;
  sender: string;
  recipient?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'archived';
  category: 'general' | 'maintenance' | 'urgent' | 'info';
  attachments?: string[];
  projectId?: string;
  unitId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date;
}

export const useGestionMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<GestionMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch messages
  const fetchMessages = async () => {
    if (!user) {
      console.log('useGestionMessages: No user authenticated');
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`useGestionMessages: Fetching messages for user ${user.uid}`);
      const messagesRef = collection(db, 'gestionMessages');
      const q = query(
        messagesRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      console.log(`useGestionMessages: Found ${querySnapshot.docs.length} messages`);

      const messagesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('useGestionMessages: Message data:', { id: doc.id, ...data });
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          readAt: data.readAt?.toDate() || undefined,
        };
      }) as GestionMessage[];

      setMessages(messagesData);
      setError(null);
      console.log('useGestionMessages: Messages loaded successfully:', messagesData);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(`Erreur lors du chargement des messages: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Add new message
  const addMessage = async (messageData: Omit<GestionMessage, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      console.log('useGestionMessages: Adding new message:', messageData);
      const newMessage = {
        ...messageData,
        userId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'gestionMessages'), newMessage);
      console.log('useGestionMessages: Message added with ID:', docRef.id);
      
      await fetchMessages(); // Refresh data
      return docRef.id;
    } catch (err) {
      console.error('Error adding message:', err);
      throw new Error(`Erreur lors de l'ajout du message: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Update message
  const updateMessage = async (id: string, updates: Partial<Omit<GestionMessage, 'id' | 'createdAt' | 'userId'>>) => {
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      console.log('useGestionMessages: Updating message:', id, updates);
      const messageRef = doc(db, 'gestionMessages', id);
      await updateDoc(messageRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
      
      console.log('useGestionMessages: Message updated successfully');
      await fetchMessages(); // Refresh data
    } catch (err) {
      console.error('Error updating message:', err);
      throw new Error(`Erreur lors de la mise à jour du message: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Mark message as read
  const markAsRead = async (id: string) => {
    await updateMessage(id, { 
      status: 'read',
      readAt: new Date()
    });
  };

  // Delete message
  const deleteMessage = async (id: string) => {
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      console.log('useGestionMessages: Deleting message:', id);
      await deleteDoc(doc(db, 'gestionMessages', id));
      console.log('useGestionMessages: Message deleted successfully');
      
      await fetchMessages(); // Refresh data
    } catch (err) {
      console.error('Error deleting message:', err);
      throw new Error(`Erreur lors de la suppression du message: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Get unread count
  const getUnreadCount = () => {
    return messages.filter(message => message.status === 'unread').length;
  };

  // Get messages by priority
  const getMessagesByPriority = (priority: GestionMessage['priority']) => {
    return messages.filter(message => message.priority === priority);
  };

  // Get messages by category
  const getMessagesByCategory = (category: GestionMessage['category']) => {
    return messages.filter(message => message.category === category);
  };

  useEffect(() => {
    fetchMessages();
  }, [user]);

  return {
    messages,
    loading,
    error,
    addMessage,
    updateMessage,
    markAsRead,
    deleteMessage,
    fetchMessages,
    getUnreadCount,
    getMessagesByPriority,
    getMessagesByCategory,
  };
};
