import { CurrencyCode } from "./CurrencyCode";

export class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: CurrencyCode
  ) {
    // Amount can be negative for accounting purposes (e.g. returns, liabilities)
  }

  static from(amount: number | string, currency: CurrencyCode | string = 'USD'): Money {
    const currencyCode = typeof currency === 'string' ? CurrencyCode.create(currency) : currency;

    let numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
      console.warn(`[Money] Invalid amount received:`, amount);
      numericAmount = 0;
    }

    return new Money(Number(numericAmount.toFixed(2)), currencyCode);
  }

  add(other: Money): Money {
    if (!this.currency.equals(other.currency)) {
      throw new Error('Cannot add different currencies');
    }
    return Money.from(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (!this.currency.equals(other.currency)) {
      throw new Error('Cannot subtract different currencies');
    }
    // Allow negative result? Constructor throws if negative.
    // If business logic allows negative interim (e.g. refunds?), we might need to adjust constructor or checks.
    // Given 'Amount cannot be negative' in constructor, simple subtraction might fail if result < 0.
    // We will assume for invoices (subtotal + tax - discount) result is >= 0 usually.
    return Money.from(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return Money.from(this.amount * factor, this.currency);
  }

  toString(): string {
    return `${this.amount.toFixed(2)} ${this.currency.getValue()}`;
  }

  getValue(): number {
    return this.amount;
  }

  getCurrency(): CurrencyCode {
    return this.currency;
  }
}