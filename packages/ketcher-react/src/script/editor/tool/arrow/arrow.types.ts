import { Tool } from '../Tool';

export type ArrowAddTool = Required<
  Pick<Tool, 'mousemove' | 'mouseup' | 'mousedown'>
>;
