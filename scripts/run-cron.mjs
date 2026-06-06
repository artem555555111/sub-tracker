import "dotenv/config";

// Manually trigger the reminders cron locally (Vercel Cron does this daily).
// Usage: node scripts/run-cron.mjs [port]
const port = process.argv[2] || process.env.PORT || 3001;
const url = `http://localhost:${port}/api/cron/reminders`;

const res = await fetch(url, {
  headers: { authorization: `Bearer ${process.env.CRON_SECRET ?? ""}` },
});
console.log("HTTP", res.status);
console.log(await res.text());
