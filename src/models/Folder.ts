import { Map } from "../utils/Map";

export class Folder {
  customFields: Map<string> = new Map<any>();
  shared: boolean;

  constructor(shared: boolean) {
    this.shared = shared;
  }
}
