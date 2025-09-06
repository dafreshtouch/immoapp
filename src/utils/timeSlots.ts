// Utilitaire pour générer les créneaux de 15 minutes
export const generateTimeSlots = () => {
  return Array.from({ length: 96 }, (_, i) => {
    const totalMinutes = i * 15;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  });
};

// Valider qu'une heure est dans un créneau de 15 minutes
export const isValidTimeSlot = (time: string): boolean => {
  if (!time || !time.includes(':')) return false;
  
  const [hours, minutes] = time.split(':').map(Number);
  
  // Vérifier que les heures sont valides (0-23)
  if (hours < 0 || hours > 23) return false;
  
  // Vérifier que les minutes sont des multiples de 15
  return minutes % 15 === 0 && minutes >= 0 && minutes < 60;
};

// Arrondir une heure au créneau de 15 minutes le plus proche
export const roundToNearestTimeSlot = (time: string): string => {
  if (!time || !time.includes(':')) return '00:00';
  
  const [hours, minutes] = time.split(':').map(Number);
  const roundedMinutes = Math.round(minutes / 15) * 15;
  
  let finalHours = hours;
  let finalMinutes = roundedMinutes;
  
  // Gérer le cas où les minutes arrondies dépassent 59
  if (finalMinutes >= 60) {
    finalHours = (finalHours + 1) % 24;
    finalMinutes = 0;
  }
  
  return `${finalHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
};

// Calculer la durée en minutes entre deux créneaux
export const calculateDurationInMinutes = (startTime: string, endTime: string): number => {
  if (!startTime || !endTime) return 0;
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  return Math.max(0, endMinutes - startMinutes);
};
