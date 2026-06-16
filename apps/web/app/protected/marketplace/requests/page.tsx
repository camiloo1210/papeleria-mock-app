import { getIncomingRequestsAction } from "@/features/relationships/actions/get-incoming-requests.action";
import { RequestList } from "./request-list";
import { Separator } from "@/components/ui/separator";

export default async function MarketplaceRequestsPage() {
    const requests = await getIncomingRequestsAction();

    return (
        <div className="space-y-6 pt-6 block">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Solicitudes de Conexión</h2>
                <p className="text-muted-foreground">
                    Gestiona las empresas que quieren conectar contigo.
                </p>
            </div>
            <Separator className="my-6" />
            <RequestList requests={requests} />
        </div>
    );
}
