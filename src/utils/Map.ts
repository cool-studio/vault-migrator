interface MapStore<T> {
  [key: string]: T;
}

type ForeachCallback<T> = (key: string, value: T) => void;

export class Map<T> {
  public contents: MapStore<T>;

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

  foreach(callback: ForeachCallback<T>) {
    const keys = Object.keys(this.contents);
    for (const key of keys) {
      callback(key, this.contents[key]);
    }
  }
}
