"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export interface BackButtonProps {
    href?: string
    label?: string
}

export function BackButton({ href, label = "Volver" }: BackButtonProps) {
    const router = useRouter()

    const handleClick = () => {
        if (href) {
            router.push(href)
        } else {
            router.back()
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleClick}
            className="mb-4 gap-2 pl-0 hover:bg-transparent hover:text-primary"
        >
            <ArrowLeft className="h-4 w-4" />
            <span>{label}</span>
        </Button>
    )
}
