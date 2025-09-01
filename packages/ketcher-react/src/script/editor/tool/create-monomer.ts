import { Tool } from './Tool';
import Editor from '../Editor';

class CreateMonomerTool implements Tool {
  constructor(private editor: Editor) {
    this.editor.openMonomerCreationWizard();
    setTimeout(() => {
      this.editor.tool('select');
    }, 0);
  }

  mousemove() {
    // No action needed on mouse move for this tool
  }
}

export default CreateMonomerTool;
