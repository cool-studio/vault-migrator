export class MigratorError extends Error {
  survivable: boolean;
  message: string;

  constructor(message: string, survivable: boolean = false) {
    super();

    this.message = message;
    this.survivable = survivable;
  }

  public getMessage(): string {
    return this.message;
  }
}
