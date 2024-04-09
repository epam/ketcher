import { renderHook } from '@testing-library/react';
import { MonomerGroups, MonomerItemType, Struct } from 'ketcher-core';
import { useSelector } from 'react-redux';
import { useSequenceEditInRNABuilderMode } from 'hooks';
import useDisabledForSequenceMode from 'components/monomerLibrary/monomerLibraryItem/hooks/useDisabledForSequenceMode';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('../../../../hooks/stateHooks', () => ({
  ...jest.requireActual('../../../../hooks/stateHooks'),
  useSequenceEditInRNABuilderMode: jest.fn(),
}));

const mockUseSequenceEditInRNABuilderMode =
  useSequenceEditInRNABuilderMode as jest.Mock;

const mockUseSelector = useSelector as jest.Mock;

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
    mockUseSequenceEditInRNABuilderMode.mockReturnValue(false);
    const { result } = renderHook(() =>
      useDisabledForSequenceMode(monomer, MonomerGroups.SUGARS),
    );
    expect(result.current).toBe(false);
  });

  describe('for Bases', () => {
    it('should return false if there is R1', () => {
      mockUseSequenceEditInRNABuilderMode.mockReturnValue(true);
      monomer.props.MonomerCaps = { R1: 'H' };
      const { result } = renderHook(() =>
        useDisabledForSequenceMode(monomer, MonomerGroups.BASES),
      );
      expect(result.current).toBe(false);
    });

    it('should return true if there is no R1', () => {
      mockUseSequenceEditInRNABuilderMode.mockReturnValue(true);
      monomer.props.MonomerCaps = {};
      const { result } = renderHook(() =>
        useDisabledForSequenceMode(monomer, MonomerGroups.BASES),
      );
      expect(result.current).toBe(true);
    });
  });

  describe('for Phosphates', () => {
    it('should return false if there is R1 and R2', () => {
      mockUseSequenceEditInRNABuilderMode.mockReturnValue(true);
      monomer.props.MonomerCaps = { R1: 'H', R2: 'H' };
      const { result } = renderHook(() =>
        useDisabledForSequenceMode(monomer, MonomerGroups.PHOSPHATES),
      );
      expect(result.current).toBe(false);
    });

    it('should return true if there is no R1 or R2', () => {
      mockUseSequenceEditInRNABuilderMode.mockReturnValue(true);

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
    it('should return false if there is R2 and R3 and isSequenceFirstsOnlyNucleotidesSelected is true', () => {
      mockUseSequenceEditInRNABuilderMode.mockReturnValue(true);
      mockUseSelector.mockImplementation(() => true);
      monomer.props.MonomerCaps = { R2: 'H', R3: 'H' };
      const { result } = renderHook(() =>
        useDisabledForSequenceMode(monomer, MonomerGroups.SUGARS),
      );
      expect(result.current).toBe(false);
    });

    it('should return true if there is no R2 or R3 and isSequenceFirstsOnlyNucleotidesSelected is true', () => {
      mockUseSequenceEditInRNABuilderMode.mockReturnValue(true);
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

    it('should return false if there is R1, R2, R3 and isSequenceFirstsOnlyNucleotidesSelected is false', () => {
      mockUseSequenceEditInRNABuilderMode.mockReturnValue(true);
      mockUseSelector.mockImplementation(() => false);
      monomer.props.MonomerCaps = { R1: 'H', R2: 'H', R3: 'H' };
      const { result } = renderHook(() =>
        useDisabledForSequenceMode(monomer, MonomerGroups.SUGARS),
      );
      expect(result.current).toBe(false);
    });

    it('should return true if there is no R1 or R2 or R3 and isSequenceFirstsOnlyNucleotidesSelected is false', () => {
      mockUseSequenceEditInRNABuilderMode.mockReturnValue(true);
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
});
