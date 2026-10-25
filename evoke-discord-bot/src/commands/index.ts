import { SlashCommand } from './types.js';
import { registerCommand } from './register.js';
import { profileCommand } from './profile.js';
import { tournamentsCommand, tournamentCommand } from './tournaments.js';
import { feedbackCommand } from './feedback.js';
import { announceSocialCommand } from './announce-social.js';
import { adminCommand } from './admin/index.js';

export const COMMANDS: SlashCommand[] = [
  registerCommand,
  profileCommand,
  tournamentsCommand,
  tournamentCommand,
  feedbackCommand,
  announceSocialCommand,
  adminCommand,
];

export const commandMap = new Map<string, SlashCommand>();
for (const cmd of COMMANDS) {
  commandMap.set(cmd.data.name, cmd);
}

export * from './types.js';
