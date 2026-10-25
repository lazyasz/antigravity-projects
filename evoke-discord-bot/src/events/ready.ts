import { Client, ActivityType } from 'discord.js';
import { env } from '../config/env.js';

export function handleClientReady(client: Client): void {
  client.once('ready', () => {
    console.log('====================================================');
    console.log(`🤖 Evoke Esports Discord Bot is ONLINE!`);
    console.log(`👤 Tag: ${client.user?.tag}`);
    console.log(`🆔 ID: ${client.user?.id}`);
    console.log(`🌐 API Mode: ${env.MOCK_API ? 'MOCK_API (Local Store)' : 'LIVE BACKEND API'}`);
    console.log(`🏰 Guilds Active: ${client.guilds.cache.size}`);
    console.log('====================================================');

    client.user?.setPresence({
      activities: [
        {
          name: 'Evoke Esports • /register',
          type: ActivityType.Playing,
        },
      ],
      status: 'online',
    });
  });
}
