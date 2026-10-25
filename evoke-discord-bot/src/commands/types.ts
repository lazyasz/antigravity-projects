import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  SlashCommandOptionsOnlyBuilder,
} from 'discord.js';

export interface CommandContext {
  services: {
    registrationService: import('../services/registration-service.js').RegistrationService;
    playerService: import('../services/player-service.js').PlayerService;
    roleService: import('../services/role-service.js').RoleService;
    tournamentService: import('../services/tournament-service.js').TournamentService;
    feedbackService: import('../services/feedback-service.js').FeedbackService;
    logService?: import('../services/log-service.js').LogService;
  };
}

export interface SlashCommand {
  data:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | SlashCommandOptionsOnlyBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  execute: (interaction: ChatInputCommandInteraction, context: CommandContext) => Promise<void>;
}
