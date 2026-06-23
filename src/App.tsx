import React, { useState, useEffect } from "react";
import { Compass } from "lucide-react";

import NurtureView from "./components/NurtureView";
import { MemoryEntry, Achievement, EvolutionStage, EvaluationResult } from "./types";

type TabState = "nurture" | "evolution" | "memories" | "settings";
type ActiveSubScreen = "main" | "analyzing" | "judgment" | "outcome";

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabState>("nurture");
  const [activeSubScreen, setActiveSubScreen] = useState<ActiveSubScreen>("main");

  // Core Relationship Simulation Settings
  const [partnerName, setPartnerName] = useState("Mr. May");
  const [partnerMessage, setPartnerMessage] = useState("Good morning baby");

  // Current Reply Interaction States
  const [replyText, setReplyText] = useState("");
  const [isSimulatingDecay, setIsSimulatingDecay] = useState(false);
  const [decayTime, setDecayTime] = useState(0);

  // Loaded database from localStorage
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [streak, setStreak] = useState(3);
  const [unlockedStages, setUnlockedStages] = useState<number[]>([1]); // Stage 1 unlocked by default
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: "morning_hero", title: "Morning Hero", description: "Successfully save the creature from relationship dryness.", icon: "🏆", unlocked: false },
    { id: "consistent_cutie", title: "Consistent Cutie", description: "Maintain a consequtive 3 days loving reply streak.", icon: "💖", unlocked: false },
    { id: "heart_whisperer", title: "Heart Whisperer", description: "Unlock the Tier 4 Legendary 'Angel Deity' form.", icon: "✨", unlocked: false },
    { id: "oops", title: "Oops.", description: "Oops! Send a response so dry the creature passed away.", icon: "💀", unlocked: false }
  ]);

  // Evaluating Server-response values
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Suspense click counter for dramatic pause during judgment
  const [judgmentStep, setJudgmentStep] = useState(1);

  // Setup initial achievements & load from localStorage
  useEffect(() => {
    try {
      const storedMemories = localStorage.getItem("lovergochi_memories");
      const storedStreak = localStorage.getItem("lovergochi_streak");
      const storedUnlocked = localStorage.getItem("lovergochi_unlocked");
      const storedAchievements = localStorage.getItem("lovergochi_achievements");
      const storedPartnerName = localStorage.getItem("lovergochi_partnerName");
      const storedPartnerMsg = localStorage.getItem("lovergochi_partnerMsg");

      if (storedMemories) {
        try {
          const parsed = JSON.parse(storedMemories);
          if (Array.isArray(parsed)) {
            setMemories(parsed);
          }
        } catch {
          // ignore parsing error
        }
      } else {
        // Prefilled memory for pristine state
        const initialMemories: MemoryEntry[] = [
          {
            id: "initial_preset",
            day: 1,
            date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
            received: "Good morning baby ❤️",
            reply: "Good morning my lovely sweetheart! 😘 Can't wait to see you today!",
            score: 82,
            tier: 3,
            outcome: "Saved",
            commentary: "Energy matched beautifully! Highlighted nicknames with cute emoji feedback. Patient is happy."
          }
        ];
        setMemories(initialMemories);
        localStorage.setItem("lovergochi_memories", JSON.stringify(initialMemories));
      }

      if (storedStreak) {
        const num = Number(storedStreak);
        if (!isNaN(num)) setStreak(num);
      }

      if (storedUnlocked) {
        try {
          const parsed = JSON.parse(storedUnlocked);
          if (Array.isArray(parsed)) {
            setUnlockedStages(parsed);
          }
        } catch {
          // ignore parsing error
        }
      }

      if (storedPartnerName) setPartnerName(storedPartnerName);
      if (storedPartnerMsg) setPartnerMessage(storedPartnerMsg);

      if (storedAchievements) {
        try {
          const parsed = JSON.parse(storedAchievements);
          if (Array.isArray(parsed)) {
            setAchievements(parsed);
          }
        } catch {
          // ignore parsing error
        }
      } else {
        // Evaluate default achievements against starting preset values
        const startingAchievements = [
          { id: "morning_hero", title: "Morning Hero", description: "Successfully save the creature from relationship dryness.", icon: "🏆", unlocked: true, unlockedAt: "Day 1" },
          { id: "consistent_cutie", title: "Consistent Cutie", description: "Maintain a consecutive 3 days loving reply streak.", icon: "💖", unlocked: true, unlockedAt: "Day 1" },
          { id: "heart_whisperer", title: "Heart Whisperer", description: "Unlock the Tier 4 Legendary 'Angel Deity' form.", icon: "✨", unlocked: false },
          { id: "oops", title: "Oops.", description: "Oops! Send a response so dry the creature passed away.", icon: "💀", unlocked: false }
        ];
        setAchievements(startingAchievements);
        localStorage.setItem("lovergochi_achievements", JSON.stringify(startingAchievements));
      }
    } catch (e) {
      console.error("Error reading from local storage:", e);
    }
  }, []);

  // Save changes to localStorage
  const saveState = (
    newMemories: MemoryEntry[],
    newStreak: number,
    newUnlockedDocs: number[],
    newAchieve: Achievement[]
  ) => {
    try {
      localStorage.setItem("lovergochi_memories", JSON.stringify(newMemories));
      localStorage.setItem("lovergochi_streak", String(newStreak));
      localStorage.setItem("lovergochi_unlocked", JSON.stringify(newUnlockedDocs));
      localStorage.setItem("lovergochi_achievements", JSON.stringify(newAchieve));
    } catch (e) {
      console.warn("Storage write blocked inside iframe sandbox:", e);
    }
  };

  // Helper definition of stages
  const getEvolutionStages = (): EvolutionStage[] => {
    return [
      { stageNum: 1, name: "Baby Blob 🫧", description: "A simple squishy bubble that feeds purely on sweet morning greetings.", image: "🫧", locked: false, requirement: "Starting pet form" },
      { stageNum: 2, name: "Cozy Cupid 🥰", description: "Grows cozy pink details and adorable ears when fed stable morning energy.", image: "🥰", locked: !unlockedStages.includes(2), requirement: "Reach Affection Level 2 (Stable Condition)" },
      { stageNum: 3, name: "Angel Caregiver 👼", description: "Sprouts tiny wings of love. Highly resilient and extremely affectionate.", image: "👼", locked: !unlockedStages.includes(3), requirement: "Unlock with level 3 matching affection logs" },
      { stageNum: 4, name: "Morning Deity 👑✨", description: "The ultimate peak of love! Unlocked with absolute poetry & mythical passion.", image: "👑✨", locked: !unlockedStages.includes(4), requirement: "Achieve Tier 4 (Legendary Morning) in analysis!" }
    ];
  };

  // Compute overall current stage of our pet
  const getCurrentStageNumber = () => {
    if (unlockedStages.includes(4)) return 4;
    if (unlockedStages.includes(3)) return 3;
    if (unlockedStages.includes(2)) return 2;
    return 1;
  };

  const currentStage = getCurrentStageNumber();

  // Helper to select correct creature image based on tier
  const getOutcomeImage = (tier: number) => {
    if (tier === 1) { // Gone / Collapsed
      return "/mascot_tier1_gone.svg";
    }
    if (tier === 2) { // Weak / Stable (Crying mascot with broken heart)
      return "/mascot_tier2_sad.svg";
    }
    if (tier === 4) { // Evolved
      return "/mascot_tier4_evolved.svg";
    }
    // Tier 3: Happy/cozy mascot
    return "/mascot_tier3_happy.svg";
  };

  // Reset entire progress
  const handleResetProgress = () => {
    const initialAchievements = [
      { id: "morning_hero", title: "Morning Hero", description: "Successfully save the creature from relationship dryness.", icon: "🏆", unlocked: false },
      { id: "consistent_cutie", title: "Consistent Cutie", description: "Maintain a consecutive 3 days loving reply streak.", icon: "💖", unlocked: false },
      { id: "heart_whisperer", title: "Heart Whisperer", description: "Unlock the Tier 4 Legendary 'Angel Deity' form.", icon: "✨", unlocked: false },
      { id: "oops", title: "Oops.", description: "Oops! Send a response so dry the creature passed away.", icon: "💀", unlocked: false }
    ];
    setMemories([]);
    setStreak(0);
    setUnlockedStages([1]);
    setAchievements(initialAchievements);
    setReplyText("");
    setIsSimulatingDecay(false);
    setDecayTime(0);
    
    try {
      localStorage.removeItem("lovergochi_memories");
      localStorage.removeItem("lovergochi_streak");
      localStorage.removeItem("lovergochi_unlocked");
      localStorage.removeItem("lovergochi_achievements");
    } catch (e) {
      console.warn("Storage deletion blocked inside iframe sandbox:", e);
    }
    
    setActiveTab("nurture");
    setActiveSubScreen("main");
  };

  // Submit and query backend judge route
  const handleSubmitReply = async () => {
    if (replyText.trim().length === 0) return;
    
    setIsAnalyzing(true);
    setJudgmentStep(1); // reset suspense stepper

    const minDelay = new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Comprehensive client-side evaluation mimic
    const getClientSideEvaluation = (): EvaluationResult => {
      const cleanReply = replyText.toLowerCase();
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

  // Advance suspense dialogue clicks in dramatic pause
  const handleJudgmentStepAdvance = () => {
    if (judgmentStep < 4) {
      setJudgmentStep(judgmentStep + 1);
    } else {
      // Step 4 is click to reveal outcome!
      setActiveSubScreen("outcome");
    }
  };

  // Confirm outcome and update database logs & trophies
  const handleConfirmOutcome = () => {
    if (!evaluation) return;

    const currentDayNum = memories.length + 1;
    const newEntry: MemoryEntry = {
      id: "entry_" + Date.now(),
      day: currentDayNum,
      date: new Date().toISOString(),
      received: partnerMessage,
      reply: replyText,
      score: evaluation.score,
      tier: evaluation.tier,
      outcome: evaluation.verdict === "Gone" ? "Collapsed" : evaluation.verdict === "Evolved" ? "Evolved Form Unlocked!" : "Saved",
      commentary: evaluation.commentary
    };

    const nextMemories = [newEntry, ...memories];
    
    // Calculate new streak days
    let nextStreak = streak;
    if (evaluation.tier === 1) {
      nextStreak = 0; // dry reply resets streak
    } else {
      nextStreak += 1;
    }

    // Unlocked forms list
    let nextUnlocked = [...unlockedStages];
    if (evaluation.tier === 2 && !nextUnlocked.includes(2)) {
      nextUnlocked.push(2);
    }
    if (evaluation.tier === 3) {
      if (!nextUnlocked.includes(2)) nextUnlocked.push(2);
      if (!nextUnlocked.includes(3)) nextUnlocked.push(3);
    }
    if (evaluation.tier === 4) {
      if (!nextUnlocked.includes(2)) nextUnlocked.push(2);
      if (!nextUnlocked.includes(3)) nextUnlocked.push(3);
      if (!nextUnlocked.includes(4)) nextUnlocked.push(4);
    }

    // Achievements checking
    let nextAchievements = achievements.map((ach) => {
      let isUnlocked = ach.unlocked;
      let dateStr = ach.unlockedAt;

      if (ach.id === "morning_hero" && evaluation.tier > 1) {
        if (!isUnlocked) {
          isUnlocked = true;
          dateStr = `Day ${currentDayNum}`;
        }
      }
      if (ach.id === "oops" && evaluation.tier === 1) {
        if (!isUnlocked) {
          isUnlocked = true;
          dateStr = `Day ${currentDayNum}`;
        }
      }
      if (ach.id === "heart_whisperer" && evaluation.tier === 4) {
        if (!isUnlocked) {
          isUnlocked = true;
          dateStr = `Day ${currentDayNum}`;
        }
      }
      if (ach.id === "consistent_cutie" && nextStreak >= 3) {
        if (!isUnlocked) {
          isUnlocked = true;
          dateStr = `Day ${currentDayNum}`;
        }
      }

      return {
        ...ach,
        unlocked: isUnlocked,
        unlockedAt: dateStr
      };
    });

    // Save states to React & LocalStorage
    setMemories(nextMemories);
    setStreak(nextStreak);
    setUnlockedStages(nextUnlocked);
    setAchievements(nextAchievements);

    saveState(nextMemories, nextStreak, nextUnlocked, nextAchievements);

    // Clean input & reset back to standard
    setReplyText("");
    setIsSimulatingDecay(false);
    setDecayTime(0);
    setActiveSubScreen("main");
    setEvaluation(null);

    // If Evolved, take them to custom evolution tab! Otherwise stay in Nurture
    if (evaluation.tier === 4) {
      setActiveTab("evolution");
    } else {
      setActiveTab("nurture");
    }
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

  // NEW IMMERSIVE FULLSCREEN OUTCOME VIEW (PREVENTS ACCIDENTALLY SHOWING BACKING HEADERS & CHUNKS)
  if (activeSubScreen === "outcome" && evaluation) {
    const tier = evaluation.tier;
    
    return (
      <div className="min-h-screen bg-[#f6f8fd] flex flex-col justify-between max-w-md mx-auto relative border-x border-[#111c2d]/10 bg-gradient-to-b from-indigo-50/20 via-white to-pink-50/10 p-8 overflow-hidden animate-in fade-in duration-500">
        {/* Spacer to keep centering beautiful */}
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
                  let backupUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuCl_1XuydNskBKyTNi4dCJBrig8KMjh6N92vgYULQbJSN_UmrrFihUCCB70DWxBeTCufjAklkTvoSTs56J_3fk3oWbxcouWQnGwy3X2NqGmx9yIiqr63G0mBKQH9CV-FWfn53Z8pmHaL8M7s4UAhmfywKoZrpD3M0re98GeIWYd-_oLETespFAlj_bbgxDsloEKrsE39S-ptHYuztYQ6BjrpvrMKxLaFV0Cf-jS_Skg3j-E-aKXuMTWglkvTsMzEG5iJwrKF1uikmLi"; // Happy / default
                  
                  if (tier === 1) { // Gone
                    backupUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuCw06KrRa9DHOYVJO-y8kEmMjsKA2kvIiW12WEVzIoTlgvXEhQW57yGnKFXR7NjN2gpra0Rmvlhukl--RtJfkdR3eDu78NUIIvtYr-5W84eNC78kghod0ePL9mBmCgScx7g70ZHuVll9yBxA5IhYeh3i5aDt9QjN3LN5Pk1tFUhlL0sFpLVtscUchzNYT9ljzuO8LTVLbvizinNgEm-Et_IIBQ3wgW18FZQd46SLb9iyJQSWtrZbpLzhHHPWo-nd040crH8-t8KZPN6";
                  } else if (tier === 2) { // Weak/Sad local missing, fallback to happy with filter styling
                    backupUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuCl_1XuydNskBKyTNi4dCJBrig8KMjh6N92vgYULQbJSN_UmrrFihUCCB70DWxBeTCufjAklkTvoSTs56J_3fk3oWbxcouWQnGwy3X2NqGmx9yIiqr63G0mBKQH9CV-FWfn53Z8pmHaL8M7s4UAhmfywKoZrpD3M0re98GeIWYd-_oLETespFAlj_bbgxDsloEKrsE39S-ptHYuztYQ6BjrpvrMKxLaFV0Cf-jS_Skg3j-E-aKXuMTWglkvTsMzEG5iJwrKF1uikmLi";
                    target.style.filter = "grayscale(70%) opacity(80%)";
                  }

                  if (target.src !== backupUrl) {
                    target.src = backupUrl;
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

        {/* Bottom: Only one line of copy react dialogue, followed by the "Start again" button */}
        <div className="flex flex-col gap-8 items-center text-center pb-12 mt-auto w-full">
          {/* Dialogue speech line, clean, speech-bubble styled */}
          <div className="speech-bubble speech-bubble-tail-down w-full max-w-[90%] text-center shadow-[4px_4px_0px_0px_#111c2d] z-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <p className="text-sm font-bold text-[#111c2d] leading-relaxed">
              "{evaluation.replyReaction}"
            </p>
          </div>

          {/* Unified clean CTA button to proceed */}
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

      {/* Main Screen Router Body */}
      <main className="flex-1 px-5 py-4 overflow-y-auto pb-8">
        
        {/* SUB SCENE: STANDARD MAIN SCREEN WITH EXCLUSIVE NURTURE VIEW */}
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
