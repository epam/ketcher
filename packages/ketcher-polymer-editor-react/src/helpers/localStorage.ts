interface LocalStorageCopy {
  getItem: (key: string) => string | null;
  setItem: (key: string, item: unknown) => void;
}

class LocalStorage implements LocalStorageCopy {
  localStorage: Storage;

  constructor() {
    this.localStorage = window.localStorage;
  }

  getItem(key: string) {
    const item: string | null = this.localStorage.getItem(key);

    if (!item) {
      return null;
    }

    return JSON.parse(item);
  }

  setItem(key: string, item: unknown) {
    this.localStorage.setItem(key, JSON.stringify(item));
  }
}

export const localStorageCopy: LocalStorageCopy = new LocalStorage();
