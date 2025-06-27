import { TransientView } from './TransientView';
import { D3SvgElementSelection } from 'application/render/types';
import { BaseMonomer } from 'domain/entities';
import {
  BaseMonomerRenderer,
  BaseSequenceItemRenderer,
} from 'application/render';
import { CoreEditor, SequenceMode } from 'application/editor';

export type ModifyAminoAcidsViewParams = {
  monomersToModify: BaseMonomer[];
  coreEditorId: string;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class ModifyAminoAcidsView extends TransientView {
  public static viewName = 'ModifyAminoAcidsView';

  public static show(
    transientLayer: D3SvgElementSelection<SVGGElement, void>,
    params: ModifyAminoAcidsViewParams,
  ) {
    const editor = CoreEditor.provideEditorInstance(params.coreEditorId);
    const { monomersToModify } = params;

    if (editor.mode instanceof SequenceMode) {
      monomersToModify.forEach((monomer) => {
        const renderer = monomer.renderer as BaseSequenceItemRenderer;
        const monomerRendererPositionInPixels =
          renderer.scaledMonomerPositionForSequence;

        if (!monomerRendererPositionInPixels) {
          return;
        }

        const group = transientLayer
          .append('g')
          .attr(
            'transform',
            `translate(${monomerRendererPositionInPixels.x - 2}, ${
              monomerRendererPositionInPixels.y - 18
            })`,
          );
        group
          .append('rect')
          .attr('width', 16)
          .attr('height', 24)
          .attr('fill', '#4EE581')
          .attr('rx', 2)
          .attr(
            'style',
            `
            filter: drop-shadow(0px 1px 1px #676884D9);
          `,
          );

        group
          .append('text')
          .text(renderer.symbolToDisplay)
          .attr('y', 18)
          .attr('x', 2)
          .attr('font-family', 'Courier New')
          .attr('font-size', '20px')
          .attr('font-weight', '700')
          .attr('style', 'user-select: none');

        if (renderer.node.modified) {
          group
            ?.append('path')
            .attr('d', 'M 2,21 L 14,21')
            .attr('stroke', '#333333')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', '1.7px');
        }
      });
    } else {
      monomersToModify.forEach((monomer) => {
        const monomerCenterInPixels = monomer.renderer?.center;

        if (!monomerCenterInPixels) {
          return;
        }

        transientLayer
          .append('circle')
          .attr('cx', monomerCenterInPixels.x)
          .attr('cy', monomerCenterInPixels.y)
          .attr('r', BaseMonomerRenderer.selectionCircleRadius)
          .attr('fill', 'none')
          .attr('stroke', '#0097A8')
          .attr('stroke-width', 1);
      });
    }
  }
}
