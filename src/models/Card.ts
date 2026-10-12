import { VaultItem } from "./Vault";

export class Card extends VaultItem {
  public cardNumber?: string;
  public cardExpiration?: string;
  public cardSecurity?: string;
  public cardHolderName?: string;

  constructor() {
    super();
  }
}
