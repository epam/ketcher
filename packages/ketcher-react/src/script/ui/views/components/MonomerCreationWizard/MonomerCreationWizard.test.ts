import { type Mock } from 'vitest';
import {
  KetMonomerClass,
  type MonomerItemType,
  provideEditorInstance,
  Struct,
} from 'ketcher-core';
import { validateInputs } from './MonomerCreationWizard';
import { NotificationMessages } from './MonomerCreationWizard.constants';
import type { WizardValues } from './MonomerCreationWizard.types';

vi.mock('ketcher-core', async () => ({
  ...(await vi.importActual('ketcher-core')),
  provideEditorInstance: vi.fn(),
}));

const libraryItem = (
  props: Partial<MonomerItemType['props']>,
): MonomerItemType => ({
  label: 'M',
  struct: new Struct(),
  props: { MonomerClass: KetMonomerClass.CHEM, ...props },
});

const valuesWith = (aliasAxoLabs: string): WizardValues => ({
  type: KetMonomerClass.CHEM,
  symbol: 'Sym',
  name: 'Name',
  naturalAnalogue: '',
  aliasHELM: '',
  aliasBILN: '',
  aliasAxoLabs,
});

describe('validateInputs AxoLabs alias', () => {
  const mockEditor = (
    monomersLibrary: MonomerItemType[] = [],
    monomersLibraryParsedJson: object = {},
  ) =>
    (provideEditorInstance as Mock).mockReturnValue({
      monomersLibrary,
      monomersLibraryParsedJson,
    });

  beforeEach(() => mockEditor());

  it('accepts an empty alias', () => {
    const { errors, notifications } = validateInputs(valuesWith(''));
    expect(errors.aliasAxoLabs).toBeUndefined();
    expect(notifications.size).toBe(0);
  });

  it.each([
    ['a b', 'invalidAxoLabsAlias'],
    ['ab(c', 'axoLabsAliasBracket'],
    ['a'.repeat(7), 'axoLabsAliasTooLong'],
  ] as const)('reports %s as %s', (alias, notificationId) => {
    const { errors, notifications } = validateInputs(valuesWith(alias));
    expect(errors.aliasAxoLabs).toBe(true);
    expect(notifications.get(notificationId)?.message).toBe(
      NotificationMessages[notificationId],
    );
  });

  it('reports a collision with a library monomer, ignoring brackets', () => {
    mockEditor([libraryItem({ aliasAxoLabs: '(abc)' })]);
    const { errors, notifications } = validateInputs(valuesWith('abc'));
    expect(errors.aliasAxoLabs).toBe(true);
    expect(notifications.has('notUniqueAxoLabsAlias')).toBe(true);
  });

  it('reports a collision with an RNA preset', () => {
    mockEditor([], {
      'monomerGroupTemplate-dA': {
        type: 'monomerGroupTemplate',
        aliasAxoLabs: 'dA',
      },
    });
    expect(validateInputs(valuesWith('dA')).errors.aliasAxoLabs).toBe(true);
  });

  it('does not collide with the monomer being edited', () => {
    const edited = libraryItem({ aliasAxoLabs: '(abc)' });
    mockEditor([edited]);
    const { errors } = validateInputs(valuesWith('abc'), false, false, edited);
    expect(errors.aliasAxoLabs).toBeUndefined();
  });

  it('skips the uniqueness check when asked, keeping the format check', () => {
    mockEditor([libraryItem({ aliasAxoLabs: 'abc' })]);
    expect(
      validateInputs(valuesWith('abc'), true).errors.aliasAxoLabs,
    ).toBeUndefined();
    expect(validateInputs(valuesWith('ab(c'), true).errors.aliasAxoLabs).toBe(
      true,
    );
  });
});
