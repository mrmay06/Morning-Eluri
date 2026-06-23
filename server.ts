import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy GoogleGenAI client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });
      } catch (e) {
        console.error("Error initializing GoogleGenAI:", e);
      }
    }
  }
  return aiClient;
}

// Fallback scoring logic when Gemini is disabled or fails
function getLocalEvaluation(received: string, reply: string) {
  const cleanReceived = received.toLowerCase();
  const cleanReply = reply.toLowerCase();
  
  if (cleanReply.trim().length === 0) {
    return {
      score: 5,
      tier: 1,
      commentary: "An empty silence. That completely drained the creature's soul.",
      replyReaction: "💀",
      verdict: "Gone"
    };
  }

  let score = 30; // base score

  // Check matching keywords for affection
  const sweetTalk = ["baby", "love", "darling", "sweetheart", "babe", "honey", "cutie", "dear", "sweetie"];
  const hasSweetTalk = sweetTalk.some(word => cleanReply.includes(word));
  
  const hasHeart = cleanReply.includes("❤️") || cleanReply.includes("💕") || cleanReply.includes("😘") || cleanReply.includes("🥰") || cleanReply.includes("😍");
  const hasGoodMorning = cleanReply.includes("good morning") || cleanReply.includes("gm") || cleanReply.includes("morning");

  if (hasGoodMorning) score += 20;
  if (hasSweetTalk) score += 25;
  if (hasHeart) score += 20;

  // Length modifier
  if (cleanReply.length > 30) score += 10;
  if (cleanReply.length <= 4) score -= 15;

  // Bound score
  score = Math.max(0, Math.min(100, score));

  let tier: 1 | 2 | 3 | 4 = 2;
  let verdict = "Weak";
  let commentary = "";
  let replyReaction = "";

  if (score < 30) {
    tier = 1;
    verdict = "Gone";
    commentary = "Yikes! That was remarkably dry. The creature collapsed due to affection deficit.";
    replyReaction = "Wait, is that all...? *cough* 💔";
  } else if (score < 60) {
    tier = 2;
    verdict = "Weak";
    commentary = "It's safe, but a bit half-hearted. The creature survived but is still hoping for more emotional vigor.";
    replyReaction = "I feel like crying 😣";
  } else if (score < 90) {
    tier = 3;
    verdict = "Fully Healed";
    commentary = "Excellent energy match! You sent sweet keywords and a warm tone. The creature feels fully nourished!";
    replyReaction = "Ok! I think this is what i deserve 🥲";
  } else {
    tier = 4;
    verdict = "Evolved";
    commentary = "Magnificent! Your warm words of love sparked a premium evolutionary spark!";
    replyReaction = "Ahaa! This is what i was waiting for...🥰";
  }

  return { score, tier, commentary, replyReaction, verdict };
}

// API evaluation endpoint
app.post("/api/evaluate", async (req, res) => {
  const { received, reply } = req.body;
  if (!received || !reply) {
    return res.status(400).json({ error: "Missing received message or reply." });
  }

  console.log(`Evaluating reply: "${reply}" for greeting: "${received}"`);

  const client = getGeminiClient();
  if (!client) {
    console.log("No Gemini API key or configuration found, running fallback local evaluators.");
    const result = getLocalEvaluation(received, reply);
    return res.json(result);
  }

  const prompt = `
You are the "LoverGochi Morning Evaluation engine". An app where a user nurtures a digital creature by responding to romantic/loving morning text messages from their partner.
In this scenario, the sender of the morning text message is "He" (male), and the user typing the response message is "She" (female).

Partner's original morning message:
"${received}"

User's response (from her):
"${reply}"

Analyze the User's response against the original message based on:
1. "Matching affection energy" (Does it return the same or higher amount of sweetness/love?).
2. Keyword matching ("baby", "love", "darling", "sweetheart", "❤️", emoji match, cute pet names).
3. Dryness vs Passion (Writing "good morning" is dry. Writing "Good morning baby, I love you so much ❤️" is excellent!).

Classify the reply into one of these 4 Tiers:
- Tier 1: "Gone" (Very dry, simple single words, annoyed reply, ignoring sweet energy, or very cold. Score of 0-29).
- Tier 2: "Weak" (Friendly or basic response, but lacks matching romantic affection. Small score of 30-59).
- Tier 3: "Fully Healed" (Successfully matches energy, reciprocates sweet nicknames, includes hearts or loving emojis. Score of 60-89).
- Tier 4: "Evolved" (Legendary/supreme love, top-tier poetic reciprocity. Score of 90-100).

Depending on the evaluated Tier, you MUST strictly set the replyReaction property to one of these exact text choices (do not generate anything else for replyReaction):
- For Tier 1: "Wait, is that all...? *cough* 💔"
- For Tier 2: "I feel like crying 😣"
- For Tier 3: "Ok! I think this is what i deserve 🥲"
- For Tier 4: "Ahaa! This is what i was waiting for...🥰"

Generate a funny, relationships-insight commentary (joking, playful, tamagotchi doctor diagnostic report style) explaining the evaluation. Keep it under 240 characters.

Return a strict JSON response following this schema:
{
  "score": integer (0 to 100),
  "tier": integer (1, 2, 3, or 4),
  "commentary": "string",
  "replyReaction": "string",
  "verdict": "Gone" or "Weak" or "Fully Healed" or "Evolved"
}
`;

  // Array of valid models to try sequentially in case of 503 or transient errors
  const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
  let evaluationResult = null;
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      console.log(`Starting content generation with model: ${model}`);
      const response = await client.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER, description: "affection score from 0 to 100" },
              tier: { type: Type.INTEGER, description: "tier category (1: Gone, 2: Weak, 3: Fully Healed, 4: Evolved)" },
              commentary: { type: Type.STRING, description: "humorous evaluation or diagnostic commentary" },
              replyReaction: { type: Type.STRING, description: "must be one of the specified reaction strings depending on tier" },
              verdict: { type: Type.STRING, description: "one of 'Gone', 'Weak', 'Fully Healed', 'Evolved'" }
            },
            required: ["score", "tier", "commentary", "replyReaction", "verdict"]
          }
        }
      });

      const textResponse = response.text;
      if (textResponse) {
        evaluationResult = JSON.parse(textResponse.trim());
        console.log(`Successfully completed evaluation using model: ${model}`);
        break; // break the loop on success
      }
    } catch (err: any) {
      lastError = err;
      console.log(`Model ${model} failed to generate content or is unavailable (Error: ${err?.message || err}). Trying next model if available...`);
    }
  }

  if (evaluationResult) {
    return res.json(evaluationResult);
  }

  // If both models fail, log standard info and do local evaluation
  console.log("All Gemini models failed or returned empty results, backing up gracefully to local evaluations.", lastError?.message || lastError);
  const fallbackResult = getLocalEvaluation(received, reply);
  return res.json(fallbackResult);
});

// Configure Vite or production static file serving
async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve index.html for undefined routes (Express v4 pattern: app.get('*', ...))
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LoverGochi custom server running on http://localhost:${PORT}`);
  });
}

initializeServer();
