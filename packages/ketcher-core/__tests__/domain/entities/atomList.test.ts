import { AtomList, AtomListParams } from 'domain/entities/atomList';

const ids = [66, 44, 12, 88];
const createParams = (overrides?: Partial<AtomListParams>): AtomListParams => {
  const { ids: overrideIds, ...restOverrides } = overrides ?? {};

  return {
    notList: false,
    ids: overrideIds ?? [...ids],
    ...restOverrides,
  };
};

describe('labelList', () => {
  it('should return array of elements labels', () => {
    const atomList = new AtomList(createParams());

    expect(atomList.labelList()).toStrictEqual(['Dy', 'Ru', 'Mg', 'Ra']);
  });
});

describe('label', () => {
  it('should return list', () => {
    const atomList = new AtomList(createParams());

    expect(atomList.label()).toBe('[Dy,Ru,Mg,Ra]');
  });

  it('should return not list', () => {
    const atomList = new AtomList(createParams({ notList: true }));

    expect(atomList.label()).toBe('![Dy,Ru,Mg,Ra]');
  });
});
describe('equals', () => {
  it.each([false, true])('should return true', (notList) => {
    const atomList = new AtomList(createParams({ notList }));
    const dataWithReverseIds = {
      notList,
      ids: [...ids].sort((a, b) => a - b).reverse(),
    };
    const atomList2 = new AtomList(dataWithReverseIds);

    expect(atomList.equals(atomList2)).toBeTruthy();
  });

  it('should return false', () => {
    const atomList = new AtomList(createParams());
    const dataWithReverseIds = {
      notList: true,
      ids: [...ids].sort((a, b) => a - b).reverse(),
    };
    const atomList2 = new AtomList(dataWithReverseIds);

    expect(atomList.equals(atomList2)).toBeFalsy();
  });
});
