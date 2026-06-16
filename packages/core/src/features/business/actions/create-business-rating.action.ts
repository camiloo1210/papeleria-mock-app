'use server';

import { createClient } from '@/lib/supabase/server';
import { SupabaseBusinessRatingRepository } from '@/features/business/infrastructure/repositories/supabase-business-rating.repository';
import { CreateBusinessRatingUseCase } from '@/features/business/application/create-business-rating.use-case';

interface CreateRatingInput {
    targetBusinessId: number;
    rating: number;
    comment?: string;
    asBusinessId?: number; // Optional: If rating as a Business (B2B)
}

export async function createBusinessRatingAction(input: CreateRatingInput) {
    const supabase = await createClient();

    // 1. Authenticate User
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, error: 'Unauthorized: User not logged in' };
    }

    try {
        // 2. Resolve Author Identity
        let authorType: 'BUSINESS' | 'USER' = 'USER';
        let authorId: string | number = user.id;

        if (input.asBusinessId) {
            // Check if user has permission to act on behalf of this business
            // We need to check core.employees table.
            // But core.employees links to core.users(id), not auth.users(uuid).
            // So we join core.employees -> core.users.

            const { data: employee, error: empError } = await supabase
                .schema('core')
                .from('employees')
                .select('role_id, roles(name), user_id, users!inner(uuid)')
                .eq('tenant_id', input.asBusinessId)
                .eq('users.uuid', user.id)
                .single();

            if (empError || !employee) {
                console.error('Authorization fetch error:', empError);
                return { success: false, error: 'Unauthorized: You are not an employee of this business.' };
            }

            // Check Role (Optional: allow only Admin/Owner?)
            // For now, let's assume any employee can rate? 
            // Better stick to Admin/Owner as per migration policy
            // Policy: role_id in (select id from core.roles where name in ('ADMIN', 'OWNER'))

            // Let's verify role name
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const roleName = (employee.roles as any)?.name;
            if (!['ADMIN', 'OWNER'].includes(roleName)) {
                return { success: false, error: 'Unauthorized: Only Admins or Owners can rate on behalf of business.' };
            }

            authorType = 'BUSINESS';
            authorId = input.asBusinessId;
        }

        // 3. Create Rating
        const repository = new SupabaseBusinessRatingRepository(supabase);
        const useCase = new CreateBusinessRatingUseCase(repository);

        const result = await useCase.execute({
            targetBusinessId: input.targetBusinessId,
            rating: input.rating,
            comment: input.comment,
            authorType,
            authorId
        });

        return { success: true, data: result.toPrimitives() };

    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        console.error('Error creating rating:', err);
        return { success: false, error: err.message || 'Failed to create rating' };
    }
}
