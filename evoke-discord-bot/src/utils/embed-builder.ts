import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import { COLORS, EMOJIS, BRANDING, CHANNELS_LAYOUT } from '../config/constants.js';
import { GAMES, SupportedGame, GAME_OPTIONS } from '../config/games.js';
import { PlayerProfile, Tournament } from '../services/api/types.js';

export class EvokeEmbeds {
  /**
   * Base template with Evoke branding
   */
  public static base(color: number = COLORS.PRIMARY): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(color)
      .setFooter({ text: BRANDING.FOOTER_TEXT, iconURL: BRANDING.ICON_URL })
      .setTimestamp();
  }

  /**
   * Permanent Registration Panel
   */
  public static registrationPanel(): {
    embed: EmbedBuilder;
    row: ActionRowBuilder<ButtonBuilder>;
  } {
    const embed = this.base(COLORS.PRIMARY)
      .setTitle(`${EMOJIS.TROPHY} EVOKE ESPORTS — PLAYER REGISTRATION`)
      .setDescription(
        `**Welcome to the official Evoke Esports ecosystem!**\n\n` +
          `Register your player profile directly through Discord to unlock access to our official scrims, competitive tournaments, team-finding lobbies, and community events.\n\n` +
          `**🎮 Supported Games & Divisions:**\n` +
          `• ${EMOJIS.BGMI} **BGMI** (Battlegrounds Mobile India)\n` +
          `• ${EMOJIS.VALORANT} **VALORANT** (Riot Games 5v5 Tactical)\n` +
          `• ${EMOJIS.EAFC} **EA FC** (EA SPORTS FC — PC / PlayStation / Xbox)\n\n` +
          `*Click the button below to start your registration.*`
      )
      .addFields(
        {
          name: '🛡️ Registration Benefits',
          value:
            '✓ Exclusive Game & Scrim Channels\n✓ Official Evoke Player ID (`EVK-XXXXX`)\n✓ Direct Tournament Eligibility\n✓ Official Team Rostering',
          inline: false,
        },
        {
          name: '⚠️ Important Note',
          value:
            'Each Discord account and Game UID can only be registered once. Please ensure your information is accurate.',
          inline: false,
        }
      );

    const button = new ButtonBuilder()
      .setCustomId('evoke_btn_register_start')
      .setLabel('📝 REGISTER NOW')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    return { embed, row };
  }

  /**
   * Game Selector Menu (Shown after clicking Register Now)
   */
  public static gameSelectorRow(): ActionRowBuilder<StringSelectMenuBuilder> {
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('evoke_select_game')
      .setPlaceholder('🎮 Select your primary game division...')
      .addOptions(
        GAME_OPTIONS.map((opt) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(opt.label)
            .setValue(opt.value)
            .setDescription(opt.description)
        )
      );

    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
  }

  /**
   * Registration Review Card
   */
  public static registrationReview(data: {
    fullName: string;
    game: SupportedGame;
    ign: string;
    gameUid: string;
    email: string;
    age: number;
    platform?: string;
  }): {
    embed: EmbedBuilder;
    row: ActionRowBuilder<ButtonBuilder>;
  } {
    const gameConfig = GAMES[data.game];

    const embed = this.base(gameConfig.color)
      .setTitle(`📋 REGISTRATION REVIEW — ${gameConfig.name.toUpperCase()}`)
      .setDescription(
        'Please review your registration details carefully before submitting. Once registered, your official **Evoke Player ID** will be generated.'
      )
      .addFields(
        { name: '👤 Full Name', value: `\`${data.fullName}\``, inline: true },
        { name: '🎂 Age', value: `\`${data.age} years\``, inline: true },
        { name: '📧 Email Address', value: `\`${data.email}\``, inline: true },
        { name: `🎮 Game Division`, value: `${gameConfig.emoji} **${gameConfig.name}**`, inline: true },
        { name: `🏷️ ${gameConfig.fields.primaryIgnLabel}`, value: `\`${data.ign}\``, inline: true },
        { name: `🆔 ${gameConfig.fields.gameIdLabel}`, value: `\`${data.gameUid}\``, inline: true }
      );

    if (data.platform) {
      embed.addFields({ name: '🕹️ Platform', value: `\`${data.platform}\``, inline: true });
    }

    const confirmBtn = new ButtonBuilder()
      .setCustomId('evoke_btn_reg_confirm')
      .setLabel('✅ Confirm & Submit')
      .setStyle(ButtonStyle.Success);

    const editBtn = new ButtonBuilder()
      .setCustomId(`evoke_btn_reg_edit_${data.game}`)
      .setLabel('✏️ Edit Form')
      .setStyle(ButtonStyle.Secondary);

    const cancelBtn = new ButtonBuilder()
      .setCustomId('evoke_btn_reg_cancel')
      .setLabel('❌ Cancel')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmBtn, editBtn, cancelBtn);

    return { embed, row };
  }

  /**
   * Registration Success Embed
   */
  public static registrationSuccess(profile: PlayerProfile): {
    embed: EmbedBuilder;
    row?: ActionRowBuilder<ButtonBuilder>;
  } {
    const gameConfig = GAMES[profile.game as SupportedGame] || {
      name: profile.game.toUpperCase(),
      emoji: '🎮',
      color: COLORS.SUCCESS,
    };

    const embed = this.base(COLORS.SUCCESS)
      .setTitle(`🎉 REGISTRATION SUCCESSFUL — WELCOME TO EVOKE!`)
      .setDescription(
        `Welcome to the **Evoke Esports** family, **${profile.fullName}**! Your player profile is now active and your game permissions have been unlocked.`
      )
      .addFields(
        { name: '🆔 Evoke Player ID', value: `\`${profile.playerId}\``, inline: true },
        { name: '🎮 Division', value: `${gameConfig.emoji} **${gameConfig.name}**`, inline: true },
        { name: '🏷️ In-Game Name', value: `\`${profile.ign}\``, inline: true },
        { name: '🎯 Game UID / Tag', value: `\`${profile.gameUid}\``, inline: true },
        { name: '🛡️ Verification Status', value: `🟢 \`Verified Player\``, inline: true },
        { name: '📅 Registered Date', value: `<t:${Math.floor(new Date(profile.registeredAt).getTime() / 1000)}:D>`, inline: true }
      )
      .addFields({
        name: '🚀 What to do next?',
        value:
          `• Head over to your game category channels to meet your division teammates.\n` +
          `• Use </profile:0> anytime to view your stats.\n` +
          `• Check out </tournaments:0> to register for upcoming competitions!`,
        inline: false,
      });

    return { embed };
  }

  /**
   * Player Profile Embed (/profile)
   * Privacy Rule: Sensitive personal details like Email and Age are NEVER rendered in public profiles.
   */
  public static playerProfile(profile: PlayerProfile): {
    embed: EmbedBuilder;
    row: ActionRowBuilder<ButtonBuilder>;
  } {
    const gameConfig = GAMES[profile.game as SupportedGame] || {
      name: profile.game.toUpperCase(),
      emoji: '🎮',
      color: COLORS.PRIMARY,
    };

    const embed = this.base(gameConfig.color)
      .setTitle(`👤 EVOKE PLAYER PROFILE`)
      .setAuthor({ name: profile.fullName })
      .addFields(
        { name: '🆔 Player ID', value: `\`${profile.playerId}\``, inline: true },
        { name: '🎮 Game Division', value: `${gameConfig.emoji} **${gameConfig.name}**`, inline: true },
        { name: '🏷️ In-Game Name', value: `\`${profile.ign}\``, inline: true },
        { name: '🎯 Game Account', value: `\`${profile.gameUid}\``, inline: true },
        {
          name: '🟢 Status',
          value: profile.status === 'verified' ? '🟢 `Verified Player`' : '🟡 `Pending Verification`',
          inline: true,
        },
        {
          name: '📅 Member Since',
          value: `<t:${Math.floor(new Date(profile.registeredAt).getTime() / 1000)}:R>`,
          inline: true,
        }
      );

    if (profile.platform) {
      embed.addFields({ name: '🕹️ Platform', value: `\`${profile.platform}\``, inline: true });
    }

    const hasWebsite = Boolean(BRANDING.WEBSITE_URL && BRANDING.WEBSITE_URL.trim() !== '');

    const websiteBtn = new ButtonBuilder()
      .setLabel(hasWebsite ? '🌐 View Website Profile' : '🌐 Website Coming Soon')
      .setStyle(hasWebsite ? ButtonStyle.Link : ButtonStyle.Secondary)
      .setDisabled(!hasWebsite);

    if (hasWebsite) {
      websiteBtn.setURL(`${BRANDING.WEBSITE_URL}/players/${profile.playerId}`);
    } else {
      websiteBtn.setCustomId('evoke_btn_website_placeholder');
    }

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(websiteBtn);

    return { embed, row };
  }

  /**
   * Error Embed
   */
  public static error(title: string, description: string): EmbedBuilder {
    return this.base(COLORS.DANGER)
      .setTitle(`${EMOJIS.ERROR} ${title}`)
      .setDescription(description);
  }

  /**
   * Warning / Duplicate Alert Embed
   */
  public static duplicate(field: string, value: string): EmbedBuilder {
    return this.base(COLORS.WARNING)
      .setTitle(`${EMOJIS.WARNING} REGISTRATION CONFLICT`)
      .setDescription(
        `Registration could not be completed because this **${field}** (\`${value}\`) is already registered with Evoke Esports.\n\n` +
          `If you believe this is an error or need to update your registered account, please reach out in the <#${CHANNELS_LAYOUT.FEEDBACK}> channel or contact server staff.`
      );
  }

  /**
   * Tournament List Embed
   */
  public static tournamentList(tournaments: Tournament[]): EmbedBuilder {
    const embed = this.base(COLORS.SECONDARY)
      .setTitle(`${EMOJIS.TROPHY} EVOKE ESPORTS — TOURNAMENTS & SCRIMS`)
      .setDescription(
        tournaments.length === 0
          ? 'No active tournaments at this moment. Stay tuned in <#📢・announcements>!'
          : 'Here are the current tournaments open for registration. Use `/tournament info [id]` to view rules or `/tournament register [id]` to enter.'
      );

    tournaments.forEach((t) => {
      const gameConfig = GAMES[t.game as SupportedGame];
      const emoji = gameConfig ? gameConfig.emoji : '🏆';
      embed.addFields({
        name: `${emoji} ${t.title} [${t.id}]`,
        value:
          `📅 **Date:** ${t.date}\n` +
          `👥 **Format:** \`${t.format}\` | 🎟️ **Slots:** \`${t.registeredSlots}/${t.maxSlots}\`\n` +
          `💰 **Prize Pool:** \`${t.prizePool}\` | 🟢 **Status:** \`${t.status.toUpperCase()}\``,
        inline: false,
      });
    });

    return embed;
  }

  /**
   * Tournament Details Embed
   */
  public static tournamentInfo(t: Tournament): {
    embed: EmbedBuilder;
    row: ActionRowBuilder<ButtonBuilder>;
  } {
    const gameConfig = GAMES[t.game as SupportedGame];
    const color = gameConfig ? gameConfig.color : COLORS.SECONDARY;
    const emoji = gameConfig ? gameConfig.emoji : '🏆';

    const embed = this.base(color)
      .setTitle(`${emoji} ${t.title}`)
      .setDescription(t.description)
      .addFields(
        { name: '🆔 Tournament ID', value: `\`${t.id}\``, inline: true },
        { name: '🎮 Game', value: gameConfig ? `${gameConfig.emoji} ${gameConfig.name}` : t.game, inline: true },
        { name: '📅 Event Date', value: t.date, inline: true },
        { name: '👥 Match Format', value: `\`${t.format}\``, inline: true },
        { name: '🎟️ Filled Slots', value: `\`${t.registeredSlots} / ${t.maxSlots}\``, inline: true },
        { name: '💰 Prize Pool', value: `\`${t.prizePool}\``, inline: true },
        { name: '📜 Rules & Guidelines', value: t.rules || 'Standard Evoke competitive tournament rules apply.', inline: false }
      );

    const regBtn = new ButtonBuilder()
      .setCustomId(`evoke_btn_tourney_reg_${t.id}`)
      .setLabel('🎟️ Register for Tournament')
      .setStyle(ButtonStyle.Success)
      .setDisabled(t.status !== 'open' || t.registeredSlots >= t.maxSlots);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(regBtn);

    return { embed, row };
  }

  /**
   * Feedback Panel Embed (permanent in #feedback)
   */
  public static feedbackPanel(): {
    embed: EmbedBuilder;
    row: ActionRowBuilder<ButtonBuilder>;
  } {
    const embed = this.base(COLORS.INFO)
      .setTitle(`${EMOJIS.FEEDBACK} EVOKE COMMUNITY FEEDBACK`)
      .setDescription(
        `We are committed to building the best competitive community. Have suggestions, tournament feedback, or server inquiries? Let our management team know!\n\n` +
          `Click below to submit your feedback privately to our staff.`
      )
      .addFields({
        name: '📂 Feedback Categories',
        value: '• 🌐 Server Improvements\n• 🏆 Tournaments & Scrims\n• 📝 Registration & Roles\n• 🎮 Game Specific\n• 💬 General Inquiries',
      });

    const button = new ButtonBuilder()
      .setCustomId('evoke_btn_feedback_start')
      .setLabel('💡 Submit Feedback')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    return { embed, row };
  }

  /**
   * Social Media Broadcast Embed
   */
  public static socialBroadcast(params: {
    title: string;
    description: string;
    platform: string;
    postUrl: string;
    imageUrl?: string;
  }): {
    embed: EmbedBuilder;
    row: ActionRowBuilder<ButtonBuilder>;
  } {
    const embed = this.base(COLORS.PRIMARY)
      .setTitle(`📢 NEW EVOKE POST — ${params.platform.toUpperCase()}`)
      .setDescription(
        `**${params.title}**\n\n${params.description}\n\n` +
          `❤️ *Like* • 💬 *Comment* • 🔁 *Share & Boost!*`
      );

    if (params.imageUrl) {
      embed.setImage(params.imageUrl);
    }

    const button = new ButtonBuilder()
      .setLabel(`🚀 View on ${params.platform}`)
      .setStyle(ButtonStyle.Link)
      .setURL(params.postUrl);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    return { embed, row };
  }
}
