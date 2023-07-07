import { AssertionError } from 'assert';
import { Editor } from 'application/editor';
import { FormatterFactory } from 'application/formatters';
import { Ketcher } from 'application/ketcher';
import { StructService } from 'domain/services';
import { mock } from 'jest-mock-extended';

describe('contructor()', () => {
  it('should throw exception when editor is null', () => {
    const editor: Editor = null as unknown as Editor;
    const structService: StructService = mock<StructService>();
    const formatterFactory: FormatterFactory = mock<FormatterFactory>();

    expect(
      () => new Ketcher(editor, structService, formatterFactory)
    ).toThrowError(AssertionError);
  });

  it('should throw exception when structService is null', () => {
    const editor: Editor = mock<Editor>();
    const structService: StructService = null as unknown as StructService;
    const formatterFactory: FormatterFactory = mock<FormatterFactory>();

    expect(
      () => new Ketcher(editor, structService, formatterFactory)
    ).toThrowError(AssertionError);
  });

  it('should throw exception when formatterFacory is null', () => {
    const editor: Editor = mock<Editor>();
    const structService: StructService = mock<StructService>();
    const formatterFactory: FormatterFactory =
      null as unknown as FormatterFactory;

    expect(
      () => new Ketcher(editor, structService, formatterFactory)
    ).toThrowError(AssertionError);
  });
});
