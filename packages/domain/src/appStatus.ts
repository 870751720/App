export type AppStatus = "ready" | "maintenance";

export function getPublicAppStatus(isMaintenanceEnabled: boolean): AppStatus {
  return isMaintenanceEnabled ? "maintenance" : "ready";
}
