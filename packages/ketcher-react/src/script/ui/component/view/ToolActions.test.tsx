import toolActions from '../../action/tools';

const toolsWithoutTitles = [
  'bonds',
  'arrows',
  'reaction-mapping-tools',
  'rgroup',
  'shapes',
];
const isToolWithTitle = (tool) => !toolsWithoutTitles.includes(tool);
const toolsWithTitles = Object.values(toolActions).filter(isToolWithTitle);

describe('ToolActions', () => {
  const tools = toolsWithTitles;

  it('should have a "title" property for each tool that is not hidden', () => {
    tools.forEach((tool) => {
      expect(tool.title).toBeTruthy();
    });
  });
});
