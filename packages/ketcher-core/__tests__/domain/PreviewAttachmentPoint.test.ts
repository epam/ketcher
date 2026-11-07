import { resetEditorEvents } from 'application/editor/editorEvents';
import { resetEditorInstance } from 'application/editor/editorSingleton';
import { UsageInMacromolecule } from 'application/render';
import { AttachmentPointName } from 'domain/types';
import {
  buildPreviewAttachmentPoint,
  installMonomerHitTest,
  uninstallMonomerHitTest,
} from './helpers/buildAttachmentPoint';

const { MonomerPreview, MonomerConnectionsModal, BondPreview } =
  UsageInMacromolecule;

interface LabelColors {
  rectFill: string;
  rectStroke: string;
  textFill: string;
}

const free = { rectFill: '#FFF', rectStroke: '#7C7C7F', textFill: '#585858' };
const connectedGray = {
  rectFill: '#E1E5EA',
  rectStroke: '#B4B9D6',
  textFill: '#B4B9D6',
};

// Expected colors written out from the requirement: free label is white with
// a gray border, a connected one is grayed out, a selected one is highlighted
// where the usage has a highlight. The preview usages draw no border.
const cases: Array<{
  usage: UsageInMacromolecule;
  usageName: string;
  selected: boolean;
  connected: boolean;
  expected: LabelColors;
}> = [
  {
    usage: MonomerPreview,
    usageName: 'MonomerPreview',
    selected: false,
    connected: false,
    expected: { ...free, rectStroke: 'none' },
  },
  {
    usage: MonomerPreview,
    usageName: 'MonomerPreview',
    selected: false,
    connected: true,
    expected: { ...connectedGray, rectStroke: 'none' },
  },
  {
    usage: MonomerPreview,
    usageName: 'MonomerPreview',
    selected: true,
    connected: false,
    expected: { ...free, rectStroke: 'none' },
  },
  {
    usage: MonomerPreview,
    usageName: 'MonomerPreview',
    selected: true,
    connected: true,
    expected: { ...connectedGray, rectStroke: 'none' },
  },
  {
    usage: MonomerConnectionsModal,
    usageName: 'MonomerConnectionsModal',
    selected: false,
    connected: false,
    expected: free,
  },
  {
    usage: MonomerConnectionsModal,
    usageName: 'MonomerConnectionsModal',
    selected: false,
    connected: true,
    expected: connectedGray,
  },
  {
    usage: MonomerConnectionsModal,
    usageName: 'MonomerConnectionsModal',
    selected: true,
    connected: false,
    expected: {
      rectFill: '#167782',
      rectStroke: '#7C7C7F',
      textFill: '#FFF',
    },
  },
  {
    usage: MonomerConnectionsModal,
    usageName: 'MonomerConnectionsModal',
    selected: true,
    connected: true,
    expected: {
      rectFill: '#167782',
      rectStroke: '#7C7C7F',
      textFill: '#FFF',
    },
  },
  {
    usage: BondPreview,
    usageName: 'BondPreview',
    selected: false,
    connected: false,
    expected: { ...free, rectStroke: 'none' },
  },
  {
    usage: BondPreview,
    usageName: 'BondPreview',
    selected: false,
    connected: true,
    expected: { ...connectedGray, rectStroke: 'none' },
  },
  {
    usage: BondPreview,
    usageName: 'BondPreview',
    selected: true,
    connected: false,
    expected: { ...free, rectFill: '#CDF1FC', rectStroke: 'none' },
  },
  {
    usage: BondPreview,
    usageName: 'BondPreview',
    selected: true,
    connected: true,
    expected: { ...free, rectFill: '#CDF1FC', rectStroke: 'none' },
  },
];

describe('PreviewAttachmentPoint', () => {
  beforeEach(() => {
    installMonomerHitTest();
  });

  afterEach(() => {
    uninstallMonomerHitTest();
    resetEditorInstance();
    resetEditorEvents();
    document.body.replaceChildren();
  });

  it.each(cases)(
    'colors the label for $usageName, selected $selected, connected $connected',
    ({ usage, selected, connected, expected }) => {
      const { rootElement } = buildPreviewAttachmentPoint({
        attachmentPointName: AttachmentPointName.R2,
        usage,
        selected,
        connected,
      });
      const root = rootElement.node() as SVGElement;
      const rect = root.querySelector('rect');
      const text = root.querySelector('text');

      expect(rect?.getAttribute('fill')).toBe(expected.rectFill);
      expect(rect?.getAttribute('stroke')).toBe(expected.rectStroke);
      expect(text?.getAttribute('fill')).toBe(expected.textFill);
      expect(text?.textContent).toBe('R2');
    },
  );

  it('draws the label as a 20x16 rounded rectangle after a line', () => {
    const { rootElement } = buildPreviewAttachmentPoint();
    const root = rootElement.node() as SVGElement;
    const rect = root.querySelector('rect');

    expect(root.querySelector('line')).not.toBeNull();
    expect(rect?.getAttribute('width')).toBe('20');
    expect(rect?.getAttribute('height')).toBe('16');
    expect(rect?.getAttribute('rx')).toBe('4');
    expect(root.querySelector('circle')).toBeNull();
  });
});
