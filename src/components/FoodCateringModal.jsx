import React, { useState } from 'react';
import { FOOD_PARTNERS } from '../data/mockTrains';
import { X, Utensils, ShoppingBag, MapPin } from 'lucide-react';

export default function FoodCateringModal({ onClose }) {
  const [cart, setCart] = useState([]);
  const [selectedStation, setSelectedStation] = useState('Surat (ST) - 08:55 AM');
  const [orderPlaced, setOrderPlaced] = useState(false);

  const addToCart = (item, partnerName) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { ...item, partnerName, qty: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    const existing = cart.find(c => c.id === id);
    if (existing.qty > 1) {
      setCart(cart.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c));
    } else {
      setCart(cart.filter(c => c.id !== id));
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = () => {
    setOrderPlaced(true);
    setTimeout(() => {
      setOrderPlaced(false);
      setCart([]);
      onClose();
      alert('Order Placed Successfully! Meal will be delivered to Berth B1-19 at Surat Station.');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden border border-slate-200 shadow-2xl my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-blue-950 text-white flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">IRCTC E-Catering & In-Train Meal Delivery</h2>
              <p className="text-xs text-blue-200 font-medium">Order hygienic meals delivered directly to your train seat/berth</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl bg-blue-900 text-blue-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Menu Items (Col 8) */}
          <div className="lg:col-span-8 space-y-6 max-h-[500px] overflow-y-auto pr-2">
            
            {/* Delivery Station Selector */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span>Delivery Station Halt:</span>
              </div>
              <select
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="Vadodara (BRC) - 07:00 AM">Vadodara (BRC) - 07:00 AM</option>
                <option value="Surat (ST) - 08:55 AM">Surat (ST) - 08:55 AM</option>
                <option value="Vapi (VAPI) - 10:02 AM">Vapi (VAPI) - 10:02 AM</option>
              </select>
            </div>

            {/* Restaurants */}
            {FOOD_PARTNERS.map(partner => (
              <div key={partner.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{partner.logo}</span>
                    <div>
                      <h3 className="font-black text-sm text-blue-950">{partner.name}</h3>
                      <p className="text-[11px] text-slate-500 font-medium">{partner.cuisine}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-orange-600">{partner.rating}</span>
                </div>

                <div className="space-y-3">
                  {partner.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="pr-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${item.veg ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
                          <span className="font-bold text-xs text-slate-900">{item.name}</span>
                          <span className="text-[9px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200">{item.tag}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 font-medium">{item.desc}</p>
                        <span className="text-xs font-mono font-black text-blue-950 mt-1 block">₹{item.price}</span>
                      </div>

                      <button
                        onClick={() => addToCart(item, partner.name)}
                        className="px-3 py-1.5 rounded-xl bg-orange-100 border border-orange-300 text-orange-700 hover:bg-orange-600 hover:text-white text-xs font-bold transition-all flex-shrink-0"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Cart & Summary (Col 4) */}
          <div className="lg:col-span-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div>
              <h3 className="font-black text-sm text-blue-950 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-orange-600" />
                <span>Meal Cart ({cart.length})</span>
              </h3>

              {cart.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs font-medium">
                  Your meal cart is empty. Add thalis, snacks, or drinks.
                </div>
              ) : (
                <div className="space-y-2 mb-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">₹{item.price} x {item.qty}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => removeFromCart(item.id)} className="w-5 h-5 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold">-</button>
                        <span className="font-mono font-bold text-slate-900">{item.qty}</span>
                        <button onClick={() => addToCart(item, item.partnerName)} className="w-5 h-5 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="py-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-900 mb-4">
                <span>Total Amount:</span>
                <span className="font-mono text-orange-600 text-base font-black">₹{cartTotal}</span>
              </div>

              <button
                disabled={cart.length === 0 || orderPlaced}
                onClick={handleCheckout}
                className={`w-full py-3 rounded-xl font-bold text-xs transition-all ${
                  cart.length > 0
                    ? 'irctc-gradient-btn shadow-md'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {orderPlaced ? 'Processing Order...' : 'Confirm Meal Delivery'}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
