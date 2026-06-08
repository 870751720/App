import { healthStatusSchema, type HealthStatus } from "@g18/schemas";

export interface ApiClientOptions {
  baseUrl: string;
  fetcher?: typeof fetch;
}

export function createApiClient({ baseUrl, fetcher = fetch }: ApiClientOptions) {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");

  return {
    async getHealth(): Promise<HealthStatus> {
      const response = await fetcher(`${normalizedBaseUrl}/health`);

      if (!response.ok) {
        throw new Error(`Health request failed with status ${response.status}`);
      }

      const payload: unknown = await response.json();
      return healthStatusSchema.parse(payload);
    }
  };
}
