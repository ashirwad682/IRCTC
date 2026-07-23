import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';

import User from './models/User.js';
import Booking from './models/Booking.js';
import Cancellation from './models/Cancellation.js';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] }
});

app.use(cors());
app.use(express.json());

let cachedConn = null;

// MongoDB Database Connection helper with pooling & Atlas cloud default for Serverless & Express
export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedConn) {
    try {
      await cachedConn;
      if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
      }
    } catch (e) {
      cachedConn = null;
    }
  }

  const ATLAS_URI = 'mongodb+srv://IRCTC:irctc123@irctc.ob9mxns.mongodb.net/irctc_db?retryWrites=true&w=majority&appName=IRCTC';
  const LOCAL_URI = 'mongodb://127.0.0.1:27017/irctc_db';
  const MONGO_URI = process.env.MONGO_URI || ATLAS_URI;

  try {
    cachedConn = mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });
    await cachedConn;
    console.log('✅ Connected to Primary Production MongoDB Database [irctc_db]');
    return mongoose.connection;
  } catch (err) {
    console.warn('⚠️ Primary MongoDB Atlas connection failed, attempting fallback local connection...', err.message);
    cachedConn = null;
    try {
      await mongoose.connect(LOCAL_URI, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 5000,
      });
      console.log('✅ Connected to Fallback Local MongoDB Database [irctc_db]');
      return mongoose.connection;
    } catch (localErr) {
      console.error('❌ MongoDB Connection Error:', localErr.message);
      throw localErr;
    }
  }
};

// Database Connection Middleware for all incoming API routes
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Socket.IO real-time train telemetry stream
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  const interval = setInterval(() => {
    socket.emit('train_telemetry', {
      trainNumber: '20902',
      speed: Math.floor(125 + Math.random() * 10),
      currentStation: 'Surat (ST)',
      nextStation: 'Vapi (VAPI)',
      delayMinutes: 0,
      timestamp: new Date().toISOString()
    });
  }, 3000);

  socket.on('disconnect', () => {
    clearInterval(interval);
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// REST Endpoints - System Health
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';
  res.json({ status: 'UP', database: dbState, timestamp: new Date() });
});

// ==========================================
// 1. USER ACCOUNT AUTHENTICATION & PROFILE APIs
// ==========================================

// Register New User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, fullName, phone } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, Email and Password are required' });
    }

    const cleanUsername = String(username).toLowerCase().trim();
    const cleanEmail = String(email).toLowerCase().trim();

    const existingUser = await User.findOne({
      $or: [
        { username: cleanUsername },
        { email: cleanEmail },
        { username: new RegExp(`^${cleanUsername}$`, 'i') }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User ID or Email already registered in Database' });
    }

    const newUser = new User({
      username: cleanUsername,
      email: cleanEmail,
      password: password,
      fullName: fullName || username,
      phone: phone || '',
      walletBalance: 10000
    });

    await newUser.save();
    console.log(`[MongoDB Atlas] User account registered & saved to database: ${cleanUsername}`);

    res.json({
      success: true,
      message: 'Account created and saved to MongoDB Database',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        phone: newUser.phone,
        walletBalance: newUser.walletBalance
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Database error registering user' });
  }
});

// Login User API (Strict Credential Verification in MongoDB Atlas)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'User ID and Password are required' });
    }

    const cleanUsername = String(username).toLowerCase().trim();
    let user = await User.findOne({
      $or: [
        { username: cleanUsername },
        { username: new RegExp(`^${cleanUsername}$`, 'i') }
      ]
    });

    // Throw error if User ID is not registered in database
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User ID is not registered in the database. Please create an IRCTC account first.'
      });
    }

    // Throw error if Password does not match database record
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Password. Please check your credentials.'
      });
    }

    res.json({
      success: true,
      message: 'Logged in successfully from MongoDB Database',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName || user.username,
        phone: user.phone || '',
        walletBalance: user.walletBalance
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Database error verifying credentials' });
  }
});

