import Dfs from '../dfs';
import { Struct } from 'domain/entities';

const struct = new Struct();
const atomData = new Array(struct.atoms.size);
const components = struct.getComponents();
const componentsAll = components.reactants.concat(components.products);

const dfs = new Dfs(
  struct,
  atomData,
  componentsAll,
  components.reactants.length,
);

describe('Dfs', () => {
  describe('edgeClosingCycle method', () => {
    it('should return false if no cycles in structure', () => {
      dfs.edges = [{ closing_cycle: 0, opening_cycles: 0 }];
      const eIdx = 0;
      expect(dfs.edgeClosingCycle(eIdx)).toBe(false);
    });

    it('should return true if is cycles in structure', () => {
      dfs.edges = [{ closing_cycle: 1, opening_cycles: 0 }];
      const eIdx = 0;
      expect(dfs.edgeClosingCycle(eIdx)).toBe(true);
    });
  });

  describe('numBranches method', () => {
    it('should return number of branches', () => {
      dfs.vertices = [{ branches: 1 }];
      const vIdx = 0;
      expect(dfs.numBranches(vIdx)).toBe(1);
    });
  });

  describe('toString method', () => {
    it('should return * if no structure', () => {
      const str = dfs.toString();
      expect(str).toBe('*');
    });

    it('should return string', () => {
      dfs.v_seq = [{ idx: 0 }, { idx: 1 }];
      const str = dfs.toString();
      expect(str).toBe('0 -> 1 -> *');
    });
  });

  describe('numOpeningCycles method', () => {
    it('should return number of opening cycles', () => {
      let eIdx = 0;
      expect(dfs.numOpeningCycles(eIdx)).toBe(0);
      eIdx = 1;
      dfs.edges = [{}, { closing_cycle: 0, opening_cycles: 3 }];
      expect(dfs.numOpeningCycles(eIdx)).toBe(3);
    });
  });
});
