'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { UserPlus, Check, Clock, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { requestSupplierConnectionAction } from "@/features/relationships/actions/request-supplier-connection.action";
import { getBusinessRelationshipStatusAction } from "@/features/relationships/actions/get-business-relationship.action";
import { Loader2 } from "lucide-react";

interface Props {
    targetBusinessId: number;
}

export function ConnectSupplierButton({ targetBusinessId }: Props) {
    const [status, setStatus] = useState<'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED' | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const checkStatus = async () => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const result = await getBusinessRelationshipStatusAction(targetBusinessId) as any;
                if (result.success) {
                    setStatus(result.status);
                }
            } catch (error) {
                console.error("Failed to check status", error);
            } finally {
                setLoading(false);
            }
        };

        checkStatus();
    }, [targetBusinessId]);

    const handleConnect = async () => {
        setActionLoading(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await requestSupplierConnectionAction(targetBusinessId) as any;

            if (result.success) {
                setStatus('PENDING');
                toast({
                    title: "Solicitud enviada",
                    description: "Se ha enviado la solicitud de conexión al proveedor.",
                });
            } else {
                toast({
                    title: "Error",
                    description: result.error || "No se pudo enviar la solicitud.",
                    variant: "destructive",
                });
            }
        } catch (_error) {
            toast({
                title: "Error",
                description: "Ocurrió un error inesperado.",
                variant: "destructive",
            });
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return null;

    if (status === 'ACCEPTED') {
        return (
            <Button variant="outline" className="gap-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 cursor-default">
                <Check className="h-4 w-4" />
                Conectado
            </Button>
        );
    }

    if (status === 'PENDING') {
        return (
            <Button variant="outline" className="gap-2 bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 cursor-default">
                <Clock className="h-4 w-4" />
                Pendiente
            </Button>
        );
    }

    if (status === 'REJECTED' || status === 'BLOCKED') {
        return (
            <Button variant="outline" className="gap-2 bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed">
                <X className="h-4 w-4" />
                No disponible
            </Button>
        );
    }

    return (
        <Button
            onClick={handleConnect}
            disabled={actionLoading}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
        >
            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Conectar como Proveedor
        </Button>
    );
}
