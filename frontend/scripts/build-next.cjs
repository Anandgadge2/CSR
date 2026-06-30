const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const nextDir = path.join(root, ".next");
fs.rmSync(nextDir, { recursive: true, force: true });
fs.mkdirSync(nextDir, { recursive: true });

const result = spawnSync(process.platform === "win32" ? "npx.cmd" : "npx", ["next", "build"], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
  env: process.env,
});

if (result.error) {
  console.error(result.error);
}

process.exit(result.status ?? 1);
