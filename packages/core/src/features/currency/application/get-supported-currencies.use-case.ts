export class GetSupportedCurrenciesUseCase {
  async execute() {
    return [{ code: 'USD', name: 'US Dollar', symbol: '$' }];
  }
}
