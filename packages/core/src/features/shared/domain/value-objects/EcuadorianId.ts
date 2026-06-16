export class EcuadorianId {
    private constructor(private readonly value: string) { }

    static create(id: string): EcuadorianId {
        const cleaned = id.replace(/\D/g, '');

        if (!this.isValid(cleaned)) {
            throw new Error('Cédula o RUC inválido');
        }

        return new EcuadorianId(cleaned);
    }

    static isValid(id: string): boolean {
        // Basic length check
        if (id.length !== 10 && id.length !== 13) return false;

        // Province code check (first 2 digits must be between 01 and 24, or 30)
        const provinceCode = parseInt(id.substring(0, 2), 10);
        if ((provinceCode < 1 || provinceCode > 24) && provinceCode !== 30) return false;

        // Third digit check
        const thirdDigit = parseInt(id.substring(2, 3), 10);
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

    private static validateCedula(cedula: string): boolean {
        if (cedula.length !== 10) return false;

        const digits = cedula.split('').map(Number);
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

        const modulus = sum % 10;
        const calculatedVerifier = modulus === 0 ? 0 : 10 - modulus;

        return calculatedVerifier === verifier;
    }

    private static validatePublicEntity(ruc: string): boolean {
        // RUC ending must be 0001 (usually) but typically just checks valid checksum
        if (ruc.length !== 13) return false;
        if (ruc.substring(9, 13) === '0000') return false; // Must have establishment

        // Modulo 11 with coefficients 3,2,7,6,5,4,3,2
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

    private static validatePrivateEntity(ruc: string): boolean {
        if (ruc.length !== 13) return false;
        if (ruc.substring(10, 13) === '0000') return false;

        // Modulo 11 with coefficients 4,3,2,7,6,5,4,3,2
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

    getValue(): string {
        return this.value;
    }

    toString(): string {
        return this.value;
    }
}
