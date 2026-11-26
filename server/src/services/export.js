export function sections(result) {
  const features = result.features.map((f) => `${f.name} (${f.priority}): "${f.sourceQuote}"`);
  return [
    ["Objectives", result.objectives],
    ["Features", features],
    ["Technical requirements", result.technicalRequirements],
    ["Suggested stack", result.stackSuggestions],
    ["Milestones", result.milestones],
    ["Clarifications needed from client", result.clarificationQuestions],
  ];
}

export function toMarkdown(result, title = "Project Analysis") {
  const lines = [`# ${title}`, ""];
  for (const [heading, items] of sections(result)) {
    lines.push(`## ${heading}`);
    if (items.length) {
      for (const item of items) lines.push(`- ${item}`);
    } else {
      lines.push("_None found_");
    }
    lines.push("");
  }
  return lines.join("\n");
}
