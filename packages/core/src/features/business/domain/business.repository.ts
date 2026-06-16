
import { Business } from "./business.entity";

export interface BusinessRepository {
    findAll(tenantId?: number): Promise<Business[]>;
    findById(id: number): Promise<Business | null>;
    findByUuid(uuid: string): Promise<Business | null>;
    create(business: Business): Promise<Business>;
    update(id: number, business: Business, tenantId: number): Promise<Business>;
    delete(id: number, tenantId: number): Promise<void>;
}
