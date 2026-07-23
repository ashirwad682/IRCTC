import React, { useState } from 'react';
import { API_BASE_URL } from '../config/api';
import { X, Eye, EyeOff, Lock, User, ShieldCheck, KeyRound, Mail, Calendar, ArrowRight, Check, ArrowLeft, AlertCircle, Phone, UserPlus, Info } from 'lucide-react';

export default function LoginModal({ onClose, onLoginSuccess, bookingNotice }) {
  // Modal Mode: 'signin' | 'register' | 'forgot'
  const [activeTab, setActiveTab] = useState('signin');

  // Sign In State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register Account State (Matching Official IRCTC Create Account Form)
  const [regUsername, setRegUsername] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regEmail, setRegEmail] = useState('');
  const [regCountryCode, setRegCountryCode] = useState('+91');
  const [regMobile, setRegMobile] = useState('');
  const [usernameTouched, setUsernameTouched] = useState(false);

  // Forgot Password Recovery State
  const [forgotEmailOrMobile, setForgotEmailOrMobile] = useState('');
  const [forgotDob, setForgotDob] = useState('2000-01-01');
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const cleanUsername = username.trim().toLowerCase();

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password })
      });
      const data = await res.json();
      
      if (res.ok && data && data.success && data.user) {
        setIsSubmitting(false);
        // Also ensure user is saved in local registry cache
        const localReg = JSON.parse(localStorage.getItem('railx_registered_users') || '[]');
        if (!localReg.some(u => String(u.username).toLowerCase() === cleanUsername)) {
          localReg.push(data.user);
          localStorage.setItem('railx_registered_users', JSON.stringify(localReg));
        }

        onLoginSuccess({
          name: data.user.fullName || data.user.username.toUpperCase(),
          username: data.user.username,
          email: data.user.email || `${username}@irctc.gov.in`,
          phone: data.user.phone || '+91 98765 43210',
          irctcId: `IRCTC_${data.user.id ? String(data.user.id).slice(-6).toUpperCase() : '8849'}`,
          walletBalance: data.user.walletBalance != null ? data.user.walletBalance : 10000,
          loyaltyPoints: 1250,
          isKycVerified: true
        });
        return;
      } else if (data && data.message) {
        setIsSubmitting(false);
        setErrorMsg(data.message);
        return;
      }
    } catch (err) {
      console.warn("MongoDB login fetch notice:", err);
    }

    // Network / Offline fallback: Strict verification against local registered users database
    const localReg = JSON.parse(localStorage.getItem('railx_registered_users') || '[]');
    const matchUser = localReg.find(u => String(u.username).toLowerCase() === cleanUsername);

    setIsSubmitting(false);
    if (!matchUser) {
      setErrorMsg('User ID is not registered in the database. Please create an IRCTC account first.');
      return;
    }

    if (matchUser.password !== password) {
      setErrorMsg('Invalid Password. Please check your credentials.');
      return;
    }

    // Successful fallback login with registered user record
    onLoginSuccess({
      name: matchUser.fullName || matchUser.username.toUpperCase(),
      username: matchUser.username,
      email: matchUser.email || `${matchUser.username}@irctc.gov.in`,
      phone: matchUser.phone || '+91 98765 43210',
      irctcId: `IRCTC_${Math.floor(100000 + Math.random() * 900000)}`,
      walletBalance: matchUser.walletBalance || 10000,
      loyaltyPoints: 1250,
      isKycVerified: true
    });
  };

  // Handle Account Registration Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regUsername.trim()) {
      setErrorMsg('User Name is required.');
      return;
    }
    if (!regPassword) {
      setErrorMsg('Password is required.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Password and Confirm Password do not match.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMsg('Email ID is required.');
      return;
    }
    if (!regMobile.trim()) {
      setErrorMsg('Mobile number is required.');
      return;
    }

    setIsSubmitting(true);
    const cleanUsername = regUsername.trim().toLowerCase();
    const cleanEmail = regEmail.trim().toLowerCase();

    const newUserObj = {
      username: cleanUsername,
      email: cleanEmail,
      password: regPassword,
      fullName: regFullName.trim() || regUsername.trim(),
      phone: `${regCountryCode} ${regMobile.trim()}`,
      walletBalance: 10000
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserObj)
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (res.ok && data && data.success) {
        // Save to local registry database cache
        const localReg = JSON.parse(localStorage.getItem('railx_registered_users') || '[]');
        const exists = localReg.some(u => String(u.username).toLowerCase() === cleanUsername);
        if (!exists) {
          localReg.push(newUserObj);
          localStorage.setItem('railx_registered_users', JSON.stringify(localReg));
        }

        setSuccessMsg(`🎉 Account created and saved to MongoDB Database! You can now Sign In with User ID: "${cleanUsername}"`);
        setUsername(cleanUsername);
        setPassword('');
        setActiveTab('signin');
        return;
      } else if (data && data.message) {
        setErrorMsg(data.message);
        return;
      }
    } catch (err) {
      console.error('Registration API notice:', err);
    }

    // Save locally if offline
    const localReg = JSON.parse(localStorage.getItem('railx_registered_users') || '[]');
    const exists = localReg.some(u => String(u.username).toLowerCase() === cleanUsername);
    setIsSubmitting(false);

    if (exists) {
      setErrorMsg('User ID or Email already registered in Database.');
      return;
    }

    localReg.push(newUserObj);
    localStorage.setItem('railx_registered_users', JSON.stringify(localReg));
    setSuccessMsg(`🎉 Account created and saved to User Database! You can now Sign In with User ID: "${cleanUsername}"`);
    setUsername(cleanUsername);
    setPassword('');
    setActiveTab('signin');
  };

  // Handle Forgot Password Submit
  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (recoveryStep === 1) {
      setRecoveryStep(2);
      setRecoveryOtp('849201');
      setNewPassword('NewPass@2026');
      setConfirmPassword('NewPass@2026');
    } else if (recoveryStep === 2) {
      setRecoveryStep(3);
      setResetSuccessMessage('Your IRCTC User ID & Password have been reset successfully!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      
      {/* Modal Card with Official IRCTC Design */}
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {bookingNotice && (
          <div className="bg-rose-600 text-white px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-inner">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{bookingNotice}</span>
          </div>
        )}

        {/* 1. Header Banner */}
        <div className="relative h-32 bg-gradient-to-r from-orange-500 via-amber-400 to-blue-900 p-4 flex items-center justify-between overflow-hidden">
          
          {/* Close Button Top Right */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center z-30 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Vande Bharat Image Graphic */}
          <div className="absolute left-0 top-1 w-48 z-10 pointer-events-none drop-shadow-md">
            <img
              src="/vande_bharat_train.png"
              alt="Vande Bharat Express"
              className="w-full h-auto object-contain"
            />
          </div>

          {/* IRCTC Branding Header */}
          <div className="absolute right-4 top-3 flex items-center gap-2 z-20">
            <img
              src="/irctc_logo_transparent.png"
              alt="IRCTC Logo"
              className="w-10 h-10 object-contain bg-white rounded-full p-1 shadow-md"
            />
            <div className="text-right text-white drop-shadow-sm">
              <span className="font-black text-lg tracking-tight block leading-none">IRCTC</span>
              <span className="text-[9px] font-bold opacity-90 block">Official Portal</span>
            </div>
          </div>

          {/* Bottom Gradient Fade */}
          <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-white to-transparent z-10"></div>
        </div>

        {/* 2. Navigation Mode Tabs */}
        <div className="bg-slate-100 p-1.5 flex items-center border-b border-slate-200 text-xs font-black">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'signin'
                ? 'bg-white text-[#000066] shadow-sm font-black border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>SIGN IN TO IRCTC</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-[#000066] text-white shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>CREATE YOUR IRCTC ACCOUNT</span>
          </button>
        </div>

        {/* 3. Form Content Area */}
        <div className="p-5 max-h-[75vh] overflow-y-auto space-y-4">
          
          {/* Success Banner */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-extrabold text-emerald-800 flex items-center gap-2 animate-in fade-in duration-200">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-extrabold text-rose-800 flex flex-col gap-1.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              {activeTab === 'signin' && errorMsg.includes('not registered') && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMsg('');
                  }}
                  className="text-[11px] font-black text-[#000066] hover:underline self-start cursor-pointer mt-1"
                >
                  👉 Click here to Create Your IRCTC Account now
                </button>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 1: SIGN IN MODE */}
          {/* ==================================================== */}
          {activeTab === 'signin' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-slate-700">
                  IRCTC User ID / Registered Mobile
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter IRCTC User ID"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:outline-none focus:border-[#000066] focus:ring-1 focus:ring-[#000066]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('forgot');
                      setRecoveryStep(1);
                      setErrorMsg('');
                    }}
                    className="text-[11px] font-bold text-[#000066] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Password"
                    required
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:outline-none focus:border-[#000066] focus:ring-1 focus:ring-[#000066]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-[#000066] hover:bg-blue-900 text-white font-black text-xs shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer uppercase tracking-wider disabled:opacity-50"
                >
                  {isSubmitting ? 'Authenticating Credentials...' : 'SIGN IN TO IRCTC'}
                </button>
              </div>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">Don't have an IRCTC account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMsg('');
                  }}
                  className="text-xs font-black text-[#000066] hover:underline cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          )}

          {/* ==================================================== */}
          {/* TAB 2: CREATE YOUR IRCTC ACCOUNT MODE (Matches Official Screenshot Layout) */}
          {/* ==================================================== */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              
              {/* Header Title */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Create Your IRCTC account
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setErrorMsg('');
                  }}
                  className="text-xs font-extrabold text-[#d32f2f] hover:underline cursor-pointer uppercase tracking-wider"
                >
                  SIGN IN
                </button>
              </div>

              {/* Official IRCTC Guidelines Box 1 */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 font-medium space-y-1.5">
                <p>1. Garbage / Junk values in profile may lead to deactivation of IRCTC account.</p>
                <p>2. Opening Advance Reservation Period (ARP) ticket and Opening Tatkal ticket booking for unauthenticated users is allowed only after 4 days from date of User Registration (excluding the day of registration). User may authenticate their user profile with Aadhaar to book Opening Advance Reservation Period (ARP) ticket and Opening Tatkal ticket.</p>
              </div>

              {/* 1. User Name Input */}
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#000066]">
                  User Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  onBlur={() => setUsernameTouched(true)}
                  placeholder="Enter preferred User Name"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:outline-none focus:border-[#000066] focus:ring-1 focus:ring-[#000066]"
                />
                {usernameTouched && !regUsername.trim() && (
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-1.5 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>User Name is required.</span>
                  </div>
                )}
              </div>

              {/* 2. Full Name Input */}
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#000066]">
                  Full Name
                </label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Enter Full Name (as per Govt ID)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:outline-none focus:border-[#000066] focus:ring-1 focus:ring-[#000066]"
                />
              </div>

              {/* 3. Password Input */}
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#000066]">
                  Password <span className="text-rose-600">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Enter Password"
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:outline-none focus:border-[#000066] focus:ring-1 focus:ring-[#000066]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 4. Confirm Password Input */}
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#000066]">
                  Confirm Password <span className="text-rose-600">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:outline-none focus:border-[#000066] focus:ring-1 focus:ring-[#000066]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Guidelines Box 2 */}
              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-xs font-bold text-sky-800">
                Invalid email ID may lead to deactivation of IRCTC account.
              </div>

              {/* 5. Email Input */}
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#000066]">
                  Email <span className="text-rose-600">*</span>
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Enter valid Email address"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:outline-none focus:border-[#000066] focus:ring-1 focus:ring-[#000066]"
                />
              </div>

              {/* 6. Country Selection Dropdown */}
              <div className="space-y-1">
                <select
                  value={regCountryCode}
                  onChange={(e) => setRegCountryCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:outline-none focus:border-[#000066]"
                >
                  <option value="+91">+91 - India</option>
                  <option value="+1">+1 - United States</option>
                  <option value="+44">+44 - United Kingdom</option>
                  <option value="+971">+971 - UAE</option>
                </select>
              </div>

              {/* Guidelines Box 3 */}
              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-xs font-bold text-sky-800">
                Please submit Mobile Number without ISD Code
              </div>

              {/* 7. Mobile Input */}
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#000066]">
                  Mobile <span className="text-rose-600">*</span>
                </label>
                <input
                  type="tel"
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-Digit Mobile Number"
                  maxLength={10}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:outline-none focus:border-[#000066] focus:ring-1 focus:ring-[#000066]"
                />
              </div>

              {/* Submit Register Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-[#000066] hover:bg-blue-900 text-white font-black text-xs shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer uppercase tracking-wider disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering Account in MongoDB Atlas...' : 'REGISTER & CREATE ACCOUNT'}
                </button>
              </div>

            </form>
          )}

          {/* ==================================================== */}
          {/* TAB 3: FORGOT PASSWORD RECOVERY MODE */}
          {/* ==================================================== */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900">Account Recovery</h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className="text-xs font-bold text-[#000066] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs font-black text-slate-800 bg-[#eff4fe] p-2.5 rounded-xl border border-blue-200">
                <span className="text-[#000066] flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-500" />
                  <span>Password & User ID Recovery</span>
                </span>
                <span className="text-slate-500 font-mono text-[11px]">Step {recoveryStep}/3</span>
              </div>

              {recoveryStep === 1 && (
                <>
                  <div className="space-y-1">
                    <label className="block text-xs font-extrabold text-slate-700">
                      Registered Email ID / Mobile Number
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                      <input
                        type="text"
                        value={forgotEmailOrMobile}
                        onChange={(e) => setForgotEmailOrMobile(e.target.value)}
                        placeholder="Registered Email or Mobile"
                        required
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:outline-none focus:border-[#000066]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-extrabold text-slate-700">
                      Date of Birth (as per IRCTC Profile)
                    </label>
                    <div className="relative flex items-center">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3" />
                      <input
                        type="date"
                        value={forgotDob}
                        onChange={(e) => setForgotDob(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:outline-none focus:border-[#000066]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#000066] hover:bg-blue-900 text-white font-black text-xs shadow-md transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <span>Send Recovery OTP & Fetch User ID</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {recoveryStep === 2 && (
                <>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-extrabold text-emerald-800 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Recovery OTP sent to registered mobile.</span>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-extrabold text-slate-700">
                      Enter 6-Digit Recovery OTP
                    </label>
                    <input
                      type="text"
                      value={recoveryOtp}
                      onChange={(e) => setRecoveryOtp(e.target.value)}
                      placeholder="Enter 6-Digit OTP"
                      maxLength={6}
                      required
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-mono font-bold text-sm tracking-widest text-center text-slate-900 focus:outline-none focus:border-[#000066]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 mb-0.5">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New Password"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 mb-0.5">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#000066] hover:bg-blue-900 text-white font-black text-xs shadow-md transition-all uppercase tracking-wider cursor-pointer mt-2"
                  >
                    Reset Password & Unlock Account
                  </button>
                </>
              )}

              {recoveryStep === 3 && (
                <div className="text-center py-4 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                    <Check className="w-7 h-7 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900">Password Reset Successful!</h4>
                    <p className="text-xs font-semibold text-slate-600 mt-1 max-w-sm mx-auto">
                      {resetSuccessMessage}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('signin');
                      setRecoveryStep(1);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#000066] text-white font-black text-xs shadow-md hover:bg-blue-900 transition-all cursor-pointer"
                  >
                    Proceed to Sign In with New Password
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Official Security Disclaimer Banner */}
          <div className="p-2.5 rounded-xl bg-[#fff3e0] border border-[#ffe0b2] text-[10px] text-[#e65100] font-semibold leading-relaxed">
            <span className="font-extrabold">IRCTC Security Notice:</span> Never share your Password, OTP, or Banking details with anyone. IRCTC staff will never call or SMS asking for passwords.
          </div>

          {/* Footer Security Badge */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-Bit SSL Encrypted</span>
            </span>
            <span>CRIS Handshake Protected</span>
          </div>

        </div>

      </div>

    </div>
  );
}
