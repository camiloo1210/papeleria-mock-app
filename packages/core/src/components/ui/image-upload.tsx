"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { UploadCloud, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
    tenantId: number;
    value?: string | null;
    defaultPreviewUrl?: string | null;
    onChange: (path: string) => void;
    onRemove: () => void;
    disabled?: boolean;
    bucketName?: string;
    className?: string; // Added prop
}

export function ImageUpload({
    tenantId,
    defaultPreviewUrl,
    onChange,
    onRemove,
    disabled,
    bucketName = "products",
    className,
    value, // Destructured
}: ImageUploadProps) {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(defaultPreviewUrl || (value ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${value}` : null) || null);
    const supabase = createClient();

    // Sync preview with value if it changes externally (e.g. initial load)
    // Actually defaultPreviewUrl is usually static. Value is dynamic path.
    // If value is provided but no preview, try to construct likely URL.

    // Logic to construct URL if value is present and preview is null?
    // The component state initialization above handles it if passed initially. 
    // But if value updates? usually controlled.
    // Let's stick to simple className addition first not to break existing logic.

    const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${crypto.randomUUID()}.${fileExt}`;
            const filePath = `${tenantId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            onChange(filePath);
        } catch (error) {
            console.error("Upload error:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error uploading image"
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        onRemove();
        setPreview(null);
        if (preview && preview.startsWith("blob:")) {
            URL.revokeObjectURL(preview);
        }
    };

    return (
        <div className={cn("flex items-center gap-4", className)}>
            {preview ? (
                <div className={cn("relative w-40 h-40 rounded-md overflow-hidden border", className)}>
                    <Image
                        src={preview}
                        alt="Product Image"
                        fill
                        className="object-cover"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                    >
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <label
                    className={cn(
                        "w-40 h-40 flex flex-col items-center justify-center border-2 border-dashed rounded-md cursor-pointer hover:bg-accent/50 transition bg-muted/10",
                        disabled && "opacity-50 cursor-not-allowed",
                        className
                    )}
                >
                    {isUploading ? (
                        <Loader2 className="animate-spin text-muted-foreground w-6 h-6" />
                    ) : (
                        <>
                            <UploadCloud className="w-6 h-6 text-muted-foreground mb-1" />
                            <span className="text-[10px] text-muted-foreground text-center px-1">Subir</span>
                        </>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onUpload}
                        disabled={disabled || isUploading}
                    />
                </label>
            )}
        </div>
    );
}
