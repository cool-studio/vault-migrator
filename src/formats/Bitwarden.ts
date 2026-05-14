import {
  AbstractFormat,
  FormatDigestOptions,
  FormatIngestOptions,
} from "./abstractFormat";
import { Vault } from "../models/Vault";

export interface BitwardenIngestOptions extends FormatIngestOptions {
  type: "bitwarden";
}

export interface BitwardenDigestOptions extends FormatDigestOptions {
  type: "bitwarden";
}

export class Bitwarden extends AbstractFormat {
  ingest(vault: Vault, data: any, options: BitwardenIngestOptions): this {
    return this;
  }

  digest(vault: Vault, options: BitwardenDigestOptions): any {
    return [];
  }
}
