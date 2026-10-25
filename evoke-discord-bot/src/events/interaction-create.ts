import { Client, Interaction } from 'discord.js';
import { CommandContext } from '../commands/types.js';
import { commandMap } from '../commands/index.js';
import { InteractionHandler } from '../interactions/index.js';
import { EvokeEmbeds } from '../utils/embed-builder.js';

export function handleInteractionCreate(client: Client, context: CommandContext): void {
  client.on('interactionCreate', async (interaction: Interaction) => {
    try {
      // 1. SLASH COMMANDS
      if (interaction.isChatInputCommand()) {
        const command = commandMap.get(interaction.commandName);
        if (!command) {
          await interaction.reply({
            content: `❌ Unknown command: \`/${interaction.commandName}\``,
            ephemeral: true,
          });
          return;
        }

        await command.execute(interaction, context);
        return;
      }

      // 2. BUTTONS
      if (interaction.isButton()) {
        await InteractionHandler.handleButton(interaction, context);
        return;
      }

      // 3. SELECT MENUS
      if (interaction.isStringSelectMenu()) {
        await InteractionHandler.handleSelectMenu(interaction, context);
        return;
      }

      // 4. MODALS
      if (interaction.isModalSubmit()) {
        await InteractionHandler.handleModalSubmit(interaction, context);
        return;
      }
    } catch (error: any) {
      console.error('❌ Unhandled interaction error:', error);

      if (context.services.logService) {
        await context.services.logService.logApiError('InteractionHandler', error.message || 'Unknown');
      }

      const errorEmbed = EvokeEmbeds.error(
        'Interaction Error',
        'An unexpected error occurred while processing your request. Please try again or notify an administrator.'
      );

      try {
        if (interaction.isRepliable()) {
          if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ embeds: [errorEmbed] });
          } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
          }
        }
      } catch (replyErr) {
        console.error('Failed to dispatch error reply to interaction:', replyErr);
      }
    }
  });
}
