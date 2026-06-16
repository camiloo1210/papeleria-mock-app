"use client"

import { useState } from "react"
import { toast as sonnerToast } from "sonner"

type ToastProps = {
    title?: string
    description?: string
    variant?: "default" | "destructive"
}

export function useToast() {
    const [toasts] = useState<ToastProps[]>([])

    const toast = ({ title, description, variant = "default" }: { title?: string, description?: string, variant?: "default" | "destructive" }) => {
        if (variant === "destructive") {
            sonnerToast.error(title || "Error", { description });
        } else {
            sonnerToast(title || "Notificación", { description });
        }
    }

    return {
        toast,
        toasts
    }
}
