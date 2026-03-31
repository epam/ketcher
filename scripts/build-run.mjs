import { rmSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

main();

function main() {
  removeDirs([
    './packages/ketcher-core/dist',
    './packages/ketcher-macromolecules/dist',
    './packages/ketcher-react/dist',
    './packages/ketcher-standalone/dist',
  ]);

  run('npm install');
  run('npm run build');
  run('npm run docker:build', resolve(process.cwd(), './ketcher-autotests'));

  console.log('\n✅ Build is ready\n');

  run('npm run serve', resolve(process.cwd()));
}

function run(command, cwd = process.cwd()) {
  execSync(command, {
    stdio: 'inherit',
    cwd,
  });
}

function removeDirs(paths) {
  paths.forEach((path) => {
    rmSync(path, { recursive: true, force: true });
  });
}
