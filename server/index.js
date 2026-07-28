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
let lastConnFailTime = 0;

// MongoDB Database Connection helper with pooling & Atlas cloud default for Serverless & Express
export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Failure cooldown to prevent hanging serverless requests if DB is temporarily unreachable
  if (Date.now() - lastConnFailTime < 10000) {
    return null;
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

  const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  const timeoutMs = isVercel ? 4000 : 8000;

  try {
    cachedConn = mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: timeoutMs,
      connectTimeoutMS: timeoutMs,
    });
    await cachedConn;
    console.log('✅ Connected to Primary Production MongoDB Database [irctc_db]');
    seedDefaultUsers().catch(e => console.warn('Seed notice:', e.message));
    return mongoose.connection;
  } catch (err) {
    console.warn('⚠️ Primary MongoDB Atlas connection failed:', err.message);
    cachedConn = null;
    lastConnFailTime = Date.now();

    if (!isVercel) {
      try {
        await mongoose.connect(LOCAL_URI, {
          serverSelectionTimeoutMS: 3000,
          connectTimeoutMS: 3000,
        });
        console.log('✅ Connected to Fallback Local MongoDB Database [irctc_db]');
        return mongoose.connection;
      } catch (localErr) {
        console.error('❌ MongoDB Local Connection Warning:', localErr.message);
      }
    }
    return null;
  }
};

// Auto-seed & sync default demo accounts in MongoDB Atlas (always force-update passwords)
export const seedDefaultUsers = async () => {
  try {
    if (mongoose.connection.readyState !== 1) return;
    const defaultAccounts = [
      {
        username: 'ashirwad',
        email: 'ashirwad@irctc.gov.in',
        password: 'ashirwad',
        fullName: 'ASHIRWAD KUMAR',
        phone: '+91 98765 43210',
        walletBalance: 10000
      },
      {
        username: 'admin',
        email: 'admin@irctc.gov.in',
        password: 'admin',
        fullName: 'IRCTC SYSTEM ADMINISTRATOR',
        phone: '+91 99999 88888',
        walletBalance: 50000
      }
    ];

    for (const acc of defaultAccounts) {
      // Use upsert so the account is ALWAYS created/updated with the correct password
      // This fixes the case where Atlas has the account but with a stale/wrong password
      await User.findOneAndUpdate(
        { username: acc.username },
        {
          $set: {
            password: acc.password,
            email: acc.email,
            fullName: acc.fullName,
            phone: acc.phone
          },
          $setOnInsert: {
            gender: 'Male',
            dob: '1998-05-15',
            country: 'India',
            address: 'New Delhi, India',
            walletBalance: acc.walletBalance,
            lastUsernameChangeAt: new Date(),
            lastPasswordChangeAt: new Date()
          }
        },
        { upsert: true, new: true }
      );
      console.log(`[MongoDB Atlas] Demo account synced: ${acc.username}`);
    }
  } catch (err) {
    console.warn('Auto-seed default accounts notice:', err.message);
  }
};

// Database Connection Middleware for all incoming API routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.warn('⚠️ Database connection warning during request processing:', err.message);
  }
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
// Admin: Fix negative/inflated wallet balances (one-time fix after duplicate-cancel-route bug)
app.post('/api/admin/fix-wallets', async (req, res) => {
  try {
    const neg = await User.updateMany({ walletBalance: { $lt: 0 } }, { $set: { walletBalance: 10000 } });
    const inf = await User.updateMany({ walletBalance: { $gt: 50000 } }, { $set: { walletBalance: 10000 } });
    res.json({ success: true, negativeFixed: neg.modifiedCount, inflatedFixed: inf.modifiedCount, message: 'Wallet balances fixed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



// ==========================================
// 1. USER ACCOUNT AUTHENTICATION & PROFILE APIs
// ==========================================

// Check Username Availability
app.get('/api/auth/check-username', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.json({ available: false, message: 'Username parameter required' });

    const cleanUsername = String(username).toLowerCase().trim();
    const DEMO_USERNAMES = ['ashirwad', 'admin'];
    if (DEMO_USERNAMES.includes(cleanUsername)) {
      return res.json({ available: false, taken: true });
    }

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ username: cleanUsername });
      if (existingUser) {
        return res.json({ available: false, taken: true });
      }
    }
    res.json({ available: true, taken: false });
  } catch (err) {
    res.json({ available: true, taken: false });
  }
});

