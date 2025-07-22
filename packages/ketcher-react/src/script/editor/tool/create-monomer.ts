import { Tool } from './Tool';
import Editor from '../Editor';

class CreateMonomerTool implements Tool {
  constructor(private editor: Editor) {
    this.editor.openMonomerCreationWizard();
  }

  cancel() {}
}

export default CreateMonomerTool;
