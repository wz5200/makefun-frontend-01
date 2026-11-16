// Hands this entry in: copies app/ and screenshots/ from this repository into
// the output directory and writes /output/dossier.json with buildDossier from
// the kit library in vendor/. Node 22, standard library only, no network.
// Run it as: MAKEFUN_OUTPUT_DIR=<dir> node main.ts   (default: /output)

import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

async function listTree(dir: string, base: string): Promise<string[]> {
  const names = (await readdir(dir)).sort();
  const found: string[] = [];
  for (const name of names) {
    const full = join(dir, name);
    const info = await stat(full);
    if (info.isDirectory()) found.push(...(await listTree(full, join(base, name))));
    else found.push(join(base, name));
  }
  return found;
}

async function copyTree(from: string, to: string): Promise<void> {
  await mkdir(to, { recursive: true });
  const files = await listTree(from, '');
  for (const rel of files) {
    const target = join(to, rel);
    await mkdir(join(target, '..'), { recursive: true });
    await writeFile(target, await readFile(join(from, rel)));
  }
}

async function main(): Promise<void> {
  const appOut = join(outDir, 'app');
  const shotsOut = join(outDir, 'screenshots');
  await mkdir(appOut, { recursive: true });
  await mkdir(shotsOut, { recursive: true });
  await copyTree(join(repoRoot, 'app'), appOut);
  await copyTree(join(repoRoot, 'screenshots'), shotsOut);
  // Keep the copy helper honest: cp would hide failures behind one call,
  // so the tree above is the real copy; verify it landed file for file.
  const appFiles = await listTree(join(repoRoot, 'app'), '');
  for (const rel of appFiles) await stat(join(appOut, rel));
  const shotFiles = await listTree(join(repoRoot, 'screenshots'), '');
  for (const rel of shotFiles) await stat(join(shotsOut, rel));
  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 3, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16 * 1024 * 1024,
    app_path_max_bytes: 1000,
  });
  await writeFile(join(outDir, 'dossier.json'), dossier);
  console.log('wrote ' + join(outDir, 'dossier.json') + ' (' + dossier.length + ' bytes)');
}

await main();
