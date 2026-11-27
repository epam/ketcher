import type { LayoutMode } from './types';
import type { BaseMode } from './BaseMode';

type ModeConstructor = new (previousMode?: LayoutMode) => BaseMode;

const modesMap = new Map<LayoutMode, ModeConstructor>();

export function registerMode(mode: LayoutMode, ctor: ModeConstructor) {
  const registered = modesMap.get(mode);
  if (registered && registered !== ctor) {
    throw new Error(`Mode "${mode}" is already registered`);
  }
  if (registered === ctor) {
    return;
  }
  modesMap.set(mode, ctor);
}

export function getModeConstructor(mode: LayoutMode): ModeConstructor {
  const ctor = modesMap.get(mode);
  if (!ctor) {
    throw new Error(`Mode "${mode}" is not registered`);
  }
  return ctor;
}
