import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { createApiClient } from "@app/api-client";
import {
  canUseAction,
  demoAccounts,
  roleDescriptions,
  roleLabels,
  type UserRole
} from "@app/domain";
import type { AuthSessionResponse, HealthStatus, OperationsOverviewResponse } from "@app/schemas";

type SessionState =
  | { state: "anonymous" }
  | { state: "loading" }
  | { state: "authenticated"; session: AuthSessionResponse }
  | { state: "error"; message: string };

type HealthView =
  | { state: "loading" }
  | { state: "ready"; data: HealthStatus }
  | { state: "error"; message: string };

type OverviewView =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "ready"; data: OperationsOverviewResponse }
  | { state: "error"; message: string };

const apiBaseUrl = "http://43.110.116.98/api";

export default function App() {
  const apiClient = useMemo(() => createApiClient({ baseUrl: apiBaseUrl }), []);
  const [session, setSession] = useState<SessionState>({ state: "anonymous" });
  const [health, setHealth] = useState<HealthView>({ state: "loading" });
  const [overview, setOverview] = useState<OverviewView>({ state: "idle" });

  useEffect(() => {
    let isMounted = true;

    apiClient
      .getHealth()
      .then((data) => {
        if (isMounted) {
          setHealth({ state: "ready", data });
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

  useEffect(() => {
    if (session.state !== "authenticated") {
      setOverview({ state: "idle" });
      return;
    }

    let isMounted = true;
    setOverview({ state: "loading" });

    apiClient
      .getOperationsOverview(session.session.token)
      .then((data) => {
        if (isMounted) {
          setOverview({ state: "ready", data });
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setOverview({
            state: "error",
            message: error instanceof Error ? error.message : "Unknown error"
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [apiClient, session]);

  async function handleLogin(email: string, password: string) {
    setSession({ state: "loading" });

    try {
      const nextSession = await apiClient.login(email, password);
      setSession({ state: "authenticated", session: nextSession });
    } catch (error) {
      setSession({
        state: "error",
        message: error instanceof Error ? error.message : "登录失败"
      });
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      {session.state === "authenticated" ? (
        <Dashboard
          health={health}
          overview={overview}
          session={session.session}
          onLogout={() => setSession({ state: "anonymous" })}
        />
      ) : (
        <LoginScreen health={health} session={session} onLogin={handleLogin} />
      )}
    </SafeAreaView>
  );
}

function LoginScreen({
  health,
  session,
  onLogin
}: {
  health: HealthView;
  session: SessionState;
  onLogin: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState(demoAccounts[0]?.email ?? "");
  const [password, setPassword] = useState(demoAccounts[0]?.password ?? "");

  function selectRole(role: UserRole) {
    const account = demoAccounts.find((candidate) => candidate.role === role);

    if (account) {
      setEmail(account.email);
      setPassword(account.password);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Personal Ops Console</Text>
        <Text style={styles.title}>登录后查看个人运维系统</Text>
        <Text style={styles.summary}>Owner、管理员、普通用户三层权限已在第一版跑通。</Text>
      </View>

      <View style={styles.roleGrid}>
        {(["owner", "admin", "user"] as const).map((role) => (
          <Pressable key={role} style={styles.roleButton} onPress={() => selectRole(role)}>
            <Text style={styles.roleTitle}>{roleLabels[role]}</Text>
            <Text style={styles.roleText}>{roleDescriptions[role]}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.panel}>
        <Text style={styles.label}>邮箱</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          style={styles.input}
          value={email}
        />
        <Text style={styles.label}>密码</Text>
        <TextInput onChangeText={setPassword} secureTextEntry style={styles.input} value={password} />
        {session.state === "error" ? <Text style={styles.error}>{session.message}</Text> : null}
        <Pressable
          disabled={session.state === "loading"}
          style={[styles.primaryButton, session.state === "loading" ? styles.disabledButton : null]}
          onPress={() => void onLogin(email, password)}
        >
          <Text style={styles.primaryButtonText}>{session.state === "loading" ? "登录中" : "进入控制台"}</Text>
        </Pressable>
      </View>

      <StatusItem label="API Health" value={renderHealth(health)} />
    </ScrollView>
  );
}

function Dashboard({
  health,
  overview,
  session,
  onLogout
}: {
  health: HealthView;
  overview: OverviewView;
  session: AuthSessionResponse;
  onLogout: () => void;
}) {
  const user = session.user;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>{roleLabels[user.role]}</Text>
        <Text style={styles.title}>个人运维系统</Text>
        <Text style={styles.summary}>{roleDescriptions[user.role]}</Text>
      </View>

      <View style={styles.panel}>
        <StatusItem label="当前用户" value={`${user.name} / ${user.email}`} />
        <StatusItem label="API Health" value={renderHealth(health)} />
      </View>

      {overview.state === "ready" ? (
        <>
          <Section title="服务">
            {overview.data.services.map((service) => (
              <Card key={service.name}>
                <Text style={styles.cardTitle}>{service.name}</Text>
                <Text style={styles.cardLabel}>{service.target}</Text>
                <Text style={styles.cardText}>{service.detail}</Text>
              </Card>
            ))}
          </Section>

          <Section title="权限动作">
            {overview.data.actions.map((action) => (
              <Card key={action.label}>
                <Text style={styles.cardTitle}>{action.label}</Text>
                <Text style={styles.cardLabel}>
                  {canUseAction(user.role, action.minimumRole) ? "可用" : "权限不足"}
                </Text>
                <Text style={styles.cardText}>{action.description}</Text>
              </Card>
            ))}
          </Section>
        </>
      ) : (
        <Card>
          <Text style={styles.cardTitle}>{overview.state === "error" ? "加载失败" : "正在加载"}</Text>
          <Text style={styles.cardText}>{overview.state === "error" ? overview.message : "正在读取运维数据。"}</Text>
        </Card>
      )}

      <Pressable style={styles.secondaryButton} onPress={onLogout}>
        <Text style={styles.secondaryButtonText}>退出登录</Text>
      </Pressable>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
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

  return `ok ${new Date(health.data.checkedAt).toLocaleTimeString()}`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f4f6f8"
  },
  content: {
    gap: 16,
    padding: 18,
    paddingBottom: 34
  },
  hero: {
    gap: 10,
    paddingTop: 18
  },
  eyebrow: {
    alignSelf: "flex-start",
    backgroundColor: "#eef5ff",
    borderColor: "#c6ddff",
    borderRadius: 8,
    borderWidth: 1,
    color: "#1f6feb",
    fontSize: 13,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  title: {
    color: "#101820",
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 38
  },
  summary: {
    color: "#66758a",
    fontSize: 16,
    lineHeight: 25
  },
  roleGrid: {
    gap: 10
  },
  roleButton: {
    backgroundColor: "#ffffff",
    borderColor: "#d7dee8",
    borderRadius: 8,
    borderWidth: 1,
    padding: 14
  },
  roleTitle: {
    color: "#101820",
    fontSize: 18,
    fontWeight: "900"
  },
  roleText: {
    color: "#66758a",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 6
  },
  panel: {
    gap: 10,
    backgroundColor: "#ffffff",
    borderColor: "#d7dee8",
    borderRadius: 8,
    borderWidth: 1,
    padding: 14
  },
  label: {
    color: "#344054",
    fontSize: 13,
    fontWeight: "900"
  },
  input: {
    borderColor: "#cfd8e3",
    borderRadius: 8,
    borderWidth: 1,
    color: "#101820",
    fontSize: 16,
    minHeight: 46,
    paddingHorizontal: 12
  },
  error: {
    color: "#b42318",
    fontSize: 14,
    lineHeight: 20
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#101820",
    borderRadius: 8,
    minHeight: 48,
    justifyContent: "center"
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900"
  },
  disabledButton: {
    opacity: 0.65
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d7dee8",
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: "center"
  },
  secondaryButtonText: {
    color: "#101820",
    fontSize: 16,
    fontWeight: "900"
  },
  statusItem: {
    gap: 4,
    backgroundColor: "#ffffff",
    borderColor: "#d7dee8",
    borderRadius: 8,
    borderWidth: 1,
    padding: 14
  },
  statusLabel: {
    color: "#66758a",
    fontSize: 13,
    fontWeight: "800"
  },
  statusValue: {
    color: "#101820",
    fontSize: 15,
    fontWeight: "900"
  },
  section: {
    gap: 10
  },
  sectionTitle: {
    color: "#101820",
    fontSize: 18,
    fontWeight: "900"
  },
  sectionList: {
    gap: 10
  },
  card: {
    gap: 8,
    backgroundColor: "#ffffff",
    borderColor: "#d7dee8",
    borderRadius: 8,
    borderWidth: 1,
    padding: 14
  },
  cardLabel: {
    color: "#1f6feb",
    fontSize: 13,
    fontWeight: "900"
  },
  cardTitle: {
    color: "#101820",
    fontSize: 20,
    fontWeight: "900"
  },
  cardText: {
    color: "#66758a",
    fontSize: 15,
    lineHeight: 23
  }
});
