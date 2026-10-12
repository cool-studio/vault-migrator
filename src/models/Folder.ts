import { Map } from "../utils/Map";

export class Folder {
  customFields: Map<string> = new Map<any>();
  shared: boolean;

  id: string | null = null;

  constructor(shared: boolean) {
    this.shared = shared;
  }
}
