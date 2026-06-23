import React, { useState } from "react";
import { Compass } from "lucide-react";

import NurtureView from "./components/NurtureView";
import { EvaluationResult } from "./types";

// Import custom creature images
import idealImg from "../assets/img/Ideal Img.png";
import tire1Img from "../assets/img/Tire 1.png";
import tire2Img from "../assets/img/Tire 2.png.png";
import tire3Img from "../assets/img/Tire 3.png";

type ActiveSubScreen = "main" | "outcome";

export default function App() {
  const [activeSubScreen, setActiveSubScreen] = useState<ActiveSubScreen>("main");

  // Core Relationship Simulation Settings
  const partnerName = "Mr. May";
  const partnerMessage = "Good morning baby";

  // Current Reply Interaction States
  const [replyText, setReplyText] = useState("");
  const [isSimulatingDecay, setIsSimulatingDecay] = useState(false);
  const [decayTime, setDecayTime] = useState(0);

  // Evaluating Server-response values
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Helper to select correct creature image based on tier
  const getOutcomeImage = (tier: number) => {
    if (tier === 1) return tire1Img; // Gone / Collapsed
    if (tier === 2) return tire2Img; // Weak / Stable (Sad mascot)
    if (tier === 4) return tire3Img; // Evolved (Jumping mascot)
    return idealImg; // Tier 3: Happy/cozy mascot
  };

  // Submit and query backend judge route
  const handleSubmitReply = async () => {
    if (replyText.trim().length === 0) return;
    
    setIsAnalyzing(true);

    const minDelay = new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Comprehensive client-side evaluation mimic
    const getClientSideEvaluation = (): EvaluationResult => {
      const cleanReply = replyText.trim().toLowerCase();
      
      // Exact Match Overrides
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
          replyReaction: "Ok! I think this is what i deserve 🥲",
          verdict: "Weak"
        };
      }
      if (cleanReply === "good morning baby ❤️" || cleanReply === "good morning baby") {
        return {
          score: 80,
          tier: 3,
          commentary: "Excellent energy match! You sent sweet keywords and a warm tone. The creature feels fully nourished!",
          replyReaction: "Ahaa! This is what i was waiting for...🥰",
          verdict: "Fully Healed"
        };
      }

      let score = 30; // base score

      const sweetTalk = ["baby", "love", "darling", "sweetheart", "babe", "honey", "cutie", "dear", "sweetie"];
      const hasSweetTalk = sweetTalk.some(word => cleanReply.includes(word));
      const hasHeart = cleanReply.includes("❤️") || cleanReply.includes("💕") || cleanReply.includes("😘") || cleanReply.includes("🥰") || cleanReply.includes("😍");
      const hasGoodMorning = cleanReply.includes("good morning") || cleanReply.includes("gm") || cleanReply.includes("morning");

      if (hasGoodMorning) score += 20;
      if (hasSweetTalk) score += 25;
      if (hasHeart) score += 20;

      if (cleanReply.length > 30) score += 10;
      if (cleanReply.length <= 4) score -= 15;

      // Force explicitly dry phrases to Tier 1 (1 heart)
      const dryPhrases = ["good morning", "gm", "ok", "fine", "bye", "nothing", "dry", "annoyed", "whatever", "hi", "hello"];
      if (dryPhrases.includes(cleanReply.trim())) {
        score = 15;
      }

      score = Math.max(0, Math.min(100, score));

      let tier: 1 | 2 | 3 | 4 = 2;
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
        replyReaction = "Ok! I think this is what i deserve 🥲";
      } else if (score < 90) {
        tier = 3;
        verdict = "Fully Healed";
        commentary = "Excellent energy match! You sent sweet keywords and a warm tone. The creature feels fully nourished!";
        replyReaction = "Ahaa! This is what i was waiting for...🥰";
      } else {
        tier = 4;
        verdict = "Evolved";
        commentary = "Magnificent! Your warm words of love sparked a premium evolutionary spark!";
        replyReaction = "Ahaa! This is what i was waiting for...🥰";
      }

      return { score, tier, commentary, replyReaction, verdict };
    };

    const clientResult = getClientSideEvaluation();

    try {
      const fetchPromise = fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          received: partnerMessage,
          reply: replyText
        })
      }).then(async (res) => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      });

      // Race with 1.0 seconds timeout
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve("TIMEOUT"), 1000));

      const resultOrTimeout = await Promise.race([fetchPromise, timeoutPromise]);

      let finalResult = clientResult;
      if (resultOrTimeout !== "TIMEOUT") {
        finalResult = resultOrTimeout as EvaluationResult;
      }

      await minDelay;
      setEvaluation(finalResult);
      setIsAnalyzing(false);
      setActiveSubScreen("outcome");

    } catch (e) {
      console.error("Endpoint failure, using fallback evaluator:", e);
      await minDelay;
      setEvaluation(clientResult);
      setIsAnalyzing(false);
      setActiveSubScreen("outcome");
    }
  };

  // Confirm outcome and reset back to nurture screen
  const handleConfirmOutcome = () => {
    setReplyText("");
    setIsSimulatingDecay(false);
    setDecayTime(0);
    setActiveSubScreen("main");
    setEvaluation(null);
  };

  // Helper count of unlocked hearts based on current presets
  const getHeartsFromPreset = () => {
    if (isSimulatingDecay) {
      if (decayTime < 30) return 5;
      if (decayTime < 60) return 4;
      if (decayTime < 90) return 3;
      if (decayTime < 120) return 1;
      return 0;
    }
    return 1; // base waiting state starts with 1 heart
  };

  // IMMERSIVE FULLSCREEN OUTCOME VIEW
  if (activeSubScreen === "outcome" && evaluation) {
    const tier = evaluation.tier;
    
    return (
      <div className="min-h-screen bg-[#f6f8fd] flex flex-col justify-between max-w-md mx-auto relative border-x border-[#111c2d]/10 bg-gradient-to-b from-indigo-50/20 via-white to-pink-50/10 p-8 overflow-hidden animate-in fade-in duration-500">
        <div className="h-6" />

        {/* Center: Image in the very middle of the screen */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-8">
          <div className="relative">
            {/* Ambient background glow matching the status */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl opacity-20 transition-all ${
              tier === 1 ? "bg-red-400" :
              tier === 2 ? "bg-amber-400" :
              "bg-rose-400"
            }`} />

            {/* Pristine centered chunky rounded border for the image */}
            <div className="relative z-10 w-44 h-44 rounded-full flex items-center justify-center bg-white border-4 border-[#111c2d] shadow-[4px_4px_0px_0px_#111c2d] p-3">
              <img
                src={getOutcomeImage(tier)}
                alt="Outcome Creature"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== idealImg) {
                    target.src = idealImg;
                  }
                }}
                className={`w-32 h-32 object-contain rounded-full animate-in zoom-in-75 duration-500 ${
                  tier === 2 ? "animate-shake" :
                  tier === 4 ? "brightness-110 saturate-125 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]" :
                  ""
                }`}
                referrerPolicy="no-referrer"
              />
              
              {/* Overlay elements for visual flair! */}
              {tier === 2 && (
                <div className="absolute top-2 right-2 text-3xl select-none z-20 animate-bounce">
                  😢
                </div>
              )}
              {tier === 3 && (
                <div className="absolute top-2 right-2 text-3xl select-none z-20 animate-pulse">
                  🥰
                </div>
              )}
              {tier === 4 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-4xl select-none animate-bounce z-25">
                  👑
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Dialogue speech line, followed by the "Start again" button */}
        <div className="flex flex-col gap-8 items-center text-center pb-12 mt-auto w-full">
          <div className="speech-bubble speech-bubble-tail-down w-full max-w-[90%] text-center shadow-[4px_4px_0px_0px_#111c2d] z-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <p className="text-sm font-bold text-[#111c2d] leading-relaxed">
              "{evaluation.replyReaction}"
            </p>
          </div>

          <div className="w-full animate-in fade-in duration-1000">
            <button
              onClick={handleConfirmOutcome}
              className="w-full py-3.5 rounded-full flex items-center justify-center gap-2 uppercase tracking-widest text-white font-bold text-xs border-2 border-[#111c2d] bg-[#1b6b4f] shadow-[0px_4px_0px_0px_#0c3627] hover:translate-y-0.5 active:translate-y-1 active:shadow-[0px_1px_0px_0px_#0c3627] cursor-pointer transition-all"
            >
              Start again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fd] flex flex-col justify-between max-w-md mx-auto relative border-x border-[#111c2d]/10 bg-gradient-to-b from-indigo-50/20 via-white to-pink-50/10">
      
      {/* Top Application Header Bar */}
      <header className="bg-white border-b-4 border-[#1b6b4f]/15 w-full sticky top-0 z-30 flex flex-col px-5 py-3 h-auto justify-between gap-1 shadow-sm">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="bg-[#1b6b4f] p-1.5 rounded-xl border border-[#111c2d] flex items-center justify-center text-white">
              <Compass className="w-4 h-4 animate-spin-slow" />
            </div>
            <h1 className="font-sans font-black text-lg tracking-tight text-[#1b6b4f] uppercase flex items-center gap-1">
              Eluri
            </h1>
          </div>
        </div>
      </header>

      {/* Main Screen Body */}
      <main className="flex-1 px-5 py-4 overflow-y-auto pb-8">
        {activeSubScreen === "main" && (
          <NurtureView
            partnerName={partnerName}
            partnerMessage={partnerMessage}
            replyText={replyText}
            setReplyText={setReplyText}
            onSubmitReply={handleSubmitReply}
            isSimulatingDecay={isSimulatingDecay}
            setIsSimulatingDecay={setIsSimulatingDecay}
            decayTime={decayTime}
            setDecayTime={setDecayTime}
            affectionHearts={getHeartsFromPreset()}
            isAnalyzing={isAnalyzing}
          />
        )}
      </main>
    </div>
  );
}
