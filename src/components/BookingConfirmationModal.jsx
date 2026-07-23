import React from 'react';
import { CalendarCheck, MapPin, ArrowRight, X } from 'lucide-react';

export default function BookingConfirmationModal({ searchedFrom, searchedTo, bookingTrain, selectedClass, onClose, onContinue }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#fff5ee] w-full max-w-lg rounded-3xl overflow-hidden border border-orange-200 shadow-2xl my-8 p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 border border-blue-200 text-blue-900 flex items-center justify-center">
            <CalendarCheck className="w-6 h-6 text-blue-800" />
          </div>
          <h2 className="text-xl font-black text-[#000066]">
            Please confirm the booking details
          </h2>
        </div>

        {/* You searched for Section */}
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-800">You searched for:</label>
          <div className="bg-white p-4 rounded-2xl border border-blue-300 shadow-2xs flex items-center justify-between text-sm font-extrabold text-[#000066]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-800 flex items-center justify-center">
                <MapPin className="w-4 h-4 fill-blue-600 text-white" />
              </div>
              <div>
                <span className="block font-black">{searchedFrom}</span>
                <span className="text-[10px] text-blue-700 font-bold">From</span>
              </div>
            </div>

            <ArrowRight className="w-5 h-5 text-slate-400" />

            <div className="text-right">
              <span className="block font-black">{searchedTo}</span>
              <span className="text-[10px] text-blue-700 font-bold">To</span>
            </div>
          </div>
        </div>

        {/* You are booking for Section */}
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-800">You are booking for:</label>
          <div className="bg-white p-4 rounded-2xl border border-rose-300 shadow-2xs flex items-center justify-between text-sm font-extrabold text-rose-950">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-800 flex items-center justify-center">
                <MapPin className="w-4 h-4 fill-rose-600 text-white" />
              </div>
              <div>
                <span className="block font-black">{bookingTrain.from} ({bookingTrain.fromName})</span>
                <span className="text-[10px] text-rose-700 font-bold">From</span>
              </div>
            </div>

            <ArrowRight className="w-5 h-5 text-slate-400" />

            <div className="text-right">
              <span className="block font-black">{bookingTrain.to} ({bookingTrain.toName})</span>
              <span className="text-[10px] text-rose-700 font-bold">To</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-white hover:bg-slate-100 text-blue-950 font-extrabold text-xs border border-slate-300 shadow-xs transition-all"
          >
            Back
          </button>

          <button
            onClick={onContinue}
            className="flex-1 py-3 rounded-2xl bg-[#283593] hover:bg-blue-900 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 text-center"
          >
            Continue Booking
          </button>
        </div>

      </div>
    </div>
  );
}
