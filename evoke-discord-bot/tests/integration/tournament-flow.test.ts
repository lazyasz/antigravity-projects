import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { MockEvokeApiClient } from '../../src/services/api/mock-evoke-api.js';
import { PlayerService } from '../../src/services/player-service.js';
import { TournamentService } from '../../src/services/tournament-service.js';

const TOURNEY_DB_PATH = path.resolve(process.cwd(), 'data', 'tourney_mock_db.json');

describe('Tournament System Integration Tests', () => {
  let mockApi: MockEvokeApiClient;
  let playerService: PlayerService;
  let tournamentService: TournamentService;

  beforeEach(() => {
    if (fs.existsSync(TOURNEY_DB_PATH)) {
      fs.unlinkSync(TOURNEY_DB_PATH);
    }
    mockApi = new MockEvokeApiClient(TOURNEY_DB_PATH);
    playerService = new PlayerService(mockApi);
    tournamentService = new TournamentService(mockApi, playerService);
  });

  afterAll(() => {
    if (fs.existsSync(TOURNEY_DB_PATH)) {
      fs.unlinkSync(TOURNEY_DB_PATH);
    }
  });

  it('should prevent unregistered discord users from joining tournaments', async () => {
    const result = await tournamentService.registerUserForTournament(
      'unregistered_user_99',
      'TOURN-VAL-01'
    );
    expect(result.success).toBe(false);
    expect(result.message).toContain('register an Evoke Player Profile');
  });

  it('should allow registered players to join matching game tournaments and update slots', async () => {
    // Register player
    const regRes = await mockApi.registerPlayer({
      discordId: '888888888888888888',
      discordUsername: 'val_champ',
      fullName: 'Vikram Seth',
      game: 'valorant',
      ign: 'VikramV',
      gameUid: 'Vikram#IN1',
      email: 'vikram@evoke.gg',
      age: 21,
    });

    expect(regRes.success).toBe(true);

    // Register for tournament
    const tourneyRes = await tournamentService.registerUserForTournament(
      '888888888888888888',
      'TOURN-VAL-01'
    );
    expect(tourneyRes.success).toBe(true);

    const tourney = await tournamentService.getTournamentById('TOURN-VAL-01');
    expect(tourney?.participants).toContain(regRes.playerId);
  });

  it('should reject tournament registration if player registered game does not match tournament game', async () => {
    // Register BGMI player
    await mockApi.registerPlayer({
      discordId: '777777777777777777',
      discordUsername: 'bgmi_only',
      fullName: 'Sameer Khan',
      game: 'bgmi',
      ign: 'SameerB',
      gameUid: '5177777777',
      email: 'sameer@evoke.gg',
      age: 19,
    });

    // Attempt to register for VALORANT tournament
    const result = await tournamentService.registerUserForTournament(
      '777777777777777777',
      'TOURN-VAL-01'
    );
    expect(result.success).toBe(false);
    expect(result.message).toContain('tournament is for **VALORANT**');
  });
});
