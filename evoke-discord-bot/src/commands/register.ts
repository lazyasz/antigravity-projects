import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from './types.js';
import { EvokeEmbeds } from '../utils/embed-builder.js';
import { interactionRateLimiter } from '../utils/rate-limiter.js';

export const registerCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Register as an official Evoke Esports player or manage registration')
    .addSubcommand((sub) =>
      sub.setName('now').setDescription('Start your Evoke player registration')
    )
    .addSubcommand((sub) =>
      sub
        .setName('panel')
        .setDescription('[Admin] Post the permanent Evoke Player Registration panel in current channel')
    ),

  async execute(interaction, context) {
    const sub = interaction.options.getSubcommand(false) || 'now';

    if (sub === 'panel') {
      const member = interaction.guild?.members.cache.get(interaction.user.id);
      if (!member || !context.services.roleService.hasStaffPermission(member)) {
        await interaction.reply({
          content: '❌ You must have Administrator or Staff permissions to deploy the registration panel.',
          ephemeral: true,
        });
        return;
      }

      const { embed, row } = EvokeEmbeds.registrationPanel();
      if (interaction.channel && interaction.channel.isTextBased() && 'send' in interaction.channel) {
        await (interaction.channel as any).send({ embeds: [embed], components: [row] });
      }
      await interaction.reply({
        content: '✅ Permanent Evoke Registration Panel has been deployed!',
        ephemeral: true,
      });
      return;
    }

    // Rate limit check
    const rateCheck = interactionRateLimiter.isAllowed(interaction.user.id);
    if (!rateCheck.allowed) {
      await interaction.reply({
        content: `⏳ Please wait **${rateCheck.remainingSeconds}s** before interacting again.`,
        ephemeral: true,
      });
      return;
    }

    // Check if user is already registered
    const existingProfile = await context.services.playerService.getProfileByDiscordId(
      interaction.user.id
    );

    if (existingProfile) {
      const { embed, row } = EvokeEmbeds.playerProfile(existingProfile);
      await interaction.reply({
        content: '⚠️ **You already have an active Evoke Player Profile.**',
        embeds: [embed],
        components: [row],
        ephemeral: true,
      });
      return;
    }

    // Show Game Selection dropdown
    const selectRow = EvokeEmbeds.gameSelectorRow();
    await interaction.reply({
      content: '🎮 **Step 1 of 3: Select your primary competitive game division:**',
      components: [selectRow],
      ephemeral: true,
    });
  },
};
