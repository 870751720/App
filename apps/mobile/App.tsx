import { useEffect, useMemo, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { createApiClient } from "@app/api-client";
import { getPublicAppStatus } from "@app/domain";

type HealthView =
  | { state: "loading" }
  | { state: "ready"; checkedAt: string }
  | { state: "error"; message: string };

const apiBaseUrl = "http://localhost:3001";

export default function App() {
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
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>App</Text>
        <Text style={styles.title}>Mobile foundation</Text>
        <View style={styles.panel}>
          <Text style={styles.label}>Public status</Text>
          <Text style={styles.value}>{publicStatus}</Text>
          <Text style={styles.label}>API health</Text>
          <Text style={styles.value}>{renderHealth(health)}</Text>
        </View>
      </View>
    </SafeAreaView>
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f7f5ef"
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24
  },
  eyebrow: {
    color: "#0f766e",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
    textTransform: "uppercase"
  },
  title: {
    color: "#111827",
    fontSize: 42,
    fontWeight: "800",
    lineHeight: 46,
    marginBottom: 28
  },
  panel: {
    gap: 8,
    borderColor: "#d6d3c8",
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#ffffff",
    padding: 18
  },
  label: {
    color: "#64748b",
    fontSize: 14
  },
  value: {
    color: "#0f172a",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10
  }
});
