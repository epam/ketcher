import toolActions from '../../action/tools';

describe('ToolActions', () => {
  const toolsWithTitles = Object.values(toolActions).filter(
    (tool) => tool.title !== undefined,
  );

  it('should have a "title" property for each tool', () => {
    toolsWithTitles.forEach((tool) => {
      expect(tool.title).toBeTruthy();
    });
  });
});
