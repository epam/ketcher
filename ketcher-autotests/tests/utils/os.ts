import * as os from 'os';

export function isMacOS() {
  return os.platform() === 'darwin';
}
