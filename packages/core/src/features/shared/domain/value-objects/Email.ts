export class Email {
  private constructor(private readonly value: string) {}

  static create(email: string): Email {
    const trimmed = email.trim().toLowerCase();
    if (!this.isValid(trimmed)) {
      throw new Error('Invalid email format');
    }
    return new Email(trimmed);
  }

  private static isValid(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  getValue(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}