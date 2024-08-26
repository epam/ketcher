import { Atom, Bond, Neighbor, StereoLabel, Struct } from 'domain/entities';
import { StereoValidator } from 'domain/helpers';

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
            stereoLabel: stereoLabel || `${StereoLabel.Abs}`,
          });
        }
        correctAtomIds.push(bond.begin);
      } else {
        if (!correctAtomIds.includes(bond.begin)) {
          stereoAtomsMap.set(bond.begin, {
            stereoParity: Atom.PATTERN.STEREO_PARITY.NONE,
            stereoLabel: null,
          });
        }
        if (!correctAtomIds.includes(bond.end)) {
          stereoAtomsMap.set(bond.end, {
            stereoParity: Atom.PATTERN.STEREO_PARITY.NONE,
            stereoLabel: null,
          });
        }
      }
    }
  });

  // in case the stereo band is flipped, changed or removed
  // TODO the duplication of the code below should be fixed, mayby by function
  if (bond) {
    if (!correctAtomIds.includes(bond.begin)) {
      stereoAtomsMap.set(bond.begin, {
        stereoParity: Atom.PATTERN.STEREO_PARITY.NONE,
        stereoLabel: null,
      });
    }
    if (!correctAtomIds.includes(bond.end)) {
      stereoAtomsMap.set(bond.end, {
        stereoParity: Atom.PATTERN.STEREO_PARITY.NONE,
        stereoLabel: null,
      });
    }
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
