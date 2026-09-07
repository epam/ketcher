import { renderHook } from '@testing-library/react';
import { MonomerGroups, MonomerItemType, Struct } from 'ketcher-core';
import { useSelector } from 'react-redux';
import { useAppSelector } from 'hooks';
import useDisabledForSequenceMode from 'components/monomerLibrary/monomerLibraryItem/hooks/useDisabledForSequenceMode';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('hooks', () => ({
  useAppSelector: jest.fn(),
}));

const mockUseSelector = jest.mocked(useSelector);
const mockUseAppSelector = jest.mocked(useAppSelector);

const monomer: MonomerItemType = {
  label: 'for test',
  props: {
    MonomerCaps: {},
    MonomerName: 'test',
    MonomerNaturalAnalogCode: 'test',
    Name: 'test',
  },
  struct: new Struct(),
};

describe('useDisabledForSequenceMode hook', () => {
  it('should return false if isSequenceEditInRNABuilderMode is false', () => {
    mockUseAppSelector.mockReturnValue(false);
    const { result } = renderHook(() =>
      useDisabledForSequenceMode(monomer, MonomerGroups.SUGARS),
    );
    expect(result.current).toBe(false);
  });

  describe('for Bases', () => {
    it('should return false if there is R1', () => {
      mockUseAppSelector.mockReturnValue(true);
      monomer.props.MonomerCaps = { R1: 'H' };
      const { result } = renderHook(() =>
        useDisabledForSequenceMode(monomer, MonomerGroups.BASES),
      );
      expect(result.current).toBe(false);
    });

    it('should return true if there is no R1', () => {
      mockUseAppSelector.mockReturnValue(true);
      monomer.props.MonomerCaps = {};
      const { result } = renderHook(() =>
        useDisabledForSequenceMode(monomer, MonomerGroups.BASES),
      );
      expect(result.current).toBe(true);
    });
  });

  describe('for Phosphates', () => {
    it('should return false if there is R1 and R2', () => {
      mockUseAppSelector.mockReturnValue(true);
      monomer.props.MonomerCaps = { R1: 'H', R2: 'H' };
      const { result } = renderHook(() =>
        useDisabledForSequenceMode(monomer, MonomerGroups.PHOSPHATES),
      );
      expect(result.current).toBe(false);
    });

    it('should return true if there is no R1 or R2', () => {
      mockUseAppSelector.mockReturnValue(true);
      // Without R2
      monomer.props.MonomerCaps = { R1: 'H' };
      const { result: result1 } = renderHook(() =>
        useDisabledForSequenceMode(monomer, MonomerGroups.PHOSPHATES),
      );
      expect(result1.current).toBe(true);

      // Without R1
      monomer.props.MonomerCaps = { R2: 'H' };
      const { result: result2 } = renderHook(() =>
        useDisabledForSequenceMode(monomer, MonomerGroups.PHOSPHATES),
      );
      expect(result2.current).toBe(true);
    });
  });

  describe('for Sugars', () => {
    it('should return false if there is R2 and R3 and isSequenceFirstsOnlyNucleoelementsSelected is true', () => {
      mockUseAppSelector.mockReturnValue(true);
      mockUseSelector.mockImplementation(() => true);
      monomer.props.MonomerCaps = { R2: 'H', R3: 'H' };
      const { result } = renderHook(() =>
        useDisabledForSequenceMode(monomer, MonomerGroups.SUGARS),
      );
      expect(result.current).toBe(false);
    });

    it('should return true if there is no R2 or R3 and isSequenceFirstsOnlyNucleoelementsSelected is true', () => {
      mockUseAppSelector.mockReturnValue(true);
      mockUseSelector.mockImplementation(() => true);
      monomer.props.MonomerCaps = { R2: 'H' };

      // Without R3
      const { result: result1 } = renderHook(() =>
        useDisabledForSequenceMode(monomer, MonomerGroups.SUGARS),
      );
      expect(result1.current).toBe(true);

      // Without R2
      monomer.props.MonomerCaps = { R3: 'H' };
      const { result: result2 } = renderHook(() =>
        useDisabledForSequenceMode(monomer, MonomerGroups.SUGARS),
      );
      expect(result2.current).toBe(true);
    });

    it('should return false if there is R1, R2, R3 and isSequenceFirstsOnlyNucleoelementsSelected is false', () => {
      mockUseAppSelector.mockReturnValue(true);
      mockUseSelector.mockImplementation(() => false);
      monomer.props.MonomerCaps = { R1: 'H', R2: 'H', R3: 'H' };
      const { result } = renderHook(() =>
        useDisabledForSequenceMode(monomer, MonomerGroups.SUGARS),
      );
      expect(result.current).toBe(false);
    });

    it('should return true if there is no R1 or R2 or R3 and isSequenceFirstsOnlyNucleoelementsSelected is false', () => {
      mockUseAppSelector.mockReturnValue(true);
      mockUseSelector.mockImplementation(() => true);

      // Without R3
      monomer.props.MonomerCaps = { R1: 'H', R2: 'H' };
      const { result: result1 } = renderHook(() =>
        useDisabledForSequenceMode(monomer, MonomerGroups.SUGARS),
      );
      expect(result1.current).toBe(true);

      // Without R2
      monomer.props.MonomerCaps = { R1: 'H', R3: 'H' };
      const { result: result2 } = renderHook(() =>
        useDisabledForSequenceMode(monomer, MonomerGroups.SUGARS),
      );
      expect(result2.current).toBe(true);

      // Without R3
      monomer.props.MonomerCaps = { R1: 'H', R2: 'H' };
      const { result: result3 } = renderHook(() =>
        useDisabledForSequenceMode(monomer, MonomerGroups.SUGARS),
      );
      expect(result3.current).toBe(true);
    });
  });

  describe('for groups without RNA builder restrictions', () => {
    // The RNA builder renders ambiguous monomers through a MonomerGroup that
    // passes no groupName, so this branch is reached while
    // isSequenceEditInRNABuilderMode is true. Nothing may be disabled there,
    // regardless of which caps the monomer happens to carry.
    it('should return false if there is no groupName', () => {
      mockUseAppSelector.mockReturnValue(true);
      mockUseSelector.mockImplementation(() => true);
      monomer.props.MonomerCaps = {};
      const { result } = renderHook(() => useDisabledForSequenceMode(monomer));
      expect(result.current).toBe(false);
    });

    it('should return false for a group the RNA builder does not restrict', () => {
      mockUseAppSelector.mockReturnValue(true);
      mockUseSelector.mockImplementation(() => true);
      monomer.props.MonomerCaps = {};
      const { result } = renderHook(() =>
        useDisabledForSequenceMode(monomer, MonomerGroups.PEPTIDES),
      );
      expect(result.current).toBe(false);
    });
  });
});
