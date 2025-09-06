import React from 'react';
import './WeeklyChart.css';

interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
}

interface WeeklyChartProps {
  events: Event[];
}

const WeeklyChart: React.FC<WeeklyChartProps> = ({ events }) => {
  const calculateWeeklyStats = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Filtrer les événements de cette semaine
    const weekEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });

    // Calculer les heures occupées par jour
    const dailyHours = Array(7).fill(0);
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    
    console.log('WeeklyChart - Events for this week:', weekEvents.length);
    
    weekEvents.forEach(event => {
      const eventDate = new Date(event.date);
      const dayIndex = eventDate.getDay();
      
      let duration = 1; // Durée par défaut: 1 heure
      
      console.log(`Event: ${event.title}, Date: ${event.date}, StartTime: ${event.startTime}, EndTime: ${event.endTime}`);
      
      // Prioriser startTime/endTime pour le calcul de durée
      if (event.startTime && event.endTime) {
        const [startHour, startMin] = event.startTime.split(':').map(Number);
        const [endHour, endMin] = event.endTime.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        
        if (endMinutes > startMinutes) {
          duration = (endMinutes - startMinutes) / 60; // Convertir en heures
          console.log(`Calculated duration from times: ${duration}h (${startMinutes}min to ${endMinutes}min)`);
        }
      } else if (event.duration) {
        // Utiliser la durée existante si pas de startTime/endTime
        duration = event.duration;
        console.log(`Using existing duration: ${duration}h`);
      } else if (event.time) {
        // Si seulement time est disponible, utiliser 1h par défaut
        console.log(`Using default duration: ${duration}h for time: ${event.time}`);
      }
      
      dailyHours[dayIndex] += duration;
      console.log(`Day ${dayIndex} (${['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][dayIndex]}) total hours: ${dailyHours[dayIndex]}h`);
    });

    // Calculer le pourcentage (sur 8h de travail par jour)
    const workingHoursPerDay = 8;
    const percentages = dailyHours.map(hours => 
      Math.min((hours / workingHoursPerDay) * 100, 100)
    );

    const totalHours = dailyHours.reduce((sum, hours) => sum + hours, 0);
    const totalWorkingHours = workingHoursPerDay * 7;
    const weeklyPercentage = (totalHours / totalWorkingHours) * 100;

    return {
      dailyHours,
      percentages,
      dayNames,
      weeklyPercentage: Math.min(weeklyPercentage, 100),
      totalHours
    };
  };

  const stats = calculateWeeklyStats();

  return (
    <div className="weekly-chart">
      <div className="chart-header">
        <h3>Occupation hebdomadaire</h3>
        <div className="weekly-stats">
          <span className="total-percentage">{stats.weeklyPercentage.toFixed(1)}%</span>
          <span className="total-hours">{stats.totalHours}h / 56h</span>
        </div>
      </div>
      
      <div className="chart-container">
        <div className="chart-bars">
          {stats.dayNames.map((day, index) => (
            <div key={day} className="day-bar">
              <div className="bar-container">
                <div 
                  className="bar-fill"
                  style={{ 
                    height: `${stats.percentages[index]}%`,
                    backgroundColor: stats.percentages[index] > 80 ? '#dc3545' : 
                                   stats.percentages[index] > 60 ? '#ffc107' : '#28a745'
                  }}
                />
              </div>
              <div className="day-label">{day}</div>
              <div className="hours-label">{stats.dailyHours[index]}h</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#28a745' }}></div>
          <span>Optimal (&lt;60%)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ffc107' }}></div>
          <span>Chargé (60-80%)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#dc3545' }}></div>
          <span>Surchargé (&gt;80%)</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyChart;
