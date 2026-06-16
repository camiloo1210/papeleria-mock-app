import { NationalIdValidatorStrategy } from "./national-id.strategy";

export class EcuadorNationalIdValidator implements NationalIdValidatorStrategy {
    validate(id: string): boolean {
        // Basic length check
        if (id.length !== 10 && id.length !== 13) {
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

        if (thirdDigit >= 0 && thirdDigit < 6) {
            // Natural Person (Cédula)
            return this.validateCedula(id.substring(0, 10));
        } else if (thirdDigit === 6) {
            // Public Entity RUC
            return this.validatePublicEntity(id.substring(0, 13));
        } else if (thirdDigit === 9) {
            // Private Entity RUC
            return this.validatePrivateEntity(id.substring(0, 13));
        }

        return false;
    }

    private validateCedula(cedula: string): boolean {
        if (cedula.length !== 10) return false;
        return this.validateModulo10(cedula);
    }

    private validatePublicEntity(ruc: string): boolean {
        if (ruc.length !== 13) return false;
        if (ruc.substring(9, 13) === '0000') return false;

        const digits = ruc.substring(0, 9).split('').map(Number);
        const verifier = digits.pop()!;
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
        if (ruc.length !== 13) return false;
        if (ruc.substring(10, 13) === '0000') return false;

        const digits = ruc.substring(0, 10).split('').map(Number);
        const verifier = digits.pop()!;
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
