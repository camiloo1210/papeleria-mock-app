"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { createProductAction, updateProductAction } from '@/features/products/action'
import { ProductStatus } from '@/features/products/domain/product.entity'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { SupabaseBusinessRepository } from "@/features/business/infrastructure/supabase-business.repository"
import { GetBusinessByIdUseCase } from "@/features/business/application/get-business-by-id.use-case"
// TODO [EXTRACCION]: import a modulo no incluido en este repo -> categories (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { Category } from "@/features/categories/domain/category.entity"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ImageUpload } from "@/components/ui/image-upload"
import { DollarSign, Box, Type, FileText } from 'lucide-react';
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { ProductVariantManager } from "./product-variant-manager"
import { ProductVariantPrimitives } from "@/features/products/domain/product-variant.entity"

const productFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .min(1, { message: "El nombre es requerido." })
    .min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  hasVariants: z.boolean(),
  price: z
    .string()
    .refine((val) => !isNaN(Number(val)), { message: "El precio debe ser un número." })
    .refine((val) => Number(val) >= 0, { message: "El precio debe ser un número positivo." }),
  cost: z
    .string()
    .refine((val) => !isNaN(Number(val)), { message: "El costo debe ser un número." })
    .refine((val) => Number(val) >= 0, { message: "El costo no puede ser negativo." }),
  stock: z
    .string()
    .refine((val) => !isNaN(Number(val)), { message: "El stock debe ser un número." })
    .refine((val) => Number.isInteger(Number(val)), { message: "El stock debe ser un número entero." })
    .refine((val) => Number(val) >= 0, { message: "El stock no puede ser negativo." }),
  description: z
    .string()
    .min(1, { message: "La descripción es requerida." })
    .min(10, { message: "La descripción debe tener al menos 10 caracteres." }),
  categoryId: z
    .string()
    .min(1, { message: "La categoría es requerida." })
    .uuid({ message: "El ID de la categoría no es un UUID válido." }),
  status: z.nativeEnum(ProductStatus).optional(),
  seasonIds: z.array(z.string()).optional(),
  imagePath: z.string().optional(),
  variants: z.array(z.any()).optional(),
  isVatExempt: z.boolean().optional(),
  wholesalePrice: z
    .string()
    .refine((val) => !isNaN(Number(val)), { message: "El precio mayorista debe ser un número." })
    .refine((val) => Number(val) >= 0, { message: "El precio mayorista no puede ser negativo." })
    .optional(),
})

type ProductFormValues = z.infer<typeof productFormSchema>

export type ProductData = {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  description: string;
  categoryId: string;
  expirationDate: Date | null;
  status: ProductStatus;
  seasonIds?: string[];
  imagePath?: string | null;
  imageUrl?: string | null;
  hasVariants?: boolean;
  variants?: ProductVariantPrimitives[];
  isVatExempt?: boolean;
  wholesalePrice?: number;
}

export type SeasonPrimitive = {
  id: number;
  uuid: string;
  tenant_id: number;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  is_active: boolean;
}

export type ProductFormProps = {
  productData?: ProductData | null;
  categories?: Category[];
  seasons?: SeasonPrimitive[];
  tenantId: number;
}

