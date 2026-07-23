export const STATIONS = [
  { code: 'NDLS', name: 'New Delhi', city: 'New Delhi', state: 'Delhi', platforms: 16 },
  { code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra', platforms: 9 },
  { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat', platforms: 12 },
  { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi', state: 'Uttar Pradesh', platforms: 9 },
  { code: 'SBC', name: 'KSR Bengaluru City', city: 'Bengaluru', state: 'Karnataka', platforms: 10 },
  { code: 'MAS', name: 'MGR Chennai Central', city: 'Chennai', state: 'Tamil Nadu', platforms: 12 },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal', platforms: 23 },
  { code: 'PNBE', name: 'Patna Junction', city: 'Patna', state: 'Bihar', platforms: 10 },
  { code: 'HYB', name: 'Hyderabad Deccan', city: 'Hyderabad', state: 'Telangana', platforms: 6 }
];

export const TRAINS = [
  {
    id: '20902',
    number: '20902',
    name: 'Vande Bharat Express',
    type: 'Vande Bharat',
    from: 'ADI',
    fromName: 'Ahmedabad Jn',
    to: 'MMCT',
    toName: 'Mumbai Central',
    departureTime: '06:10',
    arrivalTime: '11:35',
    duration: '5h 25m',
    distance: '493 km',
    avgSpeed: '91 km/h',
    punctuality: '99.4%',
    pantry: true,
    wiFi: true,
    cleanliness: '5.0★',
    liveStatus: {
      currentStation: 'Surat (ST)',
      statusText: 'On Time',
      delayMinutes: 0,
      nextStation: 'Vapi (VAPI)',
      speed: 130,
      platform: 'Platform 1'
    },
    classes: [
      { code: 'EC', name: 'Exec. Chair Car', price: 2455, status: 'AVAILABLE 18', statusType: 'available', quota: { GN: 18, TQ: 4, PT: 2, LD: 0, ST: 6, DP: 4, SS: 6 } },
      { code: 'CC', name: 'AC Chair Car', price: 1320, status: 'AVAILABLE 42', statusType: 'available', quota: { GN: 42, TQ: 12, PT: 6, LD: 8, ST: 14, DP: 8, SS: 12 } }
    ],
    intermediateStations: [
      { name: 'Ahmedabad (ADI)', arr: 'Start', dep: '06:10', platform: 'P1', distance: '0 km' },
      { name: 'Vadodara (BRC)', arr: '07:00', dep: '07:05', platform: 'P2', distance: '100 km' },
      { name: 'Surat (ST)', arr: '08:55', dep: '08:58', platform: 'P1', distance: '230 km' },
      { name: 'Vapi (VAPI)', arr: '10:02', dep: '10:04', platform: 'P2', distance: '325 km' },
      { name: 'Borivali (BVI)', arr: '11:00', dep: '11:02', platform: 'P7', distance: '463 km' },
      { name: 'Mumbai Central (MMCT)', arr: '11:35', dep: 'End', platform: 'P5', distance: '493 km' }
    ]
  },
  {
    id: '12952',
    number: '12952',
    name: 'New Delhi Tejas Rajdhani Express',
    type: 'Rajdhani',
    from: 'NDLS',
    fromName: 'New Delhi',
    to: 'MMCT',
    toName: 'Mumbai Central',
    departureTime: '16:55',
    arrivalTime: '08:35',
    duration: '15h 40m',
    distance: '1386 km',
    avgSpeed: '88 km/h',
    punctuality: '98.2%',
    pantry: true,
    wiFi: true,
    cleanliness: '4.9★',
    liveStatus: {
      currentStation: 'Kota Jn (KOTA)',
      statusText: 'Delayed by 4 mins',
      delayMinutes: 4,
      nextStation: 'Ratlam Jn (RTM)',
      speed: 120,
      platform: 'Platform 2'
    },
    classes: [
      { code: '1A', name: 'First AC (1A)', price: 4850, status: 'AVAILABLE 6', statusType: 'available', quota: { GN: 6, TQ: 0, PT: 0, LD: 2, ST: 2, DP: 2, SS: 2 } },
      { code: '2A', name: 'AC 2-Tier (2A)', price: 2980, status: 'RAC 4', statusType: 'rac', quota: { GN: 4, TQ: 8, PT: 4, LD: 6, ST: 8, DP: 4, SS: 6 } },
      { code: '3A', name: 'AC 3-Tier (3A)', price: 2150, status: 'WL 14', statusType: 'wl', quota: { GN: 14, TQ: 25, PT: 10, LD: 12, ST: 16, DP: 8, SS: 10 } }
    ],
    intermediateStations: [
      { name: 'New Delhi (NDLS)', arr: 'Start', dep: '16:55', platform: 'P16', distance: '0 km' },
      { name: 'Kota Jn (KOTA)', arr: '21:30', dep: '21:40', platform: 'P2', distance: '465 km' },
      { name: 'Ratlam Jn (RTM)', arr: '00:45', dep: '00:48', platform: 'P4', distance: '731 km' },
      { name: 'Vadodara Jn (BRC)', arr: '04:08', dep: '04:18', platform: 'P1', distance: '992 km' },
      { name: 'Surat (ST)', arr: '05:40', dep: '05:45', platform: 'P1', distance: '1122 km' },
      { name: 'Mumbai Central (MMCT)', arr: '08:35', dep: 'End', platform: 'P1', distance: '1386 km' }
    ]
  },
  {
    id: '12954',
    number: '12954',
    name: 'August Kranti Tejas Rajdhani Express',
    type: 'Rajdhani',
    from: 'NDLS',
    fromName: 'New Delhi',
    to: 'MMCT',
    toName: 'Mumbai Central',
    departureTime: '17:15',
    arrivalTime: '10:05',
    duration: '16h 50m',
    distance: '1377 km',
    avgSpeed: '82 km/h',
    punctuality: '98.9%',
    pantry: true,
    wiFi: true,
    cleanliness: '4.9★',
    liveStatus: {
      currentStation: 'Mathura Jn (MTJ)',
      statusText: 'On Time',
      delayMinutes: 0,
      nextStation: 'Kota Jn (KOTA)',
      speed: 125,
      platform: 'Platform 3'
    },
    classes: [
      { code: '1A', name: 'First AC (1A)', price: 4790, status: 'AVAILABLE 4', statusType: 'available', quota: { GN: 4, ST: 2, DP: 2, SS: 2 } },
      { code: '2A', name: 'AC 2-Tier (2A)', price: 2910, status: 'AVAILABLE 12', statusType: 'available', quota: { GN: 12, ST: 6, DP: 4, SS: 4 } },
      { code: '3A', name: 'AC 3-Tier (3A)', price: 2090, status: 'AVAILABLE 38', statusType: 'available', quota: { GN: 38, ST: 12, DP: 6, SS: 8 } }
    ],
    intermediateStations: [
      { name: 'New Delhi (NDLS)', arr: 'Start', dep: '17:15', platform: 'P6', distance: '0 km' },
      { name: 'Kota Jn (KOTA)', arr: '22:00', dep: '22:10', platform: 'P2', distance: '465 km' },
      { name: 'Mumbai Central (MMCT)', arr: '10:05', dep: 'End', platform: 'P1', distance: '1377 km' }
    ]
  },
  {
    id: '22436',
    number: '22436',
    name: 'Vande Bharat Express (Varanasi)',
    type: 'Vande Bharat',
    from: 'NDLS',
    fromName: 'New Delhi',
    to: 'BSB',
    toName: 'Varanasi Jn',
    departureTime: '06:00',
    arrivalTime: '14:00',
    duration: '8h 00m',
    distance: '759 km',
    avgSpeed: '95 km/h',
    punctuality: '99.8%',
    pantry: true,
    wiFi: true,
    cleanliness: '5.0★',
    liveStatus: {
      currentStation: 'Kanpur Central (CNB)',
      statusText: 'On Time',
      delayMinutes: 0,
      nextStation: 'Prayagraj Jn (PRYJ)',
      speed: 130,
      platform: 'Platform 5'
    },
    classes: [
      { code: 'EC', name: 'Exec. Chair Car', price: 3350, status: 'AVAILABLE 12', statusType: 'available', quota: { GN: 12, TQ: 2, PT: 2, LD: 0, ST: 4, DP: 2, SS: 4 } },
      { code: 'CC', name: 'AC Chair Car', price: 1750, status: 'AVAILABLE 88', statusType: 'available', quota: { GN: 88, TQ: 30, PT: 15, LD: 10, ST: 20, DP: 10, SS: 16 } }
    ],
    intermediateStations: [
      { name: 'New Delhi (NDLS)', arr: 'Start', dep: '06:00', platform: 'P16', distance: '0 km' },
      { name: 'Kanpur Central (CNB)', arr: '10:08', dep: '10:10', platform: 'P5', distance: '440 km' },
      { name: 'Prayagraj Jn (PRYJ)', arr: '12:08', dep: '12:10', platform: 'P6', distance: '634 km' },
      { name: 'Varanasi Jn (BSB)', arr: '14:00', dep: 'End', platform: 'P1', distance: '759 km' }
    ]
  },
  {
    id: '12628',
    number: '12628',
    name: 'Karnataka Superfast Express',
    type: 'Superfast',
    from: 'NDLS',
    fromName: 'New Delhi',
    to: 'SBC',
    toName: 'KSR Bengaluru',
    departureTime: '20:20',
    arrivalTime: '12:00',
    duration: '39h 40m',
    distance: '2405 km',
    avgSpeed: '61 km/h',
    punctuality: '94.5%',
    pantry: true,
    wiFi: false,
    cleanliness: '4.4★',
    liveStatus: {
      currentStation: 'Bhopal Jn (BPL)',
      statusText: 'On Time',
      delayMinutes: 0,
      nextStation: 'Itarsi Jn (ET)',
      speed: 110,
      platform: 'Platform 1'
    },
    classes: [
      { code: '1A', name: 'First AC (1A)', price: 5690, status: 'WL 2', statusType: 'wl', quota: { GN: 2, TQ: 0, PT: 0, LD: 0, ST: 1, DP: 1, SS: 1 } },
      { code: '2A', name: 'AC 2-Tier (2A)', price: 3340, status: 'AVAILABLE 15', statusType: 'available', quota: { GN: 15, TQ: 6, PT: 4, LD: 4, ST: 8, DP: 4, SS: 6 } },
      { code: '3A', name: 'AC 3-Tier (3A)', price: 2280, status: 'AVAILABLE 110', statusType: 'available', quota: { GN: 110, TQ: 40, PT: 20, LD: 15, ST: 30, DP: 15, SS: 20 } },
      { code: 'SL', name: 'Sleeper (SL)', price: 865, status: 'RAC 12', statusType: 'rac', quota: { GN: 12, TQ: 50, PT: 25, LD: 30, ST: 40, DP: 20, SS: 25 } }
    ],
    intermediateStations: [
      { name: 'New Delhi (NDLS)', arr: 'Start', dep: '20:20', platform: 'P3', distance: '0 km' },
      { name: 'Agra Cantt (AGC)', arr: '22:48', dep: '22:50', platform: 'P1', distance: '195 km' },
      { name: 'KSR Bengaluru (SBC)', arr: '12:00', dep: 'End', platform: 'P1', distance: '2405 km' }
    ]
  },
  {
    id: '12840',
    number: '12840',
    name: 'Howrah - Chennai Mail',
    type: 'Superfast Mail',
    from: 'HWH',
    fromName: 'Howrah Jn',
    to: 'MAS',
    toName: 'Chennai Central',
    departureTime: '23:00',
    arrivalTime: '03:40',
    duration: '28h 40m',
    distance: '1661 km',
    avgSpeed: '58 km/h',
    punctuality: '96.0%',
    pantry: true,
    wiFi: false,
    cleanliness: '4.6★',
    liveStatus: {
      currentStation: 'Visakhapatnam (VSKP)',
      statusText: 'Delayed by 8 mins',
      delayMinutes: 8,
      nextStation: 'Vijayawada (BZA)',
      speed: 95,
      platform: 'Platform 8'
    },
    classes: [
      { code: '2A', name: 'AC 2-Tier (2A)', price: 2790, status: 'AVAILABLE 8', statusType: 'available', quota: { GN: 8, TQ: 4, PT: 2, LD: 2, ST: 4, DP: 2, SS: 4 } },
      { code: '3A', name: 'AC 3-Tier (3A)', price: 1910, status: 'AVAILABLE 45', statusType: 'available', quota: { GN: 45, TQ: 15, PT: 8, LD: 10, ST: 15, DP: 8, SS: 12 } },
      { code: '3E', name: '3-Tier Economy', price: 1780, status: 'AVAILABLE 62', statusType: 'available', quota: { GN: 62, TQ: 20, PT: 10, LD: 10, ST: 20, DP: 10, SS: 14 } },
      { code: 'SL', name: 'Sleeper (SL)', price: 710, status: 'AVAILABLE 140', statusType: 'available', quota: { GN: 140, TQ: 60, PT: 30, LD: 20, ST: 50, DP: 25, SS: 30 } }
    ],
    intermediateStations: [
      { name: 'Howrah Jn (HWH)', arr: 'Start', dep: '23:00', platform: 'P21', distance: '0 km' },
      { name: 'Chennai Central (MAS)', arr: '03:40', dep: 'End', platform: 'P3', distance: '1661 km' }
    ]
  },
  {
    id: '12302',
    number: '12302',
    name: 'Howrah Rajdhani Express',
    type: 'Rajdhani',
    from: 'HWH',
    fromName: 'Howrah Jn',
    to: 'NDLS',
    toName: 'New Delhi',
    departureTime: '14:05',
    arrivalTime: '09:55',
    duration: '19h 50m',
    distance: '1441 km',
    avgSpeed: '73 km/h',
    punctuality: '97.8%',
    pantry: true,
    wiFi: true,
    cleanliness: '4.8★',
    liveStatus: { currentStation: 'Prayagraj Jn (PRYJ)', statusText: 'On Time', delayMinutes: 0, nextStation: 'Kanpur Central (CNB)', speed: 120, platform: 'Platform 4' },
    classes: [
      { code: '1A', name: 'First AC (1A)', price: 5200, status: 'AVAILABLE 4', statusType: 'available', quota: { GN: 4, TQ: 2, LD: 2, ST: 2 } },
      { code: '2A', name: 'AC 2-Tier (2A)', price: 3100, status: 'AVAILABLE 18', statusType: 'available', quota: { GN: 18, TQ: 8, LD: 4, ST: 6 } },
      { code: '3A', name: 'AC 3-Tier (3A)', price: 2200, status: 'WL 6', statusType: 'wl', quota: { GN: 6, TQ: 20, LD: 8, ST: 14 } }
    ],
    intermediateStations: [
      { name: 'Howrah Jn (HWH)', arr: 'Start', dep: '14:05', platform: 'P1', distance: '0 km' },
      { name: 'Dhanbad Jn (DHN)', arr: '17:22', dep: '17:25', platform: 'P1', distance: '261 km' },
      { name: 'Prayagraj Jn (PRYJ)', arr: '23:58', dep: '00:00', platform: 'P4', distance: '794 km' },
      { name: 'Kanpur Central (CNB)', arr: '02:00', dep: '02:05', platform: 'P1', distance: '968 km' },
      { name: 'New Delhi (NDLS)', arr: '09:55', dep: 'End', platform: 'P16', distance: '1441 km' }
    ]
  },
  {
    id: '12309',
    number: '12309',
    name: 'RJPB Tejas Rajdhani Express',
    type: 'Rajdhani',
    from: 'PNBE',
    fromName: 'Patna Jn',
    to: 'NDLS',
    toName: 'New Delhi',
    departureTime: '19:05',
    arrivalTime: '08:35',
    duration: '13h 30m',
    distance: '997 km',
    avgSpeed: '74 km/h',
    punctuality: '98.1%',
    pantry: true,
    wiFi: true,
    cleanliness: '4.9★',
    liveStatus: { currentStation: 'Mughal Sarai Jn (MGS)', statusText: 'On Time', delayMinutes: 0, nextStation: 'Prayagraj Jn (PRYJ)', speed: 110, platform: 'Platform 2' },
    classes: [
      { code: '1A', name: 'First AC (1A)', price: 3850, status: 'AVAILABLE 6', statusType: 'available', quota: { GN: 6, TQ: 2, LD: 2, ST: 2 } },
      { code: '2A', name: 'AC 2-Tier (2A)', price: 2280, status: 'AVAILABLE 22', statusType: 'available', quota: { GN: 22, TQ: 8, LD: 4, ST: 6 } },
      { code: '3A', name: 'AC 3-Tier (3A)', price: 1620, status: 'AVAILABLE 68', statusType: 'available', quota: { GN: 68, TQ: 28, LD: 12, ST: 18 } }
    ],
    intermediateStations: [
      { name: 'Patna Jn (PNBE)', arr: 'Start', dep: '19:05', platform: 'P10', distance: '0 km' },
      { name: 'Mughal Sarai (MGS)', arr: '21:30', dep: '21:35', platform: 'P2', distance: '188 km' },
      { name: 'Prayagraj Jn (PRYJ)', arr: '23:40', dep: '23:45', platform: 'P6', distance: '365 km' },
      { name: 'Kanpur Central (CNB)', arr: '01:38', dep: '01:40', platform: 'P1', distance: '539 km' },
      { name: 'New Delhi (NDLS)', arr: '08:35', dep: 'End', platform: 'P16', distance: '997 km' }
    ]
  },
  {
    id: '12318',
    number: '12318',
    name: 'Akal Takht Express',
    type: 'Superfast',
    from: 'NDLS',
    fromName: 'New Delhi',
    to: 'PNBE',
    toName: 'Patna Jn',
    departureTime: '16:35',
    arrivalTime: '05:05',
    duration: '12h 30m',
    distance: '997 km',
    avgSpeed: '80 km/h',
    punctuality: '96.5%',
    pantry: true,
    wiFi: false,
    cleanliness: '4.5★',
    liveStatus: { currentStation: 'Kanpur Central (CNB)', statusText: 'Delayed by 10 mins', delayMinutes: 10, nextStation: 'Prayagraj Jn (PRYJ)', speed: 100, platform: 'Platform 3' },
    classes: [
      { code: '2A', name: 'AC 2-Tier (2A)', price: 2150, status: 'AVAILABLE 10', statusType: 'available', quota: { GN: 10, TQ: 6, LD: 4, ST: 6 } },
      { code: '3A', name: 'AC 3-Tier (3A)', price: 1540, status: 'AVAILABLE 55', statusType: 'available', quota: { GN: 55, TQ: 25, LD: 10, ST: 20 } },
      { code: 'SL', name: 'Sleeper (SL)', price: 590, status: 'RAC 8', statusType: 'rac', quota: { GN: 8, TQ: 60, LD: 25, ST: 40 } }
    ],
    intermediateStations: [
      { name: 'New Delhi (NDLS)', arr: 'Start', dep: '16:35', platform: 'P12', distance: '0 km' },
      { name: 'Kanpur Central (CNB)', arr: '21:25', dep: '21:30', platform: 'P1', distance: '440 km' },
      { name: 'Prayagraj Jn (PRYJ)', arr: '23:35', dep: '23:40', platform: 'P6', distance: '634 km' },
      { name: 'Mughal Sarai (MGS)', arr: '01:50', dep: '01:55', platform: 'P2', distance: '809 km' },
      { name: 'Patna Jn (PNBE)', arr: '05:05', dep: 'End', platform: 'P10', distance: '997 km' }
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
    departureTime: '18:30',
    arrivalTime: '11:15',
    duration: '16h 45m',
    distance: '1388 km',
    avgSpeed: '83 km/h',
    punctuality: '95.4%',
    pantry: true,
    wiFi: false,
    cleanliness: '4.5★',
    liveStatus: { currentStation: 'Mathura Jn (MTJ)', statusText: 'On Time', delayMinutes: 0, nextStation: 'Kota Jn (KOTA)', speed: 110, platform: 'Platform 2' },
    classes: [
      { code: '2A', name: 'AC 2-Tier (2A)', price: 2850, status: 'AVAILABLE 12', statusType: 'available', quota: { GN: 12, TQ: 8, LD: 4, ST: 8 } },
      { code: '3A', name: 'AC 3-Tier (3A)', price: 2020, status: 'AVAILABLE 74', statusType: 'available', quota: { GN: 74, TQ: 30, LD: 14, ST: 22 } },
      { code: 'SL', name: 'Sleeper (SL)', price: 775, status: 'RAC 20', statusType: 'rac', quota: { GN: 20, TQ: 70, LD: 30, ST: 45 } }
    ],
    intermediateStations: [
      { name: 'New Delhi (NDLS)', arr: 'Start', dep: '18:30', platform: 'P7', distance: '0 km' },
      { name: 'Kota Jn (KOTA)', arr: '23:25', dep: '23:35', platform: 'P1', distance: '465 km' },
      { name: 'Vadodara (BRC)', arr: '05:50', dep: '06:00', platform: 'P2', distance: '992 km' },
      { name: 'Surat (ST)', arr: '07:25', dep: '07:30', platform: 'P1', distance: '1122 km' },
      { name: 'Mumbai Central (MMCT)', arr: '11:15', dep: 'End', platform: 'P2', distance: '1388 km' }
    ]
  },
  {
    id: '12432',
    number: '12432',
    name: 'Rajdhani Express',
    type: 'Rajdhani',
    from: 'NDLS',
    fromName: 'New Delhi',
    to: 'HWH',
    toName: 'Howrah Jn',
    departureTime: '16:10',
    arrivalTime: '10:00',
    duration: '17h 50m',
    distance: '1441 km',
    avgSpeed: '81 km/h',
    punctuality: '97.2%',
    pantry: true,
    wiFi: true,
    cleanliness: '4.8★',
    liveStatus: { currentStation: 'Kanpur Central (CNB)', statusText: 'On Time', delayMinutes: 0, nextStation: 'Prayagraj Jn (PRYJ)', speed: 115, platform: 'Platform 1' },
    classes: [
      { code: '1A', name: 'First AC (1A)', price: 5050, status: 'AVAILABLE 2', statusType: 'available', quota: { GN: 2, TQ: 0, LD: 2 } },
      { code: '2A', name: 'AC 2-Tier (2A)', price: 3010, status: 'AVAILABLE 14', statusType: 'available', quota: { GN: 14, TQ: 6, LD: 4, ST: 6 } },
      { code: '3A', name: 'AC 3-Tier (3A)', price: 2150, status: 'AVAILABLE 88', statusType: 'available', quota: { GN: 88, TQ: 30, LD: 12, ST: 20 } }
    ],
    intermediateStations: [
      { name: 'New Delhi (NDLS)', arr: 'Start', dep: '16:10', platform: 'P16', distance: '0 km' },
      { name: 'Kanpur Central (CNB)', arr: '21:00', dep: '21:05', platform: 'P1', distance: '440 km' },
      { name: 'Prayagraj (PRYJ)', arr: '23:10', dep: '23:12', platform: 'P4', distance: '634 km' },
      { name: 'Gaya Jn (GAYA)', arr: '02:30', dep: '02:32', platform: 'P2', distance: '1016 km' },
      { name: 'Dhanbad (DHN)', arr: '04:30', dep: '04:32', platform: 'P1', distance: '1180 km' },
      { name: 'Howrah Jn (HWH)', arr: '10:00', dep: 'End', platform: 'P1', distance: '1441 km' }
    ]
  }
];

export const FOOD_PARTNERS = [
  {
    id: 'f1',
    name: "Haldiram's Express",
    rating: '4.8★',
    prepTime: '25 min',
    logo: '🍲',
    cuisine: 'North Indian & Thalis',
    items: [
      { id: 'm1', name: 'Royal Executive Veg Thali', price: 280, veg: true, tag: 'Bestseller', desc: 'Paneer Butter Masala, Dal Makhani, Jeera Rice, 2 Butter Naan, Gulab Jamun, Salad' },
      { id: 'm2', name: 'Chole Bhature (2 Pcs)', price: 160, veg: true, tag: 'Hot & Fresh', desc: 'Authentic Punjabi spicy chole with fluffy bhature & pickled onions' },
      { id: 'm3', name: 'Paneer Tikka Roll', price: 190, veg: true, tag: 'Quick Bite', desc: 'Smoky grilled paneer tikka wrapped in layered paratha with mint chutney' }
    ]
  },
  {
    id: 'f2',
    name: "Domino's On Train",
    rating: '4.7★',
    prepTime: '20 min',
    logo: '🍕',
    cuisine: 'Pizzas & Beverages',
    items: [
      { id: 'm4', name: 'Peppy Paneer Medium Pizza', price: 440, veg: true, tag: 'Rail Favorite', desc: 'Paneer, capsicum, red paprika with cheese burst crust option' },
      { id: 'm5', name: 'Non-Veg Supreme Pizza', price: 590, veg: false, tag: 'Bestseller', desc: 'Pepperoni, grilled chicken, sausage & fresh jalapeños' },
      { id: 'm6', name: 'Garlic Breadsticks + Dip', price: 140, veg: true, tag: 'Snack', desc: 'Freshly baked seasoned breadsticks with spicy cheesy dip' }
    ]
  },
  {
    id: 'f3',
    name: "IRCTC Premium Catering",
    rating: '4.9★',
    prepTime: '15 min',
    logo: '🍳',
    cuisine: 'Multi-Cuisine Train Specials',
    items: [
      { id: 'm7', name: 'Hyderabadi Dum Biryani (Chicken)', price: 320, veg: false, tag: 'Chef Special', desc: 'Slow-cooked aromatic basmati rice with marinated chicken & raita' },
      { id: 'm8', name: 'South Indian Mini Tiffin', price: 180, veg: true, tag: 'Healthy', desc: '2 Idli, 1 Vada, Masala Dosa, Sambar & 2 Chutneys' },
      { id: 'm9', name: 'Masala Chai & Samosa Combo', price: 90, veg: true, tag: 'Classic', desc: 'Hot kulhad tea served with 2 crispy potato samosas' }
    ]
  }
];

import { searchCrisRealTrains } from './crisTrainDatabase';

export function getTrainsForRoute(fromCode, toCode) {
  if (!fromCode || !toCode || fromCode === toCode) return [];

  // 1. Search authentic CRIS Indian Railways Database for real trains operating on this route
  const crisMatches = searchCrisRealTrains(fromCode, toCode);
  if (crisMatches && crisMatches.length > 0) {
    return crisMatches;
  }

  // 2. Direct matches in TRAINS array
  const directMatches = TRAINS.filter(t => t.from === fromCode && t.to === toCode);
  if (directMatches.length > 0) return directMatches;

  // Station code map fallback
  const stationMap = {
    NDLS: 'NEW DELHI', DLI: 'OLD DELHI JN', NZM: 'HAZRAT NIZAMUDDIN', ANVT: 'ANAND VIHAR TERMINAL', DEC: 'DELHI CANTT',
    PNBE: 'PATNA JN', PNC: 'PATNA SAHEB', RJPB: 'RAJENDRANAGAR T', DNR: 'DANAPUR', GAYA: 'GAYA JN', MFP: 'MUZAFFARPUR JN',
    JSME: 'JASIDIH JN', RNC: 'RANCHI JN', DHN: 'DHANBAD JN', TATA: 'TATANAGAR JN', HWH: 'HOWRAH JN', SDAH: 'SEALDAH',
    MMCT: 'MUMBAI CENTRAL', CSMT: 'MUMBAI CSMT', BDTS: 'BANDRA TERMINAL', LTT: 'LOKMANYA TILAK TERM', PUNE: 'PUNE JN',
    ADI: 'AHMEDABAD JN', ST: 'SURAT', BRC: 'VADODARA JN', JP: 'JAIPUR JN', JU: 'JODHPUR JN', KOTA: 'KOTA JN',
    CNB: 'KANPUR CENTRAL', LKO: 'LUCKNOW NR', BSB: 'VARANASI JN', DDU: 'DD UPADHYAYA JN', PRYJ: 'PRAYAGRAJ JN',
    BPL: 'BHOPAL JN', INDB: 'INDORE JN', JBP: 'JABALPUR JN', MAS: 'MGR CHENNAI CTL', SBC: 'KSR BENGALURU',
    SC: 'SECUNDERABAD JN', VSKP: 'VISAKHAPATNAM', BZA: 'VIJAYAWADA JN', GHY: 'GUWAHATI', BBS: 'BHUBANESWAR'
  };

  const fromName = stationMap[fromCode] || `${fromCode} JN`;
  const toName = stationMap[toCode] || `${toCode} JN`;

  // Dynamic realistic IRCTC trains connecting any selected source & destination
  const dynamicTrains = [
    {
      id: `${fromCode}_${toCode}_20901`,
      number: '20901',
      name: `${fromName} - ${toName} Vande Bharat Express`,
      type: 'Vande Bharat',
      from: fromCode,
      fromName: fromName,
      to: toCode,
      toName: toName,
      departureTime: '06:00',
      arrivalTime: '13:45',
      duration: '7h 45m',
      distance: '780 km',
      avgSpeed: '101 km/h',
      punctuality: '99.5%',
      pantry: true,
      wiFi: true,
      cleanliness: '5.0★',
      liveStatus: { currentStation: `${fromName} (Platform 1)`, statusText: 'On Time', delayMinutes: 0, nextStation: 'En Route', speed: 130, platform: 'Platform 1' },
      classes: [
        { code: 'EC', name: 'Exec. Chair Car', price: 2850, status: 'AVAILABLE 14', statusType: 'available', quota: { GN: 14, TQ: 4, PT: 2, LD: 0, ST: 4, DP: 2, SS: 4 } },
        { code: 'CC', name: 'AC Chair Car', price: 1540, status: 'AVAILABLE 62', statusType: 'available', quota: { GN: 62, TQ: 18, PT: 8, LD: 10, ST: 16, DP: 8, SS: 12 } }
      ],
      intermediateStations: [
        { name: `${fromName} (${fromCode})`, arr: 'Start', dep: '06:00', platform: 'P1', distance: '0 km' },
        { name: `Junction Station 1`, arr: '08:30', dep: '08:33', platform: 'P2', distance: '260 km' },
        { name: `Junction Station 2`, arr: '11:15', dep: '11:18', platform: 'P1', distance: '520 km' },
        { name: `${toName} (${toCode})`, arr: '13:45', dep: 'End', platform: 'P3', distance: '780 km' }
      ]
    },
    {
      id: `${fromCode}_${toCode}_12301`,
      number: '12301',
      name: `${fromName} Tejas Rajdhani Express`,
      type: 'Rajdhani',
      from: fromCode,
      fromName: fromName,
      to: toCode,
      toName: toName,
      departureTime: '16:55',
      arrivalTime: '07:30',
      duration: '14h 35m',
      distance: '1140 km',
      avgSpeed: '85 km/h',
      punctuality: '98.4%',
      pantry: true,
      wiFi: true,
      cleanliness: '4.9★',
      liveStatus: { currentStation: 'En Route', statusText: 'On Time', delayMinutes: 0, nextStation: 'Upcoming Stop', speed: 120, platform: 'Platform 2' },
      classes: [
        { code: '1A', name: 'First AC (1A)', price: 4450, status: 'AVAILABLE 4', statusType: 'available', quota: { GN: 4, TQ: 0, LD: 2, ST: 2 } },
        { code: '2A', name: 'AC 2-Tier (2A)', price: 2780, status: 'AVAILABLE 18', statusType: 'available', quota: { GN: 18, TQ: 8, LD: 4, ST: 6 } },
        { code: '3A', name: 'AC 3-Tier (3A)', price: 1980, status: 'AVAILABLE 76', statusType: 'available', quota: { GN: 76, TQ: 24, LD: 10, ST: 18 } }
      ],
      intermediateStations: [
        { name: `${fromName} (${fromCode})`, arr: 'Start', dep: '16:55', platform: 'P16', distance: '0 km' },
        { name: `Major Junction 1`, arr: '21:30', dep: '21:40', platform: 'P2', distance: '410 km' },
        { name: `Major Junction 2`, arr: '01:15', dep: '01:20', platform: 'P1', distance: '750 km' },
        { name: `${toName} (${toCode})`, arr: '07:30', dep: 'End', platform: 'P1', distance: '1140 km' }
      ]
    },
    {
      id: `${fromCode}_${toCode}_12833`,
      number: '12833',
      name: `${fromName} - ${toName} Superfast Express`,
      type: 'Superfast',
      from: fromCode,
      fromName: fromName,
      to: toCode,
      toName: toName,
      departureTime: '12:20',
      arrivalTime: '02:40',
      duration: '14h 20m',
      distance: '920 km',
      avgSpeed: '72 km/h',
      punctuality: '96.2%',
      pantry: true,
      wiFi: false,
      cleanliness: '4.6★',
      liveStatus: { currentStation: 'City Junction', statusText: 'Delayed 5m', delayMinutes: 5, nextStation: 'Central Station', speed: 105, platform: 'Platform 3' },
      classes: [
        { code: '2A', name: 'AC 2-Tier (2A)', price: 2150, status: 'AVAILABLE 8', statusType: 'available', quota: { GN: 8, TQ: 4, LD: 4, ST: 4 } },
        { code: '3A', name: 'AC 3-Tier (3A)', price: 1520, status: 'AVAILABLE 48', statusType: 'available', quota: { GN: 48, TQ: 16, LD: 8, ST: 14 } },
        { code: '3E', name: '3-Tier Economy', price: 1390, status: 'AVAILABLE 55', statusType: 'available', quota: { GN: 55, TQ: 20, LD: 10, ST: 15 } },
        { code: 'SL', name: 'Sleeper (SL)', price: 580, status: 'RAC 12', statusType: 'rac', quota: { GN: 12, TQ: 45, LD: 20, ST: 30 } }
      ],
      intermediateStations: [
        { name: `${fromName} (${fromCode})`, arr: 'Start', dep: '12:20', platform: 'P3', distance: '0 km' },
        { name: `Regional Stop 1`, arr: '15:10', dep: '15:15', platform: 'P2', distance: '210 km' },
        { name: `Regional Stop 2`, arr: '19:40', dep: '19:45', platform: 'P1', distance: '550 km' },
        { name: `${toName} (${toCode})`, arr: '02:40', dep: 'End', platform: 'P4', distance: '920 km' }
      ]
    },
    {
      id: `${fromCode}_${toCode}_12296`,
      number: '12296',
      name: `${fromName} Sampark Kranti Express`,
      type: 'Superfast Mail',
      from: fromCode,
      fromName: fromName,
      to: toCode,
      toName: toName,
      departureTime: '20:00',
      arrivalTime: '11:15',
      duration: '15h 15m',
      distance: '1050 km',
      avgSpeed: '75 km/h',
      punctuality: '97.1%',
      pantry: true,
      wiFi: false,
      cleanliness: '4.7★',
      liveStatus: { currentStation: 'En Route', statusText: 'On Time', delayMinutes: 0, nextStation: 'Next Station', speed: 110, platform: 'Platform 1' },
      classes: [
        { code: '1A', name: 'First AC (1A)', price: 4120, status: 'AVAILABLE 2', statusType: 'available', quota: { GN: 2, TQ: 0, LD: 1 } },
        { code: '2A', name: 'AC 2-Tier (2A)', price: 2490, status: 'AVAILABLE 12', statusType: 'available', quota: { GN: 12, TQ: 6, LD: 4, ST: 6 } },
        { code: '3A', name: 'AC 3-Tier (3A)', price: 1780, status: 'AVAILABLE 94', statusType: 'available', quota: { GN: 94, TQ: 30, LD: 12, ST: 20 } },
        { code: 'SL', name: 'Sleeper (SL)', price: 650, status: 'AVAILABLE 120', statusType: 'available', quota: { GN: 120, TQ: 50, LD: 25, ST: 35 } }
      ],
      intermediateStations: [
        { name: `${fromName} (${fromCode})`, arr: 'Start', dep: '20:00', platform: 'P5', distance: '0 km' },
        { name: `Central Junction`, arr: '02:30', dep: '02:35', platform: 'P1', distance: '480 km' },
        { name: `${toName} (${toCode})`, arr: '11:15', dep: 'End', platform: 'P2', distance: '1050 km' }
      ]
    },
    {
      id: `${fromCode}_${toCode}_12024`,
      number: '12024',
      name: `${fromName} Jan Shatabdi Express`,
      type: 'Jan Shatabdi',
      from: fromCode,
      fromName: fromName,
      to: toCode,
      toName: toName,
      departureTime: '15:30',
      arrivalTime: '21:45',
      duration: '6h 15m',
      distance: '420 km',
      avgSpeed: '68 km/h',
      punctuality: '98.9%',
      pantry: false,
      wiFi: false,
      cleanliness: '4.8★',
      liveStatus: { currentStation: 'On Schedule', statusText: 'On Time', delayMinutes: 0, nextStation: 'Upcoming Junction', speed: 90, platform: 'Platform 2' },
      classes: [
        { code: 'CC', name: 'AC Chair Car', price: 920, status: 'AVAILABLE 140', statusType: 'available', quota: { GN: 140, TQ: 40, LD: 20, ST: 30 } },
        { code: '2S', name: 'Second Sitting', price: 280, status: 'AVAILABLE 310', statusType: 'available', quota: { GN: 310, TQ: 90, LD: 40, ST: 60 } }
      ],
      intermediateStations: [
        { name: `${fromName} (${fromCode})`, arr: 'Start', dep: '15:30', platform: 'P2', distance: '0 km' },
        { name: `Intermediate Station 1`, arr: '17:40', dep: '17:42', platform: 'P1', distance: '150 km' },
        { name: `Intermediate Station 2`, arr: '19:30', dep: '19:32', platform: 'P3', distance: '280 km' },
        { name: `${toName} (${toCode})`, arr: '21:45', dep: 'End', platform: 'P1', distance: '420 km' }
      ]
    }
  ];

  return directMatches.length > 0 ? [...directMatches, ...dynamicTrains] : dynamicTrains;
}
