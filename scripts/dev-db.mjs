import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const tempDir = process.env.TEMP || "C:\\temp";
  const dataDir = path.join(tempDir, "lpgsafe_pglite");
  const pidFile = path.join(dataDir, "postmaster.pid");
  if (fs.existsSync(pidFile)) {
    try {
      fs.unlinkSync(pidFile);
    } catch {}
  }

  const db = new PGlite(dataDir);
  await db.waitReady;

  const server = new PGLiteSocketServer({
    db,
    port: 5432,
    host: "127.0.0.1",
    maxConnections: 50,
  });

  await server.start();
  console.log("🚀 PostgreSQL Server running at postgresql://postgres:postgres@localhost:5432/lpgsafe_bd");
}

main().catch(console.error);
