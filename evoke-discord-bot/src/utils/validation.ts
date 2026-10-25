import { z } from 'zod';
import { SupportedGame, EafcPlatform } from '../config/games.js';
import { env } from '../config/env.js';

// Base Player Input
export const basePlayerSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full Name must be at least 2 characters long')
    .max(50, 'Full Name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s'.]+$/, 'Full Name should only contain letters, spaces, and periods'),
  ign: z
    .string()
    .min(2, 'In-Game Name (IGN) must be at least 2 characters')
    .max(24, 'In-Game Name (IGN) cannot exceed 24 characters'),
  email: z.string().email('Please enter a valid email address'),
  age: z
    .number({ invalid_type_error: 'Age must be a valid number' })
    .int('Age must be a whole number')
    .min(env.MIN_PLAYER_AGE, `You must be at least ${env.MIN_PLAYER_AGE} years old to register`)
    .max(env.MAX_PLAYER_AGE, `Age cannot exceed ${env.MAX_PLAYER_AGE}`),
});

// BGMI Specific Schema
export const bgmiRegistrationSchema = basePlayerSchema.extend({
  game: z.literal('bgmi'),
  gameUid: z
    .string()
    .regex(/^\d{5,15}$/, 'BGMI UID must be numeric and between 5 to 15 digits long'),
});

// VALORANT Specific Schema
export const valorantRegistrationSchema = basePlayerSchema.extend({
  game: z.literal('valorant'),
  gameUid: z
    .string()
    .regex(
      /^.{3,16}#[a-zA-Z0-9]{3,6}$/,
      'Riot ID must be in the format "Username#TAG" (e.g., TenZ#NA1 or Jett#0001)'
    ),
  riotId: z.string().optional(),
  riotTag: z.string().optional(),
});

// EA FC Specific Schema
export const eafcRegistrationSchema = basePlayerSchema.extend({
  game: z.literal('eafc'),
  gameUid: z
    .string()
    .min(3, 'EA ID must be at least 3 characters')
    .max(20, 'EA ID cannot exceed 20 characters'),
  platform: z.enum(['PC', 'PlayStation', 'Xbox'], {
    errorMap: () => ({ message: 'Platform must be PC, PlayStation, or Xbox' }),
  }),
});

export const registrationSchema = z.discriminatedUnion('game', [
  bgmiRegistrationSchema,
  valorantRegistrationSchema,
  eafcRegistrationSchema,
]);

export type BgmiRegistrationInput = z.infer<typeof bgmiRegistrationSchema>;
export type ValorantRegistrationInput = z.infer<typeof valorantRegistrationSchema>;
export type EafcRegistrationInput = z.infer<typeof eafcRegistrationSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;

// Feedback validation
export const feedbackSchema = z.object({
  category: z.enum(['Server', 'Tournament', 'Registration', 'Game', 'Other']),
  feedback: z.string().min(10, 'Feedback must be at least 10 characters long').max(1000, 'Feedback cannot exceed 1000 characters'),
  attachmentUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

/**
 * Parses Riot ID into username and tag
 */
export function parseRiotId(fullRiotId: string): { name: string; tag: string } | null {
  const parts = fullRiotId.split('#');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return { name: parts[0].trim(), tag: parts[1].trim() };
}

/**
 * Helper to normalize and validate registration input data from Discord modals
 */
export function validateRegistrationData(
  game: SupportedGame,
  raw: {
    fullName: string;
    ign: string;
    email: string;
    age: string | number;
    gameUid: string;
    platform?: string;
  }
): { success: true; data: RegistrationInput } | { success: false; errors: string[] } {
  const ageNum = typeof raw.age === 'string' ? parseInt(raw.age.trim(), 10) : raw.age;

  const candidate: any = {
    game,
    fullName: raw.fullName?.trim() || '',
    ign: raw.ign?.trim() || '',
    email: raw.email?.trim().toLowerCase() || '',
    age: isNaN(ageNum) ? raw.age : ageNum,
    gameUid: raw.gameUid?.trim() || '',
  };

  if (game === 'eafc') {
    // Normalizing platform capitalization
    let p = (raw.platform || '').trim();
    if (p.toLowerCase() === 'pc') candidate.platform = 'PC';
    else if (p.toLowerCase().includes('play') || p.toLowerCase() === 'ps' || p.toLowerCase() === 'ps5' || p.toLowerCase() === 'ps4') candidate.platform = 'PlayStation';
    else if (p.toLowerCase().includes('xbox')) candidate.platform = 'Xbox';
    else candidate.platform = p as EafcPlatform;
  }

  if (game === 'valorant' && candidate.gameUid) {
    const parsed = parseRiotId(candidate.gameUid);
    if (parsed) {
      candidate.riotId = parsed.name;
      candidate.riotTag = parsed.tag;
    }
  }

  const result = registrationSchema.safeParse(candidate);
  if (!result.success) {
    const errors = result.error.errors.map((e) => `${e.message}`);
    return { success: false, errors };
  }

  return { success: true, data: result.data };
}
