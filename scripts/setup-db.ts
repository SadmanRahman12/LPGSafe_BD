import net from "node:net";
import { execSync, spawn } from "node:child_process";

async function isPortOpen(port: number, host: string = "127.0.0.1"): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("error", () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function main() {
  console.log("Checking database connection on port 5432...");
  const running = await isPortOpen(5432);

  if (!running) {
    console.log("Starting background local PostgreSQL dev server...");
    const subprocess = spawn("node", ["scripts/dev-db.mjs"], {
      detached: true,
      stdio: "ignore",
    });
    subprocess.unref();

    let attempts = 0;
    while (attempts < 10) {
      await new Promise((r) => setTimeout(r, 1000));
      if (await isPortOpen(5432)) break;
      attempts++;
    }
  }

  console.log("Syncing database schema...");
  execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });

  console.log("Seeding initial data...");
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });

  console.log("✅ Database setup complete!");
}

main().catch(console.error);
