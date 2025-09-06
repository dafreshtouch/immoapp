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
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  sender: string;
  recipient: string;
  projectId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GestionTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  projectId?: string;
  dueDate?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contractor {
  id: string;
  name: string;
  company: string;
  specialty: string;
  phone: string;
  email: string;
  address?: string;
  rating?: number;
  activeProjects: string[];
  totalProjects: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  name: string;
  type: 'contract' | 'invoice' | 'report' | 'certificate' | 'other';
  url: string;
  size: number;
  projectId?: string;
  unitId?: string;
  contractorId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useGestion = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<GestionMessage[]>([]);
  const [tasks, setTasks] = useState<GestionTask[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch messages
  const fetchMessages = async () => {
    if (!user) return;

    try {
      const messagesRef = collection(db, 'gestionMessages');
      const q = query(
        messagesRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const messagesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as GestionMessage[];
      
      setMessages(messagesData);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  // Fetch tasks
  const fetchTasks = async () => {
    if (!user) return;

    try {
      const tasksRef = collection(db, 'gestionTasks');
      const q = query(
        tasksRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const tasksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        dueDate: doc.data().dueDate?.toDate(),
      })) as GestionTask[];
      
      setTasks(tasksData);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  // Fetch contractors
  const fetchContractors = async () => {
    if (!user) return;

    try {
      const contractorsRef = collection(db, 'contractors');
      const q = query(
        contractorsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const contractorsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Contractor[];
      
      setContractors(contractorsData);
    } catch (err) {
      console.error('Error fetching contractors:', err);
    }
  };

  // Fetch documents
  const fetchDocuments = async () => {
    if (!user) return;

    try {
      const documentsRef = collection(db, 'documents');
      const q = query(
        documentsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const documentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Document[];
      
      setDocuments(documentsData);
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  // Add message
  const addMessage = async (messageData: Omit<GestionMessage, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const messagesRef = collection(db, 'gestionMessages');
      const newMessage = {
        ...messageData,
        userId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(messagesRef, newMessage);
      await fetchMessages();
    } catch (err) {
      console.error('Error adding message:', err);
      throw new Error('Erreur lors de la création du message');
    }
  };

  // Add task
  const addTask = async (taskData: Omit<GestionTask, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const tasksRef = collection(db, 'gestionTasks');
      const newTask = {
        ...taskData,
        userId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        dueDate: taskData.dueDate ? Timestamp.fromDate(taskData.dueDate) : null,
      };

      await addDoc(tasksRef, newTask);
      await fetchTasks();
    } catch (err) {
      console.error('Error adding task:', err);
      throw new Error('Erreur lors de la création de la tâche');
    }
  };

  // Add contractor
  const addContractor = async (contractorData: Omit<Contractor, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const contractorsRef = collection(db, 'contractors');
      const newContractor = {
        ...contractorData,
        userId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(contractorsRef, newContractor);
      await fetchContractors();
    } catch (err) {
      console.error('Error adding contractor:', err);
      throw new Error('Erreur lors de la création du prestataire');
    }
  };

  // Update message (mark as read)
  const markMessageAsRead = async (messageId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const messageRef = doc(db, 'gestionMessages', messageId);
      await updateDoc(messageRef, {
        isRead: true,
        updatedAt: Timestamp.now(),
      });
      await fetchMessages();
    } catch (err) {
      console.error('Error updating message:', err);
      throw new Error('Erreur lors de la mise à jour du message');
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId: string, status: GestionTask['status']) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const taskRef = doc(db, 'gestionTasks', taskId);
      await updateDoc(taskRef, {
        status,
        updatedAt: Timestamp.now(),
      });
      await fetchTasks();
    } catch (err) {
      console.error('Error updating task:', err);
      throw new Error('Erreur lors de la mise à jour de la tâche');
    }
  };

  // Get unread messages count
  const getUnreadMessagesCount = () => {
    return messages.filter(msg => !msg.isRead).length;
  };

  // Get pending tasks count
  const getPendingTasksCount = () => {
    return tasks.filter(task => task.status === 'pending').length;
  };

  // Get active contractors count
  const getActiveContractorsCount = () => {
    return contractors.filter(contractor => contractor.activeProjects.length > 0).length;
  };

  useEffect(() => {
    const fetchAllData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        await Promise.all([
          fetchMessages(),
          fetchTasks(),
          fetchContractors(),
          fetchDocuments()
        ]);
        setError(null);
      } catch (err) {
        console.error('Error fetching gestion data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user]);

  return {
    messages,
    tasks,
    contractors,
    documents,
    loading,
    error,
    addMessage,
    addTask,
    addContractor,
    markMessageAsRead,
    updateTaskStatus,
    getUnreadMessagesCount,
    getPendingTasksCount,
    getActiveContractorsCount,
    refreshData: () => {
      fetchMessages();
      fetchTasks();
      fetchContractors();
      fetchDocuments();
    }
  };
};
