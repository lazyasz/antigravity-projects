import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { MockEvokeApiClient } from '../../src/services/api/mock-evoke-api.js';
import { RoleService } from '../../src/services/role-service.js';
import { RegistrationService } from '../../src/services/registration-service.js';
import { PlayerService } from '../../src/services/player-service.js';
import { EvokeEmbeds } from '../../src/utils/embed-builder.js';
import { validateRegistrationData } from '../../src/utils/validation.js';

const AUDIT_DB_PATH = path.resolve(process.cwd(), 'data', 'audit_mock_db.json');

describe('PRD Implementation & Security Audit', () => {
  let mockApi: MockEvokeApiClient;
  let roleService: RoleService;
  let registrationService: RegistrationService;
  let playerService: PlayerService;

  beforeEach(() => {
    if (fs.existsSync(AUDIT_DB_PATH)) {
      fs.unlinkSync(AUDIT_DB_PATH);
    }
    mockApi = new MockEvokeApiClient(AUDIT_DB_PATH);
    roleService = new RoleService();
    registrationService = new RegistrationService(mockApi, roleService);
    playerService = new PlayerService(mockApi);
  });

  afterAll(() => {
    if (fs.existsSync(AUDIT_DB_PATH)) {
      fs.unlinkSync(AUDIT_DB_PATH);
    }
  });

  describe('1. Registration Flow & Validation', () => {
    it('validates BGMI numeric UIDs strictly', () => {
      const valid = validateRegistrationData('bgmi', {
        fullName: 'Dhruv Sakhare',
        ign: 'DhruvBGMI',
        email: 'dhruv@evoke.gg',
        age: 20,
        gameUid: '5123456789',
      });
      expect(valid.success).toBe(true);

      const invalid = validateRegistrationData('bgmi', {
        fullName: 'Dhruv Sakhare',
        ign: 'DhruvBGMI',
        email: 'dhruv@evoke.gg',
        age: 20,
        gameUid: 'NON_NUMERIC_UID',
      });
      expect(invalid.success).toBe(false);
    });

    it('validates VALORANT Riot ID#TAG format strictly', () => {
      const valid = validateRegistrationData('valorant', {
        fullName: 'Dhruv Sakhare',
        ign: 'DhruvVal',
        email: 'dhruv@evoke.gg',
        age: 20,
        gameUid: 'Evoke#NA1',
      });
      expect(valid.success).toBe(true);
    });

    it('validates EA FC platform options strictly', () => {
      const valid = validateRegistrationData('eafc', {
        fullName: 'Dhruv Sakhare',
        ign: 'DhruvFC',
        email: 'dhruv@evoke.gg',
        age: 20,
        gameUid: 'DhruvEA',
        platform: 'PlayStation',
      });
      expect(valid.success).toBe(true);
    });
  });

  describe('2. Privacy Guarantees', () => {
    it('ensures /profile embed NEVER renders email or age fields', async () => {
      const registered = await mockApi.registerPlayer({
        discordId: '999000111222333444',
        discordUsername: 'secret_user',
        fullName: 'Secret Player',
        game: 'valorant',
        ign: 'SecretIGN',
        gameUid: 'Secret#0001',
        email: 'private_email@example.com',
        age: 25,
      });

      const profile = await playerService.getProfileByPlayerId(registered.playerId);
      expect(profile).not.toBeNull();

      const { embed } = EvokeEmbeds.playerProfile(profile!);
      const embedJson = embed.toJSON();

      // Check fields for sensitive data leakage
      const allFieldNamesAndValues = (embedJson.fields || [])
        .map((f) => `${f.name} ${f.value}`)
        .join(' ')
        .toLowerCase();

      expect(allFieldNamesAndValues).not.toContain('private_email@example.com');
      expect(allFieldNamesAndValues).not.toContain('email');
      expect(allFieldNamesAndValues).not.toContain('25 years');
      expect(allFieldNamesAndValues).not.toContain('age');
      expect(embedJson.description || '').not.toContain('private_email@example.com');
    });
  });

  describe('3. Persistence & Idempotency', () => {
    it('persists registrations to disk and survives client re-instantiation', async () => {
      const p1 = await mockApi.registerPlayer({
        discordId: '111222333444555666',
        discordUsername: 'persistent_user',
        fullName: 'Persistent Hero',
        game: 'bgmi',
        ign: 'PersistMan',
        gameUid: '5199999999',
        email: 'persist@evoke.gg',
        age: 22,
      });

      // Simulate bot restart by creating a new MockEvokeApiClient reading from the same file
      const restartedApi = new MockEvokeApiClient(AUDIT_DB_PATH);
      const retrieved = await restartedApi.getPlayerProfile({ playerId: p1.playerId });
      expect(retrieved).not.toBeNull();
      expect(retrieved?.fullName).toBe('Persistent Hero');

      // Check duplicate rejection persists after restart
      const dupCheck = await restartedApi.checkDuplicate({
        discordId: '111222333444555666', // Same Discord ID
        discordUsername: 'another_user',
        fullName: 'Another Name',
        game: 'valorant',
        ign: 'AnotherIGN',
        gameUid: 'Another#0001',
        email: 'different@evoke.gg',
        age: 20,
      });
      expect(dupCheck.isDuplicate).toBe(true);
      expect(dupCheck.duplicateField).toBe('discordId');
    });

    it('enforces idempotency locking during in-flight registration', async () => {
      const payload = {
        discordId: '777888999000111222',
        discordUsername: 'speed_clicker',
        fullName: 'Fast Clicker',
        game: 'bgmi' as const,
        ign: 'FastClick',
        gameUid: '5177777788',
        email: 'fast@evoke.gg',
        age: 20,
      };

      // Execute first registration
      const promise1 = registrationService.executeRegistration(null, null, payload);
      // Simultaneous execution with same Discord ID should be locked
      const promise2 = registrationService.executeRegistration(null, null, payload);

      const [res1, res2] = await Promise.all([promise1, promise2]);
      const successfulRuns = [res1, res2].filter((r) => r.success);
      const lockedRuns = [res1, res2].filter((r) => !r.success && r.errorTitle === 'Submission In Progress');

      expect(successfulRuns.length).toBe(1);
      expect(lockedRuns.length).toBe(1);
    });
  });

  describe('4. Permission Control', () => {
    it('restricts staff functions from regular users', () => {
      const regularUser: any = {
        permissions: { has: () => false },
        roles: { cache: new Map() },
      };
      expect(roleService.hasStaffPermission(regularUser)).toBe(false);

      const adminUser: any = {
        permissions: { has: (perm: string) => perm === 'Administrator' },
        roles: { cache: new Map() },
      };
      expect(roleService.hasStaffPermission(adminUser)).toBe(true);
    });
  });
});
