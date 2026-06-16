"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
    rating: number; // 0-5
    maxStars?: number;
    size?: "sm" | "md" | "lg";
    showValue?: boolean;
    count?: number;
    interactive?: boolean;
    onChange?: (rating: number) => void;
}

const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
};

export function RatingStars({
    rating,
    maxStars = 5,
    size = "md",
    showValue = false,
    count,
    interactive = false,
    onChange,
}: RatingStarsProps) {
    const stars = [];

    for (let i = 1; i <= maxStars; i++) {
        const isFilled = i <= Math.round(rating);
        stars.push(
            <Star
                key={i}
                className={cn(
                    sizeClasses[size],
                    isFilled ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
                    interactive && "cursor-pointer hover:text-yellow-400 hover:fill-yellow-400 transition-colors"
                )}
                onClick={() => interactive && onChange?.(i)}
            />
        );
    }

    return (
        <div className="flex items-center gap-1">
            <div className="flex">{stars}</div>
            {showValue && (
                <span className="text-sm text-muted-foreground ml-1">
                    {rating.toFixed(1)}
                </span>
            )}
            {count !== undefined && (
                <span className="text-xs text-muted-foreground ml-1">
                    ({count} {count === 1 ? "reseña" : "reseñas"})
                </span>
            )}
        </div>
    );
}
