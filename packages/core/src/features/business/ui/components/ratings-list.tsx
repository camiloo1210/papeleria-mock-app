import { getBusinessRatingsAction } from "@/features/business/actions/get-business-ratings.action";
import { RatingStars } from "./rating-stars";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface RatingsListProps {
    targetBusinessId: number;
}

export async function RatingsList({ targetBusinessId }: RatingsListProps) {
    const { data, success } = await getBusinessRatingsAction(targetBusinessId);

    if (!success || !data || data.ratings.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground bg-gray-50 rounded-lg border border-dashed">
                <p>No hay reseñas todavía. ¡Sé el primero en opinar!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
                Reseñas
                <span className="text-sm font-normal text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
                    {data.stats.count}
                </span>
            </h3>

            <div className="grid gap-4">
                {data.ratings.map((rating) => (
                    <div key={rating.id} className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                        {rating.authorType === 'BUSINESS' ? 'B' : 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium">
                                        {rating.authorType === 'BUSINESS' ? 'Negocio' : 'Usuario'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {rating.createdAt && formatDistanceToNow(new Date(rating.createdAt), { addSuffix: true, locale: es })}
                                    </p>
                                </div>
                            </div>
                            <RatingStars rating={rating.rating} size="sm" />
                        </div>

                        {rating.comment && (
                            <p className="text-sm text-gray-700 mt-2 pl-11">
                                {rating.comment}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
