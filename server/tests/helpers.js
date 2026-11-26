export function makeAnalysis(quote = "Users must log in with email and password.", priority = "Must") {
  return {
    objectives: ["Let users sign in securely"],
    features: [{ name: "Login", priority, sourceQuote: quote }],
    technicalRequirements: ["Email and password authentication"],
    stackSuggestions: ["Express with JWT"],
    milestones: ["Week 1: authentication"],
    clarificationQuestions: ["Is single sign-on required?"],
  };
}

export function scripted(responses) {
  const queue = [...responses];
  const calls = [];
  const generate = async (system, user) => {
    calls.push(user);
    if (queue.length === 0) throw new Error("No more scripted responses");
    return queue.shift();
  };
  return { generate, calls };
}
