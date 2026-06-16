import { SupabaseClient } from '@supabase/supabase-js';
import { BusinessRatingRepository } from '../../domain/repositories/business-rating.repository';
import { BusinessRating } from '../../domain/business-rating.entity';

export class SupabaseBusinessRatingRepository implements BusinessRatingRepository {
    constructor(private readonly supabase: SupabaseClient) { }

    async create(rating: BusinessRating): Promise<BusinessRating> {
        const primitives = rating.toPrimitives();

        const { data, error } = await this.supabase
            .schema('core')
            .from('business_ratings')
            .insert({
                target_business_id: primitives.targetBusinessId,
                rating: primitives.rating,
                comment: primitives.comment,
                author_type: primitives.authorType,
                author_business_id: primitives.authorBusinessId,
                author_user_id: primitives.authorUserId,
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return this.toDomain(data);
    }

    async findByTargetBusinessId(targetBusinessId: number): Promise<BusinessRating[]> {
        const { data, error } = await this.supabase
            .schema('core')
            .from('business_ratings')
            .select('*')
            .eq('target_business_id', targetBusinessId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data.map(this.toDomain);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private toDomain(row: any): BusinessRating {
        return BusinessRating.create({
            id: row.id,
            targetBusinessId: row.target_business_id,
            rating: row.rating,
            comment: row.comment,
            authorType: row.author_type,
            authorBusinessId: row.author_business_id,
            authorUserId: row.author_user_id,
            createdAt: new Date(row.created_at),
        });
    }
}
