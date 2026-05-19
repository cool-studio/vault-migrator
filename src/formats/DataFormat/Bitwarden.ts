export interface BitwardenJSON {
  encrypted: boolean;
  folders: BitwardenFolder[];
  items: BitwardenItem[];
}

export interface BitwardenFolder {
  name: string;
  id: string;
}

export interface BitwardenItem {
  passwordHistory: {
    lastUsedDate: string;
    password: string;
  }[];
  revisionDate: string;
  creationDate: string;
  id: string;
  folderId?: string;
  type: number;
  reprompt: number;
  name: string;
  notes: string | null;
  favourite: boolean;
  fields: {
    name: string;
    type: number;
    value: string;
  }[];

  collectionIds: null | string[];
}

export interface BitwardenLogin extends BitwardenItem {
  type: 1;
  login: {
    uris: { uri: string }[];
    fido2Credentials: {
      credentialId: string;
      keyType: string;
      keyAlgorithm: string;
      keyCurve: string;
      keyValue: string;
      rpId: string;
      userHandle: string;
      userName: string;
      counter: string;
      rpName: string;
      userDisplayName: string;
      discoverable: string;
      creationDate: string;
    }[];
    username: string;
    password: string;
    totp: null | string;
  };
}

export interface BitwardenCard extends BitwardenItem {
  type: 3;
  card: {
    cardholderName: string;
    brand: string;
    number: string;
    expMonth: string;
    expYear: string;
    code: string;
  };
}
