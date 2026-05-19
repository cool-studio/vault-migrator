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
import { Card } from "../models/Card";

export interface KeeperExport {}

export interface KeeperIngestOptions extends FormatIngestOptions {
  type: "keeper";
}

export interface KeeperDigestOptions extends FormatDigestOptions {
  type: "keeper";
}

export class Keeper extends AbstractFormat {
  filetype = "json";

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
          if (record.custom_fields && record.custom_fields["$paymentCard::1"]) {
            this.ingestCard(vault, record, options);
            return;
          }

          if (
            record.$type &&
            !["login", "Log In - Privacy Screen enabled"].includes(record.$type)
          ) {
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

          if (
            record.custom_fields &&
            Object.keys(record.custom_fields).length > 0
          ) {
            this.wrapError(vault, () => {
              Object.keys(record.custom_fields).forEach((key) => {
                if (key.charAt(0) === "$") {
                  if (key === "$oneTimeCode" || key === "$oneTimeCode::1") {
                    const otp = OTP.fromUri(record.custom_fields[key]);
                    if (options.redact) {
                      otp.secret = "REDACTED_SECRET";
                    }
                    credential.setOtp(otp);
                  } else if (key.indexOf("$passkey:") !== -1) {
                    vault.errors.push(
                      new UnsupportedInImport(
                        "Passkeys are not currently supported in Keeper.",
                        `Credential: ${record.title}`,
                      ),
                    );
                  } else if (key.indexOf("$url::") !== -1) {
                    credential.addUrl(record.custom_fields[key]);
                  } else {
                    console.log(record);
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

  ingestCard(
    vault: Vault,
    record: KeeperRecord,
    options: KeeperIngestOptions,
  ): void {
    const card = new Card();

    card.name = record.title;
    card.notes = record.notes;

    if (record.custom_fields) {
      const paymentCard = record.custom_fields["$paymentCard::1"];

      card.cardNumber = options.redact
        ? "{{ REDACTED }}"
        : paymentCard.cardNumber;
      card.cardExpiration = paymentCard.cardExpirationDate;
      card.cardSecurity = options.redact
        ? "{{ REDACTED }}"
        : paymentCard.cardSecurityCode;
      card.cardHolderName = record.custom_fields["$text:Cardholder Name:1"];

      vault.cards.push(card);
    }
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

      if (credential.otp && record.custom_fields) {
        record.custom_fields["$oneTimeCode"] = credential.otp.toUri();
      }

      output.records.push(record);
    });

    return JSON.stringify(output);
  }
}
