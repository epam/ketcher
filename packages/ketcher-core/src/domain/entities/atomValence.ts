/****************************************************************************
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

/**
 * Shared valence calculation used by both micromolecules (`Atom`/`Struct`)
 * and macromolecules (`CoreAtom`) so the valence tables cannot drift
 * between modes.
 */

export type ValenceContext = {
  label: string;
  charge: number;
  connectionCount: number;
  radicalCount: number;
  absCharge: number;
};

export type ValenceComputationResult = {
  valence: number;
  hydrogenCount: number;
};

function calculateUndefinedGroupValence({
  label,
  connectionCount,
  radicalCount,
  absCharge,
}: ValenceContext): ValenceComputationResult | null {
  if (label === 'D' || label === 'T') {
    return {
      valence: 1,
      hydrogenCount: 1 - radicalCount - connectionCount - absCharge,
    };
  }
  return null;
}

function calculateGroup1Valence({
  label,
  connectionCount,
  radicalCount,
  absCharge,
}: ValenceContext): ValenceComputationResult {
  if (
    label === 'H' ||
    label === 'Li' ||
    label === 'Na' ||
    label === 'K' ||
    label === 'Rb' ||
    label === 'Cs' ||
    label === 'Fr'
  ) {
    return {
      valence: 1,
      hydrogenCount: 1 - radicalCount - connectionCount - absCharge,
    };
  }
  return { valence: connectionCount, hydrogenCount: 0 };
}

function calculateGroup2Valence({
  connectionCount,
  radicalCount,
  absCharge,
}: ValenceContext): ValenceComputationResult {
  if (
    connectionCount + radicalCount + absCharge === 2 ||
    connectionCount + radicalCount + absCharge === 0
  ) {
    return {
      valence: 2,
      hydrogenCount: 0,
    };
  }
  return { valence: connectionCount, hydrogenCount: -1 };
}

function calculateGroup3Valence({
  label,
  charge,
  connectionCount,
  radicalCount,
  absCharge,
}: ValenceContext): ValenceComputationResult {
  if (label === 'B' || label === 'Al' || label === 'Ga' || label === 'In') {
    if (charge === -1) {
      return {
        valence: 4,
        hydrogenCount: 4 - radicalCount - connectionCount,
      };
    }
    return {
      valence: 3,
      hydrogenCount: 3 - radicalCount - connectionCount - absCharge,
    };
  }
  if (label === 'Tl') {
    if (charge === -1) {
      if (radicalCount + connectionCount <= 2) {
        return {
          valence: 2,
          hydrogenCount: 2 - radicalCount - connectionCount,
        };
      }
      return {
        valence: 4,
        hydrogenCount: 4 - radicalCount - connectionCount,
      };
    }
    if (charge === -2) {
      if (radicalCount + connectionCount <= 3) {
        return {
          valence: 3,
          hydrogenCount: 3 - radicalCount - connectionCount,
        };
      }
      return {
        valence: 5,
        hydrogenCount: 5 - radicalCount - connectionCount,
      };
    }
    if (radicalCount + connectionCount + absCharge <= 1) {
      return {
        valence: 1,
        hydrogenCount: 1 - radicalCount - connectionCount - absCharge,
      };
    }
    return {
      valence: 3,
      hydrogenCount: 3 - radicalCount - connectionCount - absCharge,
    };
  }
  return { valence: connectionCount, hydrogenCount: 0 };
}

function calculateGroup4Valence({
  label,
  connectionCount,
  radicalCount,
  absCharge,
}: ValenceContext): ValenceComputationResult {
  if (label === 'C' || label === 'Si' || label === 'Ge') {
    return {
      valence: 4,
      hydrogenCount: 4 - radicalCount - connectionCount - absCharge,
    };
  }
  if (label === 'Sn' || label === 'Pb') {
    if (connectionCount + radicalCount + absCharge <= 2) {
      return {
        valence: 2,
        hydrogenCount: 2 - radicalCount - connectionCount - absCharge,
      };
    }
    return {
      valence: 4,
      hydrogenCount: 4 - radicalCount - connectionCount - absCharge,
    };
  }
  return { valence: connectionCount, hydrogenCount: 0 };
}

