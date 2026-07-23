import React, { useState } from 'react';
import { TRAINS } from '../data/mockTrains';
import { Train, Wifi, Utensils, ChevronRight, Filter, Zap, ArrowRight, Search, ShieldCheck } from 'lucide-react';

export default function TrainList({ fromStation, toStation, selectedDate, selectedQuota, selectedClass, onSelectTrainClass, onLiveTrack, hasSearched }) {
  const [filterType, setFilterType] = useState('ALL');
  const [sortBy, setSortBy] = useState('FASTEST');

  // Filter trains strictly matching search query when hasSearched is true
  const filteredTrains = TRAINS.filter(train => {
    // Match route if specified
    const matchesRoute = (train.from === fromStation && train.to === toStation) || 
                         (train.from === fromStation) || 
                         (train.to === toStation);
    if (filterType !== 'ALL' && train.type !== filterType) return false;
    return matchesRoute;
  }).sort((a, b) => {
    if (sortBy === 'FASTEST') {
      const getMin = d => parseInt(d.split('h')[0]) * 60 + parseInt(d.split('h')[1].replace('m', ''));
      return getMin(a.duration) - getMin(b.duration);
    }
    if (sortBy === 'PUNCTUALITY') {
      return parseFloat(b.punctuality) - parseFloat(a.punctuality);
    }
    return a.departureTime.localeCompare(b.departureTime);
  });

  // If search has not been submitted yet by the user, show clean prompt!
  if (!hasSearched) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 border border-orange-200 text-orange-600 flex items-center justify-center mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-blue-950">Ready to Book Your Journey</h3>
          <p className="text-sm text-slate-600 mt-2 max-w-md font-medium">
            Select your <strong>From Station</strong>, <strong>To Station</strong>, and <strong>Travel Date</strong> above, then click <span className="text-orange-600 font-bold">"Search Available Trains"</span> to view live seat availability.
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Direct IRCTC Enterprise CRS Booking Handshake</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Search Result Summary Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl mb-6 flex flex-wrap items-center justify-between gap-4 border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-blue-950">
            <span>{fromStation}</span>
            <ArrowRight className="w-4 h-4 text-orange-600" />
            <span>{toStation}</span>
            <span className="text-xs font-semibold text-slate-500">({selectedDate})</span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5 font-medium">
            Found {filteredTrains.length} trains matching your route • Quota: <span className="font-bold text-orange-600">{selectedQuota}</span>
          </p>
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800">
            <Filter className="w-3.5 h-3.5 text-blue-900" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Train Types</option>
              <option value="Vande Bharat">Vande Bharat</option>
              <option value="Rajdhani">Rajdhani Express</option>
              <option value="Superfast">Superfast</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800">
            <Zap className="w-3.5 h-3.5 text-orange-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="FASTEST">Fastest Duration</option>
              <option value="EARLIEST">Earliest Departure</option>
              <option value="PUNCTUALITY">Best Punctuality</option>
            </select>
          </div>
        </div>
      </div>

      {/* Train Cards List */}
      {filteredTrains.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-600">
          <p className="font-bold">No direct trains found for station pair ({fromStation} ➔ {toStation}).</p>
          <p className="text-xs text-slate-500 mt-1">Try searching NDLS to MMCT, ADI to MMCT, or NDLS to BSB.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTrains.map((train) => (
            <div 
              key={train.id}
              className="bg-white rounded-3xl p-6 transition-all duration-300 hover:shadow-xl border border-slate-200 relative overflow-hidden group"
            >
              
              {/* Top Info Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-900 font-mono font-black text-xs border border-blue-200">
                    #{train.number}
                  </div>
                  <h3 className="text-lg font-black text-blue-950 group-hover:text-orange-600 transition-colors">
                    {train.name}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                    {train.type}
                  </span>
                </div>

                {/* Badges & Live Tracker Trigger */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                    {train.pantry && (
                      <span className="flex items-center gap-1" title="E-Catering Pantry Available">
                        <Utensils className="w-3.5 h-3.5 text-orange-600" />
                        <span className="hidden sm:inline">Pantry</span>
                      </span>
                    )}
                    {train.wiFi && (
                      <span className="flex items-center gap-1" title="Free High-Speed Wi-Fi">
                        <Wifi className="w-3.5 h-3.5 text-blue-600" />
                        <span className="hidden sm:inline">Wi-Fi</span>
                      </span>
                    )}
                    <span className="text-emerald-700 font-extrabold">{train.punctuality} On-Time</span>
                  </div>

                  <button
                    onClick={() => onLiveTrack(train)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-orange-600 hover:text-white border border-slate-300 text-slate-800 font-bold text-xs transition-all flex items-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>Live GPS</span>
                  </button>
                </div>
              </div>

              {/* Time & Route Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center mb-6">
                
                {/* Departure */}
                <div className="md:col-span-3">
                  <div className="text-2xl font-black text-slate-900 font-mono">
                    {train.departureTime}
                  </div>
                  <div className="text-xs font-bold text-blue-950 mt-0.5">
                    {train.fromName} ({train.from})
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">Day 1 • Platform 16</div>
                </div>

                {/* Route Progress Bar */}
                <div className="md:col-span-6 flex flex-col items-center justify-center px-4">
                  <div className="text-xs font-bold text-orange-600 mb-1">
                    {train.duration} • {train.distance}
                  </div>
                  <div className="w-full flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-900 shadow-xs"></div>
                    <div className="flex-1 h-1 bg-slate-200 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 bg-white text-[10px] text-slate-700 font-bold rounded-full border border-slate-300">
                        {train.avgSpeed}
                      </div>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-orange-600 shadow-xs"></div>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 font-medium">
                    {train.intermediateStations.length} intermediate stops
                  </div>
                </div>

                {/* Arrival */}
                <div className="md:col-span-3 text-left md:text-right">
                  <div className="text-2xl font-black text-slate-900 font-mono">
                    {train.arrivalTime}
                  </div>
                  <div className="text-xs font-bold text-blue-950 mt-0.5">
                    {train.toName} ({train.to})
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">Day 1/2 • Platform 1</div>
                </div>

              </div>

              {/* Class Cards & Seat Status Row */}
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
                  Select Class to View Berth Layout & Book:
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {train.classes.map((cls) => {
                    const isAvailable = cls.statusType === 'available';
                    const isRac = cls.statusType === 'rac';
                    
                    return (
                      <div
                        key={cls.code}
                        onClick={() => onSelectTrainClass(train, cls)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group/card ${
                          isAvailable
                            ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300'
                            : isRac
                            ? 'bg-amber-50 hover:bg-amber-100 border-amber-300'
                            : 'bg-rose-50 hover:bg-rose-100 border-rose-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-blue-950">
                            {cls.code}
                          </span>
                          <span className="text-xs font-bold font-mono text-slate-900">
                            ₹{cls.price}
                          </span>
                        </div>

                        <div className="mt-2 text-center py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
                          <p className={`text-xs font-black tracking-wide ${
                            isAvailable ? 'text-emerald-700' : isRac ? 'text-amber-700' : 'text-rose-700'
                          }`}>
                            {cls.status}
                          </p>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-slate-600 group-hover/card:text-orange-600">
                          <span>Select Berth</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
