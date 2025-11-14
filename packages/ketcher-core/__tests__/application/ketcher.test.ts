
// eslint-disable-next-line jest/no-export
export {};

// skipped until cyclic reference is resolved
describe.skip('contructor()', () => {
  it('should throw exception when editor is null', () => {
    //
    //   () => new Ketcher(editor, structService, formatterFactory),
    // ).toThrowError(AssertionError);
  });

  it('should throw exception when structService is null', () => {
    //
    //   () => new Ketcher(editor, structService, formatterFactory),
    // ).toThrowError(AssertionError);
  });

  it('should throw exception when formatterFacory is null', () => {
    //   null as unknown as FormatterFactory;
    //
    //   () => new Ketcher(editor, structService, formatterFactory),
    // ).toThrowError(AssertionError);
  });
});
