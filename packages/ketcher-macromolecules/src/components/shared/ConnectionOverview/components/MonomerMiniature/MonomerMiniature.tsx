import { select, type Selection } from 'd3';
/* eslint-disable react-hooks/exhaustive-deps */
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
  testId?: string;
}

const MonomerMiniature = ({
  monomer,
  expanded,
  selectedAttachmentPoint,
  connectedAttachmentPoints,
  usage,
  testId,
}: Props) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg || !(monomer instanceof AmbiguousMonomer)) {
      return;
    }

    const svgElement = select(svg) as unknown as Selection<
      SVGSVGElement,
      void,
      HTMLElement,
      never
    >;
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
      canvas: svgElement,
      usage,
      selectedAttachmentPoint,
      connectedAttachmentPoints,
    });
    // TODO: Use factory here for any other monomer if it will be required (e.g. unresolved monomers)?
    return () => {
      renderer.remove();
    };
  }, [monomer, usage, selectedAttachmentPoint, connectedAttachmentPoints]);

  return (
    <Container expanded={expanded} data-testid={testId}>
      <svg ref={svgRef} />
    </Container>
  );
};

export default MonomerMiniature;
