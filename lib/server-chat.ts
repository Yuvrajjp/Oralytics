export async function generateChatResponse({ context, messages }) {
  // This is where you can integrate OpenAI later.
  // For now, return a deterministic mock response.

  const lastMessage = messages[messages.length - 1]?.content || "";

  return {
    role: "assistant",
    content: `Based on ${context?.label}: I understand your question: "${lastMessage}". More detailed model answers will be added later.`
  };
}
