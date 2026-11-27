#!/usr/bin/env node
// Drives a Ketcher page the way a user does, through Playwright, and exports the
// structure through the Ketcher JS API as proof.
//
// A background daemon holds one Chromium page so commands share state and the
// console-error log. Every command prints one JSON line. Exit 0 = ok, 1 = failed.
//
// Usage: node drive.mjs <command> [--flag value ...]
//   start   [--url URL] [--headed]   start the daemon and browser (url default http://127.0.0.1:4002/index.html)
//   open    --mode molecules|macromolecules   wait for window.ketcher, switch editor mode through the UI
//           [--no-ketcher]           only load the page (a host page that shows no editor yet)
//   load    (--text S | --file F) [--via paste|api] [--type 'HELM'] [--api-kind molecule|helm]   load a structure
//   click   (--testid ID | --role R --name N) [--nth N] [--y-from-bottom N]
//   canvas-click [--dx N --dy N] [--button left|right] [--clicks 2]   click the canvas, offset in px from its centre
//   drag    (--from-testid ID [--from-nth N] | --from-dx N --from-dy N) --to-dx N --to-dy N [--hold-ms N] [--shot FILE]
//           press, move in steps, release; --shot takes a screenshot while the button is still down
//   state   (--testid ID | --role R --name N) [--nth N]   count, visible, enabled, text, value, and
//           offset (centre and size, as px from the canvas centre) of one element
//   fill    (--testid ID | --role R --name N) --text S
//   press   --key K                  keyboard key on the page, e.g. Control+z
//   export  --format F [--out FILE]  F: ket|mol|mol3000|smiles|extsmiles|smarts|cml|rxn|sdf|inchi|inchikey|cdxml|fasta|idt|axolabs|seq1|seq3
//   screenshot --out FILE
//   errors  [--out FILE] [--clear]              console errors, page errors, failed requests so far
//   wait    --ms N                   let the page run N ms (a timeout that fires late, e.g. 30 s)
//   workers                          Web Workers the page created and terminated since the last open
//   status                           daemon and page state
//   stop                             close the browser and the daemon (only ours)
// Common: --dir DIR  daemon state dir (default <repo>/.verify-ketcher/session)

import { spawn } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
  openSync,
} from 'node:fs';
import { createServer, request } from 'node:http';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../../..');

// Stable test IDs. Copied from the ketcher-autotests page objects, because those are
// TypeScript behind path aliases and cannot be imported from a plain .mjs script.
// Source of each group is named next to it. Keep them in step with those files.
export const TESTID = {
  // ketcher-autotests/tests/pages/common/CommonTopLeftToolbar.ts
  clear: 'clear-canvas',
  open: 'open-file-button',
  save: 'save-file-button',
  undo: 'undo',
  redo: 'redo',
  // ketcher-autotests/tests/pages/common/OpenStructureDialog.ts
  openPaste: 'paste-from-clipboard-button',
  openWindow: 'openStructureModal',
  close: 'close-window-button',
  // ketcher-autotests/tests/pages/common/PasteFromClipboardDialog.ts
  // (content type dropdown: option labels are the MacroFileType enum in tests/utils/canvas/types.ts)
  contentType: 'dropdown-select',
  pasteTextarea: 'open-structure-textarea',
  openAsNew: 'open-as-new-button',
  addToCanvas: 'add-to-canvas-button',
  // ketcher-autotests/tests/pages/common/ErrorMessageDialog.ts
  errorWindow: 'info-modal-window',
  errorBody: 'error-message-body',
  errorClose: 'info-modal-close',
  // ketcher-autotests/tests/pages/common/CommonTopRightToolbar.ts and
  // tests/pages/constants/commonTopRightToolbar/Constants.ts
  modeSwitcher: 'polymer-toggler',
  modeOption: {
    molecules: 'molecules_mode',
    macromolecules: 'macromolecules_mode',
  },
  // ketcher-autotests/tests/pages/constants/ringButton/Constants.ts
  benzene: 'template-0',
  // ketcher-autotests/tests/pages/constants/atoms/atoms.ts
  oxygen: 'O-button',
  // ketcher-autotests/tests/pages/macromolecules/MacromoleculesTopToolbar.ts
  macroLayoutMode: 'layout-mode',
};

