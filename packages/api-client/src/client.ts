import {
  authSessionSchema,
  healthStatusSchema,
  operationsOverviewSchema,
  userAccountSchema,
  type AuthSessionResponse,
  type HealthStatus,
  type OperationsOverviewResponse,
  type UserAccountResponse
} from "@app/schemas";

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
    },

    async login(email: string, password: string): Promise<AuthSessionResponse> {
      const response = await fetcher(`${normalizedBaseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error(`Login request failed with status ${response.status}`);
      }

      const payload: unknown = await response.json();
      return authSessionSchema.parse(payload);
    },

    async getCurrentUser(token: string): Promise<UserAccountResponse> {
      const response = await fetcher(`${normalizedBaseUrl}/auth/me`, {
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Current user request failed with status ${response.status}`);
      }

      const payload: unknown = await response.json();
      return userAccountSchema.parse(payload);
    },

    async getOperationsOverview(token: string): Promise<OperationsOverviewResponse> {
      const response = await fetcher(`${normalizedBaseUrl}/operations/overview`, {
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Operations overview request failed with status ${response.status}`);
      }

      const payload: unknown = await response.json();
      return operationsOverviewSchema.parse(payload);
    }
  };
}