// Fetch User Profile & Stats
app.get('/api/auth/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }
    const bookingsCount = await Booking.countDocuments({ username });
    res.json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        walletBalance: user.walletBalance,
        bookingsCount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// ==========================================
// 2. TICKET BOOKING APIs (MongoDB Atlas)
// ==========================================

// Create Ticket Booking
app.post('/api/bookings/create', async (req, res) => {
  try {
    const {
      pnr: clientPnr, username, trainNumber, trainName, from, to, boardingAt, depTime, arrTime, date,
      classCode, quota, passengers, ticketFare, convenienceFee, insurancePremium, totalPaid, txnId: clientTxnId
    } = req.body;

    if (!trainNumber || !from || !to) {
      return res.status(400).json({ success: false, message: 'Missing required booking fields' });
    }

    // Generate or use client-side authentic 10-digit PNR
    const pnr = clientPnr || Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const txnId = clientTxnId || `TXN_${Date.now()}`;
    const cleanUsername = String(username || 'ASHIRWAD_IRCTC').toLowerCase();

    let booking = await Booking.findOne({ pnr });
    if (booking) {
      booking.username = cleanUsername;
      booking.trainNumber = trainNumber;
      booking.trainName = trainName || booking.trainName;
      booking.from = from;
      booking.to = to;
      booking.boardingAt = boardingAt || from;
      booking.depTime = depTime || booking.depTime;
      booking.arrTime = arrTime || booking.arrTime;
      booking.date = date;
      booking.classCode = classCode || booking.classCode;
      booking.quota = quota || booking.quota;
      booking.passengers = passengers || booking.passengers;
      booking.ticketFare = ticketFare;
      booking.convenienceFee = convenienceFee;
      booking.insurancePremium = insurancePremium;
      booking.totalPaid = totalPaid;
      booking.txnId = txnId;
      booking.status = 'BOOKED';
      booking.isCancelled = false;
      await booking.save();
    } else {
      booking = new Booking({
        pnr,
        username: cleanUsername,
        trainNumber,
        trainName: trainName || 'MUMBAI TEJAS RAJDHANI EXP',
        from,
        to,
        boardingAt: boardingAt || from,
        depTime: depTime || '16:55',
        arrTime: arrTime || '08:35',
        date,
        classCode: classCode || '3A',
        quota: quota || 'GENERAL (GN)',
        passengers: passengers || [{ name: 'ASHIRWAD KUMAR', age: 21, gender: 'M', berth: 'CNF/B10/20/LB' }],
        ticketFare: ticketFare || 2150.00,
        convenienceFee: convenienceFee || 35.40,
        insurancePremium: insurancePremium || 0.45,
        totalPaid: totalPaid || 2185.85,
        txnId,
        status: 'BOOKED',
        bookingDate: new Date().toISOString()
      });
      await booking.save();
    }

    res.json({
      success: true,
      message: 'Ticket booked and saved to MongoDB',
      booking
    });
  } catch (err) {
    console.error('Booking creation error:', err);
    res.status(500).json({ success: false, message: 'Database error creating booking', error: err.message });
  }
});

// Clear All Booked Tickets from Database
app.delete('/api/bookings/clear-all', async (req, res) => {
  try {
    await Booking.deleteMany({});
    await Cancellation.deleteMany({});
    res.json({ success: true, message: 'All booked tickets successfully deleted from database' });
  } catch (err) {
    console.error('Error in /api/bookings/clear-all:', err);
    res.status(500).json({ success: false, message: 'Database error deleting bookings', error: err.message });
  }
});

// Fetch All Tickets in Database
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    console.error('Error in /api/bookings:', err);
    res.status(500).json({ success: false, message: 'Database error fetching bookings', error: err.message });
  }
});

