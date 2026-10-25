import fs from 'fs';
import path from 'path';
import { IEvokeApiClient } from './evoke-api.interface.js';
import {
  RegistrationPayload,
  RegistrationResponse,
  PlayerProfile,
  DuplicateCheckResult,
  Tournament,
  TournamentRegResponse,
} from './types.js';

interface MockDatabase {
  nextPlayerSeq: number;
  players: PlayerProfile[];
  tournaments: Tournament[];
}

export class MockEvokeApiClient implements IEvokeApiClient {
  private dbFilePath: string;
  private db: MockDatabase;

  constructor(customDbPath?: string) {
    this.dbFilePath = customDbPath || path.resolve(process.cwd(), 'data', 'mock_db.json');
    this.db = this.loadDatabase();
  }

  private loadDatabase(): MockDatabase {
    try {
      const dir = path.dirname(this.dbFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.dbFilePath)) {
        const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('⚠️ Could not read mock database file, initializing default in-memory database:', err);
    }

    const defaultDb: MockDatabase = {
      nextPlayerSeq: 142,
      players: [],
      tournaments: [
        {
          id: 'TOURN-VAL-01',
          title: 'VALORANT Community Cup — Season 1',
          game: 'valorant',
          description: 'Official Evoke 5v5 single-elimination tournament for Tier-2/3 squads.',
          date: 'Saturday, October 3, 2026 • 6:00 PM IST',
          format: '5v5 Single Elimination (Bo1 / Final Bo3)',
          maxSlots: 32,
          registeredSlots: 14,
          prizePool: '₹25,000 INR',
          status: 'open',
          rules: 'All participants must be registered with Evoke. Anti-cheat required.',
          participants: [],
        },
        {
          id: 'TOURN-BGMI-01',
          title: 'BGMI Daily Scrims Showcase',
          game: 'bgmi',
          description: 'Daily custom room scrims for registered BGMI competitive lineups.',
          date: 'Daily • 8:00 PM IST',
          format: 'Erangel & Miramar (Squads)',
          maxSlots: 20,
          registeredSlots: 8,
          prizePool: '₹5,000 INR Weekly',
          status: 'open',
          rules: 'Level 40+ BGMI account required. No iPads/Emulators.',
          participants: [],
        },
        {
          id: 'TOURN-EAFC-01',
          title: 'EA FC 27 Weekend Championship',
          game: 'eafc',
          description: '1v1 Ultimate Team Open Tournament across PC, PlayStation, and Xbox.',
          date: 'Sunday, October 11, 2026 • 5:00 PM IST',
          format: '1v1 Knockout (90 OVR Mode)',
          maxSlots: 64,
          registeredSlots: 22,
          prizePool: '₹15,000 INR',
          status: 'open',
          rules: 'Crossplay must be enabled. Screenshots of match end screen mandatory.',
          participants: [],
        },
      ],
    };

    this.saveDatabase(defaultDb);
    return defaultDb;
  }

