import { EMOJIS, COLORS } from './constants.js';

export type SupportedGame = 'bgmi' | 'valorant' | 'eafc';
export type EafcPlatform = 'PC' | 'PlayStation' | 'Xbox';

export interface GameDefinition {
  id: SupportedGame;
  name: string;
  emoji: string;
  color: number;
  description: string;
  roleEnvKey: 'BGMI_ROLE_ID' | 'VALORANT_ROLE_ID' | 'EAFC_ROLE_ID';
  fields: {
    primaryIgnLabel: string;
    gameIdLabel: string;
    gameIdPlaceholder: string;
    extraField?: {
      label: string;
      placeholder: string;
      options?: string[];
    };
  };
}

export const GAMES: Record<SupportedGame, GameDefinition> = {
  bgmi: {
    id: 'bgmi',
    name: 'BGMI',
    emoji: EMOJIS.BGMI,
    color: COLORS.BGMI,
    description: 'Battlegrounds Mobile India',
    roleEnvKey: 'BGMI_ROLE_ID',
    fields: {
      primaryIgnLabel: 'In-Game Name (IGN)',
      gameIdLabel: 'BGMI Character UID (Numeric)',
      gameIdPlaceholder: 'e.g. 5123456789 (5-15 digits)',
    },
  },
  valorant: {
    id: 'valorant',
    name: 'VALORANT',
    emoji: EMOJIS.VALORANT,
    color: COLORS.VALORANT,
    description: 'Riot Games 5v5 Tactical Shooter',
    roleEnvKey: 'VALORANT_ROLE_ID',
    fields: {
      primaryIgnLabel: 'In-Game Name (IGN)',
      gameIdLabel: 'Riot ID & Tagline',
      gameIdPlaceholder: 'e.g. TenZ#NA1 or Jett#0001',
    },
  },
  eafc: {
    id: 'eafc',
    name: 'EA FC',
    emoji: EMOJIS.EAFC,
    color: COLORS.EAFC,
    description: 'EA SPORTS FC',
    roleEnvKey: 'EAFC_ROLE_ID',
    fields: {
      primaryIgnLabel: 'In-Game Name (IGN)',
      gameIdLabel: 'EA Account ID',
      gameIdPlaceholder: 'e.g. EvokeStriker99',
      extraField: {
        label: 'Platform (PC / PlayStation / Xbox)',
        placeholder: 'PC, PlayStation, or Xbox',
        options: ['PC', 'PlayStation', 'Xbox'],
      },
    },
  },
};

export const GAME_OPTIONS = [
  {
    label: `${EMOJIS.BGMI} BGMI`,
    value: 'bgmi',
    description: 'Battlegrounds Mobile India',
  },
  {
    label: `${EMOJIS.VALORANT} VALORANT`,
    value: 'valorant',
    description: 'Riot Games 5v5 Tactical Shooter',
  },
  {
    label: `${EMOJIS.EAFC} EA FC`,
    value: 'eafc',
    description: 'EA SPORTS FC (PC, PS, Xbox)',
  },
];

export function getGameConfig(game: SupportedGame): GameDefinition {
  return GAMES[game];
}

export function isValidGame(game: string): game is SupportedGame {
  return game === 'bgmi' || game === 'valorant' || game === 'eafc';
}
