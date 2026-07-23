import React, { useState } from 'react';
import { Search, Train, Ticket, User, Users, Shield, Sparkles, Utensils, Award, LogOut, CheckCircle, Smartphone, RefreshCw, KeyRound, UserCheck, UserPlus, Clock, Globe, Star, ChevronLeft, ChevronRight, History, UtensilsCrossed, XCircle, Coins, FileText, FolderPlus, Receipt, Wallet, Bell, PhoneCall, Menu, X, Bus } from 'lucide-react';


export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenAIModal,
  onOpenFoodModal,
  currentUser,
  onOpenLoginModal,
  onOpenProfilePage,
  onOpenBookedTickets,
  onOpenRefundModal,
  onOpenFeedbackModal,
  onOpenChangePassword,
  onOpenAadhaarKyc,
  onOpenMasterList,
  onOpenRecentJourneys,
  onOpenFileTdr,
  onOpenTaxInvoice,
  onLogout
}) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showTrainsDropdown, setShowTrainsDropdown] = useState(false);
  const [showIrctcTrainsSubMenu, setShowIrctcTrainsSubMenu] = useState(false);
  const [showMobileAppsSubMenu, setShowMobileAppsSubMenu] = useState(false);
  const [showMealsDropdown, setShowMealsDropdown] = useState(false);
  const [showLoyaltyDropdown, setShowLoyaltyDropdown] = useState(false);
  const [showSbiCardSubMenu, setShowSbiCardSubMenu] = useState(false);
  const [showBobCardSubMenu, setShowBobCardSubMenu] = useState(false);
  const [showHdfcCardSubMenu, setShowHdfcCardSubMenu] = useState(false);
  const [showRblCardSubMenu, setShowRblCardSubMenu] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [showOtherDropdown, setShowOtherDropdown] = useState(false);
  const [showHolidaysSubMenu, setShowHolidaysSubMenu] = useState(false);
  const [openHolidaysSection, setOpenHolidaysSection] = useState('tourist'); // 'tourist', 'packages', 'stays' or null
  const [showPromotionsSubMenu, setShowPromotionsSubMenu] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState('profile'); // 'profile' or 'transactions'

  const handleProfileSubItemClick = (type) => {
    setShowUserDropdown(false);
    if (type === 'update_profile') {
      onOpenProfilePage();
    } else if (type === 'change_password') {
      onOpenChangePassword();
    } else if (type === 'authenticate') {
      onOpenAadhaarKyc();
    } else if (type === 'master_list') {
      onOpenMasterList();
    } else if (type === 'recent_journeys') {
      if (onOpenRecentJourneys) onOpenRecentJourneys();
    }
  };

  const handleTransactionItemClick = (type) => {
    setShowUserDropdown(false);
    if (type === 'booked_tickets') {
      if (onOpenBookedTickets) onOpenBookedTickets();
      else onOpenProfilePage();
    } else if (type === 'food_history') {
      onOpenFoodModal();
    } else if (type === 'failed_tx') {
      alert("Failed Transactions Audit Log: 0 failed transactions found. 100% payment success rate.");
    } else if (type === 'refund_history' || type === 'cancellation_history') {
      onOpenRefundModal();
    } else if (type === 'tdr_history') {
      onOpenFileTdr();
    } else if (type === 'file_tdr') {
      onOpenFileTdr();
    } else if (type === 'tax_invoice') {
      onOpenTaxInvoice();
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      
      {/* 1. Top Official IRCTC Gradient Stripe */}
      <div className="h-1 bg-gradient-to-r from-orange-600 via-amber-500 to-blue-900 w-full"></div>

      {/* 2. Main White Branding & Navigation Header */}
      <div className="w-full px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        
        {/* Left Branding */}
        <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => setActiveTab('search')}>
          <img
            src="/irctc_logo_transparent.png"
            alt="Indian Railways Logo"
            className="w-9 h-9 object-contain drop-shadow-2xs"
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="font-black text-[#1a237e] text-lg tracking-tight leading-none">IRCTC</span>
            </div>
            <span className="text-[8.5px] text-slate-500 font-bold hidden sm:block mt-0.5 whitespace-nowrap">Indian Railway Catering &amp; Tourism Corporation</span>
          </div>
        </div>

        {/* Center Official IRCTC Navigation Bar (Exact Screenshot Color Theme) */}
        <nav className="hidden xl:flex items-center gap-1 whitespace-nowrap">
          
          {/* HOME */}
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1.5 rounded-full text-[11px] xl:text-xs font-black transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
              activeTab === 'search'
                ? 'bg-[#edf4ff] text-[#0026cd] shadow-2xs'
                : 'text-slate-800 hover:bg-slate-100 hover:text-[#0026cd]'
            }`}
          >
            <Train className="w-3.5 h-3.5 text-[#0026cd]" />
            <span>HOME</span>
          </button>

          {/* TRAINS Dropdown Menu */}
          <div
            className="relative"
            onMouseEnter={() => setShowTrainsDropdown(true)}
            onMouseLeave={() => setShowTrainsDropdown(false)}
          >
            <button
              type="button"
              onClick={() => setShowTrainsDropdown(!showTrainsDropdown)}
              className={`px-3.5 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                showTrainsDropdown || activeTab === 'trains'
                  ? 'bg-[#edf4ff] text-[#0026cd]'
                  : 'text-slate-800 hover:bg-slate-100 hover:text-[#0026cd]'
              }`}
            >
              <Ticket className="w-4 h-4 text-slate-600" />
              <span>TRAINS</span>
            </button>

            {/* 1:1 Official IRCTC Trains Sub-Menu Card */}
            {showTrainsDropdown && (
              <div className="absolute left-0 top-full pt-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2.5 space-y-0.5 text-slate-800">
                  
                  {/* Top Pointer Notch */}
                  <div className="absolute top-0 left-6 w-3 h-3 bg-white border-t border-l border-slate-200 rotate-45 -translate-y-1.5"></div>

                  {/* 1. Book Ticket */}
                  <button
                    onClick={() => {
                      setShowTrainsDropdown(false);
                      setActiveTab('search');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#eff4fe] hover:text-[#283593] flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <Ticket className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>Book Ticket</span>
                  </button>

                  {/* 2. Connecting Journey Booking */}
                  <button
                    onClick={() => {
                      setShowTrainsDropdown(false);
                      alert("Connecting Journey Booking: Search multi-leg connecting train routes.");
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#eff4fe] hover:text-[#283593] flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>Connecting Journey Booking</span>
                  </button>

                  {/* 3. IRCTC Trains > (with Flyout Sub-menu) */}
                  <div
                    className="relative"
                    onMouseEnter={() => {
                      setShowTrainsDropdown(true);
                      setShowIrctcTrainsSubMenu(true);
                    }}
                    onMouseLeave={() => setShowIrctcTrainsSubMenu(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setShowIrctcTrainsSubMenu(!showIrctcTrainsSubMenu)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                        showIrctcTrainsSubMenu
                          ? 'bg-[#edf4ff] text-[#0026cd] font-black'
                          : 'text-slate-800 hover:bg-[#eff4fe] hover:text-[#283593]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Train className="w-4 h-4 text-[#283593] shrink-0" />
                        <span className="font-extrabold text-slate-900">IRCTC Trains</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {/* Flyout Sub-menu for IRCTC Trains with contiguous hover bridge */}
                    {showIrctcTrainsSubMenu && (
                      <div
                        className="absolute right-full top-0 pr-1 z-50 animate-in fade-in zoom-in-95 duration-150"
                        onMouseEnter={() => {
                          setShowTrainsDropdown(true);
                          setShowIrctcTrainsSubMenu(true);
                        }}
                        onMouseLeave={() => setShowIrctcTrainsSubMenu(false)}
                      >
                        <div className="w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 space-y-1 text-slate-800">
                          
                          <button
                            type="button"
                            onClick={() => {
                              setShowIrctcTrainsSubMenu(false);
                              setShowTrainsDropdown(false);
                              window.open('https://www.irctctourism.com/gallery/tajas.html', '_blank');
                            }}
                            className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <Users className="w-4.5 h-4.5 text-orange-500 shrink-0" />
                            <span>Group Booking</span>
                          </button>

                          <div className="border-t border-slate-100"></div>

                          <button
                            type="button"
                            onClick={() => {
                              setShowIrctcTrainsSubMenu(false);
                              setShowTrainsDropdown(false);
                              alert("Travel Insurance Claim Process: File insurance claims for accidental injuries or luggage loss under ₹0.45 travel insurance.");
                            }}
                            className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <Shield className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                            <span>Travel Insurance Claim Process</span>
                          </button>

                        </div>
                      </div>
                    )}
                  </div>



                  {/* 4. PNR Enquiry */}
                  <button
                    onClick={() => {
                      setShowTrainsDropdown(false);
                      setActiveTab('pnr');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#eff4fe] hover:text-[#283593] flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <Search className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>PNR Enquiry</span>
                  </button>

                  {/* 5. Cancel E-ticket */}
                  <button
                    onClick={() => {
                      setShowTrainsDropdown(false);
                      setActiveTab('cancel-ticket');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#eff4fe] hover:text-[#283593] flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Cancel E-ticket</span>
                  </button>

                  {/* 6. Train Schedule */}
                  <button
                    onClick={() => {
                      setShowTrainsDropdown(false);
                      setActiveTab('schedule');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#eff4fe] hover:text-[#283593] flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <Clock className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>Train Schedule</span>
                  </button>

                  {/* 7. Track Your Train */}
                  <button
                    onClick={() => {
                      setShowTrainsDropdown(false);
                      window.open('https://enquiry.indianrail.gov.in/mntes/', '_blank');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#eff4fe] hover:text-[#283593] flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Track Your Train</span>
                  </button>

                  {/* 8. FTR Coach/Train Booking */}
                  <button
                    onClick={() => {
                      setShowTrainsDropdown(false);
                      window.open('https://www.ftr.irctc.co.in/ftr/Controller?action=Login&subAction=doLogin', '_blank');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#eff4fe] hover:text-[#283593] flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>FTR Coach/Train Booking</span>
                  </button>

                  {/* 9. Dogs/Cats Booking */}
                  <button
                    onClick={() => {
                      setShowTrainsDropdown(false);
                      window.open('https://parcel.indianrail.gov.in/LTBook/', '_blank');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#eff4fe] hover:text-[#283593] flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Dogs/Cats Booking</span>
                  </button>

                  {/* 10. Link Your Aadhaar */}
                  <button
                    onClick={() => {
                      setShowTrainsDropdown(false);
                      window.open('https://contents.irctc.co.in/en/BookUpto12ticketsinamonthbylinkingAadhaar.pdf', '_blank');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#eff4fe] hover:text-[#283593] flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Link Your Aadhaar</span>
                  </button>

                  {/* 11. Counter Ticket Cancellation */}
                  <button
                    onClick={() => {
                      setShowTrainsDropdown(false);
                      window.open('https://www.operations.irctc.co.in/ctcan/SystemTktCanLogin.jsf', '_blank');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#eff4fe] hover:text-[#283593] flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>Counter Ticket Cancellation</span>
                  </button>

                  {/* 12. Counter Ticket Boarding Point Change */}
                  <button
                    onClick={() => {
                      setShowTrainsDropdown(false);
                      window.open('https://www.operations.irctc.co.in/ctcan/SystemTktCanLogin.jsf', '_blank');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#eff4fe] hover:text-[#283593] flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <Clock className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>Counter Ticket Boarding Point Change</span>
                  </button>

                  {/* 13. IRCTC Official Mobile Apps > (with Flyout Sub-menu) */}
                  <div
                    className="relative border-t border-slate-100 pt-1"
                    onMouseEnter={() => {
                      setShowTrainsDropdown(true);
                      setShowMobileAppsSubMenu(true);
                    }}
                    onMouseLeave={() => setShowMobileAppsSubMenu(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setShowMobileAppsSubMenu(!showMobileAppsSubMenu)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                        showMobileAppsSubMenu
                          ? 'bg-[#edf4ff] text-[#0026cd] font-black'
                          : 'text-slate-800 hover:bg-[#eff4fe] hover:text-[#283593]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-4 h-4 text-orange-600 shrink-0" />
                        <span className="font-extrabold text-slate-900">IRCTC Official Mobile Apps</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {/* Flyout Sub-menu for IRCTC Mobile Apps */}
                    {showMobileAppsSubMenu && (
                      <div
                        className="absolute right-full top-0 pr-1 z-50 animate-in fade-in zoom-in-95 duration-150"
                        onMouseEnter={() => {
                          setShowTrainsDropdown(true);
                          setShowMobileAppsSubMenu(true);
                        }}
                        onMouseLeave={() => setShowMobileAppsSubMenu(false)}
                      >
                        <div className="w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 space-y-1 text-slate-800">
                          
                          {/* Android */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowMobileAppsSubMenu(false);
                              setShowTrainsDropdown(false);
                              window.open('https://play.google.com/store/apps/details?id=cris.org.in.prs.ima', '_blank');
                            }}
                            className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <Smartphone className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                            <span>IRCTC Rail Connect (Android)</span>
                          </button>

                          <div className="border-t border-slate-100"></div>

                          {/* iOS */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowMobileAppsSubMenu(false);
                              setShowTrainsDropdown(false);
                              window.open('https://apps.apple.com/in/app/irctc-rail-connect/id1220464673', '_blank');
                            }}
                            className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <Smartphone className="w-4.5 h-4.5 text-orange-500 shrink-0" />
                            <span>IRCTC Rail Connect (iOS)</span>
                          </button>

                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* MEALS Dropdown Menu */}
          <div
            className="relative"
            onMouseEnter={() => setShowMealsDropdown(true)}
            onMouseLeave={() => setShowMealsDropdown(false)}
          >
            <button
              type="button"
              onClick={() => setShowMealsDropdown(!showMealsDropdown)}
              className={`px-2.5 xl:px-3 py-1.5 rounded-full text-[11px] xl:text-xs font-black transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                showMealsDropdown
                  ? 'bg-[#edf4ff] text-[#0026cd]'
                  : 'text-slate-800 hover:bg-slate-100 hover:text-[#0026cd]'
              }`}
            >
              <Utensils className="w-3.5 h-3.5 text-amber-600" />
              <span>MEALS</span>
            </button>

            {/* 1:1 Official IRCTC MEALS Sub-Menu */}
            {showMealsDropdown && (
              <div className="absolute left-0 top-full pt-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2.5 space-y-1 text-slate-800">
                  
                  <div className="absolute top-0 left-6 w-3 h-3 bg-white border-t border-l border-slate-200 rotate-45 -translate-y-1.5"></div>

                  <button
                    onClick={() => {
                      setShowMealsDropdown(false);
                      onOpenFoodModal();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <Utensils className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>Book Food – E-Pantry</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowMealsDropdown(false);
                      window.open('https://www.ecatering.irctc.co.in/', '_blank');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <UtensilsCrossed className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Order Food - E-Catering</span>
                  </button>


                  <button
                    onClick={() => {
                      setShowMealsDropdown(false);
                      window.open('https://menurates.irctc.co.in/', '_blank');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>Cooked Food Menu</span>
                  </button>

                </div>
              </div>
            )}
          </div>

          {/* LOYALTY Dropdown Menu */}
          <div
            className="relative"
            onMouseEnter={() => setShowLoyaltyDropdown(true)}
            onMouseLeave={() => setShowLoyaltyDropdown(false)}
          >
            <button
              type="button"
              onClick={() => setShowLoyaltyDropdown(!showLoyaltyDropdown)}
              className={`px-2.5 xl:px-3 py-1.5 rounded-full text-[11px] xl:text-xs font-black transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                showLoyaltyDropdown
                  ? 'bg-[#edf4ff] text-[#0026cd]'
                  : 'text-slate-800 hover:bg-slate-100 hover:text-[#0026cd]'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>LOYALTY</span>
            </button>

            {/* 1:1 Official IRCTC LOYALTY Sub-Menu */}
            {showLoyaltyDropdown && (
              <div className="absolute left-0 top-full pt-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2.5 space-y-1 text-slate-800">
                  
                  <div className="absolute top-0 left-6 w-3 h-3 bg-white border-t border-l border-slate-200 rotate-45 -translate-y-1.5"></div>

                  <button
                    onClick={() => {
                      setShowLoyaltyDropdown(false);
                      window.open('https://contents.irctc.co.in/en/AboutLoyalty.html', '_blank');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>About IRCTC Loyalty program</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowLoyaltyDropdown(false);
                      window.open('https://contents.irctc.co.in/en/comparecards.html', '_blank');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>Compare Co-brand Cards</span>
                  </button>

                  {/* 1. IRCTC SBI Credit Card > */}
                  <div
                    className="relative"
                    onMouseEnter={() => {
                      setShowLoyaltyDropdown(true);
                      setShowSbiCardSubMenu(true);
                    }}
                    onMouseLeave={() => setShowSbiCardSubMenu(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setShowSbiCardSubMenu(!showSbiCardSubMenu)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                        showSbiCardSubMenu
                          ? 'bg-[#edf4ff] text-[#0026cd] font-black'
                          : 'text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Coins className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-extrabold text-slate-900">IRCTC SBI Credit Card</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {showSbiCardSubMenu && (
                      <div
                        className="absolute right-full top-0 pr-1 z-50 animate-in fade-in zoom-in-95 duration-150"
                        onMouseEnter={() => {
                          setShowLoyaltyDropdown(true);
                          setShowSbiCardSubMenu(true);
                        }}
                        onMouseLeave={() => setShowSbiCardSubMenu(false)}
                      >
                        <div className="w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 space-y-1 text-slate-800">
                          <button
                            type="button"
                            onClick={() => {
                              setShowSbiCardSubMenu(false);
                              setShowLoyaltyDropdown(false);
                              window.open('https://contents.irctc.co.in/en/AboutSBICard.html', '_blank');
                            }}
                            className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>About IRCTC SBI Credit Card</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. IRCTC BOB Credit Card > */}
                  <div
                    className="relative"
                    onMouseEnter={() => {
                      setShowLoyaltyDropdown(true);
                      setShowBobCardSubMenu(true);
                    }}
                    onMouseLeave={() => setShowBobCardSubMenu(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setShowBobCardSubMenu(!showBobCardSubMenu)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                        showBobCardSubMenu
                          ? 'bg-[#edf4ff] text-[#0026cd] font-black'
                          : 'text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Coins className="w-4 h-4 text-orange-600 shrink-0" />
                        <span className="font-extrabold text-slate-900">IRCTC BOB Credit Card</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {showBobCardSubMenu && (
                      <div
                        className="absolute right-full top-0 pr-1 z-50 animate-in fade-in zoom-in-95 duration-150"
                        onMouseEnter={() => {
                          setShowLoyaltyDropdown(true);
                          setShowBobCardSubMenu(true);
                        }}
                        onMouseLeave={() => setShowBobCardSubMenu(false)}
                      >
                        <div className="w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 space-y-1 text-slate-800">
                          <button
                            type="button"
                            onClick={() => {
                              setShowBobCardSubMenu(false);
                              setShowLoyaltyDropdown(false);
                              window.open('https://contents.irctc.co.in/en/AboutBOBCard.html', '_blank');
                            }}
                            className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-4 h-4 text-orange-600 shrink-0" />
                            <span>About IRCTC BOB Credit Card</span>
                          </button>

                          <div className="border-t border-slate-100"></div>

                          <button
                            type="button"
                            onClick={() => {
                              setShowBobCardSubMenu(false);
                              setShowLoyaltyDropdown(false);
                              window.open('https://www.bobfinancial.com/irctc-card.jsp', '_blank');
                            }}
                            className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>IRCTC BOB RUPAY Credit Card e-Apply</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. IRCTC HDFC Credit Card > */}
                  <div
                    className="relative"
                    onMouseEnter={() => {
                      setShowLoyaltyDropdown(true);
                      setShowHdfcCardSubMenu(true);
                    }}
                    onMouseLeave={() => setShowHdfcCardSubMenu(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setShowHdfcCardSubMenu(!showHdfcCardSubMenu)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                        showHdfcCardSubMenu
                          ? 'bg-[#edf4ff] text-[#0026cd] font-black'
                          : 'text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Coins className="w-4 h-4 text-rose-600 shrink-0" />
                        <span className="font-extrabold text-slate-900">IRCTC HDFC Credit Card</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {showHdfcCardSubMenu && (
                      <div
                        className="absolute right-full top-0 pr-1 z-50 animate-in fade-in zoom-in-95 duration-150"
                        onMouseEnter={() => {
                          setShowLoyaltyDropdown(true);
                          setShowHdfcCardSubMenu(true);
                        }}
                        onMouseLeave={() => setShowHdfcCardSubMenu(false)}
                      >
                        <div className="w-84 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 space-y-1 text-slate-800">
                          <button
                            type="button"
                            onClick={() => {
                              setShowHdfcCardSubMenu(false);
                              setShowLoyaltyDropdown(false);
                              window.open('https://contents.irctc.co.in/en/AboutHDFCCard.html', '_blank');
                            }}
                            className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-4 h-4 text-sky-600 shrink-0" />
                            <span>About IRCTC HDFC Credit Card</span>
                          </button>

                          <div className="border-t border-slate-100"></div>

                          <button
                            type="button"
                            onClick={() => {
                              setShowHdfcCardSubMenu(false);
                              setShowLoyaltyDropdown(false);
                              window.open('https://www.hdfcbank.com/personal/pay/cards/credit-cards/irctc-hdfc-bank-credit-card', '_blank');
                            }}
                            className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-4 h-4 text-orange-500 shrink-0" />
                            <span>IRCTC HDFC RUPAY Credit Card e-Apply</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. IRCTC RBL Credit Card > */}
                  <div
                    className="relative"
                    onMouseEnter={() => {
                      setShowLoyaltyDropdown(true);
                      setShowRblCardSubMenu(true);
                    }}
                    onMouseLeave={() => setShowRblCardSubMenu(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setShowRblCardSubMenu(!showRblCardSubMenu)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                        showRblCardSubMenu
                          ? 'bg-[#edf4ff] text-[#0026cd] font-black'
                          : 'text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Coins className="w-4 h-4 text-[#0026cd] shrink-0" />
                        <span className="font-extrabold text-slate-900">IRCTC RBL Credit Card</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {showRblCardSubMenu && (
                      <div
                        className="absolute right-full top-0 pr-1 z-50 animate-in fade-in zoom-in-95 duration-150"
                        onMouseEnter={() => {
                          setShowLoyaltyDropdown(true);
                          setShowRblCardSubMenu(true);
                        }}
                        onMouseLeave={() => setShowRblCardSubMenu(false)}
                      >
                        <div className="w-84 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 space-y-1 text-slate-800">
                          <button
                            type="button"
                            onClick={() => {
                              setShowRblCardSubMenu(false);
                              setShowLoyaltyDropdown(false);
                              window.open('https://contents.irctc.co.in/en/AboutRBLCard.html', '_blank');
                            }}
                            className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-4 h-4 text-slate-800 shrink-0" />
                            <span>About IRCTC RBL Credit Card</span>
                          </button>

                          <div className="border-t border-slate-100"></div>

                          <button
                            type="button"
                            onClick={() => {
                              setShowRblCardSubMenu(false);
                              setShowLoyaltyDropdown(false);
                              window.open('https://www.rblbank.com/product/credit-cards/irctc-rbl-bank-credit-card', '_blank');
                            }}
                            className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>Apply for IRCTC RBL Bank Credit Card</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setShowLoyaltyDropdown(false);
                      alert("Add Loyalty Account: Link your existing IRCTC SBI Loyalty Card Number.");
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors border-t border-slate-100 pt-2 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Add Loyalty Account</span>
                  </button>

                </div>
              </div>
            )}
          </div>

          {/* E-WALLET Dropdown Menu */}
          <div
            className="relative"
            onMouseEnter={() => setShowWalletDropdown(true)}
            onMouseLeave={() => setShowWalletDropdown(false)}
          >
            <button
              type="button"
              onClick={() => setShowWalletDropdown(!showWalletDropdown)}
              className={`px-2.5 xl:px-3 py-1.5 rounded-full text-[11px] xl:text-xs font-black transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                showWalletDropdown
                  ? 'bg-[#edf4ff] text-[#0026cd]'
                  : 'text-slate-800 hover:bg-slate-100 hover:text-[#0026cd]'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-purple-600" />
              <span>E-WALLET</span>
            </button>

            {/* 1:1 Official IRCTC E-WALLET Sub-Menu */}
            {showWalletDropdown && (
              <div className="absolute left-0 top-full pt-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2.5 space-y-1 text-slate-800">
                  
                  <div className="absolute top-0 left-6 w-3 h-3 bg-white border-t border-l border-slate-200 rotate-45 -translate-y-1.5"></div>

                  <button
                    onClick={() => {
                      setShowWalletDropdown(false);
                      alert("About IRCTC eWallet: Pre-fund your account for 1-click sub-second booking checkout.");
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <Wallet className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>About IRCTC eWallet</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowWalletDropdown(false);
                      window.open('https://contents.irctc.co.in/en/EwalletUserGuide.pdf', '_blank');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>IRCTC eWallet User Guide</span>
                  </button>

                </div>
              </div>
            )}
          </div>

          {/* OTHER Dropdown Menu */}

          <div
            className="relative"
            onMouseEnter={() => setShowOtherDropdown(true)}
            onMouseLeave={() => setShowOtherDropdown(false)}
          >
            <button
              type="button"
              onClick={() => setShowOtherDropdown(!showOtherDropdown)}
              className={`px-2.5 xl:px-3 py-1.5 rounded-full text-[11px] xl:text-xs font-black transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                showOtherDropdown
                  ? 'bg-[#edf4ff] text-[#0026cd]'
                  : 'text-slate-800 hover:bg-slate-100 hover:text-[#0026cd]'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>OTHER</span>
            </button>

            {/* 1:1 Official IRCTC OTHER Sub-Menu */}
            {showOtherDropdown && (
              <div className="absolute left-0 top-full pt-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2.5 space-y-1 text-slate-800">
                  
                  <div className="absolute top-0 left-6 w-3 h-3 bg-white border-t border-l border-slate-200 rotate-45 -translate-y-1.5"></div>

                  <button
                    onClick={() => {
                      setShowOtherDropdown(false);
                      alert("IRCTC-iPAY: Official Payment Gateway with Auto-Refunds.");
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>IRCTC-iPAY</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowOtherDropdown(false);
                      window.open('https://www.bus.irctc.co.in/home', '_blank');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <Bus className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>BUSES</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowOtherDropdown(false);
                      window.open('https://www.air.irctc.co.in/', '_blank');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-sky-500 shrink-0" />
                    <span>FLIGHTS</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowOtherDropdown(false);
                      window.open('https://www.hotels.irctc.co.in/hotels', '_blank');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>HOTELS</span>
                  </button>

                  {/* HOLIDAYS > (with Flyout Sub-menu matching IRCTC Tourism) */}
                  <div
                    className="relative"
                    onMouseEnter={() => {
                      setShowOtherDropdown(true);
                      setShowHolidaysSubMenu(true);
                    }}
                    onMouseLeave={() => setShowHolidaysSubMenu(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setShowHolidaysSubMenu(!showHolidaysSubMenu)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                        showHolidaysSubMenu
                          ? 'bg-[#edf4ff] text-[#0026cd] font-black'
                          : 'text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
                        <span className="font-extrabold text-slate-900">HOLIDAYS</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {showHolidaysSubMenu && (
                      <div
                        className="absolute right-full top-0 pr-1 z-50 animate-in fade-in zoom-in-95 duration-150"
                        onMouseEnter={() => {
                          setShowOtherDropdown(true);
                          setShowHolidaysSubMenu(true);
                        }}
                        onMouseLeave={() => setShowHolidaysSubMenu(false)}
                      >
                        <div className="w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2.5 space-y-2 text-slate-800 max-h-[85vh] overflow-y-auto">
                          
                          {/* 1. Tourist Trains Interactive Accordion */}
                          <div
                            onClick={() => setOpenHolidaysSection(openHolidaysSection === 'tourist' ? null : 'tourist')}
                            className="bg-[#fff3eb] text-[#d9480f] px-3 py-2.5 rounded-xl flex items-center justify-between font-black text-xs cursor-pointer hover:bg-[#ffe6d5] transition-colors shadow-2xs"
                          >
                            <div className="flex items-center gap-3">
                              <Train className="w-4.5 h-4.5 text-[#d9480f] shrink-0" />
                              <span>Tourist Trains</span>
                            </div>
                            <ChevronRight className={`w-4 h-4 text-[#d9480f] transition-transform duration-200 ${openHolidaysSection === 'tourist' ? 'rotate-90' : 'rotate-0'}`} />
                          </div>

                          {/* Tourist Trains Items */}
                          {openHolidaysSection === 'tourist' && (
                            <div className="pl-3 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowHolidaysSubMenu(false);
                                  setShowOtherDropdown(false);
                                  window.open('https://www.irctctourism.com/bharatgaurav', '_blank');
                                }}
                                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#edf4ff] hover:text-[#0026cd] flex items-center gap-3 transition-colors bg-slate-50 border border-slate-100 cursor-pointer shadow-2xs"
                              >
                                <div className="w-5.5 h-5.5 rounded-full bg-amber-100 text-amber-800 font-black flex items-center justify-center text-[9px] shrink-0">BG</div>
                                <span>Bharat Gaurav</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setShowHolidaysSubMenu(false);
                                  setShowOtherDropdown(false);
                                  window.open('https://www.irctctourism.com/buddhist-train-tour-package', '_blank');
                                }}
                                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#edf4ff] hover:text-[#0026cd] flex items-center gap-3 transition-colors bg-slate-50 border border-slate-100 cursor-pointer shadow-2xs"
                              >
                                <div className="w-5.5 h-5.5 rounded-full bg-rose-100 text-rose-800 font-black flex items-center justify-center text-[9px] shrink-0">BC</div>
                                <span>Buddhist Circuit Tourist Train</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setShowHolidaysSubMenu(false);
                                  setShowOtherDropdown(false);
                                  window.open('https://www.the-maharajas.com/', '_blank');
                                }}
                                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#edf4ff] hover:text-[#0026cd] flex items-center gap-3 transition-colors bg-slate-50 border border-slate-100 cursor-pointer shadow-2xs"
                              >
                                <div className="w-5.5 h-5.5 rounded-full bg-blue-100 text-blue-900 font-black flex items-center justify-center text-[9px] shrink-0">ME</div>
                                <span>Maharajas Express</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setShowHolidaysSubMenu(false);
                                  setShowOtherDropdown(false);
                                  window.open('https://www.goldenchariot.org/', '_blank');
                                }}
                                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#edf4ff] hover:text-[#0026cd] flex items-center gap-3 transition-colors bg-slate-50 border border-slate-100 cursor-pointer shadow-2xs"
                              >
                                <div className="w-5.5 h-5.5 rounded-full bg-purple-100 text-purple-800 font-black flex items-center justify-center text-[9px] shrink-0">GC</div>
                                <span>Golden Chariot</span>
                              </button>
                            </div>
                          )}

                          {/* 2. Tour Packages Interactive Accordion */}
                          <div
                            onClick={() => setOpenHolidaysSection(openHolidaysSection === 'packages' ? null : 'packages')}
                            className="bg-[#fff3eb] text-[#d9480f] px-3 py-2.5 rounded-xl flex items-center justify-between font-black text-xs cursor-pointer hover:bg-[#ffe6d5] transition-colors shadow-2xs"
                          >
                            <div className="flex items-center gap-3">
                              <Globe className="w-4.5 h-4.5 text-[#d9480f] shrink-0" />
                              <span>Tour Packages</span>
                            </div>
                            <ChevronRight className={`w-4 h-4 text-[#d9480f] transition-transform duration-200 ${openHolidaysSection === 'packages' ? 'rotate-90' : 'rotate-0'}`} />
                          </div>

                          {/* Tour Packages Items */}
                          {openHolidaysSection === 'packages' && (
                            <div className="pl-3 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowHolidaysSubMenu(false);
                                  setShowOtherDropdown(false);
                                  window.open('https://www.irctctourism.com/tourpackages/domestic', '_blank');
                                }}
                                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#edf4ff] hover:text-[#0026cd] flex items-center gap-3 transition-colors bg-slate-50 border border-slate-100 cursor-pointer shadow-2xs"
                              >
                                <div className="w-5.5 h-5.5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 text-xs">🧳</div>
                                <span>Domestic Packages</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setShowHolidaysSubMenu(false);
                                  setShowOtherDropdown(false);
                                  window.open('https://www.irctctourism.com/tourpackages/international', '_blank');
                                }}
                                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#edf4ff] hover:text-[#0026cd] flex items-center gap-3 transition-colors bg-slate-50 border border-slate-100 cursor-pointer shadow-2xs"
                              >
                                <div className="w-5.5 h-5.5 rounded-full bg-[#edf4ff] text-[#0026cd] flex items-center justify-center shrink-0 text-xs">🌐</div>
                                <span>International Packages</span>
                              </button>
                            </div>
                          )}

                          {/* 3. Stays Interactive Accordion */}
                          <div
                            onClick={() => setOpenHolidaysSection(openHolidaysSection === 'stays' ? null : 'stays')}
                            className="bg-[#fff3eb] text-[#d9480f] px-3 py-2.5 rounded-xl flex items-center justify-between font-black text-xs cursor-pointer hover:bg-[#ffe6d5] transition-colors shadow-2xs"
                          >
                            <div className="flex items-center gap-3">
                              <Award className="w-4.5 h-4.5 text-[#d9480f] shrink-0" />
                              <span>Stays</span>
                            </div>
                            <ChevronRight className={`w-4 h-4 text-[#d9480f] transition-transform duration-200 ${openHolidaysSection === 'stays' ? 'rotate-90' : 'rotate-0'}`} />
                          </div>

                          {/* Stays Items */}
                          {openHolidaysSection === 'stays' && (
                            <div className="pl-3 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowHolidaysSubMenu(false);
                                  setShowOtherDropdown(false);
                                  window.open('https://www.rr.irctctourism.com/', '_blank');
                                }}
                                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#edf4ff] hover:text-[#0026cd] flex items-center gap-3 transition-colors bg-slate-50 border border-slate-100 cursor-pointer shadow-2xs"
                              >
                                <div className="w-5.5 h-5.5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 text-xs">🛏️</div>
                                <span>Retiring Room</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setShowHolidaysSubMenu(false);
                                  setShowOtherDropdown(false);
                                  window.open('https://www.irctctourism.com/lounge', '_blank');
                                }}
                                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#edf4ff] hover:text-[#0026cd] flex items-center gap-3 transition-colors bg-slate-50 border border-slate-100 cursor-pointer shadow-2xs"
                              >
                                <div className="w-5.5 h-5.5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 text-xs">🛋️</div>
                                <span>Lounge</span>
                              </button>
                            </div>
                          )}

                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setShowOtherDropdown(false);
                      window.open('https://www.irctctourism.com/wheelchair', '_blank');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>e-Wheelchair</span>
                  </button>

                  {/* Promotions > (with Flyout Sub-menu matching IRCTC portal) */}
                  <div
                    className="relative border-t border-slate-100 pt-1"
                    onMouseEnter={() => {
                      setShowOtherDropdown(true);
                      setShowPromotionsSubMenu(true);
                    }}
                    onMouseLeave={() => setShowPromotionsSubMenu(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setShowPromotionsSubMenu(!showPromotionsSubMenu)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                        showPromotionsSubMenu
                          ? 'bg-[#edf4ff] text-[#0026cd] font-black'
                          : 'text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 text-rose-500 shrink-0" />
                        <span className="font-extrabold text-slate-900">Promotions</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {showPromotionsSubMenu && (
                      <div
                        className="absolute right-full top-0 pr-1 z-50 animate-in fade-in zoom-in-95 duration-150"
                        onMouseEnter={() => {
                          setShowOtherDropdown(true);
                          setShowPromotionsSubMenu(true);
                        }}
                        onMouseLeave={() => setShowPromotionsSubMenu(false)}
                      >
                        <div className="w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 space-y-1 text-slate-800">
                          
                          {/* 1. Advertise with us */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowPromotionsSubMenu(false);
                              setShowOtherDropdown(false);
                              window.open('https://www.irctc.co.in/eticketing/advertiseWithUs.jsf', '_blank');
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <Train className="w-4 h-4 text-orange-500 shrink-0" />
                              <span>Advertise with us</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </button>

                          <div className="border-t border-slate-100"></div>

                          {/* 2. National Rail Museum */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowPromotionsSubMenu(false);
                              setShowOtherDropdown(false);
                              window.open('https://nrmindia.org/', '_blank');
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <Award className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>National Rail Museum</span>
                          </button>

                          <div className="border-t border-slate-100"></div>

                          {/* 3. Trains at a Glance */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowPromotionsSubMenu(false);
                              setShowOtherDropdown(false);
                              window.open('https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,1,304,366,537', '_blank');
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <Train className="w-4 h-4 text-orange-600 shrink-0" />
                            <span>Trains at a Glance</span>
                          </button>

                          <div className="border-t border-slate-100"></div>

                          {/* 4. IRCTC Tourism App */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowPromotionsSubMenu(false);
                              setShowOtherDropdown(false);
                              window.open('https://play.google.com/store/apps/details?id=com.irctc.tourism', '_blank');
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <Smartphone className="w-4 h-4 text-orange-500 shrink-0" />
                            <span>IRCTC Tourism App</span>
                          </button>

                          <div className="border-t border-slate-100"></div>

                          {/* 5. National Voter's Service Portal */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowPromotionsSubMenu(false);
                              setShowOtherDropdown(false);
                              window.open('https://www.voters.eci.gov.in/', '_blank');
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>National Voter's Service Portal</span>
                          </button>

                          <div className="border-t border-slate-100"></div>

                          {/* 6. Rail Drishti */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowPromotionsSubMenu(false);
                              setShowOtherDropdown(false);
                              window.open('https://raildrishti.in/', '_blank');
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>Rail Drishti</span>
                          </button>

                          <div className="border-t border-slate-100"></div>

                          {/* 7. Indian Railways Magazines */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowPromotionsSubMenu(false);
                              setShowOtherDropdown(false);
                              window.open('https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,1,304,366,1090', '_blank');
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Indian Railways Magazines</span>
                          </button>

                          <div className="border-t border-slate-100"></div>

                          {/* 8. Railways Freight Business Portal */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowPromotionsSubMenu(false);
                              setShowOtherDropdown(false);
                              window.open('https://www.freight.indianrailways.gov.in/', '_blank');
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-[#eff4fe] hover:text-[#0026cd] flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <Train className="w-4 h-4 text-slate-800 shrink-0" />
                            <span>Railways Freight Business Portal</span>
                          </button>

                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* CONTACT US */}
          <button
            type="button"
            onClick={() => setShowContactModal(true)}
            className="px-2.5 xl:px-3 py-1.5 rounded-full text-[11px] xl:text-xs font-black text-slate-800 hover:bg-slate-100 hover:text-[#0026cd] transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
            <span>CONTACT US</span>
          </button>


        </nav>

        {/* Right Auth / Profile Button */}
        <div className="flex items-center gap-2 shrink-0">
          
          <button
            type="button"
            onClick={onOpenAIModal}
            className="hidden sm:flex px-3 py-1.5 rounded-full bg-amber-50 hover:bg-orange-100 text-[#ea580c] font-extrabold text-[11px] xl:text-xs border border-orange-200/80 items-center gap-1 shadow-2xs cursor-pointer transition-all active:scale-95 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Predictor</span>
          </button>

          {currentUser ? (
            <div
              className="relative shrink-0"
              onMouseEnter={() => setShowUserDropdown(true)}
              onMouseLeave={() => setShowUserDropdown(false)}
            >
              
              {/* User Avatar Button (No Truncation) */}
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200/90 text-[#1a237e] font-black text-xs shadow-xs transition-all cursor-pointer ring-2 ring-blue-500/10 active:scale-95 shrink-0 whitespace-nowrap"
              >
                <div className="w-5 h-5 rounded-full bg-[#1a237e] text-white flex items-center justify-center text-[9px] font-black shadow-2xs shrink-0">
                  {(currentUser.name || currentUser.username || 'AK').slice(0, 2).toUpperCase()}
                </div>
                <span className="uppercase tracking-wider font-extrabold text-[11px] shrink-0 whitespace-nowrap">{currentUser.username}</span>
                <CheckCircle className="w-4 h-4 fill-emerald-600 text-white shrink-0" />
              </button>

              {/* Unified High-End IRCTC Profile Dropdown Card (Contiguous Hit Area) */}
              {showUserDropdown && (
                <div className="absolute right-0 sm:-right-2 top-full pt-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="w-80 sm:w-84 max-w-[calc(100vw-24px)] bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 space-y-3">
                  
                  {/* 1. User Profile Header Badge */}
                  <div className="bg-[#eff4fe] p-3 rounded-2xl border border-blue-100 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#283593] text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
                      {(currentUser.name || currentUser.username || 'AK').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <h4 className="text-xs font-black text-slate-900 truncate">
                          {currentUser.name || 'Ashirwad Kumar'}
                        </h4>
                        <CheckCircle className="w-3.5 h-3.5 fill-emerald-600 text-white shrink-0" />
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold font-mono truncate">
                        @{currentUser.username}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 whitespace-nowrap">
                          Aadhaar KYC Verified ✓
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-100 text-[#283593] whitespace-nowrap">
                          ₹4,250 Wallet
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Category Tab Switcher (My Profile | My Transactions) */}
                  <div className="flex items-center p-1 rounded-xl bg-slate-100 text-xs font-extrabold">
                    <button
                      type="button"
                      onClick={() => setActiveSubMenu('profile')}
                      className={`flex-1 py-1.5 text-center rounded-lg transition-all cursor-pointer ${
                        activeSubMenu === 'profile'
                          ? 'bg-white text-[#283593] font-black shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      My Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSubMenu('transactions')}
                      className={`flex-1 py-1.5 text-center rounded-lg transition-all cursor-pointer ${
                        activeSubMenu === 'transactions'
                          ? 'bg-white text-[#283593] font-black shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      My Transactions
                    </button>
                  </div>

                  {/* 3. Sub-Menu Items List */}
                  {activeSubMenu === 'profile' ? (
                    <div className="space-y-1 pt-1">
                      <button
                        type="button"
                        onClick={() => handleProfileSubItemClick('update_profile')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#eff4fe] hover:text-[#283593] flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <RefreshCw className="w-4 h-4 text-[#3f51b5]" />
                          <span>Update Profile Details</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleProfileSubItemClick('change_password')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#eff4fe] hover:text-[#283593] flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <KeyRound className="w-4 h-4 text-[#3f51b5]" />
                          <span>Change Password</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleProfileSubItemClick('authenticate')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#eff4fe] hover:text-[#283593] flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <UserCheck className="w-4 h-4 text-[#3f51b5]" />
                          <span>Aadhaar KYC Verification</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleProfileSubItemClick('master_list')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#eff4fe] hover:text-[#283593] flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <UserPlus className="w-4 h-4 text-[#3f51b5]" />
                          <span>Add / Modify Master List</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleProfileSubItemClick('recent_journeys')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#eff4fe] hover:text-[#283593] flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-4 h-4 text-[#3f51b5]" />
                          <span>Saved Recent Journeys</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1 pt-1">
                      <button
                        type="button"
                        onClick={() => handleTransactionItemClick('booked_tickets')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#eff4fe] hover:text-[#283593] flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <History className="w-4 h-4 text-[#3f51b5]" />
                          <span>Booked Ticket History</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTransactionItemClick('food_history')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#eff4fe] hover:text-[#283593] flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <UtensilsCrossed className="w-4 h-4 text-[#3f51b5]" />
                          <span>Booked Food History</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTransactionItemClick('refund_history')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#eff4fe] hover:text-[#283593] flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Coins className="w-4 h-4 text-[#3f51b5]" />
                          <span>Ticket Refund Status</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTransactionItemClick('file_tdr')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#eff4fe] hover:text-[#283593] flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <FolderPlus className="w-4 h-4 text-[#3f51b5]" />
                          <span>File TDR</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTransactionItemClick('tax_invoice')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#eff4fe] hover:text-[#283593] flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Receipt className="w-4 h-4 text-[#3f51b5]" />
                          <span>GST Tax Invoice</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                  )}

                  {/* 4. Footer Actions (Feedback & Logout) */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenFeedbackModal();
                      }}
                      className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      <span>Feedback</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="flex-1 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Logout</span>
                    </button>
                  </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="px-4 py-1.5 rounded-full bg-[#0026cd] hover:bg-blue-900 text-white font-black text-xs shadow-md transition-all active:scale-95"
            >
              LOGIN
            </button>
          )}
          {/* Hamburger Menu Toggle Button for Mobile / Tablet */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-slate-900" /> : <Menu className="w-6 h-6 text-[#1a237e]" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Slide-Down Navigation Sheet */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 shadow-xl px-4 py-4 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2 text-xs font-black">
            
            <button
              onClick={() => {
                setActiveTab('search');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl flex items-center gap-2 cursor-pointer ${
                activeTab === 'search' ? 'bg-[#edf4ff] text-[#0026cd]' : 'bg-slate-50 text-slate-800'
              }`}
            >
              <Train className="w-4 h-4 text-[#0026cd]" />
              <span>HOME</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('search');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-800 flex items-center gap-2 cursor-pointer"
            >
              <Ticket className="w-4 h-4 text-slate-600" />
              <span>TRAINS</span>
            </button>

            <button
              onClick={() => {
                onOpenFoodModal();
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-800 flex items-center gap-2 cursor-pointer"
            >
              <Utensils className="w-4 h-4 text-amber-600" />
              <span>MEALS</span>
            </button>

            <button
              onClick={() => {
                alert('IRCTC SBI Loyalty Rewards: You have 1,250 Active Reward Points.');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-800 flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4 text-emerald-600" />
              <span>LOYALTY</span>
            </button>

            <button
              onClick={() => {
                alert('IRCTC e-Wallet: Balance ₹4,250.00');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-800 flex items-center gap-2 cursor-pointer"
            >
              <Wallet className="w-4 h-4 text-purple-600" />
              <span>E-WALLET</span>
            </button>

            <button
              onClick={() => {
                alert('IRCTC Services: Tourism Packages, Flight Tickets, Bus Booking & Hotels.');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-800 flex items-center gap-2 cursor-pointer"
            >
              <Globe className="w-4 h-4 text-blue-600" />
              <span>OTHER</span>
            </button>

            <button
              onClick={() => {
                alert('IRCTC 24x7 Customer Support Line: Call 14567');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-800 flex items-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-teal-600" />
              <span>CONTACT US</span>
            </button>

          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            <button
              onClick={() => {
                onOpenAIModal();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2.5 rounded-xl bg-amber-50 text-[#ea580c] font-black text-xs border border-orange-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Predictor</span>
            </button>
            {currentUser && (
              <button
                onClick={() => {
                  onOpenProfilePage();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#283593] text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>My Account</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Official 1:1 IRCTC Contact Us Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#1a237e] to-[#0026cd] p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black tracking-tight">You may contact us</h3>
                <p className="text-xs text-blue-200 font-medium mt-0.5">Official 24x7 IRCTC Passenger Helpline & Support</p>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-slate-800 max-h-[75vh] overflow-y-auto">
              
              <div>
                <h4 className="text-base font-black text-slate-900 border-b border-slate-200 pb-2 mb-3">
                  For Any Queries Related to Railway Tickets Booked via IRCTC
                </h4>
                
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
                    <Globe className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">Enhanced Online eQuery Portal:</span>
                      <a
                        href="https://equery.irctc.co.in/"
                        target="_blank"
                        rel="noreferrer"
                        className="block text-[#0026cd] font-black underline hover:text-blue-900 mt-0.5"
                      >
                        https://equery.irctc.co.in/
                      </a>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 flex items-start gap-3">
                    <FileText className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">E-Ticket Cancellation & TDR Filing Email:</span>
                      <a
                        href="mailto:etickets@irctc.co.in"
                        className="block text-[#0026cd] font-black underline hover:text-blue-900 mt-0.5"
                      >
                        etickets@irctc.co.in
                      </a>
                      <span className="text-[10px] text-slate-500 font-bold block mt-0.5">(from the registered email ID only)</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3">
                    <PhoneCall className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 text-sm">Dial 14646 (Within India)</span>
                      <p className="text-[10.5px] text-slate-600 font-medium mt-1 leading-relaxed">
                        Support is available in Hindi, English, Punjabi, Bengali, Assamese, Odia, Marathi, Gujarati, Tamil, Telugu, Kannada and Malayalam.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <PhoneCall className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">Customer Support (Outside India):</span>
                      <p className="font-mono font-black text-[#0026cd] text-xs mt-0.5">
                        Call: +91-8044647999 / +91-8035734999
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-start gap-3">
                    <Wallet className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">For queries related to I Mudra wallet:</span>
                      <a
                        href="https://equery.irctc.co.in/"
                        target="_blank"
                        rel="noreferrer"
                        className="block text-[#0026cd] font-black underline hover:text-blue-900 mt-0.5"
                      >
                        https://equery.irctc.co.in/
                      </a>
                    </div>
                  </div>

                </div>
              </div>

              {/* IRCTC Loyalty Credit Card Complaint Section */}
              <div className="pt-2 border-t border-slate-200">
                <h4 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-2 mb-3">
                  For complaint regarding IRCTC Loyalty credit card, kindly contact as below.
                </h4>

                <div className="space-y-2.5 text-xs">
                  
                  {/* SBI */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800 uppercase">LOYALTY CREDIT CARD: <strong className="text-blue-900 font-black">IRCTC-SBI</strong></span>
                    </div>
                    <p className="text-slate-600 font-bold">
                      CONTACT NUMBER: <span className="font-mono text-[#0026cd] font-black">0124-39021212 / 18001801295</span>
                    </p>
                    <p className="text-slate-600 font-bold">
                      EMAIL/URL: <a href="mailto:customercare@sbicard.com" className="text-[#0026cd] underline font-black">customercare@sbicard.com</a>
                    </p>
                  </div>

                  {/* BOB */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800 uppercase">LOYALTY CREDIT CARD: <strong className="text-orange-900 font-black">IRCTC-BOB</strong></span>
                    </div>
                    <p className="text-slate-600 font-bold">
                      CONTACT NUMBER: <span className="font-mono text-[#0026cd] font-black">1800225100 / 18001031006</span>
                    </p>
                    <p className="text-slate-600 font-bold">
                      EMAIL/URL: <a href="mailto:crm@bobfinancial.com" className="text-[#0026cd] underline font-black">crm@bobfinancial.com</a>
                    </p>
                  </div>

                  {/* HDFC */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800 uppercase">LOYALTY CREDIT CARD: <strong className="text-rose-900 font-black">IRCTC-HDFC</strong></span>
                    </div>
                    <p className="text-slate-600 font-bold">
                      CONTACT NUMBER: <span className="font-mono text-[#0026cd] font-black">18002026161 / 18602676161</span>
                    </p>
                    <p className="text-slate-600 font-bold">
                      EMAIL/URL: <a href="https://www.hdfcbank.com/personal/need-help/contact-us" target="_blank" rel="noreferrer" className="text-[#0026cd] underline font-black truncate block">https://www.hdfcbank.com/personal/need-help/contact-us</a>
                    </p>
                  </div>

                  {/* RBL */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800 uppercase">LOYALTY CREDIT CARD: <strong className="text-indigo-900 font-black">IRCTC-RBL</strong></span>
                    </div>
                    <p className="text-slate-600 font-bold">
                      CONTACT NUMBER: <span className="font-mono text-[#0026cd] font-black">02262327777 / 02271190900</span>
                    </p>
                    <p className="text-slate-600 font-bold">
                      EMAIL/URL: <a href="mailto:cardservices@rblbank.com" className="text-[#0026cd] underline font-black">cardservices@rblbank.com</a>
                    </p>
                  </div>

                </div>

                <div className="mt-3 p-3 rounded-2xl bg-blue-50 border border-blue-100 text-xs">
                  <p className="text-slate-700 font-medium">
                    For other queries related to IRCTC Loyalty Co-branded Program, kindly email at{' '}
                    <a href="mailto:loyaltyprogram@irctc.co.in" className="text-[#0026cd] font-black underline">
                      loyaltyprogram@irctc.co.in
                    </a>
                  </p>
                </div>
              </div>

              {/* Registered Corporate Office Section */}
              <div className="pt-3 border-t border-slate-200">
                <h4 className="text-sm font-black text-slate-900 mb-1">
                  Registered Office - Corporate Office
                </h4>
                <p className="text-xs text-slate-600 font-bold leading-relaxed">
                  4th Floor, Tower-D, World Trade Center, Nauroji Nagar, New Delhi-110029
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowContactModal(false)}
                className="px-5 py-2 rounded-xl bg-[#0026cd] hover:bg-blue-900 text-white font-black text-xs transition-all active:scale-95 cursor-pointer shadow-md"
              >
                Close Help Center
              </button>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}

