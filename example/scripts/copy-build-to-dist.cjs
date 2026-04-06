const { cp, mkdir } = require('fs/promises');
const path = require('path');

async function main() {
  const mode = process.env.MODE;

  if (!mode) {
    throw new Error('MODE env var is required');
  }

  const rootDir = path.resolve(__dirname, '..');
  const buildDir = path.join(rootDir, 'build');
  const targetDir = path.join(rootDir, 'dist', mode);

  await mkdir(targetDir, { recursive: true });
  await cp(buildDir, targetDir, {
    recursive: true,
    force: true,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
