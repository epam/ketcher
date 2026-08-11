import type { D3SvgElementSelection } from 'application/render/types';

export abstract class TransientView {
  public static readonly viewName: string;

  public static show(
    _transientLayer: D3SvgElementSelection<SVGGElement, void>,
    _params: unknown,
  ) {
    throw new Error('Method is not implemented for an abstract class');
  }
}
