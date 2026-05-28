import { v4 as uuidv4 } from "uuid";
import { BitwardenCollection } from "../formats/DataFormat/Bitwarden";
import { Map } from "../utils/Map";
import { BitwardenCollectionStoreInterface } from "./BitwardenCollectionStoreInterface";

export class BitwardenCollectionStore implements BitwardenCollectionStoreInterface {
  private readonly store: Map<BitwardenCollection>;
  private readonly organizationId: string;

  constructor(orgId: string) {
    this.organizationId = orgId;
    this.store = new Map<BitwardenCollection>();
  }

  public has(index: string): boolean {
    return this.store.exists(index);
  }

  public get(index: string): BitwardenCollection | null {
    return this.store.get(index);
  }

  public set(index: string, name: string): void {
    if (this.has(index)) {
      throw new Error(
        `Cannot set bitwarden collection with index ${index}, it already exists.`,
      );
    }

    this.store.set(index, {
      name: name,
      id: uuidv4(),
      organizationId: this.organizationId,
    });
  }

  public all(): BitwardenCollection[] {
    const collections: BitwardenCollection[] = [];

    this.store.foreach((collection) => {
      const item = this.store.get(collection);

      if (item) {
        collections.push(item);
      }
    });

    return collections;
  }
}
