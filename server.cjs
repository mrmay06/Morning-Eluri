var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      try {
        aiClient = new import_genai.GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build"
            }
          }
        });
      } catch (e) {
        console.error("Error initializing GoogleGenAI:", e);
      }
    }
  }
  return aiClient;
}
function getLocalEvaluation(received, reply) {
  const cleanReceived = received.toLowerCase();
  const cleanReply = reply.trim().toLowerCase();
  if (cleanReply.length === 0) {
    return {
      score: 5,
      tier: 1,
      commentary: "An empty silence. That completely drained the creature's soul.",
      replyReaction: "I think I am going to DIE",
      verdict: "Gone"
    };
  }
  if (cleanReply === "good morning") {
    return {
      score: 15,
      tier: 1,
      commentary: "Yikes! That was remarkably dry. The creature collapsed due to affection deficit.",
      replyReaction: "I think I am going to DIE",
      verdict: "Gone"
    };
  }
  if (cleanReply === "good morning to you too!") {
    return {
      score: 45,
      tier: 2,
      commentary: "It's safe, but a bit half-hearted. The creature survived but is still hoping for more emotional vigor.",
      replyReaction: "Ok! I think this is what i deserve \u{1F972}",
      verdict: "Weak"
    };
  }
  if (cleanReply === "good morning baby \u2764\uFE0F" || cleanReply === "good morning baby") {
    return {
      score: 80,
      tier: 3,
      commentary: "Excellent energy match! You sent sweet keywords and a warm tone. The creature feels fully nourished!",
      replyReaction: "Ahaa! This is what i was waiting for...\u{1F970}",
      verdict: "Fully Healed"
    };
  }
  let score = 30;
  const sweetTalk = ["baby", "love", "darling", "sweetheart", "babe", "honey", "cutie", "dear", "sweetie"];
  const hasSweetTalk = sweetTalk.some((word) => cleanReply.includes(word));
  const hasHeart = cleanReply.includes("\u2764\uFE0F") || cleanReply.includes("\u{1F495}") || cleanReply.includes("\u{1F618}") || cleanReply.includes("\u{1F970}") || cleanReply.includes("\u{1F60D}");
  const hasGoodMorning = cleanReply.includes("good morning") || cleanReply.includes("gm") || cleanReply.includes("morning");
  if (hasGoodMorning) score += 20;
  if (hasSweetTalk) score += 25;
  if (hasHeart) score += 20;
  if (cleanReply.length > 30) score += 10;
  if (cleanReply.length <= 4) score -= 15;
  const dryPhrases = ["good morning", "gm", "ok", "fine", "bye", "nothing", "dry", "annoyed", "whatever", "hi", "hello"];
  if (dryPhrases.includes(cleanReply)) {
    score = 15;
  }
  score = Math.max(0, Math.min(100, score));
  let tier = 2;
  let verdict = "Weak";
  let commentary = "";
  let replyReaction = "";
  if (score < 30) {
    tier = 1;
    verdict = "Gone";
    commentary = "Yikes! That was remarkably dry. The creature collapsed due to affection deficit.";
    replyReaction = "I think I am going to DIE";
  } else if (score < 60) {
    tier = 2;
    verdict = "Weak";
    commentary = "It's safe, but a bit half-hearted. The creature survived but is still hoping for more emotional vigor.";
    replyReaction = "Ok! I think this is what i deserve \u{1F972}";
  } else if (score < 90) {
    tier = 3;
    verdict = "Fully Healed";
    commentary = "Excellent energy match! You sent sweet keywords and a warm tone. The creature feels fully nourished!";
    replyReaction = "Ahaa! This is what i was waiting for...\u{1F970}";
  } else {
    tier = 4;
    verdict = "Evolved";
    commentary = "Magnificent! Your warm words of love sparked a premium evolutionary spark!";
    replyReaction = "Ahaa! This is what i was waiting for...\u{1F970}";
  }
  return { score, tier, commentary, replyReaction, verdict };
}
app.post("/api/evaluate", async (req, res) => {
  const { received, reply } = req.body;
  if (!received || !reply) {
    return res.status(400).json({ error: "Missing received message or reply." });
  }
  console.log(`Evaluating reply: "${reply}" for greeting: "${received}"`);
  const cleanReply = reply.trim().toLowerCase();
  if (cleanReply === "good morning") {
    return res.json({
      score: 15,
      tier: 1,
      commentary: "Yikes! That was remarkably dry. The creature collapsed due to affection deficit.",
      replyReaction: "I think I am going to DIE",
      verdict: "Gone"
    });
  }
  if (cleanReply === "good morning to you too!") {
    return res.json({
      score: 45,
      tier: 2,
      commentary: "It's safe, but a bit half-hearted. The creature survived but is still hoping for more emotional vigor.",
      replyReaction: "Ok! I think this is what i deserve \u{1F972}",
      verdict: "Weak"
    });
  }
  if (cleanReply === "good morning baby \u2764\uFE0F" || cleanReply === "good morning baby") {
    return res.json({
      score: 80,
      tier: 3,
      commentary: "Excellent energy match! You sent sweet keywords and a warm tone. The creature feels fully nourished!",
      replyReaction: "Ahaa! This is what i was waiting for...\u{1F970}",
      verdict: "Fully Healed"
    });
  }
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
2. Keyword matching ("baby", "love", "darling", "sweetheart", "\u2764\uFE0F", emoji match, cute pet names).
3. Dryness vs Passion (Writing "good morning" is dry. Writing "Good morning baby, I love you so much \u2764\uFE0F" is excellent!).

Classify the reply into one of these 4 Tiers:
- Tier 1: "Gone" (Very dry, simple single words, annoyed reply, ignoring sweet energy, or very cold. Score of 0-29).
- Tier 2: "Weak" (Friendly or basic response, but lacks matching romantic affection. Small score of 30-59).
- Tier 3: "Fully Healed" (Successfully matches energy, reciprocates sweet nicknames, includes hearts or loving emojis. Score of 60-89).
- Tier 4: "Evolved" (Legendary/supreme love, top-tier poetic reciprocity. Score of 90-100).

Depending on the evaluated Tier, you MUST strictly set the replyReaction property to one of these exact text choices (do not generate anything else for replyReaction):
- For Tier 1: "I think I am going to DIE"
- For Tier 2: "Ok! I think this is what i deserve \u{1F972}"
- For Tier 3: "Ahaa! This is what i was waiting for...\u{1F970}"
- For Tier 4: "Ahaa! This is what i was waiting for...\u{1F970}"

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
  const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
  let evaluationResult = null;
  let lastError = null;
  for (const model of modelsToTry) {
    try {
      console.log(`Starting content generation with model: ${model}`);
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              score: { type: import_genai.Type.INTEGER, description: "affection score from 0 to 100" },
              tier: { type: import_genai.Type.INTEGER, description: "tier category (1: Gone, 2: Weak, 3: Fully Healed, 4: Evolved)" },
              commentary: { type: import_genai.Type.STRING, description: "humorous evaluation or diagnostic commentary" },
              replyReaction: { type: import_genai.Type.STRING, description: "must be one of the specified reaction strings depending on tier" },
              verdict: { type: import_genai.Type.STRING, description: "one of 'Gone', 'Weak', 'Fully Healed', 'Evolved'" }
            },
            required: ["score", "tier", "commentary", "replyReaction", "verdict"]
          }
        }
      });
      const textResponse = response.text;
      if (textResponse) {
        evaluationResult = JSON.parse(textResponse.trim());
        console.log(`Successfully completed evaluation using model: ${model}`);
        break;
      }
    } catch (err) {
      lastError = err;
      console.log(`Model ${model} failed to generate content or is unavailable (Error: ${err?.message || err}). Trying next model if available...`);
    }
  }
  if (evaluationResult) {
    return res.json(evaluationResult);
  }
  console.log("All Gemini models failed or returned empty results, backing up gracefully to local evaluations.", lastError?.message || lastError);
  const fallbackResult = getLocalEvaluation(received, reply);
  return res.json(fallbackResult);
});
async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LoverGochi custom server running on http://localhost:${PORT}`);
  });
}
initializeServer();
//# sourceMappingURL=server.cjs.map
