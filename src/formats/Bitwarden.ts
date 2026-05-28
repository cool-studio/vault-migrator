import { v4 as uuidv4 } from "uuid";
import { BitwardenCollectionStoreInterface } from "../features/BitwardenCollectionStoreInterface";
import { Card } from "../models/Card";
import { Credential } from "../models/Credential";
import { Folder } from "../models/Folder";
import { Vault } from "../models/Vault";
import { Map } from "../utils/Map";
import {
  AbstractFormat,
  FormatDigestOptions,
  FormatIngestOptions,
} from "./abstractFormat";
import {
  BitwardenCard,
  BitwardenFolder,
  BitwardenJSON,
  BitwardenLogin,
} from "./DataFormat/Bitwarden";

export interface BitwardenIngestOptions extends FormatIngestOptions {
  type: "bitwarden";
}

export interface BitwardenDigestOptions extends FormatDigestOptions {
  type: "bitwarden";
  collectionStore: BitwardenCollectionStoreInterface;
  username: string;
}

export class Bitwarden extends AbstractFormat {
  filetype = "json";

  getFolder(vault: Vault, name: string) {
    let folder = vault.folders.get(name);

    if (!folder) {
      folder = new Folder(false);
    }

    if (folder.customFields.get("id")) {
      folder.customFields.set("id", uuidv4());
    }
  }

  ingest(vault: Vault, data: any, options: BitwardenIngestOptions): this {
    return this;
  }

  digest(vault: Vault, options: BitwardenDigestOptions): any {
    const folderIdMap = new Map<string>();

    if (!options.collectionStore.has(options.username)) {
      options.collectionStore.set(options.username, options.username);
    }

    const data = {
      encrypted: false,
      folders: [],
      items: [],
      collections: [],
    } as BitwardenJSON;

    vault.folders.foreach((name, folder) => {
      this.digestFolder(
        folderIdMap,
        data,
        name,
        folder,
        options.collectionStore,
      );
    });

    vault.cards.forEach((card) => {
      this.digestCard(data, card);
    });

    vault.credentials.forEach((credential) => {
      this.digestCredential(
        folderIdMap,
        data,
        credential,
        options,
        vault.folders,
      );
    });

    data.collections = options.collectionStore.all();

    return JSON.stringify(data, null, 2);
  }

  digestCredential(
    folderIdMap: Map<string>,
    data: BitwardenJSON,
    credential: Credential,
    options: BitwardenDigestOptions,
    folders: Map<Folder>,
  ) {
    const credentialJson = {} as BitwardenLogin;

    const collectionStore = options.collectionStore;

    credentialJson.type = 1;

    credentialJson.name =
      credential.name ??
      (credential.url && credential.url.length > 0
        ? credential.url[0]
        : "Untitled Credential");

    credentialJson.id = credential.customFields.get("id") ?? uuidv4();

    credentialJson.collectionIds = [];

    if (credential.folders && credential.folders.length > 0) {
      credential.folders.forEach((folder) => {
        const folderId = folderIdMap.get(folder);

        if (!folderId) {
          const vaultFolder = folders.get(folder);
          if (vaultFolder && vaultFolder.shared && vaultFolder.id) {
            if (!collectionStore.has(vaultFolder.id)) {
              collectionStore.set(vaultFolder.id, folder);
            }

            const collection = collectionStore.get(vaultFolder.id);
            if (collection && credentialJson.collectionIds) {
              credentialJson.collectionIds.push(collection.id);
            }
          }
        } else {
          const collectionName =
            options.username + "/" + folder.replace(/\\/g, "/");

          if (!collectionStore.has(folder)) {
            collectionStore.set(folder, collectionName);
          }

          const collection = collectionStore.get(folder);
          if (collection && credentialJson.collectionIds) {
            credentialJson.collectionIds.push(collection.id);
          }
        }
      });
    }

    let uris = [] as {
      uri: string;
    }[];

    if (credential.url) {
      uris = credential.url.map((v) => {
        return {
          uri: v,
        };
      });
    }

    credentialJson.login = {
      fido2Credentials: [],
      password: credential.password ?? "",
      totp: credential.otp ? credential.otp.toUri() : null,
      username: credential.username ?? "",
      uris: uris,
    };

    credentialJson.reprompt = 0;
    credentialJson.notes = credential.notes ?? null;

    if (credential.customFields) {
      credential.customFields.foreach((key, value) => {
        credentialJson.fields.push({
          name: key,
          value: value,
          type: 1,
        });
      });
    }
    data.items.push(credentialJson);
  }

  digestFolder(
    folderIdMap: Map<string>,
    data: BitwardenJSON,
    name: string,
    folder: Folder,
    collectionStore: BitwardenCollectionStoreInterface,
  ) {
    if (folder.shared) {
      this.digestCollection(folderIdMap, data, name, folder, collectionStore);
      return;
    }

    const uuid = uuidv4();
    const bitwardenFolder = {
      name: name,
      id: uuid,
    } as BitwardenFolder;

    folderIdMap.set(name, uuid);

    data.folders.push(bitwardenFolder);
  }

  digestCollection(
    folderIdMap: Map<string>,
    data: BitwardenJSON,
    name: string,
    folder: Folder,
    collectionStore: BitwardenCollectionStoreInterface,
  ) {
    if (folder.id) {
      collectionStore.set(folder.id, name.replace(/\\/g, "/"));
    }
  }

  digestCard(data: BitwardenJSON, card: Card): void {
    const bitwardenCard = {
      type: 3,
      name: card.name,
      notes: card.notes,
      card: {
        number: card.cardNumber,
        expMonth: (card.cardExpiration ?? "/").split("/")[0],
        expYear: (card.cardExpiration ?? "/").split("/")[1],
        code: card.cardSecurity,
        cardholderName: card.cardHolderName,
      },
    } as BitwardenCard;

    data.items.push(bitwardenCard);
  }
}
