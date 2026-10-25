import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from './types.js';
import { EvokeEmbeds } from '../utils/embed-builder.js';

export const profileCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your official Evoke Player Profile or public profile of another player')
    .addUserOption((option) =>
      option.setName('user').setDescription('Target Discord member to view public profile for').setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('player_id')
        .setDescription('Evoke Player ID (e.g. EVK-00142)')
        .setRequired(false)
    ),

  async execute(interaction, context) {
    const targetUser = interaction.options.getUser('user');
    const playerId = interaction.options.getString('player_id');
    const isSelfLookup = !targetUser && !playerId;

    let profile = null;

    if (playerId) {
      profile = await context.services.playerService.getProfileByPlayerId(playerId.trim());
    } else if (targetUser) {
      profile = await context.services.playerService.getProfileByDiscordId(targetUser.id);
    } else {
      profile = await context.services.playerService.getProfileByDiscordId(interaction.user.id);
    }

    if (!profile) {
      await interaction.reply({
        content: isSelfLookup
          ? '❌ You do not have an Evoke player profile registered yet! Use `/register` or head to the registration channel to join.'
          : '❌ No Evoke player profile was found for the specified user or Player ID.',
        ephemeral: true,
      });
      return;
    }

    // Strict Privacy Rule: EvokeEmbeds.playerProfile only renders public fields (Player ID, IGN, Game, UID/Tag, Status, Date).
    // Private attributes (Email, Age, internal Profile ID) are NEVER rendered.
    const { embed, row } = EvokeEmbeds.playerProfile(profile);
    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: isSelfLookup ? false : false,
    });
  },
};
