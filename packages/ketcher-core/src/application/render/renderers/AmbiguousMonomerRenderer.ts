import { Selection } from 'd3';
import { BaseMonomerRenderer } from 'application/render/renderers';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import { MONOMER_SYMBOLS_IDS } from 'application/render/renderers/constants';
import { monomerFactory } from 'application/editor';
import { EmptyMonomer } from 'domain/entities/EmptyMonomer';
import { AttachmentPointName } from 'domain/types';
import { PreviewAttachmentPoint } from 'domain/PreviewAttachmentPoint';
import { UsageInMacromolecule } from 'application/render';

const NUMBER_OF_MONOMERS_CIRCLE_Y_OFFSET = 7;

type PreviewAttachmentPointParams = {
  usage: UsageInMacromolecule;
  selectedAttachmentPoint: string | null | undefined;
  connectedAttachmentPoints: string[] | undefined;
};

export class AmbiguousMonomerRenderer extends BaseMonomerRenderer {
  private monomerRenderer: BaseMonomerRenderer;
  private monomerSymbolElementsIds: {
    selected: string;
    hover: string;
    body: string;
    variant?: string;
  };

  constructor(public monomer: AmbiguousMonomer, scale?: number) {
    const monomerClass = AmbiguousMonomer.getMonomerClass(monomer.monomers);
    const monomerSymbolElementsIds = MONOMER_SYMBOLS_IDS[monomerClass];

    super(
      monomer,
      monomerSymbolElementsIds.selected,
      monomerSymbolElementsIds.hover,
      monomerSymbolElementsIds.body,
      scale,
    );

    const [, MonomerRenderer] = monomerFactory(
      this.monomer.monomers[0].monomerItem,
    );

    this.monomerRenderer = new MonomerRenderer(new EmptyMonomer());
    this.monomerSymbolElementsIds = monomerSymbolElementsIds;
    this.CHAIN_BEGINNING = this.monomerRenderer.CHAIN_BEGINNING;
  }

  protected appendBody(
    rootElement: Selection<SVGGElement, void, HTMLElement, never>,
  ) {
    return rootElement
      .append('use')
      .data([this])
      .attr(
        'href',
        this.monomerSymbolElementsIds.variant ||
          this.monomerSymbolElementsIds.body,
      )
      .attr('fill', '#fff')
      .attr('stroke', '#585858')
      .attr('stroke-width', '1px')
      .attr('paint-order', 'fill');
  }

  public get enumerationElementPosition() {
    return this.monomerRenderer.enumerationElementPosition;
  }

  public get beginningElementPosition() {
    return this.monomerRenderer.beginningElementPosition;
  }

  private appendNumberOfMonomers() {
    const isMonomersAmountTenOrMore = this.monomer.monomers.length >= 10;
    const numberOfMonomersElement = this.rootElement
      ?.append('g')
      .attr(
        'transform',
        `translate(${
          this.center.x -
          this.scaledMonomerPosition.x -
          (isMonomersAmountTenOrMore ? 2 : 0)
        }, ${
          this.center.y -
          this.scaledMonomerPosition.y +
          NUMBER_OF_MONOMERS_CIRCLE_Y_OFFSET
        })`,
      )
      .attr('pointer-events', 'none');

    numberOfMonomersElement
      ?.append('foreignObject')
      .attr('width', '20px')
      .attr('height', '20px')
      .attr('x', isMonomersAmountTenOrMore ? '-3' : '-4')
      .attr('y', '-4')
      .append('xhtml:div')
      .attr(
        'style',
        `
        width: ${isMonomersAmountTenOrMore ? '10px' : '8px'};
        height: 8px;
        border-radius: ${isMonomersAmountTenOrMore ? '20px' : '50%'};
        border: 0.5px solid #cceaee;
      `,
      );

    numberOfMonomersElement
      ?.append('text')
      .attr('x', -1.6)
      .attr('y', 2.1)
      .attr('font-size', '6px')
      .attr('font-weight', 300)
      .text(this.monomer.monomers.length);
  }

  public show(theme) {
    super.show(theme);
    this.appendNumberOfMonomers();
    this.appendEnumeration();
    if (this.CHAIN_BEGINNING) {
      this.appendChainBeginning();
    }
  }

  private appendPreviewAttachmentPoint(
    params: PreviewAttachmentPointParams,
    attachmentPointName: AttachmentPointName,
    customAngle?: number,
  ) {
    const { selectedAttachmentPoint, connectedAttachmentPoints, usage } =
      params;
    const attachmentPointParams = this.prepareAttachmentPointsParams(
      attachmentPointName,
      customAngle,
    );

    return new PreviewAttachmentPoint({
      ...attachmentPointParams,
      connected:
        connectedAttachmentPoints?.includes(attachmentPointName) ?? false,
      selected: selectedAttachmentPoint === attachmentPointName,
      usage,
    });
  }

  public showExternal(canvas, params: PreviewAttachmentPointParams) {
    this.rootElement = this.appendRootElement(canvas);
    this.appendBody(this.rootElement);
    this.appendLabel(this.rootElement);
    this.appendNumberOfMonomers();
    this.drawAttachmentPoints(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.appendPreviewAttachmentPoint.bind(this, params),
    );
  }
}
