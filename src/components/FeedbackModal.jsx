import React, { useState } from 'react';
import { Star, CheckCircle, ArrowLeft } from 'lucide-react';

export default function FeedbackModal({ onClose, onSubmitSuccess }) {
  const [ratings, setRatings] = useState({
    q1: 5,
    q2: 5,
    q3: 5,
    q4: 5,
    q5: 5
  });

  const [suggestions, setSuggestions] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleStarClick = (questionKey, starValue) => {
    setRatings(prev => ({ ...prev, [questionKey]: starValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      if (onSubmitSuccess) onSubmitSuccess();
      onClose();
    }, 1500);
  };

  const renderStarRating = (questionKey) => {
    return (
      <div className="flex items-center gap-2 pt-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = ratings[questionKey] >= star;
          return (
            <button
              key={star}
              type="button"
              onClick={() => handleStarClick(questionKey, star)}
              className="p-1 hover:scale-125 transition-transform cursor-pointer"
            >
              <Star
                className={`w-6 h-6 ${
                  isActive ? 'fill-amber-400 text-amber-500' : 'text-slate-300 fill-slate-100'
                }`}
              />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      
      {/* 1:1 Matching IRCTC Feedback Container */}
      <div className="bg-[#f0f4f9] w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 my-6 flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="bg-[#0f62ac] text-white p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black tracking-tight">Feedback</h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-slate-900">
          
          {submitted ? (
            <div className="bg-white p-8 rounded-3xl text-center space-y-4 border border-emerald-200 shadow-sm my-12">
              <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto animate-bounce" />
              <h3 className="text-2xl font-black text-blue-950">Thank You for Your Feedback!</h3>
              <p className="text-sm font-bold text-slate-600">
                Your ratings and suggestions have been recorded in the IRCTC NextGen eTicketing System.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-1">
                <h1 className="text-2xl font-black text-[#000066]">Feedback</h1>
                <p className="text-xs font-bold text-slate-700">
                  Please spare a moment to rate your online experience with Next Generation eTicketing Website. Your feedback will help us improve our services.
                </p>
              </div>

              {/* Ratings Box */}
              <div className="bg-white rounded-2xl border border-blue-900 shadow-xs overflow-hidden">
                
                {/* Scale Instruction Bar */}
                <div className="bg-[#0f2b60] text-white p-3 text-xs font-black">
                  Rate on a 5 Star scale (5 Star – Excellent, 4 Star – Very good, 3 Star – Good, 2 Star – Average, 1 Star – Satisfactory)
                </div>

                <div className="p-5 space-y-5 divide-y divide-slate-100">
                  
                  {/* Q1 */}
                  <div className="space-y-1">
                    <label className="block text-xs font-black text-slate-800">
                      1. Please rate your overall experience of new version of IRCTC
                    </label>
                    {renderStarRating('q1')}
                  </div>

                  {/* Q2 */}
                  <div className="pt-4 space-y-1">
                    <label className="block text-xs font-black text-slate-800">
                      2. How do you compare booking a ticket on new version of IRCTC to booking a ticket in older version
                    </label>
                    {renderStarRating('q2')}
                  </div>

                  {/* Q3 */}
                  <div className="pt-4 space-y-1">
                    <label className="block text-xs font-black text-slate-800">
                      3. How would you compare the overall experience of New version of IRCTC with other commonly used websites
                    </label>
                    {renderStarRating('q3')}
                  </div>

                  {/* Q4 */}
                  <div className="pt-4 space-y-1">
                    <label className="block text-xs font-black text-slate-800">
                      4. How easy was it to search for a train and check availability on New version
                    </label>
                    {renderStarRating('q4')}
                  </div>

                  {/* Q5 */}
                  <div className="pt-4 space-y-1">
                    <label className="block text-xs font-black text-slate-800">
                      5. Website usage & design
                    </label>
                    {renderStarRating('q5')}
                  </div>

                </div>

              </div>

              {/* Suggestions Textarea Box */}
              <div className="bg-white rounded-2xl border border-blue-900 shadow-xs overflow-hidden">
                
                <div className="bg-[#0f2b60] text-white p-3 text-xs font-black">
                  Any suggestions for improvements for IRCTC
                </div>

                <div className="p-4">
                  <textarea
                    rows={4}
                    value={suggestions}
                    onChange={(e) => setSuggestions(e.target.value)}
                    placeholder="Enter your valuable suggestions here..."
                    className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-extrabold text-blue-950 focus:outline-none focus:bg-white"
                  />
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  type="submit"
                  className="px-8 py-3 rounded-2xl bg-[#283593] hover:bg-blue-900 text-white font-black text-xs shadow-md transition-all active:scale-95"
                >
                  Submit
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 rounded-2xl bg-[#283593] hover:bg-blue-900 text-white font-black text-xs shadow-md transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>

            </form>
          )}

        </div>

      </div>

    </div>
  );
}
