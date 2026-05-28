import { BitwardenCollection } from "../formats/DataFormat/Bitwarden";

export interface BitwardenCollectionStoreInterface {
  has(index: string): boolean;
  get(index: string): BitwardenCollection | null;
  set(index: string, name: string): void;
  all(): BitwardenCollection[];
}
