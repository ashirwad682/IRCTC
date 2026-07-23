import React, { useState, useEffect, useRef } from 'react';
import StationAutocomplete from './StationAutocomplete';
import CustomCalendarModal from './CustomCalendarModal';
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
  const videoRef = useRef(null);

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

  // Derive dynamic list of recent journeys strictly from actual user database bookings
  const dynamicJourneys = Array.isArray(userBookings)
    ? userBookings.reduce((acc, b) => {
      if (!b?.from || !b?.to) return acc;
      const key = `${b.from}_${b.to}`;
      if (!acc.find(item => item.key === key)) {
        acc.push({
          key,
          from: b.from,
          fromName: b.from,
          to: b.to,
          toName: b.to
        });
      }
      return acc;
    }, []).slice(0, 4)
    : [];

  const tripsToDisplay = Array.isArray(userBookings) ? userBookings.filter(b => b.status !== 'CANCELLED') : [];
  const lastTransaction = Array.isArray(userBookings) && userBookings.length > 0 ? userBookings[0] : null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#e8f0fe] via-[#f0f4ff] to-[#fef3e8] pb-16">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* HERO BANNER HEADER: Clean Light & Airy Layout (Blue color box removed) */}
        <div className="relative py-3 my-2">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-200/80 text-[#0026cd] font-extrabold text-xs shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Official IRCTC Next-Gen Railway Booking Portal</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Your journey, <span className="text-[#f06d06]">made simple</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold max-w-lg">
                100% Guaranteed seat availability, instant PNR verification, and official bank refunds.
              </p>
            </div>

            {/* Vande Bharat Express Ultra-HD Video Showcase Card */}
            <div className="relative shrink-0 rounded-2xl overflow-hidden border-2 border-slate-200/80 shadow-xl bg-slate-950 group max-w-sm sm:max-w-md w-full aspect-video">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

              {/* Live Streaming Indicator Header */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-black">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-emerald-300">LIVE SHOWCASE</span>
                </div>
                <span className="text-[9px] font-black text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/40 backdrop-blur-md">
                  ✨ 8K ULTRA HD HDR
                </span>
              </div>

              {/* Bottom Badges */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                <span className="flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-lg backdrop-blur-md border border-orange-400/30">
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
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-5 sm:p-7 relative z-10">

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
                    className="w-10 h-10 rounded-2xl bg-[#0026cd] hover:bg-blue-900 text-white flex items-center justify-center shadow-lg active:rotate-180 transition-all cursor-pointer border border-blue-400/30"
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
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase">
                      JOURNEY DATE
                    </label>
                    <div className="flex items-center gap-1 z-20">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setQuickDate(0); }}
                        className="text-[9px] font-black text-blue-700 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setQuickDate(1); }}
                        className="text-[9px] font-black text-blue-700 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
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
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase block">
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
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
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
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0026cd] to-[#1e40af] hover:from-blue-900 hover:to-indigo-900 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border border-blue-400/20"
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
                className="bg-slate-50 hover:bg-blue-50/50 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-blue-300 cursor-pointer transition-all flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0026cd] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
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
                className="bg-slate-50 hover:bg-blue-50/50 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-blue-300 cursor-pointer transition-all flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
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
                  className="bg-slate-50 hover:bg-emerald-50/50 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 cursor-pointer transition-all flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
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

        {/* LOGGED IN USER RECENT JOURNEYS & UPCOMING TRIPS DASHBOARD */}
        {currentUser && Array.isArray(userBookings) && userBookings.length > 0 && (
          <div className="bg-white/70 backdrop-blur-xs rounded-3xl border border-blue-100 p-6 shadow-sm space-y-6 relative z-10">

            {/* Your Recent Journeys */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#000066]">Your recent journeys</h3>
              {dynamicJourneys.length > 0 ? (
                <div className="flex flex-wrap items-center gap-3">
                  {dynamicJourneys.map((j, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRecentJourney(j.from, j.to)}
                      className="px-4 py-2 rounded-full bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-950 font-extrabold text-xs border border-slate-200 shadow-2xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{j.fromName || j.from} &gt; {j.toName || j.to}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-semibold text-slate-500 bg-white/50 p-3 rounded-2xl border border-slate-200/60">
                  No recent journeys yet. Book your train tickets to see your recent routes here.
                </p>
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
                  <button
                    onClick={() => alert("Redirecting to Google Play Store...")}
                    className="px-4 py-2.5 rounded-2xl bg-black text-white font-black text-xs shadow-lg flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
                  >
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <div className="text-left">
                      <span className="text-[8px] text-slate-400 uppercase font-bold block">GET IT ON</span>
                      <span className="text-xs font-black">Google Play</span>
                    </div>
                  </button>

                  <button
                    onClick={() => alert("Redirecting to Apple App Store...")}
                    className="px-4 py-2.5 rounded-2xl bg-black text-white font-black text-xs shadow-lg flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
                  >
                    <Smartphone className="w-5 h-5 text-blue-400" />
                    <div className="text-left">
                      <span className="text-[8px] text-slate-400 uppercase font-bold block">Download on the</span>
                      <span className="text-xs font-black">App Store</span>
                    </div>
                  </button>
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
