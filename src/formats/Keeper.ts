import {
  AbstractFormat,
  FormatDigestOptions,
  FormatIngestOptions,
} from "./abstractFormat";
import { Vault } from "../models/Vault";
import { KeeperJSON } from "./DataFormat/Keeper";
import { Credential } from "../models/Credential";
import { Folder } from "../models/Folder";
import { UnsupportedInImport } from "../errors/UnsupportedInImport";

export interface KeeperExport {}

export interface KeeperIngestOptions extends FormatIngestOptions {
  type: "keeper";
}

export interface KeeperDigestOptions extends FormatDigestOptions {
  type: "keeper";
}

export class Keeper extends AbstractFormat {
  ingest(vault: Vault, data: any, options: KeeperIngestOptions): this {
    const jsonData = JSON.parse(data) as KeeperJSON;

    if (jsonData.shared_folders) {
      jsonData.shared_folders.forEach((folder) => {
        // console.log(folder);
      });
    }

    if (jsonData.records) {
      jsonData.records.forEach((record) => {
        this.wrapError(vault, () => {
          const credential = new Credential();
          credential.setName(record.title);
          credential.setUsername(record.login);
          credential.setPassword(
            options.redact ? "{{ REDACTED PASSWORD }}" : record.password,
          );
          credential.setNotes(record.notes);
          credential.addUrl(record.login_url);

          if (record.folders) {
            record.folders.forEach((folder) => {
              this.wrapError(vault, () => {
                if (folder.folder) {
                  let vaultFolder = vault.folders.get(folder.folder);

                  if (!vaultFolder) {
                    vault.folders.set(folder.folder, new Folder());
                  }

                  credential.addFolder(folder.folder);
                } else if (folder.shared_folder) {
                  credential.addFolder(folder.folder);
                }
              });
            });
          }

          if (Object.keys(record.custom_fields).length > 0) {
            this.wrapError(vault, () => {
              Object.keys(record.custom_fields).forEach((key) => {
                if (key.charAt(0) === "$") {
                  if (key === "$oneTimeCode") {
                    credential.setOtp(record.custom_fields[key]);
                  } else if (key.indexOf("$passkey::") !== -1) {
                    throw new UnsupportedInImport(
                      "Passkeys are not currently supported in Keeper.",
                      `Credential: ${record.title}`,
                    );
                  } else {
                    throw new UnsupportedInImport(
                      `Magic Custom Field "${key} not supported in Keeper.`,
                      `Credential: ${record.title}`,
                      false,
                    );
                  }
                } else {
                  credential.customFields.set(key, record.custom_fields[key]);
                }
              });
            });
          }

          vault.credentials.push(credential);
        });
      });
    }

    return this;
  }

  digest(vault: Vault, options: KeeperDigestOptions): any {
    return [];
  }
}
