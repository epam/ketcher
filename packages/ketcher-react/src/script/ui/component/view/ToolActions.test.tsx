import toolActions from '../../action/tools';

const toolsWithoutTitles = [
  'bonds',
  'arrows',
  'reaction-mapping-tools',
  'rgroup',
  'shapes',
];
const isToolWithTitle = (tool) => !toolsWithoutTitles.includes(tool);
const toolsWithTitles = Object.keys(toolActions).filter(isToolWithTitle);

describe('ToolActions', () => {
  it('should have a "title" property for each tool that is not hidden', () => {
    toolsWithTitles.forEach((toolKey) => {
      const tool = toolActions[toolKey];
      if (tool.title === undefined) {
        console.error(`Tool without title: ${toolKey}`);
      }
      expect(tool.title).toBeTruthy();
    });
  });
});
