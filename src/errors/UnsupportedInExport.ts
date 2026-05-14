import { MigratorError } from "./MigratorError";

export class UnsupportedInExport extends MigratorError {
  location: string;

  constructor(message: string, location: string, survivable: boolean = true) {
    super(message, survivable);
    this.location = location;
  }

  public getMessage(): string {
    return this.message + " / " + this.location;
  }
}
