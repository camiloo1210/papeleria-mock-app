import { TaxIdValidatorStrategy } from "./tax-id.strategy";

export class EcuadorTaxIdValidator implements TaxIdValidatorStrategy {
    validate(id: string): boolean {
        // SRI Regulation: RUC must be 13 digits
        if (id.length !== 13) {
            return false;
        }

        // Must be digits only
        if (!/^\d+$/.test(id)) {
            return false;
        }

        const provinceCode = parseInt(id.substring(0, 2), 10);
        const thirdDigit = parseInt(id.substring(2, 3), 10);

        // Check province code (01-24) and 30 (foreigners)
        if ((provinceCode < 1 || provinceCode > 24) && provinceCode !== 30) {
            return false;
        }

        if (thirdDigit < 6) {
            // Natural Person RUC (Cedula + 001 usually, but here checking full 13 digits)
            // For natural person RUC, the first 10 digits are valid Cedula
            return this.validateNaturalPersonRuc(id);
        } else if (thirdDigit === 6) {
            // Public Entity RUC
            return this.validatePublicEntity(id);
        } else if (thirdDigit === 9) {
            // Private Entity RUC
            return this.validatePrivateEntity(id);
        }

        return false;
    }

    private validateNaturalPersonRuc(ruc: string): boolean {
        // Last 3 digits must be 001, 002, etc. usually, but definitely not 000
        if (ruc.substring(10, 13) === '000') return false;

        // First 10 digits logic (Mod 10)
        return this.validateModulo10(ruc.substring(0, 10));
    }

    private validatePublicEntity(ruc: string): boolean {
        if (ruc.substring(9, 13) === '0000') return false;

        const digits = ruc.substring(0, 9).split('').map(Number); // First 9 used for check
        const verifier = parseInt(ruc.charAt(9), 10); // 10th digit is verifier
        const coefficients = [3, 2, 7, 6, 5, 4, 3, 2];

        let sum = 0;
        for (let i = 0; i < 8; i++) {
            sum += digits[i] * coefficients[i];
        }

        const modulus = sum % 11;
        const calculatedVerifier = modulus === 0 ? 0 : 11 - modulus;

        return calculatedVerifier === verifier;
    }

    private validatePrivateEntity(ruc: string): boolean {
        // Third digit is 9
        if (ruc.substring(10, 13) === '000') return false;

        const digits = ruc.substring(0, 10).split('').map(Number); // First 10 used? No, first 9. 10th is verifier.
        // Wait, for Private Entity (3rd digit 9):
        // Digits used: first 9.
        // Verifier: 10th digit.
        const verifier = parseInt(ruc.charAt(9), 10);
        const coefficients = [4, 3, 2, 7, 6, 5, 4, 3, 2];

        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += digits[i] * coefficients[i];
        }

        const modulus = sum % 11;
        const calculatedVerifier = modulus === 0 ? 0 : 11 - modulus;

        return calculatedVerifier === verifier;
    }

    private validateModulo10(id: string): boolean {
        const digits = id.split('').map(Number);
        const verifier = digits.pop()!;

        let sum = 0;
        for (let i = 0; i < 9; i++) {
            let digit = digits[i];
            if (i % 2 === 0) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
        }

        const nextTen = Math.ceil(sum / 10) * 10;
        let calculatedVerifier = nextTen - sum;

        if (calculatedVerifier === 10) calculatedVerifier = 0;

        return calculatedVerifier === verifier;
    }
}
