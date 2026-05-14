import {
  AbstractFormat,
  FormatDigestOptions,
  FormatIngestOptions,
} from "./abstractFormat";
import { Vault } from "../models/Vault";
import {
  KeeperJSON,
  KeeperRecord,
  KeeperSharedFolder,
} from "./DataFormat/Keeper";
import { Credential } from "../models/Credential";
import { Folder } from "../models/Folder";
import { UnsupportedInImport } from "../errors/UnsupportedInImport";
import { OTP } from "../models/OTP";
import { MigratorError } from "../errors/MigratorError";

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
        const vaultFolder = new Folder(true);

        Object.keys(folder).forEach((key) => {
          if (!["path"].includes(key)) {
            vaultFolder.customFields.set(key, folder[key]);
          }
        });

        vault.folders.set(folder.path, vaultFolder);
      });
    }

    if (jsonData.records) {
      jsonData.records.forEach((record) => {
        this.wrapError(vault, () => {
          if (record.$type && record.$type !== "login") {
            throw new UnsupportedInImport(
              `Unknown Record Type ${record.$type} in Keeper`,
              `Credential: ${record.title}`,
              true,
            );
          }

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
                    vault.folders.set(folder.folder, new Folder(false));
                  }

                  credential.addFolder(folder.folder);
                } else if (folder.shared_folder) {
                  credential.addFolder(folder.shared_folder);
                }
              });
            });
          }

          if (Object.keys(record.custom_fields).length > 0) {
            this.wrapError(vault, () => {
              Object.keys(record.custom_fields).forEach((key) => {
                if (key.charAt(0) === "$") {
                  if (key === "$oneTimeCode") {
                    const otp = OTP.fromUri(record.custom_fields[key]);
                    if (options.redact) {
                      otp.secret = "REDACTED_SECRET";
                    }
                    credential.setOtp(otp);
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
    const output = {
      shared_folders: [],
      records: [],
    } as KeeperJSON;

    vault.folders.foreach((name, folder) => {
      if (folder.shared) {
        const shared_folder = {
          path: name,
        } as KeeperSharedFolder;

        folder.customFields.foreach((key, value) => {
          shared_folder[key] = value;
        });

        output.shared_folders.push(shared_folder);
      }
    });

    vault.credentials.forEach((credential) => {
      const record = {
        title: credential.name,
        login: credential.username,
        password: credential.password ? credential.password : null,
        notes: credential.notes ? credential.notes : null,
        login_url: credential.url ? credential.url[0] : null,
        folders: credential.folders
          ? credential.folders.map((folder) => {
              const folderData = vault.folders.get(folder);

              if (!folderData) {
                throw new MigratorError("Folder doesn't exist?");
              }

              if (folderData.shared) {
                return {
                  shared_folder: folder,
                };
              } else {
                return {
                  folder: folder,
                };
              }
            })
          : [],
        custom_fields: credential.customFields.contents,
      } as KeeperRecord;

      if (credential.otp) {
        record.custom_fields["$oneTimeCode"] = credential.otp.toUri();
      }

      output.records.push(record);
    });

    return JSON.stringify(output);
  }
}
