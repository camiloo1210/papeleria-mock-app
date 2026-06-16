'use client';

import { IncomingRequest } from "@/features/relationships/actions/get-incoming-requests.action";
import { acceptRequestAction } from "@/features/relationships/actions/accept-request.action";
import { rejectRequestAction } from "@/features/relationships/actions/reject-request.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Check, X, ShieldCheck } from "lucide-react";

interface Props {
    requests: IncomingRequest[];
}

export function RequestList({ requests: initialRequests }: Props) {
    const [requests, setRequests] = useState(initialRequests);
    const { toast } = useToast();
    const [processing, setProcessing] = useState<number | null>(null);

    const handleAccept = async (id: number) => {
        setProcessing(id);
        const res = await acceptRequestAction(id);
        setProcessing(null);

        if (res.success) {
            toast({ title: "Conexión Aceptada", description: "El proveedor se ha añadido a tu lista." });
            setRequests(prev => prev.filter(r => r.id !== id));
        } else {
            toast({ title: "Error", description: res.error || "Error desconocido", variant: "destructive" });
        }
    };

    const handleReject = async (id: number) => {
        setProcessing(id);
        const res = await rejectRequestAction(id);
        setProcessing(null);

        if (res.success) {
            toast({ title: "Solicitud Rechazada", description: "La conexión ha sido descartada." });
            setRequests(prev => prev.filter(r => r.id !== id));
        } else {
            toast({ title: "Error", description: res.error || "Error desconocido", variant: "destructive" });
        }
    };

    if (requests.length === 0) {
        return (
            <div className="text-center py-10">
                <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">Todo al día</h3>
                <p className="text-muted-foreground">No tienes solicitudes pendientes.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((request) => (
                <Card key={request.id}>
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={request.requesterLogoUrl || `/api/avatar/${request.requesterBusinessId}`} />
                            <AvatarFallback>{request.requesterName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <CardTitle className="text-base">{request.requesterName}</CardTitle>
                            <CardDescription className="text-xs">
                                Solicitado el {new Date(request.createdAt).toLocaleDateString()}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Quiere conectar contigo para establecer una relación comercial.
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-between gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleReject(request.id)}
                            disabled={processing === request.id}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Rechazar
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={() => handleAccept(request.id)}
                            disabled={processing === request.id}
                        >
                            <Check className="mr-2 h-4 w-4" />
                            Aceptar
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
