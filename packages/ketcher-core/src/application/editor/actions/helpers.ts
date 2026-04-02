import { Atom, StereoLabel } from 'domain/entities/atom';
import { Bond } from 'domain/entities/bond';
import type { Neighbor, Struct } from 'domain/entities/struct';
import { StereoValidator } from 'domain/helpers';

function resetStereoAtomIfNotCorrect(
  stereoAtomsMap: Map<number, unknown>,
  correctAtomIds: Array<number>,
  atomId: number,
) {
  if (!correctAtomIds.includes(atomId)) {
    stereoAtomsMap.set(atomId, {
      stereoParity: Atom.PATTERN.STEREO_PARITY.NONE,
      stereoLabel: null,
    });
  }
}

export function getStereoAtomsMap(
  struct: Struct,
  bonds: Array<Bond>,
  bond?: Bond,
) {
  const stereoAtomsMap = new Map();
  const correctAtomIds: Array<number> = [];

  bonds.forEach((bond: Bond | undefined) => {
    if (bond) {
      const beginNeighs: Array<Neighbor> | undefined = struct.atomGetNeighbors(
        bond.begin,
      );
      const endNeighs: Array<Neighbor> | undefined = struct.atomGetNeighbors(
        bond.end,
      );

      if (
        StereoValidator.isCorrectStereoCenter(
          bond,
          beginNeighs,
          endNeighs,
          struct,
        )
      ) {
        const stereoLabel = struct.atoms.get(bond.begin)?.stereoLabel;
        if (
          stereoLabel == null ||
          stereoAtomsMap.get(bond.begin)?.stereoLabel == null
        ) {
          stereoAtomsMap.set(bond.begin, {
            stereoParity: getStereoParity(bond.stereo),
            stereoLabel: stereoLabel ?? `${StereoLabel.Abs}`,
          });
        }
        correctAtomIds.push(bond.begin);
      } else {
        resetStereoAtomIfNotCorrect(stereoAtomsMap, correctAtomIds, bond.begin);
        resetStereoAtomIfNotCorrect(stereoAtomsMap, correctAtomIds, bond.end);
      }
    }
  });

  // In case the stereo band is flipped, changed or removed, reset both endpoints.
  if (bond) {
    resetStereoAtomIfNotCorrect(stereoAtomsMap, correctAtomIds, bond.begin);
    resetStereoAtomIfNotCorrect(stereoAtomsMap, correctAtomIds, bond.end);
  }

  return stereoAtomsMap;
}

function getStereoParity(stereo: number): number | null {
  let newAtomParity: number | null = null;
  switch (stereo) {
    case Bond.PATTERN.STEREO.UP:
      newAtomParity = Atom.PATTERN.STEREO_PARITY.ODD;
      break;
    case Bond.PATTERN.STEREO.EITHER:
      newAtomParity = Atom.PATTERN.STEREO_PARITY.EITHER;
      break;
    case Bond.PATTERN.STEREO.DOWN:
      newAtomParity = Atom.PATTERN.STEREO_PARITY.EVEN;
      break;
  }
  return newAtomParity;
}
