import {
  Bitwarden,
  BitwardenDigestOptions,
  BitwardenIngestOptions,
} from "./Bitwarden";
import { Keeper, KeeperDigestOptions, KeeperIngestOptions } from "./Keeper";

type IngestOptions = KeeperIngestOptions | BitwardenIngestOptions;
type DigestOptions = KeeperDigestOptions | BitwardenDigestOptions;

export { Bitwarden, Keeper, IngestOptions, DigestOptions };