function calculateGroup5Valence({
  label,
  charge,
  connectionCount,
  radicalCount,
  absCharge,
}: ValenceContext): ValenceComputationResult {
  if (label === 'N' || label === 'P') {
    if (charge === 1) {
      return {
        valence: 4,
        hydrogenCount: 4 - radicalCount - connectionCount,
      };
    }
    if (charge === 2) {
      return {
        valence: 3,
        hydrogenCount: 3 - radicalCount - connectionCount,
      };
    }
    if (radicalCount + connectionCount + absCharge <= 3) {
      return {
        valence: 3,
        hydrogenCount: 3 - radicalCount - connectionCount - absCharge,
      };
    }
    return {
      valence: 5,
      hydrogenCount: 5 - radicalCount - connectionCount - absCharge,
    };
  }
  if (label === 'Bi' || label === 'Sb' || label === 'As') {
    if (charge === 1) {
      if (radicalCount + connectionCount <= 2 && label !== 'As') {
        return {
          valence: 2,
          hydrogenCount: 2 - radicalCount - connectionCount,
        };
      }
      return {
        valence: 4,
        hydrogenCount: 4 - radicalCount - connectionCount,
      };
    }
    if (charge === 2) {
      return {
        valence: 3,
        hydrogenCount: 3 - radicalCount - connectionCount,
      };
    }
    if (radicalCount + connectionCount <= 3) {
      return {
        valence: 3,
        hydrogenCount: 3 - radicalCount - connectionCount - absCharge,
      };
    }
    return {
      valence: 5,
      hydrogenCount: 5 - radicalCount - connectionCount - absCharge,
    };
  }
  return { valence: connectionCount, hydrogenCount: 0 };
}

function calculateGroup6Valence({
  label,
  charge,
  connectionCount,
  radicalCount,
  absCharge,
}: ValenceContext): ValenceComputationResult {
  if (label === 'O') {
    if (charge >= 1) {
      return {
        valence: 3,
        hydrogenCount: 3 - radicalCount - connectionCount,
      };
    }
    return {
      valence: 2,
      hydrogenCount: 2 - radicalCount - connectionCount - absCharge,
    };
  }
  if (label === 'S' || label === 'Se' || label === 'Po') {
    if (charge === 1) {
      if (connectionCount <= 3) {
        return {
          valence: 3,
          hydrogenCount: 3 - radicalCount - connectionCount,
        };
      }
      return {
        valence: 5,
        hydrogenCount: 5 - radicalCount - connectionCount,
      };
    }
    if (connectionCount + radicalCount + absCharge <= 2) {
      return {
        valence: 2,
        hydrogenCount: 2 - radicalCount - connectionCount - absCharge,
      };
    }
    if (connectionCount + radicalCount + absCharge <= 4) {
      // See examples in PubChem
      // [S] : CID 16684216
      // [Se]: CID 5242252
      // [Po]: no example, just following ISIS/Draw logic here
      return {
        valence: 4,
        hydrogenCount: 4 - radicalCount - connectionCount - absCharge,
      };
    }
    // See examples in PubChem
    // [S] : CID 46937044
    // [Se]: CID 59786
    // [Po]: no example, just following ISIS/Draw logic here
    return {
      valence: 6,
      hydrogenCount: 6 - radicalCount - connectionCount - absCharge,
    };
  }
  if (label === 'Te') {
    let valence = connectionCount;
    let hydrogenCount = 0;

    if (
      (charge === -1 || charge === 0 || charge === 2) &&
      connectionCount <= 2
    ) {
      valence = 2;
      hydrogenCount = 2 - radicalCount - connectionCount - absCharge;
    } else if (charge === 0 || charge === 2) {
      if (connectionCount <= 4) {
        valence = 4;
        hydrogenCount = 4 - radicalCount - connectionCount - absCharge;
      } else if (charge === 0 && connectionCount <= 6) {
        valence = 6;
        hydrogenCount = 6 - radicalCount - connectionCount - absCharge;
      } else {
        hydrogenCount = -1;
      }
    }
    return { valence, hydrogenCount };
  }
  return { valence: connectionCount, hydrogenCount: 0 };
}

