import { Router } from "express";
import multer from "multer";
import mongoose from "mongoose";
import { Analysis } from "../models/Analysis.js";
import { analyze } from "../services/llm.js";
import { extractText } from "../services/ingest.js";
import { toMarkdown } from "../services/export.js";
import { httpError } from "../utils/httpError.js";

const MAX_TEXT_CHARS = 60000;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
});

const router = Router();

function makeTitle(text) {
  const firstLine = text.split("\n").find((line) => line.trim()) || "Untitled";
  return firstLine.trim().slice(0, 80);
}

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

// List recent analyses
router.get("/", async (req, res, next) => {
  try {
    const items = await Analysis.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .select("title createdAt")
      .lean();
    res.json(items.map((item) => ({ id: String(item._id), title: item.title, createdAt: item.createdAt })));
  } catch (error) {
    next(error);
  }
});

// Create an analysis from pasted text or an uploaded file
router.post("/", upload.single("file"), async (req, res, next) => {
  try {
    let text;
    let title;

    if (req.file) {
      text = await extractText(req.file.originalname, req.file.buffer);
      title = req.file.originalname.slice(0, 200);
    } else {
      text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
    }

    if (!text) {
      throw httpError(400, "Paste requirements or upload a file.");
    }
    if (text.length > MAX_TEXT_CHARS) {
      throw httpError(413, `Input is too long (max ${MAX_TEXT_CHARS} characters).`);
    }

    const result = await analyze(text);
    const doc = await Analysis.create({
      title: title || makeTitle(text),
      sourceText: text,
      result,
    });

    res.status(201).json({ id: String(doc._id), title: doc.title, result: doc.result });
  } catch (error) {
    next(error);
  }
});

// Get one analysis
router.get("/:id", async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ error: "Analysis not found" });
    }
    const doc = await Analysis.findById(req.params.id).lean();
    if (!doc) {
      return res.status(404).json({ error: "Analysis not found" });
    }
    res.json({ id: String(doc._id), title: doc.title, result: doc.result, createdAt: doc.createdAt });
  } catch (error) {
    next(error);
  }
});

// Download as Markdown
router.get("/:id/export.md", async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ error: "Analysis not found" });
    }
    const doc = await Analysis.findById(req.params.id).lean();
    if (!doc) {
      return res.status(404).json({ error: "Analysis not found" });
    }
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="analysis-${req.params.id}.md"`);
    res.send(toMarkdown(doc.result, doc.title));
  } catch (error) {
    next(error);
  }
});

// Delete an analysis
router.delete("/:id", async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ error: "Analysis not found" });
    }
    const deleted = await Analysis.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Analysis not found" });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
