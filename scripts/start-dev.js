#!/usr/bin/env node
/**
 * Starts Next.js dev with a clean .next cache and no duplicate servers.
 * Prevents stale webpack chunk errors (e.g. Cannot find module './vendor-chunks/@radix-ui.js').
 */
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const nextDir = path.join(root, '.next');
const cacheDir = path.join(root, 'node_modules', '.cache');
const port = process.env.PORT || '3000';

function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { cwd: root, stdio: 'inherit', ...opts });
}

function sleep(ms) {
  spawnSync('sleep', [String(Math.ceil(ms / 1000))], { stdio: 'ignore' });
}

function stopExistingDevServers() {
  run('pkill', ['-f', 'next dev'], { stdio: 'ignore' });
  run('pkill', ['-f', 'next-server'], { stdio: 'ignore' });

  const lsof = spawnSync('lsof', ['-ti', `:${port}`], { encoding: 'utf8' });
  const pids = (lsof.stdout || '')
    .trim()
    .split('\n')
    .filter(Boolean);

  for (const pid of pids) {
    try {
      process.kill(Number(pid), 'SIGTERM');
    } catch {
      // already gone
    }
  }

  if (pids.length > 0) sleep(1500);
  else sleep(500);
}

function removeDirSafe(dir) {
  if (!fs.existsSync(dir)) return;

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      return;
    } catch {
      sleep(400 * (attempt + 1));
    }
  }

  console.warn(`⚠ Could not fully remove ${path.relative(root, dir)} — continuing anyway`);
}

function main() {
  const useTurbo = process.argv.includes('--turbo');
  const extraArgs = process.argv.slice(2).filter((arg) => arg !== '--turbo' && arg !== '--webpack');

  console.log('Stopping any existing Next.js dev servers…');
  stopExistingDevServers();

  console.log('Clearing .next and webpack cache…');
  removeDirSafe(nextDir);
  removeDirSafe(cacheDir);

  const nextBin = path.join(root, 'node_modules', '.bin', 'next');
  const args = ['dev', ...(useTurbo ? ['--turbo'] : []), ...extraArgs];

  console.log(`Starting Next.js dev${useTurbo ? ' (Turbopack)' : ' (Webpack)'}…`);

  const child = spawn(nextBin, args, {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      // Polling avoids EMFILE "too many open files" breaking webpack vendor chunks.
      WATCHPACK_POLLING: process.env.WATCHPACK_POLLING ?? 'true',
      WATCHPACK_POLLING_INTERVAL: process.env.WATCHPACK_POLLING_INTERVAL ?? '1000',
    },
  });

  child.on('exit', (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    process.exit(code ?? 0);
  });
}

main();