function calculateGroup7Valence({
  label,
  charge,
  connectionCount,
  radicalCount,
  absCharge,
}: ValenceContext): ValenceComputationResult {
  if (label === 'F') {
    return {
      valence: 1,
      hydrogenCount: 1 - radicalCount - connectionCount - absCharge,
    };
  }
  if (label === 'Cl' || label === 'Br' || label === 'I' || label === 'At') {
    if (charge === 1) {
      if (connectionCount <= 2) {
        return {
          valence: 2,
          hydrogenCount: 2 - radicalCount - connectionCount,
        };
      }
      if (
        connectionCount === 3 ||
        connectionCount === 5 ||
        connectionCount >= 7
      ) {
        return { valence: connectionCount, hydrogenCount: -1 };
      }
    } else if (charge === 0) {
      if (connectionCount <= 1) {
        return {
          valence: 1,
          hydrogenCount: 1 - radicalCount - connectionCount,
        };
      }
      if (
        connectionCount === 2 ||
        connectionCount === 4 ||
        connectionCount === 6
      ) {
        if (radicalCount === 1) {
          return { valence: connectionCount, hydrogenCount: 0 };
        }
        return { valence: connectionCount, hydrogenCount: -1 };
      }
      if (connectionCount > 7) {
        return { valence: connectionCount, hydrogenCount: -1 };
      }
    }
  }
  return { valence: connectionCount, hydrogenCount: 0 };
}

function calculateGroup8Valence({
  label,
  connectionCount,
  radicalCount,
  absCharge,
}: ValenceContext): ValenceComputationResult {
  if (label === 'Pt') {
    if (connectionCount + radicalCount + absCharge <= 2) {
      return {
        valence: 2,
        hydrogenCount: 2 - radicalCount - connectionCount - absCharge,
      };
    }
    if (connectionCount + radicalCount + absCharge <= 4) {
      return {
        valence: 4,
        hydrogenCount: 4 - radicalCount - connectionCount - absCharge,
      };
    }
    return { valence: connectionCount, hydrogenCount: -1 };
  }
  if (connectionCount + radicalCount + absCharge === 0) {
    return { valence: 1, hydrogenCount: 0 };
  }
  return { valence: connectionCount, hydrogenCount: -1 };
}

/**
 * Standard per-periodic-group valence tables. Returns the target valence
 * and the number of implicit hydrogens needed to reach it; a negative
 * hydrogen count means no standard valence fits the connections (bad
 * valence). Returns null for labels without a periodic group other than
 * D/T (query atoms and pseudo labels) — validation is skipped for them.
 */
export function calculateValenceResult(
  groupno: number | undefined,
  context: ValenceContext,
): ValenceComputationResult | null {
  if (groupno === undefined) {
    return calculateUndefinedGroupValence(context);
  }

  switch (groupno) {
    case 1:
      return calculateGroup1Valence(context);
    case 2:
      return calculateGroup2Valence(context);
    case 3:
      return calculateGroup3Valence(context);
    case 4:
      return calculateGroup4Valence(context);
    case 5:
      return calculateGroup5Valence(context);
    case 6:
      return calculateGroup6Valence(context);
    case 7:
      return calculateGroup7Valence(context);
    case 8:
      return calculateGroup8Valence(context);
    default:
      return {
        valence: context.connectionCount,
        hydrogenCount: 0,
      };
  }
}

