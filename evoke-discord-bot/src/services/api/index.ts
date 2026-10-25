import { env } from '../../config/env.js';
import { IEvokeApiClient } from './evoke-api.interface.js';
import { MockEvokeApiClient } from './mock-evoke-api.js';
import { HttpEvokeApiClient } from './http-evoke-api.js';

let apiClientInstance: IEvokeApiClient | null = null;

export function getEvokeApiClient(): IEvokeApiClient {
  if (!apiClientInstance) {
    if (env.MOCK_API) {
      console.log('⚡ Initializing Evoke API Client in [MOCK_API=true] local persistence mode');
      apiClientInstance = new MockEvokeApiClient();
    } else {
      console.log(`🌐 Initializing Evoke API Client in [PRODUCTION] mode connecting to: ${env.EVOKE_API_URL}`);
      apiClientInstance = new HttpEvokeApiClient(env.EVOKE_API_URL, env.EVOKE_API_KEY);
    }
  }
  return apiClientInstance;
}

export * from './types.js';
export * from './evoke-api.interface.js';
export * from './mock-evoke-api.js';
export * from './http-evoke-api.js';
