export interface TaxIdValidatorStrategy {
    validate(taxId: string): boolean;
}
