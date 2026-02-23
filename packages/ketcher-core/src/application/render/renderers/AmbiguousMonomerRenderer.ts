import { Selection } from 'd3';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import { MONOMER_SYMBOLS_IDS } from 'application/render/renderers/constants';
import { EmptyMonomer } from 'domain/entities/EmptyMonomer';
import { AttachmentPointName } from 'domain/types';
import { PreviewAttachmentPoint } from 'domain/PreviewAttachmentPoint';
import { UsageInMacromolecule } from 'application/render';
import { D3SvgElementSelection } from 'application/render/types';
import { KetMonomerClass } from 'application/formatters';

type PreviewAttachmentPointParams = {
  canvas: D3SvgElementSelection<SVGSVGElement, void>;
  usage: UsageInMacromolecule;
  selectedAttachmentPoint: string | null | undefined;
  connectedAttachmentPoints: string[] | undefined;
};

export class AmbiguousMonomerRenderer extends BaseMonomerRenderer {
  private readonly monomerRenderer: BaseMonomerRenderer;
  private readonly monomerSymbolElementsIds: {
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
      monomerSymbolElementsIds.hover,
      monomerSymbolElementsIds.body,
      monomerSymbolElementsIds.autochainPreview,
      scale,
    );

    const [, MonomerRenderer] = monomerFactory(
      this.monomer.monomers[0].monomerItem,
    );

    this.monomerRenderer = new MonomerRenderer(new EmptyMonomer());
    this.monomerSymbolElementsIds = monomerSymbolElementsIds;
    this.CHAIN_START_TERMINAL_INDICATOR_TEXT =
      this.monomerRenderer.CHAIN_START_TERMINAL_INDICATOR_TEXT;
  }

  protected appendBody(
    rootElement: Selection<SVGGElement, void, HTMLElement, never>,
  ) {
    return rootElement
      .append('use')
      .data([this])
      .attr(
        'href',
        this.monomerSymbolElementsIds.variant ??
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
          (this.monomer.monomerClass === KetMonomerClass.Base ? 7 : 8)
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
    if (this.enumerationElementPosition) {
      this.appendEnumeration();
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
      canvas: params.canvas,
      applyZoomForPositionCalculation: false,
    });
  }

  public showExternal(params: PreviewAttachmentPointParams) {
    this.rootElement = this.appendRootElement(params.canvas);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.bodyElement = this.appendBody(this.rootElement);
    this.appendLabel(this.rootElement);
    this.appendNumberOfMonomers();
    this.drawAttachmentPoints(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.appendPreviewAttachmentPoint.bind(this, params),
    );
  }

  protected get modificationConfig() {
    return undefined;
  }
}

function monomerFactory(
  ...args: Parameters<
    typeof import('application/editor/operations/monomer/monomerFactory').monomerFactory
  >
) {
  return getMonomerFactory()(...args);
}

function getMonomerFactory() {
  if (!cachedMonomerFactory) {
    const { monomerFactory } =
      require('application/editor/operations/monomer/monomerFactory') as {
        monomerFactory: typeof import('application/editor/operations/monomer/monomerFactory').monomerFactory;
      };
    cachedMonomerFactory = monomerFactory;
  }
  return cachedMonomerFactory;
}

let cachedMonomerFactory:
  | typeof import('application/editor/operations/monomer/monomerFactory').monomerFactory
  | undefined = undefined;
