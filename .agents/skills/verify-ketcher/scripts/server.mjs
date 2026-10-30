#!/usr/bin/env node
// Starts, checks, and stops the Ketcher example app for verification.
// Usage: node server.mjs <start|doctor|stop> [--mode standalone|remote] [--port N] [--api URL]
// It records the process it started in .verify-ketcher/server.json and only ever
// touches that PID. Exit 0 = ok, 1 = check failed, 2 = bad usage.

import { spawn, execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const OUT = join(ROOT, '.verify-ketcher');
const STATE = join(OUT, 'server.json');
const LOG = join(OUT, 'server.log');
const DEFAULT_PORT = { standalone: 4002, remote: 4001 };
// Not a bare "/": the Vite dev server answers 404 there. The page lives at index.html.
const PAGE = 'index.html';

const args = process.argv.slice(2);
const cmd = args.shift();
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const mode = opt('mode', 'standalone');
const port = Number(opt('port', DEFAULT_PORT[mode]));
const api = opt('api', process.env.REACT_APP_API_PATH);

const alive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};
const listenerPids = (p) => {
  try {
    return execFileSync('lsof', ['-nP', `-iTCP:${p}`, '-sTCP:LISTEN', '-t'], {
      encoding: 'utf8',
    })
      .split('\n')
      .filter(Boolean)
      .map(Number);
  } catch {
    return [];
  }
};
const readState = () =>
  existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : null;
const head = () =>
  execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: ROOT,
    encoding: 'utf8',
  }).trim();
const get = async (url) => {
  try {
    return await fetch(url, { signal: AbortSignal.timeout(5000) });
  } catch {
    return null;
  }
};

async function start() {
  if (!(mode in DEFAULT_PORT)) return usage();
  if (mode === 'remote' && !api) {
    console.error(
      'Remote mode needs an Indigo service. Pass --api <url> or set REACT_APP_API_PATH.',
    );
    return 1;
  }
  if (listenerPids(port).length) {
    console.error(
      `Port ${port} is already in use (pid ${listenerPids(port)}). Not ours to drive or kill. Pick another --port.`,
    );
    return 1;
  }
  mkdirSync(OUT, { recursive: true });
  const vite = join(ROOT, 'node_modules/vite/bin/vite.js');
  if (!existsSync(vite)) {
    console.error(
      'node_modules/vite is missing. Run `npm install` at the repo root.',
    );
    return 1;
  }
  const env = { ...process.env, MODE: mode };
  if (api) env.REACT_APP_API_PATH = api;
  const log = openSync(LOG, 'w');
  // Run vite's own entry with node so the child PID is the process that listens.
  const child = spawn(
    process.execPath,
    [vite, '--port', String(port), '--strictPort', '--open', 'false'],
    {
      cwd: join(ROOT, 'example'),
      env,
      detached: true,
      stdio: ['ignore', log, log],
    },
  );
  child.unref();
  writeFileSync(
    STATE,
    JSON.stringify(
      {
        pid: child.pid,
        mode,
        port,
        api: api ?? null,
        head: head(),
        startedAt: Date.now(),
      },
      null,
      2,
    ),
  );
  const url = `http://127.0.0.1:${port}/${PAGE}`;
  for (let i = 0; i < 90; i++) {
    if (!alive(child.pid)) {
      console.error(`Vite exited early. See ${LOG}`);
      return 1;
    }
    const r = await get(url);
    if (r?.ok) {
      console.log(`ready ${url} (pid ${child.pid}, mode ${mode})`);
      return 0;
    }
    await new Promise((r2) => setTimeout(r2, 1000));
  }
  console.error(`Not ready after 90 s. See ${LOG}`);
  return 1;
}

async function doctor() {
  const s = readState();
  const bad = [];
  const note = (ok, msg) => {
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`);
    if (!ok) bad.push(msg);
  };
  if (!s) {
    note(
      false,
      'no .verify-ketcher/server.json: this run did not start a server',
    );
    return 1;
  }
  note(alive(s.pid), `server pid ${s.pid} is alive`);
  const owners = listenerPids(s.port);
  note(
    owners.includes(s.pid),
    `port ${s.port} is listened on by our pid (found ${owners.join(',') || 'nobody'})`,
  );
  const r = await get(`http://127.0.0.1:${s.port}/${PAGE}`);
  note(!!r?.ok, `GET /${PAGE} answers 200 (got ${r?.status ?? 'no answer'})`);
  // Vite serves packages/*/src live (see example/vite.config.js aliases), so there is no dist to go stale.
  // The one way this server can be stale is a checkout that moved after it started.
  note(
    head() === s.head,
    `checkout is still at the commit the server started on (${s.head.slice(0, 10)})`,
  );
  const dirty = execFileSync(
    'git',
    ['status', '--porcelain', '--', 'packages', 'example/src'],
    {
      cwd: ROOT,
      encoding: 'utf8',
    },
  ).trim();
  console.log(
    `info ${dirty ? 'uncommitted product changes are served live (HMR)' : 'no uncommitted product changes'}`,
  );
  const newest = Number(
    execFileSync(
      'git',
      ['log', '-1', '--format=%ct', '--', 'packages', 'example/src'],
      {
        cwd: ROOT,
        encoding: 'utf8',
      },
    ),
  );
  note(
    s.startedAt / 1000 >= newest,
    'server started after the newest product commit',
  );
  if (s.mode === 'remote') {
    const info = await get(`${s.api.replace(/\/$/, '')}/indigo/info`);
    note(
      !!info?.ok,
      `Indigo service reachable at ${s.api}/indigo/info (got ${info?.status ?? 'no answer'})`,
    );
  } else {
    console.log(
      'info standalone mode runs Indigo as WASM in the browser: no service needed',
    );
  }
  console.log(
    bad.length
      ? 'NOT WORTH DRIVING'
      : `READY http://127.0.0.1:${s.port}/${PAGE} mode=${s.mode}`,
  );
  return bad.length ? 1 : 0;
}

async function stop() {
  const s = readState();
  if (!s) {
    console.log('nothing to stop: this run started no server');
    return 0;
  }
  if (alive(s.pid)) {
    try {
      process.kill(-s.pid, 'SIGTERM'); // the process group we created
    } catch {
      process.kill(s.pid, 'SIGTERM');
    }
    for (let i = 0; i < 20 && alive(s.pid); i++)
      await new Promise((r) => setTimeout(r, 250));
    if (alive(s.pid)) process.kill(s.pid, 'SIGKILL');
  }
  rmSync(STATE, { force: true });
  console.log(
    `stopped pid ${s.pid}; port ${s.port} listeners now: ${listenerPids(s.port).join(',') || 'none'}`,
  );
  return 0;
}

function usage() {
  console.error(
    'usage: server.mjs <start|doctor|stop> [--mode standalone|remote] [--port N] [--api URL]',
  );
  return 2;
}

const run = { start, doctor, stop }[cmd];
process.exit(run ? await run() : usage());
