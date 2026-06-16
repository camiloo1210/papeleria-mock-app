'use server';

import { createClient } from '@/lib/supabase/server';
import { SupabaseBusinessRatingRepository } from '@/features/business/infrastructure/repositories/supabase-business-rating.repository';

// Assuming we want aggregations too. For now let's reuse repository.
// We might want to expand repository to return stats (count/avg) separately or use a view.
// But keeping it simple for MVP.

export async function getBusinessRatingsAction(targetBusinessId: number) {
    const supabase = await createClient();
    const repository = new SupabaseBusinessRatingRepository(supabase);

    try {
        const ratings = await repository.findByTargetBusinessId(targetBusinessId);

        // Calculate basic stats manually for now (since we fetch all)
        // In production with 1000s of ratings, we should use a DB view or rpc.
        const count = ratings.length;
        const avg = count > 0
            ? ratings.reduce((sum, r) => sum + r.toPrimitives().rating, 0) / count
            : 0;

        return {
            success: true,
            data: {
                ratings: ratings.map(r => r.toPrimitives()),
                stats: {
                    count,
                    average: Number(avg.toFixed(1))
                }
            }
        };
    } catch (error: unknown) {
        console.error('Error fetching ratings:', error);
        return { success: false, error: 'Failed to fetch ratings' };
    }
}
