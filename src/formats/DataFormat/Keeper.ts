export interface KeeperJSON {
  shared_folders: KeeperSharedFolder[];
  records: KeeperRecord[];
}

export interface KeeperSharedFolder {
  path: string;
  manage_users: boolean;
  manage_records: boolean;
  can_edit: boolean;
  can_share: boolean;
  permissions: KeeperSharedFolderPermissions[];
}

export interface KeeperSharedFolderPermissions {
  uid: string;
  manage_users: boolean;
  manage_records: boolean;
}

export interface CustomFields {
  [key: string]: string;
}

export interface KeeperRecord {
  title: string;
  login: string;
  password: string;
  login_url: string;
  notes: string;
  custom_fields: CustomFields;
  folders: KeeperRecordFolder[];
}

export type KeeperRecordFolder =
  | KeeperRecordSharedFolder
  | KeeperRecordPersonalFolder;

export interface KeeperRecordPersonalFolder {
  folder: string;
  shared_folder: never;
}

export interface KeeperRecordSharedFolder {
  folder: never;
  shared_folder: string;
  can_edit: boolean;
  can_share: boolean;
}
