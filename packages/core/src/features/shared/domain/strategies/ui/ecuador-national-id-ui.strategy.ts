import { NationalIdUiStrategy, NationalIdUiConfig } from './national-id-ui.strategy';

export class EcuadorNationalIdUiStrategy implements NationalIdUiStrategy {
    getSupportedIdTypes(): NationalIdUiConfig[] {
        return [
            {
                type: 'CEDULA',
                label: 'Cédula',
                maxLength: 10,
                placeholder: '17...',
                errorMessage: 'La Cédula debe tener 10 dígitos.'
            },
            {
                type: 'RUC',
                label: 'RUC',
                maxLength: 13,
                placeholder: '17...001',
                errorMessage: 'El RUC debe tener 13 dígitos.'
            }
        ];
    }

    getDefaultIdType(): string {
        return 'CEDULA';
    }
}
