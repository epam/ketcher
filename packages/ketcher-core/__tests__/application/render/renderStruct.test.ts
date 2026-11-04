import { RenderStruct } from 'application/render/renderStruct';
import type { Render } from 'application/render';

const createLabel = (text: string, width: number) => ({
  text,
  path: {
    node: { getBoundingClientRect: () => ({ width }) },
    getBBox: () => ({ x: 10, y: 20, width: 4, height: 6 }),
    transform: jest.fn(),
  },
  background: { transform: jest.fn() },
});

const renderWithLabels = (labels: ReturnType<typeof createLabel>[]) =>
  ({
    ctab: { atoms: new Map(labels.map((label, id) => [id, { label }])) },
  }) as unknown as Render;

describe('RenderStruct.enlargeSmallAttachmentPointLabelsInModal', () => {
  it('enlarges a too small attachment point label and its box around their center (#3737)', () => {
    const label = createLabel('R1', 5);

    RenderStruct.enlargeSmallAttachmentPointLabelsInModal(
      renderWithLabels([label]),
      { labelInMonomerConnectionsModal: true },
    );

    expect(label.path.transform).toHaveBeenCalledWith('...s2,2,12,23');
    expect(label.background.transform).toHaveBeenCalledWith('...s2,2,12,23');
  });

  it.each([
    ['a label of the minimum width', createLabel('R2', 10)],
    ['a label that is not an attachment point', createLabel('C', 5)],
    ['a label that is not laid out', createLabel('R3', 0)],
  ])('keeps %s as it is', (_, label) => {
    RenderStruct.enlargeSmallAttachmentPointLabelsInModal(
      renderWithLabels([label]),
      { labelInMonomerConnectionsModal: true },
    );

    expect(label.path.transform).not.toHaveBeenCalled();
    expect(label.background.transform).not.toHaveBeenCalled();
  });

  it('keeps labels outside of the monomer connections modal as they are', () => {
    const label = createLabel('R1', 5);

    RenderStruct.enlargeSmallAttachmentPointLabelsInModal(
      renderWithLabels([label]),
    );

    expect(label.path.transform).not.toHaveBeenCalled();
  });
});
