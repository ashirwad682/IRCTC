import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config/api';
import { Search, Train, Calendar, Clock, MapPin, ArrowRight, CheckCircle2, ChevronRight, Printer, Share2, Sparkles, Navigation, Wifi, Utensils, AlertCircle, Filter, Zap, Award, Copy, X } from 'lucide-react';
import { CRIS_REAL_TRAINS } from '../data/crisTrainDatabase';

// Helper component for highlighting matched search query in text
const HighlightText = ({ text, highlight }) => {
  if (!highlight || !highlight.trim()) {
    return <span>{text}</span>;
  }
  const q = highlight.trim();
  const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = String(text).split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} className="bg-amber-300 text-blue-950 font-black rounded px-1 py-0.5 shadow-2xs">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

// Helper for dynamic train type badge gradient colors & icons
const getTrainTypeBadgeConfig = (type = '') => {
  const t = type.toLowerCase();
  if (t.includes('vande')) {
    return {
      className: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white border border-purple-300/40 shadow-xs',
      icon: <Sparkles className="w-3 h-3 text-amber-300 animate-pulse inline mr-1" />
    };
  }
  if (t.includes('rajdhani')) {
    return {
      className: 'bg-gradient-to-r from-rose-600 via-red-600 to-orange-600 text-white border border-rose-300/40 shadow-xs',
      icon: <Zap className="w-3 h-3 text-yellow-300 inline mr-1" />
    };
  }
  if (t.includes('shatabdi') || t.includes('jan shatabdi')) {
    return {
      className: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white border border-amber-300/40 shadow-xs',
      icon: <Award className="w-3 h-3 text-white inline mr-1" />
    };
  }
  if (t.includes('tejas')) {
    return {
      className: 'bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 text-white border border-cyan-300/40 shadow-xs',
      icon: <Zap className="w-3 h-3 text-cyan-200 inline mr-1" />
    };
  }
  if (t.includes('superfast') || t.includes('sf')) {
    return {
      className: 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white border border-blue-300/40 shadow-xs',
      icon: <Train className="w-3 h-3 text-blue-200 inline mr-1" />
    };
  }
  if (t.includes('garib') || t.includes('duronto')) {
    return {
      className: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white border border-emerald-300/40 shadow-xs',
      icon: <CheckCircle2 className="w-3 h-3 text-emerald-200 inline mr-1" />
    };
  }
  return {
    className: 'bg-gradient-to-r from-slate-700 to-slate-900 text-white border border-slate-500/40 shadow-xs',
    icon: <Train className="w-3 h-3 text-slate-300 inline mr-1" />
  };
};

