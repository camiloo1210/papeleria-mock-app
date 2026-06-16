import { NationalIdValidatorStrategy } from "./national-id.strategy";
import { EcuadorNationalIdValidator } from "./ecuador-national-id.validator";
import { GenericNationalIdValidator } from "./generic-national-id.validator";

export class NationalIdValidatorFactory {
    static getStrategy(countryCode?: string): NationalIdValidatorStrategy {
        if (!countryCode) {
            return new GenericNationalIdValidator();
        }

        switch (countryCode.toUpperCase()) {
            case 'EC':
                return new EcuadorNationalIdValidator();
            default:
                return new GenericNationalIdValidator();
        }
    }
}
