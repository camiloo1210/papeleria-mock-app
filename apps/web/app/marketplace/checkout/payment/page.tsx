import Link from "next/link";
import { CheckCircle2, Shield, CreditCard, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PaymentGatewayPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Mock Lemon Squeezy Modal */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
        
        {/* Order Summary Side */}
        <div className="w-full md:w-5/12 bg-gray-50 p-8 border-r border-gray-100">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
              <span className="font-bold text-yellow-900 text-xl leading-none">🍋</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">Lemon Squeezy</span>
          </div>

          <p className="text-sm text-gray-500 font-medium mb-1">Total a pagar</p>
          <div className="text-4xl font-black text-gray-900 mb-6">$86.00 <span className="text-lg text-gray-500 font-medium">USD</span></div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-600">Cuaderno Norma 100 Hojas (x10)</span>
              <span className="font-medium">$55.00</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-600">Marcadores Sharpie x4 (x2)</span>
              <span className="font-medium">$31.00</span>
            </div>
            <hr className="my-4 border-gray-200" />
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-600">Subtotal (Mayorista)</span>
              <span className="font-medium">$86.00</span>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Pago seguro procesado por Lemon Squeezy</span>
            </div>
          </div>
        </div>

        {/* Payment Details Side */}
        <div className="w-full md:w-7/12 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Detalles de Pago</h2>
          
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" placeholder="tu@correo.com" defaultValue="cliente@mayorista.com" />
            </div>

            <div className="space-y-4">
              <Label>Información de la tarjeta</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input className="pl-10 font-mono" placeholder="0000 0000 0000 0000" defaultValue="4242 4242 4242 4242" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input className="font-mono" placeholder="MM/YY" defaultValue="12/26" />
                <Input className="font-mono" placeholder="CVC" defaultValue="123" type="password" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nombre en la tarjeta</Label>
              <Input id="name" placeholder="Juan Pérez" defaultValue="Juan Pérez" />
            </div>

            <Link href="/marketplace/checkout/success" className="block mt-8">
              <Button className="w-full h-12 text-lg font-bold bg-[#7047EB] hover:bg-[#5a36c4] text-white">
                <Lock className="w-4 h-4 mr-2" /> Pagar $86.00 USD
              </Button>
            </Link>
          </form>
        </div>
      </div>
      
      <p className="mt-8 text-sm text-gray-400 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4" /> Pagos cifrados de extremo a extremo
      </p>
    </div>
  );
}
