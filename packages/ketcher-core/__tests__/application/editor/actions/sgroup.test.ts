import { SGroup } from 'domain/entities';

describe('sgroup expand/collapse validation', () => {
  describe('isSuperatomWithoutLabel', () => {
    it('should return true for superatom s-group without name or class', () => {
      const sGroup = new SGroup('SUP');
      sGroup.data.name = '';
      sGroup.data.class = '';

      expect(sGroup.isSuperatomWithoutLabel).toBe(true);
    });

    it('should return false for superatom s-group with a name', () => {
      const sGroup = new SGroup('SUP');
      sGroup.data.name = 'TestGroup';
      sGroup.data.class = '';

      expect(sGroup.isSuperatomWithoutLabel).toBe(false);
    });

    it('should return false for superatom s-group with a class', () => {
      const sGroup = new SGroup('SUP');
      sGroup.data.name = '';
      sGroup.data.class = 'SUGAR';

      expect(sGroup.isSuperatomWithoutLabel).toBe(false);
    });

    it('should return false for superatom s-group with both name and class', () => {
      const sGroup = new SGroup('SUP');
      sGroup.data.name = 'TestGroup';
      sGroup.data.class = 'SUGAR';

      expect(sGroup.isSuperatomWithoutLabel).toBe(false);
    });

    it('should return false for non-superatom s-group', () => {
      const sGroup = new SGroup('DAT');
      sGroup.data.name = '';
      sGroup.data.class = '';

      expect(sGroup.isSuperatomWithoutLabel).toBe(false);
    });
  });
});
