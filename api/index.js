import app, { connectDB } from '../server/index.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (e) {
    console.error('Database connection error in serverless handler:', e);
  }
  return app(req, res);
}
