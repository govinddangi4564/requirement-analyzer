import app from "../server/src/app.js";
import { connectDB } from "../server/src/config/db.js";

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Database connection failed. Check MONGODB_URI." });
  }
  return app(req, res);
}
