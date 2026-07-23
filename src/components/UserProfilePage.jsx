import React, { useState } from 'react';
import { User, ShieldCheck, KeyRound, Wallet, Edit3, ArrowLeft, Save, CheckCircle2, Ticket, Trash2, Plus, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import { STATIONS } from '../data/mockTrains';
import BookedTicketHistoryPage from './BookedTicketHistoryPage';

export default function UserProfilePage({ user, onLogout, onBackToSearch, onViewTicket, onOpenBookedTickets, activeTabMode = 'profile', userBookings = [] }) {
  if (!user) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-xl my-12 space-y-4 font-sans">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0026cd] flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">IRCTC User Authentication Required</h3>
        <p className="text-xs text-slate-600 font-medium">Please sign in to your IRCTC account to view your profile, manage master passenger lists, and check booking history.</p>
        <button
          onClick={onBackToSearch}
          className="px-6 py-2.5 rounded-full bg-[#0026cd] hover:bg-blue-900 text-white font-black text-xs shadow-md transition-all cursor-pointer"
        >
          Back to Train Search
        </button>
      </div>
    );
  }

  const [activeSubTab, setActiveSubTab] = useState(activeTabMode); // 'profile', 'change_password', 'authenticate', 'master_list', 'recent_journeys', 'bookings'

  // Profile Data State
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.name || 'Ashirwad Kumar',
    gender: 'Male',
    dob: '01-01-2005',
    mobile: '+91-6204938006',
    country: 'India',
    email: user?.email || 'ashirwad682@gmail.com',
    address: 'MALSALAMI MAIN ROAD , BESIDE MALSALAMI THANA , Patna City S.O, Patna, Bihar, India, 800008.'
  });

  // Change Password Form State
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMessage, setPassMessage] = useState('');

  // Master List Form State
  const [masterType, setMasterType] = useState('Normal User');
  const [masterPassengers, setMasterPassengers] = useState([
    { id: 1, name: 'ASHIRWAD KUMAR', age: 21, gender: 'Male', berth: 'No Preference', meal: 'Veg', dob: '01-01-2005', status: 'Verified', statusColor: 'text-emerald-600', idType: 'AADHAR ID/VIRTUAL ID' },
    { id: 2, name: 'ASHISH KUMAR', age: 19, gender: 'Male', berth: 'Lower', meal: 'No Food/beverages', dob: '01-01-2007', status: 'Not Verified', statusColor: 'text-rose-600', idType: 'AADHAR ID/VIRTUAL ID' },
    { id: 3, name: 'BALRAM CHOUDHARY', age: 60, gender: 'Male', berth: 'Lower', meal: 'No Food/beverages', dob: '01-01-1966', status: '', statusColor: '', idType: '' },
    { id: 4, name: 'HARSH CHOUDHARY', age: 16, gender: 'Male', berth: 'Lower', meal: 'No Food/beverages', dob: '26-12-2009', status: '', statusColor: '', idType: '' },
    { id: 5, name: 'SHOBHA DEVI', age: 53, gender: 'Female', berth: 'Lower', meal: 'No Food/beverages', dob: '01-01-1973', status: 'Re Verify', statusColor: 'text-rose-600', idType: 'AADHAR ID/VIRTUAL ID' }
  ]);

  const [newMasterName, setNewMasterName] = useState('');
  const [newMasterDob, setNewMasterDob] = useState('');
  const [newMasterGender, setNewMasterGender] = useState('Male');
  const [newMasterBerth, setNewMasterBerth] = useState('Select Berth Preference');

  // Favourite Recent Journeys List State
  const [favJourneys, setFavJourneys] = useState([
    { id: 1, trainNo: '18622', fromCode: 'JSME', fromCity: 'JASIDIH JN', toCode: 'PNC', toCity: 'PATNA SAHEB', classCode: 'AC 3 Tier (3A)', quota: 'GENERAL' },
    { id: 2, trainNo: '18184', fromCode: 'PNC', fromCity: 'PATNA SAHEB', toCode: 'JSME', toCity: 'JASIDIH JN', classCode: 'Second Sitting (2S)', quota: 'GENERAL' },
    { id: 3, trainNo: '18184', fromCode: 'PNC', fromCity: 'PATNA SAHEB', toCode: 'JSME', toCity: 'JASIDIH JN', classCode: 'AC Chair car (CC)', quota: 'GENERAL' }
  ]);

  const [newJourneyTrain, setNewJourneyTrain] = useState('');
  const [newJourneyClass, setNewJourneyClass] = useState('Select Class');
  const [newJourneyFrom, setNewJourneyFrom] = useState('');
  const [newJourneyTo, setNewJourneyTo] = useState('');
  const [newJourneyQuota, setNewJourneyQuota] = useState('GENERAL');

  const handleAddMaster = (e) => {
    e.preventDefault();
    if (!newMasterName) return;
    setMasterPassengers([
      ...masterPassengers,
      {
        id: Date.now(),
        name: newMasterName.toUpperCase(),
        age: 25,
        gender: newMasterGender,
        berth: newMasterBerth,
        meal: 'Veg',
        dob: newMasterDob || '01-01-2000',
        status: 'Verified',
        statusColor: 'text-emerald-600',
        idType: 'AADHAR ID/VIRTUAL ID'
      }
    ]);
    setNewMasterName('');
    setNewMasterDob('');
  };

  const handleAddJourney = (e) => {
    e.preventDefault();
    if (!newJourneyTrain) return;
    setFavJourneys([
      ...favJourneys,
      {
        id: Date.now(),
        trainNo: newJourneyTrain,
        fromCode: newJourneyFrom || 'JSME',
        fromCity: 'JASIDIH JN',
        toCode: newJourneyTo || 'PNC',
        toCity: 'PATNA SAHEB',
        classCode: newJourneyClass || 'AC 3 Tier (3A)',
        quota: newJourneyQuota || 'GENERAL'
      }
    ]);
    setNewJourneyTrain('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBackToSearch}
          className="flex items-center gap-2 text-xs font-black text-[#000066] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Train Search</span>
        </button>

        {/* Tab Switchers (Exact matching all 5 profile sub-section options!) */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs text-xs font-black">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeSubTab === 'profile' ? 'bg-[#000066] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            My Profile
          </button>

          <button
            onClick={() => setActiveSubTab('change_password')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeSubTab === 'change_password' ? 'bg-[#000066] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Change Password
          </button>

          <button
            onClick={() => setActiveSubTab('authenticate')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeSubTab === 'authenticate' ? 'bg-[#000066] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Authenticate User
          </button>

          <button
            onClick={() => setActiveSubTab('master_list')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeSubTab === 'master_list' ? 'bg-[#000066] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Master List
          </button>

          <button
            onClick={() => onOpenBookedTickets ? onOpenBookedTickets() : setActiveSubTab('bookings')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeSubTab === 'bookings' ? 'bg-[#000066] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Booked Ticket History
          </button>

          <button
            onClick={() => setActiveSubTab('recent_journeys')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeSubTab === 'recent_journeys' ? 'bg-[#000066] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Recent Journeys
          </button>
        </div>
      </div>

      {/* VIEW 1: MY PROFILE (Exact 1:1 Screenshot 1!) */}
      {activeSubTab === 'profile' && (
        <div className="space-y-6">
          <h1 className="text-3xl font-black text-[#000066] uppercase tracking-tight">UPDATE PROFILE</h1>

          <div className="bg-white/80 backdrop-blur-xs rounded-3xl border border-slate-300 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-black text-[#000066] uppercase">MY PROFILE</h2>
              <button onClick={() => setIsEditing(!isEditing)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200">
                <Edit3 className="w-4 h-4 text-slate-900" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-extrabold text-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <span className="sm:col-span-4 text-slate-500 font-bold">Full Name as per Govt. ID:</span>
                <span className="sm:col-span-8 font-black text-slate-900 text-sm">{profileData.fullName}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <span className="sm:col-span-4 text-slate-500 font-bold">Gender:</span>
                <span className="sm:col-span-8 text-slate-900">{profileData.gender}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <span className="sm:col-span-4 text-slate-500 font-bold">Date Of Birth:</span>
                <span className="sm:col-span-8 text-slate-900">{profileData.dob}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <span className="sm:col-span-4 text-slate-500 font-bold">ISD-Mobile:</span>
                <span className="sm:col-span-8 font-mono text-slate-900">{profileData.mobile}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <span className="sm:col-span-4 text-slate-500 font-bold">Country:</span>
                <span className="sm:col-span-8 text-slate-900">{profileData.country}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <span className="sm:col-span-4 text-slate-500 font-bold">Email:</span>
                <span className="sm:col-span-8 font-mono text-slate-900">{profileData.email}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <span className="sm:col-span-4 text-slate-500 font-bold">Residential Address:</span>
                <span className="sm:col-span-8 text-slate-900">{profileData.address}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs rounded-3xl border border-slate-300 p-6 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-[#000066] uppercase mb-1">PASSWORDS</h2>
              <span className="text-xs font-bold text-slate-700">Change Login Password</span>
            </div>
            <button onClick={() => setActiveSubTab('change_password')} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200">
              <Edit3 className="w-4 h-4 text-slate-900" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: CHANGE PASSWORD (Exact 1:1 Screenshot 1!) */}
      {activeSubTab === 'change_password' && (
        <div className="space-y-6">
          <h1 className="text-3xl font-black text-[#000066] tracking-tight">Change Password</h1>

          <div className="bg-white/80 backdrop-blur-xs rounded-3xl border border-slate-300 p-6 sm:p-8 shadow-sm space-y-6 max-w-3xl">
            
            {/* New Password Input */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
              <label className="sm:col-span-4 font-black text-slate-900 text-xs pt-2">New Password:</label>
              <div className="sm:col-span-8 space-y-3">
                <div className="relative bg-white rounded-xl border border-slate-300 p-2.5 flex items-center justify-between">
                  <input
                    type={showPass1 ? "text" : "password"}
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                    placeholder="New Password"
                    className="w-full bg-transparent font-black text-blue-950 text-xs focus:outline-none"
                  />
                  <button type="button" onClick={() => setShowPass1(!showPass1)} className="text-slate-500">
                    {showPass1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Red Password Rules List */}
                <div className="text-[11px] font-bold text-rose-600 space-y-1 pl-1">
                  <div className="flex items-start gap-1.5"><span>✖</span><span>Minimum 11 to Maximum 15 characters allowed.</span></div>
                  <div className="flex items-start gap-1.5"><span>✖</span><span>Password must contain at least one small and one capital alphabet.</span></div>
                  <div className="flex items-start gap-1.5"><span>✖</span><span>At least one Numeric digit and one special character (@#$%^&amp;* etc.)</span></div>
                  <div className="flex items-start gap-1.5"><span>✖</span><span>Password should not contain any sequence or repeated numbers like 123, 000, 111, abc, aaa etc.</span></div>
                  <p className="text-slate-600 pt-1 font-semibold">Note: The password must not be the same as any of your last three passwords.</p>
                </div>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-2">
              <label className="sm:col-span-4 font-black text-slate-900 text-xs">Confirm Password:</label>
              <div className="sm:col-span-8">
                <div className="relative bg-white rounded-xl border border-slate-300 p-2.5 flex items-center justify-between">
                  <input
                    type={showPass2 ? "text" : "password"}
                    value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                    placeholder="Confirm Password"
                    className="w-full bg-transparent font-black text-blue-950 text-xs focus:outline-none"
                  />
                  <button type="button" onClick={() => setShowPass2(!showPass2)} className="text-slate-500">
                    {showPass2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => alert("Password Change Request Submitted!")}
                className="px-8 py-3 rounded-2xl bg-[#283593] hover:bg-blue-900 text-white font-black text-xs shadow-md transition-all active:scale-95"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('profile')}
                className="px-8 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-black text-xs shadow-xs"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 3: AUTHENTICATE USER (Exact 1:1 Screenshot 2!) */}
      {activeSubTab === 'authenticate' && (
        <div className="space-y-6">
          <h1 className="text-3xl font-black text-[#000066] text-center tracking-tight">Authenticate User</h1>

          {/* Green Aadhaar Success Box */}
          <div className="bg-white/80 backdrop-blur-xs rounded-3xl border border-slate-300 p-8 shadow-sm text-center">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-black text-base">
              Your profile details are successfully authenticated with Aadhaar.
            </div>
          </div>

          {/* Bottom Note */}
          <div className="p-4 rounded-2xl bg-slate-200/60 border border-slate-300 text-xs font-bold text-slate-700 max-w-2xl">
            i. Note: Please quote Reference number displayed with error message while communicating with IRCTC Care.
          </div>
        </div>
      )}

      {/* VIEW 4: ADD / MODIFY MASTER LIST (Exact 1:1 Screenshot 3!) */}
      {activeSubTab === 'master_list' && (
        <div className="space-y-6">
          <h1 className="text-3xl font-black text-[#000066] tracking-tight">Add / Modify Master List</h1>

          {/* Master List Form */}
          <form onSubmit={handleAddMaster} className="bg-white/80 backdrop-blur-xs rounded-3xl border border-slate-300 p-6 sm:p-8 shadow-sm space-y-4">
            
            <div className="flex items-center gap-6 text-xs font-black text-slate-800 pb-2">
              <span>Passenger Type</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="ptype" checked={masterType === 'Normal User'} onChange={() => setMasterType('Normal User')} className="text-blue-600" />
                <span>Normal User</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="ptype" checked={masterType === 'Pwd'} onChange={() => setMasterType('Pwd')} className="text-blue-600" />
                <span>Person With Disability / Escort</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="ptype" checked={masterType === 'Journalist'} onChange={() => setMasterType('Journalist')} className="text-blue-600" />
                <span>Journalist</span>
              </label>
            </div>

            <div className="bg-amber-50 p-2 rounded-xl text-[11px] font-bold text-amber-900">
              Please submit Name (Max. 60 char) and Date of Birth as per Aadhaar
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <label className="sm:col-span-4 text-xs font-black text-slate-900">Name*:</label>
              <input type="text" value={newMasterName} onChange={e => setNewMasterName(e.target.value)} placeholder="Name" required className="sm:col-span-8 bg-white p-2.5 rounded-xl border border-slate-300 font-bold text-xs" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <label className="sm:col-span-4 text-xs font-black text-slate-900">Date Of Birth*:</label>
              <input type="text" value={newMasterDob} onChange={e => setNewMasterDob(e.target.value)} placeholder="dd-mm-yyyy" required className="sm:col-span-8 bg-white p-2.5 rounded-xl border border-slate-300 font-bold text-xs" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <label className="sm:col-span-4 text-xs font-black text-slate-900">Gender*:</label>
              <div className="sm:col-span-8 flex items-center gap-4 text-xs font-bold">
                <label className="flex items-center gap-1"><input type="radio" name="g" checked={newMasterGender === 'Male'} onChange={() => setNewMasterGender('Male')} /><span>Male</span></label>
                <label className="flex items-center gap-1"><input type="radio" name="g" checked={newMasterGender === 'Female'} onChange={() => setNewMasterGender('Female')} /><span>Female</span></label>
                <label className="flex items-center gap-1"><input type="radio" name="g" checked={newMasterGender === 'Transgender'} onChange={() => setNewMasterGender('Transgender')} /><span>Transgender</span></label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <label className="sm:col-span-4 text-xs font-black text-slate-900">Berth Preference*:</label>
              <select value={newMasterBerth} onChange={e => setNewMasterBerth(e.target.value)} className="sm:col-span-8 bg-white p-2.5 rounded-xl border border-slate-300 font-bold text-xs">
                <option value="Select Berth Preference">Select Berth Preference</option>
                <option value="Lower">Lower</option>
                <option value="Middle">Middle</option>
                <option value="Upper">Upper</option>
                <option value="Side Lower">Side Lower</option>
                <option value="Side Upper">Side Upper</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" className="px-8 py-2.5 rounded-2xl bg-[#283593] text-white font-black text-xs shadow-md">Submit</button>
              <button type="reset" onClick={() => setNewMasterName('')} className="px-8 py-2.5 rounded-2xl bg-white border border-slate-300 font-black text-xs shadow-xs">Reset</button>
            </div>
          </form>

          {/* Pending Aadhaar Check Button */}
          <button onClick={() => alert("All 5 passengers verified with UIDAI!")} className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#0f2b60] text-white font-black text-xs shadow-md">
            Click here to check pending Aadhaar Verification Status.
          </button>

          {/* SAVED PASSENGERS LIST */}
          <div className="bg-white/80 backdrop-blur-xs rounded-3xl border border-slate-300 p-6 space-y-4">
            <h2 className="text-sm font-black text-[#000066] uppercase">SAVED PASSENGERS LIST</h2>

            <div className="space-y-3">
              {masterPassengers.map((mp, idx) => (
                <div key={mp.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900">{idx + 1}. {mp.name}</span>
                      <span className="text-slate-600 font-bold">{mp.age} | {mp.gender} | {mp.berth} | {mp.meal} | {mp.dob}</span>
                      {mp.status && <span className={`font-black text-xs ${mp.statusColor}`}>| {mp.status}</span>}
                    </div>
                    {mp.idType && <span className="text-[10px] text-slate-500 font-bold block pt-0.5">Id Card Type: {mp.idType}</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    <button type="button" className="p-1.5 text-slate-600 hover:text-blue-900"><Edit3 className="w-4 h-4" /></button>
                    <button type="button" onClick={() => setMasterPassengers(masterPassengers.filter(m => m.id !== mp.id))} className="p-1.5 text-slate-600 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] font-bold text-amber-900">
              User can book upto 24 tickets in a month, if IRCTC User ID has been verified with Aadhaar. <span className="underline cursor-pointer text-blue-900">Click Here</span> to know more
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: ADD RECENT JOURNEY LIST */}
      {activeSubTab === 'recent_journeys' && (
        <div className="space-y-6">
          <h1 className="text-3xl font-black text-[#000066] tracking-tight">Add Recent Journey List</h1>

          {/* Recent Journey Add Form */}
          <form onSubmit={handleAddJourney} className="bg-white/80 backdrop-blur-xs rounded-3xl border border-slate-300 p-6 sm:p-8 shadow-sm space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <label className="sm:col-span-4 text-xs font-black text-slate-900">Train Number*:</label>
              <input type="text" value={newJourneyTrain} onChange={e => setNewJourneyTrain(e.target.value)} placeholder="Enter Train Number" required className="sm:col-span-8 bg-white p-2.5 rounded-xl border border-blue-500 font-bold text-xs" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <label className="sm:col-span-4 text-xs font-black text-slate-900">Class*:</label>
              <select value={newJourneyClass} onChange={e => setNewJourneyClass(e.target.value)} className="sm:col-span-8 bg-white p-2.5 rounded-xl border border-slate-300 font-bold text-xs">
                <option value="Select Class">Select Class</option>
                <option value="AC 3 Tier (3A)">AC 3 Tier (3A)</option>
                <option value="AC Chair car (CC)">AC Chair car (CC)</option>
                <option value="Second Sitting (2S)">Second Sitting (2S)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <label className="sm:col-span-4 text-xs font-black text-slate-900">From station*:</label>
              <select value={newJourneyFrom} onChange={e => setNewJourneyFrom(e.target.value)} className="sm:col-span-8 bg-white p-2.5 rounded-xl border border-slate-300 font-bold text-xs">
                <option value="Select Origin">Select Origin</option>
                {STATIONS.map(s => <option key={s.code} value={s.code}>{s.city} ({s.code})</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <label className="sm:col-span-4 text-xs font-black text-slate-900">To Station*:</label>
              <select value={newJourneyTo} onChange={e => setNewJourneyTo(e.target.value)} className="sm:col-span-8 bg-white p-2.5 rounded-xl border border-slate-300 font-bold text-xs">
                <option value="Select Destination">Select Destination</option>
                {STATIONS.map(s => <option key={s.code} value={s.code}>{s.city} ({s.code})</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <label className="sm:col-span-4 text-xs font-black text-slate-900">Quota*:</label>
              <select value={newJourneyQuota} onChange={e => setNewJourneyQuota(e.target.value)} className="sm:col-span-8 bg-white p-2.5 rounded-xl border border-slate-300 font-bold text-xs">
                <option value="GENERAL">Select Quota</option>
                <option value="GENERAL">GENERAL</option>
                <option value="TATKAL">TATKAL</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" className="px-8 py-2.5 rounded-2xl bg-[#283593] text-white font-black text-xs shadow-md uppercase">SAVE</button>
              <button type="reset" onClick={() => setNewJourneyTrain('')} className="px-8 py-2.5 rounded-2xl bg-white border border-slate-300 font-black text-xs shadow-xs">Reset</button>
            </div>
          </form>

          {/* FAVOURITE JOURNEY LIST */}
          <div className="bg-white/80 backdrop-blur-xs rounded-3xl border border-slate-300 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-sm font-black text-[#000066] uppercase">FAVOURITE JOURNEY LIST</h2>
              <div className="w-6 h-6 rounded bg-orange-500 text-white flex items-center justify-center font-bold text-sm">+</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {favJourneys.map((fj) => (
                <div key={fj.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-slate-900 text-xs">{fj.trainNo}</span>
                    <button type="button" onClick={() => setFavJourneys(favJourneys.filter(f => f.id !== fj.id))} className="text-slate-400 hover:text-rose-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs font-black text-slate-900">
                    <div><span className="block text-[10px] text-slate-400">{fj.fromCode}</span><span>{fj.fromCity}</span></div>
                    <span>➔</span>
                    <div><span className="block text-[10px] text-slate-400">{fj.toCode}</span><span>{fj.toCity}</span></div>
                  </div>

                  <div className="flex justify-between text-[10px] font-bold text-slate-500 pt-2 border-t border-slate-200">
                    <div><span>Class</span><strong className="block text-slate-800">{fj.classCode}</strong></div>
                    <div><span>Quota</span><strong className="block text-slate-800">{fj.quota}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 6: BOOKED TICKET HISTORY */}
      {activeSubTab === 'bookings' && (
        <BookedTicketHistoryPage
          onBack={() => setActiveSubTab('profile')}
          onViewTicket={onViewTicket}
          userBookings={userBookings}
        />
      )}

    </div>
  );
}
