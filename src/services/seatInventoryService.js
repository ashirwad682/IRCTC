// IRCTC Dynamic Seat Inventory & Departure Verification Service
// Handles: AVAILABLE → RAC (up to 20) → WL queue, and reverse on cancellations.

const INVENTORY_KEY = 'railx_seat_inventory_adjustments';

// Max RAC berths per class per train (Indian Railways standard: SL=96, but we use 20 for demo)
const MAX_RAC = 20;

// ⚡ In-memory cache — avoids repeated JSON.parse on every render
let _adjustmentsCache = null;
let _cacheValid = false;

function invalidateCache() {
  _cacheValid = false;
  _adjustmentsCache = null;
}

function getAdjustments() {
  if (_cacheValid && _adjustmentsCache !== null) return _adjustmentsCache;
  try {
    const stored = localStorage.getItem(INVENTORY_KEY);
    _adjustmentsCache = stored ? JSON.parse(stored) : {};
    _cacheValid = true;
    return _adjustmentsCache;
  } catch (e) {
    return {};
  }
}

function saveAdjustments(adjMap) {
  try {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(adjMap));
    // Update cache with new data instead of invalidating
    _adjustmentsCache = adjMap;
    _cacheValid = true;
  } catch (e) {
    console.error('Error saving seat inventory adjustments:', e);
    invalidateCache();
  }
}


/**
 * Parse the base status string into a structured object.
 * Handles: "AVAILABLE 42", "RAC 20", "WL 5", "REGRET", "NOT AVAILABLE"
 */
function parseStatus(statusStr) {
  const s = String(statusStr || '').trim().toUpperCase();

  const availMatch = s.match(/^AVAILABLE\s+(\d+)$/);
  if (availMatch) return { type: 'AVAILABLE', count: parseInt(availMatch[1], 10) };

  const racMatch = s.match(/^RAC\s*(\d+)$/);
  if (racMatch) return { type: 'RAC', count: parseInt(racMatch[1], 10) };

  const wlMatch = s.match(/^WL\s*(\d+)$/);
  if (wlMatch) return { type: 'WL', count: parseInt(wlMatch[1], 10) };

  if (s.includes('REGRET') || s.includes('NOT AVAILABLE')) return { type: 'REGRET', count: 0 };

  return { type: 'UNKNOWN', count: 0, raw: statusStr };
}

/**
 * Deduct seats when a ticket is successfully booked.
 * netAdj is a negative integer (-1 per booking).
 */
export function adjustSeatsOnBooking(trainNumber, classCode, date, count = 1) {
  if (!trainNumber || !classCode || !date) return;
  const adjMap = getAdjustments();
  const key = `${trainNumber}_${classCode}_${date}`;
  const currentAdj = adjMap[key] || 0;
  adjMap[key] = currentAdj - count;
  saveAdjustments(adjMap);
}

/**
 * Restore/increase seats when a ticket is cancelled.
 * Adds +1 per cancellation, but never goes above 0 (can't exceed base available).
 */
export function adjustSeatsOnCancellation(trainNumber, classCode, date, count = 1) {
  if (!trainNumber || !classCode || !date) return;
  const adjMap = getAdjustments();
  const key = `${trainNumber}_${classCode}_${date}`;
  const currentAdj = adjMap[key] || 0;
  // Allow restoration without cap so RAC/WL seats can also be freed
  adjMap[key] = currentAdj + count;
  saveAdjustments(adjMap);
}

/**
 * Compute effective seat status after applying booking/cancellation adjustments.
 *
 * Progression:
 *   AVAILABLE N  →  booking N times  →  RAC 1…20  →  WL 1…∞
 *   Cancellation reverses the above.
 *
 * @param {string} trainNumber
 * @param {string} classCode
 * @param {string} defaultStatusStr  - e.g. "AVAILABLE 42", "RAC 20"
 * @param {string} date              - YYYY-MM-DD
 * @returns {{ statusText: string, count: number, isAvailable: boolean, isRac: boolean, isWL: boolean }}
 */
export function getEffectiveSeatStatus(trainNumber, classCode, defaultStatusStr, date) {
  const adjMap = getAdjustments();
  const key = `${trainNumber}_${classCode}_${date}`;
  const netAdj = adjMap[key] || 0; // negative = more booked; positive = more released

  const base = parseStatus(defaultStatusStr);

  if (base.type === 'UNKNOWN' || base.type === 'REGRET') {
    return {
      statusText: defaultStatusStr,
      count: 0,
      isAvailable: false,
      isRac: false,
      isWL: false,
    };
  }

  // Translate everything to a single "virtual available unit" scale:
  // AVAILABLE N → positive N
  // RAC K       → 0 available, RAC still has (MAX_RAC - K + 1) slots left (we store negatively as -K)
  // WL M        → deeply negative

  let virtualUnits; // positive = available, 0 = RAC start, negative goes through RAC then WL

  if (base.type === 'AVAILABLE') {
    // Units: base.count available seats. 0 means RAC start.
    virtualUnits = base.count;
  } else if (base.type === 'RAC') {
    // RAC K means K berths already in RAC, so available seats = 0
    // We treat it as -(K) so adjustments flow through RAC into WL
    virtualUnits = -(base.count);
  } else if (base.type === 'WL') {
    // WL M means already past all RAC. virtualUnits = -(MAX_RAC + M)
    virtualUnits = -(MAX_RAC + base.count);
  } else {
    virtualUnits = 0;
  }

  // Apply net adjustments (negative adj = more seats booked)
  const effective = virtualUnits + netAdj;

  if (effective > 0) {
    // Normal available seats remain
    return {
      statusText: `AVAILABLE ${effective}`,
      count: effective,
      isAvailable: true,
      isRac: false,
      isWL: false,
    };
  } else if (effective === 0) {
    // Exactly at RAC 1 boundary (first RAC berth)
    return {
      statusText: `RAC 1`,
      count: 1,
      isAvailable: false,
      isRac: true,
      isWL: false,
    };
  } else {
    // negative: go through RAC (1 to MAX_RAC), then WL
    const depthBelowZero = Math.abs(effective); // 1 = RAC 1, MAX_RAC = RAC 20, MAX_RAC+1 = WL 1

    if (depthBelowZero <= MAX_RAC) {
      const racNum = depthBelowZero;
      return {
        statusText: `RAC ${racNum}`,
        count: MAX_RAC - racNum + 1, // remaining RAC berths
        isAvailable: false,
        isRac: true,
        isWL: false,
      };
    } else {
      // Waiting list
      const wlNum = depthBelowZero - MAX_RAC;
      return {
        statusText: `WL ${wlNum}`,
        count: 0,
        isAvailable: false,
        isRac: false,
        isWL: true,
      };
    }
  }
}

/**
 * Check if train has already departed based on journey date and departure time.
 */
export function isTrainDeparted(departureTimeStr, journeyDateStr) {
  if (!departureTimeStr || !journeyDateStr) return false;
  try {
    const now = new Date();

    // Parse journeyDate (YYYY-MM-DD)
    const dateParts = journeyDateStr.split('-').map(Number);
    if (dateParts.length !== 3) return false;
    const [year, month, day] = dateParts;

    // Parse departureTime (HH:MM)
    const timeParts = departureTimeStr.split(':').map(Number);
    if (timeParts.length !== 2) return false;
    const [depHours, depMins] = timeParts;

    const trainDepartureDateTime = new Date(year, month - 1, day, depHours, depMins);

    return now > trainDepartureDateTime;
  } catch (e) {
    return false;
  }
}
