import { SupportedGame, EafcPlatform } from '../../config/games.js';

export interface RegistrationPayload {
  discordId: string;
  discordUsername: string;
  fullName: string;
  game: SupportedGame;
  ign: string;
  gameUid: string;
  email: string;
  age: number;
  platform?: EafcPlatform;
  riotId?: string;
  riotTag?: string;
}

export interface RegistrationResponse {
  success: boolean;
  playerId: string;
  profileId: string;
  message?: string;
}

export interface PlayerProfile {
  playerId: string;
  profileId: string;
  discordId: string;
  discordUsername: string;
  fullName: string;
  game: SupportedGame;
  ign: string;
  gameUid: string;
  email: string;
  age: number;
  platform?: EafcPlatform;
  riotId?: string;
  riotTag?: string;
  status: 'verified' | 'pending' | 'suspended';
  registeredAt: string;
  updatedAt?: string;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateField?: 'discordId' | 'email' | 'gameUid' | 'riotId' | 'eaId';
  duplicateValue?: string;
  message?: string;
}

export interface Tournament {
  id: string;
  title: string;
  game: SupportedGame;
  description: string;
  date: string;
  format: string; // e.g. '5v5 Single Elimination' or 'Squads Battle Royale'
  maxSlots: number;
  registeredSlots: number;
  prizePool: string;
  status: 'open' | 'closed' | 'ongoing' | 'completed';
  rules?: string;
  participants?: string[]; // Array of playerIds
}

export interface TournamentRegResponse {
  success: boolean;
  message: string;
  tournamentId: string;
  playerId: string;
  slotNumber?: number;
}
