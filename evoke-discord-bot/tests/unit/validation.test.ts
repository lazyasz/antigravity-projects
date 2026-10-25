import { describe, it, expect } from 'vitest';
import {
  validateRegistrationData,
  parseRiotId,
  feedbackSchema,
} from '../../src/utils/validation.js';

describe('Player Registration Validation Unit Tests', () => {
  describe('BGMI Validation', () => {
    it('should successfully validate valid BGMI registration data', () => {
      const result = validateRegistrationData('bgmi', {
        fullName: 'Dhruv Sakhare',
        ign: 'DhruvSniper',
        email: 'dhruv@evoke-esports.gg',
        age: 20,
        gameUid: '5123456789',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.game).toBe('bgmi');
        expect(result.data.fullName).toBe('Dhruv Sakhare');
        expect(result.data.gameUid).toBe('5123456789');
        expect(result.data.email).toBe('dhruv@evoke-esports.gg');
      }
    });

    it('should reject invalid BGMI UID with letters or non-digits', () => {
      const result = validateRegistrationData('bgmi', {
        fullName: 'Dhruv Sakhare',
        ign: 'DhruvSniper',
        email: 'dhruv@evoke-esports.gg',
        age: 20,
        gameUid: 'UID_INVALID_555',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some((e) => e.includes('BGMI UID must be numeric'))).toBe(true);
      }
    });

    it('should reject age below minimum allowed (12)', () => {
      const result = validateRegistrationData('bgmi', {
        fullName: 'Young Player',
        ign: 'JuniorPro',
        email: 'young@example.com',
        age: 10,
        gameUid: '5987654321',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some((e) => e.includes('at least 12 years old'))).toBe(true);
      }
    });
  });

  describe('VALORANT Validation', () => {
    it('should successfully validate and parse Riot ID format Name#TAG', () => {
      const result = validateRegistrationData('valorant', {
        fullName: 'Aman Sharma',
        ign: 'EvokeJett',
        email: 'aman@evoke.gg',
        age: '19',
        gameUid: 'TenZ#NA1',
      });

      expect(result.success).toBe(true);
      if (result.success && result.data.game === 'valorant') {
        expect(result.data.riotId).toBe('TenZ');
        expect(result.data.riotTag).toBe('NA1');
      }
    });

    it('should reject invalid Riot ID without hashtag', () => {
      const result = validateRegistrationData('valorant', {
        fullName: 'Aman Sharma',
        ign: 'EvokeJett',
        email: 'aman@evoke.gg',
        age: 19,
        gameUid: 'InvalidRiotIdNoTag',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some((e) => e.includes('Username#TAG'))).toBe(true);
      }
    });
  });

  describe('EA FC Validation', () => {
    it('should normalize and accept platform variations (pc, ps5, xbox)', () => {
      const result = validateRegistrationData('eafc', {
        fullName: 'Rahul Roy',
        ign: 'RoyStriker',
        email: 'rahul@roy.com',
        age: 22,
        gameUid: 'RoyStriker99',
        platform: 'ps5',
      });

      expect(result.success).toBe(true);
      if (result.success && result.data.game === 'eafc') {
        expect(result.data.platform).toBe('PlayStation');
      }
    });

    it('should reject invalid platforms', () => {
      const result = validateRegistrationData('eafc', {
        fullName: 'Rahul Roy',
        ign: 'RoyStriker',
        email: 'rahul@roy.com',
        age: 22,
        gameUid: 'RoyStriker99',
        platform: 'NintendoSwitch',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some((e) => e.includes('Platform must be'))).toBe(true);
      }
    });
  });

  describe('Feedback Schema', () => {
    it('should accept valid feedback', () => {
      const parsed = feedbackSchema.safeParse({
        category: 'Tournament',
        feedback: 'We would love to see a 2v2 wingman tournament format next month!',
        attachmentUrl: 'https://example.com/screenshot.png',
      });
      expect(parsed.success).toBe(true);
    });

    it('should reject feedback that is too short', () => {
      const parsed = feedbackSchema.safeParse({
        category: 'Server',
        feedback: 'Hi',
      });
      expect(parsed.success).toBe(false);
    });
  });
});
