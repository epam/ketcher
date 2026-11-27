import { CoreEditor } from 'application/editor/Editor';
import {
  getModeConstructor,
  registerMode,
} from 'application/editor/modes/modesRegistry';
import type { LayoutMode } from 'application/editor/modes/types';
import type { BaseMode } from 'application/editor/modes/BaseMode';

describe('computed property checks', () => {
  it('groups modification types under prototype-shaped analogue codes', () => {
    const editor = {
      monomersLibrary: [
        {
          props: {
            MonomerNaturalAnalogCode: '__proto__',
            modificationTypes: ['Other', 'Natural amino acid'],
          },
        },
        {
          props: {
            MonomerNaturalAnalogCode: 'constructor',
            modificationTypes: ['Other', 'Other'],
          },
        },
        { props: { modificationTypes: ['First'] } },
        {
          props: {
            MonomerNaturalAnalogCode: 'undefined',
            modificationTypes: ['Second'],
          },
        },
      ],
    } as unknown as CoreEditor;

    const result =
      CoreEditor.prototype.getAllAminoAcidsModificationTypesGroupedByNaturalAnalogue.call(
        editor,
      );

    expect(Object.keys(result)).toEqual([
      '__proto__',
      'constructor',
      'undefined',
    ]);
    expect(result.__proto__).toEqual(['Natural amino acid', 'Other']);
    expect(result.constructor).toEqual(['Other']);
    expect(result.undefined).toEqual(['First', 'Second']);
  });

  it('dispatches inherited tool handlers', () => {
    const handler = vi.fn();
    class ToolWithInheritedHandler {
      click(event: unknown) {
        handler(event);
      }
    }
    class DerivedTool extends ToolWithInheritedHandler {}
    const tool = new DerivedTool();
    const event = { target: {} };
    const editor = {
      tool,
      canvas: { contains: () => true },
    } as unknown as CoreEditor;

    expect(
      CoreEditor.prototype['useToolIfNeeded'].call(editor, 'click', event),
    ).toBe(true);
    expect(handler).toHaveBeenCalledWith(event);
  });

  it('does not confuse prototype names with registered modes', () => {
    const mode = '__proto__' as LayoutMode;
    const ctor = class {} as unknown as new () => BaseMode;

    expect(() => getModeConstructor(mode)).toThrow('is not registered');
    registerMode(mode, ctor);
    expect(getModeConstructor(mode)).toBe(ctor);
    expect(() => registerMode(mode, ctor)).not.toThrow();
    expect(() => registerMode(mode, class {} as new () => BaseMode)).toThrow(
      'is already registered',
    );
  });
});
