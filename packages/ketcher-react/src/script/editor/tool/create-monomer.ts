import { Tool } from './Tool';
import Editor from '../Editor';

class CreateMonomerTool implements Tool {
  constructor(private editor: Editor) {
    this.editor.openMonomerCreationWizard();
  }

  mousemove() {
    // No action needed on mouse move for this tool
  }
}

export default CreateMonomerTool;
