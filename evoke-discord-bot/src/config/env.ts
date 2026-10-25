import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // Discord Bot
  DISCORD_TOKEN: z.string().default(''),
  DISCORD_CLIENT_ID: z.string().default(''),
  DISCORD_GUILD_ID: z.string().default(''),

  // Game Roles
  BGMI_ROLE_ID: z.string().default(''),
  VALORANT_ROLE_ID: z.string().default(''),
  EAFC_ROLE_ID: z.string().default(''),

  // Common Roles
  COMPETITIVE_ROLE_ID: z.string().default(''),
  CASUAL_ROLE_ID: z.string().default(''),
  STAFF_ROLE_ID: z.string().default(''),
  ADMIN_ROLE_ID: z.string().default(''),
  VERIFIED_ROLE_ID: z.string().default(''),

  // Channel IDs
  REGISTRATION_CHANNEL_ID: z.string().default(''),
  FEEDBACK_CHANNEL_ID: z.string().default(''),
  LOG_CHANNEL_ID: z.string().default(''),
  SM_POSTS_CHANNEL_ID: z.string().default(''),
  SHARE_BOOST_CHANNEL_ID: z.string().default(''),
  FEEDBACK_LOG_CHANNEL_ID: z.string().default(''),

  // API Config
  MOCK_API: z.preprocess((val) => {
    if (typeof val === 'string') return val.toLowerCase() === 'true';
    if (typeof val === 'boolean') return val;
    return true; // Default to true if not specified
  }, z.boolean()).default(true),
  EVOKE_API_URL: z.string().default(''),
  EVOKE_API_KEY: z.string().default(''),
  EVOKE_WEBSITE_URL: z.string().default(''),

  // Configurable Age Limits
  MIN_PLAYER_AGE: z.coerce.number().int().default(12),
  MAX_PLAYER_AGE: z.coerce.number().int().default(99),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Environment configuration error:', result.error.format());
    throw new Error('Invalid environment configuration');
  }
  return result.data;
}

export const env = loadEnv();
