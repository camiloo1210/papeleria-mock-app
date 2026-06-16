export type AuthorType = 'BUSINESS' | 'USER';

export interface BusinessRatingProps {
    id?: number;
    targetBusinessId: number;
    rating: number;
    comment?: string | null;
    authorType: AuthorType;
    authorBusinessId?: number | null;
    authorUserId?: string | null;
    createdAt?: Date;
}

export class BusinessRating {
    private readonly id?: number;
    private readonly targetBusinessId: number;
    private readonly rating: number;
    private readonly comment?: string | null;
    private readonly authorType: AuthorType;
    private readonly authorBusinessId?: number | null;
    private readonly authorUserId?: string | null;
    private readonly createdAt?: Date;

    private constructor(props: BusinessRatingProps) {
        this.id = props.id;
        this.targetBusinessId = props.targetBusinessId;
        this.rating = props.rating;
        this.comment = props.comment;
        this.authorType = props.authorType;
        this.authorBusinessId = props.authorBusinessId;
        this.authorUserId = props.authorUserId;
        this.createdAt = props.createdAt;
    }

    public static create(props: BusinessRatingProps): BusinessRating {
        if (props.rating < 1 || props.rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }
        if (props.authorType === 'BUSINESS' && !props.authorBusinessId) {
            throw new Error('Author Business ID is required for BUSINESS ratings');
        }
        if (props.authorType === 'USER' && !props.authorUserId) {
            throw new Error('Author User ID is required for USER ratings');
        }
        return new BusinessRating(props);
    }

    public toPrimitives(): BusinessRatingProps {
        return {
            id: this.id,
            targetBusinessId: this.targetBusinessId,
            rating: this.rating,
            comment: this.comment,
            authorType: this.authorType,
            authorBusinessId: this.authorBusinessId,
            authorUserId: this.authorUserId,
            createdAt: this.createdAt,
        };
    }
}
