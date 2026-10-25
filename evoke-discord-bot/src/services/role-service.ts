import { Guild, GuildMember, Role } from 'discord.js';
import { env } from '../config/env.js';
import { SupportedGame, GAMES } from '../config/games.js';
import { LogService } from './log-service.js';

export class RoleService {
  private logService?: LogService;

  constructor(logService?: LogService) {
    this.logService = logService;
  }

  /**
   * Retrieves configured Discord Role ID for a game
   */
  public getGameRoleId(game: SupportedGame): string | undefined {
    switch (game) {
      case 'bgmi':
        return env.BGMI_ROLE_ID;
      case 'valorant':
        return env.VALORANT_ROLE_ID;
      case 'eafc':
        return env.EAFC_ROLE_ID;
      default:
        return undefined;
    }
  }

  /**
   * Assigns game-specific role and optional verified role to a member upon registration
   */
  public async assignRegistrationRoles(
    guild: Guild,
    member: GuildMember,
    game: SupportedGame
  ): Promise<{ success: boolean; rolesAssigned: string[]; errors: string[] }> {
    const rolesAssigned: string[] = [];
    const errors: string[] = [];

    const roleId = this.getGameRoleId(game);
    const gameConfig = GAMES[game];

    if (roleId && roleId.trim() !== '') {
      try {
        const role = await guild.roles.fetch(roleId);
        if (!role) {
          errors.push(`Role ID ${roleId} for ${gameConfig.name} was not found in server.`);
        } else {
          // Check role hierarchy
          const botMember = await guild.members.fetchMe();
          if (botMember.roles.highest.position <= role.position) {
            const err = `Bot role "${botMember.roles.highest.name}" is lower or equal to target role "${role.name}" in server role hierarchy. Please move the Bot role higher.`;
            errors.push(err);
            if (this.logService) {
              await this.logService.logRoleAssignment({
                discordId: member.id,
                roleId: role.id,
                roleName: role.name,
                status: 'failed',
                error: err,
              });
            }
          } else {
            await member.roles.add(role);
            rolesAssigned.push(role.name);
            if (this.logService) {
              await this.logService.logRoleAssignment({
                discordId: member.id,
                roleId: role.id,
                roleName: role.name,
                status: 'assigned',
              });
            }
          }
        }
      } catch (err: any) {
        const msg = `Failed to assign ${gameConfig.name} role: ${err.message}`;
        errors.push(msg);
        if (this.logService) {
          await this.logService.logRoleAssignment({
            discordId: member.id,
            roleId,
            roleName: gameConfig.name,
            status: 'failed',
            error: err.message,
          });
        }
      }
    }

    // Assign Verified Role if configured
    if (env.VERIFIED_ROLE_ID && env.VERIFIED_ROLE_ID.trim() !== '') {
      try {
        const verifiedRole = await guild.roles.fetch(env.VERIFIED_ROLE_ID);
        if (verifiedRole) {
          const botMember = await guild.members.fetchMe();
          if (botMember.roles.highest.position > verifiedRole.position) {
            await member.roles.add(verifiedRole);
            rolesAssigned.push(verifiedRole.name);
          }
        }
      } catch (err: any) {
        console.warn(`Could not assign verified role: ${err.message}`);
      }
    }

    return {
      success: errors.length === 0,
      rolesAssigned,
      errors,
    };
  }

  /**
   * Check if user is staff or admin
   */
  public hasStaffPermission(member: GuildMember): boolean {
    if (member.permissions.has('Administrator')) return true;
    if (env.ADMIN_ROLE_ID && member.roles.cache.has(env.ADMIN_ROLE_ID)) return true;
    if (env.STAFF_ROLE_ID && member.roles.cache.has(env.STAFF_ROLE_ID)) return true;
    return false;
  }
}
