import React, { useState } from 'react';
import { ShieldCheck, KeyRound, UserCheck, UserPlus, CheckCircle, XCircle, FileText, FolderPlus, Receipt, Check, Lock, ShieldAlert } from 'lucide-react';

// 1. Change Password Modal
export function ChangePasswordModal({ onClose }) {
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => onClose(), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-black text-[#000066] flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-orange-500" />
            Change IRCTC Account Password
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        {success ? (
          <div className="text-center py-6 space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-base font-black text-slate-900">Password Changed Successfully!</h4>
            <p className="text-xs text-slate-500 font-bold">Your security credentials have been updated.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Current Password</label>
              <input
                type="password"
                required
                value={passwords.current}
                onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                placeholder="••••••••"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-black focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">New Password</label>
              <input
                type="password"
                required
                value={passwords.newPass}
                onChange={e => setPasswords({ ...passwords, newPass: e.target.value })}
                placeholder="••••••••"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-black focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwords.confirm}
                onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                placeholder="••••••••"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-black focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-xs">Cancel</button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-[#283593] text-white font-black text-xs shadow-md">Update Password</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// 2. Authenticate User (Aadhaar KYC) Modal
export function AadhaarKycModal({ onClose }) {
  const [aadhaar, setAadhaar] = useState('8849 1029 4102');
  const [verified, setVerified] = useState(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-black text-[#000066] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-orange-500" />
            IRCTC Aadhaar KYC Authentication
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
          <div>
            <h4 className="text-xs font-black text-emerald-950">Aadhaar KYC Verified ✅</h4>
            <p className="text-[11px] font-bold text-emerald-800">You are eligible to book up to 12 tickets per month.</p>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
            <span className="font-bold text-slate-500">Aadhaar Number</span>
            <span className="font-mono font-black text-slate-900">XXXX-XXXX-4102</span>
          </div>
          <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
            <span className="font-bold text-slate-500">KYC Status</span>
            <span className="font-black text-emerald-600 uppercase">AUTHENTICATED (UIDAI)</span>
          </div>
        </div>

        <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-[#283593] text-white font-black text-xs shadow-md">
          Close Window
        </button>
      </div>
    </div>
  );
}

// 3. Master List Manager Modal
export function MasterListModal({ onClose }) {
  const masterList = [
    { name: 'Ashirwad Kumar', age: 28, gender: 'Male', berth: 'Lower' },
    { name: 'Priya Sharma', age: 26, gender: 'Female', berth: 'Middle' },
    { name: 'Rajesh Kumar', age: 58, gender: 'Male', berth: 'Lower' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-black text-[#000066] flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-orange-500" />
            IRCTC Master Passenger List (3 Saved)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {masterList.map((m, idx) => (
            <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-900">{m.name}</h4>
                <p className="text-[10px] text-slate-500 font-bold">{m.age} Yrs | {m.gender} | {m.berth} Berth</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-black text-[10px]">SAVED</span>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-[#283593] text-white font-black text-xs shadow-md">
          Close Master List Manager
        </button>
      </div>
    </div>
  );
}

// 4. File TDR Modal
export function FileTdrModal({ onClose }) {
  const [reason, setReason] = useState('Train Delayed More Than 3 Hours');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-black text-[#000066] flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-orange-500" />
            File Ticket Deposit Receipt (TDR)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        {submitted ? (
          <div className="text-center py-6 space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-base font-black text-slate-900">TDR Filed Successfully!</h4>
            <p className="text-xs text-slate-500 font-bold">Ref ID: TDR884902194. Refund will process post verification.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs font-bold text-blue-950">
              Select PNR: <span className="font-mono font-black">100006711780974</span> (RJPB TEJAS RAJ)
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Reason for Filing TDR</label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-black"
              >
                <option value="Train Delayed More Than 3 Hours">Train Delayed More Than 3 Hours & Passenger Not Travelled</option>
                <option value="AC Failure">AC Failure in Coach</option>
                <option value="Difference in Fare">Difference in Fare Charged</option>
              </select>
            </div>

            <button onClick={() => setSubmitted(true)} className="w-full py-2.5 rounded-xl bg-[#283593] text-white font-black text-xs shadow-md">
              Submit TDR Claim
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// 5. TAX Invoice Modal
export function TaxInvoiceModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-black text-[#000066] flex items-center gap-2">
            <Receipt className="w-5 h-5 text-orange-500" />
            Official IRCTC GST Tax Invoice
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-slate-500 font-bold">GSTIN</span><span className="font-mono font-black">07AAACI1681G1ZM</span></div>
          <div className="flex justify-between"><span className="text-slate-500 font-bold">Invoice No</span><span className="font-mono font-black">INV-2026-884910</span></div>
          <div className="flex justify-between"><span className="text-slate-500 font-bold">CGST (2.5%)</span><span className="font-mono font-black">₹47.62</span></div>
          <div className="flex justify-between"><span className="text-slate-500 font-bold">SGST (2.5%)</span><span className="font-mono font-black">₹47.62</span></div>
          <div className="flex justify-between pt-2 border-t border-slate-200 font-black text-slate-900"><span>Total Tax</span><span>₹95.24</span></div>
        </div>

        <button onClick={() => { alert("Downloaded GST Tax Invoice PDF!"); onClose(); }} className="w-full py-2.5 rounded-xl bg-[#283593] text-white font-black text-xs shadow-md">
          📄 Download Tax Invoice PDF
        </button>
      </div>
    </div>
  );
}
