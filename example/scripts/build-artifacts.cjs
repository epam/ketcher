/* eslint-disable @typescript-eslint/no-var-requires */
const { cp, mkdir, readdir, rm } = require('node:fs/promises');
const path = require('node:path');

const action = process.argv[2];
const rootDir = path.resolve(__dirname, '..');
const buildDir = path.join(rootDir, 'build');
const mode = process.env.MODE;
const distModeDir = mode ? path.join(rootDir, 'dist', mode) : null;

function requireMode() {
  if (!mode) {
    throw new Error(
      'MODE environment variable is required for dist operations.',
    );
  }

  return distModeDir;
}

async function cleanDirectoryContents(targetDir) {
  let entries;

  try {
    entries = await readdir(targetDir, { withFileTypes: true });
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return;
    }

    throw error;
  }

  await Promise.all(
    entries.map((entry) =>
      rm(path.join(targetDir, entry.name), {
        force: true,
        recursive: true,
      }),
    ),
  );
}

async function main() {
  switch (action) {
    case 'init-build':
      await mkdir(buildDir, { recursive: true });
      return;
    case 'init-dist':
      await mkdir(requireMode(), { recursive: true });
      return;
    case 'clean-dist': {
      const targetDir = requireMode();
      await mkdir(targetDir, { recursive: true });
      await cleanDirectoryContents(targetDir);
      return;
    }
    case 'copy-build':
      await cp(buildDir, requireMode(), {
        force: true,
        recursive: true,
      });
      return;
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
