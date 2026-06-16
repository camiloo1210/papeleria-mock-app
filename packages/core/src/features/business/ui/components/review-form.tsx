"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RatingStars } from "./rating-stars";
import { createBusinessRatingAction } from "@/features/business/actions/create-business-rating.action";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ReviewFormProps {
    targetBusinessId: number;
    asBusinessId?: number; // If rating as a business (B2B)
    onSuccess?: () => void;
}

export function ReviewForm({ targetBusinessId, asBusinessId, onSuccess }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast({
                title: "Error",
                description: "Por favor selecciona una calificación.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const result = await createBusinessRatingAction({
                targetBusinessId,
                rating,
                comment: comment.trim() || undefined,
                asBusinessId,
            });

            if (result.success) {
                toast({
                    title: "¡Gracias!",
                    description: "Tu reseña ha sido enviada.",
                });
                setRating(0);
                setComment("");
                onSuccess?.();
            } else {
                toast({
                    title: "Error",
                    description: result.error || "No se pudo enviar la reseña.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Ocurrió un error inesperado.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-4 bg-card">
            <div className="space-y-2">
                <Label>Tu calificación</Label>
                <RatingStars
                    rating={rating}
                    size="lg"
                    interactive
                    onChange={setRating}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="comment">Comentario (opcional)</Label>
                <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe tu experiencia..."
                    rows={3}
                />
            </div>

            <Button type="submit" disabled={loading || rating === 0}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Enviando..." : "Enviar Reseña"}
            </Button>
        </form>
    );
}
