import { Struct } from 'ketcher-core';
import type { Template } from '../dialog/template/TemplateTable';
import { filterLib } from './index';

describe('runtime template group names', () => {
  it.each(['constructor', '__proto__', 'toString', 'hasOwnProperty'])(
    'groups and filters templates named %s without inherited object properties',
    (group) => {
      const templates: Template[] = ['Water', 'Ethanol'].map((name) => ({
        struct: Object.assign(new Struct(), { name }),
        props: { atomid: 0, bondid: 0, group, name },
      }));

      const result = filterLib(templates, '');

      expect(Object.keys(result)).toEqual([group]);
      expect(result[group]).toEqual(templates);
      expect(filterLib(templates, 'Water')[group]).toEqual([templates[0]]);
    },
  );
});
