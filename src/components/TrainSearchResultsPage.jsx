import React, { useState, useEffect } from 'react';
import { STATIONS, TRAINS, getTrainsForRoute } from '../data/mockTrains';
import StationAutocomplete, { IRCTC_STATIONS } from './StationAutocomplete';
import TrainScheduleModal from './TrainScheduleModal';
import CustomCalendarModal from './CustomCalendarModal';
import { getEffectiveSeatStatus, isTrainDeparted } from '../services/seatInventoryService';
import { ArrowLeft, Filter, ArrowUpDown, ChevronLeft, ChevronRight, RotateCw, Info } from 'lucide-react';

export default function TrainSearchResultsPage({ fromStation: initialFrom, toStation: initialTo, selectedDate: initialDate, selectedQuota: initialQuota, selectedClass: initialClass, onModifySearch, onSelectTrainClass, onLiveTrack }) {
  // Working local state for modification bar
  const [fromStation, setFromStation] = useState(initialFrom);
  const [toStation, setToStation] = useState(initialTo);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedQuota, setSelectedQuota] = useState(initialQuota);
  const [concession, setConcession] = useState('NONE');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCalendarModal, setShowCalendarModal] = useState(false);

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
  }, [isTatkalWindow, selectedQuota]);

  const [activeDateTab, setActiveDateTab] = useState(initialDate);
  const [selectedScheduleTrain, setSelectedScheduleTrain] = useState(null);

  const fromObj = IRCTC_STATIONS.find(s => s.code === fromStation) || STATIONS.find(s => s.code === fromStation) || { name: fromStation, city: fromStation };
  const toObj = IRCTC_STATIONS.find(s => s.code === toStation) || STATIONS.find(s => s.code === toStation) || { name: toStation, city: toStation };

  // Fetch trains from comprehensive IRCTC database (direct or dynamically generated)
  const routeTrains = getTrainsForRoute(fromStation, toStation);

  // Default first train card expanded
  const [expandedTrainId, setExpandedTrainId] = useState(routeTrains[0]?.id || null);
  const [filterType, setFilterType] = useState('ALL');

  const filteredTrains = routeTrains.filter(train => {
    if (filterType === 'VB') return train.type === 'Vande Bharat';
    if (filterType === 'RAJ') return train.type === 'Rajdhani';
    if (filterType === 'SF') return train.type === 'Superfast' || train.type === 'Superfast Mail';
    return true;
  });

  const handleUpdateSearch = () => {
    setActiveDateTab(selectedDate);
  };

  // Date strip generator (7 days)
  const generateDateTabs = () => {
    const tabs = [];
    const baseDate = selectedDate ? new Date(selectedDate) : new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const label = `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
      const count = routeTrains.length;
      tabs.push({ iso, label, count });
    }
    return tabs;
  };

  const dateTabs = generateDateTabs();

  return (
    <div className="min-h-screen bg-[#eff4fe] text-slate-900 pb-12">

      {/* Horizontal White Search Modification Bar */}
      <div className="bg-white border-b border-slate-200 py-2.5 shadow-xs sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          
          <button
            onClick={onModifySearch}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-blue-950 font-extrabold text-xs border border-slate-300 shadow-2xs flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4 text-blue-950" />
            <span>Back</span>
          </button>

          {/* Working Inputs Pill */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-200 flex-1">
            
            {/* FROM */}
            <div className="min-w-[200px] flex-1 relative z-30">
              <StationAutocomplete
                label="From"
                selectedCode={fromStation}
                onSelectStation={setFromStation}
                iconType="circle"
              />
            </div>

            {/* TO */}
            <div className="min-w-[200px] flex-1 relative z-30">
              <StationAutocomplete
                label="To"
                selectedCode={toStation}
                onSelectStation={setToStation}
                iconType="pin"
              />
            </div>

            {/* DATE TRIGGER */}
            <div
              onClick={() => setShowCalendarModal(true)}
              className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold min-w-[130px] cursor-pointer hover:border-blue-600 transition-all flex items-center justify-between gap-2"
            >
              <div>
                <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Date</span>
                <span className="font-extrabold text-blue-950 text-xs block">
                  {selectedDate || 'Select Date'}
                </span>
              </div>
              <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-black">📅 Change</span>
            </div>

            {/* QUOTA */}
            <div className="bg-white px-2.5 py-1 rounded-xl border border-slate-200 text-xs font-bold min-w-[130px]">
              <span className="text-[9px] text-slate-400 font-bold uppercase flex items-center justify-between">
                Quota
                {isTatkalWindow && <span className="text-orange-600 font-black text-[8px] bg-orange-50 px-1 rounded border border-orange-200">⚡ Tatkal</span>}
              </span>
              <select
                value={selectedQuota}
                onChange={(e) => setSelectedQuota(e.target.value)}
                className="w-full bg-transparent font-extrabold text-orange-600 text-xs focus:outline-none cursor-pointer"
              >
                {isTatkalWindow ? (
                  <>
                    <option value="TQ">Tatkal (TQ)</option>
                    <option value="PT">Premium Tatkal</option>
                  </>
                ) : (
                  <>
                    <option value="GN">General (GN)</option>
                    <option value="SS">Senior Citizen (SS)</option>
                    {!isPost1130 && <option value="TQ">Tatkal (TQ)</option>}
                    {!isPost1130 && <option value="PT">Premium Tatkal</option>}
                    <option value="DP">Duty Pass (DP)</option>
                    <option value="LD">Ladies (LD)</option>
                    <option value="DV">Divyangjan</option>
                  </>
                )}
              </select>
            </div>

            {/* CONCESSION */}
            <div className="bg-white px-2.5 py-1 rounded-xl border border-slate-200 text-xs font-bold min-w-[150px] hidden xl:block">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Concession</span>
              <select
                value={concession}
                onChange={(e) => setConcession(e.target.value)}
                className="w-full bg-transparent font-bold text-slate-700 text-xs focus:outline-none cursor-pointer"
              >
                <option value="NONE">No Concession</option>
                <option value="PASS">Railway Pass Concession</option>
                <option value="SENIOR">Senior Citizen Concession</option>
              </select>
            </div>

            {/* UPDATE Button */}
            <button
              onClick={handleUpdateSearch}
              className="px-4 py-2 rounded-xl bg-[#283593] hover:bg-blue-900 text-white font-extrabold text-xs shadow-xs ml-auto transition-all active:scale-95"
            >
              Update
            </button>
          </div>

        </div>
      </div>

      {/* Horizontal Date Carousel Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-3">
        <div className="flex items-center justify-between gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs mb-3">
          
          <button className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600">
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 overflow-x-auto py-0.5 scrollbar-none flex-1 justify-between">
            {dateTabs.map((tab) => {
              const isSelected = activeDateTab === tab.iso;
              return (
                <button
                  key={tab.iso}
                  onClick={() => {
                    setActiveDateTab(tab.iso);
                    setSelectedDate(tab.iso);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs text-center transition-all flex-1 min-w-[100px] ${
                    isSelected
                      ? 'bg-[#e8eaf6] text-[#283593] font-black border border-[#c5cae9]'
                      : 'bg-white text-slate-700 font-bold hover:bg-slate-50 border border-slate-100'
                  }`}
                >
                  <span className="block text-[11px]">{tab.label}</span>
                  <span className="text-[9px] text-slate-500 font-semibold">{tab.count} Trains</span>
                </button>
              );
            })}
          </div>

          <button className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600">
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 border-l border-slate-200 pl-2">
            <button
              onClick={() => setFilterType(filterType === 'ALL' ? 'VB' : 'ALL')}
              className={`px-2.5 py-1 rounded-xl font-bold text-xs flex items-center gap-1 border transition-all ${
                filterType === 'VB'
                  ? 'bg-blue-950 text-white border-blue-950'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{filterType === 'VB' ? 'VB Only' : 'Filter'}</span>
            </button>
            <button className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 border border-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort</span>
            </button>
          </div>

        </div>

        {/* Notice Info Box */}
        <div className="p-2.5 rounded-xl bg-[#fff3e0] border border-[#ffe0b2] text-[11px] text-[#e65100] font-extrabold text-center mb-4 shadow-2xs">
          Check <span className="underline cursor-pointer font-black text-[#c62828]">NTES website</span> or <span className="underline cursor-pointer font-black text-[#c62828]">NTES app</span> for actual running time before boarding.
        </div>

        {/* Train Feed Cards */}
        <div className="space-y-4">
          {filteredTrains.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-4xl">🚫</div>
              <div>
                <h3 className="text-lg font-black text-slate-800">No Trains Found</h3>
                <p className="text-sm text-slate-500 mt-1">
                  No trains available from <span className="font-bold text-blue-700">{fromObj.name || fromStation}</span> to{' '}
                  <span className="font-bold text-blue-700">{toObj.name || toStation}</span>
                  {routeTrains.length > 0 && filterType !== 'ALL'
                    ? ` for the selected filter. Try removing the filter.`
                    : ` on this route in our database.`}
                </p>
                {routeTrains.length > 0 && filterType !== 'ALL' && (
                  <button
                    onClick={() => setFilterType('ALL')}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Show All {routeTrains.length} Trains
                  </button>
                )}
              </div>
            </div>
          ) : (
          <>
          {filteredTrains.map((train) => {
            const isExpanded = expandedTrainId === train.id || expandedTrainId === 'ALL_OPEN';
            return (
              <div key={train.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-5 space-y-4">
                
                {/* 1:1 Official IRCTC Train Card Main Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  
                  {/* Left Column: Train Number, Name, Schedule Link & Class Pills (Col 4) */}
                  <div className="lg:col-span-4 space-y-2 lg:pr-3 lg:border-r lg:border-slate-200">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-xs text-slate-500">{train.number}</span>
                      <button
                        onClick={() => setSelectedScheduleTrain(train)}
                        className="text-xs font-bold text-[#3f51b5] hover:underline cursor-pointer"
                      >
                        Train Schedule
                      </button>
                    </div>

                    <h3 className="text-base font-black text-slate-900 tracking-tight uppercase leading-snug">
                      {train.name}
                    </h3>

                    {/* Class Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {train.classes.map((cls) => (
                        <span
                          key={cls.code}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold border border-blue-300 text-blue-800 bg-blue-50/70"
                        >
                          {cls.code}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Center Column: Departure, Duration Timeline & Arrival (Col 5) */}
                  <div className="lg:col-span-5 flex items-center justify-between text-center px-2 lg:px-4 lg:border-r lg:border-slate-200">
                    
                    {/* Departure */}
                    <div className="text-left">
                      <span className="text-2xl font-black text-slate-900 font-mono leading-none block">{train.departureTime}</span>
                      <span className="text-xs font-bold text-slate-700 block mt-1">Wed, 22 Jul</span>
                      <span className="text-xs font-black text-slate-900 block mt-1.5 uppercase">{train.from}</span>
                      <span className="text-[11px] text-slate-500 font-medium block truncate max-w-[120px]">{train.fromName}</span>
                    </div>

                    {/* Timeline Bar with +1 Day Indicator */}
                    <div className="flex-1 px-4">
                      <span className="text-xs font-bold text-slate-500 block mb-1">{train.duration}</span>
                      <div className="relative flex items-center justify-center w-full">
                        <div className="w-full h-0.5 bg-[#3f51b5]"></div>
                        <div className="w-2 h-2 rounded-full bg-[#3f51b5] absolute left-0"></div>
                        <div className="w-2 h-2 rounded-full bg-[#3f51b5] absolute right-0"></div>
                      </div>
                      <span className="text-xs font-extrabold text-[#991b1b] block mt-1.5">+1 Day</span>
                    </div>

                    {/* Arrival */}
                    <div className="text-right">
                      <span className="text-2xl font-black text-slate-900 font-mono leading-none block">{train.arrivalTime}</span>
                      <span className="text-xs font-bold text-slate-700 block mt-1">Thu, 23 Jul</span>
                      <span className="text-xs font-black text-slate-900 block mt-1.5 uppercase">{train.to}</span>
                      <span className="text-[11px] text-slate-500 font-medium block truncate max-w-[120px]">{train.toName}</span>
                    </div>

                  </div>

                  {/* Right Column: Days Running & Check Availability Button (Col 3) */}
                  <div className="lg:col-span-3 flex flex-col items-center lg:items-end justify-center gap-3 lg:pl-2">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800 tracking-widest">
                      <span className="font-black text-slate-900">M</span>
                      <span className="font-black text-slate-900">T</span>
                      <span className="font-black text-slate-900">W</span>
                      <span className="font-black text-slate-900">T</span>
                      <span className="font-black text-slate-900">F</span>
                      <span className="font-black text-slate-900">S</span>
                      <span className="font-black text-slate-900">S</span>
                    </div>

                    <button
                      onClick={() => setExpandedTrainId(isExpanded ? null : train.id)}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#283593] hover:bg-blue-900 text-white font-black text-xs shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                    >
                      {isExpanded ? 'Hide Availability' : 'Check Availability'}
                    </button>
                  </div>

                </div>

                {/* COMPACT & DECREASED SIZE AVAILABLE CLASSES CONTAINER */}
                {isExpanded && (
                  <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs space-y-2">
                    
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-800">Available Classes</h4>
                      <span className="text-[10px] font-semibold text-slate-400">
                        Updated 6 Minutes and 41 Seconds ago
                      </span>
                    </div>

                    {/* Compact Cards Flex Row */}
                    <div className="relative flex items-center">
                      
                      <div className="flex flex-wrap items-center gap-2 w-full">
                        {train.classes.map((cls) => {
                          const departed = isTrainDeparted(train.departureTime, selectedDate);
                          const effectiveSeat = getEffectiveSeatStatus(train.number, cls.code, cls.status, selectedDate);
                          const isAvailable = effectiveSeat.isAvailable && !departed;
                          const isRac = effectiveSeat.isRac;
                          const isWL = effectiveSeat.isWL;

                          return (
                            <div
                              key={cls.code}
                              className={`p-2.5 rounded-xl border shadow-2xs transition-all flex flex-col justify-between space-y-1.5 min-w-[140px] max-w-[160px] flex-1 group ${
                                departed
                                  ? 'bg-rose-50/70 border-rose-200'
                                  : 'bg-white border-slate-200 hover:shadow-xs'
                              }`}
                            >
                              
                              {/* Class Title & Refresh Icon */}
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-slate-900 text-[11px] truncate">
                                  {cls.name}
                                </span>
                                <RotateCw className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform cursor-pointer" />
                              </div>

                              {/* Availability Status Text */}
                              <div>
                                <span className={`text-[11px] font-black font-mono block ${
                                  departed
                                    ? 'text-rose-700 font-extrabold'
                                    : isAvailable
                                    ? 'text-emerald-600'
                                    : isRac
                                    ? 'text-amber-600'
                                    : isWL
                                    ? 'text-orange-700'
                                    : 'text-rose-600'
                                }`}>
                                  {departed ? 'TRAIN DEPARTED' : effectiveSeat.statusText}
                                </span>
                              </div>

                              {/* Price & Book Button */}
                              <div className="flex items-end justify-between pt-1 border-t border-slate-100">
                                <div>
                                  <div className="flex items-center gap-0.5">
                                    <span className="font-mono font-black text-slate-900 text-xs">₹{cls.price}</span>
                                    <Info className="w-2.5 h-2.5 text-blue-500 cursor-pointer" />
                                  </div>
                                  <span className="text-[9px] text-slate-400 font-semibold block">Per adult</span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (departed) {
                                      alert(`🚫 Booking Closed: Train ${train.number} (${train.name}) has already departed from ${train.from} at ${train.departureTime} on ${selectedDate}.`);
                                      return;
                                    }
                                    onSelectTrainClass(train, cls, selectedDate);
                                  }}
                                  disabled={departed}
                                  className={`px-3 py-1 rounded-lg font-black text-[11px] shadow-xs transition-all ${
                                    departed
                                      ? 'bg-rose-100 text-rose-800 cursor-not-allowed border border-rose-300 opacity-90'
                                      : isRac
                                      ? 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer active:scale-95'
                                      : isWL
                                      ? 'bg-orange-500 hover:bg-orange-600 text-white cursor-pointer active:scale-95'
                                      : 'bg-[#283593] hover:bg-blue-900 text-white cursor-pointer active:scale-95'
                                  }`}
                                >
                                  {departed ? 'DEPARTED' : isRac ? 'BOOK RAC' : isWL ? 'WL BOOK' : 'BOOK'}
                                </button>
                              </div>

                            </div>
                          );
                        })}
                      </div>

                      {/* Right Arrow Navigation Pill */}
                      <button className="hidden lg:flex w-7 h-7 rounded-full bg-white border border-slate-300 shadow-xs items-center justify-center text-slate-600 hover:text-blue-950 absolute -right-2">
                        <ChevronRight className="w-4 h-4" />
                      </button>

                    </div>

                  </div>
                )}

              </div>
            );
          })}
          </>
          )}
        </div>

      </div>

      {/* 1:1 Official IRCTC Train Schedule Modal */}
      {selectedScheduleTrain && (
        <TrainScheduleModal
          train={selectedScheduleTrain}
          onClose={() => setSelectedScheduleTrain(null)}
        />
      )}

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
