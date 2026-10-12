import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import type { TierlistAgentApi } from '../src/app/agentApi';

type AgentActionCall = {
  [Fn in keyof TierlistAgentApi]: { fn: Fn; args: Parameters<TierlistAgentApi[Fn]> };
}[keyof TierlistAgentApi];

type ParsedArgs = {
  type: 'series' | 'movies';
  out: string;
  actionsPath: string | undefined;
};

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 4174;

const parseArgs = (): ParsedArgs => {
  const args = process.argv.slice(2);
  const flag = (name: string): string | undefined => {
    const index = args.indexOf(name);
    return index === -1 ? undefined : args[index + 1];
  };

  const type = flag('--type');
  const out = flag('--out');
  if (type !== 'series' && type !== 'movies') {
    throw new Error('Usage: node scripts/agentRender.ts --type series|movies --out FILE.png [--actions FILE.json]');
  }
  if (!out) {
    throw new Error('Missing required --out FILE.png');
  }
  return { type, out, actionsPath: flag('--actions') };
};

const loadActions = async (actionsPath: string | undefined): Promise<AgentActionCall[]> => {
  if (!actionsPath) {
    return [];
  }
  return JSON.parse(await readFile(actionsPath, 'utf8')) as AgentActionCall[];
};

const startStaticServer = (): Promise<import('node:http').Server> => {
  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? '/', `http://localhost:${PORT}`);
      const body = await readFile(path.join(ROOT, requestUrl.pathname));
      response.end(body);
    } catch {
      response.writeHead(404).end('Not found');
    }
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
};

const run = async (): Promise<void> => {
  const { type, out, actionsPath } = parseArgs();
  const actions = await loadActions(actionsPath);

  const server = await startStaticServer();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${PORT}/${type}.html`);
    await page.waitForFunction(() => typeof window.Tierlist !== 'undefined');

    for (const action of actions) {
      await page.evaluate(({ fn, args }) => {
        return (window.Tierlist[fn] as (...callArgs: unknown[]) => unknown)(...args);
      }, action);
    }

    const downloadPromise = page.waitForEvent('download');
    await page.evaluate(() => window.Tierlist.downloadImage());
    const download = await downloadPromise;
    await download.saveAs(out);
    console.log(`saved ${out}`);
  } finally {
    await browser.close();
    server.close();
  }
};

await run();
