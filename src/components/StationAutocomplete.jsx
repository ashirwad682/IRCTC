import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Train } from 'lucide-react';

export const IRCTC_STATIONS = [
  // NORTH ZONE
  { code: 'NDLS', name: 'NEW DELHI', state: 'DELHI (NEW DELHI)' },
  { code: 'DLI', name: 'OLD DELHI JN', state: 'DELHI (OLD DELHI)' },
  { code: 'NZM', name: 'HAZRAT NIZAMUDDIN', state: 'DELHI (NIZAMUDDIN)' },
  { code: 'ANVT', name: 'ANAND VIHAR TERMINAL', state: 'DELHI (ANAND VIHAR)' },
  { code: 'DEC', name: 'DELHI CANTT', state: 'DELHI (DELHI CANTT)' },
  { code: 'ASR', name: 'AMRITSAR JN', state: 'PUNJAB (AMRITSAR)' },
  { code: 'LDH', name: 'LUDHIANA JN', state: 'PUNJAB (LUDHIANA)' },
  { code: 'JUC', name: 'JALANDHAR CITY', state: 'PUNJAB (JALANDHAR)' },
  { code: 'PGW', name: 'PHAGWARA JN', state: 'PUNJAB (PHAGWARA)' },
  { code: 'PBP', name: 'PATIALA', state: 'PUNJAB (PATIALA)' },
  { code: 'UMB', name: 'AMBALA CANTT', state: 'HARYANA (AMBALA)' },
  { code: 'KLK', name: 'KALKA', state: 'HARYANA (KALKA)' },
  { code: 'CDG', name: 'CHANDIGARH', state: 'CHANDIGARH (CHANDIGARH)' },
  { code: 'HW', name: 'HARIDWAR', state: 'UTTARAKHAND (HARIDWAR)' },
  { code: 'DDN', name: 'DEHRADUN', state: 'UTTARAKHAND (DEHRADUN)' },
  { code: 'KGM', name: 'KATHGODAM', state: 'UTTARAKHAND (KATHGODAM)' },
  { code: 'JAT', name: 'JAMMU TAWI', state: 'JAMMU & KASHMIR (JAMMU)' },
  { code: 'SVDK', name: 'SMVD KATRA', state: 'JAMMU & KASHMIR (KATRA)' },
  { code: 'SGR', name: 'SRINAGAR', state: 'JAMMU & KASHMIR (SRINAGAR)' },

  // EAST ZONE & BIHAR / JHARKHAND
  { code: 'PNBE', name: 'PATNA JN', state: 'BIHAR (PATNA)' },
  { code: 'PNC', name: 'PATNA SAHEB', state: 'BIHAR (PATNA)' },
  { code: 'RJPB', name: 'RAJENDRANAGAR TERMINAL', state: 'BIHAR (PATNA)' },
  { code: 'DNR', name: 'DANAPUR', state: 'BIHAR (DANAPUR)' },
  { code: 'GAYA', name: 'GAYA JN', state: 'BIHAR (GAYA)' },
  { code: 'MFP', name: 'MUZAFFARPUR JN', state: 'BIHAR (MUZAFFARPUR)' },
  { code: 'DBG', name: 'DARBHANGA JN', state: 'BIHAR (DARBHANGA)' },
  { code: 'BJU', name: 'BARAUNI JN', state: 'BIHAR (BARAUNI)' },
  { code: 'KGG', name: 'KHAGARIA JN', state: 'BIHAR (KHAGARIA)' },
  { code: 'KIR', name: 'KATIHAR JN', state: 'BIHAR (KATIHAR)' },
  { code: 'JSME', name: 'JASIDIH JN', state: 'JHARKHAND (JASIDIH)' },
  { code: 'MDP', name: 'MADHUPUR JN', state: 'JHARKHAND (MADHUPUR)' },
  { code: 'RNC', name: 'RANCHI JN', state: 'JHARKHAND (RANCHI)' },
  { code: 'DHN', name: 'DHANBAD JN', state: 'JHARKHAND (DHANBAD)' },
  { code: 'TATA', name: 'TATANAGAR JN', state: 'JHARKHAND (JAMSHEDPUR)' },
  { code: 'HWH', name: 'HOWRAH JN', state: 'WEST BENGAL (KOLKATA)' },
  { code: 'SDAH', name: 'SEALDAH', state: 'WEST BENGAL (KOLKATA)' },
  { code: 'KOAA', name: 'KOLKATA TERMINAL', state: 'WEST BENGAL (KOLKATA)' },
  { code: 'NJP', name: 'NEW JALPAIGURI', state: 'WEST BENGAL (SILIGURI)' },
  { code: 'KGP', name: 'KHARAGPUR JN', state: 'WEST BENGAL (KHARAGPUR)' },
  { code: 'ASN', name: 'ASANSOL JN', state: 'WEST BENGAL (ASANSOL)' },
  { code: 'NHT', name: 'NALHATI JN', state: 'WEST BENGAL (NALHATI)' },

  // WEST ZONE & MAHARASHTRA / GUJARAT / RAJASTHAN
  { code: 'MMCT', name: 'MUMBAI CENTRAL', state: 'MAHARASHTRA (MUMBAI)' },
  { code: 'CSMT', name: 'MUMBAI CSMT', state: 'MAHARASHTRA (MUMBAI)' },
  { code: 'BDTS', name: 'BANDRA TERMINAL', state: 'MAHARASHTRA (MUMBAI)' },
  { code: 'LTT', name: 'LOKMANYA TILAK TERM', state: 'MAHARASHTRA (MUMBAI)' },
  { code: 'DR', name: 'DADAR', state: 'MAHARASHTRA (MUMBAI)' },
  { code: 'PUNE', name: 'PUNE JN', state: 'MAHARASHTRA (PUNE)' },
  { code: 'NGP', name: 'NAGPUR JN', state: 'MAHARASHTRA (NAGPUR)' },
  { code: 'NK', name: 'NASHIK ROAD', state: 'MAHARASHTRA (NASHIK)' },
  { code: 'BSL', name: 'BHUSAVAL JN', state: 'MAHARASHTRA (BHUSAVAL)' },
  { code: 'SUR', name: 'SOLAPUR JN', state: 'MAHARASHTRA (SOLAPUR)' },
  { code: 'KOP', name: 'KOLHAPUR C SM', state: 'MAHARASHTRA (KOLHAPUR)' },
  { code: 'ADI', name: 'AHMEDABAD JN', state: 'GUJARAT (AHMEDABAD)' },
  { code: 'ST', name: 'SURAT', state: 'GUJARAT (SURAT)' },
  { code: 'BRC', name: 'VADODARA JN', state: 'GUJARAT (VADODARA)' },
  { code: 'RJT', name: 'RAJKOT JN', state: 'GUJARAT (RAJKOT)' },
  { code: 'RTM', name: 'RATLAM JN', state: 'MADHYA PRADESH (RATLAM)' },
  { code: 'JP', name: 'JAIPUR JN', state: 'RAJASTHAN (JAIPUR)' },
  { code: 'JU', name: 'JODHPUR JN', state: 'RAJASTHAN (JODHPUR)' },
  { code: 'UJZ', name: 'UDAIPUR CITY', state: 'RAJASTHAN (UDAIPUR)' },
  { code: 'BKN', name: 'BIKANER JN', state: 'RAJASTHAN (BIKANER)' },
  { code: 'KOTA', name: 'KOTA JN', state: 'RAJASTHAN (KOTA)' },

  // CENTRAL & UP / MP / CHHATTISGARH
  { code: 'CNB', name: 'KANPUR CENTRAL', state: 'UTTAR PRADESH (KANPUR)' },
  { code: 'LKO', name: 'LUCKNOW NR', state: 'UTTAR PRADESH (LUCKNOW)' },
  { code: 'LJN', name: 'LUCKNOW NE', state: 'UTTAR PRADESH (LUCKNOW)' },
  { code: 'BSB', name: 'VARANASI JN', state: 'UTTAR PRADESH (VARANASI)' },
  { code: 'DDU', name: 'DD UPADHYAYA JN', state: 'UTTAR PRADESH (MUGHALSARAI)' },
  { code: 'PRYJ', name: 'PRAYAGRAJ JN', state: 'UTTAR PRADESH (ALLAHABAD)' },
  { code: 'GKP', name: 'GORAKHPUR JN', state: 'UTTAR PRADESH (GORAKHPUR)' },
  { code: 'AGC', name: 'AGRA CANTT', state: 'UTTAR PRADESH (AGRA)' },
  { code: 'MTJ', name: 'MATHURA JN', state: 'UTTAR PRADESH (MATHURA)' },
  { code: 'AY', name: 'AYODHYA DHAM JN', state: 'UTTAR PRADESH (AYODHYA)' },
  { code: 'MB', name: 'MORADABAD JN', state: 'UTTAR PRADESH (MORADABAD)' },
  { code: 'BE', name: 'BAREILLY JN', state: 'UTTAR PRADESH (BAREILLY)' },
  { code: 'BPL', name: 'BHOPAL JN', state: 'MADHYA PRADESH (BHOPAL)' },
  { code: 'RKMP', name: 'RANI KAMLAPATI', state: 'MADHYA PRADESH (BHOPAL)' },
  { code: 'INDB', name: 'INDORE JN', state: 'MADHYA PRADESH (INDORE)' },
  { code: 'JBP', name: 'JABALPUR JN', state: 'MADHYA PRADESH (JABALPUR)' },
  { code: 'GWL', name: 'GWALIOR JN', state: 'MADHYA PRADESH (GWALIOR)' },
  { code: 'VGLJ', name: 'V LAKSHMIBAI JHANSI', state: 'UTTAR PRADESH (JHANSI)' },
  { code: 'R', name: 'RAIPUR JN', state: 'CHHATTISGARH (RAIPUR)' },
  { code: 'BSP', name: 'BILASPUR JN', state: 'CHHATTISGARH (BILASPUR)' },
  { code: 'DURG', name: 'DURG JN', state: 'CHHATTISGARH (DURG)' },

  // SOUTH ZONE
  { code: 'MAS', name: 'MGR CHENNAI CTL', state: 'TAMIL NADU (CHENNAI)' },
  { code: 'MS', name: 'CHENNAI EGMORE', state: 'TAMIL NADU (CHENNAI)' },
  { code: 'CBE', name: 'COIMBATORE JN', state: 'TAMIL NADU (COIMBATORE)' },
  { code: 'MDU', name: 'MADURAI JN', state: 'TAMIL NADU (MADURAI)' },
  { code: 'TPJ', name: 'TIRUCHCHIRAPPALLI', state: 'TAMIL NADU (TRICHY)' },
  { code: 'KPD', name: 'KATPADI JN', state: 'TAMIL NADU (VELLORE)' },
  { code: 'SBC', name: 'KSR BENGALURU', state: 'KARNATAKA (BENGALURU)' },
  { code: 'YPR', name: 'YESVANTPUR JN', state: 'KARNATAKA (BENGALURU)' },
  { code: 'MYS', name: 'MYSURU JN', state: 'KARNATAKA (MYSORE)' },
  { code: 'UBL', name: 'SSS HUBBALLI JN', state: 'KARNATAKA (HUBLI)' },
  { code: 'MAQ', name: 'MANGALURU CENTRAL', state: 'KARNATAKA (MANGALORE)' },
  { code: 'TVC', name: 'THIRUVANANTHAPURAM', state: 'KERALA (TRIVANDRUM)' },
  { code: 'ERS', name: 'ERNAKULAM JN', state: 'KERALA (COCHIN)' },
  { code: 'CLT', name: 'KOZHIKODE', state: 'KERALA (CALICUT)' },
  { code: 'TCR', name: 'THRISSUR', state: 'KERALA (THRISSUR)' },
  { code: 'PGT', name: 'PALAKKAD JN', state: 'KERALA (PALGHAT)' },
  { code: 'SC', name: 'SECUNDERABAD JN', state: 'TELANGANA (HYDERABAD)' },
  { code: 'HYB', name: 'HYDERABAD DECCAN', state: 'TELANGANA (HYDERABAD)' },
  { code: 'KZJ', name: 'KAZIPET JN', state: 'TELANGANA (WARANGAL)' },
  { code: 'VSKP', name: 'VISAKHAPATNAM', state: 'ANDHRA PRADESH (VIZAG)' },
  { code: 'BZA', name: 'VIJAYAWADA JN', state: 'ANDHRA PRADESH (VIJAYAWADA)' },
  { code: 'TPTY', name: 'TIRUPATI', state: 'ANDHRA PRADESH (TIRUPATI)' },
  { code: 'RU', name: 'RENIGUNTA JN', state: 'ANDHRA PRADESH (RENIGUNTA)' },

  // NORTH-EAST & ODISHA
  { code: 'GHY', name: 'GUWAHATI', state: 'ASSAM (GUWAHATI)' },
  { code: 'KYQ', name: 'KAMAKHYA', state: 'ASSAM (GUWAHATI)' },
  { code: 'DBRG', name: 'DIBRUGARH', state: 'ASSAM (DIBRUGARH)' },
  { code: 'AGTL', name: 'AGARTALA', state: 'TRIPURA (AGARTALA)' },
  { code: 'BBS', name: 'BHUBANESWAR', state: 'ODISHA (BHUBANESWAR)' },
  { code: 'PURI', name: 'PURI', state: 'ODISHA (PURI)' },
  { code: 'CTC', name: 'CUTTACK', state: 'ODISHA (CUTTACK)' },
  { code: 'ROU', name: 'ROURKELA', state: 'ODISHA (ROURKELA)' }
];

