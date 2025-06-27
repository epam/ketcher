import { Ketcher } from './ketcher';

class KetcherProvider {
  private ketcherInstances = new Map<string, Ketcher>();

  addKetcherInstance(instance: Ketcher) {
    this.ketcherInstances.set(instance.id, instance);
  }

  removeKetcherInstance(id) {
    this.ketcherInstances.delete(id);
  }

  getIndexById(id: string) {
    return Array.from(this.ketcherInstances.keys()).indexOf(id);
  }

  getKetcher(id?: string) {
    if (!id) {
      return [...this.ketcherInstances.values()][
        this.ketcherInstances.size - 1
      ];
    }

    const ketcher = this.ketcherInstances.get(id);

    if (!ketcher) {
      throw Error(`couldnt find ketcher instance ${id}`);
    }

    return ketcher;
  }
}

const ketcherProvider = new KetcherProvider();

export { ketcherProvider };
