import type { StructService } from '../../domain/services';
import type { FormatterFactory } from '../formatters';
import { resetEditorInstance } from '../editor/editorSingleton';
import { Ketcher } from '../ketcher';

describe('Ketcher.getSequence', () => {
  const ketcher = new Ketcher({} as StructService, {} as FormatterFactory);

  beforeEach(() => {
    resetEditorInstance();
  });

  afterEach(() => {
    resetEditorInstance();
  });

  it('rejects when the macromolecules editor is unavailable', async () => {
    await expect(ketcher.getSequence()).rejects.toThrow(
      'Cannot get a sequence because the macromolecules editor is unavailable.',
    );
  });
});
