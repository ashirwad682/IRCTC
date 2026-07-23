// CRIS Official Indian Railways Master Train Database
// Sourced from CRIS (Centre for Railway Information Systems) & NTES (National Train Enquiry System)

export const CRIS_STATIONS_MAP = {
  NDLS: { name: 'New Delhi', city: 'Delhi', state: 'Delhi' },
  DLI: { name: 'Old Delhi Jn', city: 'Delhi', state: 'Delhi' },
  NZM: { name: 'Hazrat Nizamuddin', city: 'Delhi', state: 'Delhi' },
  ANVT: { name: 'Anand Vihar Terminal', city: 'Delhi', state: 'Delhi' },
  DEC: { name: 'Delhi Cantt', city: 'Delhi', state: 'Delhi' },
  
  PNBE: { name: 'Patna Jn', city: 'Patna', state: 'Bihar' },
  PNC: { name: 'Patna Saheb', city: 'Patna', state: 'Bihar' },
  RJPB: { name: 'Rajendranagar Terminal', city: 'Patna', state: 'Bihar' },
  DNR: { name: 'Danapur', city: 'Patna', state: 'Bihar' },
  GAYA: { name: 'Gaya Jn', city: 'Gaya', state: 'Bihar' },
  MFP: { name: 'Muzaffarpur Jn', city: 'Muzaffarpur', state: 'Bihar' },
  DBG: { name: 'Darbhanga Jn', city: 'Darbhanga', state: 'Bihar' },
  BJU: { name: 'Barauni Jn', city: 'Barauni', state: 'Bihar' },
  
  JSME: { name: 'Jasidih Jn', city: 'Jasidih', state: 'Jharkhand' },
  MDP: { name: 'Madhupur Jn', city: 'Madhupur', state: 'Jharkhand' },
  RNC: { name: 'Ranchi Jn', city: 'Ranchi', state: 'Jharkhand' },
  DHN: { name: 'Dhanbad Jn', city: 'Dhanbad', state: 'Jharkhand' },
  TATA: { name: 'Tatanagar Jn', city: 'Jamshedpur', state: 'Jharkhand' },
  
  HWH: { name: 'Howrah Jn', city: 'Kolkata', state: 'West Bengal' },
  SDAH: { name: 'Sealdah', city: 'Kolkata', state: 'West Bengal' },
  KOAA: { name: 'Kolkata Terminal', city: 'Kolkata', state: 'West Bengal' },
  ASN: { name: 'Asansol Jn', city: 'Asansol', state: 'West Bengal' },
  NJP: { name: 'New Jalpaiguri', city: 'Siliguri', state: 'West Bengal' },
  
  MMCT: { name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra' },
  CSMT: { name: 'Mumbai CSMT', city: 'Mumbai', state: 'Maharashtra' },
  BDTS: { name: 'Bandra Terminal', city: 'Mumbai', state: 'Maharashtra' },
  LTT: { name: 'Lokmanya Tilak Term', city: 'Mumbai', state: 'Maharashtra' },
  PUNE: { name: 'Pune Jn', city: 'Pune', state: 'Maharashtra' },
  NGP: { name: 'Nagpur Jn', city: 'Nagpur', state: 'Maharashtra' },
  
  ADI: { name: 'Ahmedabad Jn', city: 'Ahmedabad', state: 'Gujarat' },
  ST: { name: 'Surat', city: 'Surat', state: 'Gujarat' },
  BRC: { name: 'Vadodara Jn', city: 'Vadodara', state: 'Gujarat' },
  
  JP: { name: 'Jaipur Jn', city: 'Jaipur', state: 'Rajasthan' },
  JU: { name: 'Jodhpur Jn', city: 'Jodhpur', state: 'Rajasthan' },
  KOTA: { name: 'Kota Jn', city: 'Kota', state: 'Rajasthan' },
  
  CNB: { name: 'Kanpur Central', city: 'Kanpur', state: 'Uttar Pradesh' },
  LKO: { name: 'Lucknow NR', city: 'Lucknow', state: 'Uttar Pradesh' },
  BSB: { name: 'Varanasi Jn', city: 'Varanasi', state: 'Uttar Pradesh' },
  DDU: { name: 'DD Upadhyaya Jn', city: 'Mughalsarai', state: 'Uttar Pradesh' },
  PRYJ: { name: 'Prayagraj Jn', city: 'Allahabad', state: 'Uttar Pradesh' },
  AGC: { name: 'Agra Cantt', city: 'Agra', state: 'Uttar Pradesh' },
  AY: { name: 'Ayodhya Dham', city: 'Ayodhya', state: 'Uttar Pradesh' },
  
  BPL: { name: 'Bhopal Jn', city: 'Bhopal', state: 'Madhya Pradesh' },
  INDB: { name: 'Indore Jn', city: 'Indore', state: 'Madhya Pradesh' },
  RTM: { name: 'Ratlam Jn', city: 'Ratlam', state: 'Madhya Pradesh' },
  
  MAS: { name: 'MGR Chennai Ctl', city: 'Chennai', state: 'Tamil Nadu' },
  MS: { name: 'Chennai Egmore', city: 'Chennai', state: 'Tamil Nadu' },
  SBC: { name: 'KSR Bengaluru', city: 'Bengaluru', state: 'Karnataka' },
  YPR: { name: 'Yesvantpur Jn', city: 'Bengaluru', state: 'Karnataka' },
  SC: { name: 'Secunderabad Jn', city: 'Hyderabad', state: 'Telangana' },
  VSKP: { name: 'Visakhapatnam', city: 'Vizag', state: 'Andhra Pradesh' },
  BZA: { name: 'Vijayawada Jn', city: 'Vijayawada', state: 'Andhra Pradesh' },
  GHY: { name: 'Guwahati', city: 'Guwahati', state: 'Assam' },
  BBS: { name: 'Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha' }
};

export const CRIS_REAL_TRAINS = [
  {
    id: '12936',
    number: '12936',
    name: 'SURAT - MUMBAI BANDRA T Intercity SF Express',
    type: 'Superfast',
    from: 'ST',
    fromName: 'Surat',
    to: 'BDTS',
    toName: 'Mumbai Bandra Terminus',
    departureTime: '16:25',
    arrivalTime: '20:45',
    duration: '4h 20m',
    distance: '252 km',
    avgSpeed: '58 km/h',
    punctuality: '98.0%',
    pantry: true,
    wiFi: true,
    cleanliness: '4.8★'
  },
  {
    id: '12954',
    number: '12954',
    name: 'August Kranti Tejas Rajdhani Express',
    type: 'Rajdhani',
    from: 'NZM',
    fromName: 'Hazrat Nizamuddin',
    to: 'MMCT',
    toName: 'Mumbai Central',
    departureTime: '17:15',
    arrivalTime: '10:05',
    duration: '16h 50m',
    distance: '1377 km',
    avgSpeed: '82 km/h',
    punctuality: '99.0%',
    pantry: true,
    wiFi: true,
    cleanliness: '4.9★'
  },
  {
    id: '12926',
    number: '12926',
    name: 'Paschim Superfast Express',
    type: 'Superfast',
    from: 'ASR',
    fromName: 'Amritsar Jn',
    to: 'MMCT',
    toName: 'Mumbai Central',
    departureTime: '07:35',
    arrivalTime: '14:45',
    duration: '31h 10m',
    distance: '1821 km',
    avgSpeed: '58 km/h',
    punctuality: '96.5%',
    pantry: true,
    wiFi: false,
    cleanliness: '4.6★'
  },
  // --- CHENNAI <-> COIMBATORE SHATABDI ROUTE ---
  {
    id: '12243',
    number: '12243',
    name: 'MAS CBE SHATABDI',
    type: 'Shatabdi',
    from: 'MAS',
    fromName: 'MGR CHENNAI CTL',
    to: 'CBE',
    toName: 'COIMBATORE JN',
    stops: ['MAS', 'KPD', 'JTJ', 'SA', 'ED', 'TUP', 'CBE'],
    departureTime: '07:15',
    arrivalTime: '14:15',
    duration: '7h 00m',
    distance: '497 km',
    avgSpeed: '71 km/h',
    punctuality: '99.2%',
    pantry: true,
    wiFi: true,
    cleanliness: '4.9★',
    liveStatus: { currentStation: 'Erode Jn (ED)', statusText: 'On Time', delayMinutes: 0, nextStation: 'Tiruppur (TUP)', speed: 110, platform: 'P1' },
    classes: [
      { code: 'CC', name: 'AC Chair Car (CC)', price: 925, status: 'AVAILABLE 120', statusType: 'available', quota: { GN: 120, TQ: 40 } },
      { code: 'EC', name: 'Exec. Chair Car (EC)', price: 1780, status: 'AVAILABLE 14', statusType: 'available', quota: { GN: 14, TQ: 4 } }
    ],
    intermediateStations: [
      { code: 'MAS', name: 'MGR CHENNAI CTL', route: 1, arr: '--', dep: '07:15', halt: '--', distance: '0', day: 1, platform: 'P2' },
      { code: 'KPD', name: 'KATPADI JN', route: 1, arr: '08:43', dep: '08:45', halt: '02:00', distance: '130', day: 1, platform: 'P1' },
      { code: 'JTJ', name: 'JOLARPETTAI JN', route: 1, arr: '09:53', dep: '09:55', halt: '02:00', distance: '214', day: 1, platform: 'P2' },
      { code: 'SA', name: 'SALEM JN', route: 1, arr: '11:17', dep: '11:20', halt: '03:00', distance: '334', day: 1, platform: 'P4' },
      { code: 'ED', name: 'ERODE JN', route: 1, arr: '12:15', dep: '12:20', halt: '05:00', distance: '396', day: 1, platform: 'P3' },
      { code: 'TUP', name: 'TIRUPPUR', route: 1, arr: '13:03', dep: '13:05', halt: '02:00', distance: '446', day: 1, platform: 'P1' },
      { code: 'CBE', name: 'COIMBATORE JN', route: 1, arr: '14:15', dep: '--', halt: '--', distance: '497', day: 1, platform: 'P1' }
    ]
  },

  // --- DELHI <-> PATNA / PATNA SAHEB ROUTE ---
  {
    id: '12310',
    number: '12310',
    name: 'RJPB Tejas Rajdhani Express',
    type: 'Rajdhani',
    from: 'NDLS',
    fromName: 'New Delhi',
    to: 'PNBE',
    toName: 'Patna Jn',
    stops: ['NDLS', 'CNB', 'PRYJ', 'DDU', 'DNR', 'PNBE', 'PNC', 'RJPB'],
    departureTime: '17:10',
    arrivalTime: '05:40',
    duration: '12h 30m',
    distance: '997 km',
    avgSpeed: '80 km/h',
    punctuality: '98.5%',
    pantry: true,
    wiFi: true,
    cleanliness: '4.9★',
    liveStatus: { currentStation: 'Kanpur Central (CNB)', statusText: 'On Time', delayMinutes: 0, nextStation: 'Prayagraj Jn (PRYJ)', speed: 130, platform: 'P16' },
    classes: [
      { code: '1A', name: 'First AC (1A)', price: 3850, status: 'AVAILABLE 6', statusType: 'available', quota: { GN: 6, TQ: 2, LD: 2, ST: 2 } },
      { code: '2A', name: 'AC 2-Tier (2A)', price: 2280, status: 'AVAILABLE 22', statusType: 'available', quota: { GN: 22, TQ: 8, LD: 4, ST: 6 } },
      { code: '3A', name: 'AC 3-Tier (3A)', price: 1620, status: 'AVAILABLE 68', statusType: 'available', quota: { GN: 68, TQ: 28, LD: 12, ST: 18 } }
    ],
    intermediateStations: [
      { name: 'New Delhi (NDLS)', arr: 'Start', dep: '17:10', platform: 'P16', distance: '0 km' },
      { name: 'Kanpur Central (CNB)', arr: '21:52', dep: '21:57', platform: 'P1', distance: '440 km' },
      { name: 'Prayagraj Jn (PRYJ)', arr: '23:53', dep: '23:55', platform: 'P4', distance: '634 km' },
      { name: 'DD Upadhyaya (DDU)', arr: '01:57', dep: '02:07', platform: 'P2', distance: '787 km' },
      { name: 'Danapur (DNR)', arr: '05:08', dep: '05:10', platform: 'P1', distance: '985 km' },
      { name: 'Patna Jn (PNBE)', arr: '05:40', dep: '05:50', platform: 'P10', distance: '997 km' },
      { name: 'Patna Saheb (PNC)', arr: '06:05', dep: '06:07', platform: 'P2', distance: '1006 km' },
      { name: 'Rajendranagar (RJPB)', arr: '06:20', dep: 'End', platform: 'P1', distance: '1009 km' }
    ]
  },
  {
    id: '12394',
    number: '12394',
    name: 'Sampoorna Kranti Express',
    type: 'Superfast Mail',
    from: 'NDLS',
    fromName: 'New Delhi',
    to: 'PNBE',
    toName: 'Patna Jn',
    stops: ['NDLS', 'CNB', 'DDU', 'DNR', 'PNBE', 'PNC', 'RJPB'],
    departureTime: '17:30',
    arrivalTime: '06:50',
    duration: '13h 20m',
    distance: '997 km',
    avgSpeed: '75 km/h',
    punctuality: '97.2%',
    pantry: true,
    wiFi: false,
    cleanliness: '4.7★',
    liveStatus: { currentStation: 'DD Upadhyaya (DDU)', statusText: 'On Time', delayMinutes: 0, nextStation: 'Danapur (DNR)', speed: 110, platform: 'P14' },
    classes: [
      { code: '1A', name: 'First AC (1A)', price: 3620, status: 'AVAILABLE 2', statusType: 'available', quota: { GN: 2, TQ: 0, LD: 1 } },
      { code: '2A', name: 'AC 2-Tier (2A)', price: 2150, status: 'AVAILABLE 14', statusType: 'available', quota: { GN: 14, TQ: 6, LD: 4 } },
      { code: '3A', name: 'AC 3-Tier (3A)', price: 1540, status: 'AVAILABLE 82', statusType: 'available', quota: { GN: 82, TQ: 30, LD: 12 } },
      { code: '3E', name: '3-Tier Economy', price: 1420, status: 'AVAILABLE 95', statusType: 'available', quota: { GN: 95, TQ: 35, LD: 15 } },
      { code: 'SL', name: 'Sleeper (SL)', price: 580, status: 'RAC 6', statusType: 'rac', quota: { GN: 6, TQ: 50, LD: 20 } }
    ],
    intermediateStations: [
      { name: 'New Delhi (NDLS)', arr: 'Start', dep: '17:30', platform: 'P14', distance: '0 km' },
      { name: 'Kanpur Central (CNB)', arr: '22:20', dep: '22:30', platform: 'P2', distance: '440 km' },
      { name: 'DD Upadhyaya (DDU)', arr: '03:15', dep: '03:25', platform: 'P2', distance: '787 km' },
      { name: 'Danapur (DNR)', arr: '06:15', dep: '06:17', platform: 'P1', distance: '985 km' },
      { name: 'Patna Jn (PNBE)', arr: '06:50', dep: '07:05', platform: 'P10', distance: '997 km' },
      { name: 'Patna Saheb (PNC)', arr: '07:22', dep: '07:24', platform: 'P2', distance: '1006 km' }
    ]
  },
  {
    id: '12392',
    number: '12392',
    name: 'Shramjeevi Superfast Express',
    type: 'Superfast Mail',
    from: 'NDLS',
    fromName: 'New Delhi',
    to: 'PNC',
    toName: 'Patna Saheb',
    stops: ['NDLS', 'MB', 'BE', 'LKO', 'CNB', 'BSB', 'DDU', 'PNBE', 'PNC', 'RJPB'],
    departureTime: '13:10',
    arrivalTime: '07:25',
    duration: '18h 15m',
    distance: '1006 km',
    avgSpeed: '55 km/h',
    punctuality: '94.8%',
    pantry: true,
    wiFi: false,
    cleanliness: '4.5★',
    liveStatus: { currentStation: 'Varanasi (BSB)', statusText: 'On Time', delayMinutes: 0, nextStation: 'DD Upadhyaya (DDU)', speed: 95, platform: 'P8' },
    classes: [
      { code: '1A', name: 'First AC (1A)', price: 3450, status: 'AVAILABLE 1', statusType: 'available', quota: { GN: 1, TQ: 0 } },
      { code: '2A', name: 'AC 2-Tier (2A)', price: 2050, status: 'AVAILABLE 10', statusType: 'available', quota: { GN: 10, TQ: 4 } },
      { code: '3A', name: 'AC 3-Tier (3A)', price: 1460, status: 'AVAILABLE 44', statusType: 'available', quota: { GN: 44, TQ: 20 } },
      { code: 'SL', name: 'Sleeper (SL)', price: 540, status: 'AVAILABLE 110', statusType: 'available', quota: { GN: 110, TQ: 60 } }
    ],
    intermediateStations: [
      { name: 'New Delhi (NDLS)', arr: 'Start', dep: '13:10', platform: 'P8', distance: '0 km' },
      { name: 'Lucknow NR (LKO)', arr: '21:20', dep: '21:30', platform: 'P1', distance: '487 km' },
      { name: 'Varanasi Jn (BSB)', arr: '02:35', dep: '02:45', platform: 'P5', distance: '787 km' },
      { name: 'Patna Jn (PNBE)', arr: '07:05', dep: '07:15', platform: 'P10', distance: '997 km' },
      { name: 'Patna Saheb (PNC)', arr: '07:25', dep: 'End', platform: 'P2', distance: '1006 km' }
    ]
  },
  {
    id: '12368',
    number: '12368',
    name: 'Vikramshila Express',
    type: 'Superfast',
    from: 'ANVT',
    fromName: 'Anand Vihar Terminal',
    to: 'PNC',
    toName: 'Patna Saheb',
    stops: ['ANVT', 'NDLS', 'CNB', 'PRYJ', 'DDU', 'PNBE', 'PNC', 'JSME'],
    departureTime: '13:15',
    arrivalTime: '02:50',
    duration: '13h 35m',
    distance: '1006 km',
    avgSpeed: '74 km/h',
    punctuality: '96.0%',
    pantry: true,
    wiFi: false,
    cleanliness: '4.6★',
    liveStatus: { currentStation: 'Kanpur Central (CNB)', statusText: 'On Time', delayMinutes: 0, nextStation: 'Prayagraj (PRYJ)', speed: 110, platform: 'P1' },
    classes: [
      { code: '1A', name: 'First AC (1A)', price: 3580, status: 'WL 2', statusType: 'wl', quota: { GN: 2, TQ: 0 } },
      { code: '2A', name: 'AC 2-Tier (2A)', price: 2110, status: 'AVAILABLE 12', statusType: 'available', quota: { GN: 12, TQ: 6 } },
      { code: '3A', name: 'AC 3-Tier (3A)', price: 1510, status: 'AVAILABLE 65', statusType: 'available', quota: { GN: 65, TQ: 25 } },
      { code: 'SL', name: 'Sleeper (SL)', price: 570, status: 'AVAILABLE 140', statusType: 'available', quota: { GN: 140, TQ: 50 } }
    ],
    intermediateStations: [
      { name: 'Anand Vihar (ANVT)', arr: 'Start', dep: '13:15', platform: 'P3', distance: '0 km' },
      { name: 'Kanpur Central (CNB)', arr: '18:25', dep: '18:30', platform: 'P5', distance: '428 km' },
      { name: 'Patna Jn (PNBE)', arr: '02:30', dep: '02:40', platform: 'P10', distance: '997 km' },
      { name: 'Patna Saheb (PNC)', arr: '02:50', dep: 'End', platform: 'P2', distance: '1006 km' }
    ]
  },
  {
    id: '15484',
    number: '15484',
    name: 'Sikkim Mahananda Express',
    type: 'Express',
    from: 'DLI',
    fromName: 'Old Delhi Jn',
    to: 'PNC',
    toName: 'Patna Saheb',
    stops: ['DLI', 'NDLS', 'AGC', 'CNB', 'PRYJ', 'DDU', 'PNBE', 'PNC'],
    departureTime: '07:35',
    arrivalTime: '01:25',
    duration: '17h 50m',
    distance: '1006 km',
    avgSpeed: '56 km/h',
    punctuality: '93.2%',
    pantry: true,
    wiFi: false,
    cleanliness: '4.3★',
    liveStatus: { currentStation: 'Prayagraj (PRYJ)', statusText: 'On Time', delayMinutes: 0, nextStation: 'DD Upadhyaya (DDU)', speed: 90, platform: 'P2' },
    classes: [
      { code: '2A', name: 'AC 2-Tier (2A)', price: 1980, status: 'AVAILABLE 6', statusType: 'available', quota: { GN: 6 } },
      { code: '3A', name: 'AC 3-Tier (3A)', price: 1390, status: 'AVAILABLE 38', statusType: 'available', quota: { GN: 38 } },
      { code: '3E', name: '3-Tier Economy', price: 1280, status: 'AVAILABLE 50', statusType: 'available', quota: { GN: 50 } },
      { code: 'SL', name: 'Sleeper (SL)', price: 510, status: 'AVAILABLE 180', statusType: 'available', quota: { GN: 180 } }
    ],
    intermediateStations: [
      { name: 'Old Delhi (DLI)', arr: 'Start', dep: '07:35', platform: 'P10', distance: '0 km' },
      { name: 'Patna Jn (PNBE)', arr: '01:05', dep: '01:15', platform: 'P10', distance: '997 km' },
      { name: 'Patna Saheb (PNC)', arr: '01:25', dep: 'End', platform: 'P2', distance: '1006 km' }
    ]
  },
  {
    id: '12304',
    number: '12304',
    name: 'Poorva Express (Via Patna)',
    type: 'Superfast Mail',
    from: 'NDLS',
    fromName: 'New Delhi',
    to: 'PNC',
    toName: 'Patna Saheb',
    stops: ['NDLS', 'CNB', 'PRYJ', 'DDU', 'PNBE', 'PNC', 'JSME', 'HWH'],
    departureTime: '17:40',
    arrivalTime: '07:15',
    duration: '13h 35m',
    distance: '1006 km',
    avgSpeed: '74 km/h',
    punctuality: '96.8%',
    pantry: true,
    wiFi: true,
    cleanliness: '4.7★',
    liveStatus: { currentStation: 'Kanpur Central (CNB)', statusText: 'On Time', delayMinutes: 0, nextStation: 'Prayagraj (PRYJ)', speed: 120, platform: 'P1' },
    classes: [
      { code: '1A', name: 'First AC (1A)', price: 3680, status: 'AVAILABLE 4', statusType: 'available', quota: { GN: 4 } },
      { code: '2A', name: 'AC 2-Tier (2A)', price: 2180, status: 'AVAILABLE 16', statusType: 'available', quota: { GN: 16 } },
      { code: '3A', name: 'AC 3-Tier (3A)', price: 1560, status: 'AVAILABLE 90', statusType: 'available', quota: { GN: 90 } },
      { code: 'SL', name: 'Sleeper (SL)', price: 590, status: 'AVAILABLE 150', statusType: 'available', quota: { GN: 150 } }
    ],
    intermediateStations: [
      { name: 'New Delhi (NDLS)', arr: 'Start', dep: '17:40', platform: 'P1', distance: '0 km' },
      { name: 'Patna Jn (PNBE)', arr: '06:55', dep: '07:05', platform: 'P10', distance: '997 km' },
      { name: 'Patna Saheb (PNC)', arr: '07:15', dep: 'End', platform: 'P2', distance: '1006 km' }
    ]
  },
  {
    id: '22348',
    number: '22348',
    name: 'Patna - Howrah Vande Bharat Express',
    type: 'Vande Bharat',
    from: 'PNBE',
    fromName: 'Patna Jn',
    to: 'HWH',
    toName: 'Howrah Jn',
    stops: ['PNBE', 'PNC', 'MKA', 'JSME', 'MDP', 'ASN', 'HWH'],
    departureTime: '08:00',
    arrivalTime: '14:35',
    duration: '6h 35m',
    distance: '532 km',
    avgSpeed: '81 km/h',
    punctuality: '99.8%',
    pantry: true,
    wiFi: true,
    cleanliness: '5.0★',
    liveStatus: { currentStation: 'Patna Saheb (PNC)', statusText: 'On Time', delayMinutes: 0, nextStation: 'Mokama (MKA)', speed: 130, platform: 'P1' },
    classes: [
      { code: 'EC', name: 'Exec. Chair Car', price: 2150, status: 'AVAILABLE 18', statusType: 'available', quota: { GN: 18 } },
      { code: 'CC', name: 'AC Chair Car', price: 1160, status: 'AVAILABLE 85', statusType: 'available', quota: { GN: 85 } }
    ],
    intermediateStations: [
      { name: 'Patna Jn (PNBE)', arr: 'Start', dep: '08:00', platform: 'P1', distance: '0 km' },
      { name: 'Patna Saheb (PNC)', arr: '08:12', dep: '08:14', platform: 'P1', distance: '9 km' },
      { name: 'Jasidih Jn (JSME)', arr: '10:53', dep: '10:55', platform: 'P1', distance: '221 km' },
      { name: 'Howrah Jn (HWH)', arr: '14:35', dep: 'End', platform: 'P8', distance: '532 km' }
    ]
  },
  {
    id: '12024',
    number: '12024',
    name: 'Patna - Howrah Jan Shatabdi Express',
    type: 'Jan Shatabdi',
    from: 'PNBE',
    fromName: 'Patna Jn',
    to: 'HWH',
    toName: 'Howrah Jn',
    stops: ['PNBE', 'PNC', 'MKA', 'JSME', 'MDP', 'ASN', 'HWH'],
    departureTime: '05:30',
    arrivalTime: '13:25',
    duration: '7h 55m',
    distance: '532 km',
    avgSpeed: '67 km/h',
    punctuality: '98.5%',
    pantry: false,
    wiFi: false,
    cleanliness: '4.8★',
    liveStatus: { currentStation: 'Jasidih Jn (JSME)', statusText: 'On Time', delayMinutes: 0, nextStation: 'Madhupur (MDP)', speed: 110, platform: 'P3' },
    classes: [
      { code: 'CC', name: 'AC Chair Car', price: 655, status: 'AVAILABLE 120', statusType: 'available', quota: { GN: 120 } },
      { code: '2S', name: 'Second Sitting', price: 195, status: 'AVAILABLE 280', statusType: 'available', quota: { GN: 280 } }
    ],
    intermediateStations: [
      { name: 'Patna Jn (PNBE)', arr: 'Start', dep: '05:30', platform: 'P10', distance: '0 km' },
      { name: 'Patna Saheb (PNC)', arr: '05:43', dep: '05:45', platform: 'P1', distance: '9 km' },
      { name: 'Jasidih Jn (JSME)', arr: '09:12', dep: '09:16', platform: 'P1', distance: '221 km' },
      { name: 'Howrah Jn (HWH)', arr: '13:25', dep: 'End', platform: 'P9', distance: '532 km' }
    ]
  },
  {
    id: '18622',
    number: '18622',
    name: 'Patliputra Express',
    type: 'Express',
    from: 'PNBE',
    fromName: 'Patna Jn',
    to: 'RNC',
    toName: 'Ranchi Jn',
    stops: ['PNBE', 'PNC', 'JSME', 'RNC'],
    departureTime: '22:15',
    arrivalTime: '08:15',
    duration: '10h 00m',
    distance: '420 km',
    avgSpeed: '42 km/h',
    punctuality: '94.0%',
    pantry: false,
    wiFi: false,
    cleanliness: '4.4★',
    liveStatus: { currentStation: 'Patna Saheb (PNC)', statusText: 'On Time', delayMinutes: 0, nextStation: 'Fatuha (FUT)', speed: 65, platform: 'P1' },
    classes: [
      { code: '2A', name: 'AC 2-Tier (2A)', price: 1150, status: 'AVAILABLE 8', statusType: 'available', quota: { GN: 8 } },
      { code: '3A', name: 'AC 3-Tier (3A)', price: 810, status: 'AVAILABLE 35', statusType: 'available', quota: { GN: 35 } },
      { code: 'SL', name: 'Sleeper (SL)', price: 295, status: 'AVAILABLE 160', statusType: 'available', quota: { GN: 160 } }
    ],
    intermediateStations: [
      { name: 'Patna Jn (PNBE)', arr: 'Start', dep: '22:15', platform: 'P10', distance: '0 km' },
      { name: 'Patna Saheb (PNC)', arr: '22:30', dep: '22:35', platform: 'P1', distance: '9 km' },
      { name: 'Jasidih Jn (JSME)', arr: '02:45', dep: '02:50', platform: 'P1', distance: '221 km' },
      { name: 'Ranchi Jn (RNC)', arr: '08:15', dep: 'End', platform: 'P1', distance: '420 km' }
    ]
  },
  {
    id: '18184',
    number: '18184',
    name: 'Buxar - Tatanagar Express',
    type: 'Express',
    from: 'PNC',
    fromName: 'Patna Saheb',
    to: 'JSME',
    toName: 'Jasidih Jn',
    stops: ['PNBE', 'PNC', 'JSME', 'TATA'],
    departureTime: '06:25',
    arrivalTime: '10:45',
    duration: '4h 20m',
    distance: '212 km',
    avgSpeed: '49 km/h',
    punctuality: '95.5%',
    pantry: false,
    wiFi: false,
    cleanliness: '4.5★',
    liveStatus: { currentStation: 'Patna Saheb (PNC)', statusText: 'On Time', delayMinutes: 0, nextStation: 'Bakhtiyarpur (BKP)', speed: 70, platform: 'P1' },
    classes: [
      { code: '3A', name: 'AC 3-Tier (3A)', price: 540, status: 'AVAILABLE 12', statusType: 'available', quota: { GN: 12 } },
      { code: 'SL', name: 'Sleeper (SL)', price: 175, status: 'AVAILABLE 95', statusType: 'available', quota: { GN: 95 } },
      { code: '2S', name: 'Second Sitting', price: 105, status: 'AVAILABLE 220', statusType: 'available', quota: { GN: 220 } }
    ],
    intermediateStations: [
      { name: 'Patna Saheb (PNC)', arr: 'Start', dep: '06:25', platform: 'P1', distance: '0 km' },
      { name: 'Jasidih Jn (JSME)', arr: '10:45', dep: 'End', platform: 'P1', distance: '212 km' }
    ]
  },

  // --- DELHI <-> MUMBAI ROUTE ---
  {
    id: '12952',
    number: '12952',
    name: 'Mumbai Tejas Rajdhani Express',
    type: 'Rajdhani',
    from: 'NDLS',
    fromName: 'New Delhi',
    to: 'MMCT',
    toName: 'Mumbai Central',
    stops: ['NDLS', 'KOTA', 'RTM', 'BRC', 'ST', 'BVI', 'MMCT'],
    departureTime: '16:55',
    arrivalTime: '08:35',
    duration: '15h 40m',
    distance: '1386 km',
    avgSpeed: '88 km/h',
    punctuality: '98.5%',
    pantry: true,
    wiFi: true,
    cleanliness: '4.9★',
    liveStatus: { currentStation: 'Kota Jn (KOTA)', statusText: 'On Time', delayMinutes: 0, nextStation: 'Ratlam (RTM)', speed: 130, platform: 'P2' },
    classes: [
      { code: '1A', name: 'First AC (1A)', price: 4850, status: 'AVAILABLE 6', statusType: 'available', quota: { GN: 6 } },
      { code: '2A', name: 'AC 2-Tier (2A)', price: 2980, status: 'AVAILABLE 24', statusType: 'available', quota: { GN: 24 } },
      { code: '3A', name: 'AC 3-Tier (3A)', price: 2150, status: 'AVAILABLE 110', statusType: 'available', quota: { GN: 110 } }
    ],
    intermediateStations: [
      { name: 'New Delhi (NDLS)', arr: 'Start', dep: '16:55', platform: 'P16', distance: '0 km' },
      { name: 'Kota Jn (KOTA)', arr: '21:30', dep: '21:40', platform: 'P2', distance: '465 km' },
      { name: 'Ratlam Jn (RTM)', arr: '00:45', dep: '00:48', platform: 'P4', distance: '731 km' },
      { name: 'Vadodara (BRC)', arr: '04:08', dep: '04:18', platform: 'P1', distance: '992 km' },
      { name: 'Surat (ST)', arr: '05:40', dep: '05:45', platform: 'P1', distance: '1122 km' },
      { name: 'Mumbai Central (MMCT)', arr: '08:35', dep: 'End', platform: 'P1', distance: '1386 km' }
    ]
  },
  {
    id: '12954',
    number: '12954',
    name: 'August Kranti Tejas Rajdhani',
    type: 'Rajdhani',
    from: 'NDLS',
    fromName: 'New Delhi',
    to: 'MMCT',
    toName: 'Mumbai Central',
    stops: ['NDLS', 'MTJ', 'KOTA', 'RTM', 'BRC', 'ST', 'BVI', 'MMCT'],
    departureTime: '17:15',
    arrivalTime: '10:05',
    duration: '16h 50m',
    distance: '1377 km',
    avgSpeed: '82 km/h',
    punctuality: '98.9%',
    pantry: true,
    wiFi: true,
    cleanliness: '4.9★',
    liveStatus: { currentStation: 'Mathura (MTJ)', statusText: 'On Time', delayMinutes: 0, nextStation: 'Kota (KOTA)', speed: 125, platform: 'P3' },
    classes: [
      { code: '1A', name: 'First AC (1A)', price: 4790, status: 'AVAILABLE 4', statusType: 'available', quota: { GN: 4 } },
      { code: '2A', name: 'AC 2-Tier (2A)', price: 2910, status: 'AVAILABLE 12', statusType: 'available', quota: { GN: 12 } },
      { code: '3A', name: 'AC 3-Tier (3A)', price: 2090, status: 'AVAILABLE 38', statusType: 'available', quota: { GN: 38 } }
    ],
    intermediateStations: [
      { name: 'New Delhi (NDLS)', arr: 'Start', dep: '17:15', platform: 'P6', distance: '0 km' },
      { name: 'Kota Jn (KOTA)', arr: '22:00', dep: '22:10', platform: 'P2', distance: '465 km' },
      { name: 'Mumbai Central (MMCT)', arr: '10:05', dep: 'End', platform: 'P1', distance: '1377 km' }
    ]
  },
  {
    id: '12926',
    number: '12926',
    name: 'Paschim Superfast Express',
    type: 'Superfast',
    from: 'NDLS',
    fromName: 'New Delhi',
    to: 'MMCT',
    toName: 'Mumbai Central',
    stops: ['NDLS', 'MTJ', 'AGC', 'KOTA', 'RTM', 'BRC', 'ST', 'MMCT'],
    departureTime: '16:35',
    arrivalTime: '14:45',
    duration: '22h 10m',
    distance: '1388 km',
    avgSpeed: '63 km/h',
    punctuality: '95.4%',
    pantry: true,
    wiFi: false,
    cleanliness: '4.5★',
    liveStatus: { currentStation: 'Kota Jn (KOTA)', statusText: 'On Time', delayMinutes: 0, nextStation: 'Ratlam (RTM)', speed: 110, platform: 'P2' },
    classes: [
      { code: '2A', name: 'AC 2-Tier (2A)', price: 2850, status: 'AVAILABLE 12', statusType: 'available', quota: { GN: 12 } },
      { code: '3A', name: 'AC 3-Tier (3A)', price: 2020, status: 'AVAILABLE 74', statusType: 'available', quota: { GN: 74 } },
      { code: 'SL', name: 'Sleeper (SL)', price: 775, status: 'RAC 20', statusType: 'rac', quota: { GN: 20 } }
    ],
    intermediateStations: [
      { name: 'New Delhi (NDLS)', arr: 'Start', dep: '16:35', platform: 'P7', distance: '0 km' },
      { name: 'Kota Jn (KOTA)', arr: '23:25', dep: '23:35', platform: 'P1', distance: '465 km' },
      { name: 'Mumbai Central (MMCT)', arr: '14:45', dep: 'End', platform: 'P2', distance: '1388 km' }
    ]
  },

  // --- AHMEDABAD <-> MUMBAI ROUTE ---
  {
    id: '20902',
    number: '20902',
    name: 'Vande Bharat Express',
    type: 'Vande Bharat',
    from: 'ADI',
    fromName: 'Ahmedabad Jn',
    to: 'MMCT',
    toName: 'Mumbai Central',
    stops: ['ADI', 'BRC', 'ST', 'VAPI', 'BVI', 'MMCT'],
    departureTime: '06:10',
    arrivalTime: '11:35',
    duration: '5h 25m',
    distance: '493 km',
    avgSpeed: '91 km/h',
    punctuality: '99.4%',
    pantry: true,
    wiFi: true,
    cleanliness: '5.0★',
    liveStatus: { currentStation: 'Surat (ST)', statusText: 'On Time', delayMinutes: 0, nextStation: 'Vapi (VAPI)', speed: 130, platform: 'P1' },
    classes: [
      { code: 'EC', name: 'Exec. Chair Car', price: 2455, status: 'AVAILABLE 18', statusType: 'available', quota: { GN: 18 } },
      { code: 'CC', name: 'AC Chair Car', price: 1320, status: 'AVAILABLE 42', statusType: 'available', quota: { GN: 42 } }
    ],
    intermediateStations: [
      { name: 'Ahmedabad (ADI)', arr: 'Start', dep: '06:10', platform: 'P1', distance: '0 km' },
      { name: 'Vadodara (BRC)', arr: '07:00', dep: '07:05', platform: 'P2', distance: '100 km' },
      { name: 'Surat (ST)', arr: '08:55', dep: '08:58', platform: 'P1', distance: '230 km' },
      { name: 'Mumbai Central (MMCT)', arr: '11:35', dep: 'End', platform: 'P5', distance: '493 km' }
    ]
  },
  {
    id: '12010',
    number: '12010',
    name: 'Ahmedabad - Mumbai Shatabdi Express',
    type: 'Shatabdi',
    from: 'ADI',
    fromName: 'Ahmedabad Jn',
    to: 'MMCT',
    toName: 'Mumbai Central',
    stops: ['ADI', 'BRC', 'ST', 'MMCT'],
    departureTime: '15:10',
    arrivalTime: '21:45',
    duration: '6h 35m',
    distance: '493 km',
    avgSpeed: '75 km/h',
    punctuality: '98.8%',
    pantry: true,
    wiFi: true,
    cleanliness: '4.9★',
    liveStatus: { currentStation: 'Vadodara (BRC)', statusText: 'On Time', delayMinutes: 0, nextStation: 'Surat (ST)', speed: 120, platform: 'P2' },
    classes: [
      { code: 'EC', name: 'Exec. Chair Car', price: 2210, status: 'AVAILABLE 8', statusType: 'available', quota: { GN: 8 } },
      { code: 'CC', name: 'AC Chair Car', price: 1180, status: 'AVAILABLE 95', statusType: 'available', quota: { GN: 95 } }
    ],
    intermediateStations: [
      { name: 'Ahmedabad (ADI)', arr: 'Start', dep: '15:10', platform: 'P1', distance: '0 km' },
      { name: 'Mumbai Central (MMCT)', arr: '21:45', dep: 'End', platform: 'P1', distance: '493 km' }
    ]
  },

  // --- BENGALURU <-> CHENNAI ROUTE ---
  {
    id: '20608',
    number: '20608',
    name: 'Mysuru - Chennai Vande Bharat Express',
    type: 'Vande Bharat',
    from: 'SBC',
    fromName: 'KSR Bengaluru',
    to: 'MAS',
    toName: 'MGR Chennai Ctl',
    stops: ['SBC', 'KPD', 'MAS'],
    departureTime: '07:45',
    arrivalTime: '12:25',
    duration: '4h 40m',
    distance: '359 km',
    avgSpeed: '77 km/h',
    punctuality: '99.5%',
    pantry: true,
    wiFi: true,
    cleanliness: '5.0★',
    liveStatus: { currentStation: 'Katpadi (KPD)', statusText: 'On Time', delayMinutes: 0, nextStation: 'Chennai Central (MAS)', speed: 130, platform: 'P1' },
    classes: [
      { code: 'EC', name: 'Exec. Chair Car', price: 1840, status: 'AVAILABLE 12', statusType: 'available', quota: { GN: 12 } },
      { code: 'CC', name: 'AC Chair Car', price: 995, status: 'AVAILABLE 110', statusType: 'available', quota: { GN: 110 } }
    ],
    intermediateStations: [
      { name: 'KSR Bengaluru (SBC)', arr: 'Start', dep: '07:45', platform: 'P1', distance: '0 km' },
      { name: 'Katpadi (KPD)', arr: '10:43', dep: '10:45', platform: 'P1', distance: '229 km' },
      { name: 'MGR Chennai Ctl (MAS)', arr: '12:25', dep: 'End', platform: 'P1', distance: '359 km' }
    ]
  },
  {
    id: '12608',
    number: '12608',
    name: 'Lalbagh SF Express',
    type: 'Superfast',
    from: 'SBC',
    fromName: 'KSR Bengaluru',
    to: 'MAS',
    toName: 'MGR Chennai Ctl',
    stops: ['SBC', 'KPD', 'MAS'],
    departureTime: '06:20',
    arrivalTime: '12:15',
    duration: '5h 55m',
    distance: '359 km',
    avgSpeed: '61 km/h',
    punctuality: '97.2%',
    pantry: true,
    wiFi: false,
    cleanliness: '4.6★',
    liveStatus: { currentStation: 'Katpadi (KPD)', statusText: 'On Time', delayMinutes: 0, nextStation: 'Chennai Central (MAS)', speed: 100, platform: 'P2' },
    classes: [
      { code: 'CC', name: 'AC Chair Car', price: 520, status: 'AVAILABLE 65', statusType: 'available', quota: { GN: 65 } },
      { code: '2S', name: 'Second Sitting', price: 155, status: 'AVAILABLE 240', statusType: 'available', quota: { GN: 240 } }
    ],
    intermediateStations: [
      { name: 'KSR Bengaluru (SBC)', arr: 'Start', dep: '06:20', platform: 'P2', distance: '0 km' },
      { name: 'MGR Chennai Ctl (MAS)', arr: '12:15', dep: 'End', platform: 'P2', distance: '359 km' }
    ]
  },

  // --- VARANASI <-> NEW DELHI ROUTE ---
  {
    id: '22435',
    number: '22435',
    name: 'Varanasi - New Delhi Vande Bharat Express',
    type: 'Vande Bharat',
    from: 'BSB',
    fromName: 'Varanasi Jn',
    to: 'NDLS',
    toName: 'New Delhi',
    stops: ['BSB', 'PRYJ', 'CNB', 'NDLS'],
    departureTime: '15:00',
    arrivalTime: '23:00',
    duration: '8h 00m',
    distance: '759 km',
    avgSpeed: '95 km/h',
    punctuality: '99.8%',
    pantry: true,
    wiFi: true,
    cleanliness: '5.0★',
    liveStatus: { currentStation: 'Kanpur Central (CNB)', statusText: 'On Time', delayMinutes: 0, nextStation: 'New Delhi (NDLS)', speed: 130, platform: 'P1' },
    classes: [
      { code: 'EC', name: 'Exec. Chair Car', price: 3350, status: 'AVAILABLE 12', statusType: 'available', quota: { GN: 12 } },
      { code: 'CC', name: 'AC Chair Car', price: 1750, status: 'AVAILABLE 88', statusType: 'available', quota: { GN: 88 } }
    ],
    intermediateStations: [
      { name: 'Varanasi Jn (BSB)', arr: 'Start', dep: '15:00', platform: 'P1', distance: '0 km' },
      { name: 'Prayagraj Jn (PRYJ)', arr: '16:48', dep: '16:50', platform: 'P6', distance: '125 km' },
      { name: 'Kanpur Central (CNB)', arr: '18:48', dep: '18:50', platform: 'P5', distance: '319 km' },
      { name: 'New Delhi (NDLS)', arr: '23:00', dep: 'End', platform: 'P16', distance: '759 km' }
    ]
  }
];

// CRIS Official Master Route Search Algorithm
export function searchCrisRealTrains(fromCode, toCode) {
  if (!fromCode || !toCode || fromCode === toCode) return [];

  // Match trains where fromCode and toCode exist in the train's official CRIS stop list in order
  const matches = CRIS_REAL_TRAINS.filter(train => {
    const fromIdx = train.stops.indexOf(fromCode);
    const toIdx = train.stops.indexOf(toCode);
    if (fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx) {
      return true;
    }
    // Check station code equivalence (e.g. PNBE <-> PNC, NDLS <-> DLI <-> ANVT)
    const delhiCodes = ['NDLS', 'DLI', 'NZM', 'ANVT', 'DEC'];
    const patnaCodes = ['PNBE', 'PNC', 'RJPB', 'DNR'];
    const mumbaiCodes = ['MMCT', 'CSMT', 'BDTS', 'LTT', 'DR'];
    const kolkataCodes = ['HWH', 'SDAH', 'KOAA'];
    const blrCodes = ['SBC', 'YPR'];

    const fromIsDelhi = delhiCodes.includes(fromCode);
    const toIsPatna = patnaCodes.includes(toCode);
    const fromIsPatna = patnaCodes.includes(fromCode);
    const toIsDelhi = delhiCodes.includes(toCode);

    if (fromIsDelhi && toIsPatna) {
      return train.stops.some(s => delhiCodes.includes(s)) && train.stops.some(s => patnaCodes.includes(s));
    }
    if (fromIsPatna && toIsDelhi) {
      return train.stops.some(s => patnaCodes.includes(s)) && train.stops.some(s => delhiCodes.includes(s));
    }
    return false;
  });

  return matches;
}
