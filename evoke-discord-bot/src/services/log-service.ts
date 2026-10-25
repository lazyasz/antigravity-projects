import { Client, TextChannel, EmbedBuilder } from 'discord.js';
import { env } from '../config/env.js';
import { COLORS, EMOJIS } from '../config/constants.js';
import { maskEmail } from '../utils/sanitize.js';

export type LogLevel = 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'ADMIN';

export class LogService {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  private async sendToLogChannel(embed: EmbedBuilder): Promise<void> {
    if (!env.LOG_CHANNEL_ID) {
      return;
    }
    try {
      const channel = await this.client.channels.fetch(env.LOG_CHANNEL_ID);
      if (channel && channel.isTextBased()) {
        await (channel as TextChannel).send({ embeds: [embed] });
      }
    } catch (err) {
      console.error('❌ Failed to dispatch embed to log channel:', err);
    }
  }

  public async logRegistrationSuccess(data: {
    discordId: string;
    discordTag: string;
    fullName: string;
    game: string;
    ign: string;
    gameUid: string;
    email: string;
    playerId: string;
  }): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor(COLORS.SUCCESS)
      .setTitle(`${EMOJIS.SUCCESS} [REGISTRATION] New Player Registered`)
      .setDescription(
        `User <@${data.discordId}> (\`${data.discordTag}\`) registered as **${data.fullName}**.`
      )
      .addFields(
        { name: '🆔 Player ID', value: `\`${data.playerId}\``, inline: true },
        { name: '🎮 Game', value: data.game.toUpperCase(), inline: true },
        { name: '🏷️ IGN', value: `\`${data.ign}\``, inline: true },
        { name: '🎯 Game UID', value: `\`${data.gameUid}\``, inline: true },
        { name: '📧 Email (Masked)', value: `\`${maskEmail(data.email)}\``, inline: true }
      )
      .setTimestamp();

    console.log(`[LOG] Player Registered: ${data.playerId} (${data.fullName}, ${data.game})`);
    await this.sendToLogChannel(embed);
  }

  public async logDuplicateAttempt(data: {
    discordId: string;
    discordTag: string;
    game: string;
    field: string;
    value: string;
  }): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor(COLORS.WARNING)
      .setTitle(`${EMOJIS.WARNING} [SECURITY] Duplicate Registration Attempt`)
      .setDescription(
        `User <@${data.discordId}> (\`${data.discordTag}\`) attempted duplicate registration.`
      )
      .addFields(
        { name: '🎮 Target Game', value: data.game.toUpperCase(), inline: true },
        { name: '⚠️ Conflicting Field', value: `\`${data.field}\``, inline: true },
        { name: '🔍 Value', value: `\`${data.field === 'email' ? maskEmail(data.value) : data.value}\``, inline: true }
      )
      .setTimestamp();

    console.warn(`[WARN] Duplicate attempt by ${data.discordTag} (${data.field}: ${data.value})`);
    await this.sendToLogChannel(embed);
  }

  public async logRoleAssignment(data: {
    discordId: string;
    roleId: string;
    roleName: string;
    status: 'assigned' | 'failed';
    error?: string;
  }): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor(data.status === 'assigned' ? COLORS.INFO : COLORS.DANGER)
      .setTitle(
        data.status === 'assigned'
          ? `${EMOJIS.SHIELD} [ROLES] Role Assigned`
          : `${EMOJIS.ERROR} [ROLES] Role Assignment Failed`
      )
      .setDescription(
        data.status === 'assigned'
          ? `Assigned role **${data.roleName}** to <@${data.discordId}>.`
          : `Failed assigning **${data.roleName}** to <@${data.discordId}>.\n**Reason:** \`${data.error}\``
      )
      .setTimestamp();

    await this.sendToLogChannel(embed);
  }

  public async logAdminAction(data: {
    adminId: string;
    adminTag: string;
    action: string;
    details: string;
  }): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor(COLORS.SECONDARY)
      .setTitle(`${EMOJIS.CROWN} [ADMIN ACTION] ${data.action}`)
      .setDescription(`Staff member <@${data.adminId}> (\`${data.adminTag}\`) executed action.`)
      .addFields({ name: '📝 Details', value: data.details })
      .setTimestamp();

    console.log(`[ADMIN] ${data.adminTag}: ${data.action} - ${data.details}`);
    await this.sendToLogChannel(embed);
  }

  public async logApiError(endpoint: string, error: string): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor(COLORS.DANGER)
      .setTitle(`${EMOJIS.ERROR} [API ERROR] Service Exception`)
      .addFields(
        { name: '🌐 Endpoint / Service', value: `\`${endpoint}\``, inline: true },
        { name: '⚠️ Error Message', value: `\`${error}\``, inline: false }
      )
      .setTimestamp();

    console.error(`[API ERROR] ${endpoint}: ${error}`);
    await this.sendToLogChannel(embed);
  }
}
