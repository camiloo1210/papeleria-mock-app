export interface NationalIdUiConfig {
    type: string;
    label: string;
    maxLength: number;
    placeholder: string;
    errorMessage: string;
}

export interface NationalIdUiStrategy {
    getSupportedIdTypes(): NationalIdUiConfig[];
    getDefaultIdType(): string;
}