export default function ProductForm({ productData, categories = [], seasons = [], tenantId }: ProductFormProps) {
  const router = useRouter()
  const isEditing = !!productData;
  const [businessCurrency, setBusinessCurrency] = useState('USD');

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const businessRepository = new SupabaseBusinessRepository(supabase);
      const getBusinessByIdUseCase = new GetBusinessByIdUseCase(businessRepository);
      const business = await getBusinessByIdUseCase.execute(1);
      if (business) {
        const primitives = business.toPrimitives();
        if (primitives.currency) {
          setBusinessCurrency(primitives.currency);
        }
      }
    };
    fetchData();
  }, []);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      id: productData?.id,
      name: productData?.name || "",
      price: String(productData?.price || "0"),
      cost: String(productData?.cost || "0"),
      stock: String(productData?.stock || "0"),
      description: productData?.description || "",
      categoryId: productData?.categoryId || "",
      status: productData?.status || ProductStatus.ACTIVE,
      seasonIds: productData?.seasonIds || [],
      imagePath: productData?.imagePath || undefined,
      hasVariants: productData?.hasVariants || false,
      variants: productData?.variants || [],
      isVatExempt: productData?.isVatExempt || false,
      wholesalePrice: String(productData?.wholesalePrice || "0"),
    },
    mode: "onChange",
  })

  // Watch hasVariants to conditionally render fields
  const hasVariants = form.watch("hasVariants");
  const currentPrice = form.watch("price");
  const currentCost = form.watch("cost");
  const currentName = form.watch("name");

  async function onSubmit(data: ProductFormValues) {
    try {
      const formData = new FormData()

      if (data.id) {
        formData.append('id', data.id)
      }

      formData.append('name', data.name)
      formData.append('description', data.description)
      formData.append('categoryId', data.categoryId)
      formData.append('status', data.status || ProductStatus.ACTIVE)

      // If has variants, price/cost/stock on parent are placeholders or aggregates
      // But domain requires them. Send 0 or base.
      formData.append('price', data.price)
      formData.append('cost', data.cost)
      formData.append('stock', data.stock)

      formData.append('stock', data.stock)

      formData.append('hasVariants', String(data.hasVariants))
      formData.append('isVatExempt', String(data.isVatExempt))
      formData.append('wholesalePrice', data.wholesalePrice || '0')

      if (data.hasVariants && data.variants) {
        formData.append('variants', JSON.stringify(data.variants));
      }

      if (data.seasonIds) {
        data.seasonIds.forEach(id => formData.append('seasonIds', id));
      }

      if (typeof data.imagePath === 'string') {
        formData.append('imagePath', data.imagePath);
      }

      if (isEditing) {
        await updateProductAction(formData)
      } else {
        await createProductAction(formData)
      }

      router.push('/products')
      router.refresh()
    } catch (error) {
      console.error("Error al guardar el producto:", error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Columna Izquierda (Principal) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Tarjeta 1: Detalles del Producto */}
            <Card className="border-muted/60 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/5 border-b pb-4">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Detalles del Producto
                </CardTitle>
                <CardDescription>
                  Información básica del producto para su identificación.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <FormField
                  control={form.control}
                  name="imagePath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagen del Producto</FormLabel>
                      <FormControl>
                        <ImageUpload
                          tenantId={tenantId}
                          value={field.value}
                          defaultPreviewUrl={productData?.imageUrl}
                          onChange={field.onChange}
                          onRemove={() => field.onChange("")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Producto</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Type className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Ej: Laptop Pro 15" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe las características principales..."
                            className="min-h-[120px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Una buena descripción ayuda a mejorar la visibilidad del producto.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Switch de Variantes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-base">Variantes</CardTitle>
                  <CardDescription>
                    ¿Este producto tiene opciones como talla o color?
                  </CardDescription>
                </div>
                <FormField
                  control={form.control}
                  name="hasVariants"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardHeader>
            </Card>

            {/* IF VARIANTS ENABLED: Show Manager */}
            {hasVariants ? (
              <FormField
                control={form.control}
                name="variants"
                render={({ field }) => (
                  <ProductVariantManager
                    value={field.value}
                    onChange={field.onChange}
                    basePrice={currentPrice}
                    baseCost={currentCost}
                    baseSku={currentName ? `${currentName.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}` : 'SKU'}
                    tenantId={tenantId}
                  />
                )}
              />
            ) : (
              /* ELSE: Show Standard Inventory Card */
              <Card className="border-muted/60 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/5 border-b pb-4">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Box className="h-5 w-5 text-primary" />
                    Inventario y Precios
                  </CardTitle>
                  <CardDescription>
                    Gestiona el costo, precio de venta y disponibilidad.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio ({businessCurrency})</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="0.00"
                                type="number"
                                step="0.01"
                                className="pl-9"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Costo ({businessCurrency})</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="0.00"
                                type="number"
                                step="0.01"
                                className="pl-9"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="wholesalePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio Mayorista ({businessCurrency})</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="0.00"
                                type="number"
                                step="0.01"
                                className="pl-9"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Precio para ventas al por mayor en el Marketplace B2B. Si es 0, se usará el precio retail.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Box className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="0"
                                type="number"
                                step="1"
                                className="pl-9"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isVatExempt"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Producto de Primera Necesidad (IVA 0%)
                            </FormLabel>
                            <FormDescription>
                              Marca esta opción si el producto está exento de impuestos.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Columna Derecha (Lateral) */}
          <div className="space-y-8">

            {/* Tarjeta 3: Organización */}
            <Card>
              <CardHeader>
                <CardTitle>Organización</CardTitle>
                <CardDescription>
                  Clasificación y estado del producto.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={ProductStatus.ACTIVE}>Activo</SelectItem>
                          <SelectItem value={ProductStatus.INACTIVE}>Inactivo</SelectItem>
                          <SelectItem value={ProductStatus.OUT_OF_STOCK}>Sin Stock</SelectItem>
                          <SelectItem value={ProductStatus.ARCHIVED}>Archivado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.uuid} value={category.uuid}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seasonIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temporada</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange([value])}
                        defaultValue={field.value?.[0]}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona temporada" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {seasons.map((season) => (
                            <SelectItem key={season.uuid} value={season.uuid}>
                              {season.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs">
                        Opcional. Asocia el producto a una temporada.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Acciones */}
            <div className="flex flex-col gap-3">
              <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Producto')}
              </Button>
              <Link href="/products" className="w-full">
                <Button type="button" variant="outline" size="lg" className="w-full">
                  Cancelar
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </form>
    </Form>
  )
}