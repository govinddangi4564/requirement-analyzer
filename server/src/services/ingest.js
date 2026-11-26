import mammoth from "mammoth";
import { httpError } from "../utils/httpError.js";

/**
 * Extract plain text from a PDF buffer using pdfjs-dist.
 * pdfjs-dist is a pure-JS implementation that works reliably in Node.js
 * serverless runtimes (Vercel, AWS Lambda) unlike pdf-parse which bundles
 * an old PDF.js and uses require() calls that break in ESM environments.
 */
async function extractPdfText(buffer) {
  // Dynamic import keeps the heavy pdfjs-dist bundle out of the cold-start
  // path for non-PDF requests.
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // No web worker needed in a Node.js environment.
  pdfjs.GlobalWorkerOptions.workerSrc = "";

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    // Suppress the "Setting up fake worker" console warning.
    verbosity: 0,
  });

  const pdf = await loadingTask.promise;
  const pageTexts = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // items can be TextItem or TextMarkedContent; only TextItem has a `str`.
    const pageText = content.items
      .filter((item) => typeof item.str === "string")
      .map((item) => item.str)
      .join(" ");
    pageTexts.push(pageText);
  }

  return pageTexts.join("\n");
}

export async function extractText(filename, buffer) {
  const extension = filename.includes(".") ? filename.split(".").pop().toLowerCase() : "";
  let text;

  if (extension === "pdf") {
    try {
      text = await extractPdfText(buffer);
    } catch (err) {
      if (err.expose) throw err;
      throw httpError(
        400,
        "Could not read this PDF. It may be damaged or malformed. Re-save it as a new PDF, or upload a DOCX or TXT file."
      );
    }
  } else if (extension === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else if (extension === "txt") {
    text = buffer.toString("utf8");
  } else {
    throw httpError(400, `Unsupported file type ".${extension}". Use PDF, DOCX or TXT.`);
  }

  text = (text || "").trim();
  if (!text) {
    throw httpError(400, "The file has no readable text.");
  }
  return text;
}
