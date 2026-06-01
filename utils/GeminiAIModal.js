import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

const generationConfig = {
  temperature: 0.9,
  topP: 1,
  maxOutputTokens: 8192,
};

/**
 * Helper: retry a function with exponential backoff on 429 errors.
 */
async function withRetry(fn, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const is429 = error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("quota");
      if (is429 && attempt < maxRetries) {
        // Wait with exponential backoff: 10s, 20s, 40s
        const waitMs = 10000 * Math.pow(2, attempt);
        console.log(`Rate limited. Retrying in ${waitMs / 1000}s... (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitMs));
      } else {
        throw error;
      }
    }
  }
}

/**
 * Creates a new chat session with built-in retry logic.
 */
export function createChatSession() {
  const session = model.startChat({ generationConfig });

  // Wrap sendMessage with retry logic
  const originalSendMessage = session.sendMessage.bind(session);
  session.sendMessage = (message) => withRetry(() => originalSendMessage(message));

  return session;
}

// Keep a default export for backward compatibility
const chatSession = model.startChat({
  generationConfig,
});

export { chatSession, genAI, withRetry };