/**
 * The valence already occupied by connections, radicals and charge —
 * used with a user-set explicit valence to derive the implicit hydrogen
 * count. Charge is not counted for elements where it takes part in
 * bonding (N+/P+/…, O+, S+/Se+, halogen+, B−/Al−/…).
 */
export function calculateValenceMinusHydrogen(
  groupno: number | undefined,
  { label, charge, connectionCount, radicalCount, absCharge }: ValenceContext,
): number {
  if (groupno === 3) {
    if (label === 'B' || label === 'Al' || label === 'Ga' || label === 'In') {
      if (charge === -1) {
        if (radicalCount + connectionCount <= 4) {
          return radicalCount + connectionCount;
        }
      }
    }
  } else if (groupno === 5) {
    if (
      (label === 'N' ||
        label === 'P' ||
        label === 'Sb' ||
        label === 'Bi' ||
        label === 'As') &&
      (charge === 1 || charge === 2)
    ) {
      return radicalCount + connectionCount;
    }
  } else if (groupno === 6) {
    if (label === 'O') {
      if (charge >= 1) return radicalCount + connectionCount;
    } else if (label === 'S' || label === 'Se' || label === 'Po') {
      if (charge === 1) return radicalCount + connectionCount;
    }
  } else if (groupno === 7) {
    if (label === 'Cl' || label === 'Br' || label === 'I' || label === 'At') {
      if (charge === 1) return radicalCount + connectionCount;
    }
  }

  return radicalCount + connectionCount + absCharge;
}

export type AromaticValenceResolution =
  | { kind: 'calculated'; hydrogenCount: number; badValence: boolean }
  | { kind: 'correctedConnectivity'; connectionCount: number }
  | { kind: 'standard' };

/**
 * Aromatic bond orders are ambiguous without kekulization, so atoms with
 * aromatic bonds (connectionCount = neighbor count) are resolved by
 * pattern instead of the standard tables:
 * - 'calculated' — the hydrogen count and bad-valence verdict are final;
 * - 'correctedConnectivity' — proceed with the standard tables using the
 *   corrected connectivity (approximates the extra π bond);
 * - 'standard' — proceed with the standard tables unchanged.
 *
 * `currentImplicitHydrogenCount` keeps micromolecules' legacy stateful
 * behavior: an atom currently showing no implicit hydrogens is left
 * unflagged. Callers without stored state (macromolecules) omit it, which
 * matches the micromolecules steady state for freshly loaded structures.
 */
export function resolveAromaticAtomValence(
  { label, charge, connectionCount, radicalCount }: ValenceContext,
  options: {
    currentImplicitHydrogenCount?: number;
    hasImplicitHydrogenFlag?: boolean;
  } = {},
): AromaticValenceResolution {
  if (label === 'C' && charge === 0) {
    if (connectionCount === 3) {
      return {
        kind: 'calculated',
        hydrogenCount: radicalCount === 0 ? 0 : -radicalCount,
        badValence: false,
      };
    }
    if (connectionCount === 2) {
      return {
        kind: 'calculated',
        hydrogenCount: 1 - radicalCount,
        badValence: false,
      };
    }
    if (connectionCount >= 4) {
      return { kind: 'calculated', hydrogenCount: 0, badValence: true };
    }
    return { kind: 'standard' };
  }
  if (
    (label === 'O' && charge === 0) ||
    (label === 'N' && charge === 0 && connectionCount === 3) ||
    (label === 'N' && charge === 1 && connectionCount === 3) ||
    (label === 'S' && charge === 0 && connectionCount === 3) ||
    !options.currentImplicitHydrogenCount
  ) {
    return { kind: 'calculated', hydrogenCount: 0, badValence: false };
  }
  if (!options.hasImplicitHydrogenFlag) {
    return {
      kind: 'correctedConnectivity',
      connectionCount: connectionCount + 1,
    };
  }
  return { kind: 'standard' };
}
