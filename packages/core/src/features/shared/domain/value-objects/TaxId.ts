import { TaxIdValidatorFactory } from "../strategies/tax-id-validator.factory";

export class TaxId {
  private constructor(private readonly value: string) { }

  static create(ruc: string, countryCode?: string): TaxId {
    const cleaned = ruc.replace(/\D/g, '');

    // Validate using strategy
    const validator = TaxIdValidatorFactory.getStrategy(countryCode);
    if (!validator.validate(cleaned)) {
      throw new Error(`Invalid Tax ID (RUC)${countryCode ? ' for ' + countryCode : ''}: ${ruc}`);
    }

    return new TaxId(cleaned);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static validate(_ruc: string): boolean {
    return true;
  }

  toString(): string {
    return this.value;
  }


  getValue(): string {
    return this.value;
  }
}