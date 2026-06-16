import { TaxIdValidatorStrategy } from "./tax-id.strategy";
import { EcuadorTaxIdValidator } from "./ecuador-tax-id.validator";
import { GenericTaxIdValidator } from "./generic-tax-id.validator";

export class TaxIdValidatorFactory {
    static getStrategy(countryCode?: string): TaxIdValidatorStrategy {
        if (!countryCode) {
            return new GenericTaxIdValidator();
        }

        switch (countryCode.toUpperCase()) {
            case 'EC':
                return new EcuadorTaxIdValidator();
            default:
                return new GenericTaxIdValidator();
        }
    }
}
