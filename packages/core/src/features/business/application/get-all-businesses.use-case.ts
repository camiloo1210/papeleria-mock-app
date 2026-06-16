
import { Business } from "../domain/business.entity";
import { BusinessRepository } from "../domain/business.repository";

export class GetAllBusinessesUseCase {
    constructor(private readonly businessRepository: BusinessRepository) { }

    async execute(tenantId?: number): Promise<Business[]> {
        return this.businessRepository.findAll(tenantId);
    }
}
