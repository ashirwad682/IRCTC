import React, { useState } from 'react';
import { User, Plus, Trash2, ArrowLeft, ChevronDown, Check, ShieldCheck, Info, MapPin, Train, Clock, X, Calendar, CheckCircle2, Lock, Edit2, AlertTriangle, CreditCard } from 'lucide-react';
import { getEffectiveSeatStatus } from '../services/seatInventoryService';

export default function PassengerDetailsModal({ train, selectedClass, selectedSeats: initialSeats, quota: passedQuota, onClose, onProceedToPayment }) {
  // Dynamic Master List sourcing from localStorage or default master list
  const getInitialMasterList = () => {
    try {
      const stored = localStorage.getItem('railx_master_passengers');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item, idx) => ({
            id: item.id ? String(item.id) : `m${idx + 1}`,
            name: item.name?.toUpperCase() || 'PASSENGER',
            age: item.age || 25,
            gender: item.gender || 'Male',
            nationality: 'IN',
            berth: item.berth || 'No preference',
            food: item.meal?.includes('Veg') || item.meal?.includes('VEG') ? 'VEG' : 'NO_FOOD',
            verified: item.status === 'Verified' || item.name?.includes('ASHIRWAD')
          }));
        }
      }
    } catch (e) {
      console.error('Error parsing master list:', e);
    }

    return [
      { id: 'm1', name: 'ASHIRWAD KUMAR', age: 21, gender: 'Male', nationality: 'IN', berth: 'No preference', food: 'VEG', verified: true },
      { id: 'm2', name: 'ASHISH KUMAR', age: 19, gender: 'Male', nationality: 'IN', berth: 'Lower', food: 'NO_FOOD', verified: false },
      { id: 'm3', name: 'BALRAM CHOUDHARY', age: 60, gender: 'Male', nationality: 'IN', berth: 'Lower', food: 'NO_FOOD', verified: false },
      { id: 'm4', name: 'HARSH CHOUDHARY', age: 16, gender: 'Male', nationality: 'IN', berth: 'Lower', food: 'NO_FOOD', verified: false },
      { id: 'm5', name: 'SHOBHA DEVI', age: 53, gender: 'Female', nationality: 'IN', berth: 'Lower', food: 'NO_FOOD', verified: false }
    ];
  };

  const [masterPassengersList, setMasterPassengersList] = useState(getInitialMasterList);

  const refreshMasterList = () => {
    setMasterPassengersList(getInitialMasterList());
  };

  // Workflow step: 'input' (Step 1) vs 'review' (Step 2: Non-editable Fare & Seat Review)
  const [step, setStep] = useState('input');

  // Passenger Manifest State (Max 6) - Starts BLANK for fresh passenger input
  const [passengers, setPassengers] = useState([
    { id: 1, name: '', age: '', gender: 'Male', berth: 'No preference', food: 'VEG' }
  ]);

  // Modal controls
  const [showExistingPassengerModal, setShowExistingPassengerModal] = useState(false);
  const [selectedMasterIds, setSelectedMasterIds] = useState([]);
  const [showBoardingSelector, setShowBoardingSelector] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Inputs state
  const [alternateMobile, setAlternateMobile] = useState('');
  const [autoUpgrade, setAutoUpgrade] = useState(false);
  const [confirmBerthOnly, setConfirmBerthOnly] = useState(false);
  const [travelInsurance, setTravelInsurance] = useState(true);
  const [reservationChoice, setReservationChoice] = useState('NONE');
  const [preferredCoach, setPreferredCoach] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [paymentMode, setPaymentMode] = useState('cards'); // 'cards' or 'upi'

  // Train & Route variables
  const trainName = train?.name || 'PASCHIM SUPERFAST EXPRESS';
  const trainNumber = train?.number || '12926';
  const fromCode = train?.from || 'NDLS';
  const fromName = train?.fromName || 'NEW DELHI';
  const toCode = train?.to || 'MMCT';
  const toName = train?.toName || 'MUMBAI CENTRAL';
  const departureTime = train?.departureTime || '16:35';
  const arrivalTime = train?.arrivalTime || '14:45';
  const duration = train?.duration || '22h 10m';

  const classCode = selectedClass?.code || '3A';
  const className = selectedClass?.name || 'AC 3-Tier (3A)';
  const basePrice = selectedClass?.price || 2150;

  const quotaRaw = passedQuota || train?.quota || 'GN';
  const formatQuota = (q) => {
    const s = String(q || 'GN').toUpperCase();
    if (s.includes('TQ') || s.includes('TATKAL')) return 'TATKAL (TQ)';
    if (s.includes('PT') || s.includes('PREMIUM')) return 'PREMIUM TATKAL (PT)';
    if (s.includes('LD') || s.includes('LADIES')) return 'LADIES (LD)';
    if (s.includes('SS') || s.includes('SENIOR')) return 'SENIOR CITIZEN (SS)';
    if (s.includes('HP') || s.includes('PHYSICAL')) return 'HANDICAPPED (HP)';
    return 'GENERAL (GN)';
  };
  const quotaDisplay = formatQuota(quotaRaw);

  // Check if train has onboard catering (Rajdhani, Vande Bharat, Shatabdi, Tejas, Duronto, Garib Rath)
  const isPremium = (() => {
    const nameUpper = String(trainName).toUpperCase();
    const numStr = String(trainNumber);
    return (
      nameUpper.includes('RAJDHANI') ||
      nameUpper.includes('VANDE BHARAT') ||
      nameUpper.includes('TEJAS') ||
      nameUpper.includes('SHATABDI') ||
      nameUpper.includes('DURONTO') ||
      ['12951', '12952', '12001', '12002', '20901', '20902', '22671', '12301', '12302'].includes(numStr)
    );
  })();

  // Seat Availability calculation
  const getSeatCount = (cls) => {
    if (cls?.seats && typeof cls.seats === 'number') {
      return cls.seats;
    }
    if (cls?.status) {
      const match = cls.status.match(/\d+/);
      if (match) {
        return parseInt(match[0], 10);
      }
    }
    return 110;
  };

  // Dynamic Route Stops based on Destination and Train Number
  const getTrainStops = (tObj, tNum, tName) => {
    if (tObj?.route && Array.isArray(tObj.route) && tObj.route.length > 0) {
      return tObj.route;
    }

    const numStr = String(tNum || '');
    const nameStr = String(tName || '').toUpperCase();
    const destCode = String(toCode || '').toUpperCase();
    const destName = String(toName || '').toUpperCase();

    if (
      destCode === 'MMCT' || destCode === 'CSMT' || destCode === 'BDTS' ||
      destName.includes('MUMBAI') || destName.includes('CENTRAL') || destName.includes('BANDRA') ||
      numStr.includes('12926') || numStr.includes('12952') || nameStr.includes('PASCHIM')
    ) {
      return [
        { code: 'NDLS', name: 'NEW DELHI', arrivalTime: departureTime, departureTime: departureTime, day: 1, dist: '0 km', date: '22 Jul 2026', platform: 'PF 4' },
        { code: 'FDB', name: 'FARIDABAD', arrivalTime: '17:05', departureTime: '17:07', day: 1, dist: '28 km', date: '22 Jul 2026', platform: 'PF 3' },
        { code: 'MTJ', name: 'MATHURA JN', arrivalTime: '18:45', departureTime: '18:50', day: 1, dist: '141 km', date: '22 Jul 2026', platform: 'PF 1' },
        { code: 'BTE', name: 'BHARATPUR JN', arrivalTime: '19:18', departureTime: '19:20', day: 1, dist: '175 km', date: '22 Jul 2026', platform: 'PF 3' },
        { code: 'KOTA', name: 'KOTA JN', arrivalTime: '23:30', departureTime: '23:40', day: 1, dist: '466 km', date: '22 Jul 2026', platform: 'PF 2' },
        { code: 'RTM', name: 'RATLAM JN', arrivalTime: '03:20', departureTime: '03:30', day: 2, dist: '733 km', date: '23 Jul 2026', platform: 'PF 4' },
        { code: 'BRC', name: 'VADODARA JN', arrivalTime: '07:15', departureTime: '07:25', day: 2, dist: '994 km', date: '23 Jul 2026', platform: 'PF 1' },
        { code: 'ST', name: 'SURAT', arrivalTime: '09:15', departureTime: '09:20', day: 2, dist: '1124 km', date: '23 Jul 2026', platform: 'PF 3' },
        { code: 'VAPI', name: 'VAPI', arrivalTime: '10:45', departureTime: '10:47', day: 2, dist: '1219 km', date: '23 Jul 2026', platform: 'PF 2' },
        { code: 'BVI', name: 'BORIVALI', arrivalTime: '13:50', departureTime: '13:55', day: 2, dist: '1358 km', date: '23 Jul 2026', platform: 'PF 7' },
        { code: 'MMCT', name: 'MUMBAI CENTRAL', arrivalTime: arrivalTime, departureTime: arrivalTime, day: 2, dist: '1386 km', date: '23 Jul 2026', platform: 'PF 1' }
      ];
    } else if (
      destCode === 'MAS' || destCode === 'CBE' || destName.includes('CHENNAI') || destName.includes('COIMBATORE') ||
      numStr.includes('12243') || nameStr.includes('SHATABDI')
    ) {
      return [
        { code: 'MAS', name: 'MGR CHENNAI CTL', arrivalTime: departureTime, departureTime: departureTime, day: 1, dist: '0 km', date: '22 Jul 2026', platform: 'PF 2' },
        { code: 'KPD', name: 'KATPADI JN', arrivalTime: '08:48', departureTime: '08:50', day: 1, dist: '130 km', date: '22 Jul 2026', platform: 'PF 1' },
        { code: 'JTJ', name: 'JOLARPETTAI', arrivalTime: '09:58', departureTime: '10:00', day: 1, dist: '214 km', date: '22 Jul 2026', platform: 'PF 2' },
        { code: 'SA', name: 'SALEM JN', arrivalTime: '11:38', departureTime: '11:40', day: 1, dist: '335 km', date: '22 Jul 2026', platform: 'PF 4' },
        { code: 'ED', name: 'ERODE JN', arrivalTime: '12:35', departureTime: '12:40', day: 1, dist: '394 km', date: '22 Jul 2026', platform: 'PF 2' },
        { code: 'TUP', name: 'TIRUPPUR', arrivalTime: '13:23', departureTime: '13:25', day: 1, dist: '445 km', date: '22 Jul 2026', platform: 'PF 1' },
        { code: 'CBE', name: 'COIMBATORE JN', arrivalTime: arrivalTime, departureTime: arrivalTime, day: 1, dist: '495 km', date: '22 Jul 2026', platform: 'PF 3' }
      ];
    } else {
      return [
        { code: 'NDLS', name: 'NEW DELHI', arrivalTime: departureTime, departureTime: departureTime, day: 1, dist: '0 km', date: '22 Jul 2026', platform: 'PF 12' },
        { code: 'MB', name: 'MORADABAD JN', arrivalTime: '16:02', departureTime: '16:10', day: 1, dist: '166 km', date: '22 Jul 2026', platform: 'PF 1' },
        { code: 'BE', name: 'BAREILLY JN', arrivalTime: '17:40', departureTime: '17:42', day: 1, dist: '256 km', date: '22 Jul 2026', platform: 'PF 1' },
        { code: 'LKO', name: 'LUCKNOW CHARBAGH', arrivalTime: '21:20', departureTime: '21:30', day: 1, dist: '491 km', date: '22 Jul 2026', platform: 'PF 3' },
        { code: 'SLN', name: 'SULTANPUR JN', arrivalTime: '23:46', departureTime: '23:48', day: 1, dist: '631 km', date: '22 Jul 2026', platform: 'PF 2' },
        { code: 'BSB', name: 'VARANASI JN', arrivalTime: '02:35', departureTime: '02:45', day: 2, dist: '774 km', date: '23 Jul 2026', platform: 'PF 9' },
        { code: 'DDU', name: 'PT DEEN DAYAL UPADHYAYA', arrivalTime: '03:43', departureTime: '03:53', day: 2, dist: '792 km', date: '23 Jul 2026', platform: 'PF 2' },
        { code: 'BXR', name: 'BUXAR', arrivalTime: '05:07', departureTime: '05:09', day: 2, dist: '886 km', date: '23 Jul 2026', platform: 'PF 1' },
        { code: 'ARA', name: 'ARA JN', arrivalTime: '06:02', departureTime: '06:04', day: 2, dist: '954 km', date: '23 Jul 2026', platform: 'PF 1' },
        { code: 'DNR', name: 'DANAPUR', arrivalTime: '06:40', departureTime: '06:42', day: 2, dist: '994 km', date: '23 Jul 2026', platform: 'PF 1A' },
        { code: 'PNBE', name: 'PATNA JN', arrivalTime: '07:15', departureTime: '07:25', day: 2, dist: '1003 km', date: '23 Jul 2026', platform: 'PF 1' },
        { code: 'PNC', name: 'PATNA SAHEB', arrivalTime: arrivalTime, departureTime: arrivalTime, day: 2, dist: '1013 km', date: '23 Jul 2026', platform: 'PF 2' }
      ];
    }
  };

  const fullRouteStops = getTrainStops(train, trainNumber, trainName);
  const availableBoardingStops = fullRouteStops.slice(0, Math.max(1, fullRouteStops.length - 1));
  const [selectedBoardingStation, setSelectedBoardingStation] = useState(availableBoardingStops[0]);

  // ⚡ Live Real-Time Seat Status Calculation (Microsecond Memory Cache)
  const currentSeatStatusObj = getEffectiveSeatStatus(
    trainNumber,
    classCode,
    selectedClass?.status || 'AVAILABLE 110',
    selectedBoardingStation?.date || new Date().toISOString().split('T')[0]
  );
  const currentSeatStatus = currentSeatStatusObj.statusText;
  const isWaitlisted = currentSeatStatusObj.isWL;
  const isRac = currentSeatStatusObj.isRac;
  const remainingSeatsAfterBooking = currentSeatStatusObj.count;

  // Determine AC vs Non-AC (Sleeper) for IRCTC Official Convenience Fee Rules
  const isAcClass = ['1A', '2A', '3A', '3E', 'CC', 'EC', 'EA'].includes(classCode.toUpperCase());
  const cardFee = isAcClass ? 30 : 15;
  const upiFee = isAcClass ? 20 : 10;
  const convenienceFee = paymentMode === 'upi' ? upiFee : cardFee;

  const addPassenger = () => {
    if (passengers.length >= 6) return;
    setPassengers([
      ...passengers,
      { id: Date.now(), name: '', age: '', gender: 'Male', berth: 'No preference', food: 'VEG' }
    ]);
  };

  const toggleMasterPassengerSelection = (id) => {
    if (selectedMasterIds.includes(id)) {
      setSelectedMasterIds(selectedMasterIds.filter(item => item !== id));
    } else {
      if (selectedMasterIds.length >= 6) return;
      setSelectedMasterIds([...selectedMasterIds, id]);
    }
  };

  const handleAddSelectedMasterPassengers = () => {
    const selectedList = masterPassengersList.filter(m => selectedMasterIds.includes(m.id));
    if (selectedList.length === 0) {
      setShowExistingPassengerModal(false);
      return;
    }

    const updated = selectedList.map((m, idx) => ({
      id: Date.now() + idx,
      name: m.name,
      age: String(m.age),
      gender: m.gender,
      berth: m.berth,
      food: m.food
    }));

    setPassengers(updated);
    setShowExistingPassengerModal(false);
  };

  const removePassenger = (id) => {
    if (passengers.length === 1) return;
    setPassengers(passengers.filter(p => p.id !== id));
  };

  const updatePassenger = (id, field, value) => {
    setPassengers(passengers.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const insurancePremium = travelInsurance ? 0.45 * passengers.length : 0;
  const ticketFareTotal = basePrice * passengers.length;
  const payableAmountTotal = ticketFareTotal + convenienceFee + insurancePremium;

  const handleCalculateFareSubmit = (e) => {
    e.preventDefault();
    // Validate passengers
    for (let p of passengers) {
      if (!p.name || !p.age) {
        alert('Please fill all passenger names and ages.');
        return;
      }
    }
    // Transition to Step 2: Non-editable Review Mode
    setStep('review');
  };

  const handleFinalPaymentProceed = () => {
    onProceedToPayment({
      passengers,
      selectedSeats: initialSeats || ['B2-12', 'B2-14'],
      boardingStation: selectedBoardingStation,
      quota: train?.quota || 'GN',
      autoUpgrade,
      confirmBerthOnly,
      travelInsurance,
      insurancePremium,
      reservationChoice,
      preferredCoach,
      gstNumber,
      paymentMode,
      convenienceFee,
      ticketFare: ticketFareTotal,
      totalFare: payableAmountTotal,
      seatStatus: currentSeatStatus,
      remainingSeatsAfterBooking
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex flex-col min-h-screen">
      
      {/* Main Container */}
      <div className="flex-1 bg-slate-100 py-6 px-3 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          
          {/* Back Pill Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (step === 'review') {
                  setStep('input');
                } else {
                  onClose();
                }
              }}
              className="px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-full text-xs font-bold text-[#0026cd] flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{step === 'review' ? 'Edit Passenger Details' : 'Back'}</span>
            </button>

            {step === 'review' && (
              <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-extrabold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>Details Locked for Review & Payment</span>
              </span>
            )}
          </div>

          <form onSubmit={step === 'input' ? handleCalculateFareSubmit : (e) => { e.preventDefault(); handleFinalPaymentProceed(); }} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: Passenger Input vs Non-Editable Review Card */}
            <div className="lg:col-span-8 space-y-4">
              


              {/* Card 1: Boarding Station (Editable in Step 1, Non-Editable in Step 2) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                <div
                  onClick={() => step === 'input' && setShowBoardingSelector(!showBoardingSelector)}
                  className={`flex items-center justify-between p-1 rounded-xl transition-colors ${
                    step === 'input' ? 'cursor-pointer hover:bg-slate-50/80' : 'cursor-default'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-500 block">Boarding Station</span>
                      {step === 'input' && (
                        <span className="px-2 py-0.5 bg-blue-100 text-[#0026cd] rounded font-black text-[10px]">
                          {availableBoardingStops.length} Stops Available
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-extrabold text-[#0026cd] flex flex-wrap items-center gap-2 mt-0.5">
                      <span>{selectedBoardingStation.name} ({selectedBoardingStation.code})</span>
                      <span className="text-slate-400 font-normal">|</span>
                      <span>Arrival: {selectedBoardingStation.arrivalTime}</span>
                      <span className="text-slate-400 font-normal">|</span>
                      <span>Departure: {selectedBoardingStation.departureTime}</span>
                      <span className="text-slate-400 font-normal">|</span>
                      <span>Day: {selectedBoardingStation.day}</span>
                      <span className="text-slate-400 font-normal">|</span>
                      <span>Boarding Date: {selectedBoardingStation.date}</span>
                    </h3>
                  </div>
                  {step === 'input' ? (
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${showBoardingSelector ? 'rotate-180' : 'rotate-0'}`} />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {/* Expandable Table of All Train Stops */}
                {step === 'input' && showBoardingSelector && (
                  <div className="pt-3 border-t border-slate-100 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="flex items-center justify-between bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-xs text-amber-900 font-bold">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Select Boarding Station prior to debording at {toName} ({toCode}):</span>
                      </div>
                      <span className="text-[10px] text-amber-700">Official CRIS Route Schedule</span>
                    </div>

                    <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 bg-slate-50">
                      {availableBoardingStops.map((stop) => {
                        const isSelected = selectedBoardingStation.code === stop.code;
                        return (
                          <label
                            key={stop.code}
                            className={`flex items-center justify-between p-3 transition-colors cursor-pointer ${
                              isSelected ? 'bg-blue-50/80 font-bold text-[#0026cd]' : 'hover:bg-white text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="boardingStation"
                                checked={isSelected}
                                onChange={() => {
                                  setSelectedBoardingStation(stop);
                                  setShowBoardingSelector(false);
                                }}
                                className="w-4 h-4 text-[#0026cd] cursor-pointer"
                              />
                              <div>
                                <span className="text-xs font-black text-slate-900 block">
                                  {stop.name} ({stop.code})
                                </span>
                                <span className="text-[11px] text-slate-500 font-medium">
                                  Arr: {stop.arrivalTime} | Dep: {stop.departureTime} | Day {stop.day} ({stop.date})
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="px-2 py-0.5 bg-slate-200/70 text-slate-700 rounded text-[10px] font-mono font-extrabold">
                                {stop.dist}
                              </span>
                              {isSelected && (
                                <span className="block text-[10px] font-black text-[#0026cd] mt-0.5">SELECTED POINT</span>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Card 2: Passenger Details (Step 1: Editable Inputs Only) */}
              {step === 'input' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-[#0026cd] flex items-center justify-center font-bold">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-black text-slate-900">Passenger Details</h2>
                        <p className="text-[11px] text-slate-500 font-medium">Add passenger details as per ID Proof</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          refreshMasterList();
                          setShowExistingPassengerModal(true);
                        }}
                        className="px-3.5 py-1.5 border border-[#0026cd] text-[#0026cd] hover:bg-blue-50 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>+ Existing Passenger</span>
                      </button>
                      <button
                        type="button"
                        onClick={addPassenger}
                        className="px-3.5 py-1.5 bg-[#0026cd] hover:bg-blue-800 text-white rounded-full text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
                      >
                        <span>+ New Passenger</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Premium Train Onboard Catering Banner */}
                    {isPremium && (
                      <div className="flex items-center gap-2 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-900">
                        <span>🍽️</span>
                        <span>Onboard Catering Available for <strong>{trainName}</strong> ({trainNumber}). Select meal preferences below.</span>
                      </div>
                    )}

                    {/* Master List Autofill Helper */}
                    <div className="flex items-center justify-between bg-blue-50/70 p-2.5 rounded-xl border border-blue-100 text-xs">
                      <span className="text-slate-700 font-medium">Want to fill pre-saved family members instantly?</span>
                      <button
                        type="button"
                        onClick={() => {
                          refreshMasterList();
                          setShowExistingPassengerModal(true);
                        }}
                        className="text-[#0026cd] font-extrabold hover:underline cursor-pointer"
                      >
                        ✨ Select Master Passenger List
                      </button>
                    </div>

                    {passengers.map((p, idx) => (
                      <div key={p.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative group">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-800">Passenger {idx + 1}</span>
                          {passengers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePassenger(p.id)}
                              className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          <div className="sm:col-span-4 space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">Name *</label>
                            <input
                              type="text"
                              placeholder="Enter Name"
                              value={p.name}
                              onChange={(e) => updatePassenger(p.id, 'name', e.target.value.toUpperCase())}
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white outline-none focus:ring-2 focus:ring-[#0026cd]"
                              required
                            />
                          </div>

                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">Age *</label>
                            <input
                              type="number"
                              placeholder="Age"
                              maxLength={3}
                              value={p.age}
                              onChange={(e) => updatePassenger(p.id, 'age', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white outline-none focus:ring-2 focus:ring-[#0026cd]"
                              required
                            />
                          </div>

                          <div className={isPremium ? "sm:col-span-2 space-y-1" : "sm:col-span-3 space-y-1"}>
                            <label className="text-[11px] font-bold text-slate-600">Gender *</label>
                            <select
                              value={p.gender}
                              onChange={(e) => updatePassenger(p.id, 'gender', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white outline-none focus:ring-2 focus:ring-[#0026cd]"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Transgender">Transgender</option>
                            </select>
                          </div>

                          <div className={isPremium ? "sm:col-span-2 space-y-1" : "sm:col-span-3 space-y-1"}>
                            <label className="text-[11px] font-bold text-slate-600">Berth Preference</label>
                            <select
                              value={p.berth}
                              onChange={(e) => updatePassenger(p.id, 'berth', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white outline-none focus:ring-2 focus:ring-[#0026cd]"
                            >
                              <option value="No preference">No preference</option>
                              <option value="Lower">Lower</option>
                              <option value="Middle">Middle</option>
                              <option value="Upper">Upper</option>
                              <option value="Side Lower">Side Lower</option>
                              <option value="Side Upper">Side Upper</option>
                            </select>
                          </div>

                          {/* Onboard Catering Preference - ONLY for Premium Trains (Rajdhani, Vande Bharat, Shatabdi, Tejas, Duronto) */}
                          {isPremium && (
                            <div className="sm:col-span-2 space-y-1">
                              <label className="text-[11px] font-bold text-[#0026cd]">Food Choice *</label>
                              <select
                                value={p.food || 'VEG'}
                                onChange={(e) => updatePassenger(p.id, 'food', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-blue-300 text-xs font-bold text-[#0026cd] bg-blue-50/60 outline-none focus:ring-2 focus:ring-[#0026cd]"
                              >
                                <option value="VEG">Veg Meal</option>
                                <option value="NON_VEG">Non-Veg</option>
                                <option value="JAIN">Jain Meal</option>
                                <option value="NO_FOOD">No Food</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

                {/* Contact Notification Info */}
                <div className="p-3 bg-[#eef4ff] rounded-xl border border-blue-200 text-xs text-slate-800 space-y-2">
                  <p className="font-semibold">
                    Ticket details will be sent to email- <span className="font-bold text-[#0026cd]">as******@gmail.com</span> and registered mobile number <span className="font-bold text-[#0026cd]">91-62******06</span>
                  </p>
                  
                  {step === 'input' && (
                    <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="text-[11px] font-bold text-slate-700">Alternate mobile number (+91):</label>
                      <input
                        type="text"
                        placeholder="Alternate mobile number (+91)"
                        value={alternateMobile}
                        onChange={(e) => setAlternateMobile(e.target.value.replace(/\D/g, ''))}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white text-slate-900 outline-none focus:ring-2 focus:ring-[#0026cd] sm:w-64"
                      />
                    </div>
                  )}
                </div>

              {/* Card 3: Other Preferences */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center justify-between">
                    <span>Other Preferences</span>
                    {step === 'review' && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Share your preferences for a smoother journey</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option 1: Consider for Auto Upgradation */}
                  <label className={`flex items-start gap-2.5 p-3.5 rounded-xl border transition-all ${
                    autoUpgrade ? 'border-blue-500 bg-blue-50/40 shadow-2xs' : 'border-slate-200 bg-white hover:bg-slate-50'
                  } ${step === 'input' ? 'cursor-pointer' : 'cursor-default'}`}>
                    <input
                      type="checkbox"
                      checked={autoUpgrade}
                      disabled={step === 'review'}
                      onChange={(e) => setAutoUpgrade(e.target.checked)}
                      className="w-4 h-4 text-[#0026cd] rounded mt-0.5 cursor-pointer accent-[#0026cd]"
                    />
                    <div>
                      <span className="text-xs font-black text-slate-900 block">Consider for Auto Upgradation</span>
                      <span className="text-[10px] text-slate-500 font-medium">In higher class you may or may not get lower berth</span>
                    </div>
                  </label>

                  {/* Option 2: Book only if confirm berths are allotted */}
                  <label className={`flex items-start gap-2.5 p-3.5 rounded-xl border transition-all ${
                    confirmBerthOnly ? 'border-blue-500 bg-blue-50/40 shadow-2xs' : 'border-slate-200 bg-white hover:bg-slate-50'
                  } ${step === 'input' ? 'cursor-pointer' : 'cursor-default'}`}>
                    <input
                      type="checkbox"
                      checked={confirmBerthOnly}
                      disabled={step === 'review'}
                      onChange={(e) => setConfirmBerthOnly(e.target.checked)}
                      className="w-4 h-4 text-[#0026cd] rounded mt-0.5 cursor-pointer accent-[#0026cd]"
                    />
                    <div>
                      <span className="text-xs font-black text-slate-900 block">Book only if confirm berths are allotted.</span>
                      <span className="text-[10px] text-slate-500 font-medium">Ticket will not be generated if waitlisted</span>
                    </div>
                  </label>

                  {/* Option 3: Do you want to take Travel Insurance (₹0.45/person)? */}
                  <label className={`flex items-start gap-2.5 p-3.5 rounded-xl border transition-all ${
                    travelInsurance ? 'border-blue-500 bg-blue-50/40 shadow-2xs' : 'border-slate-200 bg-white hover:bg-slate-50'
                  } ${step === 'input' ? 'cursor-pointer' : 'cursor-default'}`}>
                    <input
                      type="checkbox"
                      checked={travelInsurance}
                      disabled={step === 'review'}
                      onChange={(e) => setTravelInsurance(e.target.checked)}
                      className="w-4 h-4 text-[#0026cd] rounded mt-0.5 cursor-pointer accent-[#0026cd]"
                    />
                    <div>
                      <span className="text-xs font-black text-slate-900 block">Do you want to take Travel Insurance (₹0.45/person)?</span>
                      <span className="text-[10px] text-[#0026cd] font-bold hover:underline cursor-pointer">terms & conditions</span>
                    </div>
                  </label>

                  {/* Option 4: Reservation Choice */}
                  <div className="p-3 rounded-xl border border-slate-200 space-y-1 bg-white">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <span>Reservation Choice</span>
                      <Info className="w-3.5 h-3.5 text-blue-600 inline" />
                    </label>
                    <select
                      value={reservationChoice}
                      disabled={step === 'review'}
                      onChange={(e) => setReservationChoice(e.target.value)}
                      className="w-full bg-white p-2 rounded-lg border border-slate-300 font-bold text-xs text-[#0026cd] focus:outline-none focus:ring-2 focus:ring-[#0026cd]"
                    >
                      <option value="NONE">Select (No Choice)</option>
                      <option value="LOWER1">Book, only if at least 1 lower berth is allotted.</option>
                      <option value="LOWER2">Book, only if 2 lower berths are allotted.</option>
                      <option value="SAME_COACH">Book, only if same coach is allotted.</option>
                    </select>
                  </div>

                  {/* Option 5: Preferred Coach No. */}
                  <div className="p-3 rounded-xl border border-slate-200 space-y-1 bg-white">
                    <label className="text-[11px] font-bold text-slate-500 block">Preferred Coach No.</label>
                    <input
                      type="text"
                      placeholder="Enter Coach Number (e.g. S3, B2)"
                      value={preferredCoach}
                      disabled={step === 'review'}
                      onChange={(e) => setPreferredCoach(e.target.value)}
                      className="w-full bg-white p-2 rounded-lg border border-slate-300 font-extrabold text-xs text-[#0026cd] placeholder:text-blue-900 outline-none focus:ring-2 focus:ring-[#0026cd]"
                    />
                  </div>

                  {/* Option 6: GST Identification Number(GSTIN) */}
                  <div className="p-3 rounded-xl border border-slate-200 space-y-1 bg-white">
                    <label className="text-[11px] font-bold text-slate-500 block">GST Identification Number(GSTIN)</label>
                    <input
                      type="text"
                      placeholder="Enter GSTIN Number (Optional)"
                      value={gstNumber}
                      disabled={step === 'review'}
                      onChange={(e) => setGstNumber(e.target.value)}
                      className="w-full bg-white p-2 rounded-lg border border-slate-300 font-extrabold text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0026cd]"
                    />
                  </div>
                </div>
              </div>

              {/* Card 4: Official IRCTC Payment Mode Selection */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900">Payment Mode</h3>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-blue-100 text-[#0026cd]">
                    {isAcClass ? 'AC Class Fee Rate (₹30 / ₹20)' : 'Sleeper Fee Rate (₹15 / ₹10)'}
                  </span>
                </div>

                <div className="space-y-2">
                  <label className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                    paymentMode === 'cards' ? 'border-[#0026cd] bg-blue-50/50 shadow-2xs' : 'border-slate-200'
                  } ${step === 'input' ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'}`}>
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={paymentMode === 'cards'}
                      disabled={step === 'review'}
                      onChange={() => setPaymentMode('cards')}
                      className="w-4 h-4 text-[#0026cd] mt-0.5 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block">Pay through Credit & Debit Cards / Net Banking / Wallets / EMI / UPI_CC / UPI_CL / Rewards and Others</span>
                      <span className="text-[11px] text-slate-500 font-bold">Convenience Fee: ₹{cardFee}/- + GST</span>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                    paymentMode === 'upi' ? 'border-[#0026cd] bg-blue-50/50 shadow-2xs' : 'border-slate-200'
                  } ${step === 'input' ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'}`}>
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={paymentMode === 'upi'}
                      disabled={step === 'review'}
                      onChange={() => setPaymentMode('upi')}
                      className="w-4 h-4 text-[#0026cd] mt-0.5 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block">Pay through BHIM/UPI</span>
                      <span className="text-[11px] text-slate-500 font-bold">Convenience Fee: ₹{upiFee}/- + GST</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Button: Step 1 vs Step 2 */}
              <div>
                {step === 'input' ? (
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-[#0026cd] hover:bg-blue-800 text-white rounded-full text-xs font-black transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <span>Calculate Fare & Review Details ➔</span>
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <button
                      type="button"
                      onClick={handleFinalPaymentProceed}
                      className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm font-black transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Proceed to Pay ₹{payableAmountTotal.toLocaleString('en-IN')}.00 ➔</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setStep('input')}
                      className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-extrabold text-xs rounded-full cursor-pointer transition-colors"
                    >
                      ✏️ Edit Passenger Details
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: 1:1 Booking Review Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-[#fff8f0] rounded-3xl border border-amber-200/80 p-5 shadow-sm space-y-4 sticky top-6">
                
                {/* Stepper Header */}
                <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-500 border-b border-amber-200/60 pb-3">
                  <span className={step === 'input' ? 'text-[#0026cd] font-black' : 'text-emerald-700 font-black flex items-center gap-1'}>
                    {step === 'review' ? '✓ 1 Review' : '1 Review'}
                  </span>
                  <span>---------</span>
                  <span className={step === 'review' ? 'text-[#0026cd] font-black' : 'text-slate-400'}>2 Payment</span>
                  <span>---------</span>
                  <span className="text-slate-400">3 Confirm</span>
                </div>

                {/* Card Title */}
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded bg-amber-500 text-white flex items-center justify-center text-xs font-black shrink-0">
                    ::
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      {step === 'review' ? 'Calculated Fare & Summary' : 'Booking Review'}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">Review and confirm your booking</p>
                  </div>
                </div>

                {/* Orange Notice Banner */}
                <div className="p-2.5 bg-amber-100/80 border border-amber-300/60 rounded-xl text-[11px] font-bold text-amber-900">
                  {step === 'review'
                    ? 'Fare breakdown calculated. Verify passenger count & berth preferences before proceeding to payment.'
                    : 'Train fare is calculated based on passenger details. Click calculate fare for details.'
                  }
                </div>

                {/* Train Details */}
                <div className="space-y-2 border-b border-amber-200/60 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#0026cd]">{trainName.toUpperCase()} ({trainNumber})</span>
                    <button
                      type="button"
                      onClick={() => setShowScheduleModal(true)}
                      className="text-[11px] font-bold text-[#0026cd] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Train schedule</span>
                    </button>
                  </div>

                  {/* Route & Times */}
                  <div className="bg-white/80 p-3 rounded-xl border border-amber-200/50 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <div>
                        <span className="block font-black text-slate-900">{departureTime} PM</span>
                        <span className="text-[10px] text-slate-500">Wed, 22 Jul</span>
                      </div>
                      <div className="text-center text-[10px] font-bold text-slate-400">
                        <span>{duration}</span>
                        <div className="w-16 h-0.5 bg-blue-300 mx-auto my-0.5"></div>
                      </div>
                      <div className="text-right">
                        <span className="block font-black text-slate-900">{arrivalTime} AM</span>
                        <span className="text-[10px] text-slate-500">Thu, 23 Jul</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-700 pt-1 border-t border-slate-100">
                      <span>{fromCode} - {fromName}</span>
                      <span>{toCode} - {toName}</span>
                    </div>
                  </div>

                  <div className="text-[11px] font-bold text-slate-700 space-y-0.5">
                    <p>Class: <span className="font-extrabold text-slate-900">{className}</span> | Quota: <span className="font-extrabold text-[#0026cd]">{quotaDisplay}</span></p>
                    <p>Boarding: <span className="font-extrabold text-[#0026cd]">{selectedBoardingStation.name} | {selectedBoardingStation.date} ({selectedBoardingStation.departureTime})</span></p>
                  </div>
                </div>

                {/* Passengers List Card */}
                <div className="space-y-1.5 border-b border-amber-200/60 pb-3">
                  <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">PASSENGERS</h4>
                  <div className="bg-[#fffdfa] p-3 rounded-2xl border border-amber-200/60 space-y-2 max-h-48 overflow-y-auto">
                    {passengers.map((p, idx) => {
                      const foodMap = { VEG: 'Veg Meal', NON_VEG: 'Non-Veg', JAIN: 'Jain Meal', NO_FOOD: 'No Food' };
                      const foodText = isPremium && p.food ? ` | ${foodMap[p.food] || p.food}` : '';
                      return (
                        <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                          <span className="font-black text-slate-900 uppercase">{p.name || 'PASSENGER'}</span>
                          <span className="text-[11px] text-slate-600 font-extrabold">
                            Age {p.age || '—'} | {p.gender} | India | {p.berth || 'No preference'}{foodText}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Fare Summary */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase">Fare Summary</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-700 font-bold">
                      <span>Ticket Fare</span>
                      <span className="font-mono text-slate-900">₹{ticketFareTotal.toLocaleString('en-IN')}.00</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Convenience Fee (Incl. of GST)</span>
                      <span className="font-mono">₹{convenienceFee.toFixed(2)}</span>
                    </div>
                    {travelInsurance && (
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Travel Insurance Premium (Incl. of GST)</span>
                        <span className="font-mono">₹{insurancePremium.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm font-black text-[#0026cd] pt-2 border-t border-amber-200/60">
                      <span>Payable Amount / Total Amount</span>
                      <span className="font-mono text-base">₹{payableAmountTotal.toFixed(2)}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium block">Inclusive of all taxes</span>
                  </div>
                </div>

                {/* Seat Status Badge in Sidebar */}
                <div className="pt-2 border-t border-amber-200/60">
                  <div className="flex items-center justify-between text-xs font-extrabold">
                    <span className="text-slate-600">Seat Availability:</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                      isWaitlisted ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {currentSeatStatus}
                    </span>
                  </div>
                </div>

                {/* Cancellation Policy link */}
                <div className="pt-1">
                  <a
                    href="#cancellation-policy"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("IRCTC Cancellation Policy: Flat Rs 180 fee per passenger for 3AC class if cancelled 48h prior.");
                    }}
                    className="text-xs font-bold text-[#0026cd] hover:underline block"
                  >
                    View Cancellation Policy
                  </a>
                </div>

              </div>
            </div>

          </form>

        </div>
      </div>

      {/* 1:1 Official IRCTC "Add existing passenger" Modal */}
      {showExistingPassengerModal && (
        <div
          className="fixed inset-0 z-[110] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowExistingPassengerModal(false)}
        >
          <div
            className="bg-[#fff7f0] rounded-3xl border border-amber-200/90 shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 p-5 space-y-4 my-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#0026cd] flex items-center justify-center border border-blue-200/60">
                  <Calendar className="w-5 h-5 text-[#0026cd]" />
                </div>
                <h3 className="font-black text-lg text-[#000066]">Add existing passenger</h3>
              </div>

              <button
                type="button"
                onClick={() => setShowExistingPassengerModal(false)}
                className="w-7 h-7 rounded-full bg-[#3b3dbf] text-white flex items-center justify-center hover:bg-blue-900 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Passenger Selection Cards */}
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {masterPassengersList.map((m) => {
                const isSelected = selectedMasterIds.includes(m.id);
                return (
                  <label
                    key={m.id}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-blue-300 shadow-2xs ring-1 ring-blue-400'
                        : 'bg-white/80 border-slate-200/80 hover:bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleMasterPassengerSelection(m.id)}
                      className="w-4.5 h-4.5 text-[#0026cd] rounded mt-0.5 cursor-pointer shrink-0"
                    />

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-xs text-slate-900 tracking-wide">{m.name}</span>
                        {m.verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600/20 shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 font-bold">
                        Age {m.age} | {m.gender} | {m.nationality} | {m.berth} | {m.food}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Bottom Add Pill Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAddSelectedMasterPassengers}
                className="w-full py-3 bg-[#3335d1] hover:bg-blue-800 text-white font-black text-sm rounded-full transition-colors shadow-md cursor-pointer text-center"
              >
                Add
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 1:1 High-Z-Index Fixed Overlay Train Schedule Timetable Modal */}
      {showScheduleModal && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => setShowScheduleModal(false)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="bg-[#0026cd] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                  <Train className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm">{trainName.toUpperCase()} ({trainNumber}) - Official Timetable</h3>
                  <p className="text-[11px] text-blue-200 font-medium">Runs On: MON TUE WED THU FRI SAT SUN</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Timetable Body */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Full Train Route: {fromName} ({fromCode}) ➔ {toName} ({toCode})</span>
                <span className="font-mono text-[#0026cd] font-black">{fullRouteStops.length} Official Stops</span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#edf4ff] text-[#0026cd] font-black uppercase text-[11px]">
                    <tr>
                      <th className="p-3">S.No</th>
                      <th className="p-3">Station Code</th>
                      <th className="p-3">Station Name</th>
                      <th className="p-3">Arrival</th>
                      <th className="p-3">Departure</th>
                      <th className="p-3">Platform</th>
                      <th className="p-3">Distance</th>
                      <th className="p-3">Day</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                    {fullRouteStops.map((s, idx) => (
                      <tr key={idx} className={s.code === fromCode || s.code === toCode ? 'bg-amber-50/80 font-bold' : 'hover:bg-slate-50'}>
                        <td className="p-3 font-mono font-bold text-slate-500">{idx + 1}</td>
                        <td className="p-3 font-mono font-black text-[#0026cd]">{s.code}</td>
                        <td className="p-3 font-bold text-slate-900">{s.name}</td>
                        <td className="p-3 font-mono">{s.arrivalTime}</td>
                        <td className="p-3 font-mono">{s.departureTime}</td>
                        <td className="p-3 font-bold text-amber-700">{s.platform || 'PF 1'}</td>
                        <td className="p-3 font-mono">{s.dist}</td>
                        <td className="p-3 font-bold">Day {s.day}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[11px] text-slate-500 font-medium">💡 Click anywhere outside this box to close</span>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="px-6 py-2.5 bg-[#0026cd] hover:bg-blue-800 text-white rounded-xl text-xs font-extrabold transition-colors cursor-pointer shadow-md"
              >
                Close Schedule
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
