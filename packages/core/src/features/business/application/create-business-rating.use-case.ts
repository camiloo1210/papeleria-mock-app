import { BusinessRating } from "../domain/business-rating.entity";
import { BusinessRatingRepository } from "../domain/repositories/business-rating.repository";

interface CreateRatingDTO {
    targetBusinessId: number;
    rating: number;
    comment?: string;
    authorType: 'BUSINESS' | 'USER';
    authorId: string | number; // UUID for USER, Int for BUSINESS
}

export class CreateBusinessRatingUseCase {
    constructor(private readonly repository: BusinessRatingRepository) { }

    async execute(dto: CreateRatingDTO): Promise<BusinessRating> {
        let authorBusinessId: number | undefined;
        let authorUserId: string | undefined;

        if (dto.authorType === 'BUSINESS') {
            authorBusinessId = Number(dto.authorId);
        } else {
            authorUserId = String(dto.authorId);
        }

        const ratingEntity = BusinessRating.create({
            targetBusinessId: dto.targetBusinessId,
            rating: dto.rating,
            comment: dto.comment,
            authorType: dto.authorType,
            authorBusinessId,
            authorUserId,
        });

        return this.repository.create(ratingEntity);
    }
}
