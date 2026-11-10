import { createHash } from "node:crypto";

const token = process.argv[2];

if (!token) {
  console.error("Usage: node scripts/hash-api-key.mjs <api-key>");
  process.exit(1);
}

const hash = createHash("sha256").update(token).digest("hex");
console.log(hash);
console.log(
  JSON.stringify({
    kvKey: `apikey:${hash}`,
    tierKey: `tier:${hash}`,
    exampleRecord: { tier: "pro", active: true, label: "test-key" },
  }, null, 2),
);
