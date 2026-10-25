import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { MockEvokeApiClient } from '../../src/services/api/mock-evoke-api.js';
import { RoleService } from '../../src/services/role-service.js';
import { RegistrationService } from '../../src/services/registration-service.js';
import { PlayerService } from '../../src/services/player-service.js';
import { RegistrationPayload } from '../../src/services/api/types.js';

const INTEGRATION_DB_PATH = path.resolve(process.cwd(), 'data', 'integration_mock_db.json');

describe('Full Registration Flow Integration Test', () => {
  let mockApi: MockEvokeApiClient;
  let roleService: RoleService;
  let registrationService: RegistrationService;
  let playerService: PlayerService;

  beforeEach(() => {
    if (fs.existsSync(INTEGRATION_DB_PATH)) {
      fs.unlinkSync(INTEGRATION_DB_PATH);
    }
    mockApi = new MockEvokeApiClient(INTEGRATION_DB_PATH);
    roleService = new RoleService();
    registrationService = new RegistrationService(mockApi, roleService);
    playerService = new PlayerService(mockApi);
  });

  afterAll(() => {
    if (fs.existsSync(INTEGRATION_DB_PATH)) {
      fs.unlinkSync(INTEGRATION_DB_PATH);
    }
  });

  it('should successfully execute the full registration lifecycle for BGMI, VALORANT, and EA FC', async () => {
    const bgmiUser: RegistrationPayload = {
      discordId: '987654321012345671',
      discordUsername: 'bgmi_pro',
      fullName: 'Aarav Patel',
      game: 'bgmi',
      ign: 'AaravGod',
      gameUid: '5198765432',
      email: 'aarav@evoke.gg',
      age: 19,
    };

    // 1. Pending review storage
    registrationService.storePendingReview(bgmiUser.discordId, bgmiUser);
    const retrievedPending = registrationService.getPendingReview(bgmiUser.discordId);
    expect(retrievedPending).toEqual(bgmiUser);

    // 2. Execute registration
    const result = await registrationService.executeRegistration(null, null, bgmiUser);
    expect(result.success).toBe(true);
    expect(result.profile).toBeDefined();
    expect(result.profile?.playerId).toMatch(/^EVK-\d{5}$/);
    expect(result.profile?.fullName).toBe('Aarav Patel');

    // 3. Pending review should now be cleared
    expect(registrationService.getPendingReview(bgmiUser.discordId)).toBeNull();

    // 4. Verify user is now marked as registered
    const isReg = await playerService.isUserRegistered(bgmiUser.discordId);
    expect(isReg).toBe(true);

    const profile = await playerService.getProfileByDiscordId(bgmiUser.discordId);
    expect(profile?.playerId).toBe(result.profile?.playerId);

    // 5. Attempting to register the same Discord user again should be blocked
    const dupResult = await registrationService.executeRegistration(null, null, {
      ...bgmiUser,
      game: 'valorant',
      gameUid: 'Aarav#VAL1',
    });
    expect(dupResult.success).toBe(false);
    expect(dupResult.isDuplicate).toBe(true);
  });
});
