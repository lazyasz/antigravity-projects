import axios, { AxiosInstance } from 'axios';
import { IEvokeApiClient } from './evoke-api.interface.js';
import {
  RegistrationPayload,
  RegistrationResponse,
  PlayerProfile,
  DuplicateCheckResult,
  Tournament,
  TournamentRegResponse,
} from './types.js';

export class HttpEvokeApiClient implements IEvokeApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string, apiKey: string) {
    this.client = axios.create({
      baseURL,
      timeout: 8000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'x-api-key': apiKey,
        'User-Agent': 'EvokeDiscordBot/1.0',
      },
    });
  }

  public async checkDuplicate(payload: RegistrationPayload): Promise<DuplicateCheckResult> {
    try {
      const response = await this.client.post<DuplicateCheckResult>(
        '/api/players/check-duplicate',
        payload
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 409) {
        return {
          isDuplicate: true,
          message: error.response.data?.message || 'Player conflict detected in website database.',
        };
      }
      throw new Error(`Evoke API duplicate check failed: ${error.message}`);
    }
  }

  public async registerPlayer(payload: RegistrationPayload): Promise<RegistrationResponse> {
    try {
      const response = await this.client.post<RegistrationResponse>(
        '/api/players/register',
        payload
      );
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Website registration endpoint error';
      throw new Error(`Evoke API registration failed: ${msg}`);
    }
  }

  public async getPlayerProfile(query: {
    discordId?: string;
    playerId?: string;
  }): Promise<PlayerProfile | null> {
    try {
      const params = new URLSearchParams();
      if (query.discordId) params.append('discord_id', query.discordId);
      if (query.playerId) params.append('player_id', query.playerId);

      const response = await this.client.get<PlayerProfile>(`/api/players/profile?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(`Evoke API profile query failed: ${error.message}`);
    }
  }

  public async updatePlayerStatus(
    playerId: string,
    status: 'verified' | 'pending' | 'suspended'
  ): Promise<boolean> {
    try {
      const response = await this.client.patch(`/api/players/${playerId}/status`, { status });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  public async listPlayers(filter?: { game?: string; status?: string }): Promise<PlayerProfile[]> {
    try {
      const response = await this.client.get<PlayerProfile[]>('/api/players', { params: filter });
      return response.data;
    } catch {
      return [];
    }
  }

  public async getTournaments(game?: string): Promise<Tournament[]> {
    try {
      const response = await this.client.get<Tournament[]>('/api/tournaments', {
        params: game ? { game } : undefined,
      });
      return response.data;
    } catch {
      return [];
    }
  }

  public async getTournamentById(tournamentId: string): Promise<Tournament | null> {
    try {
      const response = await this.client.get<Tournament>(`/api/tournaments/${tournamentId}`);
      return response.data;
    } catch {
      return null;
    }
  }

  public async registerForTournament(
    playerId: string,
    tournamentId: string
  ): Promise<TournamentRegResponse> {
    try {
      const response = await this.client.post<TournamentRegResponse>(
        `/api/tournaments/${tournamentId}/register`,
        { playerId }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Tournament registration failed.',
        tournamentId,
        playerId,
      };
    }
  }

  public async submitFeedback(feedback: {
    discordId: string;
    discordUsername: string;
    category: string;
    message: string;
    attachmentUrl?: string;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.client.post<{ success: boolean; message?: string }>(
        '/api/feedback',
        feedback
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Could not submit feedback to website API.',
      };
    }
  }
}
