// src/shared/domain/value-objects/Password.ts

export class Password {
  private constructor(private readonly value: string) {}

  static create(plain: string): Password {
    if (plain.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    return new Password(plain);
  }


  getValue(): string {
    return this.value;
  }

  toString(): string {
    return '[REDACTED]'; 
  }
}