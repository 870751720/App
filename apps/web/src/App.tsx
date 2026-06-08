import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowRight, Smartphone } from "lucide-react";
import { motion } from "motion/react";
import { createApiClient } from "@g18/api-client";
import { getPublicAppStatus } from "@g18/domain";
import { Button } from "./components/ui/button";

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
    <main className="min-h-screen bg-stone-100 text-slate-900">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl content-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="min-w-0"
        >
          <p className="mb-3 text-sm font-bold uppercase text-teal-700">
            G18 App
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Web, app, and API foundation
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            A mobile-first React web foundation prepared for GitHub CI/CD,
            Docker Compose, Caddy, MySQL, shared TypeScript contracts, and
            production-friendly UI motion.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button type="button" size="lg">
              <Activity aria-hidden="true" className="size-4" />
              Check status
            </Button>
            <Button type="button" variant="secondary" size="lg">
              <Smartphone aria-hidden="true" className="size-4" />
              Mobile ready
            </Button>
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45, ease: "easeOut" }}
          className="grid min-w-0 gap-3"
          aria-label="System status"
        >
          <StatusCard label="Public status" value={publicStatus} />
          <StatusCard label="API health" value={renderHealth(health)} />
          <div className="flex min-h-24 items-center justify-between gap-4 rounded-lg border border-stone-300 bg-white p-4">
            <div className="min-w-0">
              <span className="text-sm text-slate-500">Responsive rule</span>
              <strong className="mt-1 block break-words text-base text-slate-950">
                mobile first
              </strong>
            </div>
            <ArrowRight aria-hidden="true" className="size-5 text-teal-700" />
          </div>
        </motion.section>
      </section>
    </main>
  );
}

interface StatusCardProps {
  label: string;
  value: string;
}

function StatusCard({ label, value }: StatusCardProps) {
  return (
    <div className="grid min-h-24 content-center gap-2 rounded-lg border border-stone-300 bg-white p-4">
      <span className="text-sm text-slate-500">{label}</span>
      <strong className="break-words text-base text-slate-950">{value}</strong>
    </div>
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
