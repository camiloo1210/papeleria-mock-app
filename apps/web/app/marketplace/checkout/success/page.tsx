import { Button } from "@/components/ui/button";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function CheckoutSuccessPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>

            <h1 className="text-3xl font-black text-gray-900 mb-2">¡Orden Confirmada!</h1>
            <p className="text-gray-600 text-lg max-w-md mb-8">
                Tus pedidos han sido enviados a los proveedores. Te notificaremos cuando comiencen a prepararlos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/marketplace">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                        Volver al Mercado
                    </Button>
                </Link>
                <Link href="/marketplace/orders">
                    <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700">
                        <ShoppingBag className="mr-2 h-5 w-5" />
                        Ver Mis Pedidos
                    </Button>
                </Link>
            </div>
        </div>
    );
}
