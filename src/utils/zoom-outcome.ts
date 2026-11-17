import type { ZoomFailReason, ZoomOutcome, ZoomSkipReason } from "../types";

export const APPLIED: ZoomOutcome = { status: "applied" };

export const skipped = (reason: ZoomSkipReason): ZoomOutcome => ({ status: "skipped", reason });

export const failed = (reason: ZoomFailReason, error?: unknown): ZoomOutcome =>
  error === undefined ? { status: "failed", reason } : { status: "failed", reason, error };
