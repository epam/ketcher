import { Struct } from 'domain/entities/struct';
import { Bond } from 'domain/entities/bond';
import { SuperAttachmentPoint } from 'domain/entities/superAttachmentPoint';

export interface SuperAttachmentPointSelectionInput {
  atoms?: number[];
  bonds?: number[];
  sgroups?: number[];
  rgroups?: number[];
  rgroupAttachmentPoints?: number[];
  rxnArrows?: number[];
  rxnPluses?: number[];
  simpleObjects?: number[];
  texts?: number[];
  superAttachmentPoints?: number[];
}

export type SuperAttachmentPointCreationCheck =
  | { ok: true }
  | { ok: false; reason: string };

const DISALLOWED_NONEMPTY_KEYS: Array<
  keyof SuperAttachmentPointSelectionInput
> = [
  'sgroups',
  'rgroups',
  'rgroupAttachmentPoints',
  'rxnArrows',
  'rxnPluses',
  'simpleObjects',
  'texts',
  'superAttachmentPoints',
];

export function canCreateSuperAttachmentPointFromSelection(
  struct: Struct,
  selection: SuperAttachmentPointSelectionInput,
): SuperAttachmentPointCreationCheck {
  const atomIds = selection.atoms ?? [];
  const bondIds = selection.bonds ?? [];

  if (atomIds.length < 2) {
    return { ok: false, reason: 'Select at least 2 atoms.' };
  }

  for (const key of DISALLOWED_NONEMPTY_KEYS) {
    const arr = selection[key];
    if (arr && arr.length > 0) {
      return {
        ok: false,
        reason: `Selection must contain only atoms and the bonds between them.`,
      };
    }
  }

  for (const aid of atomIds) {
    const atom = struct.atoms.get(aid);
    if (atom instanceof SuperAttachmentPoint) {
      return {
        ok: false,
        reason: 'Selection cannot include a super-attachment point.',
      };
    }
    if (SuperAttachmentPoint.findForAtom(struct, aid) !== null) {
      return {
        ok: false,
        reason:
          'One or more selected atoms already belong to a super-attachment point.',
      };
    }
  }

  const atomSet = new Set(atomIds);

  for (const bid of bondIds) {
    const bond = struct.bonds.get(bid);
    if (!bond) {
      return { ok: false, reason: 'Selection references a missing bond.' };
    }
    if (bond.type === Bond.PATTERN.TYPE.HAPTIC) {
      return {
        ok: false,
        reason: 'Selection cannot include a haptic bond.',
      };
    }
    if (!atomSet.has(bond.begin) || !atomSet.has(bond.end)) {
      return {
        ok: false,
        reason:
          'Selection contains a bond whose endpoint is outside the selection.',
      };
    }
  }

  // Connected-component check: walk the subgraph induced by selected atoms,
  // using all bonds in struct that connect selected atoms (selected bonds
  // optional — we don't require the user to also select the bonds).
  const adj = new Map<number, number[]>();
  for (const aid of atomIds) adj.set(aid, []);
  struct.bonds.forEach((bond) => {
    if (atomSet.has(bond.begin) && atomSet.has(bond.end)) {
      adj.get(bond.begin)?.push(bond.end);
      adj.get(bond.end)?.push(bond.begin);
    }
  });
  const visited = new Set<number>();
  const stack: number[] = [atomIds[0]];
  while (stack.length) {
    const cur = stack.pop();
    if (cur === undefined || visited.has(cur)) continue;
    visited.add(cur);
    for (const next of adj.get(cur) ?? []) {
      if (!visited.has(next)) stack.push(next);
    }
  }
  if (visited.size !== atomIds.length) {
    return {
      ok: false,
      reason: 'Selected atoms must form a single connected component.',
    };
  }

  return { ok: true };
}
