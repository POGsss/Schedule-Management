import { existsSync, readdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const source = resolve(root, 'frontend/src');

function containsSource(directory) {
  if (!existsSync(directory)) return false;
  return readdirSync(directory).some((name) => {
    const path = resolve(directory, name);
    return statSync(path).isDirectory()
      ? containsSource(path)
      : /\.(tsx?|jsx?)$/.test(name) && !/\.(test|spec)\./.test(name);
  });
}

if (!containsSource(source)) {
  console.log(
    'Frontend application source is not implemented yet; tests will be required when it is added.',
  );
  process.exit(0);
}

const result = spawnSync('npm', ['run', 'test:coverage'], {
  cwd: resolve(root, 'frontend'),
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
process.exit(result.status ?? 1);