export default function StationAutocomplete({ label, selectedCode, onSelectStation, iconType = 'circle' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  const wrapperRef = useRef(null);

  const selectedStation = IRCTC_STATIONS.find(s => s.code === selectedCode);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filteredStations = IRCTC_STATIONS.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.code.toLowerCase().includes(query.toLowerCase()) ||
    s.state.toLowerCase().includes(query.toLowerCase())
  );

  const currentHighlightedStation = filteredStations[highlightedIndex] || filteredStations[0];

  // Dynamic Display Value: Show live highlighted station text when moving down/hovering!
  const getInputValue = () => {
    if (!isOpen) {
      return selectedStation ? `${selectedStation.name} - ${selectedStation.code}` : '';
    }
    if (isKeyboardActive && currentHighlightedStation) {
      return `${currentHighlightedStation.name} - ${currentHighlightedStation.code}`;
    }
    return query;
  };

  // Keyboard Enter & Arrow Key Navigation Handler
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        setIsKeyboardActive(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsKeyboardActive(true);
      setHighlightedIndex((prev) => (prev + 1) % filteredStations.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsKeyboardActive(true);
      setHighlightedIndex((prev) => (prev - 1 + filteredStations.length) % filteredStations.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (filteredStations.length > 0) {
        e.preventDefault();
        const targetStation = filteredStations[highlightedIndex] || filteredStations[0];
        onSelectStation(targetStation.code);
        setQuery('');
        setIsKeyboardActive(false);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setIsKeyboardActive(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      
      {/* Input Field */}
      <div
        onClick={() => setIsOpen(true)}
        className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-500 cursor-pointer transition-all"
      >
        <label className="text-xs font-black text-[#000066] block mb-0.5">
          {label}
        </label>

        <div className="flex items-center gap-2.5">
          {iconType === 'circle' ? (
            <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
            </div>
          ) : (
            <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
          )}

          <input
            type="text"
            value={getInputValue()}
            onFocus={() => {
              setIsOpen(true);
              setHighlightedIndex(0);
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsKeyboardActive(false);
              setIsOpen(true);
              setHighlightedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={label === 'From' ? 'Enter Source Station (e.g. NDLS)' : 'Enter Destination Station (e.g. MMCT)'}
            className="w-full bg-transparent font-black text-blue-950 text-xs sm:text-sm focus:outline-none placeholder:text-slate-400 font-semibold"
          />
        </div>
      </div>

      {/* Autocomplete Dropdown List with z-50 to stay above Recent Journeys section! */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xl max-h-80 overflow-y-auto z-50 divide-y divide-slate-100 animate-in fade-in duration-100">


          {filteredStations.length > 0 ? (
            filteredStations.map((st, idx) => (
              <div
                key={st.code}
                onMouseEnter={() => {
                  setHighlightedIndex(idx);
                  setIsKeyboardActive(true);
                }}
                onClick={() => {
                  onSelectStation(st.code);
                  setQuery('');
                  setIsKeyboardActive(false);
                  setIsOpen(false);
                }}
                className={`p-3.5 cursor-pointer transition-colors flex items-center justify-between group ${
                  idx === highlightedIndex ? 'bg-blue-100/80 border-l-4 border-blue-600' : 'hover:bg-blue-50'
                }`}
              >
                <div>
                  <h4 className="text-xs font-black text-slate-900 group-hover:text-blue-700 transition-colors uppercase">
                    {st.name}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400 block mt-0.5 uppercase">
                    {st.state}
                  </span>
                </div>

                <span className="font-mono font-bold text-xs text-slate-400 group-hover:text-blue-900 transition-colors">
                  {st.code}
                </span>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-xs font-bold text-slate-400">
              No matching Indian station found
            </div>
          )}
        </div>
      )}

    </div>
  );
}
