import { LeavingGroup } from 'ketcher-core';

const hydrateLeavingGroup = (
  leavingGroup: LeavingGroup | string | undefined | null,
): LeavingGroup => {
  if (!leavingGroup) {
    return 'H';
  }

  if (leavingGroup === 'O') {
    return 'OH';
  }

  if (leavingGroup === 'N') {
    return 'NH2';
  }

  return leavingGroup as LeavingGroup;
};

export default hydrateLeavingGroup;
