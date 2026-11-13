import type { Ketcher } from './ketcher';
import type { CoreEditor } from './editor/Editor';

class KetcherProvider {
  private readonly ketcherInstances = new Map<string, Ketcher>();
  private readonly coreEditorInstances = new Map<string, CoreEditor>();

  addKetcherInstance(instance: Ketcher) {
    this.ketcherInstances.set(instance.id, instance);
  }

  removeKetcherInstance(id: string) {
    this.ketcherInstances.delete(id);
    this.coreEditorInstances.delete(id);
  }

  addCoreEditorInstance(id: string | undefined, editor: CoreEditor) {
    if (id) {
      this.coreEditorInstances.set(id, editor);
    }
  }

  removeCoreEditorInstance(id: string | undefined, editor: CoreEditor) {
    if (id && this.coreEditorInstances.get(id) === editor) {
      this.coreEditorInstances.delete(id);
    }
  }

  getCoreEditor(id?: string) {
    return id ? this.coreEditorInstances.get(id) : undefined;
  }

  getIndexById(id: string) {
    return [...this.ketcherInstances.keys()].indexOf(id);
  }

  getKetcher(id?: string) {
    if (!id) {
      return [...this.ketcherInstances.values()][
        this.ketcherInstances.size - 1
      ];
    }

    const ketcher = this.ketcherInstances.get(id);

    if (!ketcher) {
      throw new Error(`couldn't find ketcher instance ${id}`);
    }

    return ketcher;
  }
}

export const ketcherProvider = new KetcherProvider();
