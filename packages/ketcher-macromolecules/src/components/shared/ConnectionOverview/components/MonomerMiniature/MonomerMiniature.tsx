import { select } from 'd3';
import {
  AmbiguousMonomer,
  AmbiguousMonomerRenderer,
  BaseMonomer,
  Coordinates,
  UsageInMacromolecule,
  Vec2,
} from 'ketcher-core';
import { useLayoutEffect, useRef } from 'react';

import { Container } from './MonomerMiniature.styles';

interface Props {
  monomer: BaseMonomer;
  usage: UsageInMacromolecule;
  connectedAttachmentPoints?: string[];
  selectedAttachmentPoint?: string | null;
  expanded?: boolean;
}

const MonomerMiniature = ({
  monomer,
  expanded,
  selectedAttachmentPoint,
  connectedAttachmentPoints,
  usage,
}: Props) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (svg) {
      const svgElement = select(svg);
      if (monomer instanceof AmbiguousMonomer) {
        const centerX = (svg.width.baseVal.value - svg.x.baseVal.value) / 2;
        const centerY = (svg.height.baseVal.value - svg.y.baseVal.value) / 2;
        const position = new Vec2(centerX, centerY);
        const positionInAngstrom = Coordinates.canvasToModel(position);
        const variantMonomer = new AmbiguousMonomer(
          monomer.variantMonomerItem,
          positionInAngstrom,
        );
        const renderer = new AmbiguousMonomerRenderer(variantMonomer);
        renderer.showExternal({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          canvas: svgElement,
          usage,
          selectedAttachmentPoint,
          connectedAttachmentPoints,
        });
      }
      // TODO: Use factory here for any other monomer if it will be required (e.g. unresolved monomers)?
    }
  }, [selectedAttachmentPoint, connectedAttachmentPoints]);

  return (
    <Container expanded={expanded}>
      <svg ref={svgRef} />
    </Container>
  );
};

export default MonomerMiniature;
