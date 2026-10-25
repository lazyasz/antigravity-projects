import { Client, TextChannel, EmbedBuilder } from 'discord.js';
import { env } from '../config/env.js';
import { COLORS, EMOJIS, BRANDING } from '../config/constants.js';
import { FeedbackInput } from '../utils/validation.js';
import { IEvokeApiClient } from './api/evoke-api.interface.js';

export class FeedbackService {
  private client: Client;
  private api: IEvokeApiClient;

  constructor(client: Client, apiClient: IEvokeApiClient) {
    this.client = client;
    this.api = apiClient;
  }

  public async submitFeedback(
    user: { id: string; tag: string; username: string },
    feedback: FeedbackInput
  ): Promise<{ success: boolean; error?: string }> {
    const targetChannelId = env.FEEDBACK_LOG_CHANNEL_ID || env.LOG_CHANNEL_ID;

    const embed = new EmbedBuilder()
      .setColor(COLORS.INFO)
      .setTitle(`${EMOJIS.FEEDBACK} NEW FEEDBACK RECEIVED — [${feedback.category.toUpperCase()}]`)
      .setAuthor({ name: user.tag, iconURL: BRANDING.ICON_URL })
      .addFields(
        { name: '👤 Submitted By', value: `<@${user.id}> (\`${user.tag}\`)`, inline: true },
        { name: '📂 Category', value: `\`${feedback.category}\``, inline: true },
        { name: '💬 Feedback', value: feedback.feedback, inline: false }
      )
      .setTimestamp();

    if (feedback.attachmentUrl && feedback.attachmentUrl.trim() !== '') {
      embed.addFields({ name: '🔗 Attachment / Link', value: feedback.attachmentUrl, inline: false });
    }

    if (targetChannelId) {
      try {
        const channel = await this.client.channels.fetch(targetChannelId);
        if (channel && channel.isTextBased()) {
          await (channel as TextChannel).send({ embeds: [embed] });
        }
      } catch (err: any) {
        console.error('❌ Failed to route feedback to staff channel:', err);
      }
    }

    // Forward to Evoke backend API via IEvokeApiClient
    try {
      await this.api.submitFeedback({
        discordId: user.id,
        discordUsername: user.tag || user.username,
        category: feedback.category,
        message: feedback.feedback,
        attachmentUrl: feedback.attachmentUrl,
      });
    } catch (err) {
      console.warn('⚠️ Could not sync feedback with API backend:', err);
    }

    return { success: true };
  }
}
