import { D3SvgElementSelection } from 'application/render/types';

export abstract class TransientView {
  public static viewName: string;

  public static show<P>(
    _transientLayer: D3SvgElementSelection<SVGGElement, void>,
    _params: P,
  ) {
    throw new Error('Method is not implemented for an abstract class');
  }
}
