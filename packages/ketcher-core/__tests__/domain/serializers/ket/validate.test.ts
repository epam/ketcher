import compiledSchema from 'domain/serializers/ket/compiledSchema';
import { validate } from 'domain/serializers/ket/validate';
import { MULTITAIL_ARROW_SERIALIZE_KEY } from 'domain/constants';
import { MultitailArrow } from 'domain/entities';

jest.mock('domain/serializers/ket/compiledSchema', () => {
  const validateMock = jest.fn() as jest.Mock & {
    errors: Array<unknown> | null;
  };
  validateMock.errors = null;

  return validateMock;
});

describe('validate', () => {
  const mockedCompiledSchema =
    compiledSchema as unknown as jest.Mock & {
      errors: Array<unknown> | null;
    };
  const baseKet = {
    root: {
      nodes: [
        {
          type: MULTITAIL_ARROW_SERIALIZE_KEY,
          data: {},
        },
      ],
    },
  };

  beforeEach(() => {
    mockedCompiledSchema.mockClear();
    mockedCompiledSchema.mockReturnValue(true);
    mockedCompiledSchema.errors = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns false when schema validation fails', () => {
    mockedCompiledSchema.mockReturnValueOnce(false);
    const spy = jest.spyOn(MultitailArrow, 'validateKetNode');

    expect(validate(baseKet)).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });

  it('returns true when multitail arrows are valid', () => {
    const spy = jest
      .spyOn(MultitailArrow, 'validateKetNode')
      .mockReturnValueOnce(null);

    expect(validate(baseKet)).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(mockedCompiledSchema.errors).toBeNull();
  });

  it('attaches detailed error when multitail arrow validation fails', () => {
    const errorMessage = 'INCORRECT_HEAD';
    jest
      .spyOn(MultitailArrow, 'validateKetNode')
      .mockReturnValueOnce(errorMessage);

    expect(validate(baseKet)).toBe(false);
    expect(mockedCompiledSchema.errors).toEqual([
      expect.objectContaining({
        keyword: 'multitailArrow',
        message: `Invalid multitail arrow: ${errorMessage}`,
        params: { error: errorMessage },
      }),
    ]);
  });
});
