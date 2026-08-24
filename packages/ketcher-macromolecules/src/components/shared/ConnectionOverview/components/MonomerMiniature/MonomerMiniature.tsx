import { select, type Selection } from 'd3';

import {
  AmbiguousMonomer,
  AmbiguousMonomerRenderer,
  BaseMonomer,
  Coordinates,
  UsageInMacromolecule,
  Vec2,
} from 'ketcher-core';
import { useCallback, useLayoutEffect, useRef } from 'react';

import { Container, DEFAULT_MINIATURE_SIZE } from './MonomerMiniature.styles';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Container size (`expanded` uses width/height: 'auto') isn't settled by
  // the time this first layout effect runs — it can still shift afterwards,
  // e.g. once web fonts finish loading and sibling text reflows, or once the
  // dialog's own mount/expand transition finishes. A one-time measurement
  // here would freeze the scale at whatever size happened to be current at
  // that instant, which is why it was previously observed to render
  // inconsistently between runs. A ResizeObserver re-applies the scale
  // whenever the container's actual box changes, so it always converges to
  // the final, stable size regardless of layout timing.
  const applyScale = useCallback(() => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) {
      return;
    }
    const { width, height } = container.getBoundingClientRect();
    if (width === 0 || height === 0) {
      return;
    }
    const scale = Math.min(width, height) / DEFAULT_MINIATURE_SIZE;
    select(svg).style('transform', `scale(${scale})`);
    select(svg).style('transform-origin', 'center');
  }, []);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (svg) {
      const svgElement = select(svg) as unknown as Selection<
        SVGSVGElement,
        void,
        HTMLElement,
        never
      >;
      // Redrawn from scratch on every relevant change (including `expanded`),
      // since the renderer only appends elements and never clears them itself.
      svgElement.selectAll('*').remove();
      if (monomer instanceof AmbiguousMonomer) {
        // Always draw into a fixed-size reference box, exactly as in the
        // collapsed state. Passing a `scale` into AmbiguousMonomerRenderer
        // instead would distort the layout: its root `<g>` transform scales
        // around local (0,0) before translating into place, and attachment
        // points sit much further from that origin than the body does, so
        // they'd drift far more than the body — which is what made R1/R2
        // render detached from the monomer body previously.
        const centerX = DEFAULT_MINIATURE_SIZE / 2;
        const centerY = DEFAULT_MINIATURE_SIZE / 2;
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
      }
      // TODO: Use factory here for any other monomer if it will be required (e.g. unresolved monomers)?
    }

    // Scale the whole finished picture uniformly around its own center to
    // fill the container (which already resizes correctly between the
    // collapsed and expanded dialog states) — this keeps the body and its
    // attachment points in the same relative positions at any size.
    applyScale();
  }, [
    selectedAttachmentPoint,
    connectedAttachmentPoints,
    expanded,
    monomer,
    usage,
    applyScale,
  ]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const resizeObserver = new ResizeObserver(applyScale);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [applyScale]);

  return (
    <Container ref={containerRef} expanded={expanded} data-testid={testId}>
      <svg
        ref={svgRef}
        width={DEFAULT_MINIATURE_SIZE}
        height={DEFAULT_MINIATURE_SIZE}
      />
    </Container>
  );
};

export default MonomerMiniature;
