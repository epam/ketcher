class LocalStorageWrapper {
  localStorage: Storage;

  constructor() {
    this.localStorage = window.localStorage;
  }

  getItem(key: string) {
    const item: string | null = this.localStorage.getItem(key);

    return !item ? null : JSON.parse(item);
  }

  setItem(key: string, item: unknown) {
    this.localStorage.setItem(key, JSON.stringify(item));
  }

  removeItem(key: string) {
    this.localStorage.removeItem(key);
  }
}

export const localStorageWrapper = new LocalStorageWrapper();
