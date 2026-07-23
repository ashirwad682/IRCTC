import React, { useState, useEffect, lazy, Suspense } from 'react';
import { API_BASE_URL } from './config/api';
import Navbar from './components/Navbar';
import HeroSearch from './components/HeroSearch';
import TrainSearchResultsPage from './components/TrainSearchResultsPage';
import PassengerDetailsModal from './components/PassengerDetailsModal';
import PaymentGatewayModal from './components/PaymentGatewayModal';
import TicketModal from './components/TicketModal';
import LoginModal from './components/LoginModal';
import BookedTicketHistoryPage from './components/BookedTicketHistoryPage';
import CancelTicketPage from './components/CancelTicketPage';
import { adjustSeatsOnBooking, getEffectiveSeatStatus, isTrainDeparted } from './services/seatInventoryService';

// ⚡ Lazy-loaded: heavy components only downloaded when first opened
const PnrStatusPage = lazy(() => import('./components/PnrStatusPage'));
const BookingConfirmationModal = lazy(() => import('./components/BookingConfirmationModal'));
const RefundStatusModal = lazy(() => import('./components/RefundStatusModal'));
const FeedbackModal = lazy(() => import('./components/FeedbackModal'));
const AIPredictorModal = lazy(() => import('./components/AIPredictorModal'));
const LiveTrainTracker = lazy(() => import('./components/LiveTrainTracker'));
const IrctcArchitectureView = lazy(() => import('./components/IrctcArchitectureView'));
const HighPerformanceDashboard = lazy(() => import('./components/HighPerformanceDashboard'));
const BlockchainVerifier = lazy(() => import('./components/BlockchainVerifier'));
const FoodCateringModal = lazy(() => import('./components/FoodCateringModal'));
const UserProfilePage = lazy(() => import('./components/UserProfilePage'));
const TrainSchedulePage = lazy(() => import('./components/TrainSchedulePage'));


