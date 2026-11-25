import { vi, type Mock } from 'vitest';
import { FormatterFactory } from '../../src/application/formatters';
import { Ketcher } from '../../src/application/ketcher';
import * as applicationUtils from '../../src/application/utils';
import { Struct } from '../../src/domain/entities/struct';
import type { StructService } from '../../src/domain/services';

describe('Ketcher.addTemplate', () => {
  let ketcher: Ketcher;
  let struct: Struct;
  let onTemplate: Mock<(event: Event) => void>;

  beforeEach(() => {
    const structService = {} as StructService;
    ketcher = new Ketcher(structService, new FormatterFactory(structService));
    struct = new Struct();
    vi.spyOn(applicationUtils, 'prepareStructToRender').mockResolvedValue(
      struct,
    );
    onTemplate = vi.fn();
    window.addEventListener('KETCHER_ADD_TEMPLATE', onTemplate);
  });

  afterEach(() => {
    window.removeEventListener('KETCHER_ADD_TEMPLATE', onTemplate);
    vi.restoreAllMocks();
  });

  it('parses the structure and publishes a named user template without calling setMolecule', async () => {
    const setMolecule = vi.spyOn(ketcher, 'setMolecule');

    await ketcher.addTemplate('C1CC1', '  Cyclopropane  ');

    expect(applicationUtils.prepareStructToRender).toHaveBeenCalledWith(
      'C1CC1',
      ketcher.structService,
      ketcher,
    );
    expect(onTemplate).toHaveBeenCalledTimes(1);
    expect(onTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          struct,
          props: { group: 'User Templates', name: 'Cyclopropane' },
        },
      }),
    );
    expect(struct.name).toBe('Cyclopropane');
    expect(setMolecule).not.toHaveBeenCalled();
  });

  it('preserves a custom template group', async () => {
    await ketcher.addTemplate('C1CC1', 'Cyclopropane', 'DB Templates');

    expect(onTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({
          props: expect.objectContaining({ group: 'DB Templates' }),
        }),
      }),
    );
  });

  it('provides the display name required by salts and solvents templates', async () => {
    await ketcher.addTemplate('O', '  Water  ', 'Salts and Solvents');

    expect(onTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({
          props: { group: 'Salts and Solvents', name: 'Water' },
        }),
      }),
    );
  });

  it('waits for parsing before publishing the template', async () => {
    const { promise, resolve: finishParsing } = Promise.withResolvers<Struct>();
    vi.mocked(applicationUtils.prepareStructToRender).mockReturnValue(promise);

    const pending = ketcher.addTemplate('C1CC1', 'Cyclopropane');
    expect(onTemplate).not.toHaveBeenCalled();
    finishParsing(struct);
    await pending;

    expect(onTemplate).toHaveBeenCalledTimes(1);
  });

  it.each(['', null, undefined, 42])(
    'rejects an invalid structure (%p) without publishing a template',
    async (structure) => {
      await expect(
        ketcher.addTemplate(structure as string, 'Cyclopropane'),
      ).rejects.toThrow('Template structure is required');

      expect(applicationUtils.prepareStructToRender).not.toHaveBeenCalled();
      expect(onTemplate).not.toHaveBeenCalled();
    },
  );

  it.each(['', '   ', '\t\n', null, undefined, 42])(
    'rejects an invalid name (%p) without publishing a template',
    async (name) => {
      await expect(
        ketcher.addTemplate('C1CC1', name as string),
      ).rejects.toThrow('Template name is required');

      expect(applicationUtils.prepareStructToRender).not.toHaveBeenCalled();
      expect(onTemplate).not.toHaveBeenCalled();
    },
  );

  it.each([[42], [true], [null], [{}], [[]]])(
    'rejects a non-string group (%p) before parsing',
    async (group) => {
      await expect(
        ketcher.addTemplate('O', 'Water', group as unknown as string),
      ).rejects.toThrow('Template group must be a string');
      expect(applicationUtils.prepareStructToRender).not.toHaveBeenCalled();
      expect(onTemplate).not.toHaveBeenCalled();
    },
  );

  it('propagates parsing errors without publishing a template', async () => {
    const error = new Error('Invalid structure');
    vi.mocked(applicationUtils.prepareStructToRender).mockRejectedValue(error);

    await expect(ketcher.addTemplate('invalid', 'Broken')).rejects.toBe(error);

    expect(onTemplate).not.toHaveBeenCalled();
  });
});
