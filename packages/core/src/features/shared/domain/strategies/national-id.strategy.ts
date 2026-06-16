export interface NationalIdValidatorStrategy {
    validate(id: string): boolean;
}
