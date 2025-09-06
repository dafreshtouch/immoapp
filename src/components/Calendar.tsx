import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarIcon, List, Plus, Grid3X3 } from 'lucide-react';
import './Calendar.css';

interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  startTime?: string;
  endTime?: string;
  color?: string;
  category?: string;
}

interface CalendarProps {
  events: Event[];
  onAddEvent?: (date: string, time?: string) => void;
  onEventClick?: (event: Event) => void;
}

export function Calendar({ events = [], onAddEvent, onEventClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  
  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  
  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const dayNamesShort = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  
  // Obtenir le premier jour du mois et le nombre de jours
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Générer les jours du calendrier
  const calendarDays = [];
  
  // Jours du mois précédent
  const prevMonth = new Date(currentYear, currentMonth - 1, 0);
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonth.getDate() - i,
      isCurrentMonth: false,
      date: new Date(currentYear, currentMonth - 1, prevMonth.getDate() - i)
    });
  }
  
  // Jours du mois actuel
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      date: new Date(currentYear, currentMonth, day)
    });
  }
  
  // Jours du mois suivant pour compléter la grille
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: new Date(currentYear, currentMonth + 1, day)
    });
  }
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(prev.getDate() - 7);
      } else {
        newDate.setDate(prev.getDate() + 7);
      }
      return newDate;
    });
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(prev.getDate() - 1);
      } else {
        newDate.setDate(prev.getDate() + 1);
      }
      return newDate;
    });
  };
  
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };
  
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };
  
  const handleDayClick = (date: Date) => {
    if (viewMode === 'month') {
      setCurrentDate(date);
      setViewMode('day');
    } else if (viewMode === 'week') {
      setCurrentDate(date);
      setViewMode('day');
    } else if (onAddEvent) {
      const dateString = date.toISOString().split('T')[0];
      onAddEvent(dateString);
    }
  };

  const formatDayDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Lundi = début de semaine
    startOfWeek.setDate(diff);
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  const formatWeekRange = (date: Date) => {
    const weekDays = getWeekDays(date);
    const start = weekDays[0];
    const end = weekDays[6];
    
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} ${monthNames[start.getMonth()]} ${start.getFullYear()}`;
    } else {
      return `${start.getDate()} ${monthNames[start.getMonth()]} - ${end.getDate()} ${monthNames[end.getMonth()]} ${start.getFullYear()}`;
    }
  };

  const getEventPosition = (event: Event) => {
    let startMinutes = 0;
    let duration = 60; // Durée par défaut: 1 heure

    if (event.startTime) {
      const [startHour, startMin] = event.startTime.split(':').map(Number);
      startMinutes = startHour * 60 + startMin;
      
      if (event.endTime) {
        const [endHour, endMin] = event.endTime.split(':').map(Number);
        const endMinutes = endHour * 60 + endMin;
        if (endMinutes > startMinutes) {
          duration = endMinutes - startMinutes;
        }
      }
    } else if (event.time) {
      const [hour, min] = event.time.split(':').map(Number);
      startMinutes = hour * 60 + min;
    }

    const pixelsPerMinute = 1; // 1 pixel par minute (60px par heure)
    const top = startMinutes * pixelsPerMinute;
    const height = Math.max(duration * pixelsPerMinute, 20); // Hauteur minimale de 20px

    return { top, height };
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);

    return (
      <div className="week-view">
        <div className="week-view-header">
          <div className="week-days-header">
            <div className="time-column-header"></div>
            {weekDays.map((day, index) => (
              <div key={index} className="week-day-header">
                <div className="week-day-name">{dayNamesShort[day.getDay()]}</div>
                <div className={`week-day-number ${isToday(day) ? 'today' : ''}`}>
                  {day.getDate()}
                </div>
                <div className="week-day-month">
                  {day.getMonth() !== currentDate.getMonth() ? monthNames[day.getMonth()].substring(0, 3) : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="week-view-content">
          <div className="week-time-grid">
            {/* Grille des heures */}
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="week-hour-row">
                <div className="week-hour-label">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="week-hour-content">
                  {/* Lignes de 15 minutes */}
                  {Array.from({ length: 4 }, (_, quarter) => {
                    const quarterMinutes = hour * 60 + quarter * 15;
                    return (
                      <div key={quarter} className="week-quarter-row">
                        {weekDays.map((day, dayIndex) => (
                          <div 
                            key={dayIndex} 
                            className={`week-quarter-slot ${quarter === 0 ? 'hour-start' : ''} ${draggedEvent && isDragging ? 'drag-target' : ''}`}
                            onClick={() => {
                              if (onAddEvent && !isDragging) {
                                const dateString = day.toISOString().split('T')[0];
                                const timeString = `${hour.toString().padStart(2, '0')}:${(quarter * 15).toString().padStart(2, '0')}`;
                                onAddEvent(dateString, timeString);
                              }
                            }}
                            onDragOver={handleTimeSlotDragOver}
                            onDrop={(e) => {
                              // Calculer la position exacte du drop dans ce créneau
                              const rect = e.currentTarget.getBoundingClientRect();
                              const relativeY = e.clientY - rect.top;
                              const slotProgress = relativeY / rect.height;
                              const exactMinutes = quarterMinutes + (slotProgress * 15);
                              handleTimeSlotDrop(exactMinutes, e);
                            }}
                          >
                            {quarter > 0 && (
                              <div className="week-quarter-line"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {/* Événements positionnés absolument */}
            {weekDays.map((day, dayIndex) => {
              const dayEvents = getEventsForDate(day);
              return dayEvents.map(event => {
                const { top, height } = getEventPosition(event);
                return (
                  <div
                    key={`${event.id}-${dayIndex}`}
                    className={`week-event-positioned ${draggedEvent?.id === event.id && isDragging ? 'dragging' : ''}`}
                    style={{ 
                      backgroundColor: event.color || '#007bff',
                      top: `${top}px`,
                      height: `${height}px`,
                      position: 'absolute',
                      left: `calc(80px + ${dayIndex} * (100% - 80px) / 7 + 3px)`,
                      width: `calc((100% - 80px) / 7 - 6px)`,
                      zIndex: draggedEvent?.id === event.id && isDragging ? 100 : 10
                    }}
                    draggable={true}
                    onDragStart={(e) => handleEventDragStart(event, e)}
                    onDragEnd={handleEventDragEnd}
                    onClick={(e) => handleEventClick(event, e)}
                  >
                    <div className="week-event-title">{event.title}</div>
                    {(event.startTime || event.time) && (
                      <div className="week-event-time">
                        {event.startTime && event.endTime 
                          ? `${event.startTime} - ${event.endTime}`
                          : event.startTime || event.time
                        }
                      </div>
                    )}
                  </div>
                );
              });
            })}
          </div>
        </div>
      </div>
    );
  };

  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartTime, setDragStartTime] = useState<number>(0);

  const handleTimeSlotClick = (hour: number) => {
    if (onAddEvent && !isDragging) {
      const dateString = currentDate.toISOString().split('T')[0];
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      onAddEvent(dateString, timeString);
    }
  };

  const handleEventDragStart = (event: Event, e: React.DragEvent) => {
    setDraggedEvent(event);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', event.id);
  };

  const handleEventDragEnd = () => {
    setIsDragging(false);
    setDraggedEvent(null);
  };

  const handleTimeSlotDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleTimeSlotDrop = (targetMinutes: number, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedEvent && onEventClick) {
      // Arrondir aux tranches de 15 minutes les plus proches
      const roundedMinutes = Math.round(targetMinutes / 15) * 15;
      const targetHour = Math.floor(roundedMinutes / 60);
      const targetMin = roundedMinutes % 60;
      const newStartTime = `${targetHour.toString().padStart(2, '0')}:${targetMin.toString().padStart(2, '0')}`;
      
      // Calculer la durée de l'événement
      let duration = 60; // Durée par défaut: 1 heure
      if (draggedEvent.startTime && draggedEvent.endTime) {
        const [startHour, startMin] = draggedEvent.startTime.split(':').map(Number);
        const [endHour, endMin] = draggedEvent.endTime.split(':').map(Number);
        duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
      }
      
      // Calculer la nouvelle heure de fin
      const endTotalMinutes = roundedMinutes + duration;
      const endHour = Math.floor(endTotalMinutes / 60);
      const endMin = endTotalMinutes % 60;
      const newEndTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
      
      console.log(`Drag drop: ${targetMinutes}min -> ${roundedMinutes}min (${newStartTime} - ${newEndTime})`);
      
      const updatedEvent = {
        ...draggedEvent,
        startTime: newStartTime,
        endTime: newEndTime,
        time: newStartTime // Maintenir la compatibilité
      };
      onEventClick(updatedEvent);
    }
    setIsDragging(false);
    setDraggedEvent(null);
  };

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    if (!isDragging) {
      e.stopPropagation();
      onEventClick?.(event);
    }
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const timeSlots = Array.from({ length: 96 }, (_, i) => i * 15); // Créneaux de 15 minutes (96 créneaux par jour)

    const getEventPosition = (event: Event) => {
      let startMinutes = 0;
      let duration = 60; // Durée par défaut: 1 heure

      if (event.startTime) {
        const [startHour, startMin] = event.startTime.split(':').map(Number);
        startMinutes = startHour * 60 + startMin;
        
        if (event.endTime) {
          const [endHour, endMin] = event.endTime.split(':').map(Number);
          const endMinutes = endHour * 60 + endMin;
          duration = endMinutes - startMinutes;
        }
      } else if (event.time) {
        const [hour, min] = event.time.split(':').map(Number);
        startMinutes = hour * 60 + min;
      }

      const slotHeight = 60; // Hauteur d'un créneau d'1 heure en pixels
      const top = (startMinutes / 60) * slotHeight;
      const height = Math.max((duration / 60) * slotHeight, 20); // Hauteur minimale de 20px

      return { top, height };
    };

    return (
      <div className="day-view">
        <div className="day-view-header">
          <h3>{formatDayDate(currentDate)}</h3>
          {onAddEvent && (
            <button 
              className="add-event-btn-day"
              onClick={() => {
                const dateString = currentDate.toISOString().split('T')[0];
                onAddEvent(dateString);
              }}
            >
              <Plus size={16} />
              Ajouter un événement
            </button>
          )}
        </div>
        
        <div className="day-view-content">
          <div className="time-grid">
            {/* Grille des heures */}
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="hour-row">
                <div className="hour-label">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="hour-content">
                  {/* Lignes de 15 minutes */}
                  {Array.from({ length: 4 }, (_, quarter) => {
                    const quarterMinutes = hour * 60 + quarter * 15;
                    return (
                      <div 
                        key={quarter} 
                        className={`quarter-slot ${quarter === 0 ? 'hour-start' : ''} ${draggedEvent && isDragging ? 'drag-target' : ''}`}
                        onClick={() => handleTimeSlotClick(hour)}
                        onDragOver={handleTimeSlotDragOver}
                        onDrop={(e) => {
                          // Calculer la position exacte du drop dans ce créneau
                          const rect = e.currentTarget.getBoundingClientRect();
                          const relativeY = e.clientY - rect.top;
                          const slotProgress = relativeY / rect.height;
                          const exactMinutes = quarterMinutes + (slotProgress * 15);
                          handleTimeSlotDrop(exactMinutes, e);
                        }}
                      >
                        {quarter > 0 && (
                          <div className="quarter-line"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {/* Événements positionnés absolument */}
            <div className="events-overlay">
              {dayEvents.map(event => {
                const { top, height } = getEventPosition(event);
                return (
                  <div
                    key={event.id}
                    className={`day-event-positioned draggable-event ${draggedEvent?.id === event.id && isDragging ? 'dragging' : ''}`}
                    style={{ 
                      backgroundColor: event.color || '#007bff',
                      opacity: draggedEvent?.id === event.id && isDragging ? 0.5 : 1,
                      top: `${top}px`,
                      height: `${height}px`,
                      left: '60px',
                      right: '20px',
                      position: 'absolute',
                      zIndex: 10
                    }}
                    draggable={true}
                    onDragStart={(e) => handleEventDragStart(event, e)}
                    onDragEnd={handleEventDragEnd}
                    onClick={(e) => handleEventClick(event, e)}
                  >
                    <div className="day-event-title">{event.title}</div>
                    {(event.startTime || event.time) && (
                      <div className="day-event-time">
                        {event.startTime && event.endTime 
                          ? `${event.startTime} - ${event.endTime}`
                          : event.startTime || event.time
                        }
                      </div>
                    )}
                    <div className="drag-handle">⋮⋮</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button 
          className="nav-button"
          onClick={() => {
            if (viewMode === 'month') navigateMonth('prev');
            else if (viewMode === 'week') navigateWeek('prev');
            else navigateDay('prev');
          }}
        >
          <ChevronLeft size={20} />
        </button>
        
        <h2 className="calendar-title">
          {viewMode === 'month' 
            ? `${monthNames[currentMonth]} ${currentYear}`
            : viewMode === 'week'
            ? formatWeekRange(currentDate)
            : formatDayDate(currentDate)
          }
        </h2>
        
        <button 
          className="nav-button"
          onClick={() => {
            if (viewMode === 'month') navigateMonth('next');
            else if (viewMode === 'week') navigateWeek('next');
            else navigateDay('next');
          }}
        >
          <ChevronRight size={20} />
        </button>
        
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => setViewMode('month')}
          >
            <CalendarIcon size={16} />
            Mois
          </button>
          <button
            className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => setViewMode('week')}
          >
            <Grid3X3 size={16} />
            Semaine
          </button>
          <button
            className={`view-btn ${viewMode === 'day' ? 'active' : ''}`}
            onClick={() => setViewMode('day')}
          >
            <List size={16} />
            Jour
          </button>
        </div>
      </div>
      
      {viewMode === 'month' ? (
        <div className="calendar-grid">
          {dayNamesShort.map(day => (
            <div key={day} className="day-header">
              {day}
            </div>
          ))}
          
          {calendarDays.map((calendarDay, index) => {
            const dayEvents = getEventsForDate(calendarDay.date);
            
            return (
              <div
                key={index}
                className={`calendar-day ${
                  !calendarDay.isCurrentMonth ? 'other-month' : ''
                } ${isToday(calendarDay.date) ? 'today' : ''}`}
                onClick={() => handleDayClick(calendarDay.date)}
              >
                <span className="day-number">{calendarDay.day}</span>
                {dayEvents.length > 0 && (
                  <div className="events-indicator">
                    {dayEvents.slice(0, 2).map(event => (
                      <div 
                        key={event.id} 
                        className="event-indicator"
                        title={event.title}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                        style={{ 
                          cursor: 'pointer',
                          backgroundColor: event.color || '#007bff'
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="more-events">+{dayEvents.length - 2}</div>
                    )}
                  </div>
                )}
                {onAddEvent && (
                  <button className="add-event-btn" title="Ajouter un événement">
                    <Plus size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : viewMode === 'week' ? (
        renderWeekView()
      ) : (
        renderDayView()
      )}
    </div>
  );
}
