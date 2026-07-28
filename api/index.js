import app, { connectDB } from '../server/index.js';

export default async function handler(req, res) {
  try {
    await connectDB();
    return app(req, res);
  } catch (e) {
    console.error('Serverless function execution error:', e);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: e?.message || 'Internal Server Error'
      });
    }
  }
}
