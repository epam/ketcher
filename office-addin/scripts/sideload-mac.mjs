// Sideloads manifest.xml into PowerPoint for Mac. Restart PowerPoint after
// running it, then open Home > Add-ins (or Insert > My Add-ins).
import { copyFileSync, mkdirSync } from 'node:fs';
import { homedir, platform } from 'node:os';
import { join } from 'node:path';

if (platform() !== 'darwin') {
  console.error('This script is for PowerPoint for Mac. See README.md.');
  process.exit(1);
}

const wefDir = join(
  homedir(),
  'Library/Containers/com.microsoft.Powerpoint/Data/Documents/wef',
);
mkdirSync(wefDir, { recursive: true });
const target = join(wefDir, 'ketcher-office-addin.xml');
copyFileSync(join(import.meta.dirname, '../manifest.xml'), target);
console.log(`Copied manifest to ${target}`);
