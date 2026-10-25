import { IEvokeApiClient } from './api/evoke-api.interface.js';
import { Tournament, TournamentRegResponse } from './api/types.js';
import { PlayerService } from './player-service.js';

export class TournamentService {
  private api: IEvokeApiClient;
  private playerService: PlayerService;

  constructor(apiClient: IEvokeApiClient, playerService: PlayerService) {
    this.api = apiClient;
    this.playerService = playerService;
  }

  public async getTournaments(game?: string): Promise<Tournament[]> {
    return this.api.getTournaments(game);
  }

  public async getTournamentById(id: string): Promise<Tournament | null> {
    return this.api.getTournamentById(id);
  }

  public async registerUserForTournament(
    discordId: string,
    tournamentId: string
  ): Promise<{ success: boolean; message: string; response?: TournamentRegResponse }> {
    const profile = await this.playerService.getProfileByDiscordId(discordId);
    if (!profile) {
      return {
        success: false,
        message: '⚠️ You must first register an Evoke Player Profile before signing up for tournaments! Use `/register` or click REGISTER NOW in the registration channel.',
      };
    }

    const tourney = await this.getTournamentById(tournamentId);
    if (!tourney) {
      return {
        success: false,
        message: `⚠️ Tournament with ID \`${tournamentId}\` was not found.`,
      };
    }

    // Check game compatibility
    if (tourney.game !== profile.game) {
      return {
        success: false,
        message: `⚠️ This tournament is for **${tourney.game.toUpperCase()}**, but your profile is registered under **${profile.game.toUpperCase()}**.`,
      };
    }

    const regResponse = await this.api.registerForTournament(profile.playerId, tournamentId);
    return {
      success: regResponse.success,
      message: regResponse.message,
      response: regResponse,
    };
  }
}
