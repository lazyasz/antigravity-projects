import {
  RegistrationPayload,
  RegistrationResponse,
  PlayerProfile,
  DuplicateCheckResult,
  Tournament,
  TournamentRegResponse,
} from './types.js';

export interface IEvokeApiClient {
  /**
   * Check if a given player payload has duplicates in Discord ID, Email, or Game UID
   */
  checkDuplicate(payload: RegistrationPayload): Promise<DuplicateCheckResult>;

  /**
   * Register a new player with the backend
   */
  registerPlayer(payload: RegistrationPayload): Promise<RegistrationResponse>;

  /**
   * Retrieve player profile by Discord ID or Evoke Player ID
   */
  getPlayerProfile(query: { discordId?: string; playerId?: string }): Promise<PlayerProfile | null>;

  /**
   * Update player profile status or details
   */
  updatePlayerStatus(playerId: string, status: 'verified' | 'pending' | 'suspended'): Promise<boolean>;

  /**
   * List all registered players (supports pagination / filtering for admin suite)
   */
  listPlayers(filter?: { game?: string; status?: string }): Promise<PlayerProfile[]>;

  /**
   * Retrieve list of active tournaments
   */
  getTournaments(game?: string): Promise<Tournament[]>;

  /**
   * Retrieve details of a specific tournament
   */
  getTournamentById(tournamentId: string): Promise<Tournament | null>;

  /**
   * Register an Evoke player for a tournament
   */
  registerForTournament(playerId: string, tournamentId: string): Promise<TournamentRegResponse>;

  /**
   * Submit community feedback to the backend
   */
  submitFeedback(feedback: {
    discordId: string;
    discordUsername: string;
    category: string;
    message: string;
    attachmentUrl?: string;
  }): Promise<{ success: boolean; message?: string }>;
}
