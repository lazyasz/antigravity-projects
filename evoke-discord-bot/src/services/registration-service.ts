import { Guild, GuildMember } from 'discord.js';
import { IEvokeApiClient } from './api/evoke-api.interface.js';
import { RegistrationPayload, PlayerProfile } from './api/types.js';
import { RoleService } from './role-service.js';
import { LogService } from './log-service.js';
import { SupportedGame } from '../config/games.js';

interface PendingRegistration {
  payload: RegistrationPayload;
  timestamp: number;
}

export class RegistrationService {
  private api: IEvokeApiClient;
  private roleService: RoleService;
  private logService?: LogService;
  private pendingReviews: Map<string, PendingRegistration> = new Map();
  private inFlightRegistrations: Set<string> = new Set();

  private readonly PENDING_TTL_MS = 10 * 60 * 1000; // 10 minutes timeout

  constructor(apiClient: IEvokeApiClient, roleService: RoleService, logService?: LogService) {
    this.api = apiClient;
    this.roleService = roleService;
    this.logService = logService;

    // Periodic cleanup of stale pending review states
    setInterval(() => {
      const now = Date.now();
      for (const [userId, entry] of this.pendingReviews.entries()) {
        if (now - entry.timestamp > this.PENDING_TTL_MS) {
          this.pendingReviews.delete(userId);
        }
      }
    }, 2 * 60 * 1000).unref();
  }

  /**
   * Saves a pending review payload for confirmation
   */
  public storePendingReview(userId: string, payload: RegistrationPayload): void {
    this.pendingReviews.set(userId, {
      payload,
      timestamp: Date.now(),
    });
  }

  /**
   * Retrieves pending review payload with TTL expiration check
   */
  public getPendingReview(userId: string): RegistrationPayload | null {
    const entry = this.pendingReviews.get(userId);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.PENDING_TTL_MS) {
      this.pendingReviews.delete(userId);
      return null;
    }

    return entry.payload;
  }

  /**
   * Clears pending review
   */
  public clearPendingReview(userId: string): void {
    this.pendingReviews.delete(userId);
  }

  /**
   * Complete registration execution with Idempotency Lock
   */
  public async executeRegistration(
    guild: Guild | null,
    member: GuildMember | null,
    payload: RegistrationPayload
  ): Promise<{
    success: boolean;
    profile?: PlayerProfile;
    errorTitle?: string;
    errorMessage?: string;
    isDuplicate?: boolean;
    duplicateField?: string;
    duplicateValue?: string;
  }> {
    // 0. Idempotency Lock - Prevent duplicate concurrent submissions
    if (this.inFlightRegistrations.has(payload.discordId)) {
      return {
        success: false,
        errorTitle: 'Submission In Progress',
        errorMessage: '⏳ Your registration is already being processed. Please wait a moment...',
      };
    }

    this.inFlightRegistrations.add(payload.discordId);

    try {
      // 1. Duplicate check with backend API
      const dupCheck = await this.api.checkDuplicate(payload);
      if (dupCheck.isDuplicate) {
        if (this.logService) {
          await this.logService.logDuplicateAttempt({
            discordId: payload.discordId,
            discordTag: payload.discordUsername,
            game: payload.game,
            field: dupCheck.duplicateField || 'unknown',
            value: dupCheck.duplicateValue || '',
          });
        }
        return {
          success: false,
          isDuplicate: true,
          duplicateField: dupCheck.duplicateField || 'Game Identifier',
          duplicateValue: dupCheck.duplicateValue || '',
          errorTitle: 'Registration Conflict',
          errorMessage:
            dupCheck.message ||
            'This game account or Discord user is already registered with Evoke Esports.',
        };
      }

      // 2. Call backend API to create player record
      let apiResponse;
      try {
        apiResponse = await this.api.registerPlayer(payload);
      } catch (err: any) {
        if (this.logService) {
          await this.logService.logApiError('/api/players/register', err.message);
        }
        return {
          success: false,
          errorTitle: 'Backend Unavailable',
          errorMessage: `⚠️ Evoke registration is temporarily unavailable. Please try again later.\n*Details: ${err.message}*`,
        };
      }

      // 3. Construct PlayerProfile
      const profile: PlayerProfile = {
        playerId: apiResponse.playerId,
        profileId: apiResponse.profileId,
        discordId: payload.discordId,
        discordUsername: payload.discordUsername,
        fullName: payload.fullName,
        game: payload.game,
        ign: payload.ign,
        gameUid: payload.gameUid,
        email: payload.email,
        age: payload.age,
        platform: payload.platform,
        riotId: payload.riotId,
        riotTag: payload.riotTag,
        status: 'verified',
        registeredAt: new Date().toISOString(),
      };

      // 4. Assign Discord Roles
      if (guild && member) {
        await this.roleService.assignRegistrationRoles(guild, member, payload.game as SupportedGame);
      }

      // 5. Log structured event (Email is automatically masked inside LogService)
      if (this.logService) {
        await this.logService.logRegistrationSuccess({
          discordId: payload.discordId,
          discordTag: payload.discordUsername,
          fullName: payload.fullName,
          game: payload.game,
          ign: payload.ign,
          gameUid: payload.gameUid,
          email: payload.email,
          playerId: profile.playerId,
        });
      }

      // 6. Clear pending state
      this.clearPendingReview(payload.discordId);

      return {
        success: true,
        profile,
      };
    } finally {
      // Release in-flight lock
      this.inFlightRegistrations.delete(payload.discordId);
    }
  }
}
