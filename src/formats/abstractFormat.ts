import { Vault } from "../models/Vault";
import { MigratorError } from "../errors/MigratorError";

export interface FormatIngestOptions {
  type: string;
  redact?: boolean;
}

export interface FormatDigestOptions {
  type: string;
}

export abstract class AbstractFormat {
  abstract ingest(vault: Vault, data: any, options: FormatIngestOptions): this;

  /**
   * @param vault
   * @param options
   * @return The importable contents for the provided password manager, with the filetype in this.filetype.
   */
  abstract digest(vault: Vault, options: FormatDigestOptions): any;

  public filetype: string = "json";

  protected wrapError(vault: Vault, handle: Function) {
    try {
      handle();
    } catch (e) {
      if (e instanceof MigratorError) {
        if (e.survivable) {
          vault.errors.push(e);
          return;
        }
      }

      throw e;
    }
  }
}
