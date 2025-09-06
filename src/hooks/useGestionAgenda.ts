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

export interface GestionEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  location?: string;
  type: 'meeting' | 'inspection' | 'maintenance' | 'deadline' | 'reminder' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  participants?: string[];
  projectId?: string;
  unitId?: string;
  contractorId?: string;
  reminders?: number[]; // minutes before event
  recurrence?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useGestionAgenda = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<GestionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events
  const fetchEvents = async (startDate?: Date, endDate?: Date) => {
    if (!user) {
      console.log('useGestionAgenda: No user authenticated');
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`useGestionAgenda: Fetching events for user ${user.uid}`);
      const eventsRef = collection(db, 'gestionAgenda');
      let q = query(
        eventsRef,
        where('userId', '==', user.uid),
        orderBy('startDate', 'asc')
      );

      const querySnapshot = await getDocs(q);
      console.log(`useGestionAgenda: Found ${querySnapshot.docs.length} events`);

      let eventsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          recurrence: data.recurrence ? {
            ...data.recurrence,
            endDate: data.recurrence.endDate?.toDate()
          } : undefined,
        };
      }) as GestionEvent[];

      // Filter by date range if provided
      if (startDate && endDate) {
        eventsData = eventsData.filter(event => 
          event.startDate >= startDate && event.startDate <= endDate
        );
      }

      setEvents(eventsData);
      setError(null);
      console.log('useGestionAgenda: Events loaded successfully:', eventsData);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(`Erreur lors du chargement des événements: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Add new event
  const addEvent = async (eventData: Omit<GestionEvent, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      console.log('useGestionAgenda: Adding new event:', eventData);
      const newEvent = {
        ...eventData,
        userId: user.uid,
        startDate: Timestamp.fromDate(eventData.startDate),
        endDate: Timestamp.fromDate(eventData.endDate),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        recurrence: eventData.recurrence ? {
          ...eventData.recurrence,
          endDate: eventData.recurrence.endDate ? Timestamp.fromDate(eventData.recurrence.endDate) : undefined
        } : undefined,
      };

      const docRef = await addDoc(collection(db, 'gestionAgenda'), newEvent);
      console.log('useGestionAgenda: Event added with ID:', docRef.id);
      
      await fetchEvents(); // Refresh data
      return docRef.id;
    } catch (err) {
      console.error('Error adding event:', err);
      throw new Error(`Erreur lors de l'ajout de l'événement: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Update event
  const updateEvent = async (id: string, updates: Partial<Omit<GestionEvent, 'id' | 'createdAt' | 'userId'>>) => {
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      console.log('useGestionAgenda: Updating event:', id, updates);
      const eventRef = doc(db, 'gestionAgenda', id);
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      // Convert dates to Timestamps
      if (updates.startDate) {
        updateData.startDate = Timestamp.fromDate(updates.startDate);
      }
      if (updates.endDate) {
        updateData.endDate = Timestamp.fromDate(updates.endDate);
      }
      if (updates.recurrence?.endDate) {
        updateData.recurrence = {
          ...updates.recurrence,
          endDate: Timestamp.fromDate(updates.recurrence.endDate)
        };
      }

      await updateDoc(eventRef, updateData);
      console.log('useGestionAgenda: Event updated successfully');
      await fetchEvents(); // Refresh data
    } catch (err) {
      console.error('Error updating event:', err);
      throw new Error(`Erreur lors de la mise à jour de l'événement: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Delete event
  const deleteEvent = async (id: string) => {
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      console.log('useGestionAgenda: Deleting event:', id);
      await deleteDoc(doc(db, 'gestionAgenda', id));
      console.log('useGestionAgenda: Event deleted successfully');
      
      await fetchEvents(); // Refresh data
    } catch (err) {
      console.error('Error deleting event:', err);
      throw new Error(`Erreur lors de la suppression de l'événement: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Get events for today
  const getTodayEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return events.filter(event => 
      event.startDate >= today && event.startDate < tomorrow
    );
  };

  // Get upcoming events (next 7 days)
  const getUpcomingEvents = (days: number = 7) => {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return events.filter(event => 
      event.startDate >= now && event.startDate <= futureDate
    );
  };

  // Get events by type
  const getEventsByType = (type: GestionEvent['type']) => {
    return events.filter(event => event.type === type);
  };

  // Get events by project
  const getEventsByProject = (projectId: string) => {
    return events.filter(event => event.projectId === projectId);
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  return {
    events,
    loading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    fetchEvents,
    getTodayEvents,
    getUpcomingEvents,
    getEventsByType,
    getEventsByProject,
  };
};
