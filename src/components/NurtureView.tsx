import React, { useState, useEffect } from "react";
import { MessageSquare, Heart, Sparkles, Shield, AlertTriangle, RefreshCw, Send, HelpCircle, Lock, Trophy, Loader2 } from "lucide-react";

// Import custom creature images
import idealImg from "../../assets/img/Ideal Img.png";
import tire1Img from "../../assets/img/Tire 1.png";
import tire2Img from "../../assets/img/Tire 2.png.png";
import tire3Img from "../../assets/img/Tire 3.png";

interface NurtureViewProps {
  partnerName: string;
  partnerMessage: string;
  replyText: string;
  setReplyText: (val: string) => void;
  onSubmitReply: () => void;
  isSimulatingDecay: boolean;
  setIsSimulatingDecay: (val: boolean) => void;
  decayTime: number; // 0 - 120+ seconds
  setDecayTime: (val: number) => void;
  affectionHearts: number;
  isAnalyzing?: boolean;
}

export default function NurtureView({
  partnerName,
  partnerMessage,
  replyText,
  setReplyText,
  onSubmitReply,
  isSimulatingDecay,
  setIsSimulatingDecay,
  decayTime,
  setDecayTime,
  affectionHearts,
  isAnalyzing = false,
}: NurtureViewProps) {
  const [speechIndex, setSpeechIndex] = useState(0);

  // Time decay active ticking state
  useEffect(() => {
    if (!isSimulatingDecay) return;
    const interval = setInterval(() => {
      setDecayTime(decayTime + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isSimulatingDecay, decayTime]);

  // Determine emotional speech content based on typed reply message
  const getDecayStatus = () => {
    const norm = replyText.trim().toLowerCase();
    
    if (norm === "") {
      return {
        speech: "He gave his best morning greeting. Your turn ❤️",
        faceStatus: "😊 Waiting",
        imgUrl: idealImg, // Ideal sitting thing
        imgFilter: "none",
        emojiOverlay: null,
        heartsCount: 5,
        nervousClass: ""
      };
    }

    // Exact Match Overrides
    if (norm === "good morning") {
      return {
        speech: "Is that all...? That's so dry... I'm fading away 💔",
        faceStatus: "☠️ Gone",
        imgUrl: tire1Img, // Tombstone
        imgFilter: "none",
        emojiOverlay: "💀",
        heartsCount: 1,
        nervousClass: "animate-pulse"
      };
    }

    if (norm === "good morning to you too!") {
      return {
        speech: "Thank you! Still hoping for some extra warmth though... ⏱️",
        faceStatus: "😟 Weak",
        imgUrl: tire2Img, // Sad crying mascot
        imgFilter: "none",
        emojiOverlay: "💧",
        heartsCount: 3,
        nervousClass: "animate-shake"
      };
    }

    if (norm === "good morning baby ❤️" || norm === "good morning baby") {
      return {
        speech: "Ahhh! Yes! My heart is full of joy and energy! 🥰",
        faceStatus: "😊 Happy",
        imgUrl: tire3Img, // Jumping happy mascot
        imgFilter: "none",
        emojiOverlay: "🥰",
        heartsCount: 5,
        nervousClass: "scale-105"
      };
    }

    // Affectionate -> Happy, 5 hearts (contains sweet words or positive emojis)
    if (
      norm.includes("baby") || 
      norm.includes("❤️") || 
      norm.includes("love") || 
      norm.includes("sweetheart") || 
      norm.includes("honey") ||
      norm.includes("darling") ||
      norm.includes("babe") ||
      norm.includes("sweetie") ||
      norm.includes("cutie") ||
      norm.includes("💖") ||
      norm.includes("💕") ||
      norm.includes("🥰") ||
      norm.includes("😘")
    ) {
      return {
        speech: "Ahhh! Yes! My heart is full of joy and energy! 🥰",
        faceStatus: "😊 Happy",
        imgUrl: tire3Img, // Jumping happy mascot
        imgFilter: "none",
        emojiOverlay: "🥰",
        heartsCount: 5,
        nervousClass: "scale-105"
      };
    }

    // Dry -> Gone, 1 heart (explicitly dry keywords or extremely short dry responses)
    const dryPhrases = ["good morning", "gm", "ok", "fine", "bye", "nothing", "dry", "annoyed", "whatever", "hi", "hello"];
    const isExplicitlyDry = dryPhrases.includes(norm);

    if (isExplicitlyDry) {
      return {
        speech: "Is that all...? That's so dry... I'm fading away 💔",
        faceStatus: "☠️ Gone",
        imgUrl: tire1Img, // Tombstone
        imgFilter: "none",
        emojiOverlay: "💀",
        heartsCount: 1,
        nervousClass: "animate-pulse"
      };
    }

    // Default friendly/weak typing (Neutral state, e.g. typing a sentence but no sweet word yet) -> Weak, 3 hearts
    return {
      speech: "Thank you! Still hoping for some extra warmth though... ⏱️",
      faceStatus: "😟 Weak",
      imgUrl: tire2Img, // Sad crying mascot
      imgFilter: "none",
      emojiOverlay: "💧",
      heartsCount: 3,
      nervousClass: "animate-shake"
    };
  };

  const status = getDecayStatus();

  // Cycle idle speech
  useEffect(() => {
    if (isSimulatingDecay) return;
    const interval = setInterval(() => {
      setSpeechIndex((prev) => (prev + 1) % 5);
    }, 8000);
    return () => clearInterval(interval);
  }, [isSimulatingDecay]);

  // Quick preset helper
  const injectPreset = (text: string) => {
    setReplyText(text);
  };

  return (
    <div className="flex flex-col gap-4 w-full pb-8">

      {/* Received Message Bubble Grid */}
      <div className="relative bg-[#f0f3ff] border-2 border-[#111c2d] rounded-2xl p-4 shadow-[4px_4px_0px_0px_#111c2d] overflow-hidden">
        <div className="absolute top-0 right-0 p-1 bg-[#1b6b4f] text-white text-[9px] font-bold px-2 rounded-bl-xl border-l border-b border-[#111c2d]">
          AWAITING REPLY
        </div>
        
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#3f4943] mb-2 font-mono">
          Last text received
        </p>
        
        <div className="flex flex-col gap-2">
          <div className="max-w-[90%] bg-[#a7f3d0] border-2 border-[#111c2d] rounded-2xl rounded-tl-sm p-3 relative shadow-[2px_2px_0px_0px_#111c2d]">
            <span className="absolute -top-3.5 left-2 bg-[#1b6b4f] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border border-[#111c2d]">
              {partnerName}
            </span>
            <p className="font-bold text-sm text-[#002115] mt-1">
              "{partnerMessage}"
            </p>
          </div>
          <div className="flex justify-end pr-2">
            <span className="text-[10px] font-semibold text-gray-500 flex items-center gap-0.5">
              <span className="text-[#1b6b4f] font-extrabold">Seen ✓✓</span>
            </span>
          </div>
        </div>
      </div>

      {/* Simple Connector Line */}
      <div className="flex flex-col items-center justify-center -my-3 z-10">
        <div className="w-1 h-5 bg-[#1b6b4f] border-x border-[#111c2d]" />
      </div>

      {/* Creature Showcase Stage */}
      <div className="card-chunky p-4 flex flex-col items-center gap-4 relative bg-white">
        
        {/* Floating Speech bubble */}
        <div className="speech-bubble speech-bubble-tail-down w-full max-w-[85%] text-center shadow-[3px_3px_0px_0px_#111c2d] z-10">
          <p className="text-xs font-bold text-[#111c2d] leading-snug">
            {status.speech}
          </p>
        </div>

        {/* The Digital Mascot Container */}
        <div className="relative w-40 h-40 flex items-center justify-center bg-gray-50 rounded-full border-2 border-[#111c2d] p-3 overflow-visible my-1 bg-gradient-to-b from-white to-[#f0f3ff]">
          {/* Sweat or particle overlay */}
          {status.emojiOverlay && (
            <div className="absolute top-2 right-2 text-3xl select-none z-20 animate-bounce">
              {status.emojiOverlay}
            </div>
          )}

          <img
            id="creature-img"
            alt="Morning Creature"
            src={status.imgUrl}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== idealImg) {
                target.src = idealImg;
              }
            }}
            className={`w-32 h-32 object-contain rounded-full transition-all duration-300 ${status.nervousClass}`}
            style={{ filter: status.imgFilter }}
            referrerPolicy="no-referrer"
          />

          {/* Time scale indicator */}
          <span className="absolute bottom-1 right-1 bg-[#111c2d] text-white text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
            {partnerName}
          </span>
        </div>

        {/* Heart Reservoir */}
        <div className="flex flex-col items-center gap-2 w-full border-t border-dashed border-gray-200 pt-3">
          <div className="flex items-center gap-1.5 bg-pink-50 border border-pink-200 px-3 py-1 rounded-full text-xs font-black text-[#765469]">
            <span>Condition:</span>
            <span className="text-[#111c2d] uppercase tracking-wider">{status.faceStatus}</span>
          </div>

          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono">
            Affection Reserve
          </p>
          <div className="flex items-center gap-4 text-2xl">
            {Array.from({ length: 5 }).map((_, i) => {
              const isActive = i < status.heartsCount;
              // Determine dynamic emoji based on active hearts count
              const emoji = status.heartsCount === 1 ? "💔" : status.heartsCount === 3 ? "\u2764\ufe0f\u200d\ud83e\ude79" : "💖";
              return (
                <span 
                  key={i} 
                  className={`transition-all duration-300 ${
                    isActive 
                      ? "animate-heartbeat drop-shadow-sm scale-110" 
                      : "opacity-15 grayscale scale-90"
                  }`}
                >
                  {emoji}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form Input Area */}
      <div className="bg-white border-2 border-[#111c2d] p-4 rounded-2xl shadow-[4px_4px_0px_0px_#111c2d]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono">
              Your Morning Response
            </label>
            <div className="text-[10px] text-gray-400 font-bold">
              Tip: Include nickname + emoji 💕
            </div>
          </div>

          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Type your loving response to ${partnerName}...`}
            rows={2}
            className="w-full bg-[#fcfdfe] border-2 border-[#111c2d] rounded-xl p-3 text-sm font-semibold text-[#111c2d] focus:outline-none focus:border-[#1b6b4f] focus:ring-2 focus:ring-[#1b6b4f]/20 shadow-inner resize-none"
          />

          {/* Preset Buttons for Easy Testing */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] font-bold text-gray-400 flex items-center">Presets:</span>
            <button
              type="button"
              onClick={() => injectPreset("Good morning")}
              className="text-[10px] font-bold bg-[#f3f4f6] text-gray-600 px-2 py-1 rounded-md border border-[#111c2d] hover:bg-gray-100"
            >
              "Good morning" (Dry)
            </button>
            <button
              type="button"
              onClick={() => injectPreset("Good morning to you too!")}
              className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-1 rounded-md border border-[#111c2d] hover:bg-green-100"
            >
              "Good morning!" (Friendly)
            </button>
            <button
              type="button"
              onClick={() => injectPreset("Good morning baby ❤️")}
              className="text-[10px] font-bold bg-pink-50 text-pink-700 px-2 py-1 rounded-md border border-[#111c2d] hover:bg-pink-100 animate-pulse"
            >
              "Good morning baby ❤️" (Poetic/Affectionate)
            </button>
          </div>

          <button
            onClick={onSubmitReply}
            disabled={replyText.trim().length === 0 || isAnalyzing}
            className={`w-full py-3 rounded-full flex items-center justify-center gap-2 uppercase tracking-widest text-[#111c2d] font-bold text-xs border-2 border-[#111c2d] transition-all cursor-pointer ${
              replyText.trim().length === 0 || isAnalyzing
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300"
                : "bg-[#1b6b4f] text-white shadow-[0px_4px_0px_0px_#0c3627] hover:translate-y-0.5 active:translate-y-1 active:shadow-[0px_1px_0px_0px_#0c3627]"
            }`}
          >
            <span>{isAnalyzing ? "Analyzing..." : "Send Reply"}</span>
            {isAnalyzing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>


    </div>
  );
}
