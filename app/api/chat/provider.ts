import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const model = google("gemini-2.0-flash-001", {
  // safetySettings: [
  //   { category: "HARM_CATEGORY_UNSPECIFIED", threshold: "BLOCK_NONE" },
  // ],
  useSearchGrounding: true,
});

export const provider = model;
