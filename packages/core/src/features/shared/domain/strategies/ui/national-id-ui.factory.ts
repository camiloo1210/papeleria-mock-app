import { NationalIdUiStrategy } from './national-id-ui.strategy';
import { EcuadorNationalIdUiStrategy } from './ecuador-national-id-ui.strategy';

export class NationalIdUiFactory {
    static getStrategy(countryCode?: string): NationalIdUiStrategy {
        if (!countryCode) {
            return new EcuadorNationalIdUiStrategy(); // Default to Ecuador for now
        }

        switch (countryCode.toUpperCase()) {
            case 'EC':
                return new EcuadorNationalIdUiStrategy();
            // Future cases:
            // case 'CO': return new ColombiaNationalIdUiStrategy();
            default:
                return new EcuadorNationalIdUiStrategy();
        }
    }
}
