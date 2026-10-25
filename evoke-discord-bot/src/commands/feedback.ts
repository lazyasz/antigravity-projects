import {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from 'discord.js';
import { SlashCommand } from './types.js';
import { EvokeEmbeds } from '../utils/embed-builder.js';

export const feedbackCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('feedback')
    .setDescription('Submit feedback or deploy the community feedback panel')
    .addSubcommand((sub) =>
      sub.setName('submit').setDescription('Submit your suggestions or feedback to the Evoke staff')
    )
    .addSubcommand((sub) =>
      sub
        .setName('panel')
        .setDescription('[Admin] Post the permanent Evoke Feedback panel in current channel')
    ),

  async execute(interaction, context) {
    const sub = interaction.options.getSubcommand(false) || 'submit';

    if (sub === 'panel') {
      const member = interaction.guild?.members.cache.get(interaction.user.id);
      if (!member || !context.services.roleService.hasStaffPermission(member)) {
        await interaction.reply({
          content: '❌ You must have Administrator or Staff permissions to deploy the feedback panel.',
          ephemeral: true,
        });
        return;
      }

      const { embed, row } = EvokeEmbeds.feedbackPanel();
      if (interaction.channel && interaction.channel.isTextBased() && 'send' in interaction.channel) {
        await (interaction.channel as any).send({ embeds: [embed], components: [row] });
      }
      await interaction.reply({
        content: '✅ Permanent Evoke Feedback Panel has been deployed!',
        ephemeral: true,
      });
      return;
    }

    // Open Feedback Modal
    const modal = new ModalBuilder()
      .setCustomId('evoke_modal_feedback')
      .setTitle('💡 Submit Community Feedback');

    const categoryInput = new TextInputBuilder()
      .setCustomId('feedback_category')
      .setLabel('Category (Server/Tournament/Registration/Game/Other)')
      .setPlaceholder('e.g. Tournament, Server, Registration, Game, Other')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const messageInput = new TextInputBuilder()
      .setCustomId('feedback_text')
      .setLabel('Your Feedback / Suggestion')
      .setPlaceholder('Describe your suggestions or report your issue in detail...')
      .setStyle(TextInputStyle.Paragraph)
      .setMinLength(10)
      .setMaxLength(1000)
      .setRequired(true);

    const linkInput = new TextInputBuilder()
      .setCustomId('feedback_link')
      .setLabel('Screenshot / Evidence URL (Optional)')
      .setPlaceholder('https://imgur.com/... or leave blank')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(categoryInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(messageInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(linkInput)
    );

    await interaction.showModal(modal);
  },
};
