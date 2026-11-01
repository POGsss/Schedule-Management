import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const prettier = resolve(root, 'frontend/node_modules/prettier/bin/prettier.cjs');
const files = process.argv.slice(2);

const result = spawnSync(
  process.execPath,
  [prettier, '--check', ...(files.length ? files : ['.'])],
  {
    cwd: root,
    stdio: 'inherit',
  },
);
process.exit(result.status ?? 1);
