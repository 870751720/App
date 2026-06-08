import { useEffect, useMemo, useState } from "react";
import { createApiClient } from "@g18/api-client";
import { getPublicAppStatus } from "@g18/domain";

type HealthView =
  | { state: "loading" }
  | { state: "ready"; checkedAt: string }
  | { state: "error"; message: string };

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";

export function App() {
  const [health, setHealth] = useState<HealthView>({ state: "loading" });
  const publicStatus = getPublicAppStatus(false);
  const apiClient = useMemo(() => createApiClient({ baseUrl: apiBaseUrl }), []);

  useEffect(() => {
    let isMounted = true;

    apiClient
      .getHealth()
      .then((result) => {
        if (isMounted) {
          setHealth({ state: "ready", checkedAt: result.checkedAt });
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setHealth({
            state: "error",
            message: error instanceof Error ? error.message : "Unknown error"
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [apiClient]);

  return (
    <main className="app-shell">
      <section className="intro">
        <p className="eyebrow">G18 App</p>
        <h1>Web, app, and API foundation</h1>
        <p>
          A React-based monorepo prepared for GitHub CI/CD, Docker Compose,
          Caddy, MySQL, and shared TypeScript contracts.
        </p>
      </section>

      <section className="status-panel" aria-label="System status">
        <div>
          <span>Public status</span>
          <strong>{publicStatus}</strong>
        </div>
        <div>
          <span>API health</span>
          <strong>{renderHealth(health)}</strong>
        </div>
      </section>
    </main>
  );
}

function renderHealth(health: HealthView) {
  if (health.state === "loading") {
    return "checking";
  }

  if (health.state === "error") {
    return health.message;
  }

  return `ok at ${new Date(health.checkedAt).toLocaleTimeString()}`;
}