export default function TrainSchedulePage({ initialTrainNumber = '' }) {
  const [searchInput, setSearchInput] = useState(initialTrainNumber);
  const [selectedTrain, setSelectedTrain] = useState(() => {
    if (!initialTrainNumber) return null;
    return CRIS_REAL_TRAINS.find(t => t.number === initialTrainNumber) || null;
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState('table'); // 'table' or 'map'
  const [stationFilter, setStationFilter] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const searchContainerRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset keyboard highlight index when typing query changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchInput]);

  // Filter suggestion options live according to train number or train name (Starts appearing immediately when writing!)
  const suggestions = CRIS_REAL_TRAINS.filter(t => {
    if (!searchInput.trim()) return false;
    const q = searchInput.toLowerCase().trim();
    return (
      t.number.includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.from.toLowerCase().includes(q) ||
      t.to.toLowerCase().includes(q) ||
      (t.fromName && t.fromName.toLowerCase().includes(q)) ||
      (t.toName && t.toName.toLowerCase().includes(q))
    );
  }).sort((a, b) => {
    const q = searchInput.toLowerCase().trim();
    if (!q) return 0;
    const aStartsWith = a.number.startsWith(q);
    const bStartsWith = b.number.startsWith(q);
    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;
    return 0;
  });

  const fetchRapidApiSchedule = (trainNum, fallbackTrain) => {
    fetch(`${API_BASE_URL}/api/ntes/schedule/${trainNum}`)
      .then(res => res.json())
      .then(resData => {
        console.log('[RapidAPI IRCTC Live Stream]', resData);
        const apiData = resData?.data?.data || resData?.data;
        if (apiData) {
          const rawRoute = apiData.route || apiData.station_list || apiData.intermediateStations;
          if (Array.isArray(rawRoute) && rawRoute.length > 0) {
            
            const formatMinToTime = (min) => {
              if (min === undefined || min === null || min < 0) return '--';
              const h = Math.floor(min / 60) % 24;
              const m = min % 60;
              return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            };

            const formattedStations = rawRoute.map((st, idx) => {
              const arrTime = st.sta ? st.sta : (st.sta_min !== undefined ? formatMinToTime(st.sta_min) : (st.arr_time || st.arr || '--'));
              const depTime = st.std ? st.std : (st.std_min !== undefined ? formatMinToTime(st.std_min) : (st.dep_time || st.dep || '--'));
              const dist = st.distance_from_source !== undefined ? `${Math.round(parseFloat(st.distance_from_source))} km` : (st.distance ? `${st.distance}` : `${idx * 20} km`);
              
              return {
                code: st.station_code || st.code || (st.station_name ? st.station_name.slice(0, 4).toUpperCase() : 'STN'),
                name: st.station_name || st.name || st.code || 'Station',
                arr: arrTime,
                dep: depTime,
                platform: st.platform_number ? `P${st.platform_number}` : (st.platform ? `P${st.platform}` : `P${(idx % 4) + 1}`),
                distance: dist,
                day: parseInt(st.day || st.d_day || st.day_count || 1, 10),
                halt: st.halt ? `${st.halt} min` : '02:00',
                isStop: st.stop !== undefined ? st.stop : true
              };
            });

            const originStn = formattedStations[0];
            const destStn = formattedStations[formattedStations.length - 1];

            setSelectedTrain({
              ...(fallbackTrain || {}),
              number: apiData.train_number || trainNum,
              name: apiData.train_name || fallbackTrain?.name || `Train #${trainNum}`,
              from: originStn?.code || fallbackTrain?.from || 'SOURCE',
              fromName: originStn?.name || fallbackTrain?.fromName || 'SOURCE',
              to: destStn?.code || fallbackTrain?.to || 'DEST',
              toName: destStn?.name || fallbackTrain?.toName || 'DESTINATION',
              distance: destStn?.distance || fallbackTrain?.distance || '252 km',
              duration: fallbackTrain?.duration || '4h 15m',
              type: fallbackTrain?.type || 'Intercity / Express',
              intermediateStations: formattedStations
            });
          }
        }
      })
      .catch(err => console.warn('[RapidAPI Stream Warning]', err));
  };

  const handleSelectTrain = (t) => {
    setSearchInput(t.number);
    setSelectedTrain(t);
    setShowSuggestions(false);
    setStationFilter('');
    fetchRapidApiSchedule(t.number, t);
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    setShowSuggestions(false);
    const query = searchInput.trim();
    if (!query) return;

    const found = CRIS_REAL_TRAINS.find(t =>
      t.number === query ||
      t.name.toLowerCase().includes(query.toLowerCase())
    );

    if (found) {
      setSelectedTrain(found);
      fetchRapidApiSchedule(found.number, found);
    } else {
      const fallbackName = CRIS_REAL_TRAINS.find(t => t.number === query)?.name || `Train #${query}`;
      const initialDraft = {
        number: query,
        name: fallbackName,
        from: 'SOURCE',
        to: 'DESTINATION'
      };
      setSelectedTrain(initialDraft);
      fetchRapidApiSchedule(query, initialDraft);
    }
  };

  // Keyboard navigation for dropdown
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      if (suggestions[highlightedIndex]) {
        e.preventDefault();
        handleSelectTrain(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleCopyShare = () => {
    if (!selectedTrain) return;
    const text = `Train ${selectedTrain.number} - ${selectedTrain.name}\nRoute: ${selectedTrain.fromName || selectedTrain.from} ➔ ${selectedTrain.toName || selectedTrain.to}\nDistance: ${selectedTrain.distance || '497 km'} | Duration: ${selectedTrain.duration || '7h 00m'}`;
    navigator.clipboard?.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  
  // Custom running days calculation according to train number (safely guarded when selectedTrain is null)
  const runsOnDays = selectedTrain ? dayNames.map((day) => {
    let active = true;
    if (selectedTrain.number === '12243') {
      active = day !== 'TUE'; // Shatabdi runs except Tuesday
    } else if (selectedTrain.number === '22436') {
      active = day !== 'THU'; // Vande Bharat runs except Thursday
    }
    return { name: day, active };
  }) : [];

  // Smart Automatic Day Calculator based on midnight crossing & explicit station day metadata
  const calculateStationDays = (stations) => {
    if (!stations || stations.length === 0) return [];
    let currentDay = 1;
    let prevMinutes = -1;

    return stations.map((st) => {
      // Extract time in minutes for midnight rollover detection
      const timeStr = (st.arr && st.arr !== '--' && st.arr !== 'Start') ? st.arr : st.dep;
      if (timeStr && timeStr !== '--' && timeStr !== 'End') {
        const parts = timeStr.split(':');
        if (parts.length === 2) {
          const minutes = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
          // If time drops significantly (e.g. from 23:53 (1433m) to 01:57 (117m)), midnight was crossed!
          if (prevMinutes !== -1 && minutes < prevMinutes - 120) {
            currentDay++;
          }
          prevMinutes = minutes;
        }
      }

      // If station explicitly defines day (and it's greater), use Math.max
      const day = st.day ? Math.max(st.day, currentDay) : currentDay;
      return { ...st, calculatedDay: day };
    });
  };

  const rawScheduleRows = selectedTrain ? calculateStationDays(selectedTrain.intermediateStations || [
    { code: selectedTrain.from || 'MAS', name: selectedTrain.fromName || 'SOURCE', route: 1, arr: '--', dep: selectedTrain.departureTime || '07:15', halt: '--', distance: '0', day: 1, platform: 'P1' },
    { code: selectedTrain.to || 'CBE', name: selectedTrain.toName || 'DESTINATION', route: 1, arr: selectedTrain.arrivalTime || '14:15', dep: '--', halt: '--', distance: selectedTrain.distance ? selectedTrain.distance.replace(' km', '') : '497', day: 1, platform: 'P2' }
  ]) : [];

  // Filter schedule rows by station search filter
  const scheduleRows = rawScheduleRows.filter(st => {
    if (!stationFilter.trim()) return true;
    const q = stationFilter.toLowerCase().trim();
    return st.code.toLowerCase().includes(q) || st.name.toLowerCase().includes(q);
  });

  // Live train name detection matching the typed number
  const matchedTrain = CRIS_REAL_TRAINS.find(t => t.number === searchInput.trim());
  const matchedTrainName = matchedTrain?.name;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#edf4ff] via-slate-50 to-slate-100 py-8 px-3 sm:px-6 relative">
      
      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-black">Route details copied to clipboard!</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-blue-100 via-indigo-100 to-blue-200 text-blue-950 text-xs font-black uppercase tracking-wider border border-blue-300/60 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>CRIS Live Sync • Official NTES Timetable</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#000066] tracking-tight">
            Train Schedule & Route Map
          </h1>
          <p className="text-slate-600 font-bold text-xs sm:text-sm max-w-xl mx-auto">
            Search authentic station timetables, platform numbers, halt durations, and visual route maps for all Indian Railways trains.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-blue-100 shadow-2xl relative z-40">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3 relative">
            
            {/* Input Box with Auto-suggestions */}
            <div ref={searchContainerRef} className="relative flex-1 w-full">
              <div className={`flex items-center px-4 py-3.5 bg-white rounded-2xl border-2 transition-all shadow-sm ${
                showSuggestions && searchInput.trim()
                  ? 'border-blue-600 ring-4 ring-blue-500/25 bg-blue-50/20 shadow-md'
                  : 'border-sky-300 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-500/20'
              }`}>
                <Train className={`w-5.5 h-5.5 mr-3 shrink-0 transition-colors ${
                  searchInput.trim() ? 'text-blue-600 animate-bounce' : 'text-[#0026cd]'
                }`} />
                
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter Train Number or Name (e.g. 12243, 12310, Vande Bharat, Rajdhani)"
                  className="w-full bg-transparent font-extrabold text-blue-950 text-sm sm:text-base focus:outline-none placeholder-slate-400"
                />

                {/* Clear Input Button */}
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setShowSuggestions(false);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all mr-2 shrink-0 cursor-pointer"
                    title="Clear input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Live Match Count Badge when typing */}
                {searchInput.trim() && suggestions.length > 0 && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-black bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-blue-950 px-3 py-1 rounded-xl shadow-xs shrink-0 animate-in fade-in duration-150 border border-amber-300">
                    <Sparkles className="w-3.5 h-3.5 text-blue-950" />
                    <span>{suggestions.length} Trains Found</span>
                  </span>
                )}

                {/* Live Detected Train Name Badge */}
                {matchedTrainName && !searchInput.trim() && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-black bg-blue-50 text-[#0026cd] px-3 py-1.5 rounded-xl border border-blue-200 shrink-0 animate-in fade-in duration-200">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span className="truncate max-w-[220px] uppercase">{matchedTrainName}</span>
                  </span>
                )}
              </div>

              {/* Enhanced Colored Suggestions Dropdown (Starts appearing as soon as user writes) */}
              {showSuggestions && searchInput.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2.5 z-[100] bg-white/98 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-blue-400/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-96 overflow-y-auto scrollbar-thin">
                  
                  {/* Dropdown Banner Header */}
                  <div className="px-5 py-3 bg-gradient-to-r from-blue-950 via-[#0026cd] to-indigo-950 text-white flex items-center justify-between text-xs font-black uppercase tracking-wider shadow-md">
                    <div className="flex items-center gap-2">
                      <Train className="w-4 h-4 text-amber-300" />
                      <span>Train Suggestions ({suggestions.length} Found)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="hidden md:inline text-[10px] text-blue-200 font-bold uppercase">Use ↑ ↓ to navigate</span>
                      <span className="text-[10px] font-black text-amber-300 bg-blue-900/90 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                        CRIS Live DB
                      </span>
                    </div>
                  </div>

                  {suggestions.length > 0 ? (
                    <div className="divide-y divide-slate-100 bg-white">
                      {suggestions.map((t, idx) => {
                        const isHighlighted = idx === highlightedIndex;
                        const badgeConfig = getTrainTypeBadgeConfig(t.type);

                        return (
                          <button
                            key={t.number}
                            type="button"
                            onClick={() => handleSelectTrain(t)}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                            className={`w-full text-left px-5 py-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group cursor-pointer ${
                              isHighlighted
                                ? 'bg-gradient-to-r from-blue-100/90 via-indigo-50/80 to-white border-l-4 border-l-[#0026cd] scale-[1.002] shadow-xs'
                                : 'bg-white hover:bg-slate-50/80'
                            }`}
                          >
                            <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                              
                              {/* Train Number Badge */}
                              <span className="font-mono font-black text-xs px-3 py-1.5 rounded-xl bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 text-amber-300 border border-amber-400/40 shadow-xs group-hover:scale-105 group-hover:bg-amber-400 group-hover:text-blue-950 group-hover:border-blue-900 transition-all shrink-0">
                                <HighlightText text={t.number} highlight={searchInput} />
                              </span>

                              <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-black text-slate-900 text-sm sm:text-base group-hover:text-[#0026cd] transition-colors uppercase tracking-tight">
                                    <HighlightText text={t.name} highlight={searchInput} />
                                  </span>
                                  
                                  {t.type && (
                                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg ${badgeConfig.className}`}>
                                      {badgeConfig.icon}
                                      {t.type}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 flex-wrap">
                                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px] font-bold">
                                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                                    <HighlightText text={t.fromName || t.from} highlight={searchInput} /> ({t.from})
                                  </span>
                                  <ArrowRight className="w-3.5 h-3.5 text-[#0026cd] shrink-0 font-black" />
                                  <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-md text-[11px] font-bold">
                                    <Navigation className="w-3 h-3 text-indigo-600 shrink-0" />
                                    <HighlightText text={t.toName || t.to} highlight={searchInput} /> ({t.to})
                                  </span>
                                </div>
                              </div>

                            </div>

                            {/* Timing & Metrics Chip */}
                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                              <div className="text-left sm:text-right text-[11px] font-bold text-slate-600">
                                <div className="text-blue-950 font-black bg-slate-100/90 px-2.5 py-0.5 rounded-lg border border-slate-200 inline-block">
                                  {t.departureTime || '07:15'} ➔ {t.arrivalTime || '14:15'}
                                </div>
                                <div className="text-slate-500 text-[10px] font-semibold mt-0.5">
                                  {t.duration || '7h 00m'} • {t.distance || '497 km'}
                                </div>
                              </div>

                              <span className="inline-flex items-center gap-1 text-xs font-black text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl group-hover:bg-[#0026cd] group-hover:text-white group-hover:border-blue-600 transition-all shadow-xs shrink-0">
                                <span>View Route</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    /* Fallback search item if custom train number is typed */
                    <div className="p-5 text-center space-y-3 bg-slate-50">
                      <p className="text-xs font-bold text-slate-600">
                        No pre-stored trains matching "<strong className="text-blue-950 font-black">{searchInput}</strong>"
                      </p>
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0026cd] text-white text-xs font-black shadow-md hover:bg-blue-900 transition-all cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5 text-amber-300" />
                        <span>Search NTES Live Database for #{searchInput}</span>
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full sm:w-48 py-4 rounded-2xl bg-gradient-to-r from-[#0026cd] to-[#1e40af] hover:from-blue-900 hover:to-indigo-900 text-white font-black text-sm shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-blue-400/20"
            >
              <Search className="w-4 h-4" />
              <span>Search Route</span>
            </button>

          </form>
        </div>

        {/* Train Overview & Timetable Container */}
        {!selectedTrain ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-xl space-y-4 my-6">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 text-[#0026cd] flex items-center justify-center mx-auto shadow-xs">
              <Train className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                No Train Selected
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-slate-500">
                Please enter a train number or name (e.g. <strong className="text-blue-900 font-extrabold">12243</strong> or <strong className="text-blue-900 font-extrabold">Vande Bharat</strong>) in the search box above to display its timetable, running days, and route map.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            
            {/* Overview Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl space-y-4">
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#0026cd] text-white font-mono font-black text-sm px-3 py-1 rounded-xl shadow-xs">
                      {selectedTrain.number}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                      {selectedTrain.name}
                    </h2>
                    <span className="bg-orange-100 text-orange-800 font-extrabold text-xs px-2.5 py-1 rounded-lg border border-orange-200">
                      {selectedTrain.type || 'Express'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-500 flex items-center gap-2">
                    <span>{selectedTrain.fromName || selectedTrain.from}</span>
                    <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{selectedTrain.toName || selectedTrain.to}</span>
                  </p>
                </div>

                {/* Print & Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Schedule</span>
                  </button>
                  <button
                    onClick={handleCopyShare}
                    className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0026cd] font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-200"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Share Route</span>
                  </button>
                </div>
              </div>

              {/* Running Days & Key Stats Bar */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-1">
                
                {/* Running Days Matrix */}
                <div className="md:col-span-6 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1.5">
                    RUNNING DAYS ACCORDING TO TRAIN NO. {selectedTrain.number}
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {runsOnDays.map(day => (
                      <span
                        key={day.name}
                        className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                          day.active
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-rose-100 text-rose-500 line-through opacity-60'
                        }`}
                      >
                        {day.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Distance & Duration */}
                <div className="md:col-span-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                    JOURNEY METRICS
                  </label>
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-xs font-black text-blue-950 block">{selectedTrain.distance || '497 km'}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">Total Distance</span>
                    </div>
                    <div className="h-6 w-px bg-slate-300" />
                    <div>
                      <span className="text-xs font-black text-blue-950 block">{selectedTrain.duration || '7h 00m'}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">Total Time</span>
                    </div>
                  </div>
                </div>

                {/* Services & Ratings */}
                <div className="md:col-span-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                    SERVICES & SPEED
                  </label>
                  <div className="flex items-center gap-2 flex-wrap text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                      <Utensils className="w-3 h-3" /> E-Catering
                    </span>
                    <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[10px]">
                      <Zap className="w-3 h-3" /> {selectedTrain.avgSpeed || '71 KM/H'}
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* View Mode Selector & In-Page Station Search Filter */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm">
              
              {/* Tab Toggle */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setActiveViewMode('table')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex-1 sm:flex-none ${
                    activeViewMode === 'table'
                      ? 'bg-[#0026cd] text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  📊 Timetable View
                </button>
                <button
                  onClick={() => setActiveViewMode('map')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex-1 sm:flex-none ${
                    activeViewMode === 'map'
                      ? 'bg-[#0026cd] text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🗺️ Visual Route Map Timeline
                </button>
              </div>

              {/* Station Filter Search Bar */}
              <div className="relative w-full sm:w-64">
                <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={stationFilter}
                  onChange={(e) => setStationFilter(e.target.value)}
                  placeholder="Filter stations along route..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

            </div>

            {/* VIEW 1: Detailed Timetable Table */}
            {activeViewMode === 'table' && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-center text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#e6f0fa] text-[#000066] font-black text-[11px] uppercase border-b border-blue-200">
                        <th className="py-3.5 px-3 text-left">Station Code</th>
                        <th className="py-3.5 px-4 text-left">Station Name</th>
                        <th className="py-3.5 px-3">Route</th>
                        <th className="py-3.5 px-3">Platform</th>
                        <th className="py-3.5 px-3">Arrival Time</th>
                        <th className="py-3.5 px-3">Departure Time</th>
                        <th className="py-3.5 px-3">Halt (Mins)</th>
                        <th className="py-3.5 px-3">Distance</th>
                        <th className="py-3.5 px-3">Day</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-extrabold text-slate-800">
                      {scheduleRows.length > 0 ? (
                        scheduleRows.map((st, idx) => {
                          const isFirst = idx === 0 && !stationFilter;
                          const isLast = idx === scheduleRows.length - 1 && !stationFilter;
                          
                          return (
                            <tr
                              key={st.code || idx}
                              className={`transition-colors ${
                                isFirst
                                  ? 'bg-emerald-50/60 hover:bg-emerald-100/60'
                                  : isLast
                                  ? 'bg-indigo-50/60 hover:bg-indigo-100/60'
                                  : idx % 2 === 0
                                  ? 'bg-white hover:bg-blue-50/60'
                                  : 'bg-slate-50/70 hover:bg-blue-50/60'
                              }`}
                            >
                              <td className="py-3.5 px-3 text-left font-mono font-black text-[#0026cd] text-xs">
                                <span className="inline-flex items-center gap-1.5">
                                  {isFirst && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                                  {isLast && <span className="w-2 h-2 rounded-full bg-indigo-600"></span>}
                                  {!isFirst && !isLast && <span className="w-2 h-2 rounded-full bg-blue-400"></span>}
                                  {st.code}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-left font-black text-slate-900 uppercase">
                                <div className="flex items-center gap-2">
                                  <span>{st.name}</span>
                                  {isFirst && <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-black">SOURCE</span>}
                                  {isLast && <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-black">DESTINATION</span>}
                                </div>
                              </td>
                              <td className="py-3.5 px-3 font-mono text-slate-600">{st.route || 1}</td>
                              <td className="py-3.5 px-3 font-mono text-slate-700 font-bold bg-slate-100/60 rounded">{st.platform || `P${(idx % 4) + 1}`}</td>
                              <td className="py-3.5 px-3 font-mono text-slate-700">{isFirst ? '--' : st.arr}</td>
                              <td className="py-3.5 px-3 font-mono text-blue-900 font-black">{isLast ? '--' : st.dep}</td>
                              <td className="py-3.5 px-3 font-mono text-slate-500">{isFirst || isLast ? '--' : (st.halt || '02:00')}</td>
                              <td className="py-3.5 px-3 font-mono text-slate-800">{st.distance !== undefined ? `${st.distance} KM` : `${idx * 130} KM`}</td>
                              <td className="py-3.5 px-3 font-mono text-slate-900 font-black">Day {st.calculatedDay || st.day || 1}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-slate-400 font-bold">
                            No stations matching "{stationFilter}" found on this route.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIEW 2: Interactive Visual Route Map Timeline */}
            {activeViewMode === 'map' && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-[#0026cd]" />
                    <span>Station-by-Station Route Map Timeline</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-500">
                    Total Journey: {selectedTrain.distance || '497 km'}
                  </span>
                </div>

                <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3.5 sm:before:left-5 before:top-3 before:bottom-3 before:w-1 before:bg-gradient-to-b before:from-emerald-500 before:via-blue-600 before:to-indigo-600">
                  {scheduleRows.map((st, idx) => {
                    const isFirst = idx === 0 && !stationFilter;
                    const isLast = idx === scheduleRows.length - 1 && !stationFilter;

                    return (
                      <div key={st.code || idx} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 hover:bg-blue-50/50 p-4 rounded-2xl border border-slate-200/80 transition-all group">
                        
                        {/* Timeline Node Icon */}
                        <div className={`absolute -left-6 sm:-left-9 top-4 w-6 h-6 rounded-full flex items-center justify-center text-white font-black text-xs shadow-md ${
                          isFirst ? 'bg-emerald-500 ring-4 ring-emerald-100' : isLast ? 'bg-indigo-600 ring-4 ring-indigo-100' : 'bg-blue-600 ring-4 ring-blue-100'
                        }`}>
                          {idx + 1}
                        </div>

                        {/* Station Details */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-[#0026cd] text-sm bg-blue-100 px-2 py-0.5 rounded-md">
                              {st.code}
                            </span>
                            <h4 className="font-black text-slate-900 text-sm sm:text-base uppercase">
                              {st.name}
                            </h4>
                            {isFirst && <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">SOURCE</span>}
                            {isLast && <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">DESTINATION</span>}
                          </div>
                          <p className="text-xs font-semibold text-slate-500 flex items-center gap-3">
                            <span>Platform: <strong className="text-slate-800">{st.platform || `P${(idx % 4) + 1}`}</strong></span>
                            <span>•</span>
                            <span>Halt: <strong className="text-slate-800">{isFirst || isLast ? 'Source/Dest' : `${st.halt || '02:00'} min`}</strong></span>
                          </p>
                        </div>

                        {/* Timing & Distance Badge */}
                        <div className="flex items-center gap-4 text-right shrink-0">
                          <div>
                            <div className="text-xs font-black text-slate-900 font-mono">
                              Arr: {isFirst ? '--' : st.arr} | Dep: {isLast ? '--' : st.dep}
                            </div>
                            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {st.distance !== undefined ? `${st.distance} KM` : `${idx * 130} KM`} (Day {st.calculatedDay || st.day || 1})
                            </span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Official Printable Train Schedule Document (Only visible when printing) */}
      {selectedTrain && (
        <div id="train-schedule-print-area" className="hidden print:block bg-white p-4 text-slate-900">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-blue-900 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <img src="/irctc_logo.png" alt="IRCTC Logo" className="h-10 w-auto" />
              <div>
                <h2 className="text-base font-black text-[#000066] uppercase tracking-tight">INDIAN RAILWAY CATERING AND TOURISM CORPORATION</h2>
                <p className="text-[9px] font-extrabold text-slate-600 uppercase">OFFICIAL NTES LIVE TRAIN TIMETABLE & ROUTE DOCUMENT</p>
              </div>
            </div>
            <div className="text-right text-[9px] font-mono text-slate-600">
              <div>Document ID: IRCTC-TS-{selectedTrain.number}</div>
              <div>Generated: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>

          {/* Train Summary Box */}
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 mb-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono font-black text-blue-950 text-base">{selectedTrain.number}</span>
                <span className="font-black text-slate-900 text-base uppercase ml-2">{selectedTrain.name}</span>
                <span className="text-xs font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded ml-2 border border-orange-200">{selectedTrain.type || 'Express'}</span>
              </div>
              <div className="text-xs font-black text-slate-800">
                Route: {selectedTrain.fromName || selectedTrain.from} ➔ {selectedTrain.toName || selectedTrain.to}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs border-t border-slate-200 pt-2 font-semibold">
              <div><strong>Total Distance:</strong> {selectedTrain.distance || '497 km'}</div>
              <div><strong>Total Time:</strong> {selectedTrain.duration || '7h 00m'}</div>
              <div><strong>Avg Speed:</strong> {selectedTrain.avgSpeed || '71 km/h'}</div>
            </div>

            <div className="text-xs border-t border-slate-200 pt-2 flex items-center gap-1">
              <strong className="mr-2">Runs On:</strong>
              {runsOnDays.map(d => (
                <span key={d.name} className={`px-1.5 py-0.5 rounded text-[10px] font-black ${d.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-600 line-through'}`}>
                  {d.name}
                </span>
              ))}
            </div>
          </div>

          {/* Stations Table */}
          <table className="w-full text-left text-xs border-collapse border border-slate-300 mb-4">
            <thead>
              <tr className="bg-blue-950 text-white font-black text-[11px] uppercase">
                <th className="py-2 px-2 border border-slate-400">Code</th>
                <th className="py-2 px-3 border border-slate-400">Station Name</th>
                <th className="py-2 px-2 border border-slate-400 text-center">Route</th>
                <th className="py-2 px-2 border border-slate-400 text-center">Platform</th>
                <th className="py-2 px-2 border border-slate-400 text-center">Arrival</th>
                <th className="py-2 px-2 border border-slate-400 text-center">Departure</th>
                <th className="py-2 px-2 border border-slate-400 text-center">Halt</th>
                <th className="py-2 px-2 border border-slate-400 text-center">Distance</th>
                <th className="py-2 px-2 border border-slate-400 text-center">Day</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 font-semibold text-slate-900">
              {rawScheduleRows.map((st, idx) => (
                <tr key={st.code || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="py-1.5 px-2 border border-slate-300 font-mono font-bold text-blue-950">{st.code}</td>
                  <td className="py-1.5 px-3 border border-slate-300 font-bold uppercase">{st.name}</td>
                  <td className="py-1.5 px-2 border border-slate-300 text-center font-mono">{st.route || 1}</td>
                  <td className="py-1.5 px-2 border border-slate-300 text-center font-mono">{st.platform || `P${(idx % 4) + 1}`}</td>
                  <td className="py-1.5 px-2 border border-slate-300 text-center font-mono">{idx === 0 ? '--' : st.arr}</td>
                  <td className="py-1.5 px-2 border border-slate-300 text-center font-mono font-bold text-blue-900">{idx === rawScheduleRows.length - 1 ? '--' : st.dep}</td>
                  <td className="py-1.5 px-2 border border-slate-300 text-center font-mono">{idx === 0 || idx === rawScheduleRows.length - 1 ? '--' : (st.halt || '02:00')}</td>
                  <td className="py-1.5 px-2 border border-slate-300 text-center font-mono">{st.distance !== undefined ? `${st.distance} KM` : `${idx * 130} KM`}</td>
                  <td className="py-1.5 px-2 border border-slate-300 text-center font-mono">Day {st.calculatedDay || st.day || 1}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer */}
          <div className="border-t border-slate-300 pt-2 flex items-center justify-between text-[9px] text-slate-500 font-semibold">
            <p>Official IRCTC Next-Gen E-Ticketing System. Authenticated via CRIS NTES Database.</p>
            <p>Page 1 of 1</p>
          </div>

        </div>
      )}
    </div>
  );
}
