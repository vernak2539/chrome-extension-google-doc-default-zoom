import { Storage } from "@plasmohq/storage";

// Settings use one shared instance so every reader and writer agrees on the area. Plasmo's default
// is already "sync"; naming it keeps that from changing by accident. Announcement dismissals use
// "local" on purpose (src/components/Announcement/hooks.ts).
export const storage = new Storage({ area: "sync" });

export const SCHEMA_VERSION_KEY = "schemaVersion";
export const CURRENT_SCHEMA_VERSION = 2;
