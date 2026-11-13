import { filterFGLib, filterLib } from './index';
import type { Template } from '../dialog/template/TemplateTable';

describe.each([filterLib, filterFGLib])('library grouping (%#)', (filter) => {
  it.each(['constructor', 'toString', ''])(
    'creates an own group for the name %p',
    (group) => {
      const template = {
        struct: { name: 'Carbon' },
        props: { group, abbreviation: 'C' },
      } as Template;

      const result = filter([template], '');

      expect(Object.hasOwn(result, group)).toBe(true);
      expect(result[group]).toEqual([template]);
    },
  );
});
