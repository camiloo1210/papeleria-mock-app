import { BusinessRelationshipRepository } from "../domain/repositories/business-relationship.repository";
import { BusinessRelationship } from "../domain/business-relationship.entity";
import { createServiceRoleClient } from "@/lib/supabase/server";

export class SupabaseBusinessRelationshipRepository implements BusinessRelationshipRepository {
    async createRequest(requesterId: number, targetId: number): Promise<BusinessRelationship> {
        const supabase = createServiceRoleClient();
        const { data, error } = await supabase
            .schema('core')
            .from('business_relationships')
            .insert({
                requester_business_id: requesterId,
                target_business_id: targetId,
                status: 'PENDING'
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        return this.mapToEntity(data);
    }

    async acceptRequest(relationshipId: number): Promise<void> {
        const supabase = createServiceRoleClient();
        const { error } = await supabase
            .schema('core')
            .from('business_relationships')
            .update({ status: 'ACCEPTED', updated_at: new Date().toISOString() })
            .eq('id', relationshipId);

        if (error) throw new Error(error.message);
    }

    async rejectRequest(relationshipId: number): Promise<void> {
        const supabase = createServiceRoleClient();
        const { error } = await supabase
            .schema('core')
            .from('business_relationships')
            .update({ status: 'REJECTED', updated_at: new Date().toISOString() })
            .eq('id', relationshipId);

        if (error) throw new Error(error.message);
    }

    async findByBusinessIds(requesterId: number, targetId: number): Promise<BusinessRelationship | null> {
        const supabase = createServiceRoleClient();
        const { data, error } = await supabase
            .schema('core')
            .from('business_relationships')
            .select('*')
            .or(`and(requester_business_id.eq.${requesterId},target_business_id.eq.${targetId}),and(requester_business_id.eq.${targetId},target_business_id.eq.${requesterId})`)
            .single();

        if (error || !data) return null;

        return this.mapToEntity(data);
    }

    async findByRequesterId(requesterId: number): Promise<BusinessRelationship[]> {
        const supabase = createServiceRoleClient();
        const { data, error } = await supabase
            .schema('core')
            .from('business_relationships')
            .select('*')
            .eq('requester_business_id', requesterId);

        if (error) return [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (data as any[]).map(this.mapToEntity);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private mapToEntity(data: any): BusinessRelationship {
        return BusinessRelationship.create({
            id: data.id,
            requesterBusinessId: data.requester_business_id,
            targetBusinessId: data.target_business_id,
            status: data.status,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        });
    }
}
