import mammoth from "mammoth";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { httpError } from "../utils/httpError.js";

export async function extractText(filename, buffer) {
  const extension = filename.includes(".") ? filename.split(".").pop().toLowerCase() : "";
  let text;

  if (extension === "pdf") {
    try {
      const data = await pdfParse(buffer);
      text = data.text;
    } catch {
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
