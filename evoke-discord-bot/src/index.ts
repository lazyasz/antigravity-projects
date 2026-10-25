import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { env } from './config/env.js';
import { getEvokeApiClient } from './services/api/index.js';
import { LogService } from './services/log-service.js';
import { RoleService } from './services/role-service.js';
import { PlayerService } from './services/player-service.js';
import { TournamentService } from './services/tournament-service.js';
import { FeedbackService } from './services/feedback-service.js';
import { RegistrationService } from './services/registration-service.js';
import { CommandContext } from './commands/types.js';
import { handleClientReady } from './events/ready.js';
import { handleInteractionCreate } from './events/interaction-create.js';

export function createEvokeBot() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
  });

  // Initialize API and Domain Services
  const apiClient = getEvokeApiClient();
  const logService = new LogService(client);
  const roleService = new RoleService(logService);
  const playerService = new PlayerService(apiClient);
  const tournamentService = new TournamentService(apiClient, playerService);
  const feedbackService = new FeedbackService(client, apiClient);
  const registrationService = new RegistrationService(apiClient, roleService, logService);

  const context: CommandContext = {
    services: {
      registrationService,
      playerService,
      roleService,
      tournamentService,
      feedbackService,
      logService,
    },
  };

  // Register Event Handlers
  handleClientReady(client);
  handleInteractionCreate(client, context);

  return { client, context };
}

async function start() {
  if (!env.DISCORD_TOKEN) {
    console.warn('⚠️ DISCORD_TOKEN is not set in environment or .env file.');
    console.warn('ℹ️ To connect to Discord live, set DISCORD_TOKEN in .env and run `npm run dev` or `npm start`.');
    console.log('🧪 The bot architecture, API layer, and test suite are fully operational in local/mock mode.');
    return;
  }

  const { client } = createEvokeBot();

  // Graceful shutdown handling
  const shutdown = (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Gracefully shutting down Evoke Discord Bot...`);
    client.destroy();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  try {
    await client.login(env.DISCORD_TOKEN);
  } catch (error) {
    console.error('❌ Failed to connect to Discord Gateway:', error);
    process.exit(1);
  }
}

// Only start immediately if executed directly
if (process.env.NODE_ENV !== 'test') {
  start();
}
