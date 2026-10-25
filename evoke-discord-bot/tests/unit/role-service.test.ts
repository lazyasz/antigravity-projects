import { describe, it, expect } from 'vitest';
import { RoleService } from '../../src/services/role-service.js';

describe('RoleService Unit Tests', () => {
  it('should resolve the correct game role key for each game', () => {
    const roleService = new RoleService();
    // Default env returns '' when not configured
    expect(roleService.getGameRoleId('bgmi')).toBeDefined();
    expect(roleService.getGameRoleId('valorant')).toBeDefined();
    expect(roleService.getGameRoleId('eafc')).toBeDefined();
  });

  it('should correctly evaluate staff permissions for Administrator permissions', () => {
    const roleService = new RoleService();

    const mockAdminMember: any = {
      permissions: {
        has: (perm: string) => perm === 'Administrator',
      },
      roles: {
        cache: new Map(),
      },
    };

    expect(roleService.hasStaffPermission(mockAdminMember)).toBe(true);

    const mockRegularMember: any = {
      permissions: {
        has: () => false,
      },
      roles: {
        cache: new Map(),
      },
    };

    expect(roleService.hasStaffPermission(mockRegularMember)).toBe(false);
  });
});
