import { Map } from "../utils/Map";
import { OTP } from "./OTP";
import { VaultItem } from "./Vault";

export class Credential extends VaultItem {
  username?: string;
  password?: string;
  url?: string[];
  folders?: string[];
  otp?: OTP;

  reprompt: boolean = false;
  favourite: boolean = false;

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

  public setOtp(otp: OTP): this {
    this.otp = otp;
    return this;
  }
}