const EXPORTERS = {
  ket: ['getKet'],
  mol: ['getMolfile'],
  mol3000: ['getMolfile', 'v3000'],
  smiles: ['getSmiles'],
  extsmiles: ['getExtendedSmiles'],
  smarts: ['getSmarts'],
  cml: ['getCml'],
  rxn: ['getRxn'],
  sdf: ['getSdf'],
  inchi: ['getInchi'],
  inchikey: ['getInChIKey'],
  cdxml: ['getCDXml'],
  fasta: ['getFasta'],
  idt: ['getIdt'],
  axolabs: ['getAxoLabs'],
  seq1: ['getSequence', '1-letter'],
  seq3: ['getSequence', '3-letter'],
};

const argv = process.argv.slice(2);
const cmd = argv.shift();
const flags = {};
for (let i = 0; i < argv.length; i++) {
  if (!argv[i].startsWith('--')) continue;
  const k = argv[i].slice(2);
  const next = argv[i + 1];
  if (next === undefined || next.startsWith('--')) flags[k] = true;
  else {
    flags[k] = next;
    i++;
  }
}
const DIR = resolve(flags.dir ?? join(ROOT, '.verify-ketcher/session'));
const STATE = join(DIR, 'daemon.json');

// ---------- daemon ----------

async function daemon() {
  const require = createRequire(join(ROOT, 'package.json'));
  const { chromium } = require('@playwright/test');
  const browser = await chromium.launch({ headless: !flags.headed });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    // Ketcher copies and pastes through navigator.clipboard.
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  // Counts Web Workers the page creates and terminates, for the `workers` command.
  await context.addInitScript(() => {
    const counts = { created: 0, terminated: 0 };
    globalThis.__verifyWorkers = counts;
    const NativeWorker = globalThis.Worker;
    if (!NativeWorker) return;
    globalThis.Worker = class extends NativeWorker {
      constructor(...args) {
        super(...args);
        counts.created++;
      }
      terminate() {
        counts.terminated++;
        super.terminate();
      }
    };
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const url = flags.url ?? 'http://127.0.0.1:4002/index.html';
  const problems = [];
  page.on('console', (m) => {
    if (m.type() === 'error')
      problems.push({ kind: 'console', text: m.text() });
  });
  page.on('pageerror', (e) =>
    problems.push({ kind: 'pageerror', text: String(e) }),
  );
  page.on('requestfailed', (r) =>
    problems.push({
      kind: 'requestfailed',
      text: `${r.url()} ${r.failure()?.errorText}`,
    }),
  );
  page.on('response', (r) => {
    if (r.status() >= 400)
      problems.push({ kind: 'http', text: `${r.status()} ${r.url()}` });
  });

  const canvasPoint = async (dx, dy) => {
    const box = await page
      .locator('[data-testid="ketcher-canvas"]:visible')
      .first()
      .boundingBox();
    return {
      x: box.x + box.width / 2 + Number(dx ?? 0),
      y: box.y + box.height / 2 + Number(dy ?? 0),
    };
  };
  const target = (f) =>
    f.testid
      ? page.getByTestId(f.testid)
      : page.getByRole(f.role, { name: f.name });
  const visible = (loc) => loc.filter({ visible: true });

  const handlers = {
    async open(f) {
      const mode = f.mode ?? 'molecules';
      if (!TESTID.modeOption[mode])
        throw new Error('--mode molecules|macromolecules');
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      if (f['no-ketcher']) return { url: page.url(), mode: null };
      await page.waitForFunction(() => !!globalThis.ketcher, null, {
        timeout: 90000,
      });
      if (mode === 'macromolecules') {
        await visible(page.getByTestId(TESTID.modeSwitcher)).click();
        await page.getByTestId(TESTID.modeOption.macromolecules).click();
        await page
          .getByTestId(TESTID.macroLayoutMode)
          .waitFor({ state: 'visible' });
      }
      return { url: page.url(), mode };
    },
    async load(f) {
      const text = f.text ?? readFileSync(resolve(f.file), 'utf8');
      if (f.via === 'api') {
        await page.evaluate(
          async ([t, kind]) =>
            kind === 'helm'
              ? globalThis.ketcher.setHelm(t)
              : globalThis.ketcher.setMolecule(t),
          [text, f['api-kind'] ?? 'molecule'],
        );
        return { via: 'api', chars: text.length };
      }
      await visible(page.getByTestId(TESTID.open)).click();
      await page.getByTestId(TESTID.openPaste).click();
      if (f.type) {
        // Macromolecules editor only: pick the content type before pasting.
        await page.getByTestId(TESTID.contentType).click();
        await page
          .getByRole('listbox')
          .getByText(f.type, { exact: true })
          .click();
      }
      await page.getByTestId(TESTID.pasteTextarea).fill(text);
      await page.getByTestId(TESTID.openAsNew).click();
      await page.waitForTimeout(1500);
      // An app error dialog is not a console error. Report it and close it.
      const err = page.getByTestId(TESTID.errorBody);
      if (await err.isVisible()) {
        const message = ((await err.textContent()) ?? '').trim();
        await page.getByTestId(TESTID.errorClose).click();
        await page
          .getByTestId(TESTID.close)
          .click()
          .catch(() => {});
        throw new Error(`Ketcher showed an error dialog: ${message}`);
      }
      await page
        .getByTestId(TESTID.openWindow)
        .waitFor({ state: 'detached', timeout: 15000 });
      return { via: 'paste', chars: text.length };
    },
    async click(f) {
      const loc = visible(target(f)).nth(Number(f.nth ?? 0));
      if (f['y-from-bottom'] !== undefined) {
        // Click N px above the bottom edge, centred horizontally (monomer cards
        // carry other click targets in their middle).
        const b = await loc.boundingBox();
        await loc.click({
          position: {
            x: b.width / 2,
            y: b.height - Number(f['y-from-bottom']),
          },
        });
      } else await loc.click();
      await page.waitForTimeout(300);
      return { clicked: f.testid ?? `${f.role}:${f.name}` };
    },
    async 'canvas-click'(f) {
      // Click on the drawing canvas, offset in pixels from its centre.
      const { x, y } = await canvasPoint(f.dx, f.dy);
      const button = f.button ?? 'left';
      const clickCount = Number(f.clicks ?? 1);
      await page.mouse.click(x, y, { button, clickCount });
      await page.waitForTimeout(500);
      return {
        clicked: { x: Math.round(x), y: Math.round(y), button, clickCount },
      };
    },
    async drag(f) {
      let from;
      if (f['from-testid']) {
        const loc = visible(page.getByTestId(f['from-testid'])).nth(
          Number(f['from-nth'] ?? 0),
        );
        const b = await loc.boundingBox();
        from = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
      } else from = await canvasPoint(f['from-dx'], f['from-dy']);
      const to = await canvasPoint(f['to-dx'], f['to-dy']);
      await page.mouse.move(from.x, from.y);
      await page.mouse.down();
      await page.mouse.move(to.x, to.y, { steps: 10 });
      await page.waitForTimeout(Number(f['hold-ms'] ?? 300));
      if (f.shot) {
        mkdirSync(dirname(resolve(f.shot)), { recursive: true });
        await page.screenshot({ path: resolve(f.shot) });
      }
      await page.mouse.up();
      await page.waitForTimeout(500);
      const r = (p) => ({ x: Math.round(p.x), y: Math.round(p.y) });
      return { dragged: { from: r(from), to: r(to) } };
    },
    async state(f) {
      // Prefer visible matches: some test IDs also sit on hidden duplicates.
      const all = target(f);
      const count = await all.count();
      if (!count) return { exists: false };
      const shown = await visible(all).count();
      const loc = (shown ? visible(all) : all).nth(Number(f.nth ?? 0));
      const tag = await loc.evaluate((e) => e.tagName.toLowerCase());
      const b = await loc.boundingBox();
      const c = await canvasPoint(0, 0).catch(() => null);
      return {
        exists: true,
        count,
        // Centre of the element as an offset from the canvas centre, for canvas-click and drag.
        offset:
          b && c
            ? {
                dx: Math.round(b.x + b.width / 2 - c.x),
                dy: Math.round(b.y + b.height / 2 - c.y),
                width: Math.round(b.width),
                height: Math.round(b.height),
              }
            : null,
        visible: await loc.isVisible(),
        enabled: await loc.isEnabled(),
        text: ((await loc.textContent()) ?? '').trim(),
        value: ['input', 'textarea', 'select'].includes(tag)
          ? await loc.inputValue()
          : null,
      };
    },
    async fill(f) {
      await visible(target(f))
        .nth(Number(f.nth ?? 0))
        .fill(String(f.text));
      return { filled: f.testid ?? `${f.role}:${f.name}` };
    },
    async press(f) {
      await page.keyboard.press(f.key);
      await page.waitForTimeout(300);
      return { pressed: f.key };
    },
    async export(f) {
      const spec = EXPORTERS[f.format];
      if (!spec)
        throw new Error(`--format ${Object.keys(EXPORTERS).join('|')}`);
      const text = await page.evaluate(
        ([fn, arg]) => globalThis.ketcher[fn](arg),
        spec,
      );
      if (f.out) {
        mkdirSync(dirname(resolve(f.out)), { recursive: true });
        writeFileSync(resolve(f.out), text);
      }
      return {
        format: f.format,
        api: spec[0],
        out: f.out ? resolve(f.out) : null,
        text,
      };
    },
    async screenshot(f) {
      mkdirSync(dirname(resolve(f.out)), { recursive: true });
      await page.screenshot({ path: resolve(f.out) });
      return { out: resolve(f.out) };
    },
    async errors(f) {
      const out = { count: problems.length, problems: [...problems] };
      if (f.out) {
        mkdirSync(dirname(resolve(f.out)), { recursive: true });
        writeFileSync(resolve(f.out), JSON.stringify(out, null, 2));
      }
      if (f.clear) problems.length = 0;
      return out;
    },
    async wait(f) {
      const ms = Number(f.ms);
      if (!(ms > 0)) throw new Error('--ms N');
      await page.waitForTimeout(ms);
      return { waitedMs: ms };
    },
    async workers() {
      return page.evaluate(() => ({ ...globalThis.__verifyWorkers }));
    },
    async status() {
      return {
        url: page.url(),
        ketcherReady: await page.evaluate(() => !!globalThis.ketcher),
        problems: problems.length,
      };
    },
  };

  const server = createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', async () => {
      const { command, flags: f } = JSON.parse(body);
      try {
        if (command === 'stop') {
          res.end(
            JSON.stringify({ ok: true, result: { stopped: process.pid } }),
          );
          await browser.close();
          server.close();
          rmSync(STATE, { force: true });
          process.exit(0);
        }
        if (!handlers[command]) throw new Error(`unknown command ${command}`);
        res.end(
          JSON.stringify({ ok: true, result: await handlers[command](f) }),
        );
      } catch (e) {
        res.end(JSON.stringify({ ok: false, error: String(e.message ?? e) }));
      }
    });
  });
  server.listen(0, '127.0.0.1', () => {
    writeFileSync(
      STATE,
      JSON.stringify({ pid: process.pid, port: server.address().port }),
    );
  });
}

