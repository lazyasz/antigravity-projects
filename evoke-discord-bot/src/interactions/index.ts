import {
  ButtonInteraction,
  StringSelectMenuInteraction,
  ModalSubmitInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  GuildMember,
} from 'discord.js';
import { CommandContext } from '../commands/types.js';
import { EvokeEmbeds } from '../utils/embed-builder.js';
import { GAMES, SupportedGame, isValidGame } from '../config/games.js';
import { validateRegistrationData, parseRiotId, feedbackSchema } from '../utils/validation.js';
import { interactionRateLimiter, registrationRateLimiter } from '../utils/rate-limiter.js';
import { RegistrationPayload } from '../services/api/types.js';

export class InteractionHandler {
  /**
   * Routes Button Interactions
   */
  public static async handleButton(
    interaction: ButtonInteraction,
    context: CommandContext
  ): Promise<void> {
    const customId = interaction.customId;

    // 1. REGISTER START BUTTON
    if (customId === 'evoke_btn_register_start') {
      const rateCheck = interactionRateLimiter.isAllowed(interaction.user.id);
      if (!rateCheck.allowed) {
        await interaction.reply({
          content: `⏳ Please wait **${rateCheck.remainingSeconds}s** before interacting again.`,
          ephemeral: true,
        });
        return;
      }

      const existing = await context.services.playerService.getProfileByDiscordId(
        interaction.user.id
      );
      if (existing) {
        const { embed, row } = EvokeEmbeds.playerProfile(existing);
        await interaction.reply({
          content: '⚠️ **You already have an Evoke player profile registered!**',
          embeds: [embed],
          components: [row],
          ephemeral: true,
        });
        return;
      }

      const selectRow = EvokeEmbeds.gameSelectorRow();
      await interaction.reply({
        content: '🎮 **Step 1 of 3: Please select your primary competitive game division below:**',
        components: [selectRow],
        ephemeral: true,
      });
      return;
    }

    // 2. REGISTRATION CONFIRMATION SUBMIT
    if (customId === 'evoke_btn_reg_confirm') {
      const rateCheck = registrationRateLimiter.isAllowed(interaction.user.id);
      if (!rateCheck.allowed) {
        await interaction.reply({
          content: `⏳ Please wait **${rateCheck.remainingSeconds}s** before submitting.`,
          ephemeral: true,
        });
        return;
      }

      const pending = context.services.registrationService.getPendingReview(interaction.user.id);
      if (!pending) {
        await interaction.reply({
          content: '❌ Registration session timed out or not found. Please click **REGISTER NOW** again.',
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply({ ephemeral: true });

      const member = interaction.guild?.members.cache.get(interaction.user.id) || null;
      const result = await context.services.registrationService.executeRegistration(
        interaction.guild,
        member,
        pending
      );

      if (!result.success) {
        if (result.isDuplicate) {
          const dupEmbed = EvokeEmbeds.duplicate(
            result.duplicateField || 'Account',
            result.duplicateValue || ''
          );
          await interaction.editReply({ embeds: [dupEmbed] });
        } else {
          const errEmbed = EvokeEmbeds.error(
            result.errorTitle || 'Registration Error',
            result.errorMessage || 'An error occurred while creating your profile.'
          );
          await interaction.editReply({ embeds: [errEmbed] });
        }
        return;
      }

      const { embed } = EvokeEmbeds.registrationSuccess(result.profile!);
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    // 3. REGISTRATION CANCEL
    if (customId === 'evoke_btn_reg_cancel') {
      context.services.registrationService.clearPendingReview(interaction.user.id);
      await interaction.reply({
        content: '🛑 Registration cancelled. You can register anytime by clicking **REGISTER NOW**.',
        ephemeral: true,
      });
      return;
    }

    // 4. REGISTRATION EDIT
    if (customId.startsWith('evoke_btn_reg_edit_')) {
      const game = customId.replace('evoke_btn_reg_edit_', '');
      if (isValidGame(game)) {
        await this.showGameRegistrationModal(interaction, game);
      }
      return;
    }

    // 5. FEEDBACK START BUTTON
    if (customId === 'evoke_btn_feedback_start') {
      await this.showFeedbackModal(interaction);
      return;
    }

    // 6. TOURNAMENT DIRECT REGISTER BUTTON
    if (customId.startsWith('evoke_btn_tourney_reg_')) {
      const tournamentId = customId.replace('evoke_btn_tourney_reg_', '');
      await interaction.deferReply({ ephemeral: true });

      const res = await context.services.tournamentService.registerUserForTournament(
        interaction.user.id,
        tournamentId
      );

      if (!res.success) {
        await interaction.editReply({ content: res.message });
      } else {
        await interaction.editReply({
          content: `🎉 **${res.message}**\nYour slot has been reserved!`,
        });
      }
      return;
    }
  }

  /**
   * Routes Select Menu Interactions
   */
  public static async handleSelectMenu(
    interaction: StringSelectMenuInteraction,
    context: CommandContext
  ): Promise<void> {
    if (interaction.customId === 'evoke_select_game') {
      const selectedGame = interaction.values[0];
      if (selectedGame && isValidGame(selectedGame)) {
        await this.showGameRegistrationModal(interaction, selectedGame);
      } else {
        await interaction.reply({
          content: '❌ Invalid game selected. Please try again.',
          ephemeral: true,
        });
      }
    }
  }

  /**
   * Routes Modal Submissions
   */
  public static async handleModalSubmit(
    interaction: ModalSubmitInteraction,
    context: CommandContext
  ): Promise<void> {
    const customId = interaction.customId;

    // 1. GAME REGISTRATION MODALS
    if (customId.startsWith('evoke_modal_reg_')) {
      const game = customId.replace('evoke_modal_reg_', '') as SupportedGame;
      if (!isValidGame(game)) return;

      const fullName = interaction.fields.getTextInputValue('reg_full_name');
      const ign = interaction.fields.getTextInputValue('reg_ign');
      const email = interaction.fields.getTextInputValue('reg_email');
      const age = interaction.fields.getTextInputValue('reg_age');
      const gameUid = interaction.fields.getTextInputValue('reg_game_uid');
      let platform: string | undefined = undefined;

      if (game === 'eafc') {
        try {
          platform = interaction.fields.getTextInputValue('reg_platform');
        } catch {
          platform = undefined;
        }
      }

      // Validate Input Data
      const validation = validateRegistrationData(game, {
        fullName,
        ign,
        email,
        age,
        gameUid,
        platform,
      });

      if (!validation.success) {
        const errorList = validation.errors.map((e) => `• ${e}`).join('\n');
        await interaction.reply({
          content: `⚠️ **Registration Input Errors:**\n${errorList}\n\nPlease click **REGISTER NOW** again to fix the issues.`,
          ephemeral: true,
        });
        return;
      }

      const validData = validation.data;
      const payload: RegistrationPayload = {
        discordId: interaction.user.id,
        discordUsername: interaction.user.tag || interaction.user.username,
        fullName: validData.fullName,
        game: validData.game,
        ign: validData.ign,
        gameUid: validData.gameUid,
        email: validData.email,
        age: validData.age,
        platform: validData.game === 'eafc' ? (validData.platform as any) : undefined,
        riotId: validData.game === 'valorant' ? validData.riotId : undefined,
        riotTag: validData.game === 'valorant' ? validData.riotTag : undefined,
      };

      // Store pending review
      context.services.registrationService.storePendingReview(interaction.user.id, payload);

      // Display Review Card with [Confirm] [Edit] [Cancel]
      const { embed, row } = EvokeEmbeds.registrationReview({
        fullName: payload.fullName,
        game: payload.game,
        ign: payload.ign,
        gameUid: payload.gameUid,
        email: payload.email,
        age: payload.age,
        platform: payload.platform,
      });

      await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true,
      });
      return;
    }

    // 2. FEEDBACK MODAL
    if (customId === 'evoke_modal_feedback') {
      const categoryRaw = interaction.fields.getTextInputValue('feedback_category');
      const feedbackText = interaction.fields.getTextInputValue('feedback_text');
      const linkUrl = interaction.fields.getTextInputValue('feedback_link') || '';

      // Normalize category
      let category: 'Server' | 'Tournament' | 'Registration' | 'Game' | 'Other' = 'Other';
      const catLower = categoryRaw.toLowerCase();
      if (catLower.includes('tourn')) category = 'Tournament';
      else if (catLower.includes('serv')) category = 'Server';
      else if (catLower.includes('reg')) category = 'Registration';
      else if (catLower.includes('game')) category = 'Game';

      const parsed = feedbackSchema.safeParse({
        category,
        feedback: feedbackText,
        attachmentUrl: linkUrl || undefined,
      });

      if (!parsed.success) {
        await interaction.reply({
          content: `⚠️ Feedback error: ${parsed.error.errors[0]?.message}`,
          ephemeral: true,
        });
        return;
      }

      await context.services.feedbackService.submitFeedback(
        {
          id: interaction.user.id,
          tag: interaction.user.tag,
          username: interaction.user.username,
        },
        parsed.data
      );

      await interaction.reply({
        content: `✅ **Thank you for your feedback!**\nOur staff and management team have received your submission.`,
        ephemeral: true,
      });
    }
  }

  /**
   * Helper to build & display game-specific registration modals
   */
  private static async showGameRegistrationModal(
    interaction: ButtonInteraction | StringSelectMenuInteraction,
    game: SupportedGame
  ): Promise<void> {
    const gameConfig = GAMES[game];

    const modal = new ModalBuilder()
      .setCustomId(`evoke_modal_reg_${game}`)
      .setTitle(`📝 ${gameConfig.name} Player Registration`);

    const nameInput = new TextInputBuilder()
      .setCustomId('reg_full_name')
      .setLabel('Full Real Name')
      .setPlaceholder('e.g. Dhruv Sakhare')
      .setStyle(TextInputStyle.Short)
      .setMinLength(2)
      .setMaxLength(50)
      .setRequired(true);

    const ignInput = new TextInputBuilder()
      .setCustomId('reg_ign')
      .setLabel(gameConfig.fields.primaryIgnLabel)
      .setPlaceholder('e.g. ShadowHunter or EvokePro')
      .setStyle(TextInputStyle.Short)
      .setMinLength(2)
      .setMaxLength(24)
      .setRequired(true);

    const gameIdInput = new TextInputBuilder()
      .setCustomId('reg_game_uid')
      .setLabel(gameConfig.fields.gameIdLabel)
      .setPlaceholder(gameConfig.fields.gameIdPlaceholder)
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const emailInput = new TextInputBuilder()
      .setCustomId('reg_email')
      .setLabel('Email Address')
      .setPlaceholder('yourname@example.com')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const ageInput = new TextInputBuilder()
      .setCustomId('reg_age')
      .setLabel('Age')
      .setPlaceholder('e.g. 19')
      .setStyle(TextInputStyle.Short)
      .setMinLength(2)
      .setMaxLength(2)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(ignInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(gameIdInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(emailInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(ageInput)
    );

    if (game === 'eafc' && gameConfig.fields.extraField) {
      // EA FC requires platform
      // In Discord modals, max 5 inputs. We replace age or add platform.
      // Let's replace name+age in 5 fields: Name, IGN, EA ID, Platform, Email
      const platformInput = new TextInputBuilder()
        .setCustomId('reg_platform')
        .setLabel(gameConfig.fields.extraField.label)
        .setPlaceholder(gameConfig.fields.extraField.placeholder)
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const eafcModal = new ModalBuilder()
        .setCustomId(`evoke_modal_reg_${game}`)
        .setTitle(`📝 ${gameConfig.name} Registration`)
        .addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
          new ActionRowBuilder<TextInputBuilder>().addComponents(ignInput),
          new ActionRowBuilder<TextInputBuilder>().addComponents(gameIdInput),
          new ActionRowBuilder<TextInputBuilder>().addComponents(platformInput),
          new ActionRowBuilder<TextInputBuilder>().addComponents(emailInput)
        );

      await interaction.showModal(eafcModal);
      return;
    }

    await interaction.showModal(modal);
  }

  private static async showFeedbackModal(interaction: ButtonInteraction): Promise<void> {
    const modal = new ModalBuilder()
      .setCustomId('evoke_modal_feedback')
      .setTitle('💡 Submit Evoke Feedback');

    const catInput = new TextInputBuilder()
      .setCustomId('feedback_category')
      .setLabel('Category (Server/Tournament/Registration/Game)')
      .setPlaceholder('e.g. Tournament, Server, Registration, Game, Other')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const msgInput = new TextInputBuilder()
      .setCustomId('feedback_text')
      .setLabel('Your Feedback / Suggestion')
      .setPlaceholder('Describe your suggestion or feedback in detail...')
      .setStyle(TextInputStyle.Paragraph)
      .setMinLength(10)
      .setMaxLength(1000)
      .setRequired(true);

    const linkInput = new TextInputBuilder()
      .setCustomId('feedback_link')
      .setLabel('Screenshot / Link (Optional)')
      .setPlaceholder('https://... or leave blank')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(catInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(msgInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(linkInput)
    );

    await interaction.showModal(modal);
  }
}
