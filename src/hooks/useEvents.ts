import { useFirestore } from './useFirestore';

export interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  color?: string;
  category?: string;
  projectId?: string;
  unitId?: string;
  location?: string;
  additionalInfo?: string;
  cost?: number;
  images?: string[];
  userId?: string;
  createdAt?: any;
  updatedAt?: any;
}

export function useEvents() {
  const {
    data: events,
    loading,
    error,
    addItem: addEvent,
    updateItem: updateEvent,
    deleteItem: deleteEvent
  } = useFirestore<Event>('calendar');

  return {
    events,
    loading,
    error,
    addEvent,
    updateEvent,
    deleteEvent
  };
}
