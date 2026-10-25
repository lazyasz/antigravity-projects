import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { SlashCommand } from '../types.js';
import { env } from '../../config/env.js';
import { COLORS, EMOJIS, BRANDING } from '../../config/constants.js';
import { EvokeEmbeds } from '../../utils/embed-builder.js';
import { maskEmail } from '../../utils/sanitize.js';

export const adminCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Evoke Esports administrative and moderation commands')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    // Subcommand: stats
    .addSubcommand((sub) =>
      sub.setName('stats').setDescription('View registration metrics, division counts, and bot health')
    )
    // Subcommand: config
    .addSubcommand((sub) =>
      sub.setName('config').setDescription('View current bot environment settings and role mappings')
    )
    // Subcommand: player-lookup
    .addSubcommand((sub) =>
      sub
        .setName('player-lookup')
        .setDescription('Look up complete administrative record for a player')
        .addUserOption((opt) => opt.setName('user').setDescription('Target Discord user'))
        .addStringOption((opt) => opt.setName('player_id').setDescription('Evoke Player ID'))
    )
    // Subcommand: verify
    .addSubcommand((sub) =>
      sub
        .setName('verify')
        .setDescription('Manually verify or unverify a player profile')
        .addStringOption((opt) =>
          opt.setName('player_id').setDescription('Evoke Player ID').setRequired(true)
        )
        .addBooleanOption((opt) =>
          opt.setName('verified').setDescription('Verification status').setRequired(true)
        )
    )
    // Subcommand: registrations
    .addSubcommand((sub) =>
      sub
        .setName('registrations')
        .setDescription('List recently registered players')
        .addStringOption((opt) =>
          opt
            .setName('game')
            .setDescription('Filter by game division')
            .addChoices(
              { name: 'BGMI', value: 'bgmi' },
              { name: 'VALORANT', value: 'valorant' },
              { name: 'EA FC', value: 'eafc' }
            )
        )
    )
    // Subcommand: setup
    .addSubcommand((sub) =>
      sub
        .setName('setup')
        .setDescription('Deploy official permanent panels')
        .addStringOption((opt) =>
          opt
            .setName('panel')
            .setDescription('Type of panel to deploy')
            .setRequired(true)
            .addChoices(
              { name: '📝 Registration Panel', value: 'registration' },
              { name: '💡 Feedback Panel', value: 'feedback' }
            )
        )
    ),

  async execute(interaction, context) {
    const member = interaction.guild?.members.cache.get(interaction.user.id);
    if (!member || !context.services.roleService.hasStaffPermission(member)) {
      await interaction.reply({
        content: '❌ You must have Administrator or Staff permissions to use this command.',
        ephemeral: true,
      });
      return;
    }

    const sub = interaction.options.getSubcommand();

    // 1. Stats
    if (sub === 'stats') {
      const players = await context.services.playerService.listPlayers();
      const bgmiCount = players.filter((p) => p.game === 'bgmi').length;
      const valCount = players.filter((p) => p.game === 'valorant').length;
      const eafcCount = players.filter((p) => p.game === 'eafc').length;
      const verifiedCount = players.filter((p) => p.status === 'verified').length;

      const embed = new EmbedBuilder()
        .setColor(COLORS.PRIMARY)
        .setTitle(`${EMOJIS.STATS} EVOKE ESPORTS — SYSTEM METRICS & STATS`)
        .addFields(
          { name: '👥 Total Registered Players', value: `\`${players.length}\``, inline: true },
          { name: '🟢 Verified Players', value: `\`${verifiedCount}\``, inline: true },
          {
            name: '🌐 Backend API Mode',
            value: env.MOCK_API ? '🧪 `MOCK API (Local DB)`' : '🌐 `LIVE REST API`',
            inline: true,
          },
          { name: '🔫 BGMI Division', value: `\`${bgmiCount} players\``, inline: true },
          { name: '⚡ VALORANT Division', value: `\`${valCount} players\``, inline: true },
          { name: '⚽ EA FC Division', value: `\`${eafcCount} players\``, inline: true }
        )
        .setFooter({ text: BRANDING.FOOTER_TEXT })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // 2. Config
    if (sub === 'config') {
      const embed = new EmbedBuilder()
        .setColor(COLORS.SECONDARY)
        .setTitle(`⚙️ EVOKE BOT CONFIGURATION`)
        .addFields(
          { name: '🔌 API Mode', value: env.MOCK_API ? '🧪 `MOCK_API=true`' : '🌐 `MOCK_API=false`', inline: true },
          { name: '🔗 API Base URL', value: `\`${env.EVOKE_API_URL}\``, inline: true },
          { name: '🌐 Website URL', value: `\`${env.EVOKE_WEBSITE_URL}\``, inline: true },
          {
            name: '🎭 Role ID Bindings',
            value:
              `• BGMI Role: \`${env.BGMI_ROLE_ID || 'Not Set'}\`\n` +
              `• VALORANT Role: \`${env.VALORANT_ROLE_ID || 'Not Set'}\`\n` +
              `• EA FC Role: \`${env.EAFC_ROLE_ID || 'Not Set'}\`\n` +
              `• Staff Role: \`${env.STAFF_ROLE_ID || 'Not Set'}\`\n` +
              `• Verified Role: \`${env.VERIFIED_ROLE_ID || 'Not Set'}\``,
            inline: false,
          },
          {
            name: '📡 Channel Bindings',
            value:
              `• Registration: <#${env.REGISTRATION_CHANNEL_ID || 'Not Set'}>\n` +
              `• Feedback (Public): <#${env.FEEDBACK_CHANNEL_ID || 'Not Set'}>\n` +
              `• Bot Logs (Private): <#${env.LOG_CHANNEL_ID || 'Not Set'}>\n` +
              `• Feedback Logs (Private): <#${env.FEEDBACK_LOG_CHANNEL_ID || env.LOG_CHANNEL_ID || 'Not Set'}>\n` +
              `• Social Posts: <#${env.SM_POSTS_CHANNEL_ID || 'Not Set'}>`,
            inline: false,
          }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // 3. Player Lookup
    if (sub === 'player-lookup') {
      const targetUser = interaction.options.getUser('user');
      const playerId = interaction.options.getString('player_id');

      let profile = null;
      if (playerId) {
        profile = await context.services.playerService.getProfileByPlayerId(playerId.trim());
      } else if (targetUser) {
        profile = await context.services.playerService.getProfileByDiscordId(targetUser.id);
      }

      if (!profile) {
        await interaction.reply({
          content: '❌ No registered player record found for specified parameters.',
          ephemeral: true,
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(COLORS.INFO)
        .setTitle(`🛡️ [ADMIN RECORD] ${profile.fullName}`)
        .addFields(
          { name: '🆔 Player ID', value: `\`${profile.playerId}\``, inline: true },
          { name: '🔑 Profile ID', value: `\`${profile.profileId}\``, inline: true },
          { name: '👤 Discord Member', value: `<@${profile.discordId}> (\`${profile.discordUsername}\`)`, inline: true },
          { name: '🎮 Game Division', value: `**${profile.game.toUpperCase()}**`, inline: true },
          { name: '🏷️ IGN', value: `\`${profile.ign}\``, inline: true },
          { name: '🎯 Game UID / Tag', value: `\`${profile.gameUid}\``, inline: true },
          { name: '📧 Registered Email', value: `\`${maskEmail(profile.email)}\``, inline: true },
          { name: '🎂 Age', value: `\`${profile.age}\``, inline: true },
          { name: '🟢 Status', value: `\`${profile.status}\``, inline: true },
          { name: '📅 Registered At', value: profile.registeredAt, inline: false }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // 4. Verify / Unverify
    if (sub === 'verify') {
      const playerId = interaction.options.getString('player_id', true).trim();
      const verified = interaction.options.getBoolean('verified', true);

      const success = await context.services.playerService.updateVerification(playerId, verified);
      if (!success) {
        await interaction.reply({
          content: `❌ Could not find or update player with ID \`${playerId}\`.`,
          ephemeral: true,
        });
        return;
      }

      await interaction.reply({
        content: `✅ Player \`${playerId}\` verification status updated to **${verified ? 'VERIFIED' : 'PENDING'}**.`,
        ephemeral: true,
      });

      if (context.services.logService) {
        await context.services.logService.logAdminAction({
          adminId: interaction.user.id,
          adminTag: interaction.user.tag,
          action: 'PLAYER_VERIFICATION_UPDATE',
          details: `Set ${playerId} status to ${verified ? 'VERIFIED' : 'PENDING'}`,
        });
      }
      return;
    }

    // 5. Registrations List
    if (sub === 'registrations') {
      const game = interaction.options.getString('game') || undefined;
      const players = await context.services.playerService.listPlayers({ game });

      const embed = new EmbedBuilder()
        .setColor(COLORS.PRIMARY)
        .setTitle(`📋 EVOKE REGISTRATIONS RECORD (${players.length} Total)`)
        .setDescription(
          players.length === 0
            ? 'No players found matching the query.'
            : players
                .slice(-10)
                .reverse()
                .map(
                  (p) =>
                    `• **${p.playerId}** — <@${p.discordId}> (${p.fullName}) | \`${p.game.toUpperCase()}\` | Status: \`${p.status}\``
                )
                .join('\n')
        )
        .setFooter({ text: 'Showing up to 10 most recent registrations' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // 6. Setup Panels
    if (sub === 'setup') {
      const panelType = interaction.options.getString('panel', true);

      if (panelType === 'registration') {
        const { embed, row } = EvokeEmbeds.registrationPanel();
        if (interaction.channel && interaction.channel.isTextBased() && 'send' in interaction.channel) {
          await (interaction.channel as any).send({ embeds: [embed], components: [row] });
        }
        await interaction.reply({
          content: '✅ Permanent Registration Panel has been deployed to this channel!',
          ephemeral: true,
        });
      } else if (panelType === 'feedback') {
        const { embed, row } = EvokeEmbeds.feedbackPanel();
        if (interaction.channel && interaction.channel.isTextBased() && 'send' in interaction.channel) {
          await (interaction.channel as any).send({ embeds: [embed], components: [row] });
        }
        await interaction.reply({
          content: '✅ Permanent Feedback Panel has been deployed to this channel!',
          ephemeral: true,
        });
      }
    }
  },
};
