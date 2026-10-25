import { env } from './env.js';

export const COLORS = {
  PRIMARY: 0xff3366, // Evoke Neon Crimson
  SECONDARY: 0x6c5ce7, // Evoke Royal Purple
  SUCCESS: 0x00b894, // Mint Green
  WARNING: 0xfdcb6e, // Solar Amber
  DANGER: 0xd63031, // Ruby Red
  INFO: 0x0984e3, // Electric Blue
  DARK: 0x1e1e24, // Deep Carbon
  BGMI: 0xe67e22, // Orange
  VALORANT: 0xff4655, // Riot Red
  EAFC: 0x00d2d3, // EA Teal
} as const;

export const EMOJIS = {
  BGMI: '🔫',
  VALORANT: '⚡',
  EAFC: '⚽',
  TROPHY: '🏆',
  MEDAL: '🏅',
  STAR: '⭐',
  SHIELD: '🛡️',
  CROWN: '👑',
  USER: '👤',
  CARD: '🪪',
  GAME: '🎮',
  SEARCH: '🔎',
  ANNOUNCE: '📢',
  REGISTRATION: '📝',
  FEEDBACK: '💡',
  SUCCESS: '✅',
  ERROR: '❌',
  WARNING: '⚠️',
  EDIT: '✏️',
  LINK: '🌐',
  ROCKET: '🚀',
  MOBILE: '📱',
  STATS: '📊',
  TIME: '📅',
  TICKET: '🎟️',
  MONEY: '💰',
} as const;

export const BRANDING = {
  BOT_NAME: 'Evoke Esports Bot',
  FOOTER_TEXT: 'Evoke Esports • Empowering Next-Gen Champions',
  ICON_URL: 'https://cdn.discordapp.com/embed/avatars/0.png',
  get WEBSITE_URL() {
    return env.EVOKE_WEBSITE_URL || '';
  },
} as const;

export const CHANNELS_LAYOUT = {
  REGISTRATION: '📝・registration',
  ANNOUNCEMENTS: '📢・announcements',
  FEEDBACK: '💡・feedback',
  SM_POSTS: '📲・sm-posts',
  SHARE_BOOST: '🚀・share-and-boost',
  TOURNAMENTS: '🏅・tournaments',
  LOGS: '🛡️・bot-logs',
} as const;
