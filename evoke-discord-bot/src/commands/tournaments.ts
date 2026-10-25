import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from './types.js';
import { EvokeEmbeds } from '../utils/embed-builder.js';

export const tournamentsCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('tournaments')
    .setDescription('View active Evoke tournaments, scrims, and competitions')
    .addStringOption((opt) =>
      opt
        .setName('game')
        .setDescription('Filter by game division')
        .setRequired(false)
        .addChoices(
          { name: '🔫 BGMI', value: 'bgmi' },
          { name: '⚡ VALORANT', value: 'valorant' },
          { name: '⚽ EA FC', value: 'eafc' }
        )
    ),

  async execute(interaction, context) {
    const game = interaction.options.getString('game') || undefined;
    const tourneys = await context.services.tournamentService.getTournaments(game);

    const embed = EvokeEmbeds.tournamentList(tourneys);
    await interaction.reply({ embeds: [embed] });
  },
};

export const tournamentCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('tournament')
    .setDescription('View detailed tournament rules or register for a tournament')
    .addSubcommand((sub) =>
      sub
        .setName('info')
        .setDescription('View rules, format, prize pool and registration status for a tournament')
        .addStringOption((opt) =>
          opt
            .setName('id')
            .setDescription('Tournament ID (e.g. TOURN-VAL-01)')
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('register')
        .setDescription('Register your player profile for a tournament')
        .addStringOption((opt) =>
          opt
            .setName('id')
            .setDescription('Tournament ID (e.g. TOURN-VAL-01)')
            .setRequired(true)
        )
    ),

  async execute(interaction, context) {
    const subcommand = interaction.options.getSubcommand();
    const tournamentId = interaction.options.getString('id', true).trim();

    if (subcommand === 'info') {
      const tourney = await context.services.tournamentService.getTournamentById(tournamentId);
      if (!tourney) {
        await interaction.reply({
          content: `❌ Tournament with ID \`${tournamentId}\` was not found. Use \`/tournaments\` to see all active events.`,
          ephemeral: true,
        });
        return;
      }

      const { embed, row } = EvokeEmbeds.tournamentInfo(tourney);
      await interaction.reply({ embeds: [embed], components: [row] });
      return;
    }

    if (subcommand === 'register') {
      await interaction.deferReply({ ephemeral: true });

      const result = await context.services.tournamentService.registerUserForTournament(
        interaction.user.id,
        tournamentId
      );

      if (!result.success) {
        await interaction.editReply({ content: result.message });
      } else {
        await interaction.editReply({
          content: `🎉 **${result.message}**\nYour slot has been reserved. Check the tournament channel for brackets and schedules!`,
        });
      }
    }
  },
};
