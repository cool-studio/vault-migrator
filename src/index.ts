import { Keeper, Bitwarden } from "./formats";

import {
  AbstractFormat,
  FormatDigestOptions,
  FormatIngestOptions,
} from "./formats/abstractFormat";

import { Vault } from "./models/Vault";

class Migrator {
  vault: Vault;

  getFormatter(format: string): AbstractFormat {
    switch (format) {
      case "keeper":
        return new Keeper();
      case "bitwarden":
        return new Bitwarden();
      default:
        throw new Error("Unsupported format: " + format);
    }
  }

  constructor() {
    this.vault = new Vault();
  }

  public ingest(data: string, options: FormatIngestOptions): this {
    const formatter = this.getFormatter(options.type);

    formatter.ingest(this.vault, data, options);

    return this;
  }

  public digest(options: FormatDigestOptions): any {
    const formatter = this.getFormatter(options.type);

    return formatter.digest(this.vault, options);
  }
}

export { Migrator };
