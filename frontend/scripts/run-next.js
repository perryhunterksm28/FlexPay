/**
 * Thin wrapper so package.json can run the local Next.js CLI reliably on Windows
 * (workspace hoists `next` to the repo root `node_modules`).
 */
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const frontendRoot = path.join(__dirname, '..');
const nextCli = require.resolve('next/dist/bin/next', { paths: [frontendRoot] });

const args = process.argv.slice(2);
const result = spawnSync(process.execPath, [nextCli, ...args], {
  cwd: frontendRoot,
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status ?? 1);
