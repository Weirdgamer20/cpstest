/**
 * Types and interfaces for the CPSTEST application.
 */

export type AppMode =
  | 'home'
  | 'cps-test'
  | 'jitter'
  | 'kohi'
  | 'cupcakes-2048'
  | 'typing'
  | 'spacebar-counter'
  | 'spacebar-clicker'
  | 'coreball'
  | 'reaction'
  | 'challenges'
  | 'mobile-arena'
  | 'leaderboard'
  | 'profile'
  | 'seo-library'
  | 'challenge'
  | 'games'
  | 'blog';

export interface ClickRecord {
  id: string;
  date: string;
  duration: string; // "1s", "5s", etc. or "Manual"
  clicks: number;
  cps: number;
  type: 'cps' | 'jitter' | 'kohi' | 'scroll' | 'spacebar';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  targetCps: number;
  duration: string;
  unlocked: boolean;
  badgeEmoji: string;
}
