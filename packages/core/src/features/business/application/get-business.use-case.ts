import { Business } from "../domain/business.entity";
import { BusinessRepository } from "../domain/business.repository";

export class GetBusinessUseCase {
    constructor(private readonly businessRepository: BusinessRepository) { }

    async execute(id: number): Promise<Business | null> {
        return this.businessRepository.findById(id);
    }
}
