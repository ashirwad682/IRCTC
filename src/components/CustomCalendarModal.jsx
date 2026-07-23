import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Sparkles, Lock, Clock } from 'lucide-react';

export default function CustomCalendarModal({ selectedDate, onSelectDate, onClose }) {
  // Local ISO date formatter helper
  const toLocalIso = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = toLocalIso(today);

  // Exactly 65 Days IRCTC Advance Reservation Period (ARP) limit
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 65);
  const maxDateIso = toLocalIso(maxDate);

  const formatDisplayDate = (d) => {
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Current view month & year state
  const initialYearMonth = selectedDate
    ? new Date(selectedDate + 'T00:00:00')
    : new Date();

  const [viewYear, setViewYear] = useState(initialYearMonth.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialYearMonth.getMonth());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const currentActualYear = today.getFullYear();
  const currentActualMonth = today.getMonth();
  const isMinMonth = viewYear < currentActualYear || (viewYear === currentActualYear && viewMonth <= currentActualMonth);

  const maxActualYear = maxDate.getFullYear();
  const maxActualMonth = maxDate.getMonth();
  const isMaxMonth = viewYear > maxActualYear || (viewYear === maxActualYear && viewMonth >= maxActualMonth);

  // Navigate Months
  const handlePrevMonth = () => {
    if (isMinMonth) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (isMaxMonth) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Calendar Grid Calculation
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const handleDateClick = (dayNum) => {
    const monthStr = String(viewMonth + 1).padStart(2, '0');
    const dayStr = String(dayNum).padStart(2, '0');
    const isoStr = `${viewYear}-${monthStr}-${dayStr}`;

    if (isoStr < todayIso || isoStr > maxDateIso) return; // Restrict past & beyond 65-day dates
    onSelectDate(isoStr);
    if (onClose) onClose();
  };

  const handleQuickSelect = (offsetDays) => {
    const target = new Date(today);
    target.setDate(target.getDate() + offsetDays);
    const isoStr = toLocalIso(target);
    if (isoStr >= todayIso && isoStr <= maxDateIso) {
      onSelectDate(isoStr);
      if (onClose) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0026cd] to-[#1e40af] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base uppercase tracking-wide flex items-center gap-1.5">
                Select Journey Date
              </h3>
              <p className="text-xs font-medium text-blue-100 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
                IRCTC 65-Day Booking Window
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 65-Day ARP Banner Indicator */}
        <div className="bg-blue-50/80 px-5 py-2.5 border-b border-blue-100 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-[11px]">
            <Clock className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span>Open: </span>
              <span className="font-extrabold text-blue-950">{formatDisplayDate(today)}</span>
              <span className="mx-1 text-blue-400">➔</span>
              <span className="font-extrabold text-blue-950">{formatDisplayDate(maxDate)}</span>
              <span className="ml-1 text-[10px] font-black text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-md">65 Days</span>
            </div>
          </div>
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-1.5 overflow-x-auto">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase shrink-0">Quick:</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => handleQuickSelect(0)}
              className="px-2.5 py-1 rounded-xl bg-blue-100 text-blue-800 hover:bg-blue-600 hover:text-white transition-all cursor-pointer border border-blue-200 font-black text-[11px]"
            >
              Today
            </button>
            <button
              onClick={() => handleQuickSelect(1)}
              className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all cursor-pointer border border-blue-200 font-black text-[11px]"
            >
              Tomorrow
            </button>
            <button
              onClick={() => handleQuickSelect(7)}
              className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all cursor-pointer border border-blue-200 font-black text-[11px]"
            >
              +7 Days
            </button>
            <button
              onClick={() => handleQuickSelect(30)}
              className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all cursor-pointer border border-blue-200 font-black text-[11px]"
            >
              +30 Days
            </button>
            <button
              onClick={() => handleQuickSelect(65)}
              className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer border border-emerald-200 font-black text-[11px]"
              title="Select Max ARP Date (65th Day)"
            >
              65th Day (Max)
            </button>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="px-6 pt-4 pb-2 flex items-center justify-between">
          <button
            disabled={isMinMonth}
            onClick={handlePrevMonth}
            className={`p-2 rounded-xl border border-slate-200 transition-all ${
              isMinMonth ? 'opacity-30 cursor-not-allowed text-slate-300' : 'hover:bg-slate-100 text-slate-700 cursor-pointer'
            }`}
            title={isMinMonth ? "Past months are restricted" : "Previous Month"}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-black text-slate-900 text-base">
            {monthNames[viewMonth]} {viewYear}
          </span>

          <button
            disabled={isMaxMonth}
            onClick={handleNextMonth}
            className={`p-2 rounded-xl border border-slate-200 transition-all ${
              isMaxMonth ? 'opacity-30 cursor-not-allowed text-slate-300' : 'hover:bg-slate-100 text-slate-700 cursor-pointer'
            }`}
            title={isMaxMonth ? "Advance Reservation Period is restricted to 65 days" : "Next Month"}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="px-6 py-2 grid grid-cols-7 gap-1 text-center border-b border-slate-100">
          {daysOfWeek.map((day, idx) => (
            <span
              key={day}
              className={`text-[11px] font-black uppercase ${
                idx === 0 || idx === 6 ? 'text-rose-500' : 'text-slate-400'
              }`}
            >
              {day}
            </span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="p-6 grid grid-cols-7 gap-2 text-center">
          {/* Empty Lead Space */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const monthStr = String(viewMonth + 1).padStart(2, '0');
            const dayStr = String(dayNum).padStart(2, '0');
            const isoStr = `${viewYear}-${monthStr}-${dayStr}`;

            const isPast = isoStr < todayIso;
            const isBeyondMax = isoStr > maxDateIso;
            const isDisabled = isPast || isBeyondMax;
            const isToday = isoStr === todayIso;
            const isMaxDay = isoStr === maxDateIso;
            const isSelected = isoStr === selectedDate;

            return (
              <button
                key={dayNum}
                disabled={isDisabled}
                onClick={() => handleDateClick(dayNum)}
                title={
                  isPast
                    ? 'Restricted (Past Date)'
                    : isBeyondMax
                    ? 'Restricted (Beyond 65 Days ARP)'
                    : isMaxDay
                    ? 'Maximum Advance Booking Date (65th Day)'
                    : isToday
                    ? 'Today'
                    : `Select ${isoStr}`
                }
                className={`h-10 rounded-2xl font-black text-xs relative flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isDisabled
                    ? 'text-slate-300 bg-slate-50/80 cursor-not-allowed line-through opacity-40 border border-slate-100'
                    : isSelected
                    ? 'bg-gradient-to-r from-[#0026cd] to-[#1e40af] text-white shadow-lg scale-105 z-10 font-black'
                    : isToday
                    ? 'bg-blue-50 text-blue-700 border-2 border-blue-600 hover:bg-blue-100'
                    : isMaxDay
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-400 hover:bg-emerald-100'
                    : 'text-slate-800 hover:bg-slate-100 hover:text-blue-700'
                }`}
              >
                <span>{dayNum}</span>
                {isToday && !isSelected && (
                  <span className="text-[7.5px] font-black tracking-tighter text-blue-600 -mt-1 block uppercase">
                    Today
                  </span>
                )}
                {isMaxDay && !isSelected && (
                  <span className="text-[7px] font-black tracking-tighter text-emerald-700 -mt-1 block uppercase">
                    65d Limit
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Legend & Rules */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-slate-400 line-through">
                <Lock className="w-3 h-3 text-slate-300" /> Rest (Restricted)
              </span>
              <span className="flex items-center gap-1 text-blue-700 font-extrabold">
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span> Today ➔ +65 Days
              </span>
            </div>
            <span className="text-[10px] text-emerald-700 font-black bg-emerald-100 px-2 py-0.5 rounded-full">
              ARP 65 Days
            </span>
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shrink-0"
            >
              Done
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
