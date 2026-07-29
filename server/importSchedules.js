import fs from 'fs';
import path from 'path';
import readline from 'readline';
import mongoose from 'mongoose';
import TrainSchedule from './models/TrainSchedule.js';

const ATLAS_URI = 'mongodb+srv://IRCTC:irctc123@irctc.ob9mxns.mongodb.net/irctc_db?retryWrites=true&w=majority&appName=IRCTC';
const MONGO_URI = process.env.MONGO_URI || ATLAS_URI;

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function importSchedules() {
  console.log('🚀 Connecting to MongoDB Atlas database [irctc_db]...');
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
  });
  console.log('✅ Connected to MongoDB Atlas successfully.');

  const csvPath = path.resolve(process.cwd(), 'train seduled.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('❌ CSV file not found at:', csvPath);
    process.exit(1);
  }

  console.log('📖 Reading and parsing train seduled.csv line by line...');
  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const trainMap = new Map();
  let lineCount = 0;

  for await (const line of rl) {
    lineCount++;
    if (lineCount === 1) continue; // Skip header

    if (!line.trim()) continue;

    const cols = parseCsvLine(line);
    if (cols.length < 12) continue;

    const trainNo = cols[0];
    const trainName = cols[1];
    const seq = parseInt(cols[2], 10) || 0;
    const stationCode = cols[3];
    const stationName = cols[4];
    const arrivalTime = cols[5] || '00:00:00';
    const departureTime = cols[6] || '00:00:00';
    const distance = parseInt(cols[7], 10) || 0;
    const sourceCode = cols[8];
    const sourceName = cols[9];
    const destCode = cols[10];
    const destName = cols[11];

    if (!trainNo) continue;

    if (!trainMap.has(trainNo)) {
      trainMap.set(trainNo, {
        trainNumber: trainNo,
        trainName: trainName,
        sourceStation: { code: sourceCode, name: sourceName },
        destinationStation: { code: destCode, name: destName },
        stops: []
      });
    }

    const train = trainMap.get(trainNo);
    train.stops.push({
      seq,
      stationCode,
      stationName,
      arrivalTime,
      departureTime,
      distance
    });
  }

  console.log(`📊 Read ${lineCount - 1} schedule rows across ${trainMap.size} unique trains.`);

  console.log('🔄 Sorting station stops and preparing bulk insert/upsert payloads...');
  const bulkOperations = [];

  for (const train of trainMap.values()) {
    train.stops.sort((a, b) => a.seq - b.seq);
    const maxDistance = train.stops.length > 0 ? Math.max(...train.stops.map(s => s.distance)) : 0;

    bulkOperations.push({
      updateOne: {
        filter: { trainNumber: train.trainNumber },
        update: {
          $set: {
            trainNumber: train.trainNumber,
            trainName: train.trainName,
            sourceStation: train.sourceStation,
            destinationStation: train.destinationStation,
            totalDistance: maxDistance,
            totalStops: train.stops.length,
            stops: train.stops
          }
        },
        upsert: true
      }
    });
  }

  console.log(`💾 Executing bulk write to MongoDB Atlas collection 'schedules' in batches...`);
  const BATCH_SIZE = 1000;
  let processed = 0;

  for (let i = 0; i < bulkOperations.length; i += BATCH_SIZE) {
    const batch = bulkOperations.slice(i, i + BATCH_SIZE);
    await TrainSchedule.bulkWrite(batch, { ordered: false });
    processed += batch.length;
    console.log(`   [MongoDB Atlas] Upserted ${processed} / ${bulkOperations.length} train schedule documents...`);
  }

  console.log('🎉 Successfully imported all train schedule documents into MongoDB Atlas [irctc_db.schedules]!');
  await mongoose.disconnect();
  process.exit(0);
}

importSchedules().catch((err) => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});
