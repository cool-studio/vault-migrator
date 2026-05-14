interface MapStore<T> {
  [key: string]: T;
}

export class Map<T> {
  contents: MapStore<T>;

  constructor() {
    this.contents = {};
  }

  exists(key: string) {
    return !!this.contents[key];
  }

  get(key: string) {
    if (this.exists(key)) return this.contents[key];

    return null;
  }

  set(key: string, value: T) {
    this.contents[key] = value;
  }
}
