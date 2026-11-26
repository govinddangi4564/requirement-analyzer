import app from "../server/src/app.js";
import { connectDB } from "../server/src/config/db.js";

// Disable Vercel's automatic body parsing so that multer and
// express.json() can read the raw request body themselves.
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  try {
    await connectDB();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Database connection failed. Check MONGODB_URI." });
  }
  return app(req, res);
}
