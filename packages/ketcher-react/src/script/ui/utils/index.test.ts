import type { Template } from '../dialog/template/TemplateTable';
import { filterFGLib, filterLib } from './index';

describe.each([filterLib, filterFGLib])('template grouping', (filter) => {
  it('groups prototype-named keys as ordinary own properties', () => {
    const makeTemplate = (group: string) =>
      ({
        struct: { name: 'template' },
        props: { group, name: 'template' },
      }) as Template;
    const templates = [
      makeTemplate('toString'),
      makeTemplate('__proto__'),
      makeTemplate('toString'),
    ];

    const groups = filter(templates, '');

    expect(Object.hasOwn(groups, 'toString')).toBe(true);
    expect(Object.hasOwn(groups, '__proto__')).toBe(true);
    expect(groups.toString).toEqual([templates[0], templates[2]]);
    expect(groups.__proto__).toEqual([templates[1]]);
    expect(Object.getPrototypeOf(groups)).toBe(Object.prototype);
  });
});
