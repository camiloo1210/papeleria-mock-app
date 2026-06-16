
export interface BusinessRelationshipProps {
    id: number;
    requesterBusinessId: number;
    targetBusinessId: number;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED';
    createdAt: Date;
    updatedAt: Date;
}

export class BusinessRelationship {
    constructor(private props: BusinessRelationshipProps) { }

    static create(props: BusinessRelationshipProps): BusinessRelationship {
        return new BusinessRelationship(props);
    }

    get id(): number {
        return this.props.id;
    }

    get requesterBusinessId(): number {
        return this.props.requesterBusinessId;
    }

    get targetBusinessId(): number {
        return this.props.targetBusinessId;
    }

    get status(): 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED' {
        return this.props.status;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    toPrimitives(): BusinessRelationshipProps {
        return { ...this.props };
    }
}