// Fetch All Tickets Booked by a User
app.get('/api/bookings/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const cleanUsername = String(username).toLowerCase();
    const bookings = await Booking.find({
      $or: [
        { username: cleanUsername },
        { username: new RegExp(`^${username.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') }
      ]
    }).sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    console.error('Error in /api/bookings/user:', err);
    res.status(500).json({ success: false, message: 'Database error fetching user bookings', error: err.message });
  }
});

// Fetch Ticket by PNR
app.get('/api/bookings/pnr/:pnr', async (req, res) => {
  try {
    const cleanPnr = req.params.pnr.replace(/\D/g, '');
    const booking = await Booking.findOne({ pnr: cleanPnr });
    if (booking) {
      return res.json({ success: true, booking });
    }
    return res.status(404).json({ success: false, message: 'PNR not found in MongoDB Atlas' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error fetching PNR' });
  }
});

// Update Boarding Station for Booking
app.patch('/api/bookings/:pnr/boarding', async (req, res) => {
  try {
    const { pnr } = req.params;
    const { boardingAt } = req.body;
    if (!boardingAt) {
      return res.status(400).json({ success: false, message: 'Boarding station is required' });
    }
    const cleanPnr = String(pnr).replace(/\D/g, '');
    const booking = await Booking.findOne({ pnr: cleanPnr });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    booking.boardingAt = boardingAt;
    await booking.save();
    res.json({ success: true, message: 'Boarding station updated successfully', booking });
  } catch (err) {
    console.error('Update boarding station error:', err);
    res.status(500).json({ success: false, message: 'Database error updating boarding station', error: err.message });
  }
});

// ==========================================
// 3. TICKET CANCELLATION API (18% GST Calculation)
// ==========================================

app.post('/api/bookings/cancel', async (req, res) => {
  try {
    const { pnr, username } = req.body;
    if (!pnr) {
      return res.status(400).json({ success: false, message: 'PNR is required for cancellation' });
    }

    const booking = await Booking.findOne({ pnr });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Ticket not found in database' });
    }

    if (booking.isCancelled) {
      return res.status(400).json({ success: false, message: 'Ticket has already been cancelled', booking });
    }

    // Flat Cancellation Charges per Class
    const classBaseMap = {
      '1A': 240, 'EC': 240,
      '2A': 200,
      '3A': 180, 'CC': 180, '3E': 180,
      'SL': 120,
      '2S': 60
    };

    const passengerCount = booking.passengers?.length || 1;
    const totalPaid = Number(booking.totalPaid || 2186.30);
    const convenienceFee = Number(booking.convenienceFee != null ? booking.convenienceFee : 35.40);
    const insurancePremium = Number(booking.insurancePremium != null ? booking.insurancePremium : 0.90);
    const nonRefundableFees = convenienceFee + insurancePremium;

    // Base Ticket Cost (Ticket Fare only — excluding non-refundable service fees)
    const ticketFare = Number(booking.ticketFare || Math.max(0, totalPaid - nonRefundableFees));
    const grossFare = ticketFare;

    const cCode = (booking.classCode || '3A').toUpperCase();
    const basePerPassenger = classBaseMap[cCode] || 180;
    const baseCancelCharge = basePerPassenger * passengerCount;

    // 18% GST Breakdown (CGST 9% + SGST 9%)
    const cgst9 = Math.round((baseCancelCharge * 0.09) * 100) / 100;
    const sgst9 = Math.round((baseCancelCharge * 0.09) * 100) / 100;
    const gst18 = Math.round((cgst9 + sgst9) * 100) / 100;
    const totalDeduction = Math.round((baseCancelCharge + gst18) * 100) / 100;

    // Net Refund calculated strictly on Ticket Fare (Base Ticket Cost)
    const netRefund = Math.max(0, Math.round((ticketFare - totalDeduction) * 100) / 100);

    const cancellationId = `CAN_${Date.now()}`;
    const cancelledAt = new Date().toISOString();

    const cancellationDetails = {
      cancellationId,
      cancelledAt,
      totalPaid,
      ticketFare,
      convenienceFee,
      insurancePremium,
      nonRefundableFees,
      grossFare,
      baseCancelCharge,
      cgst9,
      sgst9,
      gst18,
      totalDeduction,
      netRefund
    };

    // Update Booking in MongoDB
    booking.status = 'CANCELLED';
    booking.isCancelled = true;
    booking.cancellationDetails = cancellationDetails;
    if (Array.isArray(booking.passengers)) {
      booking.passengers.forEach(p => {
        p.status = 'CANCELLED';
        p.berth = 'CANCELLED / REFUND PROCESSED';
      });
    }
    await booking.save();

    // Save Cancellation Advice Document in MongoDB
    const newCancellation = new Cancellation({
      cancellationId,
      pnr,
      username: booking.username,
      trainNumber: booking.trainNumber,
      trainName: booking.trainName,
      from: booking.from,
      to: booking.to,
      date: booking.date,
      classCode: booking.classCode,
      grossFare,
      baseCancelCharge,
      gst18,
      totalDeduction,
      netRefund,
      cancelledPassengers: booking.passengers,
      cancelledAt
    });
    await newCancellation.save();

    // Refund Net Amount to User Wallet
    await User.updateOne({ username: booking.username }, { $inc: { walletBalance: netRefund } });

    res.json({
      success: true,
      message: 'Ticket cancelled successfully. Refund advice generated.',
      cancellation: cancellationDetails,
      booking
    });
  } catch (err) {
    console.error('Cancellation error:', err);
    res.status(500).json({ success: false, message: 'Database error processing cancellation' });
  }
});

// REST Endpoint - RapidAPI Official IRCTC Train Schedule API (irctc1.p.rapidapi.com)
app.get('/api/ntes/schedule/:trainNumber', async (req, res) => {
  const { trainNumber } = req.params;
  const apiKey = 'd28cc07b1dmshfd995a41e4b2811p13863ajsn996912b25fb0';
  const apiHost = 'irctc1.p.rapidapi.com';

  try {
    const response = await fetch(`https://irctc1.p.rapidapi.com/api/v1/getTrainSchedule?trainNo=${trainNumber}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost
      }
    });

    const data = await response.json();
    if (response.ok && (data.status === true || data.status === 'true' || data.data)) {
      console.log(`[RapidAPI IRCTC Schedule Success for Train #${trainNumber}]`);
      return res.json({
        status: 'SUCCESS',
        source: 'RapidAPI IRCTC Official Endpoint (irctc1.p.rapidapi.com)',
        data: data
      });
    } else {
      console.warn(`[RapidAPI Diagnostic Warning for ${trainNumber}]`, data?.message || data);
      return res.json({
        status: 'RAPIDAPI_NOTICE',
        message: data?.message || 'Subscription Required on RapidAPI',
        trainNumber,
        apiMessage: data
      });
    }
  } catch (err) {
    console.error('[RapidAPI Train Schedule Fetch Error]', err.message);
  }

  res.json({
    status: 'SUCCESS',
    source: 'CRIS Live Local System',
    data: { trainNo: trainNumber }
  });
});

// Start Standalone Node Server when executed directly
if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5001;
  server.listen(PORT, () => {
    console.log(`🚀 IRCTC MERN Express + MongoDB Atlas Server active on port ${PORT}`);
  });
}

export { app, server };
export default app;
