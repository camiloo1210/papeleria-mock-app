import { TaxIdValidatorStrategy } from "./tax-id.strategy";

export class GenericTaxIdValidator implements TaxIdValidatorStrategy {
    validate(taxId: string): boolean {
        // Generic validation: 
        // - Must not be empty
        // - Must be reasonably long (e.g. at least 5 chars)
        // - Must not be excessively long (e.g. max 20 chars)
        // Adjust constraints as needed for generic case.
        return taxId.length >= 5 && taxId.length <= 20;
    }
}