export default function App() {
  // Page Session State Persistence (Restores exact tab & page view after Cmd+R or F5 hard refresh!)
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const hash = window.location.hash.replace('#', '');
      if (['search', 'pnr', 'schedule', 'cancel-ticket', 'booked-tickets', 'profile', 'live', 'meals'].includes(hash)) {
        return hash;
      }
      return localStorage.getItem('railx_active_tab') || 'search';
    } catch (e) {
      return 'search';
    }
  });

  const [viewMode, setViewMode] = useState(() => {
    try {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'results') return 'results';
      return localStorage.getItem('railx_view_mode') || 'search';
    } catch (e) {
      return 'search';
    }
  });

  const [cancelPrefillPnr, setCancelPrefillPnr] = useState(null); // PNR to prefill when opening cancel page

  // User Auth State (Restores from session localStorage; defaults to null so refreshing after logout stays logged out!)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('railx_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  // User Bookings History State (Dynamically updated whenever user completes payment!)
  // User Bookings History State (Strict Sourcing: Sourced ONLY from MongoDB Database!)
  const [userBookings, setUserBookings] = useState([]);

  const handleClearAllBookings = () => {
    try {
      localStorage.removeItem('railx_user_bookings');
      setUserBookings([]);
      fetch(`${API_BASE_URL}/api/bookings/clear-all`, { method: 'DELETE' }).catch(() => {});
    } catch (e) {
      console.error('Error clearing bookings:', e);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('railx_user_bookings', JSON.stringify(userBookings));
    } catch (e) {
      console.error('Error saving userBookings to localStorage:', e);
    }
  }, [userBookings]);

  const [profileSubTab, setProfileSubTab] = useState(() => {
    try {
      return localStorage.getItem('railx_profile_subtab') || 'profile';
    } catch (e) {
      return 'profile';
    }
  });

  // Synchronize activeTab, viewMode, and profileSubTab to localStorage & URL hash so refresh stays on current page!
  useEffect(() => {
    try {
      localStorage.setItem('railx_active_tab', activeTab);
      localStorage.setItem('railx_view_mode', viewMode);
      localStorage.setItem('railx_profile_subtab', profileSubTab);

      let currentHash = activeTab;
      if (activeTab === 'search') {
        currentHash = viewMode === 'results' ? 'results' : 'search';
      }
      if (window.location.hash !== `#${currentHash}`) {
        window.history.replaceState(null, '', `#${currentHash}`);
      }
    } catch (e) {}
  }, [activeTab, viewMode, profileSubTab]);

  // Listen to browser hashchange (Back/Forward or direct link navigation)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'results') {
        setActiveTab('search');
        setViewMode('results');
      } else if (['search', 'pnr', 'schedule', 'cancel-ticket', 'booked-tickets', 'profile', 'live', 'meals'].includes(hash)) {
        setActiveTab(hash);
        if (hash === 'search') setViewMode('search');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginNoticeMessage, setLoginNoticeMessage] = useState(null);

  // Search parameters & state (Starts clean without pre-filled station data or date)
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedQuota, setSelectedQuota] = useState('GN');
  const [selectedClass, setSelectedClass] = useState('ALL');

  // Route Confirmation Modal state
  const [confirmationTrain, setConfirmationTrain] = useState(null);
  const [confirmationClass, setConfirmationClass] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // Passenger Details & Payment Gateway Modals
  const [bookingRequestData, setBookingRequestData] = useState(null);
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Other Modals
  const [showAIModal, setShowAIModal] = useState(false);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [activeTrackTrain, setActiveTrackTrain] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Full SPA URL Routing Synchronization
  useEffect(() => {
    document.documentElement.classList.remove('dark');

    const updateUrlFromState = () => {
      let path = '/';
      if (showFeedbackModal) {
        path = '/feedback';
      } else if (showFoodModal) {
        path = '/meals';
      } else if (showLoginModal) {
        path = '/login';
      } else if (activeTab === 'profile') {
        path = '/profile';
      } else if (activeTab === 'pnr') {
        path = '/pnr';
      } else if (activeTab === 'schedule') {
        path = '/schedule';
      } else if (activeTab === 'cancel-ticket') {
        path = '/cancel-ticket';
      } else if (activeTab === 'live') {
        path = '/live';
      } else if (activeTab === 'search' && viewMode === 'results') {
        path = '/trains';
      } else {
        path = '/';
      }

      if (window.location.pathname !== path) {
        window.history.pushState(null, '', path);
      }
    };

    updateUrlFromState();
  }, [activeTab, viewMode, showFeedbackModal, showFoodModal, showLoginModal]);

  // Handle browser direct URL visits and Back/Forward buttons (popstate)
  useEffect(() => {
    const syncStateFromUrl = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('pnr')) {
        setActiveTab('pnr');
      } else if (path.includes('schedule')) {
        setActiveTab('schedule');
      } else if (path.includes('cancel')) {
        setActiveTab('cancel-ticket');
      } else if (path.includes('booked-tickets') || path.includes('history')) {
        setActiveTab('booked-tickets');
      } else if (path.includes('live')) {
        setActiveTab('live');

      } else if (path.includes('profile')) {
        setActiveTab('profile');
      } else if (path.includes('train') || path.includes('result') || path.includes('search-list')) {
        setActiveTab('search');
        setViewMode('results');
      } else if (path.includes('meal') || path.includes('food')) {
        setShowFoodModal(true);
      } else if (path.includes('feedback')) {
        setShowFeedbackModal(true);
      } else if (path.includes('login')) {
        setShowLoginModal(true);
        setActiveTab('search');
        setViewMode('search');
      } else {
        setActiveTab('search');
        setViewMode('search');
      }
    };

    syncStateFromUrl();
    window.addEventListener('popstate', syncStateFromUrl);
    return () => window.removeEventListener('popstate', syncStateFromUrl);
  }, []);

  const handleSearchSubmit = () => {
    if (!fromStation || !toStation || !selectedDate) {
      alert('Please select Source station, Destination station, and Journey Date to search trains.');
      return;
    }
    setViewMode('results');
  };

  const handleModifySearch = () => {
    setViewMode('search');
  };

  // Direct Booking Trigger -> Opens Passenger Details Page with integrated Seat Layout Map!
  const handleSelectTrainClass = (train, cls, journeyDate) => {
    // Use journeyDate passed from results page (user may have changed it there)
    const bookingDate = journeyDate || selectedDate;
    if (isTrainDeparted(train.departureTime, bookingDate)) {
      alert(`🚫 Booking Closed: Train ${train.number} (${train.name}) has already departed from ${train.from} at ${train.departureTime} on ${bookingDate}.`);
      return;
    }
    
    // Require user login before booking
    if (!currentUser) {
      setLoginNoticeMessage('🔒 IRCTC Account Login Required to Book Ticket');
      setShowLoginModal(true);
      return;
    }

    const selectedClsObj = cls || train.classes?.[0] || { code: '3A', name: 'AC 3-Tier (3A)', price: 2150 };
    setBookingRequestData({
      train,
      selectedClass: selectedClsObj,
      selectedClassStatus: selectedClsObj?.status || 'AVAILABLE 110',
      quota: selectedQuota,
      seats: ['12'],
      journeyDate: bookingDate
    });
    setShowPassengerModal(true);
  };

  const handleConfirmAndProceedToSeats = () => {
    if (confirmationTrain && isTrainDeparted(confirmationTrain.departureTime, selectedDate)) {
      alert(`🚫 Booking Closed: Train ${confirmationTrain.number} has already departed.`);
      setShowConfirmationModal(false);
      return;
    }
    if (!currentUser) {
      setShowConfirmationModal(false);
      setLoginNoticeMessage('🔒 IRCTC Account Login Required to Book Ticket');
      setShowLoginModal(true);
      return;
    }
    setShowConfirmationModal(false);
    setBookingRequestData({ train: confirmationTrain, selectedClass: confirmationClass, selectedClassStatus: confirmationClass?.status, seats: ['12'] });
    setShowPassengerModal(true);
  };

  // Step 2 -> Step 3: From Passenger Details & Integrated Seat Selector to Payment Gateway
  const handleProceedToPaymentGateway = (passengerData) => {
    if (!currentUser) {
      setShowPassengerModal(false);
      setLoginNoticeMessage('🔒 IRCTC Account Login Required to Book Ticket');
      setShowLoginModal(true);
      return;
    }
    setShowPassengerModal(false);
    setBookingRequestData(prev => ({ ...prev, ...passengerData }));
    setShowPaymentModal(true);
  };

  // Fetch user's ticket bookings strictly from MongoDB Atlas Cloud Database on mount or login
  // RULE: Only show bookings for the currently logged-in user. No user = empty list.
  useEffect(() => {
    if (!currentUser?.username) {
      // Not logged in → clear bookings, show nothing
      setUserBookings([]);
      return;
    }

    const cleanUser = String(currentUser.username).toLowerCase();
    const fetchEndpoint = `${API_BASE_URL}/api/bookings/user/${encodeURIComponent(currentUser.username)}`;

    fetch(fetchEndpoint)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.bookings)) {
          // Extra client-side safety: case-insensitive check
          const ownBookings = data.bookings.filter(b =>
            !b.username || String(b.username).toLowerCase() === cleanUser
          );
          setUserBookings(ownBookings);
        }
      })
      .catch(err => {
        console.warn("MongoDB Cloud sync notice:", err);
      });
  }, [currentUser?.username]);

  // Step 3 -> Confirmation: Payment Succeeded! PNR GENERATED & SAVED TO MONGODB ATLAS CLOUD DB!
  const handlePaymentSuccess = (booking) => {
    setShowPaymentModal(false);

    // Capture seat status BEFORE deducting so we stamp the correct status on the ticket
    const seatStatusAtBooking = getEffectiveSeatStatus(
      booking.trainNumber,
      booking.classCode,
      booking.selectedClassStatus || 'AVAILABLE 10',
      booking.date
    );

    // 🚂 SMART IRCTC BERTH ALLOCATION ENGINE
    // Rules:
    // 1. Max 3 Lower Berths per PNR (Max 2 LB + Max 1 SL). NEVER allot all 6 seats as Lower!
    // 2. High priority for Necessary Persons (Senior Citizens age >= 60, Female passengers, or explicit Lower / Side Lower preference).
    // 3. First check berth preference if given, allot if available & within PNR lower berth limits.
    // 4. Allot remaining passengers across Middle (MB), Upper (UB), Side Upper (SU).

    const allocateSmartBerths = (passengersList, classCodeStr, seatStatusObj, resChoice) => {
      const psgs = passengersList || [];
      if (psgs.length === 0) return [];

      if (!seatStatusObj.isAvailable) {
        if (seatStatusObj.isRac) {
          const racNum = parseInt(seatStatusObj.statusText.replace(/\D/g, '') || '1', 10);
          return psgs.map((p, idx) => ({
            ...p,
            berth: `RAC ${racNum + idx}`,
            bookingStatus: seatStatusObj.statusText,
          }));
        } else {
          const wlNum = parseInt(seatStatusObj.statusText.replace(/\D/g, '') || '1', 10);
          return psgs.map((p, idx) => ({
            ...p,
            berth: `WL# ${wlNum + idx}`,
            bookingStatus: seatStatusObj.statusText,
          }));
        }
      }

      const cCode = String(classCodeStr || '3A').toUpperCase();
      let coachPrefix = 'B10';
      if (cCode.includes('1A')) coachPrefix = 'H1';
      else if (cCode.includes('2A')) coachPrefix = 'A1';
      else if (cCode.includes('3E')) coachPrefix = 'B10';
      else if (cCode.includes('CC')) coachPrefix = 'C2';
      else if (cCode.includes('EC')) coachPrefix = 'E1';
      else if (cCode.includes('SL')) coachPrefix = 'S3';
      else if (cCode.includes('2S')) coachPrefix = 'D1';

      // For Chair Car (CC / EC / 2S), allocate Seat Types (WINDOW, AISLE, MIDDLE)
      if (cCode.includes('CC') || cCode.includes('EC') || cCode.includes('2S')) {
        const seatTypes = ['WINDOW', 'AISLE', 'MIDDLE', 'AISLE', 'WINDOW'];
        return psgs.map((p, idx) => ({
          ...p,
          berth: `CNF/${coachPrefix}/${14 + idx * 2}/${seatTypes[idx % seatTypes.length]}`,
          bookingStatus: seatStatusObj.statusText,
        }));
      }

      // === 2A CLASS: Only LB, UB, SL, SU — NO Middle Berths! ===
      if (cCode.includes('2A') || cCode.includes('1A')) {
        // 2A: 4 Main Bay (LB+UB pairs) + 2 Side Bay (SL+SU). No MB ever.
        const berthPool2A = ['LB', 'UB', 'LB', 'UB', 'SL', 'SU'];
        let pool2A = [...berthPool2A];

        // Priority: seniors/Lower pref → LB first, Side Lower pref → SL
        const result2A = psgs.map((p) => ({ ...p, _assignedBerth: null }));
        let poolIdx = 0;

        // First pass: assign based on preference
        result2A.forEach((p, idx) => {
          const pref = String(p.berth || '').trim();
          const ageNum = Number(p.age || 0);
          const isSenior = ageNum >= 60;
          const wantsLower = pref === 'Lower' || (isSenior && (pref === 'No preference' || !pref));
          const wantsSideLower = pref === 'Side Lower';
          const wantsUpper = pref === 'Upper';
          const wantsSideUpper = pref === 'Side Upper';

          if (wantsLower && pool2A.includes('LB')) {
            const i = pool2A.indexOf('LB');
            result2A[idx]._assignedBerth = 'LB';
            pool2A.splice(i, 1);
          } else if (wantsSideLower && pool2A.includes('SL')) {
            const i = pool2A.indexOf('SL');
            result2A[idx]._assignedBerth = 'SL';
            pool2A.splice(i, 1);
          } else if (wantsUpper && pool2A.includes('UB')) {
            const i = pool2A.indexOf('UB');
            result2A[idx]._assignedBerth = 'UB';
            pool2A.splice(i, 1);
          } else if (wantsSideUpper && pool2A.includes('SU')) {
            const i = pool2A.indexOf('SU');
            result2A[idx]._assignedBerth = 'SU';
            pool2A.splice(i, 1);
          }
        });

        // Second pass: fill remaining from pool
        result2A.forEach((p, idx) => {
          if (!result2A[idx]._assignedBerth) {
            result2A[idx]._assignedBerth = pool2A.shift() || 'UB';
          }
        });

        return result2A.map((p, idx) => {
          const bCode = p._assignedBerth;
          const seatNum = 16 + idx * 6;
          const { _assignedBerth, ...rest } = p;
          return {
            ...rest,
            berth: `CNF/${coachPrefix}/${seatNum}/${bCode}`,
            bookingStatus: seatStatusObj.statusText,
          };
        });
      }

      // === 3A / 3E / SL: LB, MB, UB, SL, SU — Middle Berths exist ===
      // Strict PNR Limits: Max 2 LB, Max 1 SL => Total Lower berths max 3 per PNR!
      let countLB = 0;
      let countSL = 0;
      const maxLB = 2;
      const maxSL = 1;

      const assignedBerths = new Array(psgs.length).fill(null);

      // Handle Reservation Choice rules if chosen by user
      if (resChoice === 'LOWER1') {
        // Guarantee at least 1 Lower berth
        assignedBerths[0] = 'LB';
        countLB++;
      } else if (resChoice === 'LOWER2') {
        // Guarantee at least 2 Lower berths
        assignedBerths[0] = 'LB';
        countLB++;
        if (psgs.length > 1) {
          assignedBerths[1] = 'LB';
          countLB++;
        }
      }

      // Phase 1: Give Lower (LB) or Side Lower (SL) to Senior Citizens (Age >= 60) and explicit Lower requests
      psgs.forEach((p, idx) => {
        if (assignedBerths[idx] !== null) return;
        const pref = String(p.berth || '').trim();
        const ageNum = Number(p.age || 0);
        const isSenior = ageNum >= 60;
        const wantsLower = pref === 'Lower' || (isSenior && (pref === 'No preference' || !pref));
        const wantsSideLower = pref === 'Side Lower';

        if (wantsLower) {
          if (countLB < maxLB) {
            assignedBerths[idx] = 'LB';
            countLB++;
          } else if (countSL < maxSL) {
            assignedBerths[idx] = 'SL';
            countSL++;
          }
        } else if (wantsSideLower) {
          if (countSL < maxSL) {
            assignedBerths[idx] = 'SL';
            countSL++;
          } else if (countLB < maxLB) {
            assignedBerths[idx] = 'LB';
            countLB++;
          }
        }
      });

      // Phase 2: Satisfy Middle (MB), Upper (UB), Side Upper (SU) preferences
      psgs.forEach((p, idx) => {
        if (assignedBerths[idx] !== null) return;
        const pref = String(p.berth || '').trim();
        if (pref === 'Middle') assignedBerths[idx] = 'MB';
        else if (pref === 'Upper') assignedBerths[idx] = 'UB';
        else if (pref === 'Side Upper') assignedBerths[idx] = 'SU';
      });

      // Phase 3: Allot remaining unassigned passengers using Middle (MB), Upper (UB), Side Upper (SU)
      const nonLowerRotation = ['MB', 'UB', 'SU', 'MB', 'UB', 'SU'];
      let rotIdx = 0;

      psgs.forEach((p, idx) => {
        if (assignedBerths[idx] !== null) return;

        if (rotIdx < nonLowerRotation.length) {
          assignedBerths[idx] = nonLowerRotation[rotIdx++];
        } else {
          if (countLB < maxLB) {
            assignedBerths[idx] = 'LB';
            countLB++;
          } else if (countSL < maxSL) {
            assignedBerths[idx] = 'SL';
            countSL++;
          } else {
            assignedBerths[idx] = 'UB';
          }
        }
      });

      // Return stamped passengers with full IRCTC berth string: e.g. CNF/B10/18/LB
      return psgs.map((p, idx) => {
        const bCode = assignedBerths[idx] || 'MB';
        const seatNum = 18 + idx * 6;
        return {
          ...p,
          berth: `CNF/${coachPrefix}/${seatNum}/${bCode}`,
          bookingStatus: seatStatusObj.statusText,
        };
      });
    };

    const stampedPassengers = allocateSmartBerths(
      booking.passengers,
      booking.classCode,
      seatStatusAtBooking,
      booking.reservationChoice
    );

    const stampedBooking = {
      ...booking,
      passengers: stampedPassengers,
      bookingStatusAtTime: seatStatusAtBooking.statusText,
      status: 'BOOKED',
    };

    // ⚡ INSTANT: Update UI immediately — no waiting for network
    setConfirmedBooking(stampedBooking);
    setUserBookings(prev => [stampedBooking, ...prev]);
    setShowTicketModal(true);

    // Deduct seat inventory (synchronous localStorage — very fast)
    adjustSeatsOnBooking(booking.trainNumber, booking.classCode, booking.date, booking.passengers?.length || 1);

    // 🔄 BACKGROUND: Persist to localStorage non-blocking
    queueMicrotask(() => {
      try {
        const stored = JSON.parse(localStorage.getItem('railx_user_bookings') || '[]');
        stored.unshift(stampedBooking);
        localStorage.setItem('railx_user_bookings', JSON.stringify(stored));
      } catch (e) {
        console.warn('localStorage persist notice:', e);
      }
    });

    // 🌐 Sync to MongoDB Atlas Database & Refetch to Update Booked Ticket History
    fetch(`${API_BASE_URL}/api/bookings/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pnr: stampedBooking.pnr,
        username: currentUser?.username || 'ashirwad_irctc',
        trainNumber: stampedBooking.trainNumber,
        trainName: stampedBooking.trainName,
        from: stampedBooking.from,
        to: stampedBooking.to,
        boardingAt: stampedBooking.boardingAt,
        boardingDate: stampedBooking.boardingDate,
        boardingDepTime: stampedBooking.boardingDepTime,
        depTime: stampedBooking.depTime,
        arrTime: stampedBooking.arrTime,
        date: stampedBooking.date,
        classCode: stampedBooking.classCode,
        quota: stampedBooking.quota,
        passengers: stampedPassengers,
        ticketFare: stampedBooking.ticketFare,
        convenienceFee: stampedBooking.convenienceFee,
        insurancePremium: stampedBooking.insurancePremium,
        totalPaid: stampedBooking.totalPaid,
        txnId: stampedBooking.txnId,
      })
    })
    .then(res => res.json())
    .then(data => {
      // Re-fetch tickets from Database to ensure exact database records in state & Booked Ticket History!
      const currentUname = currentUser?.username || 'ASHIRWAD_IRCTC';
      const cleanUser = String(currentUname).toLowerCase();
      const fetchEndpoint = `${API_BASE_URL}/api/bookings/user/${encodeURIComponent(currentUname)}`;
      fetch(fetchEndpoint)
        .then(r => r.json())
        .then(dbData => {
          if (dbData && dbData.success && Array.isArray(dbData.bookings)) {
            const ownBookings = dbData.bookings.filter(b =>
              !b.username || String(b.username).toLowerCase() === cleanUser
            );
            setUserBookings(ownBookings);
          }
        });
    })
    .catch(e => console.warn('MongoDB database sync notice:', e));
  };

  // Real-time cancellation handler: Updates state across entire application without page refresh
  const handleTicketCancelled = (cancelledPnr, cancellationData) => {
    setUserBookings(prev => prev.map(b => {
      if (String(b.pnr).replace(/\D/g, '') === String(cancelledPnr).replace(/\D/g, '')) {
        return {
          ...b,
          status: 'CANCELLED',
          isCancelled: true,
          cancellationDetails: cancellationData?.cancellation || cancellationData || b.cancellationDetails,
          passengers: (b.passengers || []).map(p => ({
            ...p,
            status: 'CANCELLED',
            berth: 'CANCELLED / REFUND PROCESSED'
          }))
        };
      }
      return b;
    }));

    if (currentUser?.username) {
      const cleanUser = String(currentUser.username).toLowerCase();
      fetch(`${API_BASE_URL}/api/bookings/user/${encodeURIComponent(currentUser.username)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.success && Array.isArray(data.bookings)) {
            const ownBookings = data.bookings.filter(b =>
              !b.username || String(b.username).toLowerCase() === cleanUser
            );
            setUserBookings(ownBookings);
          }
        })
        .catch(err => console.warn('MongoDB database refetch notice after cancellation:', err));
    }
  };

  const handleLiveTrack = (train) => {
    setActiveTrackTrain(train);
    setActiveTab('live');
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('railx_current_user', JSON.stringify(user));
    } catch (e) {
      console.error('Error storing user session:', e);
    }
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('railx_current_user');
    } catch (e) {
      console.error('Error clearing user session:', e);
    }
    setActiveTab('search');
    setViewMode('search');
    setShowLoginModal(false);
    if (window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
    }
  };

  const handleOpenProfileTab = (tabMode) => {
    setProfileSubTab(tabMode);
    setActiveTab('profile');
  };

  return (
    <Suspense fallback={null}>
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'search') setViewMode('search');
        }}
        onOpenAIModal={() => setShowAIModal(true)}
        onOpenFoodModal={() => setShowFoodModal(true)}
        currentUser={currentUser}
        onOpenLoginModal={() => {
          setActiveTab('search');
          setViewMode('search');
          setShowLoginModal(true);
        }}
        onOpenProfilePage={() => handleOpenProfileTab('profile')}
        onOpenBookedTickets={() => setActiveTab('booked-tickets')}
        onOpenRefundModal={() => setShowRefundModal(true)}
        onOpenFeedbackModal={() => setShowFeedbackModal(true)}
        onOpenChangePassword={() => handleOpenProfileTab('change_password')}
        onOpenAadhaarKyc={() => handleOpenProfileTab('authenticate')}
        onOpenMasterList={() => handleOpenProfileTab('master_list')}
        onOpenRecentJourneys={() => handleOpenProfileTab('recent_journeys')}
        onOpenFileTdr={() => alert("TDR Status: No eligible TDR filed.")}
        onOpenTaxInvoice={() => alert("GST Tax Invoice PDF downloaded!")}
        onLogout={handleLogout}
      />

      {/* Main Content Body */}
      <main className="flex-1 bg-slate-100">
        {activeTab === 'search' && viewMode === 'search' && (
          <HeroSearch
            onSearch={handleSearchSubmit}
            fromStation={fromStation}
            setFromStation={setFromStation}
            toStation={toStation}
            setToStation={setToStation}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            selectedQuota={selectedQuota}
            setSelectedQuota={setSelectedQuota}
            onOpenAIModal={() => setActiveTab('pnr')}
            onOpenSchedule={() => setActiveTab('schedule')}
            currentUser={currentUser}
            userBookings={userBookings}
            onViewTicket={(b) => {
              setConfirmedBooking(b);
              setShowTicketModal(true);
            }}
            onOpenProfile={() => handleOpenProfileTab('profile')}
            onOpenRefundModal={() => setShowRefundModal(true)}
            onClearAllBookings={handleClearAllBookings}
          />
        )}

        {activeTab === 'search' && viewMode === 'results' && (
          <TrainSearchResultsPage
            fromStation={fromStation}
            toStation={toStation}
            selectedDate={selectedDate}
            selectedQuota={selectedQuota}
            selectedClass={selectedClass}
            onModifySearch={handleModifySearch}
            onSelectTrainClass={handleSelectTrainClass}
            onLiveTrack={handleLiveTrack}
          />
        )}

        {activeTab === 'pnr' && (
          <PnrStatusPage
            userBookings={userBookings}
            onOrderFood={() => setShowFoodModal(true)}
            onViewTicket={(b) => {
              setConfirmedBooking(b);
              setShowTicketModal(true);
            }}
            onCancelTicket={(b) => {
              setActiveTab('cancel-ticket');
            }}
          />
        )}

        {activeTab === 'schedule' && (
          <TrainSchedulePage />
        )}

        {activeTab === 'cancel-ticket' && (
          <CancelTicketPage
            userBookings={userBookings}
            prefillPnr={cancelPrefillPnr}
            currentUser={currentUser}
            onOpenLoginModal={() => setShowLoginModal(true)}
            onOrderFood={() => setShowFoodModal(true)}
            onBackToSearch={() => { setActiveTab('search'); setViewMode('search'); setCancelPrefillPnr(null); }}
            onTicketCancelled={handleTicketCancelled}
          />
        )}

        {activeTab === 'booked-tickets' && (
          <BookedTicketHistoryPage
            onBack={() => { setActiveTab('search'); setViewMode('search'); }}
            onViewTicket={(b) => {
              setConfirmedBooking(b);
              setShowTicketModal(true);
            }}
            onCancelTicket={(b) => {
              setCancelPrefillPnr(b?.pnr || null);
              setActiveTab('cancel-ticket');
            }}
            userBookings={userBookings}
            onClearAllBookings={handleClearAllBookings}
            currentUser={currentUser}
            onOpenLoginModal={() => setShowLoginModal(true)}
          />
        )}

        {activeTab === 'profile' && (
          <UserProfilePage
            user={currentUser}
            activeTabMode={profileSubTab}
            onLogout={handleLogout}
            onBackToSearch={() => { setActiveTab('search'); setViewMode('search'); }}
            onOpenBookedTickets={() => setActiveTab('booked-tickets')}
            onViewTicket={(b) => {
              setConfirmedBooking(b);
              setShowTicketModal(true);
            }}
            userBookings={userBookings}
          />
        )}

        {activeTab === 'live' && (
          <LiveTrainTracker
            train={activeTrackTrain}
            onBack={() => { setActiveTab('search'); setViewMode('search'); }}
          />
        )}

        {activeTab === 'irctc' && (
          <IrctcArchitectureView />
        )}

        {activeTab === 'performance' && (
          <HighPerformanceDashboard />
        )}

        {activeTab === 'blockchain' && (
          <BlockchainVerifier />
        )}
      </main>

      {/* Official IRCTC Light Footer */}
      <footer className="bg-white text-slate-700 border-t border-slate-200 py-6 text-center text-xs">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 IRCTC - Indian Railways Catering and Tourism Corporation Ltd. All Rights Reserved.</p>
          <p className="font-mono text-[11px] text-blue-900 font-bold">Powered by RailX Enterprise CRS Engine</p>
        </div>
      </footer>

      {/* Modals */}
      {showLoginModal && (
        <LoginModal
          onClose={() => {
            setShowLoginModal(false);
            setLoginNoticeMessage(null);
            if (window.location.pathname.includes('login')) {
              window.history.pushState(null, '', '/');
            }
          }}
          onLoginSuccess={(user) => {
            handleLoginSuccess(user);
            if (window.location.pathname.includes('login')) {
              window.history.pushState(null, '', '/');
            }
          }}
          bookingNotice={loginNoticeMessage}
        />
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <FeedbackModal onClose={() => setShowFeedbackModal(false)} />
      )}

      {/* Booking Confirmation Dialog (Shown ONLY if searched & train stations differ!) */}
      {showConfirmationModal && confirmationTrain && (
        <BookingConfirmationModal
          searchedFrom={`${fromStation}(${fromStation === 'NDLS' ? 'NEW DELHI' : fromStation})`}
          searchedTo={`${toStation}(${toStation === 'MMCT' ? 'MUMBAI CENTRAL' : toStation === 'PNBE' ? 'PATNA JN' : toStation})`}
          bookingTrain={confirmationTrain}
          selectedClass={confirmationClass}
          onClose={() => setShowConfirmationModal(false)}
          onContinue={handleConfirmAndProceedToSeats}
        />
      )}

      {/* Passenger Details & Integrated Seat Selector Page */}
      {showPassengerModal && (
        <PassengerDetailsModal
          train={bookingRequestData?.train || {}}
          selectedClass={bookingRequestData?.selectedClass || { code: '3A', name: 'AC 3-Tier (3A)', price: 2150 }}
          selectedSeats={bookingRequestData?.seats || ['12']}
          quota={bookingRequestData?.quota || selectedQuota || 'GN'}
          journeyDate={bookingRequestData?.journeyDate || selectedDate}
          onClose={() => setShowPassengerModal(false)}
          onProceedToPayment={handleProceedToPaymentGateway}
        />
      )}

      {/* Refund Status Modal */}
      {showRefundModal && (
        <RefundStatusModal onClose={() => setShowRefundModal(false)} userBookings={userBookings} />
      )}

      {/* Step 3: Bank Payment Gateway (PNR is generated ONLY after payment success!) */}
      {showPaymentModal && bookingRequestData && (
        <PaymentGatewayModal
          bookingRequest={bookingRequestData}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {showAIModal && (
        <AIPredictorModal
          onClose={() => setShowAIModal(false)}
          onSelectTrainForBooking={(train, cls) => {
            setShowAIModal(false);
            handleSelectTrainClass(train, cls);
          }}
        />
      )}

      {showFoodModal && (
        <FoodCateringModal onClose={() => setShowFoodModal(false)} />
      )}

      {/* Step 4: Final E-Ticket with PNR display */}
      {showTicketModal && (
        <TicketModal
          bookingData={confirmedBooking}
          onClose={() => setShowTicketModal(false)}
        />
      )}

    </div>
    </Suspense>
  );
}
