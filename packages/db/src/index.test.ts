import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { beforeAll, describe, expect, it } from "vite-plus/test";

import * as schema from "./schema";

// In production the db runs on D1 (`createDb()` binds `env.DB` from
// `cloudflare:workers`). D1 speaks SQLite, so the generated migrations and
// the drizzle schema are exercised here against an in-memory libsql database
// — same dialect, no Workers runtime required.
const client = createClient({ url: ":memory:" });
const db = drizzle(client, { schema });

const MIGRATIONS_DIR = join(import.meta.dirname, "migrations");

async function applyMigrations() {
  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    const sql = await readFile(join(MIGRATIONS_DIR, file), "utf8");
    await client.executeMultiple(sql);
  }
}

describe("db schema", () => {
  beforeAll(async () => {
    await applyMigrations();
  });

  it("migrations create every table the schema declares", async () => {
    const tables = await client.execute(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
    );
    const names = tables.rows.map((row) => row.name);

    expect(names).toEqual(expect.arrayContaining(["user", "session", "account", "verification"]));
  });

  it("round-trips a user through the drizzle schema", async () => {
    await db.insert(schema.user).values({
      id: "user_1",
      name: "Test User",
      email: "test@example.com",
    });

    const found = await db.query.user.findFirst({
      where: eq(schema.user.email, "test@example.com"),
    });

    expect(found).toMatchObject({ id: "user_1", name: "Test User", emailVerified: false });
    expect(found?.createdAt).toBeInstanceOf(Date);
  });

  it("cascades session deletion when the user is removed", async () => {
    await db.insert(schema.user).values({
      id: "user_2",
      name: "Cascade User",
      email: "cascade@example.com",
    });
    await db.insert(schema.session).values({
      id: "session_1",
      token: "token_1",
      userId: "user_2",
      expiresAt: new Date(Date.now() + 60_000),
      updatedAt: new Date(),
    });
    await client.execute("PRAGMA foreign_keys = ON");

    await db.delete(schema.user).where(eq(schema.user.id, "user_2"));

    const sessions = await db.query.session.findMany({
      where: eq(schema.session.userId, "user_2"),
    });
    expect(sessions).toHaveLength(0);
  });
});
