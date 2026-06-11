import type { AuthSessionResponse } from "@app/schemas";

export type SessionState =
  | { state: "anonymous" }
  | { state: "loading"; token: string }
  | { state: "authenticated"; session: AuthSessionResponse }
  | { state: "error"; message: string };

export type DataState<T> = { state: "idle" | "loading" } | { state: "ready"; data: T } | { state: "error"; message: string };
