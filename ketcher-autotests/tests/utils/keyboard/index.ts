import { isMacOS } from '../os';

export function getControlModifier() {
  return isMacOS() ? 'Meta' : 'Control';
}
