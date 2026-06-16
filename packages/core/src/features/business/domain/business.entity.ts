import { TaxId } from "@/features/shared/domain/value-objects/TaxId";
import { CurrencyCode } from "@/features/shared/domain/value-objects/CurrencyCode";

export interface BusinessPrimitives {
    id?: number;
    uuid?: string;
    legal_name: string;
    trade_name: string;
    tax_id: string;
    taxpayer_type: string;
    logo_url: string;
    brand_color?: string;
    timezone?: string;
    currency: string;
    plan_id?: number;
    subscription_date?: Date;
    subscription_status?: string;
    status?: boolean;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
    country_id?: number;
    country_code?: string;
    categories?: string[];
    accepts_suppliers?: boolean;
}

export interface BusinessProps {
    id?: number;
    uuid?: string;
    legalName: string;
    tradeName: string;
    taxId: TaxId;
    taxpayerType: string;
    logoUrl: string;
    brandColor?: string;
    timezone?: string;
    currency?: CurrencyCode | string;
    planId?: number;
    subscriptionDate?: Date;
    subscriptionStatus?: string;
    status?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    countryId?: number;
    countryCode?: string;
    categories?: string[]; // Array of category slugs or names
    acceptsSuppliers?: boolean;
}

export class Business {
    private readonly id?: number;
    private readonly uuid?: string;
    private readonly legalName: string;
    private readonly tradeName: string;
    private readonly taxId: TaxId;
    private readonly taxpayerType: string;
    private readonly logoUrl: string;
    private readonly brandColor?: string;
    private readonly timezone?: string;
    private readonly currency: CurrencyCode;
    private readonly planId?: number;
    private readonly subscriptionDate?: Date;
    private readonly subscriptionStatus?: string;
    private readonly status?: boolean;
    private readonly createdAt?: Date;
    private readonly updatedAt?: Date;
    private readonly deletedAt?: Date;
    private readonly countryId?: number;
    private readonly countryCode?: string;
    private readonly categories?: string[];
    private readonly acceptsSuppliers?: boolean;

    private constructor(props: BusinessProps) {
        this.id = props.id;
        this.uuid = props.uuid;
        this.legalName = props.legalName;
        this.tradeName = props.tradeName;
        this.taxId = props.taxId;
        this.taxpayerType = props.taxpayerType;
        this.logoUrl = props.logoUrl;
        this.brandColor = props.brandColor;
        this.timezone = props.timezone;
        this.currency = typeof props.currency === 'string' ? CurrencyCode.create(props.currency) : (props.currency || CurrencyCode.create('USD'));
        this.planId = props.planId;
        this.subscriptionDate = props.subscriptionDate;
        this.subscriptionStatus = props.subscriptionStatus;
        this.status = props.status;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
        this.deletedAt = props.deletedAt;
        this.countryId = props.countryId;
        this.countryCode = props.countryCode;
        this.categories = props.categories;
        this.acceptsSuppliers = props.acceptsSuppliers;
    }

    public static create(props: BusinessProps): Business {
        // Here you could add validation logic before creating the object
        return new Business(props);
    }

    public getCurrency(): CurrencyCode {
        return this.currency;
    }

    public getTradeName(): string {
        return this.tradeName;
    }

    public getBrandColor(): string | undefined {
        return this.brandColor;
    }

    public getLogoUrl(): string {
        return this.logoUrl;
    }

    public getCountryId(): number | undefined {
        return this.countryId;
    }

    public getCountryCode(): string | undefined {
        return this.countryCode;
    }

    public getCategories(): string[] | undefined {
        return this.categories;
    }

    public getAcceptsSuppliers(): boolean {
        return this.acceptsSuppliers ?? false;
    }

    public toPrimitives(): BusinessPrimitives {
        return {
            id: this.id,
            uuid: this.uuid,
            legal_name: this.legalName,
            trade_name: this.tradeName,
            tax_id: this.taxId.getValue(),
            taxpayer_type: this.taxpayerType,
            logo_url: this.logoUrl,
            brand_color: this.brandColor,
            timezone: this.timezone,
            currency: this.currency.getValue(),
            plan_id: this.planId,
            subscription_date: this.subscriptionDate,
            subscription_status: this.subscriptionStatus,
            status: this.status,
            created_at: this.createdAt,
            updated_at: this.updatedAt,
            deleted_at: this.deletedAt,
            country_id: this.countryId,
            categories: this.categories,
            accepts_suppliers: this.acceptsSuppliers,
        };
    }
}
