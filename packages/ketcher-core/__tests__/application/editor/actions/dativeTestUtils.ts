import { ReStruct, Render } from 'application/render';
import type { RenderOptions } from 'application/render/render.types';
import type { Struct } from 'domain/entities';

export const createReStruct = (struct: Struct) => {
  const options = {
    microModeScale: 20,
    width: 100,
    height: 100,
  } as RenderOptions;
  const render = new Render(document as unknown as HTMLElement, options);
  return new ReStruct(struct, render);
};
