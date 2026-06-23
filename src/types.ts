/**
 * Types for LoverGochi / Morning Creature App
 */

export interface MemoryEntry {
  id: string;
  day: number;
  date: string;
  received: string;
  reply: string;
  score: number;
  tier: 1 | 2 | 3 | 4; // 1: Gone, 2: Weak/Stable, 3: Energy Matched, 4: Legendary
  outcome: string;
  commentary: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface EvolutionStage {
  stageNum: number;
  name: string;
  description: string;
  image: string; // url or custom CSS representation
  locked: boolean;
  requirement: string;
}

export interface EvaluationResult {
  score: number; // 0 - 100
  tier: 1 | 2 | 3 | 4;
  commentary: string; // Humor explanation
  replyReaction: string; // What the creature says mockingly or happily
  verdict: string; // "Gone" | "Weak" | "Fully Healed" | "Evolved"
}
