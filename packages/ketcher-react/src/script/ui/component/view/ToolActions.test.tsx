import toolActions from '../../../../../../ketcher-react/src/script/ui/action/tools';

describe('ToolActions', () => {
  it('should have a "title" property for each tool', () => {
    Object.values(toolActions).forEach((tool) => {
      expect(tool).toHaveProperty('title');
    });
  });
});
