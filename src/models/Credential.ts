import { Map } from "../utils/Map";

export class Credential {
  name?: string;
  username?: string;
  password?: string;
  url?: string[];
  notes?: string;
  folders?: string[];
  otp?: string;
  customFields: Map<string> = new Map<string>();

  public setName(name: string): this {
    this.name = name;
    return this;
  }

  public setUsername(name: string): this {
    this.username = name;
    return this;
  }

  public setPassword(password: string): this {
    this.password = password;
    return this;
  }

  public addUrl(url: string): this {
    if (this.url) {
      this.url.push(url);
    } else {
      this.url = [url];
    }

    return this;
  }

  public setNotes(notes: string): this {
    this.notes = notes;
    return this;
  }

  public addFolder(folder: string): this {
    if (this.folders) {
      this.folders.push(folder);
    } else {
      this.folders = [folder];
    }

    return this;
  }

  public setOtp(otp: string): this {
    this.otp = otp;
    return this;
  }
}
