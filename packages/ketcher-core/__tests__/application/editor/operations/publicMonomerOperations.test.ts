import * as ketcherCore from '../../../../src';
import * as operationsApi from 'application/editor/operations';
import * as domainMonomerOperations from 'domain/operations/monomer';

// The six monomer operations moved to domain/operations, and the two mode
// operations stayed. All eight stay public through the package entry.
const MOVED_OPERATION_NAMES = [
  'AttachmentPointHoverOperation',
  'MonomerAddOperation',
  'MonomerDeleteOperation',
  'MonomerHoverOperation',
  'MonomerItemModifyOperation',
  'MonomerMoveOperation',
] as const;

const PUBLIC_OPERATION_NAMES = [
  ...MOVED_OPERATION_NAMES,
  'ReinitializeModeOperation',
  'RestoreSequenceCaretPositionOperation',
] as const;

describe('public macromolecule operations', () => {
  it.each(PUBLIC_OPERATION_NAMES)(
    'the package entry exports %s as a class',
    (name) => {
      expect(typeof ketcherCore[name]).toBe('function');
    },
  );

  it.each(PUBLIC_OPERATION_NAMES)(
    'application/editor/operations exports the same %s',
    (name) => {
      expect(operationsApi[name]).toBe(ketcherCore[name]);
    },
  );

  it.each(MOVED_OPERATION_NAMES)(
    'application/editor/operations re-exports %s from domain/operations',
    (name) => {
      expect(operationsApi[name]).toBe(domainMonomerOperations[name]);
    },
  );
});
