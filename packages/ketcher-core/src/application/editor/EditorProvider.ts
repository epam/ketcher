import { CoreEditor } from './Editor';

export class CoreEditorProvider {
  private static instances = new Map<string, CoreEditor>();

  static addInstance(instance: CoreEditor) {
    CoreEditorProvider.instances.set(instance.id, instance);
  }

  static removeInstance(id) {
    CoreEditorProvider.instances.delete(id);
  }

  static getEditor(id?: string) {
    if (!id) {
      return [...CoreEditorProvider.instances.values()][
        CoreEditorProvider.instances.size - 1
      ];
    }

    const editor = CoreEditorProvider.instances.get(id);

    if (!editor) {
      throw Error(`couldnt find core editor instance ${id}`);
    }

    return editor;
  }
}
