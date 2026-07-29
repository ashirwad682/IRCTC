import React, { useState, useEffect, useRef, useMemo } from 'react';
import StationAutocomplete from './StationAutocomplete';
import CustomCalendarModal from './CustomCalendarModal';
import { API_BASE_URL } from '../config/api';
import { Search, Calendar, MapPin, ArrowRightLeft, Ticket, Route, Undo2, ChevronRight, Smartphone, QrCode, Tag, Sparkles } from 'lucide-react';

export default function HeroSearch({
  onSearch,
  fromStation,
  setFromStation,
  toStation,
  setToStation,
  selectedDate,
  setSelectedDate,
  selectedClass,
  setSelectedClass,
  selectedQuota,
  setSelectedQuota,
  onOpenAIModal,
  onOpenSchedule,
  currentUser,
  userBookings = [],
  onViewTicket,
  onOpenProfile,
  onOpenRefundModal,
  onClearAllBookings
}) {
  const [concession, setConcession] = useState('NONE');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [mongoRecentJourneys, setMongoRecentJourneys] = useState([]);
  const videoRef = useRef(null);

  // Fetch user's saved recent journeys directly from MongoDB Atlas Database
  useEffect(() => {
    if (currentUser?.username) {
      fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(currentUser.username)}/recent-journeys`)
        .then(res => res.json())
        .then(data => {
          if (data && data.success && Array.isArray(data.data)) {
            setMongoRecentJourneys(data.data);
          }
        })
        .catch(err => console.warn('Fetch homepage recent journeys notice:', err));
    }
  }, [currentUser]);

  // Set Slow Motion Playback Rate (0.5x speed for smooth cinematic movement)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }
  }, []);

  // System Clock check for automatic Tatkal Rush Hours & post 11:30 AM rule
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  const isAcTatkalWindow = totalMinutes >= 590 && totalMinutes <= 615;
  const isSleeperTatkalWindow = totalMinutes >= 650 && totalMinutes <= 675;
  const isPost1130 = totalMinutes >= 690;
  const isTatkalWindow = isAcTatkalWindow || isSleeperTatkalWindow;

  useEffect(() => {
    if (isTatkalWindow && selectedQuota !== 'TQ' && selectedQuota !== 'PT') {
      setSelectedQuota('TQ');
    }
  }, [isTatkalWindow, selectedQuota, setSelectedQuota]);

  const handleSwap = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  const handleRecentJourney = (from, to) => {
    setFromStation(from);
    setToStation(to);
    onSearch();
  };

  const getFormattedDateInfo = (dateStr) => {
    if (!dateStr) return { dateFormatted: 'Select Date', dayOfWeek: '' };
    const parts = dateStr.split('-');
    if (parts.length !== 3) return { dateFormatted: dateStr, dayOfWeek: '' };
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (isNaN(d.getTime())) return { dateFormatted: dateStr, dayOfWeek: '' };

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const dayOfWeek = days[d.getDay()];
    const dateFormatted = `${d.getDate()} ${months[d.getMonth()]} '${String(d.getFullYear()).slice(-2)}`;
    return { dateFormatted, dayOfWeek };
  };

  const setQuickDate = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const iso = d.toISOString().split('T')[0];
    setSelectedDate(iso);
  };

  // Derive dynamic list of recent journeys combining MongoDB Atlas database records & user bookings
  const dynamicJourneys = useMemo(() => {
    const list = [];
    if (Array.isArray(mongoRecentJourneys)) {
      mongoRecentJourneys.forEach(rj => {
        if (rj?.fromCode && rj?.toCode) {
          list.push({
            key: `mongo_${rj.fromCode}_${rj.toCode}`,
            from: rj.fromCode,
            fromName: rj.fromCity || rj.fromCode,
            to: rj.toCode,
            toName: rj.toCity || rj.toCode
          });
        }
      });
    }
    if (Array.isArray(userBookings)) {
      userBookings.forEach(b => {
        if (b?.from && b?.to) {
          const key = `booking_${b.from}_${b.to}`;
          if (!list.find(item => item.from === b.from && item.to === b.to)) {
            list.push({
              key,
              from: b.from,
              fromName: b.from,
              to: b.to,
              toName: b.to
            });
          }
        }
      });
    }
    return list.slice(0, 6);
  }, [mongoRecentJourneys, userBookings]);

  const tripsToDisplay = Array.isArray(userBookings) ? userBookings.filter(b => b.status !== 'CANCELLED') : [];
  const lastTransaction = Array.isArray(userBookings) && userBookings.length > 0 ? userBookings[0] : null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#ebf3fe] via-[#f2f6ff] to-[#fef5ec] pb-16">
      {/* Ambient background grid pattern for modern tech aesthetic */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">

        {/* HERO BANNER HEADER */}
        <div className="relative py-4 my-2">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-[#0026cd] font-black text-xs shadow-xs backdrop-blur-xs">
                <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                <span>Official IRCTC Next-Gen Railway Booking Portal</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                Your journey, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500">made simple</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-bold max-w-lg leading-relaxed">
                100% Guaranteed seat availability, instant PNR verification, and official bank refunds.
              </p>
            </div>

            {/* Vande Bharat Express Ultra-HD Video Showcase Card */}
            <div className="relative shrink-0 rounded-3xl overflow-hidden border-2 border-white/80 shadow-2xl bg-slate-950 group max-w-sm sm:max-w-md w-full aspect-video">
              <video
                ref={videoRef}
                src="/vande_bharat_video.mov"
                autoPlay
                loop
                muted
                playsInline
                onPlay={(e) => { e.target.playbackRate = 0.5; }}
                onLoadedMetadata={(e) => { e.target.playbackRate = 0.5; }}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 contrast-[1.12] brightness-[1.04] saturate-[1.22] sharp"
              />

              {/* Glassmorphic Ambient Glow Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />

              {/* Live Streaming Indicator Header */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-black shadow-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-emerald-300 tracking-wider">LIVE SHOWCASE</span>
                </div>
                <span className="text-[9px] font-black text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-500/40 backdrop-blur-md shadow-md">
                  ✨ 8K ULTRA HD HDR
                </span>
              </div>

              {/* Bottom Badges */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                <span className="flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-black shadow-xl backdrop-blur-md border border-orange-400/30">
                  ⚡ Vande Bharat Express
                </span>
                <span className="text-[10px] font-black text-blue-100 bg-blue-950/90 px-2.5 py-1 rounded-xl border border-blue-400/30 backdrop-blur-md shadow-md">
                  160 KM/H Cinematic Motion
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Search Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-blue-100/90 shadow-2xl p-5 sm:p-7 relative z-10 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,38,205,0.08)]">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

            {/* Main Form Fields Container (Col 9) */}
            <div className="lg:col-span-9 space-y-4">

              {/* Row 1: From (4 cols), Swap (1 col), To (4 cols), Date (3 cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">

                {/* From Station Autocomplete (4 cols) */}
                <div className="sm:col-span-4 relative z-30">
                  <StationAutocomplete
                    label="From"
                    selectedCode={fromStation}
                    onSelectStation={setFromStation}
                    iconType="circle"
                  />
                </div>

                {/* Swap Stations Button (1 col) */}
                <div className="sm:col-span-1 flex justify-center -my-2 sm:my-0 z-10">
                  <button
                    onClick={handleSwap}
                    className="w-10 h-10 rounded-2xl bg-[#0026cd] hover:bg-blue-900 text-white flex items-center justify-center shadow-lg hover:shadow-blue-500/20 active:rotate-180 transition-all duration-300 cursor-pointer border border-blue-400/30"
                    title="Swap Source and Destination"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* To Station Autocomplete (4 cols) */}
                <div className="sm:col-span-4 relative z-30">
                  <StationAutocomplete
                    label="To"
                    selectedCode={toStation}
                    onSelectStation={setToStation}
                    iconType="pin"
                  />
                </div>

                {/* Enhanced Professional Date Picker Trigger (3 cols) */}
                <div
                  onClick={() => setShowCalendarModal(true)}
                  className="sm:col-span-3 relative bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-600 transition-all group cursor-pointer z-20 min-h-[66px] flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                      JOURNEY DATE
                    </label>
                    <div className="flex items-center gap-1 z-20">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setQuickDate(0); }}
                        className="text-[9px] font-black text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md transition-colors cursor-pointer border border-blue-200/60"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setQuickDate(1); }}
                        className="text-[9px] font-black text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md transition-colors cursor-pointer border border-blue-200/60"
                      >
                        Tomorrow
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-blue-50 group-hover:bg-blue-100 text-[#0026cd] flex items-center justify-center shrink-0 transition-colors">
                      <Calendar className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      {selectedDate ? (
                        <div className="flex items-baseline gap-1.5 truncate">
                          <span className="font-black text-blue-950 text-xs sm:text-sm truncate">
                            {getFormattedDateInfo(selectedDate).dateFormatted}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 truncate">
                            {getFormattedDateInfo(selectedDate).dayOfWeek}
                          </span>
                        </div>
                      ) : (
                        <span className="font-semibold text-slate-400 text-xs block truncate">
                          Select Journey Date
                        </span>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Row 2: Quota (4 cols), Concession (4 cols), Search Button (4 cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">

                {/* Quota Selector */}
                <div className="sm:col-span-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-500 transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">
                      Quota
                    </label>
                    {isTatkalWindow && (
                      <span className="text-[9px] font-black text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-200 animate-pulse">
                        ⚡ Tatkal Rush
                      </span>
                    )}
                  </div>
                  <select
                    value={selectedQuota}
                    onChange={(e) => setSelectedQuota(e.target.value)}
                    className="w-full bg-transparent font-extrabold text-blue-950 text-xs focus:outline-none cursor-pointer"
                  >
                    {isTatkalWindow ? (
                      <>
                        <option value="TQ">Tatkal</option>
                        <option value="PT">Premium Tatkal</option>
                      </>
                    ) : (
                      <>
                        <option value="GN">General</option>
                        <option value="SS">Senior Citizen / Lower Berth</option>
                        {!isPost1130 && <option value="TQ">Tatkal</option>}
                        {!isPost1130 && <option value="PT">Premium Tatkal</option>}
                        <option value="DP">Duty Pass Quota</option>
                        <option value="LD">Ladies</option>
                        <option value="DV">Divyangjan</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Concession Selector */}
                <div className="sm:col-span-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-500 transition-all">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1 tracking-wider">
                    Concession
                  </label>
                  <select
                    value={concession}
                    onChange={(e) => setConcession(e.target.value)}
                    className="w-full bg-transparent font-bold text-slate-700 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="NONE">None</option>
                    <option value="PWD">Person With Disability Concession</option>
                    <option value="PASS">Railway Pass Concession</option>
                  </select>
                </div>

                {/* Search Trains Button */}
                <div className="sm:col-span-4">
                  <button
                    onClick={onSearch}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0026cd] via-[#0034ea] to-[#1e40af] hover:from-blue-900 hover:to-indigo-900 text-white font-black text-sm shadow-xl hover:shadow-blue-500/25 flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer border border-blue-400/20"
                  >
                    <Search className="w-5 h-5" />
                    <span>Search Trains</span>
                  </button>
                </div>

              </div>

            </div>

            {/* Quick Action Cards on Right Side */}
            <div className="lg:col-span-3 space-y-3">

              {/* Check PNR Status Card */}
              <div
                onClick={onOpenAIModal}
                className="bg-slate-50/80 hover:bg-blue-50/70 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-blue-300 cursor-pointer transition-all flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-[#0026cd] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 shadow-xs">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-blue-950">Check PNR Status</h4>
                  <span className="text-[10px] text-slate-500 font-semibold block">Instant PNR verification</span>
                </div>
              </div>

              {/* Train Schedule Card */}
              <div
                onClick={() => onOpenSchedule ? onOpenSchedule() : onOpenAIModal()}
                className="bg-slate-50/80 hover:bg-blue-50/70 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-blue-300 cursor-pointer transition-all flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 shadow-xs">
                  <Route className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-blue-950">Train Schedule</h4>
                  <span className="text-[10px] text-slate-500 font-semibold block">Live routes & timings</span>
                </div>
              </div>

              {/* Check Refund Status Card */}
              {currentUser && (
                <div
                  onClick={onOpenRefundModal}
                  className="bg-slate-50/80 hover:bg-emerald-50/70 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 cursor-pointer transition-all flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 shadow-xs">
                    <Undo2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-blue-950">Check Refund Status</h4>
                    <span className="text-[10px] text-slate-500 font-semibold block">100% Bank Refunds</span>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

        {/* LOGGED IN USER RECENT & FAVORITE JOURNEYS & UPCOMING TRIPS DASHBOARD */}
        {currentUser && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-blue-100 p-6 shadow-md space-y-6 relative z-10">

            {/* Your Favorite & Recent Journeys */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  <h3 className="text-sm font-black text-[#000066] uppercase tracking-wider">Your Favorite & Recent Journeys</h3>
                </div>
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="text-xs font-black text-blue-700 hover:text-blue-900 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Manage in Profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {dynamicJourneys.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2.5">
                  {dynamicJourneys.map((j, idx) => (
                    <button
                      key={j.key || idx}
                      onClick={() => handleRecentJourney(j.from, j.to)}
                      className="px-4 py-2.5 rounded-2xl bg-white hover:bg-blue-600 hover:text-white text-slate-800 font-black text-xs border border-slate-200/90 shadow-2xs hover:shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer group"
                    >
                      <span className="text-blue-700 group-hover:text-white transition-colors font-mono">{j.from}</span>
                      <span className="text-slate-400 group-hover:text-blue-100">➔</span>
                      <span className="text-blue-700 group-hover:text-white transition-colors font-mono">{j.to}</span>
                      <span className="text-[10px] text-slate-500 group-hover:text-blue-200 font-semibold truncate max-w-[140px]">
                        ({j.fromName} to {j.toName})
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4">
                  <p className="text-xs font-bold text-slate-600">
                    No favorite journeys added yet. Go to <strong className="text-blue-900 cursor-pointer underline" onClick={onOpenProfile}>My Account ➔ Add Recent Journey List</strong> to save your frequent routes to MongoDB Atlas!
                  </p>
                </div>
              )}
            </div>

            {/* Upcoming Trips & Last Transaction Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              {/* Upcoming Trips (Col 8) */}
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-[#000066]">Upcoming trips</h3>
                    <button
                      onClick={onOpenProfile}
                      className="w-6 h-6 rounded-full bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {tripsToDisplay.length > 0 ? (
                    tripsToDisplay.map((trip) => (
                      <div
                        key={trip.pnr}
                        onClick={() => onViewTicket && onViewTicket(trip)}
                        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md cursor-pointer transition-all space-y-1 group"
                      >
                        <h4 className="text-xs font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                          {trip.trainName} ({trip.trainNumber})
                        </h4>
                        <p className="text-xs font-bold text-slate-600">
                          {trip.from} ➔ {trip.to} <span className="text-slate-400 font-normal">|</span> {trip.date} <span className="text-slate-400 font-normal">|</span> {trip.classCode || '3A'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center space-y-1">
                      <p className="text-xs font-extrabold text-slate-800">No upcoming trips booked yet</p>
                      <p className="text-[11px] text-slate-500 font-medium">Search for your train and book tickets to view them here.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Last Transaction (Col 4) */}
              <div className="lg:col-span-4 space-y-3">
                <h3 className="text-sm font-black text-[#000066]">Last transaction</h3>

                {lastTransaction ? (
                  <div
                    onClick={() => onViewTicket && onViewTicket(lastTransaction)}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-slate-900 text-xs">{lastTransaction.pnr}</span>
                      <span className="text-[11px] font-bold text-slate-500">{lastTransaction.date} | {lastTransaction.classCode || '3A'}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-xs font-extrabold text-slate-800 group-hover:text-blue-700">
                        {lastTransaction.from} ➔ {lastTransaction.to}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black text-[10px] uppercase">
                        BOOKED
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center">
                    <p className="text-xs font-extrabold text-slate-700">No previous transactions</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* 4. OFFICIAL IRCTC RAILCONNECT MOBILE APP PROMOTION BANNER */}
        <div className="rounded-3xl border border-blue-200 shadow-md relative overflow-hidden">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">

            {/* Left Side: Full user-provided IRCTC RailConnect promotional image */}
            <div className="lg:col-span-6 relative">
              <img
                src="/railconnect_banner.jpg"
                alt="IRCTC RailConnect - Your journey, now just a tap away"
                className="w-full h-full object-cover min-h-[260px]"
              />
            </div>

            {/* Right Side: App Headline, Store Badges, QR Code (Col 6 - Glass Card) */}
            <div className="lg:col-span-6 bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 sm:p-8 space-y-6 flex flex-col justify-center">

              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                  Your journey. <br />
                  <span className="text-blue-700">now just a tap away</span>
                </h2>
                <p className="text-xs sm:text-sm font-bold text-slate-600">
                  Download the <strong className="text-blue-900">IRCTC RailConnect app</strong> to book your train tickets, anywhere, anytime
                </p>
              </div>

              {/* Store Buttons & QR Code Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">

                {/* App Store Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <a
                    href="https://play.google.com/store/apps/details?id=cris.org.in.prs.ima&hl=en_IN"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-2xl bg-black text-white font-black text-xs shadow-lg flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 cursor-pointer no-underline"
                  >
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <div className="text-left">
                      <span className="text-[8px] text-slate-400 uppercase font-bold block">GET IT ON</span>
                      <span className="text-xs font-black">Google Play</span>
                    </div>
                  </a>

                  <a
                    href="https://apps.apple.com/in/app/irctc-rail-connect/id1386197253"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-2xl bg-black text-white font-black text-xs shadow-lg flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 cursor-pointer no-underline"
                  >
                    <Smartphone className="w-5 h-5 text-blue-400" />
                    <div className="text-left">
                      <span className="text-[8px] text-slate-400 uppercase font-bold block">Download on the</span>
                      <span className="text-xs font-black">App Store</span>
                    </div>
                  </a>
                </div>

                {/* QR Code Box */}
                <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <QrCode className="w-12 h-12 text-slate-900" />
                  <div>
                    <span className="text-[10px] font-black text-blue-900 block">Scan to download</span>
                    <span className="text-[8px] text-slate-400 font-bold block">iOS & Android</span>
                  </div>
                </div>

              </div>

              {/* Bottom Features Bullet List */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-200/80 text-[11px] font-extrabold text-slate-800">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                    <Ticket className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block font-black text-slate-900">Book tickets</span>
                    <span className="block text-[9px] text-slate-400 font-bold">Quick & easy</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                    <Route className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block font-black text-slate-900">Check PNR status</span>
                    <span className="block text-[9px] text-slate-400 font-bold">Stay updated</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                    <Tag className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block font-black text-slate-900">Exciting offers</span>
                    <span className="block text-[9px] text-slate-400 font-bold">Best deals</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Custom IRCTC Interactive Calendar Modal */}
      {showCalendarModal && (
        <CustomCalendarModal
          selectedDate={selectedDate}
          onSelectDate={(isoStr) => setSelectedDate(isoStr)}
          onClose={() => setShowCalendarModal(false)}
        />
      )}

    </div>
  );
}
