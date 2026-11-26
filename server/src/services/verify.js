function normalize(text) {
  return text.toLowerCase().split(/\s+/).filter(Boolean).join(" ");
}

// Returns a problem description for every feature whose quote is not copied from the source.
export function findUngroundedFeatures(result, sourceText) {
  const haystack = normalize(sourceText);
  const problems = [];

  for (const feature of result.features) {
    const quote = normalize(feature.sourceQuote);
    if (!quote) {
      problems.push(`feature '${feature.name}' has an empty source quote`);
    } else if (!haystack.includes(quote)) {
      problems.push(`feature '${feature.name}' source quote is not copied verbatim from the input`);
    }
  }

  return problems;
}
