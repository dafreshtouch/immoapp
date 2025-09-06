import React, { useState } from 'react';
import { Calendar as CalendarComponent } from '../components/Calendar';
import { EventModal } from '../components/EventModal';
import { EventViewModal } from '../components/EventViewModal';
import WeeklyChart from '../components/WeeklyChart';
import { useEvents, Event } from '../hooks/useEvents';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from '../hooks/useProjects';
import { useUnits } from '../hooks/useUnits';
import './Calendar.css';

export function Calendar() {
  const { user } = useAuth();
  const { projects } = useProjects();
  const { units } = useUnits();
  const { 
    events, 
    loading, 
    error, 
    addEvent: addEventToFirestore, 
    updateEvent: updateEventInFirestore,
    deleteEvent: deleteEventFromFirestore 
  } = useEvents();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const displayEvents = user ? events : [];

  const handleAddEvent = (date: string, time?: string) => {
    if (!user) {
      alert('Veuillez vous connecter pour ajouter des événements');
      return;
    }
    setSelectedDate(date);
    // Si une heure est fournie, on peut la passer au modal
    if (time) {
      // Stocker l'heure sélectionnée pour l'utiliser dans le modal
      localStorage.setItem('selectedTime', time);
    }
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (eventData: Omit<Event, 'id'>) => {
    if (!user) {
      alert('Veuillez vous connecter pour ajouter des événements');
      return;
    }

    try {
      await addEventToFirestore(eventData);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'événement:', error);
    }
  };

  const handleEventClick = (event: Event) => {
    // Si c'est un événement mis à jour par drag & drop, on le sauvegarde
    if (event.id && events.find(e => e.id === event.id)) {
      const existingEvent = events.find(e => e.id === event.id);
      if (existingEvent && (
        existingEvent.startTime !== event.startTime || 
        existingEvent.endTime !== event.endTime ||
        existingEvent.time !== event.time
      )) {
        // C'est un drag & drop, on met à jour l'événement
        handleUpdateEvent(event.id, {
          startTime: event.startTime,
          endTime: event.endTime,
          time: event.time
        });
        return;
      }
    }
    
    // Sinon, on ouvre le modal de visualisation
    setSelectedEvent(event);
    setIsViewModalOpen(true);
  };

  const handleUpdateEvent = async (eventId: string, updates: Partial<Event>) => {
    if (!user) {
      alert('Veuillez vous connecter pour modifier des événements');
      return;
    }

    try {
      console.log('Calendar - Updating event:', eventId, 'with updates:', updates);
      await updateEventInFirestore(eventId, updates);
      // Force refresh of the selected event
      const updatedEvent = events.find(e => e.id === eventId);
      if (updatedEvent) {
        setSelectedEvent({ ...updatedEvent, ...updates });
      }
      console.log('Calendar - Event updated successfully');
    } catch (error) {
      console.error('Erreur lors de la modification de l\'événement:', error);
      alert('Erreur lors de la sauvegarde des modifications');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!user) {
      alert('Veuillez vous connecter pour supprimer des événements');
      return;
    }

    try {
      await deleteEventFromFirestore(eventId);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement:', error);
    }
  };

  const upcomingEvents = displayEvents
    .filter(event => {
      const eventDate = new Date(event.date + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 8);

  return (
    <div className="page-container">
      <h1 className="page-title">Calendrier</h1>
      
      {loading && user && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Chargement des événements...
        </div>
      )}

      {error && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '12px', 
          borderRadius: '6px', 
          marginBottom: '20px' 
        }}>
          Erreur: {error}
        </div>
      )}

      <div className="calendar-layout">
        <div className="calendar-main">
          <CalendarComponent 
            events={displayEvents}
            onAddEvent={user ? handleAddEvent : undefined}
            onEventClick={user ? handleEventClick : undefined}
          />
        </div>
        
        <div className="calendar-sidebar">
          <div className="upcoming-events-card">
            <h3>Événements à venir</h3>
            <div className="upcoming-events-list">
              {upcomingEvents.length === 0 ? (
                <div className="no-events">
                  {user ? 'Aucun événement programmé' : 'Connectez-vous pour accéder au calendrier'}
                </div>
              ) : (
                upcomingEvents.map(event => (
                  <div key={event.id} className="upcoming-event" onClick={() => handleEventClick(event)}>
                    <div className="event-indicator-dot" style={{ backgroundColor: event.color || '#007bff' }}></div>
                    <div className="event-details">
                      <div className="event-title">{event.title}</div>
                      <div className="event-date">
                        {new Date(event.date).toLocaleDateString('fr-FR')}
                        {event.time && ` à ${event.time}`}
                      </div>
                      {event.projectId && (
                        <div className="event-project">
                          🏢 {projects.find(p => p.id === event.projectId)?.name || 'Projet'}
                          {event.unitId && ` - ${units.find(u => u.id === event.unitId)?.name || 'Unité'}`}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <WeeklyChart events={displayEvents} />
        </div>
      </div>
      
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        selectedDate={selectedDate}
      />

      <EventViewModal
        isOpen={isViewModalOpen}
        event={selectedEvent}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedEvent(null);
        }}
        onUpdate={handleUpdateEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}
