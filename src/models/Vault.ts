import { Folder } from "./Folder";
import { Credential } from "./Credential";
import { Map } from "../utils/Map";
import { Card } from "./Card";

export class Vault {
  public folders: Map<Folder> = new Map<Folder>();
  public cards: Array<Card> = new Array<Card>();
  public credentials: Array<Credential> = new Array<Credential>();
  public errors: Array<Error> = new Array<Error>();
}

export class VaultItem {
  name?: string;
  notes?: string;
  customFields: Map<string> = new Map<string>();
}
