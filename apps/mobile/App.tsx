import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { createApiClient } from "@app/api-client";
import {
  contactPreference,
  getPublicAppStatus,
  profileContent,
  type ProfileContent
} from "@app/domain";

type HealthView =
  | { state: "loading" }
  | { state: "ready"; checkedAt: string }
  | { state: "error"; message: string };

const apiBaseUrl = "http://43.110.116.98/api";

export default function App() {
  const [health, setHealth] = useState<HealthView>({ state: "loading" });
  const [profile, setProfile] = useState<ProfileContent>(profileContent);
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

    apiClient
      .getProfile()
      .then((result) => {
        if (isMounted) {
          setProfile(result);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProfile(profileContent);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [apiClient]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>{profile.hero.handle}</Text>
          <Text style={styles.title}>{profile.hero.title}</Text>
          <Text style={styles.summary}>{profile.hero.summary}</Text>
        </View>

        <View style={styles.statusPanel}>
          <StatusItem label="Public status" value={publicStatus} />
          <StatusItem label="API health" value={renderHealth(health)} />
          <StatusItem label="Deploy target" value="43.110.116.98" />
        </View>

        <Section title="Signals">
          {profile.metrics.map((metric) => (
            <Card key={metric.label}>
              <Text style={styles.cardLabel}>{metric.label}</Text>
              <Text style={styles.cardTitle}>{metric.value}</Text>
              <Text style={styles.cardText}>{metric.detail}</Text>
            </Card>
          ))}
        </Section>

        <Section title="Stack">
          {profile.stackAreas.map((area) => (
            <Card key={area.title}>
              <Text style={styles.cardTitle}>{area.title}</Text>
              <Text style={styles.cardText}>{area.summary}</Text>
              <View style={styles.tagRow}>
                {area.tools.map((tool) => (
                  <Text key={tool} style={styles.tag}>
                    {tool}
                  </Text>
                ))}
              </View>
            </Card>
          ))}
        </Section>

        <Section title="Projects">
          {profile.projects.map((project) => (
            <Card key={project.name}>
              <Text style={styles.cardLabel}>{project.status}</Text>
              <Text style={styles.cardTitle}>{project.name}</Text>
              <Text style={styles.cardText}>{project.summary}</Text>
            </Card>
          ))}
        </Section>

        <View style={styles.contact}>
          <Text style={styles.cardLabel}>Contact</Text>
          <Text style={styles.cardTitle}>{profile.contactPreference.title}</Text>
          <Text style={styles.cardText}>{profile.contactPreference.summary}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionList}>{children}</View>
    </View>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statusItem}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusValue}>{value}</Text>
    </View>
  );
}

function renderHealth(health: HealthView) {
  if (health.state === "loading") {
    return "checking";
  }

  if (health.state === "error") {
    return health.message;
  }

  return `ok ${new Date(health.checkedAt).toLocaleTimeString()}`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0c1117"
  },
  content: {
    gap: 18,
    padding: 18,
    paddingBottom: 34
  },
  hero: {
    gap: 12,
    paddingTop: 18
  },
  eyebrow: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(45, 212, 191, 0.12)",
    borderColor: "rgba(94, 234, 212, 0.28)",
    borderRadius: 8,
    borderWidth: 1,
    color: "#99f6e4",
    fontSize: 13,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 7,
    textTransform: "uppercase"
  },
  title: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 39
  },
  summary: {
    color: "#cbd5e1",
    fontSize: 16,
    lineHeight: 25
  },
  statusPanel: {
    gap: 10,
    backgroundColor: "rgba(15, 23, 42, 0.78)",
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    padding: 14
  },
  statusItem: {
    gap: 4,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
    borderBottomWidth: 1,
    paddingBottom: 10
  },
  statusLabel: {
    color: "#94a3b8",
    fontSize: 13
  },
  statusValue: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800"
  },
  section: {
    gap: 10
  },
  sectionTitle: {
    color: "#5eead4",
    fontSize: 15,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  sectionList: {
    gap: 10
  },
  card: {
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    padding: 14
  },
  cardLabel: {
    color: "#fcd34d",
    fontSize: 13,
    fontWeight: "800"
  },
  cardTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "900"
  },
  cardText: {
    color: "#cbd5e1",
    fontSize: 15,
    lineHeight: 23
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  tag: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 6,
    color: "#e2e8f0",
    fontSize: 13,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 5
  },
  contact: {
    gap: 8,
    backgroundColor: "rgba(45, 212, 191, 0.1)",
    borderColor: "rgba(94, 234, 212, 0.24)",
    borderRadius: 8,
    borderWidth: 1,
    padding: 16
  }
});
