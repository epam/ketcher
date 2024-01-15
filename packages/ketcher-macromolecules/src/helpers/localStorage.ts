class LocalStorageWrapper {
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

export const localStorageWrapper = new LocalStorageWrapper();