// ---------- client ----------

function send(port, command, f) {
  return new Promise((ok, fail) => {
    const req = request({ host: '127.0.0.1', port, method: 'POST' }, (res) => {
      let b = '';
      res.on('data', (c) => (b += c));
      res.on('end', () => ok(JSON.parse(b)));
    });
    req.on('error', fail);
    req.end(JSON.stringify({ command, flags: f }));
  });
}

async function client() {
  if (cmd === 'start') {
    if (existsSync(STATE)) {
      console.log(
        JSON.stringify({
          ok: false,
          error: `a session already exists at ${DIR}; run stop first`,
        }),
      );
      return 1;
    }
    mkdirSync(DIR, { recursive: true });
    const log = openSync(join(DIR, 'daemon.log'), 'w');
    const child = spawn(
      process.execPath,
      [fileURLToPath(import.meta.url), '__daemon', ...argv, '--dir', DIR],
      {
        detached: true,
        stdio: ['ignore', log, log],
      },
    );
    child.unref();
    for (let i = 0; i < 60; i++) {
      if (existsSync(STATE)) {
        console.log(
          JSON.stringify({
            ok: true,
            result: JSON.parse(readFileSync(STATE, 'utf8')),
          }),
        );
        return 0;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    console.log(
      JSON.stringify({
        ok: false,
        error: `daemon did not start; see ${join(DIR, 'daemon.log')}`,
      }),
    );
    return 1;
  }
  if (!existsSync(STATE)) {
    console.log(
      JSON.stringify({
        ok: false,
        error: 'no session; run `drive.mjs start` first',
      }),
    );
    return 1;
  }
  const { port } = JSON.parse(readFileSync(STATE, 'utf8'));
  const r = await send(port, cmd, flags).catch((e) => ({
    ok: false,
    error: String(e),
  }));
  console.log(JSON.stringify(r));
  return r.ok ? 0 : 1;
}

if (cmd === '__daemon') await daemon();
else if (!cmd || cmd === 'help' || flags.help) {
  console.error(
    readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n\n')[0],
  );
  process.exit(2);
} else process.exit(await client());
