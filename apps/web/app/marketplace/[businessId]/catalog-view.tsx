"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "../components/add-to-cart-button";

interface Product {
    id: number;
    uuid: string;
    name: string;
    description: string;
    price: number;
    image_path?: string;
    tenant_id: number;
    stock: number;
    business_name: string;
    category_name: string;
    wholesale_price: number;
}

interface CatalogViewProps {
    products: Product[];
    businessUuid: string;
}

export function CatalogView({ products, businessUuid }: CatalogViewProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Todas");

    // Get unique categories
    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category_name));
        return ["Todas", ...Array.from(cats)];
    }, [products]);

    // Filter products
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesCategory = selectedCategory === "Todas" || product.category_name === selectedCategory;
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  product.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [products, selectedCategory, searchQuery]);

    return (
        <div className="space-y-6">
            {/* Search and Category Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Buscar en esta tienda..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10 w-full bg-white rounded-xl border-gray-200 focus-visible:ring-indigo-500 shadow-sm"
                    />
                </div>

                {/* Category Rail */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {categories.map((cat) => {
                        const isActive = selectedCategory === cat;
                        return (
                            <Button
                                key={cat}
                                variant={isActive ? "default" : "secondary"}
                                onClick={() => setSelectedCategory(cat)}
                                className={`rounded-full px-4 h-9 text-xs font-semibold whitespace-nowrap transition-all ${
                                    isActive 
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                                        : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 shadow-sm'
                                }`}
                            >
                                {cat}
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-500">No se encontraron productos que coincidan con la búsqueda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <div key={product.uuid} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full transform hover:-translate-y-1">
                            <Link href={`/marketplace/${businessUuid}/products/${product.uuid}`} className="flex-1 flex flex-col">
                                {/* Image Area */}
                                <div className="relative h-48 w-full bg-gray-50 p-4 flex items-center justify-center">
                                    {product.image_path ? (
                                        <Image
                                            src={product.image_path}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <span className="text-6xl grayscale opacity-30 select-none">🍟</span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4 flex flex-col flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">{product.category_name}</span>
                                        <div className="flex items-center gap-2">
                                            {product.wholesale_price && product.wholesale_price > 0 && (
                                                <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-purple-200 uppercase tracking-wide">
                                                    Mayorista
                                                </span>
                                            )}
                                            <div className={`flex items-center text-xs gap-1 font-medium ${product.stock > 20 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-500'}`}>
                                                <span className={`h-2 w-2 rounded-full ${product.stock > 20 ? 'bg-green-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                                                <span>{product.stock > 20 ? 'Disp.' : product.stock > 0 ? 'Pocos' : 'Agotado'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="text-gray-900 font-bold text-lg leading-tight mb-2 line-clamp-2">{product.name}</h3>
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{product.description}</p>

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto">
                                        <div>
                                            <span className="block text-xs text-gray-400">Precio</span>
                                            <span className="text-xl font-black text-gray-900">${product.price.toFixed(2)}</span>
                                        </div>
                                        <div className="w-auto" onClick={(e) => e.stopPropagation()}>
                                            <AddToCartButton
                                                productId={product.id}
                                                name={product.name}
                                                price={product.price}
                                                wholesalePrice={product.wholesale_price}
                                                imageUrl={product.image_path}
                                                supplierId={product.tenant_id}
                                                supplierName={product.business_name || 'Proveedor'}
                                                stock={product.stock}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
