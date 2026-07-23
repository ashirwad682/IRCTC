// Generates realistic seat maps for different coach classes

export const COACH_TYPES = {
  '1A': { name: 'First AC (1A)', totalCoaches: 1, prefix: 'H', seatsPerCoach: 24, layoutType: 'cabin' },
  '2A': { name: 'AC 2-Tier (2A)', totalCoaches: 2, prefix: 'A', seatsPerCoach: 46, layoutType: 'coupe2' },
  '3A': { name: 'AC 3-Tier (3A)', totalCoaches: 4, prefix: 'B', seatsPerCoach: 64, layoutType: 'coupe3' },
  '3E': { name: '3-Tier Economy (3E)', totalCoaches: 2, prefix: 'M', seatsPerCoach: 72, layoutType: 'coupe3' },
  'EC': { name: 'Exec Chair Car (EC)', totalCoaches: 2, prefix: 'E', seatsPerCoach: 46, layoutType: 'chair2x2' },
  'CC': { name: 'AC Chair Car (CC)', totalCoaches: 6, prefix: 'C', seatsPerCoach: 78, layoutType: 'chair3x2' },
  'SL': { name: 'Sleeper Class (SL)', totalCoaches: 8, prefix: 'S', seatsPerCoach: 72, layoutType: 'coupe3' }
};

export function generateCoachSeats(coachCode, classCode) {
  const coachInfo = COACH_TYPES[classCode] || COACH_TYPES['3A'];
  const count = coachInfo.seatsPerCoach;
  const seats = [];

  const berthTypesCoupe3 = ['Lower', 'Middle', 'Upper', 'Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper'];
  const berthTypesCoupe2 = ['Lower', 'Upper', 'Lower', 'Upper', 'Side Lower', 'Side Upper'];

  for (let i = 1; i <= count; i++) {
    let type = 'Standard';
    let isWindow = false;
    let category = 'regular'; // 'window', 'upper', 'lower', 'middle', 'rac', 'wl', 'couple', 'family'
    
    if (coachInfo.layoutType === 'chair3x2' || coachInfo.layoutType === 'chair2x2') {
      const isRightWindow = (i % 5 === 0 || i % 5 === 1);
      const isLeftWindow = (i % 5 === 4);
      isWindow = isRightWindow || isLeftWindow;
      type = isWindow ? 'Window' : (i % 2 === 0 ? 'Aisle' : 'Middle');
    } else if (coachInfo.layoutType === 'coupe2') {
      type = berthTypesCoupe2[(i - 1) % 6];
      isWindow = (type === 'Side Lower' || type === 'Side Upper' || type === 'Lower');
    } else if (coachInfo.layoutType === 'coupe3') {
      type = berthTypesCoupe3[(i - 1) % 8];
      isWindow = (type === 'Side Lower' || type === 'Side Upper' || type === 'Lower');
    } else {
      type = (i % 4 === 1 || i % 4 === 0) ? 'Lower' : 'Upper';
      isWindow = (i % 2 !== 0);
    }

    // Determine status randomly or by fixed formula for realistic presentation
    let status = 'available'; // 'available', 'occupied', 'selected', 'rac', 'wl'
    if (i % 7 === 0 || i % 11 === 0 || i === 3 || i === 14 || i === 22) {
      status = 'occupied';
    } else if (i === 62 || i === 63) {
      status = 'rac';
    } else if (i >= count - 2) {
      status = 'wl';
    }

    // Special tagging for demo
    if (type.includes('Lower') || type === 'Window') category = 'window';
    if (i === 5 || i === 6) category = 'couple';
    if (i >= 17 && i <= 22) category = 'family';

    seats.push({
      number: i,
      code: `${coachCode}-${i}`,
      type,
      isWindow,
      status,
      category,
      genderPreference: i % 5 === 0 ? 'Female Only' : 'General',
      extraCharge: (category === 'couple' || category === 'window') ? 150 : 0
    });
  }

  return seats;
}
