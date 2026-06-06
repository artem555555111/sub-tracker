import { handlers } from "@/lib/auth";

// Prisma (better-sqlite3) is Node-only, so keep auth on the Node runtime.
export const runtime = "nodejs";

export const { GET, POST } = handlers;
