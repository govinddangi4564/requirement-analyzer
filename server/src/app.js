import express from "express";
import analysesRouter from "./routes/analyses.js";

const app = express();

app.use(express.json({ limit: "200kb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/analyses", analysesRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message;

  if (err.code === "LIMIT_FILE_SIZE") {
    status = 413;
    message = "File is too large (max 4 MB).";
  }

  if (status >= 500 && !err.expose) {
    console.error(err);
    message = "Something went wrong. Please try again.";
  }

  res.status(status).json({ error: message });
});

export default app;
