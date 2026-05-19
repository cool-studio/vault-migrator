import {
  AbstractFormat,
  FormatDigestOptions,
  FormatIngestOptions,
} from "./abstractFormat";
import { Vault } from "../models/Vault";
import {
  BitwardenCard,
  BitwardenFolder,
  BitwardenItem,
  BitwardenJSON,
} from "./DataFormat/Bitwarden";
import { Folder } from "../models/Folder";
import { v4 as uuidv4 } from "uuid";
import { Credential } from "../models/Credential";
import { UnsupportedInImport } from "../errors/UnsupportedInImport";
import { OTP } from "../models/OTP";
import { Map } from "../utils/Map";
import { Card } from "../models/Card";

export interface BitwardenIngestOptions extends FormatIngestOptions {
  type: "bitwarden";
}

export interface BitwardenDigestOptions extends FormatDigestOptions {
  type: "bitwarden";
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

    const data = {
      encrypted: false,
      folders: [],
      items: [],
    } as BitwardenJSON;

    vault.folders.foreach((name, folder) => {
      this.digestFolder(folderIdMap, data, name, folder);
    });

    vault.cards.forEach((card) => {
      this.digestCard(data, card);
    });

    console.log(data);
  }

  digestFolder(
    folderIdMap: Map<string>,
    data: BitwardenJSON,
    name: string,
    folder: Folder,
  ) {
    const uuid = uuidv4();
    const bitwardenFolder = {
      name: name,
      id: uuid,
    } as BitwardenFolder;

    folderIdMap.set(name, uuid);

    data.folders.push(bitwardenFolder);
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
