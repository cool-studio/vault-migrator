export class OTP {
  type: "totp" | "hotp";
  label: string;
  secret: string;
  issuer?: string;
  algorithm?: "SHA1" | "SHA256" | "SHA512";
  digits?: 6 | 8;
  period?: number;
  counter?: number;

  constructor(type: "totp" | "hotp", label: string, secret: string) {
    this.type = type;
    this.label = label;
    this.secret = secret;
  }

  public toUri(): string {
    const url = new URL("otpauth://" + this.type);

    url.pathname = this.label;

    url.searchParams.append("secret", this.secret);

    if (this.issuer) {
      url.searchParams.append("issuer", this.issuer);
    }

    if (this.algorithm) {
      url.searchParams.append("algorithm", this.algorithm);
    }

    if (this.digits) {
      url.searchParams.append("digits", this.digits.toString());
    }

    if (this.period) {
      url.searchParams.append("period", this.period.toString());
    }

    if (this.counter) {
      url.searchParams.append("counter", this.counter.toString());
    }

    return url.toString();
  }

  public static fromUri(uri: string): OTP {
    const url = URL.parse(uri);

    if (!url) {
      throw new Error("Unable to parse URI");
    }

    if (url.protocol !== "otpauth:") {
      throw new Error("Invalid OTP protocol");
    }

    const label = url.pathname.split("/")[1];
    OTP.assertValidHost(url.host);
    const secret = url.searchParams.get("secret");
    OTP.assertValidString(secret, "secret");

    const otp = new OTP(url.host, label, secret);

    const issuer = this.valueOrDefault(url.searchParams.get("issuer"), null);
    if (issuer) {
      otp.issuer = issuer;
    }

    const algorithm = this.valueOrDefault(
      url.searchParams.get("algorithm"),
      "SHA1",
    );
    this.assertValidAlgorithm(algorithm);
    otp.algorithm = algorithm;

    const digits = parseInt(
      this.valueOrDefault(url.searchParams.get("digits"), 6),
    );
    this.assertValidDigits(digits);
    otp.digits = digits;

    const period = parseInt(
      this.valueOrDefault(url.searchParams.get("period"), 30),
    );
    this.assertValidNumber(period, "period");
    otp.period = period;

    if (otp.type === "hotp") {
      const paramCounter = url.searchParams.get("counter");
      this.assertValidString(paramCounter, "counter");
      const counter = parseInt(paramCounter);
      this.assertValidNumber(counter, "counter");
      otp.counter = counter;
    }

    return otp;
  }

  public static valueOrDefault(value: any, defaultValue: any = null) {
    if (value) {
      return value;
    }

    return defaultValue;
  }

  public static assertValidHost(host: string): asserts host is "totp" | "hotp" {
    if (!["totp", "hotp"].includes(host)) throw new Error("Invalid OTP host");
  }

  public static assertValidAlgorithm(
    algorithm: string,
  ): asserts algorithm is "SHA1" | "SHA256" | "SHA512" {
    if (!["SHA1", "SHA256", "SHA512"].includes(algorithm)) {
      throw new Error("Invalid OTP algorithm");
    }
  }

  public static assertValidDigits(digits: number): asserts digits is 6 | 8 {
    if (![6, 8].includes(digits)) {
      throw new Error("Invalid OTP digits");
    }
  }

  public static assertValidString(
    value: string | null | undefined,
    key: string,
  ): asserts value is string {
    if (!value) {
      throw new Error(`OTP ${key} must be a string.`);
    }
  }

  public static assertValidNumber(
    value: number | null | undefined,
    key: string,
  ): asserts value is number {
    if (!value) {
      throw new Error(`OTP ${key} must be a number.`);
    }
  }
}
