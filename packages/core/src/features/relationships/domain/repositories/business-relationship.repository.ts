import { BusinessRelationship } from "../business-relationship.entity";

export interface BusinessRelationshipRepository {
    createRequest(requesterId: number, targetId: number): Promise<BusinessRelationship>;
    acceptRequest(relationshipId: number): Promise<void>;
    rejectRequest(relationshipId: number): Promise<void>;
    findByBusinessIds(requesterId: number, targetId: number): Promise<BusinessRelationship | null>;
    findByRequesterId(requesterId: number): Promise<BusinessRelationship[]>;
}
