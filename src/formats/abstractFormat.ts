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
  abstract digest(vault: Vault, options: FormatDigestOptions): any;

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
