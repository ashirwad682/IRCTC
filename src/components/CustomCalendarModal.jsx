import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Check, Sparkles, AlertCircle } from 'lucide-react';

export default function CustomCalendarModal({ selectedDate, onSelectDate, onClose }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString().split('T')[0];

  // 65 Days IRCTC Advance Reservation Period (ARP) limit
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 65);
  const maxDateIso = maxDate.toISOString().split('T')[0];

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

    if (isoStr < todayIso || isoStr > maxDateIso) return; // Block past & beyond 65-day dates
    onSelectDate(isoStr);
    if (onClose) onClose();
  };

  const handleQuickSelect = (offsetDays) => {
    const target = new Date();
    target.setDate(target.getDate() + offsetDays);
    const isoStr = target.toISOString().split('T')[0];
    onSelectDate(isoStr);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0026cd] to-[#1e40af] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base uppercase tracking-wide flex items-center gap-1.5">
                Select Journey Date
              </h3>
              <p className="text-xs font-medium text-blue-100">
                Official IRCTC Train Reservation Calendar
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

        {/* Quick Shortcut Buttons */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex items-center justify-between gap-2 text-xs font-bold">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase">Quick Select:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuickSelect(0)}
              className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all cursor-pointer border border-blue-200 font-black text-[11px]"
            >
              Today
            </button>
            <button
              onClick={() => handleQuickSelect(1)}
              className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all cursor-pointer border border-blue-200 font-black text-[11px]"
            >
              Tomorrow
            </button>
            <button
              onClick={() => handleQuickSelect(2)}
              className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all cursor-pointer border border-blue-200 font-black text-[11px]"
            >
              In 2 Days
            </button>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="px-6 pt-5 pb-2 flex items-center justify-between">
          <button
            disabled={isMinMonth}
            onClick={handlePrevMonth}
            className={`p-2 rounded-xl border border-slate-200 transition-all ${
              isMinMonth ? 'opacity-30 cursor-not-allowed text-slate-300' : 'hover:bg-slate-100 text-slate-700 cursor-pointer'
            }`}
            title={isMinMonth ? "Past months are blocked" : "Previous Month"}
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
            title={isMaxMonth ? "Advance Reservation Period is limited to 65 days" : "Next Month"}
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
            const isSelected = isoStr === selectedDate;

            return (
              <button
                key={dayNum}
                disabled={isDisabled}
                onClick={() => handleDateClick(dayNum)}
                className={`h-10 rounded-2xl font-black text-xs relative flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isDisabled
                    ? 'text-slate-300 bg-slate-50 cursor-not-allowed line-through opacity-40'
                    : isSelected
                    ? 'bg-gradient-to-r from-[#0026cd] to-[#1e40af] text-white shadow-lg scale-105 z-10 font-black'
                    : isToday
                    ? 'bg-blue-50 text-blue-700 border-2 border-blue-600 hover:bg-blue-100'
                    : 'text-slate-800 hover:bg-slate-100 hover:text-blue-700'
                }`}
              >
                <span>{dayNum}</span>
                {isToday && !isSelected && (
                  <span className="text-[8px] font-bold tracking-tighter text-blue-600 -mt-1 block uppercase">
                    Today
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
            <span>Advance booking open up to 65 days (Official IRCTC ARP)</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shrink-0"
          >
            Done
          </button>
        </div>

      </div>

    </div>
  );
}
