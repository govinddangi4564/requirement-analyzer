import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 200 },
    sourceText: { type: String, required: true },
    result: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const Analysis = mongoose.models.Analysis || mongoose.model("Analysis", analysisSchema);
