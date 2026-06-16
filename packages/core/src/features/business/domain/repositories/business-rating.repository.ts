import { BusinessRating } from "../business-rating.entity";

export interface BusinessRatingRepository {
    create(rating: BusinessRating): Promise<BusinessRating>;
    findByTargetBusinessId(targetBusinessId: number): Promise<BusinessRating[]>;
}
