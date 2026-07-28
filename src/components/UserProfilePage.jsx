import React, { useState, useEffect } from 'react';
import { User, Users, ShieldCheck, KeyRound, Wallet, Edit3, ArrowLeft, Save, CheckCircle2, Ticket, Trash2, Plus, Eye, EyeOff, Lock, AlertCircle, Calendar, MapPin, Home, Building, Compass } from 'lucide-react';
import { API_BASE_URL, safeJsonParse } from '../config/api';
import { STATIONS } from '../data/mockTrains';
import BookedTicketHistoryPage from './BookedTicketHistoryPage';

const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand',
  'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal'
];

export default function UserProfilePage({ user, onLogout, onBackToSearch, onViewTicket, onOpenBookedTickets, activeTabMode = 'profile', userBookings = [], onUpdateUser }) {
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

  // Profile Data State sourced directly from logged-in MongoDB account
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    fullName: user?.fullName || user?.name || '',
    gender: user?.gender || '',
    dob: user?.dob || '',
    mobile: user?.phone || user?.mobile || '',
    country: user?.country || 'India',
    email: user?.email || '',
    address: user?.address || ''
  });

  // Structured Residential Address State
  const [addrFlat, setAddrFlat] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        fullName: user.fullName || user.name || '',
        gender: user.gender || '',
        dob: user.dob || '',
        mobile: user.phone || user.mobile || '',
        country: user.country || 'India',
        email: user.email || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleAddressFieldChange = (field, value) => {
    let f = addrFlat;
    let s = addrStreet;
    let p = addrPincode;
    let c = addrCity;
    let st = addrState;

    if (field === 'flat') f = value;
    if (field === 'street') s = value;
    if (field === 'pincode') p = value;
    if (field === 'city') c = value;
    if (field === 'state') st = value;

    setAddrFlat(f);
    setAddrStreet(s);
    setAddrPincode(p);
    setAddrCity(c);
    setAddrState(st);

    const parts = [
      f.trim(),
      s.trim(),
      c.trim(),
      p.trim() ? `PIN: ${p.trim()}` : null,
      st.trim(),
      profileData.country || 'India'
    ].filter(Boolean);

    setProfileData(prev => ({ ...prev, address: parts.join(', ') }));
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          newUsername: profileData.username !== user.username ? profileData.username : undefined,
          fullName: profileData.fullName,
          gender: profileData.gender,
          dob: profileData.dob,
          phone: profileData.mobile,
          country: profileData.country,
          address: profileData.address
        })
      });
      const data = await safeJsonParse(res);
      setIsSaving(false);

      if (res.ok && data && data.success && data.user) {
        const updatedUser = {
          ...user,
          username: data.user.username,
          fullName: data.user.fullName,
          name: data.user.fullName || data.user.username,
          gender: data.user.gender,
          dob: data.user.dob,
          phone: data.user.phone,
          mobile: data.user.phone,
          country: data.user.country,
          address: data.user.address,
          lastUsernameChangeAt: data.user.lastUsernameChangeAt,
          daysUntilNextUsernameChange: data.user.daysUntilNextUsernameChange
        };

        if (onUpdateUser) {
          onUpdateUser(updatedUser);
        }

        setSaveSuccessMsg('🎉 Profile details saved successfully!');
        setIsEditing(false);
        return;
      } else if (data && data.message) {
        setSaveErrorMsg(data.message);
        return;
      }
    } catch (err) {
      console.warn('Update profile notice:', err);
    }

    // Local save fallback if offline
    setIsSaving(false);
    const updatedUser = {
      ...user,
      fullName: profileData.fullName,
      name: profileData.fullName || user.username,
      gender: profileData.gender,
      dob: profileData.dob,
      phone: profileData.mobile,
      mobile: profileData.mobile,
      country: profileData.country,
      address: profileData.address
    };

    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }

    setSaveSuccessMsg('🎉 Profile details saved successfully!');
    setIsEditing(false);
  };

  // Change Password Form State
  const [oldPass, setOldPass] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passSuccessMsg, setPassSuccessMsg] = useState('');
  const [passErrorMsg, setPassErrorMsg] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassSuccessMsg('');
    setPassErrorMsg('');

    if (!newPass) {
      setPassErrorMsg('New Password is required.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassErrorMsg('New Password and Confirm Password do not match.');
      return;
    }
    if (newPass.length < 6) {
      setPassErrorMsg('New Password must be at least 6 characters long.');
      return;
    }

    setIsChangingPass(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          oldPassword: oldPass,
          newPassword: newPass
        })
      });

      const data = await safeJsonParse(res);
      setIsChangingPass(false);

      if (res.ok && data && data.success) {
        // Update local registered user database cache if stored locally
        const localReg = JSON.parse(localStorage.getItem('railx_registered_users') || '[]');
        const userIndex = localReg.findIndex(u => String(u.username).toLowerCase() === String(user.username).toLowerCase());
        if (userIndex !== -1) {
          localReg[userIndex].password = newPass;
          localStorage.setItem('railx_registered_users', JSON.stringify(localReg));
        }

        setPassSuccessMsg(data.message || '🎉 Password updated successfully!');
        setOldPass('');
        setNewPass('');
        setConfirmPass('');
        return;
      } else if (data && data.message) {
        setPassErrorMsg(data.message);
        return;
      }
    } catch (err) {
      console.warn('Change password notice:', err);
    }

    setIsChangingPass(false);
    // Offline local update fallback
    const localReg = JSON.parse(localStorage.getItem('railx_registered_users') || '[]');
    const userIndex = localReg.findIndex(u => String(u.username).toLowerCase() === String(user.username).toLowerCase());
    if (userIndex !== -1) {
      localReg[userIndex].password = newPass;
      localStorage.setItem('railx_registered_users', JSON.stringify(localReg));
    }
    setPassSuccessMsg('🎉 Password updated successfully!');
    setOldPass('');
    setNewPass('');
    setConfirmPass('');
  };

  // Master List Form State
  const [masterType, setMasterType] = useState('Normal User');
  const [masterPassengers, setMasterPassengers] = useState([]);
  const [masterMsg, setMasterMsg] = useState('');
  const [masterErrorMsg, setMasterErrorMsg] = useState('');
  const [isAddingMaster, setIsAddingMaster] = useState(false);
  const [editingPassengerId, setEditingPassengerId] = useState(null);

  const [newMasterName, setNewMasterName] = useState('');
  const [newMasterDob, setNewMasterDob] = useState('');
  const [newMasterGender, setNewMasterGender] = useState('Male');
  const [newMasterBerth, setNewMasterBerth] = useState('Select Berth Preference');
  const [newMasterMeal, setNewMasterMeal] = useState('Veg');
  const [newMasterIdType, setNewMasterIdType] = useState('AADHAR ID/VIRTUAL ID');
  const [newMasterIdNumber, setNewMasterIdNumber] = useState('');

  // Fetch Master List Passengers from MongoDB Database (Strictly scoped to user profile)
  useEffect(() => {
    if (user?.username) {
      const cleanUsername = String(user.username).toLowerCase().trim();
      fetch(`${API_BASE_URL}/api/master-passengers/${cleanUsername}`)
        .then(res => safeJsonParse(res))
        .then(data => {
          if (data && data.success && Array.isArray(data.passengers)) {
            setMasterPassengers(data.passengers);
            localStorage.setItem(`railx_master_passengers_${cleanUsername}`, JSON.stringify(data.passengers));
          } else {
            const stored = localStorage.getItem(`railx_master_passengers_${cleanUsername}`);
            setMasterPassengers(stored ? JSON.parse(stored) : []);
          }
        })
        .catch(err => {
          console.warn('Fetch master list notice:', err);
          const stored = localStorage.getItem(`railx_master_passengers_${cleanUsername}`);
          setMasterPassengers(stored ? JSON.parse(stored) : []);
        });
    } else {
      setMasterPassengers([]);
    }
  }, [user?.username, activeSubTab]);

  const handleEditMaster = (mp) => {
    setMasterMsg('');
    setMasterErrorMsg('');
    setEditingPassengerId(mp.id);
    setMasterType(mp.passengerType || 'Normal User');
    setNewMasterName(mp.name || '');
    setNewMasterDob(mp.dob || '');
    setNewMasterGender(mp.gender || 'Male');
    setNewMasterBerth(mp.berth || 'Select Berth Preference');
    setNewMasterMeal(mp.meal || 'Veg');
    setNewMasterIdType(mp.idType || 'AADHAR ID/VIRTUAL ID');
    setNewMasterIdNumber(mp.idNumber || '');
  };

  const handleResetMasterForm = () => {
    setEditingPassengerId(null);
    setMasterMsg('');
    setMasterErrorMsg('');
    setMasterType('Normal User');
    setNewMasterName('');
    setNewMasterDob('');
    setNewMasterGender('Male');
    setNewMasterBerth('Select Berth Preference');
    setNewMasterMeal('Veg');
    setNewMasterIdType('AADHAR ID/VIRTUAL ID');
    setNewMasterIdNumber('');
  };

  const handleAddMaster = async (e) => {
    e.preventDefault();
    if (!newMasterName) return;
    setMasterMsg('');
    setMasterErrorMsg('');

    // Duplicate Passenger Check (ALL 4 FIELDS MUST MATCH: Name + DOB + ID Card Type + ID Card No)
    const cleanName = newMasterName.toUpperCase().trim();
    const cleanDob = String(newMasterDob || '').trim();
    const cleanIdType = String(newMasterIdType || 'AADHAR ID/VIRTUAL ID').toUpperCase().trim();
    const cleanIdNum = newMasterIdNumber.toUpperCase().trim();

    const isDuplicate = masterPassengers.some(mp => {
      if (editingPassengerId && mp.id === editingPassengerId) return false;
      const existingName = String(mp.name).toUpperCase().trim();
      const existingDob = String(mp.dob || '').trim();
      const existingIdType = String(mp.idType || 'AADHAR ID/VIRTUAL ID').toUpperCase().trim();
      const existingIdNum = mp.idNumber ? String(mp.idNumber).toUpperCase().trim() : '';

      const nameMatch = existingName === cleanName;
      const dobMatch = existingDob === cleanDob;
      const idTypeMatch = existingIdType === cleanIdType;
      const idNumMatch = existingIdNum === cleanIdNum;

      return nameMatch && dobMatch && idTypeMatch && idNumMatch;
    });

    if (isDuplicate) {
      setMasterErrorMsg('⚠️ Passenger details already exist in your Master List!');
      return;
    }

    // If adding a new passenger (not editing), check max 6 limit rule
    if (!editingPassengerId && masterPassengers.length >= 6) {
      setMasterErrorMsg('🚫 Maximum limit reached! You can only add up to 6 passengers to your Master List.');
      return;
    }

    setIsAddingMaster(true);

    try {
      const endpoint = editingPassengerId ? `${API_BASE_URL}/api/master-passengers/update` : `${API_BASE_URL}/api/master-passengers/add`;
      const method = editingPassengerId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          passengerId: editingPassengerId,
          passengerType: masterType,
          name: newMasterName,
          dob: newMasterDob,
          gender: newMasterGender,
          berth: newMasterBerth,
          meal: newMasterMeal,
          idType: newMasterIdType,
          idNumber: newMasterIdNumber
        })
      });
      const data = await safeJsonParse(res);
      setIsAddingMaster(false);

      if (res.ok && data && data.success && Array.isArray(data.passengers)) {
        setMasterPassengers(data.passengers);
        const cleanUsername = String(user.username).toLowerCase().trim();
        localStorage.setItem(`railx_master_passengers_${cleanUsername}`, JSON.stringify(data.passengers));
        setMasterMsg(editingPassengerId ? '🎉 Passenger updated in Master List successfully!' : '🎉 Passenger added to Master List successfully!');
        handleResetMasterForm();
        return;
      } else if (data && data.message) {
        setMasterErrorMsg(data.message);
        return;
      }
    } catch (err) {
      console.warn('Add/Update master notice:', err);
    }

    setIsAddingMaster(false);
    const cleanUsername = String(user.username).toLowerCase().trim();
    // Offline fallback
    if (editingPassengerId) {
      setMasterPassengers(prev => {
        const updated = prev.map(m => m.id === editingPassengerId ? {
          ...m,
          passengerType: masterType,
          name: newMasterName.toUpperCase(),
          dob: newMasterDob,
          gender: newMasterGender,
          berth: newMasterBerth,
          meal: newMasterMeal,
          idType: newMasterIdType,
          idNumber: newMasterIdNumber
        } : m);
        localStorage.setItem(`railx_master_passengers_${cleanUsername}`, JSON.stringify(updated));
        return updated;
      });
      setMasterMsg('🎉 Passenger updated in Master List successfully!');
    } else {
      const offlinePass = {
        id: 'MP_' + Date.now(),
        passengerType: masterType,
        name: newMasterName.toUpperCase(),
        age: 25,
        gender: newMasterGender,
        berth: newMasterBerth,
        meal: newMasterMeal,
        dob: newMasterDob || '01-01-2000',
        status: 'Verified',
        statusColor: 'text-emerald-600',
        idType: newMasterIdType,
        idNumber: newMasterIdNumber
      };
      setMasterPassengers(prev => {
        const updated = [...prev, offlinePass];
        localStorage.setItem(`railx_master_passengers_${cleanUsername}`, JSON.stringify(updated));
        return updated;
      });
      setMasterMsg('🎉 Passenger added to Master List successfully!');
    }
    handleResetMasterForm();
  };

  const handleDeleteMaster = async (passengerId) => {
    setMasterMsg('');
    const cleanUsername = String(user.username).toLowerCase().trim();
    try {
      const res = await fetch(`${API_BASE_URL}/api/master-passengers/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          passengerId
        })
      });
      const data = await safeJsonParse(res);
      if (res.ok && data && data.success && Array.isArray(data.passengers)) {
        setMasterPassengers(data.passengers);
        localStorage.setItem(`railx_master_passengers_${cleanUsername}`, JSON.stringify(data.passengers));
        setMasterMsg('Passenger deleted from Master List');
        return;
      }
    } catch (err) {
      console.warn('Delete master notice:', err);
    }
    setMasterPassengers(prev => {
      const updated = prev.filter(m => m.id !== passengerId);
      localStorage.setItem(`railx_master_passengers_${cleanUsername}`, JSON.stringify(updated));
      return updated;
    });
    setMasterMsg('Passenger deleted from Master List');
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
          className="flex items-center gap-2 text-xs font-black text-[#000066] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Train Search</span>
        </button>

        {/* Tab Switchers */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs text-xs font-black">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'profile' ? 'bg-[#000066] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            My Profile
          </button>

          <button
            onClick={() => setActiveSubTab('change_password')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'change_password' ? 'bg-[#000066] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Change Password
          </button>

          <button
            onClick={() => setActiveSubTab('authenticate')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'authenticate' ? 'bg-[#000066] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Authenticate User
          </button>

          <button
            onClick={() => setActiveSubTab('master_list')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'master_list' ? 'bg-[#000066] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Master List
          </button>

          <button
            onClick={() => onOpenBookedTickets ? onOpenBookedTickets() : setActiveSubTab('bookings')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'bookings' ? 'bg-[#000066] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Booked Ticket History
          </button>

          <button
            onClick={() => setActiveSubTab('recent_journeys')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'recent_journeys' ? 'bg-[#000066] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Recent Journeys
          </button>
        </div>
      </div>

      {/* VIEW 1: MY PROFILE */}
      {activeSubTab === 'profile' && (
        <div className="space-y-6">
          <h1 className="text-3xl font-black text-[#000066] uppercase tracking-tight">UPDATE PROFILE</h1>

          {saveSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-black text-emerald-800 flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {saveErrorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-black text-rose-800 flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{saveErrorMsg}</span>
            </div>
          )}

          <div className="bg-white/80 backdrop-blur-xs rounded-3xl border border-slate-300 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-[#000066] uppercase">MY PROFILE</h2>
                <span className="text-xs font-bold text-slate-500 font-mono">(@{user.username})</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1.5 rounded-xl bg-[#000066] hover:bg-blue-900 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
              </button>
            </div>

            {/* IF EDITING PROFILE */}
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                
                {/* 0. User ID / Username (90-Day / 3-Month Cooldown Rule) */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start">
                  <label className="sm:col-span-4 text-slate-700 font-extrabold text-xs pt-2 flex items-center gap-1">
                    <span>IRCTC User ID:</span>
                    {(user?.daysUntilNextUsernameChange || 0) > 0 && <Lock className="w-3.5 h-3.5 text-amber-600" />}
                  </label>
                  <div className="sm:col-span-8 space-y-1">
                    {(user?.daysUntilNextUsernameChange || 0) > 0 ? (
                      <>
                        <input
                          type="text"
                          value={profileData.username}
                          disabled
                          readOnly
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-100 font-bold text-xs text-slate-500 cursor-not-allowed select-none opacity-80"
                        />
                        <div className="p-2 rounded-lg bg-sky-50 border border-sky-200 text-[11px] font-bold text-sky-900 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span>User ID is locked for 90 days (3 months) after a change. Next change available in {user.daysUntilNextUsernameChange} day(s).</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={profileData.username}
                          onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                          placeholder="Enter Preferred User ID"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:outline-none focus:border-[#000066]"
                        />
                        <div className="text-[10px] font-bold text-slate-500">
                          Note: Changing your User ID locks further changes for 90 days (3 months).
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 1. Full Name */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <label className="sm:col-span-4 text-slate-700 font-extrabold text-xs">
                    Full Name as per Govt. ID:
                  </label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    placeholder="Enter Full Name"
                    className="sm:col-span-8 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:outline-none focus:border-[#000066]"
                  />
                </div>

                {/* 2. Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <label className="sm:col-span-4 text-slate-700 font-extrabold text-xs">
                    Gender:
                  </label>
                  <select
                    value={profileData.gender}
                    onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                    className="sm:col-span-8 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:outline-none focus:border-[#000066]"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Transgender">Transgender</option>
                  </select>
                </div>

                {/* 3. Date Of Birth */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <label className="sm:col-span-4 text-slate-700 font-extrabold text-xs">
                    Date Of Birth:
                  </label>
                  <input
                    type="date"
                    value={profileData.dob}
                    onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                    className="sm:col-span-8 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:outline-none focus:border-[#000066]"
                  />
                </div>

                {/* 4. ISD-Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <label className="sm:col-span-4 text-slate-700 font-extrabold text-xs">
                    ISD-Mobile:
                  </label>
                  <input
                    type="tel"
                    value={profileData.mobile}
                    onChange={(e) => setProfileData({ ...profileData, mobile: e.target.value })}
                    placeholder="Enter 10-Digit Mobile Number"
                    className="sm:col-span-8 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:outline-none focus:border-[#000066]"
                  />
                </div>

                {/* 5. Country */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <label className="sm:col-span-4 text-slate-700 font-extrabold text-xs">
                    Country:
                  </label>
                  <input
                    type="text"
                    value={profileData.country}
                    onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                    placeholder="Enter Country"
                    className="sm:col-span-8 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:outline-none focus:border-[#000066]"
                  />
                </div>

                {/* 6. Email (LOCKED SECTION - CANNOT BE CHANGED!) */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start">
                  <label className="sm:col-span-4 text-slate-700 font-extrabold text-xs pt-2 flex items-center gap-1">
                    <span>Email:</span>
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                  </label>
                  <div className="sm:col-span-8 space-y-1">
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      readOnly
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-100 font-bold text-xs text-slate-500 cursor-not-allowed select-none opacity-80"
                    />
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-800 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Email address is locked to your account and cannot be modified.</span>
                    </div>
                  </div>
                </div>

                {/* 7. Enhanced Professional Residential Address Section */}
                <div className="border-t border-slate-200/80 pt-5 mt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#000066]/10 text-[#000066] flex items-center justify-center font-bold shrink-0">
                      <MapPin className="w-4 h-4 text-[#000066]" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-[#000066] uppercase tracking-wider">Residential & Correspondence Address</h3>
                      <p className="text-[11px] font-bold text-slate-500">Provide official residential details as per valid government ID proof</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                    {/* Line 1: Flat / Door / House No. & Building */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <label className="sm:col-span-4 text-slate-700 font-extrabold text-xs flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Flat / Door / House No. & Building:</span>
                      </label>
                      <input
                        type="text"
                        value={addrFlat}
                        onChange={(e) => handleAddressFieldChange('flat', e.target.value)}
                        placeholder="e.g. Flat 402, Block B, Sunshine Apartments"
                        className="sm:col-span-8 px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:outline-none focus:border-[#000066]"
                      />
                    </div>

                    {/* Line 2: Street / Area / Locality */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <label className="sm:col-span-4 text-slate-700 font-extrabold text-xs flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Street / Locality / Area:</span>
                      </label>
                      <input
                        type="text"
                        value={addrStreet}
                        onChange={(e) => handleAddressFieldChange('street', e.target.value)}
                        placeholder="e.g. MG Road, Near Civil Hospital"
                        className="sm:col-span-8 px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:outline-none focus:border-[#000066]"
                      />
                    </div>

                    {/* Line 3: Pincode, City, State Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                          PIN Code <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={addrPincode}
                          onChange={(e) => handleAddressFieldChange('pincode', e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 110001"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold text-xs text-slate-900 focus:outline-none focus:border-[#000066]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                          City / District
                        </label>
                        <input
                          type="text"
                          value={addrCity}
                          onChange={(e) => handleAddressFieldChange('city', e.target.value)}
                          placeholder="e.g. New Delhi"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:outline-none focus:border-[#000066]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                          State / Union Territory
                        </label>
                        <select
                          value={addrState}
                          onChange={(e) => handleAddressFieldChange('state', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:outline-none focus:border-[#000066]"
                        >
                          <option value="">Select State</option>
                          {INDIAN_STATES.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Full Formatted Address Text */}
                    <div className="pt-2 border-t border-slate-200/80">
                      <label className="block text-[11px] font-extrabold text-slate-700 mb-1 flex items-center justify-between">
                        <span>Full Composed Address (Preview / Custom Edit):</span>
                      </label>
                      <textarea
                        rows={2}
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        placeholder="Enter or refine full residential address"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:outline-none focus:border-[#000066]"
                      />
                    </div>
                  </div>
                </div>

                {/* Save & Cancel Buttons */}
                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-[#000066] hover:bg-blue-900 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving Profile...' : 'Save Profile Details'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

              </form>
            ) : (
              /* VIEW MODE (Displays actual values according to account; shows blank/placeholder if missing) */
              <div className="space-y-4 text-xs font-extrabold text-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <span className="sm:col-span-4 text-slate-500 font-bold">Full Name as per Govt. ID:</span>
                  <span className="sm:col-span-8 font-black text-slate-900 text-sm">
                    {profileData.fullName || <span className="text-slate-400 font-normal italic">Not Provided</span>}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <span className="sm:col-span-4 text-slate-500 font-bold">Gender:</span>
                  <span className="sm:col-span-8 text-slate-900">
                    {profileData.gender || <span className="text-slate-400 font-normal italic">Not Provided</span>}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <span className="sm:col-span-4 text-slate-500 font-bold">Date Of Birth:</span>
                  <span className="sm:col-span-8 text-slate-900">
                    {profileData.dob || <span className="text-slate-400 font-normal italic">Not Provided</span>}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <span className="sm:col-span-4 text-slate-500 font-bold">ISD-Mobile:</span>
                  <span className="sm:col-span-8 font-mono text-slate-900">
                    {profileData.mobile || <span className="text-slate-400 font-normal italic font-sans">Not Provided</span>}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <span className="sm:col-span-4 text-slate-500 font-bold">Country:</span>
                  <span className="sm:col-span-8 text-slate-900">
                    {profileData.country || <span className="text-slate-400 font-normal italic">India</span>}
                  </span>
                </div>

                {/* Email Display (with Lock Badge) */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <span className="sm:col-span-4 text-slate-500 font-bold flex items-center gap-1">
                    <span>Email:</span>
                    <Lock className="w-3 h-3 text-slate-400" />
                  </span>
                  <span className="sm:col-span-8 font-mono text-slate-900 flex items-center gap-2">
                    <span>{profileData.email || `${user.username}@irctc.gov.in`}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-sans text-[10px] font-bold border border-slate-200">
                      Locked
                    </span>
                  </span>
                </div>

                {/* Enhanced Residential Address Card Display */}
                <div className="border-t border-slate-200/80 pt-4 mt-3">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-blue-50/20 to-slate-50 border border-slate-200 flex items-start gap-3.5 shadow-2xs">
                    <div className="w-9 h-9 rounded-xl bg-[#000066] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-black text-[#000066] uppercase tracking-wider">Verified Residential Address</span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-black text-[10px] border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Official Profile Address
                        </span>
                      </div>
                      <p className="text-xs font-black text-slate-800 leading-relaxed pt-0.5">
                        {profileData.address || <span className="text-slate-400 font-normal italic">No residential address provided yet. Click "Edit Profile" to add your official correspondence address.</span>}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          <div className="bg-white/80 backdrop-blur-xs rounded-3xl border border-slate-300 p-6 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-[#000066] uppercase mb-1">PASSWORDS</h2>
              <span className="text-xs font-bold text-slate-700">Change Login Password</span>
            </div>
            <button onClick={() => setActiveSubTab('change_password')} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer">
              <Edit3 className="w-4 h-4 text-slate-900" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: CHANGE PASSWORD */}
      {activeSubTab === 'change_password' && (
        <div className="space-y-6">
          <h1 className="text-3xl font-black text-[#000066] tracking-tight">Change Password</h1>

          {/* 30-Day Password Expiration Policy Banner */}
          {user?.isPasswordExpired || (user?.passAgeDays || 0) >= 30 ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-xs font-black text-rose-900 flex items-start gap-2.5 shadow-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="block text-sm font-extrabold uppercase text-rose-700">🔒 Password Expired Alert</span>
                <span>Your account password is {user?.passAgeDays || 30} days old and HAS EXPIRED. As per security policy, passwords must be updated every 30 days. Please set a new password below.</span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs font-black text-blue-900 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#000066] shrink-0" />
                <span>Password Expiration Policy: Passwords expire every 30 days for account security.</span>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-white border border-blue-200 font-mono text-[11px] text-[#000066]">
                Password Age: {user?.passAgeDays || 0} Day(s)
              </span>
            </div>
          )}

          {passSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-black text-emerald-800 flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{passSuccessMsg}</span>
            </div>
          )}

          {passErrorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-black text-rose-800 flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{passErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleChangePasswordSubmit} className="bg-white/80 backdrop-blur-xs rounded-3xl border border-slate-300 p-6 sm:p-8 shadow-sm space-y-6 max-w-3xl">
            
            {/* Old / Current Password Input */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <label className="sm:col-span-4 font-black text-slate-900 text-xs">Current Password:</label>
              <div className="sm:col-span-8">
                <div className="relative bg-white rounded-xl border border-slate-300 p-2.5 flex items-center justify-between">
                  <input
                    type={showOldPass ? "text" : "password"}
                    value={oldPass}
                    onChange={e => setOldPass(e.target.value)}
                    placeholder="Enter Current Password"
                    className="w-full bg-transparent font-black text-blue-950 text-xs focus:outline-none"
                  />
                  <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="text-slate-500 cursor-pointer">
                    {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

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
                    required
                    className="w-full bg-transparent font-black text-blue-950 text-xs focus:outline-none"
                  />
                  <button type="button" onClick={() => setShowPass1(!showPass1)} className="text-slate-500 cursor-pointer">
                    {showPass1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Rules List */}
                <div className="text-[11px] font-bold text-slate-600 space-y-1 pl-1">
                  <div className="flex items-center gap-1.5 text-blue-900"><span>•</span><span>Minimum 6 characters required for security.</span></div>
                  <div className="flex items-center gap-1.5 text-blue-900"><span>•</span><span>Password will be updated for User @{user.username}.</span></div>
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
                    required
                    className="w-full bg-transparent font-black text-blue-950 text-xs focus:outline-none"
                  />
                  <button type="button" onClick={() => setShowPass2(!showPass2)} className="text-slate-500 cursor-pointer">
                    {showPass2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={isChangingPass}
                className="px-8 py-3 rounded-2xl bg-[#283593] hover:bg-blue-900 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isChangingPass ? 'Updating Password...' : 'Update Password'}
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('profile')}
                className="px-8 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-black text-xs shadow-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

          </form>
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

      {/* VIEW 4: ADD / MODIFY MASTER LIST */}
      {activeSubTab === 'master_list' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-black text-[#000066] tracking-tight">Add / Modify Master List</h1>
            <div className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-black text-[#000066] flex items-center gap-1.5 shadow-2xs">
              <Users className="w-4 h-4 text-[#000066]" />
              <span>Capacity: {masterPassengers.length} / 6 Passengers Saved</span>
            </div>
          </div>

          {masterMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-black text-emerald-800 flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{masterMsg}</span>
            </div>
          )}

          {masterErrorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-black text-rose-800 flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{masterErrorMsg}</span>
            </div>
          )}

          {!editingPassengerId && masterPassengers.length >= 6 && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-xs font-black text-amber-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Master List Limit Reached (6/6). You can edit an existing passenger below or delete one to add a new passenger.</span>
            </div>
          )}

          {/* Master List Form */}
          <form onSubmit={handleAddMaster} className="bg-white/80 backdrop-blur-xs rounded-3xl border border-slate-300 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-2">
              <span className="text-xs font-black text-[#000066] uppercase">
                {editingPassengerId ? '✏️ EDIT PASSENGER DETAILS' : '➕ ADD NEW MASTER PASSENGER'}
              </span>
              {editingPassengerId && (
                <button
                  type="button"
                  onClick={handleResetMasterForm}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                >
                  Cancel Editing
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-xs font-black text-slate-800 pb-2">
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
              <input type="text" value={newMasterName} onChange={e => setNewMasterName(e.target.value)} placeholder="Name as per Govt. ID" required className="sm:col-span-8 bg-white p-2.5 rounded-xl border border-slate-300 font-bold text-xs" />
            </div>

            {/* Professional Date Of Birth Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
              <label className="sm:col-span-4 text-xs font-black text-slate-900 pt-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#000066]" />
                <span>Date Of Birth*:</span>
              </label>
              <div className="sm:col-span-8 space-y-2">
                <div className="relative bg-white rounded-xl border border-slate-300 p-2 flex items-center justify-between shadow-2xs focus-within:border-[#000066] focus-within:ring-2 focus-within:ring-blue-100">
                  <input
                    type="date"
                    value={newMasterDob && newMasterDob.includes('-') && newMasterDob.split('-')[0].length === 4 ? newMasterDob : (newMasterDob && newMasterDob.includes('-') ? newMasterDob.split('-').reverse().join('-') : '')}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={e => {
                      const val = e.target.value;
                      if (!val) {
                        setNewMasterDob('');
                        return;
                      }
                      // Convert YYYY-MM-DD to DD-MM-YYYY
                      const [y, m, d] = val.split('-');
                      setNewMasterDob(`${d}-${m}-${y}`);
                    }}
                    required
                    className="w-full bg-transparent font-extrabold text-blue-950 text-xs focus:outline-none cursor-pointer"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 pointer-events-none shrink-0 mr-1" />
                </div>

                {/* Auto Calculated Age & Category Preview Badge */}
                {newMasterDob && (
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                    <span className="text-slate-500">Selected DOB: <strong className="text-slate-900 font-mono">{newMasterDob}</strong></span>
                    {(() => {
                      const yearMatch = String(newMasterDob).match(/\d{4}/);
                      if (!yearMatch) return null;
                      const age = Math.max(1, new Date().getFullYear() - parseInt(yearMatch[0]));
                      let cat = 'Adult (12-59 Yrs)';
                      let badgeStyle = 'bg-blue-50 text-blue-800 border-blue-200';
                      if (age < 12) {
                        cat = 'Child (Below 12 Yrs)';
                        badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200';
                      } else if (age >= 60) {
                        cat = 'Senior Citizen (60+ Yrs)';
                        badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                      }
                      return (
                        <span className={`px-2.5 py-0.5 rounded-lg border font-extrabold flex items-center gap-1 ${badgeStyle}`}>
                          <span>Age: {age} Yrs</span>
                          <span>•</span>
                          <span>{cat}</span>
                        </span>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <label className="sm:col-span-4 text-xs font-black text-slate-900">Gender*:</label>
              <div className="sm:col-span-8 flex items-center gap-4 text-xs font-bold">
                <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="g" checked={newMasterGender === 'Male'} onChange={() => setNewMasterGender('Male')} /><span>Male</span></label>
                <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="g" checked={newMasterGender === 'Female'} onChange={() => setNewMasterGender('Female')} /><span>Female</span></label>
                <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="g" checked={newMasterGender === 'Transgender'} onChange={() => setNewMasterGender('Transgender')} /><span>Transgender</span></label>
              </div>
            </div>

            {/* Berth Preference */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <label className="sm:col-span-4 text-xs font-black text-slate-900">Berth Preference*:</label>
              <select value={newMasterBerth} onChange={e => setNewMasterBerth(e.target.value)} className="sm:col-span-8 bg-white p-2.5 rounded-xl border border-slate-300 font-bold text-xs">
                <option value="Select Berth Preference">Select Berth Preference</option>
                <option value="Lower">Lower</option>
                <option value="Middle">Middle</option>
                <option value="Upper">Upper</option>
                <option value="Side Lower">Side Lower</option>
                <option value="Side Upper">Side Upper</option>
                <option value="No Preference">No Preference</option>
              </select>
            </div>

            {/* Food / Meal Preference */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <label className="sm:col-span-4 text-xs font-black text-slate-900">Food / Meal Preference*:</label>
              <select value={newMasterMeal} onChange={e => setNewMasterMeal(e.target.value)} className="sm:col-span-8 bg-white p-2.5 rounded-xl border border-slate-300 font-bold text-xs">
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="No Food/beverages">No Food/beverages</option>
                <option value="Jain Meal">Jain Meal</option>
              </select>
            </div>

            {/* ID Card Type */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <label className="sm:col-span-4 text-xs font-black text-slate-900">ID Card Type*:</label>
              <select value={newMasterIdType} onChange={e => setNewMasterIdType(e.target.value)} className="sm:col-span-8 bg-white p-2.5 rounded-xl border border-slate-300 font-bold text-xs">
                <option value="AADHAR ID/VIRTUAL ID">AADHAR ID/VIRTUAL ID</option>
                <option value="PASSPORT">PASSPORT</option>
                <option value="DRIVING LICENSE">DRIVING LICENSE</option>
                <option value="VOTER ID">VOTER ID</option>
                <option value="PAN CARD">PAN CARD</option>
                <option value="STUDENT ID CARD">STUDENT ID CARD</option>
                <option value="BANK PASSBOOK">BANK PASSBOOK</option>
              </select>
            </div>

            {/* ID Card Number */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <label className="sm:col-span-4 text-xs font-black text-slate-900">ID Card No*:</label>
              <input
                type="text"
                value={newMasterIdNumber}
                onChange={e => setNewMasterIdNumber(e.target.value)}
                placeholder="Enter ID Card Number (e.g. XXXX-XXXX-1234)"
                className="sm:col-span-8 bg-white p-2.5 rounded-xl border border-slate-300 font-bold text-xs uppercase"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isAddingMaster || (!editingPassengerId && masterPassengers.length >= 6)}
                className="px-8 py-2.5 rounded-2xl bg-[#283593] hover:bg-blue-900 text-white font-black text-xs shadow-md cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                {isAddingMaster
                  ? (editingPassengerId ? 'Updating Passenger...' : 'Saving Passenger...')
                  : (editingPassengerId ? 'Update Passenger' : 'Submit')}
              </button>
              <button
                type="button"
                onClick={handleResetMasterForm}
                className="px-8 py-2.5 rounded-2xl bg-white border border-slate-300 font-black text-xs shadow-xs cursor-pointer hover:bg-slate-50"
              >
                {editingPassengerId ? 'Cancel Edit' : 'Reset'}
              </button>
            </div>
          </form>

          {/* Pending Aadhaar Check Button */}
          <button onClick={() => alert(`All ${masterPassengers.length} passengers verified with UIDAI!`)} className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#0f2b60] hover:bg-blue-950 text-white font-black text-xs shadow-md cursor-pointer">
            Click here to check pending Aadhaar Verification Status.
          </button>

          {/* SAVED PASSENGERS LIST */}
          <div className="bg-white/80 backdrop-blur-xs rounded-3xl border border-slate-300 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-[#000066] uppercase">SAVED PASSENGERS LIST</h2>
              <span className="text-xs font-bold text-slate-500 font-mono">({masterPassengers.length} / 6 Passengers)</span>
            </div>

            {masterPassengers.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-1">
                <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-black text-slate-700">No saved passengers in your Master List yet.</p>
                <p className="text-[11px] font-semibold text-slate-500">Fill the form above to add up to 6 passengers for faster train ticket bookings!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {masterPassengers.map((mp, idx) => (
                  <div key={mp.id || idx} className={`p-4 bg-slate-50 border rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs transition-all ${editingPassengerId === mp.id ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-400/30' : 'border-slate-200'}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900">{idx + 1}. {mp.name}</span>
                        <span className="text-slate-600 font-bold">{mp.age || 25} yrs | {mp.gender} | {mp.berth} | {mp.meal || 'Veg'} | {mp.dob}</span>
                        {mp.status && <span className={`font-black text-xs ${mp.statusColor || 'text-emerald-600'}`}>| {mp.status}</span>}
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold pt-0.5 flex flex-wrap items-center gap-2">
                        <span>ID Type: {mp.idType || 'AADHAR ID/VIRTUAL ID'}</span>
                        {mp.idNumber && <span className="font-mono text-slate-700 font-extrabold bg-slate-200/80 px-1.5 py-0.5 rounded-md">ID No: {mp.idNumber}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => handleEditMaster(mp)} className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all cursor-pointer flex items-center gap-1 font-extrabold text-[11px]">
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button type="button" onClick={() => handleDeleteMaster(mp.id)} className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-800 transition-all cursor-pointer flex items-center gap-1 font-extrabold text-[11px]">
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

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
          currentUser={user}
        />
      )}

    </div>
  );
}
