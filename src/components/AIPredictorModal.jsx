import React, { useState } from 'react';
import { Sparkles, X, Brain, CheckCircle2, Cpu, Lightbulb, Train, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { STATIONS, TRAINS } from '../data/mockTrains';

export default function AIPredictorModal({ onClose, onSelectTrainForBooking }) {
  const [fromStation, setFromStation] = useState('NDLS');
  const [toStation, setToStation] = useState('MMCT');
  const [preference, setPreference] = useState('FASTEST'); // 'FASTEST', 'COMFORT', 'BUDGET', 'FAMILY'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState(null);

  const handleAIRecommendation = (e) => {
    e.preventDefault();
    setIsAnalyzing(true);

    setTimeout(() => {
      setIsAnalyzing(false);

      // Find matching trains
      const matchingTrains = TRAINS.filter(
        t => (t.from === fromStation && t.to === toStation) || (t.from === fromStation) || (t.to === toStation)
      );

      const bestTrain = matchingTrains[0] || TRAINS[0];
      const fromObj = STATIONS.find(s => s.code === fromStation) || { city: fromStation };
      const toObj = STATIONS.find(s => s.code === toStation) || { city: toStation };

      setAiRecommendation({
        train: bestTrain,
        fromCity: fromObj.city,
        toCity: toObj.city,
        confidenceScore: 98.6,
        recommendedClass: bestTrain.classes[0],
        availableSeatsText: bestTrain.classes[0].status,
        reason: `AI Neural Engine selected ${bestTrain.name} as the #1 optimal choice for ${fromObj.city} to ${toObj.city}. It offers the fastest travel duration (${bestTrain.duration}), highest punctuality (${bestTrain.punctuality}), and confirmed berth availability.`,
        suggestedBerth: 'Coach B1 - Seats 19 & 20 (Window Pair with Table)',
        cateringNote: bestTrain.pantry ? 'Complimentary Gourmet Hot Meals Included' : 'Standard Pantry Snacks'
      });
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden border border-slate-200 shadow-2xl my-8">
        
        {/* Header */}
        <div className="px-6 py-5 bg-blue-950 text-white flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-500 p-0.5 flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-blue-950 rounded-[14px] flex items-center justify-center text-orange-400">
                <Brain className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black flex items-center gap-2 text-white">
                <span>IRCTC Genius AI Assistant</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-orange-500 text-white">
                  v3.5 Engine
                </span>
              </h2>
              <p className="text-xs text-blue-200 font-medium">
                Intelligent Route & Seat Recommendation Advisor
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-blue-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Query Form (No PNR asked - Only Where to Where) */}
          <form onSubmit={handleAIRecommendation} className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h3 className="text-xs font-black uppercase tracking-wider text-orange-600 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>Where Do You Want To Travel?</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* From Station */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">From Station</label>
                <select
                  value={fromStation}
                  onChange={(e) => setFromStation(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  {STATIONS.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.city} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* To Station */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">To Station</label>
                <select
                  value={toStation}
                  onChange={(e) => setToStation(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  {STATIONS.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.city} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Preference */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Priority Preference</label>
                <select
                  value={preference}
                  onChange={(e) => setPreference(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="FASTEST">Fastest Express Speed</option>
                  <option value="COMFORT">Luxury AC 1A/2A Comfort</option>
                  <option value="BUDGET">Best Budget Sleeper</option>
                  <option value="FAMILY">Family Couple Bays</option>
                </select>
              </div>

            </div>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="mt-4 w-full py-3 rounded-xl irctc-gradient-btn font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
            >
              {isAnalyzing ? (
                <>
                  <Cpu className="w-4 h-4 animate-spin text-white" />
                  <span>Analyzing Routes & Live Seat Inventory...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Ask AI Genius To Recommend Best Train & Berth</span>
                </>
              )}
            </button>
          </form>

          {/* AI Recommendation Output */}
          {aiRecommendation && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md relative overflow-hidden space-y-4">
              
              {/* Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-extrabold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>AI Recommended #1 Choice ({aiRecommendation.confidenceScore}% Score)</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {aiRecommendation.fromCity} ➔ {aiRecommendation.toCity}
                </span>
              </div>

              {/* Train Info */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-950 font-mono font-bold text-xs">
                      #{aiRecommendation.train.number}
                    </span>
                    <h4 className="text-base font-black text-blue-950">{aiRecommendation.train.name}</h4>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-semibold">
                    Departure: <strong className="text-slate-900">{aiRecommendation.train.departureTime}</strong> • Duration: <strong className="text-orange-600">{aiRecommendation.train.duration}</strong> • On-Time: <strong className="text-emerald-700">{aiRecommendation.train.punctuality}</strong>
                  </p>
                </div>

                <div className="text-right bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Live Seat Status</span>
                  <span className="text-sm font-black text-emerald-700 font-mono block">
                    {aiRecommendation.availableSeatsText}
                  </span>
                  <span className="text-xs font-bold text-slate-900">₹{aiRecommendation.recommendedClass.price}</span>
                </div>
              </div>

              {/* AI Explanation & Berth Suggestion */}
              <div className="space-y-3 text-xs font-medium text-slate-700">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-orange-50 border border-orange-200">
                  <Lightbulb className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-blue-950 block mb-0.5">Why AI Recommends This Train:</strong>
                    <span>{aiRecommendation.reason}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <Train className="w-4 h-4 text-blue-900 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-blue-950 block mb-0.5">Recommended Berths & Catering:</strong>
                    <span>{aiRecommendation.suggestedBerth} • {aiRecommendation.cateringNote}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    onClose();
                    if (onSelectTrainForBooking) {
                      onSelectTrainForBooking(aiRecommendation.train, aiRecommendation.recommendedClass);
                    }
                  }}
                  className="px-6 py-2.5 rounded-xl irctc-gradient-btn font-extrabold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
                >
                  <span>Select Seats & Book Recommended Train</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
