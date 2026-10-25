import { SlashCommandBuilder, TextChannel, PermissionFlagsBits } from 'discord.js';
import { SlashCommand } from './types.js';
import { env } from '../config/env.js';
import { EvokeEmbeds } from '../utils/embed-builder.js';

export const announceSocialCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('announce-social')
    .setDescription('Publish a new social media alert to #sm-posts')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption((opt) =>
      opt.setName('title').setDescription('Headline of the social media post').setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName('description').setDescription('Post summary or caption text').setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName('platform')
        .setDescription('Social media platform')
        .setRequired(true)
        .addChoices(
          { name: '📸 Instagram', value: 'Instagram' },
          { name: '🐦 X (Twitter)', value: 'X / Twitter' },
          { name: '▶️ YouTube', value: 'YouTube' },
          { name: '💬 Discord Announcement', value: 'Discord' }
        )
    )
    .addStringOption((opt) =>
      opt.setName('post_url').setDescription('Direct link to the social post').setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName('image_url').setDescription('Optional preview image/banner URL').setRequired(false)
    ),

  async execute(interaction, context) {
    const member = interaction.guild?.members.cache.get(interaction.user.id);
    if (!member || !context.services.roleService.hasStaffPermission(member)) {
      await interaction.reply({
        content: '❌ You do not have permission to post social announcements.',
        ephemeral: true,
      });
      return;
    }

    const title = interaction.options.getString('title', true);
    const description = interaction.options.getString('description', true);
    const platform = interaction.options.getString('platform', true);
    const postUrl = interaction.options.getString('post_url', true);
    const imageUrl = interaction.options.getString('image_url') || undefined;

    const targetChannelId = env.SM_POSTS_CHANNEL_ID || interaction.channelId;
    const targetChannel = await interaction.guild?.channels.fetch(targetChannelId);

    if (!targetChannel || !targetChannel.isTextBased()) {
      await interaction.reply({
        content: `❌ Could not find target social media channel (<#${targetChannelId}>). Check your \`SM_POSTS_CHANNEL_ID\` configuration.`,
        ephemeral: true,
      });
      return;
    }

    const { embed, row } = EvokeEmbeds.socialBroadcast({
      title,
      description,
      platform,
      postUrl,
      imageUrl,
    });

    await (targetChannel as TextChannel).send({
      content: '🚀 **New Evoke Esports Social Update! Like & Share to support the team!**',
      embeds: [embed],
      components: [row],
    });

    await interaction.reply({
      content: `✅ Social announcement broadcasted to <#${targetChannelId}>!`,
      ephemeral: true,
    });

    if (context.services.logService) {
      await context.services.logService.logAdminAction({
        adminId: interaction.user.id,
        adminTag: interaction.user.tag,
        action: 'SOCIAL_ANNOUNCEMENT',
        details: `Posted "${title}" for ${platform}`,
      });
    }
  },
};
