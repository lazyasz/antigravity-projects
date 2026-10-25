import { REST, Routes } from 'discord.js';
import { env } from './config/env.js';
import { COMMANDS } from './commands/index.js';

async function deploySlashCommands() {
  if (!env.DISCORD_TOKEN || !env.DISCORD_CLIENT_ID) {
    console.error('❌ DISCORD_TOKEN and DISCORD_CLIENT_ID must be set in .env to deploy commands.');
    process.exit(1);
  }

  const commandsPayload = COMMANDS.map((cmd) => cmd.data.toJSON());
  const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);

  try {
    console.log(`🚀 Refreshing ${commandsPayload.length} application (/) commands...`);

    if (env.DISCORD_GUILD_ID && env.DISCORD_GUILD_ID.trim() !== '') {
      console.log(`📡 Deploying commands to Guild: ${env.DISCORD_GUILD_ID} (Instant update)`);
      const data: any = await rest.put(
        Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID),
        { body: commandsPayload }
      );
      console.log(`✅ Successfully reloaded ${data.length} guild application (/) commands!`);
    } else {
      console.log(`🌐 Deploying commands globally to all guilds...`);
      const data: any = await rest.put(
        Routes.applicationCommands(env.DISCORD_CLIENT_ID),
        { body: commandsPayload }
      );
      console.log(`✅ Successfully reloaded ${data.length} global application (/) commands!`);
    }
  } catch (error) {
    console.error('❌ Failed to deploy slash commands:', error);
    process.exit(1);
  }
}

deploySlashCommands();
