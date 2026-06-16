export interface MarketplaceBusiness {
    id: number;
    uuid: string;
    tradeName: string;
    legalName: string;
    logoUrl: string | null;
    brandColor: string | null;
    ratingAverage: number;
    ratingCount: number;
    acceptsSuppliers: boolean;
    categories: string[];
}