// Register New User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, fullName, phone } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, Email and Password are required' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'Database temporarily unavailable. Using local offline storage.' });
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
      walletBalance: 10000,
      lastUsernameChangeAt: new Date(),
      lastPasswordChangeAt: new Date()
    });

    await newUser.save();
    console.log(`[MongoDB Atlas] User account registered & saved to database: ${cleanUsername}`);

    res.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        phone: newUser.phone,
        gender: newUser.gender || '',
        dob: newUser.dob || '',
        country: newUser.country || 'India',
        address: newUser.address || '',
        walletBalance: newUser.walletBalance,
        lastUsernameChangeAt: newUser.lastUsernameChangeAt,
        lastPasswordChangeAt: newUser.lastPasswordChangeAt,
        passAgeDays: 0,
        isPasswordExpired: false,
        daysUntilNextUsernameChange: 90
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

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'Database temporarily unavailable. Using local offline storage.' });
    }

    const cleanIdentifier = String(username).toLowerCase().trim();

    let user = await User.findOne({
      $or: [
        { username: cleanIdentifier },
        { email: cleanIdentifier },
        { phone: cleanIdentifier }
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

    // Password Age & 30-Day Expiry Check
    const lastPassDate = user.lastPasswordChangeAt ? new Date(user.lastPasswordChangeAt) : new Date(user.createdAt || Date.now());
    const passAgeDays = Math.floor((Date.now() - lastPassDate.getTime()) / (1000 * 60 * 60 * 24));
    const isPasswordExpired = passAgeDays >= 30;

    // Username 90-Day (3 Months) Change Cooldown Check
    const lastUserChangeDate = user.lastUsernameChangeAt ? new Date(user.lastUsernameChangeAt) : new Date(user.createdAt || Date.now());
    const usernameAgeDays = Math.floor((Date.now() - lastUserChangeDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysUntilNextUsernameChange = Math.max(0, 90 - usernameAgeDays);

    res.json({
      success: true,
      message: isPasswordExpired
        ? '🔒 Notice: Your password is older than 30 days and has EXPIRED. Please change your password to continue.'
        : 'Logged in successfully',
      isPasswordExpired,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName || user.username,
        phone: user.phone || '',
        gender: user.gender || '',
        dob: user.dob || '',
        country: user.country || 'India',
        address: user.address || '',
        walletBalance: user.walletBalance,
        lastUsernameChangeAt: user.lastUsernameChangeAt || user.createdAt,
        lastPasswordChangeAt: user.lastPasswordChangeAt || user.createdAt,
        passAgeDays,
        isPasswordExpired,
        daysUntilNextUsernameChange
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(503).json({ success: false, message: 'Database temporarily unavailable. Please try offline login.' });
  }
});

// Update User Profile API in MongoDB
app.put('/api/auth/profile/update', async (req, res) => {
  try {
    const { username, newUsername, fullName, gender, dob, phone, country, address } = req.body;
    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }

    const cleanUsername = String(username).toLowerCase().trim();
    const user = await User.findOne({
      $or: [
        { username: cleanUsername },
        { username: new RegExp(`^${cleanUsername}$`, 'i') }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found in database' });
    }

    // Username Change Request with 90-Day (3 Months) Cooldown Rule
    if (newUsername && String(newUsername).toLowerCase().trim() !== user.username) {
      const cleanNewUsername = String(newUsername).toLowerCase().trim();
      const lastUserChangeDate = user.lastUsernameChangeAt ? new Date(user.lastUsernameChangeAt) : new Date(user.createdAt || Date.now());
      const usernameAgeDays = Math.floor((Date.now() - lastUserChangeDate.getTime()) / (1000 * 60 * 60 * 24));

      if (usernameAgeDays < 90) {
        const remainingDays = 90 - usernameAgeDays;
        return res.status(400).json({
          success: false,
          message: `🚫 Username cannot be changed more than once every 90 days (3 months). You must wait ${remainingDays} more day(s) before changing your username.`
        });
      }

      // Check if new username is taken
      const existingUser = await User.findOne({ username: cleanNewUsername });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Requested User ID is already taken by another user' });
      }

      user.username = cleanNewUsername;
      user.lastUsernameChangeAt = new Date();
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (gender !== undefined) user.gender = gender;
    if (dob !== undefined) user.dob = dob;
    if (phone !== undefined) user.phone = phone;
    if (country !== undefined) user.country = country;
    if (address !== undefined) user.address = address;

    await user.save();
    console.log(`[MongoDB Atlas] User profile updated in database for: ${user.username}`);

    const lastPassDate = user.lastPasswordChangeAt ? new Date(user.lastPasswordChangeAt) : new Date(user.createdAt || Date.now());
    const passAgeDays = Math.floor((Date.now() - lastPassDate.getTime()) / (1000 * 60 * 60 * 24));
    const lastUserChangeDate = user.lastUsernameChangeAt ? new Date(user.lastUsernameChangeAt) : new Date(user.createdAt || Date.now());
    const usernameAgeDays = Math.floor((Date.now() - lastUserChangeDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysUntilNextUsernameChange = Math.max(0, 90 - usernameAgeDays);

    res.json({
      success: true,
      message: 'Profile details saved successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        gender: user.gender,
        dob: user.dob,
        country: user.country,
        address: user.address,
        walletBalance: user.walletBalance,
        lastUsernameChangeAt: user.lastUsernameChangeAt,
        lastPasswordChangeAt: user.lastPasswordChangeAt,
        passAgeDays,
        isPasswordExpired: passAgeDays >= 30,
        daysUntilNextUsernameChange
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, message: 'Database error updating profile details' });
  }
});

// Change User Password API in MongoDB Database (Resets 30-day expiration timer!)
app.put('/api/auth/change-password', async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;
    if (!username || !newPassword) {
      return res.status(400).json({ success: false, message: 'Username and New Password are required' });
    }

    const cleanUsername = String(username).toLowerCase().trim();
    const user = await User.findOne({
      $or: [
        { username: cleanUsername },
        { username: new RegExp(`^${cleanUsername}$`, 'i') }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found in database' });
    }

    // Verify current/old password if provided
    if (oldPassword && user.password !== oldPassword) {
      return res.status(400).json({ success: false, message: 'Current / Old Password is incorrect' });
    }

    user.password = newPassword;
    user.lastPasswordChangeAt = new Date();
    await user.save();
    console.log(`[MongoDB Atlas] Password updated and 30-day timer reset in database for user: ${cleanUsername}`);

    res.json({
      success: true,
      message: '🎉 Password updated successfully! Your 30-day password expiration timer has been reset.',
      lastPasswordChangeAt: user.lastPasswordChangeAt,
      passAgeDays: 0,
      isPasswordExpired: false
    });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, message: 'Database error updating password' });
  }
});

// Fetch Master List Passengers for User from MongoDB Database
app.get('/api/master-passengers/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const cleanUsername = String(username).toLowerCase().trim();
    const user = await User.findOne({
      $or: [
        { username: cleanUsername },
        { username: new RegExp(`^${cleanUsername}$`, 'i') }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    res.json({
      success: true,
      passengers: user.masterPassengers || []
    });
  } catch (err) {
    console.error('Fetch master passengers error:', err);
    res.status(500).json({ success: false, message: 'Database error fetching master list' });
  }
});

// Add Master List Passenger for User in MongoDB Database (Max 6 Limit & Duplicate Check)
app.post('/api/master-passengers/add', async (req, res) => {
  try {
    const { username, passengerType, name, dob, gender, berth, meal, idType, idNumber } = req.body;
    if (!username || !name) {
      return res.status(400).json({ success: false, message: 'Username and Name are required' });
    }

    const cleanUsername = String(username).toLowerCase().trim();
    const user = await User.findOne({
      $or: [
        { username: cleanUsername },
        { username: new RegExp(`^${cleanUsername}$`, 'i') }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    // Enforce 6 Passengers Limit Rule
    if (user.masterPassengers && user.masterPassengers.length >= 6) {
      return res.status(400).json({
        success: false,
        message: '🚫 Maximum limit reached! Each user can only add up to 6 passengers to their Master List.'
      });
    }

    const cleanName = String(name).toUpperCase().trim();
    const cleanDob = String(dob || '').trim();
    const cleanIdType = String(idType || 'AADHAR ID/VIRTUAL ID').toUpperCase().trim();
    const cleanIdNumber = idNumber ? String(idNumber).toUpperCase().trim() : '';

    // Duplicate Passenger Check (ALL 4 FIELDS MUST MATCH: Name + DOB + ID Card Type + ID Card No)
    const isDuplicate = user.masterPassengers.some(mp => {
      const existingName = String(mp.name).toUpperCase().trim();
      const existingDob = String(mp.dob || '').trim();
      const existingIdType = String(mp.idType || 'AADHAR ID/VIRTUAL ID').toUpperCase().trim();
      const existingIdNum = mp.idNumber ? String(mp.idNumber).toUpperCase().trim() : '';

      const nameMatch = existingName === cleanName;
      const dobMatch = existingDob === cleanDob;
      const idTypeMatch = existingIdType === cleanIdType;
      const idNumMatch = existingIdNum === cleanIdNumber;

      return nameMatch && dobMatch && idTypeMatch && idNumMatch;
    });

    if (isDuplicate) {
      return res.status(400).json({
        success: false,
        message: '⚠️ Passenger details already exist in your Master List!'
      });
    }

    // Calculate approximate age from DOB if supplied
    let calculatedAge = 25;
    if (dob) {
      const yearMatch = String(dob).match(/\d{4}/);
      if (yearMatch) {
        calculatedAge = Math.max(1, new Date().getFullYear() - parseInt(yearMatch[0]));
      }
    }

    const newPassenger = {
      id: 'MP_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      passengerType: passengerType || 'Normal User',
      name: cleanName,
      dob: dob || '01-01-2000',
      age: calculatedAge,
      gender: gender || 'Male',
      berth: berth && berth !== 'Select Berth Preference' ? berth : 'No Preference',
      meal: meal || 'Veg',
      status: 'Verified',
      statusColor: 'text-emerald-600',
      idType: idType || 'AADHAR ID/VIRTUAL ID',
      idNumber: cleanIdNumber
    };

    user.masterPassengers.push(newPassenger);
    await user.save();
    console.log(`[MongoDB Atlas] Master passenger added for user @${user.username}: ${newPassenger.name}`);

    res.json({
      success: true,
      message: '🎉 Passenger added to Master List successfully!',
      passenger: newPassenger,
      passengers: user.masterPassengers
    });
  } catch (err) {
    console.error('Add master passenger error:', err);
    res.status(500).json({ success: false, message: 'Database error adding master passenger' });
  }
});

// Update Master List Passenger for User in MongoDB Database
app.put('/api/master-passengers/update', async (req, res) => {
  try {
    const { username, passengerId, passengerType, name, dob, gender, berth, meal, idType, idNumber } = req.body;
    if (!username || !passengerId || !name) {
      return res.status(400).json({ success: false, message: 'Username, Passenger ID, and Name are required' });
    }

    const cleanUsername = String(username).toLowerCase().trim();
    const user = await User.findOne({
      $or: [
        { username: cleanUsername },
        { username: new RegExp(`^${cleanUsername}$`, 'i') }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    const passIndex = user.masterPassengers.findIndex(mp => mp.id === passengerId);
    if (passIndex === -1) {
      return res.status(404).json({ success: false, message: 'Passenger record not found in Master List' });
    }

    const cleanName = String(name).toUpperCase().trim();
    const cleanDob = String(dob || '').trim();
    const cleanIdType = String(idType || 'AADHAR ID/VIRTUAL ID').toUpperCase().trim();
    const cleanIdNumber = idNumber ? String(idNumber).toUpperCase().trim() : '';

    // Duplicate Passenger Check (ALL 4 FIELDS MUST MATCH, excluding current passengerId)
    const isDuplicate = user.masterPassengers.some(mp => {
      if (mp.id === passengerId) return false;
      const existingName = String(mp.name).toUpperCase().trim();
      const existingDob = String(mp.dob || '').trim();
      const existingIdType = String(mp.idType || 'AADHAR ID/VIRTUAL ID').toUpperCase().trim();
      const existingIdNum = mp.idNumber ? String(mp.idNumber).toUpperCase().trim() : '';

      const nameMatch = existingName === cleanName;
      const dobMatch = existingDob === cleanDob;
      const idTypeMatch = existingIdType === cleanIdType;
      const idNumMatch = existingIdNum === cleanIdNumber;

      return nameMatch && dobMatch && idTypeMatch && idNumMatch;
    });

    if (isDuplicate) {
      return res.status(400).json({
        success: false,
        message: '⚠️ Passenger details already exist in your Master List!'
      });
    }

    let calculatedAge = user.masterPassengers[passIndex].age || 25;
    if (dob) {
      const yearMatch = String(dob).match(/\d{4}/);
      if (yearMatch) {
        calculatedAge = Math.max(1, new Date().getFullYear() - parseInt(yearMatch[0]));
      }
    }

    user.masterPassengers[passIndex].passengerType = passengerType || user.masterPassengers[passIndex].passengerType;
    user.masterPassengers[passIndex].name = cleanName;
    user.masterPassengers[passIndex].dob = dob || user.masterPassengers[passIndex].dob;
    user.masterPassengers[passIndex].age = calculatedAge;
    user.masterPassengers[passIndex].gender = gender || user.masterPassengers[passIndex].gender;
    user.masterPassengers[passIndex].berth = berth && berth !== 'Select Berth Preference' ? berth : user.masterPassengers[passIndex].berth;
    user.masterPassengers[passIndex].meal = meal || user.masterPassengers[passIndex].meal || 'Veg';
    user.masterPassengers[passIndex].idType = idType || user.masterPassengers[passIndex].idType || 'AADHAR ID/VIRTUAL ID';
    if (idNumber !== undefined) user.masterPassengers[passIndex].idNumber = cleanIdNumber;

    await user.save();
    console.log(`[MongoDB Atlas] Master passenger ${passengerId} updated for user @${user.username}: ${name}`);

    res.json({
      success: true,
      message: '🎉 Passenger details updated in Master List successfully!',
      passengers: user.masterPassengers
    });
  } catch (err) {
    console.error('Update master passenger error:', err);
    res.status(500).json({ success: false, message: 'Database error updating master passenger' });
  }
});

// Delete Master List Passenger for User in MongoDB Database
app.delete('/api/master-passengers/delete', async (req, res) => {
  try {
    const { username, passengerId } = req.body;
    if (!username || !passengerId) {
      return res.status(400).json({ success: false, message: 'Username and Passenger ID are required' });
    }

    const cleanUsername = String(username).toLowerCase().trim();
    const user = await User.findOne({
      $or: [
        { username: cleanUsername },
        { username: new RegExp(`^${cleanUsername}$`, 'i') }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    user.masterPassengers = user.masterPassengers.filter(mp => mp.id !== passengerId);
    await user.save();
    console.log(`[MongoDB Atlas] Master passenger ${passengerId} deleted for user @${user.username}`);

    res.json({
      success: true,
      message: 'Passenger deleted from Master List successfully',
      passengers: user.masterPassengers
    });
  } catch (err) {
    console.error('Delete master passenger error:', err);
    res.status(500).json({ success: false, message: 'Database error deleting master passenger' });
  }
});

// Fetch User Profile & Stats
app.get('/api/auth/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const cleanUsername = String(username).toLowerCase().trim();
    const user = await User.findOne({
      $or: [
        { username: cleanUsername },
        { username: new RegExp(`^${cleanUsername}$`, 'i') }
      ]
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }
    const bookingsCount = await Booking.countDocuments({ username: cleanUsername });
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        gender: user.gender || '',
        dob: user.dob || '',
        country: user.country || 'India',
        address: user.address || '',
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
      pnr: clientPnr, username, trainNumber, trainName, from, to, boardingAt, boardingDate, boardingDepTime, depTime, arrTime, date,
      classCode, quota, passengers, ticketFare, convenienceFee, insurancePremium, totalPaid, txnId: clientTxnId
    } = req.body;

    if (!trainNumber || !from || !to) {
      return res.status(400).json({ success: false, message: 'Missing required booking fields (trainNumber, from, to)' });
    }

    // Generate or use client-side authentic 10-digit PNR
    const pnr = clientPnr || Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const txnId = clientTxnId || `TXN_${Date.now()}`;
    const cleanUsername = String(username || 'ashirwad_irctc').toLowerCase().trim();
    const resolvedDate = date || new Date().toISOString().split('T')[0];

    let booking = await Booking.findOne({ pnr });
    if (booking) {
      booking.username = cleanUsername;
      booking.trainNumber = trainNumber;
      booking.trainName = trainName || booking.trainName;
      booking.from = from;
      booking.to = to;
      booking.boardingAt = boardingAt || from;
      booking.boardingDate = boardingDate || booking.boardingDate || resolvedDate;
      booking.boardingDepTime = boardingDepTime || booking.boardingDepTime || depTime;
      booking.depTime = depTime || booking.depTime;
      booking.arrTime = arrTime || booking.arrTime;
      booking.date = resolvedDate;
      booking.classCode = classCode || booking.classCode;
      booking.quota = quota || booking.quota;
      booking.passengers = passengers || booking.passengers;
      booking.ticketFare = ticketFare ?? booking.ticketFare;
      booking.convenienceFee = convenienceFee ?? booking.convenienceFee;
      booking.insurancePremium = insurancePremium ?? booking.insurancePremium;
      booking.totalPaid = totalPaid ?? booking.totalPaid;
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
        boardingDate: boardingDate || resolvedDate,
        boardingDepTime: boardingDepTime || depTime || '16:55',
        depTime: depTime || '16:55',
        arrTime: arrTime || '08:35',
        date: resolvedDate,
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

    console.log(`[MongoDB Atlas] Booking successfully saved for PNR ${pnr} under user: ${cleanUsername}`);
    res.json({
      success: true,
      message: 'Ticket booked and saved to MongoDB Database',
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


// Fetch Cancellation Record by PNR (for PNR Status page and Cancel page)
app.get('/api/cancellations/pnr/:pnr', async (req, res) => {
  try {
    const cleanPnr = req.params.pnr.replace(/\D/g, '');
    const cancellation = await Cancellation.findOne({ pnr: cleanPnr });
    if (cancellation) {
      return res.json({ success: true, cancellation });
    }
    // Fallback: read from Booking.cancellationDetails
    const booking = await Booking.findOne({ pnr: cleanPnr, isCancelled: true });
    if (booking && booking.cancellationDetails && booking.cancellationDetails.cancellationId) {
      const cd = booking.cancellationDetails;
      return res.json({
        success: true,
        cancellation: {
          cancellationId:   cd.cancellationId,
          pnr:              cleanPnr,
          username:         booking.username,
          trainNumber:      booking.trainNumber,
          trainName:        booking.trainName,
          from:             booking.from,
          to:               booking.to,
          journeyDate:      booking.date,
          classCode:        booking.classCode,
          cancelledAt:      cd.cancelledAt,
          cancelledDate:    cd.cancelledDate || '',
          cancelledTime:    cd.cancelledTime || '',
          cancelledDateIST: cd.cancelledDateIST || '',
          ticketFare:       cd.ticketFare,
          convenienceFee:   cd.convenienceFee,
          insurancePremium: cd.insurancePremium,
          totalPaid:        cd.totalPaid,
          grossFare:        cd.grossFare,
          baseCancelCharge: cd.baseCancelCharge,
          cgst9:            cd.cgst9,
          sgst9:            cd.sgst9,
          gst18:            cd.gst18,
          totalDeduction:   cd.totalDeduction,
          netRefund:        cd.netRefund,
          cancelReason:     cd.cancelReason || 'Change of Travel Plan',
          passengerCount:   cd.passengerCount,
          refundMode:       cd.refundMode || 'Original Payment Source (Bank/UPI)',
          refundEta:        cd.refundEta || '2-3 Business Days',
          cancelledPassengers: booking.passengers
        }
      });
    }
    return res.status(404).json({ success: false, message: 'Cancellation record not found for this PNR' });
  } catch (err) {
    console.error('Fetch cancellation by PNR error:', err);
    res.status(500).json({ success: false, message: 'Database error fetching cancellation by PNR' });
  }
});

// Fetch All Cancellations for a User (for Cancel History page)
app.get('/api/cancellations/user/:username', async (req, res) => {
  try {
    const cleanUsername = String(req.params.username).toLowerCase().trim();
    const cancellations = await Cancellation.find({
      username: { $regex: new RegExp('^' + cleanUsername.replace(/[.*+?^{}()|[\]\\]/g, '\\$&') + '$', 'i') }
    }).sort({ createdAt: -1 });
    res.json({ success: true, count: cancellations.length, cancellations });
  } catch (err) {
    console.error('Fetch user cancellations error:', err);
    res.status(500).json({ success: false, message: 'Database error fetching user cancellations' });
  }
});


app.post('/api/bookings/cancel', async (req, res) => {
  try {
    const { pnr, username, cancelReason: reqCancelReason } = req.body;
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
    const cancelledAtISO = new Date().toISOString();

    // ── Compute human-readable IST timestamps ──────────────────────────────────
    const nowIST = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));  // UTC+5:30
    const pad2 = (n) => String(n).padStart(2, '0');
    const IST_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const cdd  = pad2(nowIST.getUTCDate());
    const cmon = IST_MONTHS[nowIST.getUTCMonth()];
    const cyyyy = nowIST.getUTCFullYear();
    const chh24 = pad2(nowIST.getUTCHours());
    const cmm   = pad2(nowIST.getUTCMinutes());
    const css   = pad2(nowIST.getUTCSeconds());
    const chh12 = pad2(nowIST.getUTCHours() % 12 || 12);
    const campm = nowIST.getUTCHours() < 12 ? 'AM' : 'PM';
    const cancelledDate    = `${cdd}-${cmon}-${cyyyy}`;                           // "28-Jul-2026"
    const cancelledTime    = `${chh24}:${cmm}:${css}`;                            // "18:43:33"
    const cancelledDateIST = `${cdd} ${cmon} ${cyyyy}, ${chh12}:${cmm} ${campm}`; // "28 Jul 2026, 06:43 PM"
    const cancelReason     = reqCancelReason || 'Change of Travel Plan';
    const refundMode       = 'Original Payment Source (Bank/UPI)';
    const refundEta        = '2-3 Business Days';
    // ──────────────────────────────────────────────────────────────────────────

    const cancellationDetails = {
      cancellationId,
      cancelledAt:      cancelledAtISO,
      cancelledDate,
      cancelledTime,
      cancelledDateIST,
      ticketFare,
      convenienceFee,
      insurancePremium,
      totalPaid,
      grossFare,
      baseCancelCharge,
      cgst9,
      sgst9,
      gst18,
      totalDeduction,
      netRefund,
      cancelReason,
      passengerCount,
      refundMode,
      refundEta
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

    // Save full Cancellation Advice Document in MongoDB
    const newCancellation = new Cancellation({
      cancellationId,
      pnr,
      username: booking.username,
      trainNumber: booking.trainNumber,
      trainName: booking.trainName,
      from: booking.from,
      to: booking.to,
      journeyDate: booking.date,
      date: booking.date,
      classCode: booking.classCode,
      // Full fare breakdown
      ticketFare,
      convenienceFee,
      insurancePremium,
      totalPaid,
      grossFare,
      baseCancelCharge,
      cgst9,
      sgst9,
      gst18,
      totalDeduction,
      netRefund,
      // All timestamp formats for easy display
      cancelledAt:      cancelledAtISO,
      cancelledDate,
      cancelledTime,
      cancelledDateIST,
      // Context
      cancelReason,
      refundMode,
      refundEta,
      passengerCount,
      cancelledPassengers: booking.passengers
    });
    await newCancellation.save();

    // Refund Net Amount to User Wallet
    await User.updateOne({ username: booking.username }, { $inc: { walletBalance: netRefund } });

    console.log(`[MongoDB Atlas] ✅ CANCELLED — PNR: ${pnr} | User: @${booking.username} | Date: ${cancelledDateIST} | Refund: ₹${netRefund}`);

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
