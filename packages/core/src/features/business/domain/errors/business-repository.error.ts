export class BusinessRepositoryError extends Error {
    public readonly code: string;

    constructor(message: string, code: string) {
        super(message);
        this.name = 'BusinessRepositoryError';
        this.code = code;
        Object.setPrototypeOf(this, BusinessRepositoryError.prototype);
    }
}
