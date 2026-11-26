import { z } from "zod";

export const PRIORITIES = ["Must", "Should", "Could", "Won't"];

// Map of accepted spellings to canonical priority labels.
const PRIORITY_ALIASES = new Map([
  ["must", "Must"],
  ["should", "Should"],
  ["could", "Could"],
  ["won't", "Won't"],
  ["wont", "Won't"],
]);

export const FeatureSchema = z.object({
  name: z.string().min(1),
  priority: z
    .string()
    .transform((value) => PRIORITY_ALIASES.get(value.trim().toLowerCase()) ?? value)
    .pipe(z.enum(["Must", "Should", "Could", "Won't"])),
  sourceQuote: z.string(),
});

export const AnalysisSchema = z.object({
  objectives: z.array(z.string()),
  features: z.array(FeatureSchema),
  technicalRequirements: z.array(z.string()),
  stackSuggestions: z.array(z.string()),
  milestones: z.array(z.string()),
  clarificationQuestions: z.array(z.string()),
});
