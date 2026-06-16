
export class CurrencyCode {
    private constructor(private readonly value: string) {
        // Basic validation: check if it's a 3-letter uppercase code
        if (!/^[A-Z]{3}$/.test(value)) {
            throw new Error('Invalid currency code format. Must be a 3-letter uppercase ISO 4217 code.');
        }
        // More comprehensive validation could involve a list of valid ISO 4217 codes
    }

    public static create(code: string): CurrencyCode {
        return new CurrencyCode(code);
    }

    public getValue(): string {
        return this.value;
    }

    public equals(other: CurrencyCode): boolean {
        return this.value === other.getValue();
    }

    public toString(): string {
        return this.value;
    }
}
