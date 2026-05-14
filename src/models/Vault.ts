import { Folder } from "./Folder";
import { Credential } from "./Credential";
import { Map } from "../utils/Map";

export class Vault {
  public folders: Map<Folder> = new Map<Folder>();
  public credentials: Array<Credential> = new Array<Credential>();
  public errors: Array<Error> = new Array<Error>();
}
