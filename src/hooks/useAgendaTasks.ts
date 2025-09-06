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

export interface AgendaTask {
  id: string;
  title: string;
  description?: string;
  type: 'visit' | 'meeting' | 'inspection' | 'maintenance' | 'call' | 'document' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  dueDate: Date;
  dueTime?: string; // Format HH:MM
  estimatedDuration?: number; // minutes
  location?: string;
  projectId?: string;
  unitId?: string;
  contractorId?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  notes?: string;
  attachments?: string[];
  completedAt?: Date;
  completedBy?: string;
  tags?: string[];
  isRecurring: boolean;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
  reminders?: number[]; // minutes before task
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useAgendaTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<AgendaTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks
  const fetchTasks = async (projectId?: string, startDate?: Date, endDate?: Date) => {
    if (!user) {
      console.log('useAgendaTasks: No user authenticated');
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`useAgendaTasks: Fetching tasks for user ${user.uid}`);
      const tasksRef = collection(db, 'agendaTasks');
      let q;

      if (projectId) {
        q = query(
          tasksRef,
          where('userId', '==', user.uid),
          where('projectId', '==', projectId),
          orderBy('dueDate', 'asc')
        );
      } else {
        q = query(
          tasksRef,
          where('userId', '==', user.uid),
          orderBy('dueDate', 'asc')
        );
      }

      const querySnapshot = await getDocs(q);
      console.log(`useAgendaTasks: Found ${querySnapshot.docs.length} tasks`);

      let tasksData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dueDate: data.dueDate?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate() || undefined,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          recurrence: data.recurrence ? {
            ...data.recurrence,
            endDate: data.recurrence.endDate?.toDate() || undefined
          } : undefined,
        };
      }) as AgendaTask[];

      // Filter by date range if provided
      if (startDate && endDate) {
        tasksData = tasksData.filter(task => 
          task.dueDate >= startDate && task.dueDate <= endDate
        );
      }

      setTasks(tasksData);
      setError(null);
      console.log('useAgendaTasks: Tasks loaded successfully:', tasksData);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(`Erreur lors du chargement des tâches: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Add new task
  const addTask = async (taskData: Omit<AgendaTask, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      console.log('useAgendaTasks: Adding new task:', taskData);
      
      // Validate required fields
      if (!taskData.title || !taskData.dueDate) {
        throw new Error('Le titre et la date sont obligatoires');
      }

      // Clean undefined values from taskData
      const cleanTaskData = Object.fromEntries(
        Object.entries(taskData).filter(([_, value]) => value !== undefined && value !== '')
      );

      const newTask: any = {
        ...cleanTaskData,
        userId: user.uid,
        dueDate: Timestamp.fromDate(taskData.dueDate),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Only add optional fields if they have values
      if (taskData.completedAt) {
        newTask.completedAt = Timestamp.fromDate(taskData.completedAt);
      }

      if (taskData.recurrence && taskData.recurrence.endDate) {
        newTask.recurrence = {
          ...taskData.recurrence,
          endDate: Timestamp.fromDate(taskData.recurrence.endDate)
        };
      } else if (taskData.recurrence) {
        newTask.recurrence = {
          frequency: taskData.recurrence.frequency,
          interval: taskData.recurrence.interval
        };
      }

      console.log('useAgendaTasks: Processed task data for Firestore:', newTask);

      const docRef = await addDoc(collection(db, 'agendaTasks'), newTask);
      console.log('useAgendaTasks: Task added with ID:', docRef.id);
      
      await fetchTasks(); // Refresh data
      return docRef.id;
    } catch (err) {
      console.error('useAgendaTasks: Error adding task:', err);
      console.error('useAgendaTasks: Error details:', err);
      throw new Error(`Erreur lors de l'ajout de la tâche: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Update task
  const updateTask = async (id: string, updates: Partial<Omit<AgendaTask, 'id' | 'createdAt' | 'userId'>>) => {
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      console.log('useAgendaTasks: Updating task:', id, updates);
      const taskRef = doc(db, 'agendaTasks', id);
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      // Convert dates to Timestamps
      if (updates.dueDate) {
        updateData.dueDate = Timestamp.fromDate(updates.dueDate);
      }
      if (updates.completedAt) {
        updateData.completedAt = Timestamp.fromDate(updates.completedAt);
      }
      if (updates.recurrence?.endDate) {
        updateData.recurrence = {
          ...updates.recurrence,
          endDate: Timestamp.fromDate(updates.recurrence.endDate)
        };
      }

      await updateDoc(taskRef, updateData);
      console.log('useAgendaTasks: Task updated successfully');
      await fetchTasks(); // Refresh data
    } catch (err) {
      console.error('Error updating task:', err);
      throw new Error(`Erreur lors de la mise à jour de la tâche: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Delete task
  const deleteTask = async (id: string) => {
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      console.log('useAgendaTasks: Deleting task:', id);
      await deleteDoc(doc(db, 'agendaTasks', id));
      console.log('useAgendaTasks: Task deleted successfully');
      
      await fetchTasks(); // Refresh data
    } catch (err) {
      console.error('Error deleting task:', err);
      throw new Error(`Erreur lors de la suppression de la tâche: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Complete task
  const completeTask = async (id: string) => {
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    await updateTask(id, {
      status: 'completed',
      completedAt: new Date(),
      completedBy: user.displayName || user.email || 'Utilisateur'
    });
  };

  // Get tasks for today
  const getTodayTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return tasks.filter(task => 
      task.dueDate >= today && task.dueDate < tomorrow
    );
  };

  // Get overdue tasks
  const getOverdueTasks = () => {
    const now = new Date();
    return tasks.filter(task => 
      task.dueDate < now && task.status !== 'completed' && task.status !== 'cancelled'
    );
  };

  // Get upcoming tasks (next 7 days)
  const getUpcomingTasks = (days: number = 7) => {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return tasks.filter(task => 
      task.dueDate >= now && 
      task.dueDate <= futureDate &&
      task.status !== 'completed' && 
      task.status !== 'cancelled'
    );
  };

  // Get tasks by status
  const getTasksByStatus = (status: AgendaTask['status']) => {
    return tasks.filter(task => task.status === status);
  };

  // Get tasks by type
  const getTasksByType = (type: AgendaTask['type']) => {
    return tasks.filter(task => task.type === type);
  };

  // Get tasks by priority
  const getTasksByPriority = (priority: AgendaTask['priority']) => {
    return tasks.filter(task => task.priority === priority);
  };

  // Get tasks by project
  const getTasksByProject = (projectId: string) => {
    return tasks.filter(task => task.projectId === projectId);
  };

  // Search tasks
  const searchTasks = (searchTerm: string) => {
    const term = searchTerm.toLowerCase();
    return tasks.filter(task =>
      task.title.toLowerCase().includes(term) ||
      task.description?.toLowerCase().includes(term) ||
      task.location?.toLowerCase().includes(term) ||
      task.clientName?.toLowerCase().includes(term) ||
      task.tags?.some(tag => tag.toLowerCase().includes(term))
    );
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    fetchTasks,
    getTodayTasks,
    getOverdueTasks,
    getUpcomingTasks,
    getTasksByStatus,
    getTasksByType,
    getTasksByPriority,
    getTasksByProject,
    searchTasks,
  };
};
