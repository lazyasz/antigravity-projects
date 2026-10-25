import { IEvokeApiClient } from './api/evoke-api.interface.js';
import { PlayerProfile } from './api/types.js';

export class PlayerService {
  private api: IEvokeApiClient;

  constructor(apiClient: IEvokeApiClient) {
    this.api = apiClient;
  }

  public async getProfileByDiscordId(discordId: string): Promise<PlayerProfile | null> {
    return this.api.getPlayerProfile({ discordId });
  }

  public async getProfileByPlayerId(playerId: string): Promise<PlayerProfile | null> {
    return this.api.getPlayerProfile({ playerId });
  }

  public async isUserRegistered(discordId: string): Promise<boolean> {
    const profile = await this.getProfileByDiscordId(discordId);
    return profile !== null;
  }

  public async listPlayers(filter?: { game?: string; status?: string }): Promise<PlayerProfile[]> {
    return this.api.listPlayers(filter);
  }

  public async updateVerification(playerId: string, verified: boolean): Promise<boolean> {
    return this.api.updatePlayerStatus(playerId, verified ? 'verified' : 'pending');
  }
}
