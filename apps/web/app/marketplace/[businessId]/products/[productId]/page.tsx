import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Star, Truck, ShieldCheck, Box } from "lucide-react";

import { SupabaseMarketplaceRepository } from "@/features/marketplace/infrastructure/supabase-marketplace.repository";
import { notFound } from "next/navigation";
import { ProductActions } from "./product-actions";

export default async function ProductDetailPage({ params }: { params: Promise<{ businessId: string, productId: string }> }) {
  const resolvedParams = await params;
  const businessUuid = resolvedParams.businessId;
  const productUuid = resolvedParams.productId;

  const repo = new SupabaseMarketplaceRepository();
  const business = await repo.findBusinessByUuid(businessUuid);
  if (!business) return notFound();

  const products = await repo.findProductsByBusiness(business.id);
  const product = products.find(p => p.uuid === productUuid);

  if (!product) return notFound();

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/marketplace/${businessUuid}`} className="text-gray-500 hover:text-gray-900 flex items-center gap-2 w-fit font-medium">
            <ArrowLeft className="h-5 w-5" />
            Volver al catálogo
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="bg-gray-100 p-12 flex items-center justify-center relative min-h-[400px]">
              {product.image_path ? (
                <Image src={product.image_path} alt={product.name} fill className="object-cover" />
              ) : (
                <span className="text-9xl grayscale opacity-40 select-none">🫒</span>
              )}
              <div className="absolute top-6 left-6 flex gap-2">
                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded border border-purple-200 uppercase tracking-wide">
                  Mayorista
                </span>
              </div>
            </div>

            {/* Details Section */}
            <div className="p-8 md:p-12 flex flex-col">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-indigo-500 uppercase tracking-wider">{product.sku}</span>
                <div className="flex items-center text-sm gap-1 text-gray-500">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>4.9 (128 reseñas)</span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-4">
                {product.name}
              </h1>

              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-4xl font-black text-gray-900">${product.price.toFixed(2)} USD</span>
                  <span className="text-gray-500 text-lg mb-1">Precio Unitario</span>
                </div>
                <div className="flex items-center gap-2 text-purple-700 font-semibold">
                  <span className="text-xl">${product.wholesale_price.toFixed(2)} USD</span>
                  <span>Precio Mayorista (a partir de 10 uds)</span>
                </div>
              </div>

              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {product.description}
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Box className="w-5 h-5 text-indigo-500" />
                  <span>Disponibilidad de stock: <strong className="text-green-600 font-bold">{product.stock} unidades en bodega</strong></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck className="w-5 h-5 text-indigo-500" />
                  <span>Envío gratis en pedidos superiores a $100</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <ShieldCheck className="w-5 h-5 text-indigo-500" />
                  <span>Garantía de calidad extendida</span>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t">
                <ProductActions 
                  productId={product.id}
                  name={product.name}
                  price={product.price}
                  wholesalePrice={product.wholesale_price}
                  imagePath={product.image_path}
                  stock={product.stock}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
