import { NationalIdValidatorStrategy } from "./national-id.strategy";

export class GenericNationalIdValidator implements NationalIdValidatorStrategy {
    validate(id: string): boolean {
        // Generic validation: check it's not empty and has reasonable length
        return id.length > 0 && id.length <= 20;
    }
}