  private saveDatabase(dbToSave: MockDatabase = this.db): void {
    try {
      const dir = path.dirname(this.dbFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dbFilePath, JSON.stringify(dbToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('❌ Failed to persist mock database:', err);
    }
  }

  public async checkDuplicate(payload: RegistrationPayload): Promise<DuplicateCheckResult> {
    const existingByDiscord = this.db.players.find((p) => p.discordId === payload.discordId);
    if (existingByDiscord) {
      return {
        isDuplicate: true,
        duplicateField: 'discordId',
        duplicateValue: payload.discordId,
        message: `Discord account is already registered under Player ID ${existingByDiscord.playerId}.`,
      };
    }

    const existingByEmail = this.db.players.find(
      (p) => p.email.toLowerCase() === payload.email.toLowerCase()
    );
    if (existingByEmail) {
      return {
        isDuplicate: true,
        duplicateField: 'email',
        duplicateValue: payload.email,
        message: `Email address is already linked with Player ID ${existingByEmail.playerId}.`,
      };
    }

    const existingByUid = this.db.players.find(
      (p) => p.game === payload.game && p.gameUid.toLowerCase() === payload.gameUid.toLowerCase()
    );
    if (existingByUid) {
      return {
        isDuplicate: true,
        duplicateField: 'gameUid',
        duplicateValue: payload.gameUid,
        message: `This game account (${payload.game.toUpperCase()} UID) is already registered with Evoke.`,
      };
    }

    return { isDuplicate: false };
  }

  public async registerPlayer(payload: RegistrationPayload): Promise<RegistrationResponse> {
    const dupCheck = await this.checkDuplicate(payload);
    if (dupCheck.isDuplicate) {
      throw new Error(dupCheck.message || 'Duplicate player registration detected.');
    }

    const seq = this.db.nextPlayerSeq++;
    const playerId = `EVK-${seq.toString().padStart(5, '0')}`;
    const profileId = `prf_${Math.random().toString(36).substring(2, 10)}`;

    const newProfile: PlayerProfile = {
      playerId,
      profileId,
      discordId: payload.discordId,
      discordUsername: payload.discordUsername,
      fullName: payload.fullName,
      game: payload.game,
      ign: payload.ign,
      gameUid: payload.gameUid,
      email: payload.email.toLowerCase(),
      age: payload.age,
      platform: payload.platform,
      riotId: payload.riotId,
      riotTag: payload.riotTag,
      status: 'verified',
      registeredAt: new Date().toISOString(),
    };

    this.db.players.push(newProfile);
    this.saveDatabase();

    return {
      success: true,
      playerId,
      profileId,
      message: 'Player registered successfully in Mock API mode.',
    };
  }

  public async getPlayerProfile(query: {
    discordId?: string;
    playerId?: string;
  }): Promise<PlayerProfile | null> {
    if (query.discordId) {
      const match = this.db.players.find((p) => p.discordId === query.discordId);
      if (match) return { ...match };
    }
    if (query.playerId) {
      const match = this.db.players.find(
        (p) => p.playerId.toLowerCase() === query.playerId?.toLowerCase()
      );
      if (match) return { ...match };
    }
    return null;
  }

  public async updatePlayerStatus(
    playerId: string,
    status: 'verified' | 'pending' | 'suspended'
  ): Promise<boolean> {
    const player = this.db.players.find((p) => p.playerId.toLowerCase() === playerId.toLowerCase());
    if (!player) return false;
    player.status = status;
    player.updatedAt = new Date().toISOString();
    this.saveDatabase();
    return true;
  }

  public async listPlayers(filter?: { game?: string; status?: string }): Promise<PlayerProfile[]> {
    let result = [...this.db.players];
    if (filter?.game) {
      result = result.filter((p) => p.game.toLowerCase() === filter.game?.toLowerCase());
    }
    if (filter?.status) {
      result = result.filter((p) => p.status.toLowerCase() === filter.status?.toLowerCase());
    }
    return result;
  }

  public async getTournaments(game?: string): Promise<Tournament[]> {
    if (game) {
      return this.db.tournaments.filter((t) => t.game.toLowerCase() === game.toLowerCase());
    }
    return [...this.db.tournaments];
  }

  public async getTournamentById(tournamentId: string): Promise<Tournament | null> {
    const tourney = this.db.tournaments.find(
      (t) => t.id.toLowerCase() === tournamentId.toLowerCase()
    );
    return tourney ? { ...tourney } : null;
  }

  public async registerForTournament(
    playerId: string,
    tournamentId: string
  ): Promise<TournamentRegResponse> {
    const tourney = this.db.tournaments.find(
      (t) => t.id.toLowerCase() === tournamentId.toLowerCase()
    );
    if (!tourney) {
      return {
        success: false,
        message: `Tournament ${tournamentId} not found.`,
        tournamentId,
        playerId,
      };
    }

    if (tourney.status !== 'open') {
      return {
        success: false,
        message: `Tournament ${tourney.title} is currently closed for registrations.`,
        tournamentId,
        playerId,
      };
    }

    tourney.participants = tourney.participants || [];
    if (tourney.participants.includes(playerId)) {
      return {
        success: false,
        message: `Player ${playerId} is already registered in this tournament!`,
        tournamentId,
        playerId,
      };
    }

    if (tourney.registeredSlots >= tourney.maxSlots) {
      return {
        success: false,
        message: `Tournament ${tourney.title} has reached maximum capacity (${tourney.maxSlots} slots).`,
        tournamentId,
        playerId,
      };
    }

    tourney.participants.push(playerId);
    tourney.registeredSlots += 1;
    this.saveDatabase();

    return {
      success: true,
      message: `Successfully registered for ${tourney.title}!`,
      tournamentId,
      playerId,
      slotNumber: tourney.registeredSlots,
    };
  }

  public async submitFeedback(feedback: {
    discordId: string;
    discordUsername: string;
    category: string;
    message: string;
    attachmentUrl?: string;
  }): Promise<{ success: boolean; message?: string }> {
    console.log(`[MOCK API] Feedback received from ${feedback.discordUsername} (${feedback.category}): ${feedback.message}`);
    return {
      success: true,
      message: 'Feedback received in Mock API mode.',
    };
  }
}
