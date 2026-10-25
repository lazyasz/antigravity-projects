import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { MockEvokeApiClient } from '../../src/services/api/mock-evoke-api.js';
import { RegistrationPayload } from '../../src/services/api/types.js';

const TEST_DB_PATH = path.resolve(process.cwd(), 'data', 'test_mock_db.json');

describe('MockEvokeApiClient Unit Tests', () => {
  let mockApi: MockEvokeApiClient;

  beforeEach(() => {
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    mockApi = new MockEvokeApiClient(TEST_DB_PATH);
  });

  afterAll(() => {
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  it('should register a player and return a valid EVK-XXXXX Player ID', async () => {
    const payload: RegistrationPayload = {
      discordId: '100000000000000001',
      discordUsername: 'dhruv_gamer',
      fullName: 'Dhruv Sakhare',
      game: 'valorant',
      ign: 'DhruvVal',
      gameUid: 'Dhruv#EVK',
      email: 'dhruv@evoke.gg',
      age: 21,
    };

    const response = await mockApi.registerPlayer(payload);
    expect(response.success).toBe(true);
    expect(response.playerId).toMatch(/^EVK-\d{5}$/);
    expect(response.profileId).toBeDefined();

    // Verify player profile lookup
    const profile = await mockApi.getPlayerProfile({ discordId: payload.discordId });
    expect(profile).not.toBeNull();
    expect(profile?.fullName).toBe('Dhruv Sakhare');
    expect(profile?.playerId).toBe(response.playerId);
    expect(profile?.status).toBe('verified');
  });

  it('should detect duplicate Discord ID', async () => {
    const payload1: RegistrationPayload = {
      discordId: '100000000000000002',
      discordUsername: 'player1',
      fullName: 'Player One',
      game: 'bgmi',
      ign: 'P1',
      gameUid: '5111111111',
      email: 'p1@evoke.gg',
      age: 18,
    };

    await mockApi.registerPlayer(payload1);

    const payloadDuplicateDiscord: RegistrationPayload = {
      discordId: '100000000000000002', // Same Discord ID
      discordUsername: 'player1_alt',
      fullName: 'Player Alt',
      game: 'valorant',
      ign: 'P1Alt',
      gameUid: 'P1#0001',
      email: 'p1alt@evoke.gg',
      age: 19,
    };

    const dupCheck = await mockApi.checkDuplicate(payloadDuplicateDiscord);
    expect(dupCheck.isDuplicate).toBe(true);
    expect(dupCheck.duplicateField).toBe('discordId');
  });

  it('should detect duplicate Email address case-insensitively', async () => {
    const payload1: RegistrationPayload = {
      discordId: '100000000000000003',
      discordUsername: 'user_a',
      fullName: 'User A',
      game: 'eafc',
      ign: 'UserA',
      gameUid: 'EA_USER_A',
      email: 'same_email@evoke.gg',
      age: 20,
    };

    await mockApi.registerPlayer(payload1);

    const payloadDuplicateEmail: RegistrationPayload = {
      discordId: '100000000000000004',
      discordUsername: 'user_b',
      fullName: 'User B',
      game: 'bgmi',
      ign: 'UserB',
      gameUid: '5222222222',
      email: 'SAME_EMAIL@EVOKE.GG', // Uppercase variation
      age: 22,
    };

    const dupCheck = await mockApi.checkDuplicate(payloadDuplicateEmail);
    expect(dupCheck.isDuplicate).toBe(true);
    expect(dupCheck.duplicateField).toBe('email');
  });

  it('should detect duplicate Game UID within the same game division', async () => {
    const payload1: RegistrationPayload = {
      discordId: '100000000000000005',
      discordUsername: 'val_player_1',
      fullName: 'Valorant Pro 1',
      game: 'valorant',
      ign: 'ValPro1',
      gameUid: 'TenZ#NA1',
      email: 'val1@evoke.gg',
      age: 20,
    };

    await mockApi.registerPlayer(payload1);

    const payloadDuplicateRiotId: RegistrationPayload = {
      discordId: '100000000000000006',
      discordUsername: 'val_player_2',
      fullName: 'Valorant Pro 2',
      game: 'valorant',
      ign: 'ValPro2',
      gameUid: 'tenz#na1', // Lowercase variation of same Riot ID
      email: 'val2@evoke.gg',
      age: 21,
    };

    const dupCheck = await mockApi.checkDuplicate(payloadDuplicateRiotId);
    expect(dupCheck.isDuplicate).toBe(true);
    expect(dupCheck.duplicateField).toBe('gameUid');
  });

  it('should list tournaments and support player tournament registration', async () => {
    const tourneys = await mockApi.getTournaments();
    expect(tourneys.length).toBeGreaterThanOrEqual(3);

    const valTourney = tourneys.find((t) => t.game === 'valorant');
    expect(valTourney).toBeDefined();

    // Register a player
    const regRes = await mockApi.registerPlayer({
      discordId: '100000000000000007',
      discordUsername: 'tournament_champ',
      fullName: 'Champ User',
      game: 'valorant',
      ign: 'Champ',
      gameUid: 'Champ#NA1',
      email: 'champ@evoke.gg',
      age: 20,
    });

    const initialSlots = valTourney!.registeredSlots;

    const tourneyReg = await mockApi.registerForTournament(regRes.playerId, valTourney!.id);
    expect(tourneyReg.success).toBe(true);
    expect(tourneyReg.slotNumber).toBe(initialSlots + 1);

    // Duplicate tournament registration should be rejected
    const tourneyRegDup = await mockApi.registerForTournament(regRes.playerId, valTourney!.id);
    expect(tourneyRegDup.success).toBe(false);
    expect(tourneyRegDup.message).toContain('already registered');
  });
});
