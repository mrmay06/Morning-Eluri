/**
 * Types for LoverGochi / Morning Creature App
 */

export interface EvaluationResult {
  score: number; // 0 - 100
  tier: 1 | 2 | 3 | 4;
  commentary: string; // Humor explanation
  replyReaction: string; // What the creature says mockingly or happily
  verdict: string; // "Gone" | "Weak" | "Fully Healed" | "Evolved"
}

