/****************************************************************************
 * Copyright 2021 EPAM Systems
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

import { Struct } from 'ketcher-core';
import {
  ELECTRON_MASS_AMU,
  getStructTotalCharge,
  adjustMassForCharge,
} from './chargeMassCorrection';

function createMockStruct(
  atoms: Array<{ charge?: number | null }>,
  options: {
    getComponents?: () => { reactants: Set<number>[]; products: Set<number>[] };
  } = {},
): Struct {
  const atomsMap = new Map();
  atoms.forEach((atom, index) => {
    atomsMap.set(index, atom);
  });

  return {
    atoms: {
      forEach: (callback: (atom: unknown, aid: number) => void) =>
        atomsMap.forEach(callback),
      get: (id: number) => atomsMap.get(id),
    },
    getComponents:
      options.getComponents || (() => ({ reactants: [], products: [] })),
  } as unknown as Struct;
}

describe('chargeMassCorrection', () => {
  describe('ELECTRON_MASS_AMU', () => {
    it('should be the CODATA 2018 electron mass value', () => {
      expect(ELECTRON_MASS_AMU).toBeCloseTo(0.00054857990946, 14);
    });
  });

  describe('getStructTotalCharge', () => {
    it('should return 0 for neutral molecule', () => {
      const struct = createMockStruct([
        { charge: 0 },
        { charge: 0 },
        { charge: null },
      ]);
      expect(getStructTotalCharge(struct)).toBe(0);
    });

    it('should return +1 for singly positively charged molecule', () => {
      const struct = createMockStruct([{ charge: 1 }, { charge: 0 }]);
      expect(getStructTotalCharge(struct)).toBe(1);
    });

    it('should return -1 for singly negatively charged molecule', () => {
      const struct = createMockStruct([{ charge: -1 }, { charge: 0 }]);
      expect(getStructTotalCharge(struct)).toBe(-1);
    });

    it('should sum charges of multiple charged atoms', () => {
      const struct = createMockStruct([
        { charge: 1 },
        { charge: -1 },
        { charge: 2 },
      ]);
      expect(getStructTotalCharge(struct)).toBe(2);
    });

    it('should only sum charges of selected atoms when selection is provided', () => {
      const struct = createMockStruct([
        { charge: 1 },
        { charge: -1 },
        { charge: 2 },
      ]);
      const selection = { atoms: [0, 2] };
      expect(getStructTotalCharge(struct, selection)).toBe(3);
    });

    it('should handle null/undefined charge values', () => {
      const struct = createMockStruct([
        { charge: null },
        { charge: undefined },
        {},
      ]);
      expect(getStructTotalCharge(struct)).toBe(0);
    });

    it('should sum all atoms when selection is null', () => {
      const struct = createMockStruct([{ charge: 1 }, { charge: 1 }]);
      expect(getStructTotalCharge(struct, null)).toBe(2);
    });

    it('should sum all atoms when selection has empty atoms array', () => {
      const struct = createMockStruct([{ charge: 1 }, { charge: 1 }]);
      expect(getStructTotalCharge(struct, { atoms: [] })).toBe(2);
    });
  });

  describe('adjustMassForCharge', () => {
    describe('numeric values (simple molecules)', () => {
      it('should not adjust mass for neutral molecule', () => {
        const struct = createMockStruct([{ charge: 0 }, { charge: 0 }]);
        const result = adjustMassForCharge(17.0265487, struct);
        expect(result).toBe(17.0265487);
      });

      it('should subtract electron mass for +1 charge (cation)', () => {
        const struct = createMockStruct([
          { charge: 1 },
          { charge: 0 },
          { charge: 0 },
          { charge: 0 },
          { charge: 0 },
        ]);
        const neutralMass = 18.0343738;
        const result = adjustMassForCharge(neutralMass, struct);
        expect(result).toBeCloseTo(neutralMass - ELECTRON_MASS_AMU, 10);
      });

      it('should add electron mass for -1 charge (anion)', () => {
        const struct = createMockStruct([{ charge: -1 }, { charge: 0 }]);
        const neutralMass = 35.0;
        const result = adjustMassForCharge(neutralMass, struct);
        expect(result).toBeCloseTo(neutralMass + ELECTRON_MASS_AMU, 10);
      });

      it('should handle +2 charge correctly', () => {
        const struct = createMockStruct([{ charge: 2 }]);
        const neutralMass = 50.0;
        const result = adjustMassForCharge(neutralMass, struct);
        expect(result).toBeCloseTo(neutralMass - 2 * ELECTRON_MASS_AMU, 10);
      });

      it('should verify NH4+ exact mass correction (issue scenario)', () => {
        // NH4+ has 5 atoms: N + 4H, with N having +1 charge
        const struct = createMockStruct([
          { charge: 1 }, // N+
          { charge: 0 }, // H
          { charge: 0 }, // H
          { charge: 0 }, // H
          { charge: 0 }, // H
        ]);
        // Indigo returns monoisotopic mass without charge correction
        const indigoMass = 18.0343738;
        const result = adjustMassForCharge(indigoMass, struct);

        // The corrected mass should be:
        // 18.0343738 - 1 * 0.00054857990946 = 18.03382522...
        // Difference from NH3 (17.0265487) should be ~1.0072765
        // which is the mass of a proton, not a hydrogen atom
        const nh3Mass = 17.0265487;
        const diff = (result as number) - nh3Mass;
        const protonMass = 1.00727647;
        expect(diff).toBeCloseTo(protonMass, 4);
      });

      it('should use selected atoms for charge when selection is provided', () => {
        const struct = createMockStruct([
          { charge: 1 },
          { charge: -1 },
          { charge: 0 },
        ]);
        const selection = { atoms: [0] };
        const neutralMass = 50.0;
        const result = adjustMassForCharge(neutralMass, struct, selection);
        expect(result).toBeCloseTo(neutralMass - ELECTRON_MASS_AMU, 10);
      });
    });

    describe('string values (reactions)', () => {
      it('should not adjust string values without reaction arrow', () => {
        const struct = createMockStruct([{ charge: 1 }]);
        const result = adjustMassForCharge('78.047', struct);
        expect(result).toBe('78.047');
      });

      it('should not adjust reaction masses when all components are neutral', () => {
        const reactant1Atoms = new Set([0, 1]);
        const product1Atoms = new Set([2, 3]);
        const struct = createMockStruct(
          [{ charge: 0 }, { charge: 0 }, { charge: 0 }, { charge: 0 }],
          {
            getComponents: () => ({
              reactants: [reactant1Atoms],
              products: [product1Atoms],
            }),
          },
        );
        const result = adjustMassForCharge('[78.047] > [106.078]', struct);
        expect(result).toBe('[78.047] > [106.078]');
      });

      it('should return original string when component counts do not match', () => {
        const struct = createMockStruct([{ charge: 1 }], {
          getComponents: () => ({
            reactants: [],
            products: [],
          }),
        });
        const result = adjustMassForCharge('[78.047] > [106.078]', struct);
        expect(result).toBe('[78.047] > [106.078]');
      });
    });
  });
});
